const ioc = require('socket.io-client');
const customParser = require('socket.io-msgpack-parser');
module.exports = class Network {
    start(name) {
        this.name = name;
        this.socket = ioc('ws://localhost:3000', {parser: customParser});
        

        this.connectPromise = new Promise(resolve => {
            this.socket.on('connect', () => {
                this.socket.emit('join', this.name);
                resolve(this.socket.id);
            });
        })
    }

    connect(state, loopRef, render) {
        this.connectPromise.then((socketId) => {
            render.meId = socketId;
            this.socket.on('update', (newUpdate) => { state.handleUpdate(newUpdate) })
            this.socket.on('disconnect', () => { clearInterval(loopRef) })
            this.socket.on('attack', (id) => {
                render.attackList.push(id);
            })
            this.socket.on('die', (id) => {
                render.dieList.push(id);
            })
        })
    }
}