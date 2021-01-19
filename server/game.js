const Player = require('./models/player');
const Map = require('../shared/map');
const CollisionHandler = require('./physics/collisionHandler');

class Game {
    constructor(io) {
        this.io = io;
        this.sockets = [];
        this.players = [];
        this.bullets = [];
        this.map = new Map();
        this.gameWidth = 1280;
        this.gameHeight = 720;
        this.lastUpdateTime = Date.now();
        setInterval(this.update.bind(this), 1000 / 60);
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

    handleInput(socket, input, type) {
        if (this.players[socket.id]) {
            if (type == 'mousemove') {
                console.log(input)
                this.players[socket.id].updateAngle({ distX: input[0], distY: input[1]});
            }
            else if (type == 'mouseclick') {
                const bullet = this.players[socket.id].shoot(socket.id);
                if (bullet) {
                    Object.values(this.players).filter(
                        p => p.distanceTo(this.players[socket.id]) <= (this.gameWidth + 190) / 2,
                    ).map(p => this.sockets[p.id].emit('attack', p.id));

                    this.bullets.push(bullet);
                }
            }
            else if (type == 'keyboard') {
                this.players[socket.id].updateDirection({ keyCode:input[0], value: input[1] });
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
                        if (playerScoreId && this.players[playerScoreId] && this.players[playerId].impulsed) {
                            this.players[playerScoreId].updateStatus();
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
            const nearbyPlayers = Object.values(this.players).filter(
                p => p !== this.players[socketId] && p.distanceTo(this.players[socketId]) <= (this.gameWidth+190) / 2,
            );
            const nearbyBullets = this.bullets.filter(
                b => b.distanceTo(this.players[socketId]) <= (this.gameWidth + 190) / 2,
            );
            let me = this.players[socketId].serializeMe();
            let otherPlayers = nearbyPlayers.filter(p => p.id !== socketId).map(p => p.serialize());
            let leaderBoard = Object.values(this.players).map(p => p.leaderBoardSerialize())
                .sort((a, b) => {
                if (a && b) {
                    return a.kills - b.kills;
                }
            }).splice(0, 10);
            let bullets = nearbyBullets.map(b => b.serialize());
            let msg = [me, otherPlayers, bullets, leaderBoard, Date.now()];
            this.sockets[socketId].emit('update', msg);
        });
    }
}

module.exports = Game;