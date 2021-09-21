import * as PIXI from 'pixi.js';

interface Cell {
    x: number,
    y: number,
    width: number,
    height:number,
}

class Cell implements Cell {

    graphics = new PIXI.Graphics();
    x = 0;
    y = 0;
    width = 0;
    height = 0;
    active = Math.floor(Math.random() * 20) === 1;
    neighbors: Cell[] = [];
    
    constructor(options){

        this.x = options.x;
        this.y = options.y;
        this.width = options.width;
        this.height = options.height;
        
        this.graphics.interactive = true;
        // this.graphics.buttonMode = true;

        this.graphics.on('pointerover', () => {
            this.neighbors.map(cell => {
                cell.active = true;
                cell.draw();
            })
        });

        this.graphics.on('pointerout', () => {
            this.neighbors.map(cell => {
                cell.active = false;
                cell.draw();
            })
        });

        this.draw();

    };

    draw(){
        this.graphics.clear();
        this.graphics.beginFill(this.active ? 0xFFFFFF : 0x000000);
        this.graphics.drawRect(this.x, this.y, this.width, this.height);

        this.graphics.endFill();        
    }

    setNeighbors(cells: Cell[]){
        this.neighbors = cells;
    }

    step(){

        let activeNeighbors = 0;

        for (let i = 0; i < this.neighbors.length; i++) {
            const cell = this.neighbors[i];

            if (activeNeighbors > 4) {
                break;
            }

            if (cell && cell.active){
                activeNeighbors+=1;
            }
        }

        const nextState = () => {
            if (this.active) {
    
                if (activeNeighbors === 2 || activeNeighbors === 3 ) {
                    return true;
                }

                return false;
    
            }
    
            if (this.active === false && activeNeighbors === 3) {
                return true;
            }

            return false;

        };

        const next = nextState();

        if (this.active !== next) {
            this.active = nextState();
            this.draw();
        }

        
    }

}

export default Cell;