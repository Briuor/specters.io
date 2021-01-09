const Player = require('./player');
const Map = require('../../shared/map');
const CollisionHandler = require('../physics/collisionHandler');

class Game {
    constructor(io) {
        this.io = io;
        this.sockets = [];
        this.players = [];
        this.bullets = [];
        this.map = new Map();
        setInterval(this.update.bind(this), 1000 / 60);
        this.lastUpdateTime = Date.now();
    }

    addPlayer(socket, name) {
        this.sockets[socket.id] = socket;
        const respawnList = [{ x: 700, y: 600 }, { x: 2000, y: 600 }, { x: 1500, y: 2000 }];
        let { x, y } = respawnList[Math.round(Math.random() * 2)];
        this.players[socket.id] = new Player(socket.id, name, x, y);
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
                if (bullet) {
                    this.io.sockets.emit('attack', socket.id);
                    this.bullets.push(bullet);
                }
            }
            else if (input.type == 'keyboard') {
                let { keyCode, value } = input;
                this.players[socket.id].updateDirection(keyCode, value);
            }
        }
    }

    update() {
        let now = Date.now();
        let dt = (now - this.lastUpdateTime) / 1000;
        this.lastUpdateTime = now;
        // move player
        Object.keys(this.players).forEach(playerId => {
            if (this.players[playerId].checkDie()) {
                this.removePlayer(this.sockets[playerId]);
            }
            else if (this.players[playerId] && !this.players[playerId].die) {
                this.players[playerId].move(dt);
                // check if died
                if (this.map.isPositionLava(this.players[playerId])) {
                    if (this.sockets[playerId]) {
                        let playerScoreId = this.players[playerId].hittedById;
                        // if was hitted
                        if (playerScoreId && this.players[playerScoreId]) {
                            this.players[playerScoreId].increaseScore(1);
                            this.players[playerScoreId].updateColor();
                        }
                        // DIE
                        this.io.sockets.emit('die', playerId);
                        this.players[playerId].die = true;
                        this.players[playerId].dieTime = Date.now();
                    }
                }
            }
        });

        // move bullet
        this.bullets.forEach((bullet, index) => {
            bullet.move(dt);
            if (bullet.x < 0 || bullet.x > 50 * 57 || bullet.y < 0 || bullet.y > 50 * 57) {
                this.bullets.splice(index, 1);
            }
        })

        // collision bullet player
        this.bullets.forEach((bullet, bulletIndex) => {
            Object.keys(this.players).forEach(playerId => {
                if (bullet.ownerId != playerId) {
                    const player = this.players[playerId];
                    if (CollisionHandler.circleCircleCollision(bullet, player)) {
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