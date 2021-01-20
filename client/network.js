const ioc = require('socket.io-client');
module.exports = class Network {
    start(name) {
        this.name = name;
        this.socket = ioc('ws://localhost:3000');
        

        this.connectPromise = new Promise(resolve => {
            this.socket.on('connect', () => {
                this.socket.emit('join', this.name);
                resolve(this.socket.id);
            });
        })
    }

    connect(state, loopRef, render, updateLeaderBoard, gameCtx) {
        this.connectPromise.then((socketId) => {
            render.meId = socketId;
            render.playerName = localStorage.getItem('name');
            this.socket.on('update', (newUpdate) => { state.handleUpdate(newUpdate) })
            this.socket.on('disconnect', () => { clearInterval(loopRef) })
            this.socket.on('leaderboard', (leaderboard) => {
                let deserialized = leaderboard.map(buffer => this.deserializeLeaderBoard(buffer));
                updateLeaderBoard(deserialized, gameCtx);
            })
            this.socket.on('attack', (id) => {
                render.attackList.push(id);
            })
            this.socket.on('die', (id) => {
                render.dieList.push(id);
            })
        })
    }

    deserializeLeaderBoard(buffer) {
        return { id: buffer[0], name: buffer[1], score: buffer[2] };
    }

}