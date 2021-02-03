const path = require('path');
const geckos = require('@geckos.io/server').default
const { iceServers } = require('@geckos.io/server');
const http = require('http')
const express = require('express')
const app = express()
const server = http.createServer(app)
const io = geckos({ iceServers })
const cors = require('cors');
const Game = require('./game');

app.use(express.static(path.join(__dirname, '..', 'dist')));
app.use(cors());

io.addServer(server);
server.listen(3000);

io.onConnection( channel => {

    channel.on('join', (playerName) => {
        game.addPlayer(channel, playerName);
        console.log(channel.id + ' connected');
    });

    channel.on('imc', () => {
        game.handleInput(channel, null, 'mouseclick');
        // console.log(channel.id + ' pressed');
    });

    channel.on('imm', (input) => {
        game.handleInput(channel, input, 'mousemove');
        // console.log(channel.id + ' pressed');
    });

    channel.on('ik', (direction) => {
        game.handleInput(channel, direction, 'keyboard');
        // console.log(channel.id + ' pressed');
    });
    
    channel.onDisconnect(() => {
        game.removePlayer(channel);
        console.log(channel.id + ' disconnected');
    });
    
});

let game = new Game(io);