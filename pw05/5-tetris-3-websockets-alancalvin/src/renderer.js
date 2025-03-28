import { cellPixelSize, shapeColors } from "./constants.js"

function cellToPixel(x) {
    return x * cellPixelSize
}

export class Renderer {
    constructor(game, context) {
        this.game = game
        this.context = context
        this.playerId = undefined
    }

    /**
     * Sets the player id of the current player.
     * @param {number} playerId The id of the current player.
     */
    setPlayerId(playerId) {
        this.playerId = playerId
    }

    /**
     * Renders a block at the given position and with the given color.
     * @param {Number} col The column where the block should be drawn.
     * @param {Number} row The row where the block should be drawn.
     * @param {String} color The color of the block.
     */
    renderBlock(col, row, color) {
        this.context.fillStyle = color
        this.context.fillRect(cellToPixel(col), cellToPixel(row), cellPixelSize, cellPixelSize)
        this.context.strokeRect(cellToPixel(col), cellToPixel(row), cellPixelSize, cellPixelSize)
    }

    /**
     * Renders the given shape.
     * @param {Shape} shape The shape to be drawn
     */
    renderFallingShape(shape) {
        if (shape === undefined) {
            return
        }

        const coords = shape.getCoordinates()
        for (let i = 0; i < coords.length; i++) {
            const coord = coords[i]
            const x = shape.col + coord[0]
            const y = shape.row + coord[1]
            const color = shapeColors[shape.playerId % shapeColors.length]
            this.renderBlock(x, y, color)
        }
    }

    /**
     * Clears the context and draws all falling and dropped shapes.
     */
    render() {
        // Reset context
        this.context.strokeStyle = "black"
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height)

        // Draw shapes
        this.game.forEachShape((s) => {
            this.renderFallingShape(s)
        })

        // Draw map
        for (let row = 0; row < this.game.map.height; row++) {
            for (let col = 0; col < this.game.map.width; col++) {
                const cell = this.game.map.getPlayerAt(row, col)
                if (cell !== -1) {
                    const color = shapeColors[cell % shapeColors.length]
                    this.renderBlock(col, row, color)
                }
            }
        }
    }

    /**
     * Updates the scores displayed on the page.
     */
    updateScores() {
        // TODO
        let scoreElement = document.getElementById("scores");
        let scoreToDisplay = "";

        this.game.getTotalScores().forEach((score, id) => {
            scoreToDisplay += `Score of ${id} : ${score} <br>`;
        })
        scoreElement.innerHTML = `<div id="scores">${scoreToDisplay}</div>`;
    }

    /**
     * Updates the current player id displayed on the page.
     */
    showCurrentPlayerId() {
        // TODO
        let id = document.getElementById("currentPlayer");
        id.innerHTML = `<div id="currentPlayer">You are player : ${this.playerId}</div>`
    }
}
