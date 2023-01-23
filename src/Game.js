import Splash from "./scenes/Splash";
import Play from "./scenes/Play";
import { Container } from "pixi.js";
import WinScene from "./scenes/WinScene";
import IntroScene from "./scenes/IntroScene";

/**
 * Main game stage, manages scenes/levels.
 *
 * @extends {PIXI.Container}
 */
export default class Game extends Container {
  static get events() {
    return {
      SWITCH_SCENE: "switch_scene",
      PLAY: "play",
      WIN: "win",
      CHOICE: "choice",
    };
  }

  constructor() {
    super();

    this.currentScene = null;
  }

  async start() {
    this._addListeners();
    await this.switchScene(Splash);
    await this.currentScene.finish;

    this.switchScene(IntroScene);
  }

  switchScene(constructor, scene, data = {}) {
    this.removeChild(this.currentScene);
    this.currentScene = new constructor(data);
    this.currentScene.background = this._background;
    this.addChild(this.currentScene);

    this.emit(Game.events.SWITCH_SCENE, { scene });

    return this.currentScene.onCreated();
  }
  _addListeners() {
    this.on(Game.events.SWITCH_SCENE, () => {

      this.currentScene.on(Game.events.CHOICE, async () => {
        await this.switchScene(IntroScene, { scene: "intro" });
      });
      this.currentScene.on(Game.events.PLAY, async (data) => {
        await this.switchScene(Play, { scene: "play" }, data);
      });
      this.currentScene.once(Game.events.WIN, async (data) => {
        await this.switchScene(WinScene, { scene: "winScene" }, data);
      });
    });
  }

  /**
   * Hook called by the application when the browser window is resized.
   * Use this to re-arrange the game elements according to the window size
   *
   * @param  {Number} width  Window width
   * @param  {Number} height Window height
   */
  onResize(width, height) {
    if (this.currentScene === null) return;

    this.currentScene.onResize(width, height);
  }
}
