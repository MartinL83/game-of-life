import * as PIXI from 'pixi.js';

import Cell from './cell';

const vWidth = 1000;
const vHeight = 1000;
const r = 100;

const app = new PIXI.Application({
    width: vWidth,
    height:vHeight
});

document.body.appendChild(app.view);

const cells = [];


for (let i = 0; i < r; i++) {
    cells.push([]);
    for (let j = 0; j < r; j++) {
        
        const width = vWidth / r;
        const height = vHeight / r;
        const x = i*width;
        const y = j*height;

        const cell = new Cell({ x, y, width, height });

        cells[i].push(cell)

        app.stage.addChild(cell.graphics);
    }
}

const getCell = (cells) => (x: number, y:number): Cell | undefined => {
    const row = cells[x];

    if (!row) {
        return;
    }

    const col = row[y];

    return col;
}

const get = getCell(cells);

// set neighbors for all cells.
for (let i = 0; i < r*r; i++) {

    const x = i - ( Math.floor(i / r) * r );
    const y = Math.floor(i / r);

    const self = get(x,y); 

    const ul = get(x-1, y-1);
    const u = get(x, y-1);
    const ur = get(x+1, y-1);

    const ml = get(x-1, y);
    const mr = get(x+1, y);

    const bl = get(x-1, y+1);
    const b = get(x, y+1);
    const br = get(x+1, y+1);

    const neighbors = [ul,u,ur, ml,mr, bl,b,br];

    self.setNeighbors(neighbors);

}

function step(){
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
const renderer = app.renderer;
const stage = app.stage;

ticker.autoStart = false;
ticker.stop();

step();


function animate(time) {
    ticker.update(time);
    step();
    // renderer.render(stage);
    requestAnimationFrame(animate);
}

animate(performance.now());
