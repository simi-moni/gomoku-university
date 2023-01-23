import { Graphics } from "pixi.js";
import Scene from "./Scene";
import gsap from "gsap";
import GomokuBoard from "../components/GomokuBoard";
import Game from "../Game";
import PlayerTurn from "../components/PlayerTurn";
import { MCTS, Node } from "../algorithm/MCTS";
import { MCEvaluator } from "../algorithm/Eval";
import { State } from "../algorithm/State";
import { BOARD_SIZE, TEXT_COLOR, PLAYER_BLACK, PLAYER_WHITE, BLACK_STONE, WHITE_STONE } from "../consts";
import BaseComponents from "../components/BaseComponents";
import { checkWin } from "../algorithm/CheckWin";

function clearStateBoard() {
  return Array(BOARD_SIZE)
    .fill()
    .map(() => Array(BOARD_SIZE).fill(0));
}
const players = {
  1: BLACK_STONE,
  [-1]: WHITE_STONE,
};

const playerMap = {
  'black': PLAYER_BLACK,
  'white': PLAYER_WHITE
};

export default class Play extends Scene {
  constructor(choosedColor) {
    super();

    this.playerColor = choosedColor;
    this.algorithmColor = -playerMap[this.playerColor];

    this._mcts = new MCTS({
      evaluator: MCEvaluator(),
      maxIteration: 3200 * 2,
      useNoise: false, // false
    });
    this._state = new State({ boardSize: BOARD_SIZE });
    this._root = Node(null);
    this.stateBoard = clearStateBoard();
  }

  async _checkWinner(color, lastMove) {
    if (checkWin(color, [lastMove.x, lastMove.y], this.stateBoard)) {
      await gsap.delayedCall(2, () => { });

      this.board.clearBoard();
      this.stateBoard = clearStateBoard();

      this.emit(Game.events.WIN, {
        winner: players[color] === this.playerColor,
      });
    }
  }

  _doPlayerMove(algorithmMove) {
    const alg = this.getChildByName('algorithm_turn');
    alg.togglePlayer(false);

    const pl = this.getChildByName('player_turn');
    pl.togglePlayer(true);

    if (algorithmMove) {
      let root = this._root;
      if (!root.children) root = Node(algorithmMove);
      else if (root.children.length === 0)
        throw new Error("try to make move on terminal node");
      else root = root.children.find((c) => c.a === algorithmMove);
      this._root = root;
    }

    this.board.on("pointerdown", (event) => {
      let gridPosition = this.board.getGridPosition(
        event.data.getLocalPosition(this.board).x,
        event.data.getLocalPosition(this.board).y
      );
      if (this.board.isPlaced(gridPosition.x, gridPosition.y)) {
        return;
      }
      this.board.placeStone(
        this.playerColor,
        gridPosition.x,
        gridPosition.y
      );

      this.stateBoard[gridPosition.x][gridPosition.y] = playerMap[this.playerColor];

      const move = BOARD_SIZE * gridPosition.y + gridPosition.x;
      this._checkWinner(playerMap[this.playerColor], gridPosition);
      this.board.interactive = false;
      this._state.makeMove(move);
      this._doAlgorithmMove(move);
    });
  }

  _doAlgorithmMove(move) {
    const alg = this.getChildByName('algorithm_turn');
    alg.togglePlayer(true);

    const pl = this.getChildByName('player_turn');
    pl.togglePlayer(false);

    if (move) {
      let root = this._root;
      if (!root.children) root = Node(move);
      else if (root.children.length === 0)
        throw new Error("try to make move on terminal node");
      else root = root.children.find((c) => c.a === move);
      this._root = root;
    }
    this._mcts
      .exec(
        this._root,
        this._state,
        this.stateBoard,
        this.algorithmColor
      )
      .then((result) => {
        const { x, y } = {
          x: result.bestChild.a % BOARD_SIZE,
          y: Math.floor(result.bestChild.a / BOARD_SIZE),
        };
        this.board.placeStone(
          players[this.algorithmColor],
          x,
          y
        );

        this.stateBoard[x][y] = this.algorithmColor;
        this._checkWinner(this.algorithmColor, { x, y })

        this.board.interactive = true;
        this._state.makeMove(result.bestChild.a);
        this._doPlayerMove(result.bestChild.a);
      })
  }

  _createBoard() {
    this.board = new GomokuBoard(55);
    this.board.pivot.set(0.5)
    this.board.buttonMode = true;
    this.board.setTransform(-275, -300);

    const graphics = new Graphics();
    graphics.beginFill(TEXT_COLOR);
    graphics.drawRect(-5, -4, 560, 560);
    graphics.pivot.set(0.5);
    this.board.addChildAt(graphics, 0);
  }

  async onCreated() {
    const base = new BaseComponents();
    this.addChild(base);
    this._createBoard();

    const yourTurn = new PlayerTurn({
      textValue: "Your turn",
      textureName: this.playerColor,
    });
    yourTurn.setTransform(-250, 290);
    yourTurn.name = 'player_turn';

    const algTurn = new PlayerTurn({
      textValue: "Algorithm turn",
      textureName:
        players[
        Object.keys(players).find((key) => players[key] !== this.playerColor)
        ],
    });
    algTurn.name = 'algorithm_turn';
    algTurn.setTransform(30, 290);
    this.addChild(algTurn, yourTurn);
    this.addChild(this.board);

    if (this.playerColor === BLACK_STONE) {
      this.board.interactive = true;
      this._doPlayerMove();
    } else {
      this._doAlgorithmMove();
    }
  }

  /**
   * Hook called by the application when the browser window is resized.
   * Use this to re-arrange the game elements according to the window size
   *
   * @param  {Number} width  Window width
   * @param  {Number} height Window height
   */
  onResize(width, height) {
    // eslint-disable-line no-unused-vars
  }
  get finish() {
    return Promise.resolve();
  }
}
