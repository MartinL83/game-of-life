import { Application, Assets, Container, Graphics, Sprite, Text } from "pixi.js";

interface BlockOptions {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

class Block {
  id: string;
  graphics = new Graphics();
  text = new Text({
    style: {
      fontSize: 12,
      align: 'center'
    }
  });

  mine = Math.floor(Math.random() * 20) === 1

  x = 0;
  y = 0;
  width = 0;
  height = 0;
  active = false;

  constructor(options: BlockOptions) {
    this.id = options.id;
    this.x = options.x;
    this.y = options.y;
    this.width = options.width;
    this.height = options.height;

    this.graphics.interactive = true;

    // this.graphics.on('pointerover', (args) => {
    //   console.log(args)
    // });

    // this.graphics.on('pointerout', (args) => {
    //   console.log(args)
    // });

    this.draw();

  };

  draw() {
    this.text.text = this.id;

    this.text.x = this.x;
    this.text.y = this.y;

    this.graphics.fill(this.mine ? "red" : "green");
    this.graphics.rect(this.x, this.y, this.width, this.height);
    this.graphics.addChild(this.text);
  }

}

class World {
  blockSize = 64;
  container = new Container();

  blocks = new Map<string, Block>();

  visibleRadius = 10;

  x = 0;
  y = 0;

  constructor(ops) {
    this.x = ops.x;
    this.y = ops.y;
  }

  generate() {
    for (let x = 0; x < this.visibleRadius; x++) {
      for (let y = 0; y < this.visibleRadius; y++) {

        const posX = this.x + x;
        const posY = this.y + y;

        const blockId = `${posX}-${posY}`;

        let block = this.blocks.get(blockId);

        if (!block) {
          block = new Block({
            id: blockId,
            x: 0,
            y: 0,
            width: this.blockSize,
            height: this.blockSize,
          });

          this.blocks.set(blockId, block)
        }

        block.x = x * this.blockSize;
        block.y = y * this.blockSize;

        this.container.addChild(block.graphics);

        block.draw();


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

  world.container.x = app.screen.width / 2 - (world.visibleRadius * world.blockSize / 2) - x;
  world.container.y = app.screen.height / 2 - (world.visibleRadius * world.blockSize / 2) - y;

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

  world.generate();

  // Listen for animate update
  app.ticker.add((time) => {

    if (world.x !== x || world.y !== y) {
      world.x = x;
      world.y = y;

      world.generate();
    }

  });

})()