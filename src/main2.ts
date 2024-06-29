import { Application, Assets, Container, Graphics, Sprite, Text } from "pixi.js";

import * as waterAsset from './water.png';
import * as mineAsset from './mine.png';


interface BlockOptions {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

class Block {
  id: string;

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
      width: 64,
      height: 64
    });

    graphic.anchor.set(0.5);

    graphic.x = this.x;
    graphic.y = this.y;

    this.graphics = graphic;
  }

  hide() {
    this.graphics.visible = false;
  }

  updatePos(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  show() {
    this.graphics.visible = true;
  }

  destroy() {
    this.graphics.destroy()
  }

}

const blockSize = 64;

class World {
  container = new Container();

  blocks = new Map<string, Block>();

  visibleRadius = 3;

  x = 0;
  y = 0;

  constructor(ops: { x: number; y: number }) {
    this.x = ops.x;
    this.y = ops.y;
  }

  async generate() {

    for (let x = 0; x < this.visibleRadius; x++) {
      for (let y = 0; y < this.visibleRadius; y++) {

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

          this.container.addChild(block.graphics);

          this.blocks.set(blockId, block);
        }

        block.updatePos(posX, posY)
      }

    }

  }
}

(async () => {

  const app = new Application();

  await app.init({
    background: "#ddd",
    resizeTo: window
  });

  let x = 0;
  let y = 0;

  const world = new World({
    x,
    y
  });

  world.container.x = app.screen.width / 2 - (world.visibleRadius * blockSize / 2) - x;
  world.container.y = app.screen.height / 2 - (world.visibleRadius * blockSize / 2) - y;

  document.body.appendChild(app.canvas);

  app.stage.addChild(world.container);

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

  // Listen for animate update
  app.ticker.add(async (time) => {

    if (world.x !== x || world.y !== y) {
      world.x = x;
      world.y = y;

      await world.generate();

      world.container.x = app.screen.width / 2 - (world.visibleRadius * blockSize / 2) - (x * blockSize);
      world.container.y = app.screen.height / 2 - (world.visibleRadius * blockSize / 2) - (y * blockSize);

    }

  });

})()