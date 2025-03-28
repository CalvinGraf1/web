import {Renderer} from "./renderer.js";
import {Game} from "./game.js";
import {PlayerInfo} from "./playerInfo.js";
import {GameMap} from "./gameMap.js";
import {gameCols, gameRows, stepIntervalMs} from "./constants.js";
import {Shape} from "./shape.js";

/*
TODO:
- Create new game, player and renderer.
- Start a game loop that makes the game step every stepIntervalMs milliseconds (see constants.js).
- Start a rendering loop on the renderer using requestAnimationFrame.
*/

function newPlayer(game) {
    const col = gameCols / 2;
    const shape = new Shape(Shape.getRandomShapeType(), 0, col, 0, 0);
    const player = new PlayerInfo(shape.playerId, shape);
    game.set(shape.playerId, player);
    return player;
}

function recursiveLoop(renderer) {
    function loop() {
        renderer.render();
        requestAnimationFrame(loop);
    }
    loop();
}

const gameMap = new GameMap(gameCols, gameRows);
const game = new Game(gameMap);
const player = newPlayer(game);
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const renderer = new Renderer(game, ctx);
setInterval(() => {game.step(); }, stepIntervalMs);
recursiveLoop(renderer);