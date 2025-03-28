import { Renderer } from "./renderer.js"
import { Replica } from "./game.js"
import { GameMap } from "./gameMap.js"
import {gameCols, gameRows, port} from "./constants.js";
import {setListeners} from "./inputListener.js";
import {JoinMessage, MessageCodec} from "./messages.js";

const canvas = document.getElementById("canvas")
const context = canvas.getContext("2d")

const gameMap = new GameMap(gameCols, gameRows)
const replica = new Replica(gameMap)
const renderer = new Renderer(replica, context)

// Render loop
function loop() {
    renderer.render()
    requestAnimationFrame(loop)
}
requestAnimationFrame(loop)

const ws = new WebSocket(`ws://${window.location.hostname}:${port}`);

ws.addEventListener('open', (evt) => {
    setListeners(canvas, message => {
        ws.send(MessageCodec.encode(message))
    });
});

ws.addEventListener('message', (evt) => {
    const message = MessageCodec.decode(evt.data)
    if (message instanceof JoinMessage) {
        renderer.setPlayerId(message.getPlayerId());
    }else {
        replica.onMessage(message);
    }
});