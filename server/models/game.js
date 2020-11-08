const Player = require('./player');
const CollisionHandler = require('../physics/collisionHandler');

class Game {
    constructor() {
        this.sockets = [];
        this.players = [];
        this.bullets = [];
        setInterval(this.update.bind(this), 1000 / 60);
        // console.log('game started');
    }

    addPlayer(socket) {
        this.sockets[socket.id] = socket;
        this.players[socket.id] = new Player(100, 100);
        // console.log('ADD: ', this.players[socket.id]);
    }

    removePlayer(socket) {
        delete this.sockets[socket.id];
        delete this.players[socket.id];
    }

    handleInput(socket, input) {
        if (input.type == 'mousemove') {
            this.players[socket.id].updateAngle(input);
        }
        else if (input.type == 'mouseclick') {
            const bullet = this.players[socket.id].shoot(input.screen, socket.id);
            this.bullets.push(bullet);
        }
        else if (input.type == 'keyboard') {
            let { keyCode, value } = input;
            this.players[socket.id].updateDirection(keyCode, value);
            // console.log(keyCode);
        }
    }

    update() {
        // move
        Object.keys(this.players).forEach(playerId => {
            this.players[playerId].move();
        });
        
        this.bullets.forEach(bullet => {
            bullet.move();
        })

        // collision
        Object.keys(this.players).forEach(player1Id => {
            const player1 = this.players[player1Id];
            Object.keys(this.players).forEach(player2Id => {
                if (player1Id !== player2Id) {
                    const player2 = this.players[player2Id];
                    if (CollisionHandler.rectReactCollision(player1, player2)) {
                        console.log('collided');
                    }
                }
            })
        })

        // send update event to each client
        Object.keys(this.sockets).forEach(socketId => {
            let me = this.players[socketId];
            let otherPlayers = Object.values(this.players).filter(p => p !== me);
            this.sockets[socketId].emit('update', { t: Date.now(), me, otherPlayers, bullets: this.bullets });
        });
    }
}

module.exports = Game;