module.exports = class Network {
    start(name) {
        this.name = name;
        this.socket = io('ws://localhost:3000');

        this.connectPromise = new Promise(resolve => {
            this.socket.on('connect', () => {
                console.log(this.name);
                this.socket.emit('join', this.name);
                resolve();
            });
        })
    }

    connect(state, loopRef, render) {
        this.connectPromise.then(() => {
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