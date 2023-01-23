
export function MCEvaluator() {
    return async function evaluator(states) {
        await new Promise((resolve) => setImmediate(resolve));
        return states.map((state) => {
            const boardSize = 9;
            const acts = state.legalMoves();
            const value = randomPlay(state.clone(), acts);
            const probs = new Array(boardSize * boardSize).fill(0);

            for (let i = 0; i < acts.length; i++) probs[acts[i]] = 1 / acts.length;

            return {
                value,
                probs
            };
        });
    };
}

function randomPlay(state, acts) {
    const player = state.currentPlayer;
    let gameover = state.gameover();

    for (let i = 0; i < acts.length && !gameover; i++) {
        const j = i + Math.floor(Math.random() * (acts.length - i));
        const x = acts[j];
        acts[j] = acts[i];
        acts[i] = x;

        gameover = state.makeMove(x).gameover();
    }

    if (player === gameover.winner) return 1;
    else if (gameover.draw) return 0;
    return -1;
}
