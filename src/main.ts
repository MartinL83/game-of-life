import { Application } from 'pixi.js';

import Cell from './cell';

(async () => {

  const vWidth = 1000;
  const vHeight = 1000;
  const r = 100;

  const app = new Application();

  await app.init({
    height: vHeight,
    width: vWidth,
    background: 'red'
  })

  document.body.appendChild(app.canvas);

  const cells: Cell[][] = [];

  for (let i = 0; i < r; i++) {
    cells.push([]);
    for (let j = 0; j < r; j++) {

      const width = vWidth / r;
      const height = vHeight / r;
      const x = i * width;
      const y = j * height;

      const cell = new Cell({ x, y, width, height });

      cells[i].push(cell)

      app.stage.addChild(cell.graphics);
    }
  }

  const getCell = (cells: Cell[][]) => (root: Cell, offsetX: number, offsetY: number): Cell | undefined => {

    const length = cells.length;

    const rootX = root.x;
    const rootY = root.y;
    const desiredX = rootX + offsetX;
    const desiredY = rootY + offsetY;

    const computedX = desiredX < 0 ? length + desiredX : (desiredX > length - 1) ? (length - desiredX) : desiredX;
    const computedY = desiredY < 0 ? length + desiredY : (desiredY > length - 1) ? (length - desiredY) : desiredY;

    const col = cells[computedX];

    if (!col) { return }

    const row = col[computedY];

    return row;
  }

  const getNeighbor = getCell(cells);

  // set neighbors for all cells.
  for (let i = 0; i < r * r; i++) {

    const offset = 1;
    const x = i - (Math.floor(i / r) * r);
    const y = Math.floor(i / r);
    const self = { x, y } as Cell;

    const ul = getNeighbor(self, -offset, -offset);
    const u = getNeighbor(self, 0, -offset);
    const ur = getNeighbor(self, +offset, -offset);

    const ml = getNeighbor(self, -offset, 0);
    const mr = getNeighbor(self, +offset, 0);

    const bl = getNeighbor(self, -offset, +offset);
    const b = getNeighbor(self, 0, +offset);
    const br = getNeighbor(self, +offset, +offset);

    const neighbors = [ul, u, ur, ml, mr, bl, b, br];

    cells[x][y].setNeighbors(neighbors);

  }

  function step() {
    for (let i = 0; i < r; i++) {
      for (let j = 0; j < r; j++) {

        const x = i;
        const y = j;

        const self = cells[x][y];

        self.step();
      }
    }
  }

  const ticker = app.ticker;

  // ticker.autoStart = false;
  // ticker.stop();

  // step();
  // step();

  app.ticker.add((time) => {
    step();
  })

  // async function animate(time) {
  //   ticker.update(time);
  //   step();

  //   requestAnimationFrame(animate);
  // }

  // animate(performance.now());

})()