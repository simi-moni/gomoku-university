import { Application, Container, Graphics, Sprite, Text } from "pixi.js";
import BaseComponents from "../components/BaseComponents";
import Button from "../components/Button";
import { BLACK_STONE, TEXT_COLOR, WHITE_STONE } from "../consts";
import Game from "../Game";
import Scene from "./Scene";

export default class IntroScene extends Scene {
  async onCreated() {
    const base = new BaseComponents();
    this.addChild(base);

    const containerPick = new Container();
    containerPick.pivot.set(0.5);

    const chooseText = new Text("Choose a color", {
      fontFamily: "Arial",
      fontSize: 38,
      fill: TEXT_COLOR,
      fontWeight: 800,
      align: "center",
    });
    chooseText.pivot.set(0.5);
    chooseText.position.set(-230, -100)

    const black = Sprite.from("stone_black");
    black.interactive = true;
    black.buttonMode = true;
    black.setTransform(-150, 0, 0.8, 0.8);
    black.anchor.set(0.5);
    black.on("pointerdown", () => {
      this.emit(Game.events.PLAY, BLACK_STONE);
    });

    const gomoku = new Text("Gomoku", {
      fontFamily: "Arial",
      fontSize: 48,
      fill: TEXT_COLOR,
      fontWeight: 800,
      align: "center",
    });
    gomoku.position.set(-113, -220);


    const blackText = new Text("Black", {
      fontFamily: "Arial",
      fontSize: 30,
      fill: TEXT_COLOR,
      fontWeight: 800,
      align: "center",
    });
    blackText.anchor.set(0.5, 1);
    blackText.position.set(black.position.x, black.position.y + black.height);

    const whiteText = new Text("White", {
      fontFamily: "Arial",
      fontSize: 30,
      fill: TEXT_COLOR,
      fontWeight: 800,
      align: "center",
    });

    const white = Sprite.from("stone_white");
    white.setTransform(0, 0, 0.8, 0.8);
    white.anchor.set(0.5);
    white.interactive = true;
    white.buttonMode = true;
    white.on("pointerdown", () => {
      this.emit(Game.events.PLAY, WHITE_STONE);
    });
    whiteText.anchor.set(0.5, 1);
    whiteText.position.set(white.position.x, white.position.y + white.height);
    containerPick.addChild(chooseText, black, blackText, whiteText, white);

    const randomColor = new Button("Random Color");
    randomColor.on("pointerdown", () => {
      const randomColor = Math.random() > 0.45 ? WHITE_STONE : BLACK_STONE;
      this.emit(Game.events.PLAY, randomColor);
    });

    randomColor.position.set(-150, 155);

    this.addChild(containerPick, randomColor);
    this.addChild(gomoku);
    containerPick.position.set(76, 5);
  }
}
