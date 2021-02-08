const geckos = require('@geckos.io/client').default;
const { iceServers } = require('@geckos.io/client');
const mainModel = require('../shared/models');

module.exports = class Network {
    start(name, player) {
        this.name = name;
        this.channel = geckos({ port: 3000, iceServers });
        this.startPingTime = Date.now();
        setInterval(() => {
            this.startPingTime = Date.now();
            this.channel.emit('ping');
        }, 2000);

        this.connectPromise = new Promise((resolve, reject) => {
            this.channel.onConnect(error => {
                if (error) {
                    console.error(error.message);
                    reject('error');
                } else {
                    player.name = this.name;
                    this.channel.emit('join', this.name);
                    this.channel.on('start', ({ x, y, id }) => {
                        player.x = x;
                        player.y = y;
                        player.id = id;
                        resolve('success');
                    })
                }
            });
        })
    }

    connect(state, loopRef, render, updateLeaderBoard, ping, gameCtx) {
        this.connectPromise.then(() => {
            this.channel.onRaw((newUpdate) => {
                newUpdate = mainModel.fromBuffer(newUpdate);
                state.handleUpdate(newUpdate)
            })
            
            this.channel.onDisconnect(() => {
                console.log('disconnected')
                clearInterval(loopRef);
            })
            
            this.channel.on('leaderboard', (leaderboard) => {
                updateLeaderBoard(leaderboard, gameCtx);
            })

            this.channel.on('attack', (id) => {
                render.attackList.push(id);
            })
            
            this.channel.on('die', (id) => {
                render.dieList.push(id);
            })

            this.channel.on('pong', () => {
                latency = Date.now() - this.startPingTime;
                ping(latency, gameCtx);
            });
        }).catch(err => {
            console.log(err);
        })
    }
}