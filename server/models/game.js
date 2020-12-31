const Player = require('./player');
const Map = require('./map');
const CollisionHandler = require('../physics/collisionHandler');

class Game {
    constructor() {
        this.sockets = [];
        this.players = [];
        this.bullets = [];
        this.map = new Map();
        setInterval(this.update.bind(this), 1000 / 60);
    }

    addPlayer(socket, name) {
        this.sockets[socket.id] = socket;
        this.players[socket.id] = new Player(name, 100, 100);
    }

    removePlayer(socket) {
        delete this.sockets[socket.id];
        delete this.players[socket.id];
    }

    handleInput(socket, input) {
        if (this.players[socket.id]) {
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
            }
        }
    }

    update() {
        // move player
        Object.keys(this.players).forEach(playerId => {
            this.players[playerId].move();
            if (this.map.isPositionLava(this.players[playerId])) {
                if (this.sockets[playerId]) {
                    let playerScoreId = this.players[playerId].hittedById;
                    // if was hitted
                    if (playerScoreId && this.players[playerScoreId]) {
                        this.players[playerScoreId].increaseScore(10);
                        this.players[playerScoreId].updateColor();
                    }
                    this.sockets[playerId].emit('die');
                    this.removePlayer(this.sockets[playerId]);

                }
            }
        });

        // move bullet
        this.bullets.forEach((bullet, index) => {
            bullet.move();
            if (bullet.x < 0 || bullet.x > 1240 || bullet.y < 0 || bullet.y > 1240) {
                this.bullets.splice(index, 1);
                console.log('bullet removed wall collision');
            }
        })

        // collision bullet player
        this.bullets.forEach((bullet, bulletIndex) => {
            Object.keys(this.players).forEach(playerId => {
                if (bullet.ownerId != playerId) {
                    const player = this.players[playerId];
                    if (CollisionHandler.circleCircleCollision(bullet, player)) {
                        console.log('collide bullet');
                        player.impulse(this.players[bullet.ownerId], this.bullets[bulletIndex]);
                        player.hittedById = bullet.ownerId;
                        this.bullets.splice(bulletIndex, 1);
                    }
                }
            })
        })

        // send update event to each client
        Object.keys(this.sockets).forEach(socketId => {
            let me = this.players[socketId];
            let otherPlayers = Object.values(this.players).filter(p => p !== me);
            let leaderBoard = Object.values(this.players).sort((a, b) => {
                if (a && b) {
                    return a.score - b.score;
                }
            })
            this.sockets[socketId].emit('update', { t: Date.now(), me, otherPlayers, bullets: this.bullets, leaderBoard });
        });
    }
}

module.exports = Game;