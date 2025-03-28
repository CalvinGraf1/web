import {cellPixelSize, shapeColors} from "./constants.js";
import { Game } from "./game.js";
import { Shape } from "./shape.js";
import { GameMap } from "./gameMap.js";

function cellToPixel(x) {
    return x * cellPixelSize;
}

export class Renderer {
    constructor(game, context) {
        this.game = game;
        this.context = context;
    }

    /**
     * Clears the context and draws all falling and dropped shapes.
     */
    render() {
        /*
        TODO:
        - Reset context
        - Draw all falling shapes
        - Draw all blocks stored in the game map, i.e. the dropped/grounded shapes.

        You may benefit from splitting this method into smaller ones.
        */

        // Un doute sur laquelle des deux méthodes il faut utiliser
        //this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.reset();

        this.game.forEachShape((shape) => {
            const coordinates = shape.getCoordinates();

            coordinates.forEach(([x, y]) => {
                cellToPixel(shape.col + y)
                this.context.fillStyle = shapeColors[shape.playerId];
                this.context.fillRect(cellToPixel(shape.col + y), cellToPixel(shape.row + x), cellPixelSize, cellPixelSize);
            });
        })

        for(let i = 0; i < this.game.map.width; i++){
            for(let j = 0; j < this.game.map.height; j++){
                if(this.game.map.map[j][i] !== -1){
                    this.context.fillStyle = shapeColors[0];
                    this.context.fillRect(cellToPixel(i), cellToPixel(j), cellPixelSize, cellPixelSize);
                }
            }
        }
    }
}