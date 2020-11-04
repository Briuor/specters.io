const Player = require('./player');

class Game {
    constructor() {
        this.sockets = [];
        this.players = [];
        setInterval(this.update.bind(this), 1000 / 60);
        console.log('game started');
    }

    addPlayer(socket) {
        this.sockets[socket.id] = socket;
        this.players[socket.id] = new Player(10, 10);
        console.log('ADD: ', this.players[socket.id]);
    }

    removePlayer(socket) {
        delete this.sockets[socket.id];
        delete this.players[socket.id];
    }

    handleInput(socket, { keyCode, value }) {
        this.players[socket.id].updateDirection(keyCode, value);
        console.log(keyCode);
    }

    update() {
        // move
        Object.keys(this.players).forEach(playerId => {
            this.players[playerId].move();
        });

        // send update event to each client
        Object.keys(this.sockets).forEach(socketId => {
            let me = this.players[socketId];
            console.log(`(${me.x}, ${me.y})`);
            let otherPlayers = Object.values(this.players).filter(p => p !== me);
            this.sockets[socketId].emit('update', { t: Date.now(), me, otherPlayers });
        });
    }
}

module.exports = Game;