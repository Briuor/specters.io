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

    connect(state, loopRef) {
        this.connectPromise.then(() => {
            this.socket.on('update', (newUpdate) => { state.handleUpdate(newUpdate) })
            this.socket.on('disconnect', () => { clearInterval(loopRef) })
            this.socket.on('die', () => {
                this.socket.emit('disconnect');
                clearInterval(loopRef);
            })
        })
    }
}