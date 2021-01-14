const express = require('express');
const cors = require('cors');
const app = express();
const http = require('http').createServer(app);
const options = {
    cors: true,
    origins: ["http://127.0.0.1:80", "http://127.0.0.1:3000"],
    transport: ['websocket']
}
const io = require('socket.io')(http, options);
const Game = require('./game');

const PORT = 3000;
app.use('/', express.static('dist'));
app.use(cors());

http.listen(PORT, () => {
    console.log('listening on *:' + PORT);
});

io.on('connection', socket => {

    socket.on('join', (playerName) => {
        game.addPlayer(socket, playerName);
        console.log(socket.id + ' connected');
    });

    socket.on('input', (input) => {
        game.handleInput(socket, input);
        console.log(socket.id + ' pressed');
    });
    
    socket.on('disconnect', () => {
        game.removePlayer(socket);
        console.log(socket.id + ' disconnected');
    });
    
});

let game = new Game(io);