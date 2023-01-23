import { dirichletK, randomPick } from "./Random";

export function Node(a) {
  return {
    a: a,
    parent: 1,
    q: 0,
    wins: 0,
    numUnexpandedMoves: 0,
    // null - unexpanded, [] - terminal node, [...] - intermediate node
    children: null
  };
}

function isLeaf(node) {
  return node.numUnexpandedMoves === 0 || node.children === null || node.children.length === 0;
}

function ucbScore(node, c) {
  return node.q + (c * node.parent) / (node.numUnexpandedMoves + 1);
}

function ucbSelectChild(node) {
  const explorationParameter = 5 * Math.sqrt(node.numUnexpandedMoves);
  let best = node.children[0];
  let bestScore = ucbScore(best, explorationParameter);

  for (let i = 1; i < node.children.length; i++) {
    const child = node.children[i];
    const score = ucbScore(child, explorationParameter);

    if (score > bestScore) {
      best = child;
      bestScore = score;
    }
  }

  return best;
}

function applyPrioProb(root, probs, useNoise) {
  if (!useNoise) {
    for (let i = 0; i < root.children.length; ++i) {
      const child = root.children[i];
      child.parent = probs[child.a];
    }

    return;
  }

  const dir = dirichletK(root.children.length, 0.03);

  for (let i = 0; i < root.children.length; ++i) {
    const child = root.children[i];
    child.parent = dir[i] * 0.25 + 0.75 * probs[child.a];
  }
}

function backprop(path, r) {
  let i = path.length;

  while (i-- > 0) {
    let leaf = path[i];
    leaf.numUnexpandedMoves += 1;
    leaf.wins += r;
    leaf.q = leaf.wins / leaf.numUnexpandedMoves;
    r = -r;
  }
}

function backpropAndRevertVirtualLoss(path, r) {
  let i = path.length;

  while (i-- > 0) {
    let leaf = path[i];
    leaf.wins += r;
    leaf.q = leaf.wins / leaf.numUnexpandedMoves;
    r = -r;
  }
}

function applyVirtualLoss(path) {
  let i = path.length;

  while (i-- > 0) {
    let leaf = path[i];
    leaf.numUnexpandedMoves += 1;
    leaf.q = leaf.wins / leaf.numUnexpandedMoves;
  }
}

export class MCTS {
  constructor({ evaluator, maxIteration, maxTime, useNoise }) {
    if (!maxIteration && !maxTime)
      throw new Error("maxIteration and maxTime cannot be 0 at same time");
    this._eval = evaluator;
    this._maxIteration = maxIteration;
    this._maxTime = maxTime;
    this._batch = new Set();
    this._batchSize = 8;
    this._useNoise = useNoise;
    this._searching = false;
    this._timer = null;
  }

  async exec(root, state, opts) {
    if (this._searching) throw new Error("Another searching is in progress!");
    let { maxIteration, maxTime, tau } = {
      maxIteration: this._maxIteration,
      maxTime: this._maxTime,
      tau: 0.001,
      ...opts
    };
    if (maxIteration === 0 && maxTime === 0)
      throw new Error("maxIteration and maxTime cannot be 0 at same time");

    if (maxTime > 0) {
      this._timer = setTimeout(() => {
        this.stop();
      }, maxTime);
    }

    if (!maxIteration) maxIteration = Number.MAX_SAFE_INTEGER;
    this._searching = true;

    for (let it = 0; it < maxIteration && !this._stop; ++it)
      await this._step(root, state.clone());

    await this._flush();
    this._searching = false;
    this._stop = false;
    clearTimeout(this._timer);

    let probs = getActionProbs(root, tau);

    return {
      bestChild: randomPick(root.children, probs),
      actionProbs: probs.reduce((acc, p, i) => {
        acc[root.children[i].a] = p;
        return acc;
      }, {})
    };
  }

  stop() {
    if (!this._searching) return;
    this._stop = true;
    clearTimeout(this._timer);
  }

  async _step(root, st) {
    const path = [root];
    let leaf = root;

    while (!isLeaf(leaf)) {
      leaf = ucbSelectChild(leaf);
      path.push(leaf);

      st.makeMove(leaf.a);
    }

    const gameover = st.gameover();
    if (gameover) {
      leaf.children = [];
      let score = 0;
      if (gameover.winner === st.currentPlayer) score = 1;
      else if (gameover.draw) score = 0;
      else score = -1;

      return backprop(path, -score);
    } else if (leaf.children === null) {
      let actions = st.legalMoves();
      leaf.children = actions.map((a) => Node(a));
    }

    applyVirtualLoss(path);

    let job = {
      state: st,
      node: leaf,
      path: path
    };

    if (this._batch.add(job).size === this._batchSize) {
      await this._flush();
    }
  }

  async _flush() {
    if (this._batch.size === 0) return;
    const list = Array.from(this._batch.values());
    const vals = await this._eval(list.map((b) => b.state));

    for (let i = 0; i < list.length; i++) {
      const info = list[i];
      const leaf = info.node;

      applyPrioProb(leaf, vals[i].probs, this._useNoise);
      backpropAndRevertVirtualLoss(info.path, -vals[i].value);
    }

    this._batch.clear();
  }
}

function getActionProbs(root, tau) {
  tau = 1 / tau;
  let maxv = root.children.reduce((x, c) => Math.max(x, c.numUnexpandedMoves), 0);
  let sum = 0;
  let probs = root.children.map((child) => {
    const p = Math.pow(child.numUnexpandedMoves / maxv, tau);
    sum += p;
    return p;
  });

  for (let i = 0; i < probs.length; i++) probs[i] /= sum;

  return probs;
}
