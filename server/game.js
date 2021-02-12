const Player = require('./models/player');
const Map = require('../shared/map');
const CollisionHandler = require('./physics/collisionHandler');
const { SnapshotInterpolation } = require('@geckos.io/snapshot-interpolation');
const mainModel = require('../shared/models');

let uidCounter = 0;

class Game {
    constructor(io) {
        this.io = io;
        this.SI = new SnapshotInterpolation();
        this.channels = [];
        this.players = [];
        this.bullets = [];
        this.map = new Map();
        this.gameWidth = 640;
        this.gameHeight = 320;
        this.lastUpdateTime = Date.now();
        setInterval(this.update.bind(this), 1000 / 60);

        this.leaderBoardDelay = 1000;
        this.lastLeaderBoardUpdate = Date.now();
    }

    addPlayer(channel, name) {
        this.channels[channel.id] = channel;
        // const respawnList = [{ x: 700, y: 600 }, { x: 2000, y: 600 }, { x: 1500, y: 2000 }];
        const respawnList = [{ x: 700, y: 600 }];
        let { x, y } = respawnList[Math.round(0)];
        let uid = uidCounter++;

        this.players[channel.id] = new Player(channel.id, name, x, y, uid);
        this.channels[channel.id].emit('start', { id: uid, x, y });
    }

    removePlayer(channel) {
        if (this.channels[channel.id]) {
            // this.channels[channel.id].close();
            delete this.channels[channel.id];
            delete this.players[channel.id];
        }
    }


    getNearbyPlayers(centerPlayer) {
        return Object.values(this.players).filter(
            p => p.distanceTo(centerPlayer) <= (this.gameWidth + 190) / 2,
        )
    }

    handleInput(channel, input, type) {
        if (this.players[channel.id]) {
            if (type == 'mousemove') {
                this.players[channel.id].updateAngle({ distX: input[0], distY: input[1]});
            }
            else if (type == 'mouseclick') {
                const bullet = this.players[channel.id].shoot(this.players[channel.id].uid, channel.id);
                if (bullet) {
                    this.getNearbyPlayers(this.players[channel.id]).map(p => this.channels[p.id].emit('attack', this.players[channel.id].uid));
                    this.bullets.push(bullet);
                }
            }
            else if (type == 'keyboard') {
                this.players[channel.id].updateDirection({ direction: input });
            }
        }
    }

    update() {
        try {
            let now = Date.now();
            let dt = (now - this.lastUpdateTime) / 1000;
            this.lastUpdateTime = now;
            // move player
            let dieList = [];
            Object.keys(this.players).forEach(playerId => {
                if (this.players[playerId].checkDie()) {
                    this.removePlayer(this.channels[playerId]);
                }
                else if (this.players[playerId] && !this.players[playerId].die) {
                    this.players[playerId].move(dt);
                    // check if died
                    if (this.map.isPositionLava(this.players[playerId])) {
                        if (this.channels[playerId]) {
                            let playerScoreId = this.players[playerId].hittedById;
                            // if was hitted
                            if (playerScoreId && this.players[playerScoreId] && this.players[playerId].impulsed) {
                                this.players[playerScoreId].updateStatus();
                            }
                            // DIE
                            dieList.push({ uid: this.players[playerId].uid, id: playerId });
                        }
                    }
                }
            });
        
            // emit die events
            dieList.map(playerIds => {
                this.io.emit('die', playerIds.uid);
                this.players[playerIds.id].die = true;
                this.players[playerIds.id].dieTime = Date.now();
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
                    if (bullet.ownerId != this.players[playerId].uid) {
                        const player = this.players[playerId];
                        if (this.players[bullet.ownerSocketId] && CollisionHandler.circleCircleCollision(bullet, player)) {
                            player.impulse(this.players[bullet.ownerSocketId], this.bullets[bulletIndex]);
                            player.hittedById = bullet.ownerSocketId;
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
                    }).map(p => p.leaderBoardSerialize()).splice(0, 5).reverse();
                this.io.emit('leaderboard', leaderBoard);
            }

            // send update event to each client
            Object.keys(this.channels).forEach(channelId => {
                const nearbyPlayers = Object.values(this.players).filter(
                    p => p !== this.players[channelId] && p.distanceTo(this.players[channelId]) <= (this.gameWidth + 190) / 2,
                );
                const nearbyBullets = this.bullets.filter(
                    b => b.distanceTo(this.players[channelId]) <= (this.gameWidth + 190) / 2,
                );
                let me = this.players[channelId].serializeMe();
                let otherPlayers = nearbyPlayers.filter(p => p.id !== channelId).map(p => p.serialize());
                let bullets = nearbyBullets.map(b => b.serialize());
            
                let worldState = {
                    me: [me],
                    otherPlayers,
                    bullets
                };

                // console.log(worldState);
                const snapshot = this.SI.snapshot.create(worldState);
                // console.log(snapshot.state);
                const buffer = mainModel.toBuffer(snapshot);
                // console.log(JSON.stringify(snapshot).length);
                // console.log(buffer)
                this.channels[channelId].raw.emit(buffer);
            });
        } catch (err) {
            console.log('Error');
            console.error(err);
        }
    }
}

module.exports = Game;