const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const p2 = require('p2');

const PORT = 3000;

let players = [];

io.on('connection', socket => {

    socket.on('join', (player) => {
        players.push(player);
        socket.broadcast.emit('playerJoined', player);
        console.log('Player Connectado Total: ', players.length);
    });
    
    socket.on('getPlayers', () => {
        socket.emit('getPlayers', players.filter(p => p.id !== socket.id))
        console.log('get players', players);
    });

    socket.on('move', (player) => {
        // update coordinates
        let p = players.find(p => p.id == player.id);
        p.x = player.x;
        p.y = player.y;
        socket.broadcast.emit('playerMoved', player);
    });

    socket.on('disconnect', () => {
        console.log(socket.id + ' disconnected');
        socket.broadcast.emit('disconnected', socket.id);
        players.splice(players.findIndex(p => p.id === socket.id), 1)
    });
    
});

server.listen(PORT, () => {
    console.log('Listening on Port ' + PORT);
});