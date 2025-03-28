import express from 'express'
import expressWs from 'express-ws'
import {gameCols, gameRows, port, stepIntervalMs} from './src/constants.js'
import { Game } from './src/game.js'
import {JoinMessage, MessageCodec, SetPlayerMessage, UpdateMapMessage} from "./src/messages.js";
import {GameMap} from "./src/gameMap.js";
import {PlayerInfo} from "./src/playerInfo.js";

const app = express()
expressWs(app)



// TODO Create a new Game instance and start a game loop

const game = new Game(new GameMap(gameCols, gameRows), messageSender, false)
let players = new Map();
let id = 0;

setInterval(() => {
    game.step()
    players.forEach((_, id) => {
        game.sendMessage(new SetPlayerMessage(game.get(id)))
    })
}, stepIntervalMs)

// Serve the public directory
app.use(express.static('public'))

// Serve the src directory
app.use('/src', express.static('src'))

// Websocket game events
app.ws('/', (socket) => {
    // TODO handle new websocket connections.
    players.set(++id, socket);
    socket.send(MessageCodec.encode(new JoinMessage(id)));

    console.log(`test - ${id}`)

    game.introduceNewPlayer(new PlayerInfo(id, socket));
    game.sendMessage(new UpdateMapMessage(game.map));

    socket.on('message', data => {
        game.onMessage(id, MessageCodec.decode(data));

        socket.on('close', () => {
            players.delete(id)
            game.quit(id)
        })
    })
})

app.listen(port)

console.log("App started.")
