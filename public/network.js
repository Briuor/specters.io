class Network {
    constructor() {
        this.socket = io('ws://localhost:3000');

        this.connectPromise = new Promise(resolve => {
            this.socket.on('connect', () => {
                this.socket.emit('join');
                resolve();
            });
        })
    }

    connect(state) {
        this.connectPromise.then(() => {
            this.socket.on('update', (newUpdate) => { state.handleUpdate(newUpdate) })
        })
    }
}