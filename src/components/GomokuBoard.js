import { Container, Graphics, TilingSprite } from "pixi.js";
import { BLACK_STONE, PLAYER_BLACK, PLAYER_WHITE } from "../consts";
import GomokuStone from "./GomokuStone";

export default class GomokuBoard extends Container {
    constructor(gridSize, boardSize = 9) {
        super();

        this.gridSize = gridSize;

        this.boardSize = boardSize;

        this.flowerDotSize = 8;

        this.gridColor = 0x000000;

        this.graphics = new Container();

        this.placedStones = [];
        this.placement = [];
        for (let i = 0; i < boardSize * boardSize; i++) {
            this.placedStones.push(null);
            this.placement.push(0);
        }

        this.drawBoardTexture();
        this.drawBoardGridLines();
        this.addChild(this.graphics)
    }

    placeStone(stoneColor, x, y) {
        if (this.placedStones[x + this.boardSize * y] == null) {
            let stone = new GomokuStone(stoneColor);
            stone.x = this.gridSize * (x + 1);
            stone.y = this.gridSize * (y + 1);
            this.graphics.addChild(stone);

            this.placement[x + this.boardSize * y] = (stoneColor == BLACK_STONE) ? PLAYER_BLACK : PLAYER_WHITE;
            this.placedStones[x + this.boardSize * y] = stone;
        }
    }

    isPlaced(x, y) {
        return this.placedStones[x + this.boardSize * y] != null;
    }

    getGridPosition(x, y, offsetX = 0, offsetY = 0) {
        let gridX = Math.round((x - this.gridSize) / this.gridSize);//375
        let gridY = Math.round((y - this.gridSize) / this.gridSize);

        let isOut = n => n < 0 || n >= this.boardSize;
        let checkBoundary = n => n < 0 ? 0 : (n >= this.boardSize ? this.boardSize - 1 : n);

        let out = isOut(gridX) || isOut(gridY);
        gridX = checkBoundary(gridX);
        gridY = checkBoundary(gridY);

        return {
            x: gridX,
            y: gridY,
            out: out
        };
    }

    clearBoard() {

        for (let i = this.graphics.children.length - 1; i >= 2; i--) {
            this.graphics.removeChild(this.graphics.children[i]);
        }
    }

    drawBoardTexture() {
        var boardSpriteSize = (this.boardSize + 1) * this.gridSize
        var boardSprite = new TilingSprite(PIXI.Texture.from('board_texture'), boardSpriteSize, boardSpriteSize);
        this.graphics.addChild(boardSprite);
    }

    drawBoardGridLines() {
        var gridLines = new Graphics;
        gridLines.lineStyle(1, this.gridColor, 1);

        for (var y = 0; y < this.boardSize; y++) {
            gridLines.moveTo(this.gridSize, (y + 1) * this.gridSize);
            gridLines.lineTo(this.gridSize * this.boardSize, (y + 1) * this.gridSize);
        }

        for (var x = 0; x < this.boardSize; x++) {
            gridLines.moveTo((x + 1) * this.gridSize, this.gridSize);
            gridLines.lineTo((x + 1) * this.gridSize, this.gridSize * this.boardSize);
        }

        let centrify = n => ((n) * Math.floor(this.boardSize / 3) + Math.ceil(this.boardSize / 6)) * this.gridSize;
        for (var i = 0; i < 9; i++) {
            var flowerDot = new Graphics();
            flowerDot.beginFill(this.gridColor);
            flowerDot.drawCircle(0, 0, this.flowerDotSize);
            flowerDot.endFill();
            flowerDot.x = centrify(i % 3);
            flowerDot.y = centrify(Math.floor(i / 3));
            gridLines.addChild(flowerDot);
        }

        this.graphics.addChild(gridLines);
    }
}