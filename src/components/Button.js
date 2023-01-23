import { Container, Graphics, Text } from "pixi.js";
import { TEXT_COLOR } from "../consts";
import { center } from "../core/utils";

export default class Button extends Container {
  /**
   * 
   * @param {string} text 
   */
  constructor(text) {
    super();

    this.name = "button";

    this._createButton();
    this._createText(text);

    this.interactive = true;
    this.buttonMode = true;
  }

  /**
   * Creating the text im the button
   * @param {string} textValue
   * @returns
   */
  _createText(textValue) {
    const text = new Text(textValue, {
      fontFamily: "Arial",
      fontSize: 30,
      fill: TEXT_COLOR,
      fontWeight: 600,
      align: "center",
    });
    text.pivot.set(0.5);
    center(text, { width: this.width, height: this.height });
    this.addChild(text);
  }

  /**
   * Adding graphics button
   */
  _createButton() {
    const graphics = new Graphics();

    graphics.beginFill(0xffff00, 0);
    graphics.lineStyle(5, TEXT_COLOR);
    graphics.drawRect(0, 0, 300, 70);
    graphics.pivot.set(0.5);

    this.addChild(graphics);
  }
}
