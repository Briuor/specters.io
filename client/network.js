const geckos = require('@geckos.io/client').default;

module.exports = class Network {
    start(name) {
        this.name = name;
        this.channel = geckos({ port: 3000 });
        

        this.connectPromise = new Promise((resolve, reject) => {
            this.channel.onConnect(error => {
                if (error) {
                    console.log('error');
                    console.error(error.message);
                    return;
                } else {
                    this.channel.emit('join', this.name);
                    console.log(this.channel.id)
                    resolve(this.channel.id);
                }
            });
        })
    }

    connect(state, loopRef, render, player, updateLeaderBoard, gameCtx) {
        this.connectPromise.then((channelId) => {
            render.meId = channelId;
            player.id = channelId;
            render.playerName = localStorage.getItem('name');
            this.channel.on('update', (newUpdate) => {
                state.handleUpdate(newUpdate)
            })
            this.channel.onDisconnect(() => {
                console.log('disconnected')
                clearInterval(loopRef);
            })
            this.channel.on('leaderboard', (leaderboard) => {
                // let deserialized = leaderboard.map(buffer => this.deserializeLeaderBoard(buffer));
                // updateLeaderBoard(deserialized, gameCtx);
            })
            this.channel.on('attack', (id) => {
                render.attackList.push(id);
            })
            this.channel.on('die', (id) => {
                render.dieList.push(id);
            })
        })
    }

    deserializeLeaderBoard(buffer) {
        return { id: buffer[0], name: buffer[1], score: buffer[2] };
    }

}