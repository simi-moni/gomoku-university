import { PLAYER_BLACK } from "../consts";

function checkWinnerByLine(stones, clr, start, end, stride) {
    let cnt = 0;

    for (; cnt < 5 && start !== end; start += stride) {
        if (stones[start] === clr) cnt++;
        else cnt = 0;
    }

    return cnt >= 5;
}

export function checkWinnerByMove(boardSize, stones, move) {
    const _min = 4;
    const c = stones[move];
    if (c === 0) return 0;
    let x0 = move % boardSize;
    let y0 = Math.floor(move / boardSize);
    let x1 = boardSize - 1 - x0;
    let y1 = boardSize - 1 - y0;
    let start = 0,
        end = 0,
        stride = 1;
    x0 = Math.min(x0, _min);
    x1 = Math.min(x1, _min);
    start = move - x0;
    end = move + x1 + 1;
    if (checkWinnerByLine(stones, c, start, end, 1)) return c;

    stride = boardSize;
    y0 = Math.min(y0, _min);
    y1 = Math.min(y1, _min);
    start = move - y0 * stride;
    end = move + (y1 + 1) * stride;
    if (checkWinnerByLine(stones, c, start, end, stride)) return c;

    stride = boardSize + 1;
    let ma = Math.min(x0, y0),
        mb = Math.min(x1, y1);
    start = move - ma * stride;
    end = move + (mb + 1) * stride;
    if (checkWinnerByLine(stones, c, start, end, stride)) return c;

    stride = boardSize - 1;
    ma = Math.min(x1, y0);
    mb = Math.min(x0, y1);
    start = move - ma * stride;
    end = move + (mb + 1) * stride;
    if (checkWinnerByLine(stones, c, start, end, stride)) return c;

    return 0;
}

export class State {
    constructor({ boardSize }) {
        this.boardSize = boardSize;
        this.stones = new Array(boardSize * boardSize).fill(0);
        this.currentPlayer = PLAYER_BLACK;
        this.moveHistory = [];
        this._gameover = null;
    }

    update(state, currentPlayer) {
        const currentBoard = state.flat();
        this.stones = currentBoard;
        this.currentPlayer = currentPlayer;
    }

    clone() {
        let newObj = new State({
            boardSize: this.boardSize
        });
        newObj.copy(this);
        return newObj;
    }

    copy(src) {
        if (src.boardSize !== this.boardSize)
            throw new Error("incompatible board");

        for (let i = 0; i < src.stones.length; i++) {
            this.stones[i] = src.stones[i];
        }

        this.currentPlayer = src.currentPlayer;

        for (let i = 0; i < src.moveHistory.length; i++) {
            this.moveHistory[i] = src.moveHistory[i];
        }

        this.moveHistory.length = src.moveHistory.length;
        this._gameover = src._gameover;
    }

    makeMove(mov) {
        if (this._gameover) return this;
        this.stones[mov] = this.currentPlayer;
        this.moveHistory.push(mov);
        this.currentPlayer = -this.currentPlayer;
        return this;
    }

    legalMoves() {
        let moves = [];
        for (let i = 0; i < this.stones.length; i++) {
            if (this.stones[i] === 0) moves.push(i);
        }
        return moves;
    }

    gameover() {
        if (this._gameover || this.moveHistory.length === 0) {

            return this._gameover;
        }
        const mov = this.moveHistory[this.moveHistory.length - 1];
        const winner = checkWinnerByMove(this.boardSize, this.stones, mov);
        if (winner !== 0) {
            this._gameover = { winner };
        } else if (this.moveHistory.length === this.stones.length) {
            this._gameover = { draw: true };
        }
        return this._gameover;
    }
}
