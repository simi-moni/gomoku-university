import { Container, Sprite } from "pixi.js";
import { BLACK_STONE } from "../consts";

export default class GomokuStone extends Container {

    constructor(stoneColor) {
        super();
        this.stoneColor = stoneColor;

        this.stoneSize = 50;
        this.drawStone();
    }

    drawStone() {
        let stoneTexture = this.stoneColor == BLACK_STONE ? "stone_black" : "stone_white";
        let stoneSprite = Sprite.from(stoneTexture)
        stoneSprite.width = stoneSprite.height = this.stoneSize;
        stoneSprite.anchor.set(0.5, 0.5);

        this.addChild(stoneSprite);
    }
}
