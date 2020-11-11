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
            const bullet = this.players[socket.id].shoot(socket.id);
            this.bullets.push(bullet);
        }
        else if (input.type == 'keyboard') {
            let { keyCode, value } = input;
            this.players[socket.id].updateDirection(keyCode, value);
            // console.log(keyCode);
        }
    }

    update() {
        // move player
        Object.keys(this.players).forEach(playerId => {
            this.players[playerId].move();
        });
        
        // move bullet
        this.bullets.forEach((bullet, index) => {
            bullet.move();
            if (bullet.x < 0 || bullet.x > 1240 || bullet.y < 0 || bullet.y > 1240) {
                this.bullets.splice(index, 1);
                console.log('bullet removed wall collision')
            }
        })

        // collision player player
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

        // collision bullet player
        this.bullets.forEach((bullet, bulletIndex) => {
            Object.keys(this.players).forEach(playerId => {
                if (bullet.ownerId != playerId) {
                    const player = this.players[playerId];
                    if (CollisionHandler.rectCircleCollision(bullet, player)) {
                        console.log('collide bullet');
                        player.takeDamage(10);
                        this.players[bullet.ownerId].inscreaseScore(1);
                        this.bullets.splice(bulletIndex, 1);
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