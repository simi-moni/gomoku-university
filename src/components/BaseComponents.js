import { Container, Sprite, Text } from "pixi.js";
import { TEXT_COLOR } from "../consts";

export default class BaseComponents extends Container {
    /**
     * 
     * @param {string} text 
     */
    constructor(text) {
        super();

        this.name = "baseContainer";

        const playerSprite = this._createSprite('player_sprite');
        playerSprite.x = -window.innerWidth / 2 + playerSprite.width / 2;

        const computerSprite = this._createSprite('algoritm_sprite');
        computerSprite.x = window.innerWidth / 2 - computerSprite.width / 2;

        const table = this._createSprite('board_background');
        table.scale.set(0.15);

        const gomoku = new Text("Gomoku", {
            fontFamily: "Arial",
            fontSize: 48,
            fill: TEXT_COLOR,
            fontWeight: 800,
            align: "center",
        });
        gomoku.position.set(-113, -220);
        this.addChild(gomoku);
    }

    /**
     * Creating base sprite and adding it to the container
     * @param {string} spriteName 
     */
    _createSprite(spriteName) {
        const sprite = Sprite.from(spriteName);
        sprite.anchor.set(0.5);
        this.addChild(sprite);
        return sprite;
    }
}
