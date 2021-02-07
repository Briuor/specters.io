const geckos = require('@geckos.io/client').default;
const { iceServers } = require('@geckos.io/client');
const mainModel = require('../shared/models');

module.exports = class Network {
    start(name, player) {
        this.name = name;
        this.channel = geckos({ port: 3000, iceServers });
        

        this.connectPromise = new Promise((resolve, reject) => {
            this.channel.onConnect(error => {
                if (error) {
                    console.error(error.message);
                    reject('error');
                } else {
                    // player.id = this.channel.id;
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

    connect(state, loopRef, render, player, updateLeaderBoard, gameCtx) {
        this.connectPromise.then(() => {
            this.channel.onRaw((newUpdate) => {
                newUpdate = mainModel.fromBuffer(newUpdate);
                // console.log('newUpdate', newUpdate);
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
                console.log(id);
                render.attackList.push(id);
            })
            this.channel.on('die', (id) => {
                render.dieList.push(id);
            })
        }).catch(err => {
            console.log(err);
        })
    }

    deserializeLeaderBoard(buffer) {
        return { id: buffer[0], name: buffer[1], score: buffer[2] };
    }

}