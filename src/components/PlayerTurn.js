import { Container, Sprite, Text } from "pixi.js";
import { TEXT_COLOR } from "../consts";

export default class PlayerTurn extends Container {
  /**
   *
   * @param {string} textValue
   *  @param {string} textureName
   */
  constructor({ textValue, textureName }) {
    super();

    this.name = "player_turn";
    this.pivot.set(0.5);

    this.stoneSprite = this._createStoneSprite(textureName);
    this.text = this._createText(textValue);
    this.dot = this._createDot();
  }

  /**
   *  Creating the dot as text
   */
  _createDot() {
    const dot = new Text('.', {
      fontFamily: "Arial",
      fontSize: 150,
      fontWeight: 'bold',
      fill: TEXT_COLOR,
      align: "center",
    });
    dot.anchor.set(0, 0.5);
    dot.y = -42;
    dot.x = this.text.width + this.text.x;

    return dot;
  }

  /**
   * Creating the text of the component
   * @param {string} textValue
   */
  _createText(textValue) {
    const text = new Text(textValue, {
      fontFamily: "Arial",
      fontSize: 28,
      fontWeight: 'bold',
      fill: TEXT_COLOR,
      align: "center",
    });
    text.anchor.set(0, 0.5);
    text.x = 40;
    this.addChild(text);

    return text;
  }

  /**
   * Creating the stone of the component
   * @param {string} texture
   */
  _createStoneSprite(texture) {
    const stone = new Sprite.from(`stone_${texture}`);
    stone.scale.set(0.4);
    stone.anchor.set(0.5);

    this.addChild(stone);

    return stone;
  }

  /**
   * Used to toggle the active player dot
   * @param {boolean} removeDot
   */
  togglePlayer(add) {
    add ? this.addChild(this.dot) : this.removeChild(this.dot);
  }
}
