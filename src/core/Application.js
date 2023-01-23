import { Sprite, Application, TilingSprite } from 'pixi.js';
import config from '../config';
import Game from '../Game';
import { Viewport } from 'pixi-viewport';
import { center } from './utils';
import Assets from './AssetManager';

/**
 * Game entry point. Holds the game's viewport and responsive background
 * All configurations are described in src/config.js
 */
export default class GameApplication extends Application {
  constructor() {
    super(config.view);

    this.config = config;
    Assets.renderer = this.renderer;

    this.setupViewport();
    this.initGame();
  }

  /**
   * Game main entry point. Loads and prerenders assets.
   * Creates the main game container.
   *
   */
  async initGame() {
    await this.createBackground();

    this.game = new Game();
    this.viewport.addChild(this.game);

    center(this.viewport, this.config.view);
    this.onResize();

    this.game.start();
  }

  /**
     * Initialize the game world viewport.
     * Supports handly functions like dragging and panning on the main game stage
     *
     * @return {PIXI.Application}
     */
  setupViewport() {
    const viewport = new Viewport({
      screenWidth: this.config.view.width,
      screenHeight: this.config.view.height,
      worldWidth: this.config.game.width,
      worldHeight: this.config.game.height,
      // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
      interaction: this.renderer.plugins.interaction,
    });

    this.renderer.runners.resize.add({
      resize: this.onResize.bind(this),
    });
    document.body.appendChild(this.view);

    this.stage.addChild(viewport);

    if (this.config.game.drag) viewport.drag();
    if (this.config.game.pinch) viewport.pinch();
    // if (this.config.game.wheel) viewport.wheel();
    if (this.config.game.decelerate) viewport.decelerate();

    this.viewport = viewport;
  }

  /**
     * Called after the browser window has been resized.
     * Implement game specific resize logic here
     * @param  {PIXI.Application} app The PIXI Appliaction instance
     * @param  {Number} width         The updated viewport width
     * @param  {Number} height        The updated viewport width
     */
  onResize(width = this.config.view.width, height = this.config.view.height) {
    center(this.background, { width, height });
    this.game.onResize(width, height);

    if (this.config.view.centerOnResize) {
      this.viewport.x = width / 2;
      this.viewport.y = height / 2;
    }
  }

  /**
   * Initializes the static background that is used to
   * fill the empty space around our game stage. This is used to compensate for the different browser window sizes.
   *
   */
  async createBackground() {
    const images = { background: Assets.images.background, hand_sprite: Assets.images.hand_sprite };

    await Assets.load({ images });
    await Assets.prepareImages(images);

    const sprite = new TilingSprite(PIXI.Texture.from('background'), this.config.view.width, this.config.view.height);
    sprite.tileScale.set(0.4)

    this.stage.addChildAt(sprite);
    this.background = sprite;

    const hand = new Sprite.from('hand_sprite');
    hand.anchor.set(0.97, 0.43);
    this.stage.addChild(hand);
    hand.position.set(this.screen.width / 2, this.screen.height / 2);

    this.stage.interactive = true;

    this.stage.hitArea = this.screen;

    this.stage.addListener('pointermove', (e) => {
      hand.position.copyFrom(e.data.global);
    });
  }

  
}

