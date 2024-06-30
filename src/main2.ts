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

  getBlock(x: number, y: number) {
    const blockId = `${x}-${y}`;
    return this.blocks.get(blockId);
  }

  updateBlocks() {
    this.blocks.forEach(block => block.update())
  }

  async generate(inputX: number, inputY: number) {
    for (let x = -visibility; x < visibility + 1; x++) {
      for (let y = -visibility; y < visibility + 1; y++) {

        const posX = inputX + x;
        const posY = inputY + y;

        const blockId = `${posX}-${posY}`;

        const block = this.blocks.get(blockId);

        if (!block) {
          const newBlock = new Block({
            id: blockId,
            x: posX * blockSize,
            y: posY * blockSize,
            width: blockSize,
            height: blockSize,
            world: this,
          });

          await newBlock.create();

          this.container.addChild(newBlock.container);

          this.blocks.set(blockId, newBlock);
        }
      }
    }

  }
}

class Radar {
  check(world: World, posX: number, posY: number) {
    const radius = visibility - 2;

    for (let x = posX - radius; x < posX + radius; x++) {
      for (let y = posY - radius; y < posY + radius; y++) {

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

  updatePosition(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.graphics.x = x;
    this.graphics.y = y;
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


let currentPosX = 0;
let currentPosY = 0;

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

  const world = new World();

  const user = new User(worldOrigin.x, worldOrigin.y);

  await user.create();

  // world.container.addChild(user.graphics);

  user.graphics.zIndex = 10000;

  app.stage.addChild(world.container, user.graphics);

  app.stage.x = worldOrigin.x;
  app.stage.y = worldOrigin.y;

  let nextX = currentPosX;
  let nextY = currentPosY;

  window.document.addEventListener('keydown', (evt) => {
    const { key } = evt;

    if (key === 'ArrowRight') {
      nextX += 1;
    }

    if (key === 'ArrowLeft') {
      nextX -= 1;
    }

    if (key === 'ArrowUp') {
      nextY -= 1;
    }

    if (key === 'ArrowDown') {
      nextY += 1;
    }

    evt.preventDefault();
  })

  await world.generate(currentPosX, currentPosY);

  user.radar.check(world, currentPosX, currentPosY);

  // World generation
  app.ticker.add(async (time) => {
    if (currentPosX !== nextX || currentPosY !== nextY) {
      currentPosX = nextX;
      currentPosY = nextY;

      user.updatePosition(
        currentPosX * blockSize,
        currentPosY * blockSize
      );

      await world.generate(currentPosX, currentPosY);

      user.radar.check(world, currentPosX, currentPosY);

      // Update "camera"
      // world.container.x = worldOrigin.x;
      // world.container.y = worldOrigin.y;
    }
  })


  app.ticker.add(async (time) => {

    world.updateBlocks();

    const b = world.getBlock(currentPosX, currentPosY);

    if (b) {
      b.graphics.alpha = 100;
    }

    if (b?.mine) {
      b.exposed = true;
      console.log('Game over');
    }

  });

})()