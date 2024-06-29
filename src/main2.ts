import { Application, Assets, Container, Graphics, Sprite, Text } from "pixi.js";

import * as waterAsset from './water.png';
import * as mineAsset from './mine.png';
import * as boatAsset from './boat.png';

const blockSize = 32;
const visibleRadius = 3;

interface BlockOptions {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

class Block {
  id: string;

  container = new Container();
  graphics: Sprite;
  rect: unknown;

  mine = Math.floor(Math.random() * 20) === 1

  x = 0;
  y = 0;
  width = 0;
  height = 0;

  constructor(options: BlockOptions) {
    this.id = options.id;
    this.x = options.x;
    this.y = options.y;
    this.width = options.width;
    this.height = options.height;
  };

  async create() {
    const waterTexture = await Assets.load(waterAsset);
    const mineTexture = await Assets.load(mineAsset);

    const graphic = new Sprite({
      texture: this.mine ? mineTexture : waterTexture,
      width: blockSize,
      height: blockSize
    });

    this.container.addChild(graphic);

    graphic.anchor.set(0.5);

    graphic.alpha = 0.25;

    graphic.x = this.x;
    graphic.y = this.y;

    const text = new Text({
      text: 'h',
      x: this.x,
      y: this.y
    });

    text.anchor.set(0.5)

    this.container.addChild(text);

    this.graphics = graphic;
  }

  updatePos(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

}

class World {
  container = new Container();

  blocks = new Map<string, Block>();

  x = 0;
  y = 0;

  constructor(ops: { x: number; y: number }) {
    this.x = ops.x;
    this.y = ops.y;
  }

  getBlock(x: number, y: number) {
    return this.blocks.get(`${x}-${y}`);
  }

  async generate() {
    for (let x = -visibleRadius; x < visibleRadius + 1; x++) {
      for (let y = -visibleRadius; y < visibleRadius + 1; y++) {

        const posX = this.x + x;
        const posY = this.y + y;

        const blockId = `${posX}-${posY}`;

        let block = this.blocks.get(blockId);

        if (!block) {
          block = new Block({
            id: blockId,
            x: posX * blockSize,
            y: posY * blockSize,
            width: blockSize,
            height: blockSize,
          });

          await block.create();

          this.container.addChild(block.container);

          this.blocks.set(blockId, block);
        }

        block.updatePos(posX, posY)
      }

    }

  }
}

class User {
  x: number;
  y: number;
  graphics: Sprite;

  constructor() {
    this.x = 0;
    this.y = 0;
  }

  async create() {
    const boatTexture = await Assets.load(boatAsset);

    const graphic = new Sprite({
      texture: boatTexture,
      width: blockSize,
      height: blockSize
    });

    graphic.anchor.set(0.5);

    graphic.x = this.x;
    graphic.y = this.y;

    this.graphics = graphic;
  }
}

let x = 0;
let y = 0;

(async () => {

  const app = new Application();

  await app.init({
    background: "#000",
    resizeTo: window
  });

  const worldOffset = () => ({
    x: app.screen.width / 2 - (visibleRadius * blockSize / 2) - (x * blockSize),
    y: app.screen.height / 2 - (visibleRadius * blockSize / 2) - (y * blockSize)
  });

  document.body.appendChild(app.canvas);

  const world = new World({
    x,
    y
  });

  world.container.x = worldOffset().x;
  world.container.y = worldOffset().y;

  const user = new User();

  await user.create();

  user.graphics.x = worldOffset().x;
  user.graphics.y = worldOffset().y;

  app.stage.addChild(world.container, user.graphics);

  window.document.addEventListener('keydown', (evt) => {
    const { key } = evt;

    if (key === 'ArrowRight') {
      x += 1;
    }

    if (key === 'ArrowLeft') {
      x -= 1;
    }

    if (key === 'ArrowUp') {
      y -= 1;
    }

    if (key === 'ArrowDown') {
      y += 1;
    }

    evt.preventDefault();
  })

  await world.generate();

  const b = world.getBlock(x, y);

  if (b) {
    b.graphics.alpha = 100;
  }

  // Listen for animate update
  app.ticker.add(async (time) => {

    if (world.x !== x || world.y !== y) {
      world.x = x;
      world.y = y;

      await world.generate();

      // Update "camera"
      world.container.x = worldOffset().x;
      world.container.y = worldOffset().y;

      const b = world.getBlock(x, y);

      if (b) {
        b.graphics.alpha = 100;
      }

      if (b?.mine) {
        console.log('Game over');
      }

    }

  });

})()