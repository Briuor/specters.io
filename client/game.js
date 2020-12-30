const Map = require('./map');
const Camera = require('./camera');
const State = require('./state');
const Render = require('./render');
const Input = require('./input');
const Network = require('./network');

module.exports = class Game {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.canvas.style.background = "black"

        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        

        this.map = new Map();
        this.camera = new Camera(this.canvas.width, this.canvas.height, this.map);
        this.state = new State();
        this.network = new Network();
        this.render = new Render();
        this.input = new Input(this.network, this.camera);
        this.loopRef = null;
    }

    // Main Loop
    run() {
        console.log('rubn')
        // get update
        const { me, otherPlayers, bullets } = this.state.getCurrentState();
        if (!me) return;
        this.camera.follow(me);
        this.camera.update();

        // clear screen
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // draw
        this.camera.draw(this.ctx, this.map);
        this.render.drawPlayer(this.ctx, me);
        this.render.drawPlayers(this.ctx, otherPlayers, bullets, this.camera);
    }

    start() {
        this.canvas.style.display = 'block';
        console.log(this.state)
        Promise.all([this.network.connect(this.state, this.loopRef)]).then(() => {
            setInterval(this.run.bind(this), 1000 / 60);
        });
    }
}
