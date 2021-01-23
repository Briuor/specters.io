const path = require('path');
const express = require('express');
const cors = require('cors');
const app = express();
const http = require('http').createServer(app);
// const customParser = require('socket.io-msgpack-parser');

const options = {
    cors: true,
    origins: ["http://127.0.0.1:80", "http://127.0.0.1:3000"],
    transport: ['websocket'],
    // parser: customParser
}
const io = require('socket.io')(http, options);
const Game = require('./game');

const PORT = 3000;
app.use('/', express.static(path.join(__dirname, '..', 'dist')));
app.use(cors());

// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '..', 'dist/index.html'));
// });


http.listen(PORT, () => {
    console.log('listening on *:' + PORT);
});

io.on('connection', socket => {

    socket.on('join', (playerName) => {
        game.addPlayer(socket, playerName);
        console.log(socket.id + ' connected');
    });

    socket.on('imc', () => {
        game.handleInput(socket, null, 'mouseclick');
        // console.log(socket.id + ' pressed');
    });

    socket.on('imm', (input) => {
        game.handleInput(socket, input, 'mousemove');
        // console.log(socket.id + ' pressed');
    });

    socket.on('ik', (input) => {
        game.handleInput(socket, input, 'keyboard');
        // console.log(socket.id + ' pressed');
    });
    
    socket.on('disconnect', () => {
        game.removePlayer(socket);
        console.log(socket.id + ' disconnected');
    });
    
});

let game = new Game(io);