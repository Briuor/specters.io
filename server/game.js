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

        this.leaderBoardDelay = 1000;
        this.lastLeaderBoardUpdate = Date.now();
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


    getNearbyPlayers(centerPlayer) {
        return Object.values(this.players).filter(
            p => p.distanceTo(centerPlayer) <= (this.gameWidth + 190) / 2,
        )
    }

    handleInput(socket, input, type) {
        if (this.players[socket.id]) {
            if (type == 'mousemove') {
                this.players[socket.id].updateAngle({ distX: input[0], distY: input[1]});
            }
            else if (type == 'mouseclick') {
                const bullet = this.players[socket.id].shoot(socket.id);
                if (bullet) {
                    this.getNearbyPlayers(this.players[socket.id]).map(p => this.sockets[p.id].emit('attack', socket.id));
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
        let dieList = [];
        Object.keys(this.players).forEach(playerId => {
            if (this.players[playerId].checkDie()) {
                this.removePlayer(this.sockets[playerId]);
            }
            else if (this.players[playerId] && !this.players[playerId].die) {
                this.players[playerId].move(dt);
                // check if died
                if (this.map.isPositionLava(this.players[playerId], this.players[playerId].kills)) {
                    if (this.sockets[playerId]) {
                        let playerScoreId = this.players[playerId].hittedById;
                        // if was hitted
                        if (playerScoreId && this.players[playerScoreId] && this.players[playerId].impulsed) {
                            this.players[playerScoreId].updateStatus();
                        }
                        // DIE
                        dieList.push(playerId);
                    }
                }
            }
        });
        
        // emit die events
        dieList.map(id => {
            this.io.sockets.emit('die', id);
            this.players[id].die = true;
            this.players[id].dieTime = Date.now();
        })

        // move bullet
        this.bullets.forEach((bullet, index) => {
            bullet.move(dt);
            if (bullet.x < 0 || bullet.x > 50 * 57 || bullet.y < 0 || bullet.y > 50 * 57) {
                this.bullets.splice(index, 1);
            }
        })

        // collision bullet player
        this.bullets.forEach((bullet, bulletIndex) => {
            let bulletToDeleteIndex = -1;
            Object.keys(this.players).forEach(playerId => {
                if (bullet.ownerId != playerId) {
                    const player = this.players[playerId];
                    if (CollisionHandler.circleCircleCollision(bullet, player)) {
                        player.impulse(this.players[bullet.ownerId], this.bullets[bulletIndex]);
                        player.hittedById = bullet.ownerId;
                        bulletToDeleteIndex = bulletIndex;
                    }
                }
            })
            if (bulletToDeleteIndex !== -1) {
                this.bullets.splice(bulletToDeleteIndex, 1);
            }
        })

        if (Date.now() - this.leaderBoardDelay > this.lastLeaderBoardUpdate) {
            this.lastLeaderBoardUpdate = Date.now();
            let leaderBoard = Object.values(this.players)
                .sort((a, b) => {
                    if (a && b) {
                        return a.kills - b.kills;
                    }
                }).map(p => p.leaderBoardSerialize()).splice(0, 5);
            this.io.sockets.emit('leaderboard', leaderBoard);
        }

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
            let bullets = nearbyBullets.map(b => b.serialize());
            let msg = [me, otherPlayers, bullets, Date.now()];

            this.sockets[socketId].emit('update', msg);
        });

    }
}

module.exports = Game;