import { Container, Sprite, Text } from "pixi.js";
import BaseComponents from "../components/BaseComponents";
import Button from "../components/Button";
import { TEXT_COLOR } from "../consts";
import Game from "../Game";
import Scene from "./Scene";

export default class Play extends Scene {
  constructor({ winner }) {
    super();
    this.conclusion =
      winner === null ? "Draw" : winner ? "You win" : "You lose";
  }

  async onCreated() {
    const base = new BaseComponents();
    this.addChild(base);

    const congratz = new Text(this.conclusion, {
      fontFamily: "Arial",
      fontSize: 38,
      fill: TEXT_COLOR,
      align: "center",
      fontWeight: 'bold'
    });
    congratz.anchor.set(0.5);

    const btn = new Button("Play again");
    this.addChild(btn, congratz);
    btn.on("pointerdown", () => {
      this.emit(Game.events.CHOICE);
    });
    btn.pivot.set(0.5);
    btn.position.set(-150, 155);
  }
}
