import {DropMessage, MoveMessage, RotateMessage} from "./messages.js";
import {cellPixelSize, gamePixelWidth} from "./constants.js";

let playerId = 0;
var column = -1;

export function handleMove(event, messageListener) {
    let newColumn = Math.floor(event.offsetX / cellPixelSize);

    if (newColumn !== column) {
         column = newColumn;
         messageListener(playerId, new MoveMessage(column));
    }
}

/**
 * Sets up all event listeners for user interactions:
 * - A click on the canvas or a key press on the down arrow will send a `DropMessage`.
 * - A movement of the mouse on the canvas will send a `MoveMessage` with the corresponding column.
 * - A key press on the left or right arrow will send a left or right `RotateMessage`.
 * @param canvas The canvas on which the game is drawn
 * @param messageListener The callback function handling the messages to be sent. It expects a `Message` as unique argument.
 */
export function setListeners(canvas, messageListener) {
  // TODO
    // Cette fonction doit écouter les entrées clavier et souris (et appeler la fonction onMessage de game.js ?)

    // Add event listener for keydown event
    document.addEventListener('keydown', function(event){
        if (event.code === 'ArrowLeft') messageListener(playerId, new RotateMessage('left'));
        else if (event.code === 'ArrowRight') messageListener(playerId, new RotateMessage('right'));
        else if (event.code === 'ArrowDown') messageListener(playerId, new DropMessage());
    });

    canvas.addEventListener('click', function() {
        messageListener(playerId, new DropMessage());
    });

    canvas.addEventListener('mousemove', (event) => {
        handleMove(event, messageListener);
    });
}
