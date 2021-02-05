const geckos = require('@geckos.io/client').default;
const {iceServers} = require('@geckos.io/client');

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
                    player.id = this.channel.id;
                    player.name = this.name;
                    this.channel.emit('join', this.name);
                    resolve('success');
                }
            });
        })
    }

    connect(state, loopRef, render, updateLeaderBoard, gameCtx) {
        this.connectPromise.then(() => {
            this.channel.on('update', (newUpdate) => {
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
        }).catch(err => {
            console.log(err);
        })
    }

    deserializeLeaderBoard(buffer) {
        return { id: buffer[0], name: buffer[1], score: buffer[2] };
    }

}