import { Application, Assets, Container, Graphics, Sprite, Text } from "pixi.js";

import * as waterAsset from './water.png';
import * as mineAsset from './mine.png';
import * as boatAsset from './boat.png';

const blockSize = 32;
const visibility = 5;


interface BlockOptions {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  world: World;
}

class Block {
  id: string;

  world: World;

  container = new Container();
  graphics: Sprite;

  textNode = new Text();

  mine = Math.floor(Math.random() * 5) === 1;
  exposed = false;

  x = 0;
  y = 0;
  width = 0;
  height = 0;

  neighbors = new Map<string, Block>();

  constructor(options: BlockOptions) {
    this.id = options.id;
    this.x = options.x;
    this.y = options.y;
    this.width = options.width;
    this.height = options.height;
    this.world = options.world;
  };

  async create() {
    const waterTexture = await Assets.load(waterAsset);

    const graphic = new Sprite({
      texture: waterTexture,
      width: blockSize,
      height: blockSize
    });

    this.container.addChild(graphic);

    graphic.anchor.set(0.5);

    graphic.alpha = 0.5;

    graphic.x = this.x;
    graphic.y = this.y;

    this.textNode = new Text({
      x: this.x,
      y: this.y,
      anchor: 0.5
    });

    this.container.addChild(this.textNode);

    this.graphics = graphic;
  }

  async update() {
    if (this.exposed && this.mine) {
      const mineTexture = await Assets.load(mineAsset);
      this.graphics.texture = mineTexture;
    }
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

  updateBlocks() {
    this.blocks.forEach(block => block.update())
  }

  async generate() {
    for (let x = -visibility; x < visibility + 1; x++) {
      for (let y = -visibility; y < visibility + 1; y++) {

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
            world: this,
          });

          await block.create();

          this.container.addChild(block.container);

          this.blocks.set(blockId, block);

        }
      }
    }

  }
}

class Radar {
  check(world: World) {
    const radius = visibility - 2;

    const worldX = world.x;
    const worldY = world.y;

    for (let x = worldX - radius; x < worldX + radius; x++) {
      for (let y = worldY - radius; y < worldY + radius; y++) {

        let count = 0;

        for (let ix = x - 1; ix < x + 1; ix++) {
          for (let iy = y - 1; iy < y + 1; iy++) {

            const b = world.getBlock(ix, iy);

            if (b?.mine) {
              count += 1;
            }

          }
        }

        const ob = world.getBlock(x, y);

        if (ob) {
          ob.textNode.text = count ? count : '';
        }

      }
    }



  }
}


class User {
  x: number;
  y: number;
  graphics: Sprite;

  radar: Radar;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;

    this.radar = new Radar();
  }

  async create() {
    const boatTexture = await Assets.load(boatAsset);

    const graphic = new Sprite({
      texture: boatTexture,
      width: blockSize,
      height: blockSize
    });

    // graphic.anchor.set(0.5);

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

  const worldOrigin = {
    x: app.screen.width / 2,
    y: app.screen.height / 2
  };

  document.body.appendChild(app.canvas);

  const world = new World({
    x,
    y
  });

  const user = new User(worldOrigin.x, worldOrigin.y);
  await user.create();

  world.container.addChild(user.graphics);

  world.container.x = worldOrigin.x;
  world.container.y = worldOrigin.y;

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

  user.radar.check(world);

  // World generation
  app.ticker.add(async (time) => {
    if (world.x !== x || world.y !== y) {
      world.x = x;
      world.y = y;

      await world.generate();

      user.radar.check(world);

      // Update "camera"
      // world.container.x = x;
      // world.container.y = y;
    }
  })


  app.ticker.add(async (time) => {

    world.updateBlocks();

    const b = world.getBlock(x, y);

    if (b) {
      b.graphics.alpha = 100;
    }

    if (b?.mine) {
      b.exposed = true;
      console.log('Game over');
    }

  });

})()