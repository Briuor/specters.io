const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const PORT = 3000;
app.use('/', express.static('dist'));

const Game = require('./models/game');
let game = new Game();

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

server.listen(PORT, () => {
    console.log('Listening on Port ' + PORT);
});