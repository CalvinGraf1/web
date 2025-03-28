import {shapeTypes} from "./constants.js";

export class GameMap {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        /** 2D array storing for each position the id of the player whose block is there, or -1 otherwise. */
        this.map = [];
        // TODO: initialize the map to all -1.
        this.map = new Array(height).fill(-1).map(() => new Array(width).fill(-1));
    }

    /**
     * Drops the given shape, i.e. moves it down until it touches something, and then grounds it.
     * @param {Shape} shape The shape to be dropped.
     */
    dropShape(shape) {
        // TODO
        while(this.testShape(shape, shape.row + 1)) shape.row++;
        this.groundShape(shape);
    }

    /**
     * Grounds the given shape, i.e. transfers it to the map table.
     * @param {Shape} shape The shape to be grounded.
     */
    groundShape(shape) {
        const coordinates = shape.getCoordinates();
        coordinates.forEach(([x, y]) => {
            const newRow = shape.row + y;
            const newCol = shape.col + x;
            this.map[newRow][newCol] = shape.playerId;
        });
    }

    /**
     * Tests whether the given shape is overlapping a block or is out of bounds on the left, right, or bottom of the map.
     * This method allows the test to be done with row, col and/or rotation that are different from those of the shape itself.
     *
     * Note that we do not consider a shape to be out of bounds if it is (even partly) above the top of the map.
     *
     * @param {Shape} shape The shape to be tested
     * @param {Number} row Optional row at which the shape should be tested. If omitted, uses that of the shape.
     * @param {Number} col Optional col at which the shape should be tested. If omitted, uses that of the shape.
     * @param {Number} rotation Optional rotation with which the shape should be tested. If omitted, uses that of the shape.
     * @returns true if and only if the shape does not overlap anything and is not out of bounds.
     */
    testShape(shape, row = shape.row, col = shape.col, rotation = shape.rotation) {
        // TODO

        const coordinates = shape.getCoordinates(rotation);

        for(let [x, y] of coordinates) {
            const newRow = row + y;
            const newCol = col + x;

            if(newRow >= this.height ||
                newRow < 0 ||
                newCol >= this.width ||
                newCol < 0) return false;
            if(this.map[newRow][newCol] !== -1) return false;
        }

        return true;
    }

    /**
     * Clears any row that is fully complete.
     */
    clearFullRows() {
        // TODO
        for (let row = 0; row < this.height; ++row) {
            let deleteRow = true;
            for(let col = 0; col < this.width; ++col) {
                if(this.map[row][col] === -1) {
                    deleteRow = false;
                    break;
                }
            }
            if(deleteRow) this.clearRow(row);
        }
    }

    /**
     * Clears the given row, and moves any row above it down by one.
     * @param {Number} row The row to be cleared.
     */
    clearRow(row) {
        // TODO
        for(let i = 0; i < this.width; ++i) this.map[row][i] = -1;

        for(let i = row; i > 0; --i) {
            for(let j = 0; j < this.width; ++j) {
                this.map[i][j] = this.map[i - 1][j];
            }
        }
        this.map[0] = Array(this.width).fill(-1);
    }

    /**
     * Returns the id of the player whose block is grounded at the given position, or -1 otherwise.
     * @param {Number} row the requested row
     * @param {Number} col the requested column
     * @returns the id of the player whose block is grounded at the given position, or -1 otherwise
     */
    getPlayerAt(row, col) {
        return this.map[row][col];
    }
}