const Map = require('../shared/map');
const Camera = require('./camera');
const State = require('./state');
const Render = require('./render');
const Input = require('./input');
const Network = require('./network');

module.exports = class Game {
    constructor() {
        this.leaderBoard = document.getElementById('leaderboard');
        this.canvas = document.getElementById('canvas');
        this.canvas.style.background = "black"

        this.ctx = this.canvas.getContext('2d');
        this.gameWidth = 1366;
        this.gameHeight = 702;
        this.cwidth = window.innerWidth - 4;
        this.cheight = window.innerHeight - 4;

        this.canvas.width = this.cwidth;
        this.canvas.height = this.cheight;

        // this.resizeCanvas.bind(this);
        // window.addEventListener("resize", () => { this.resizeCanvas(); });
        
        this.map = new Map();
        this.camera = new Camera(this.cwidth, this.cheight, this.map);
        this.state = new State();
        this.network = new Network();
        this.render = new Render();
        this.input = new Input();
        this.loopRef = null;
        // this.resizeCanvas();
    }

    resizeCanvas() {
        this.cwidth = window.innerWidth - 4;
        this.cheight = window.innerHeight - 4;

        this.canvas.width = this.gameWidth;
        this.canvas.height = this.gameHeight;

        this.canvas.style.width = '' + this.cwidth + 'px';
        this.canvas.style.height = '' + this.cheight + 'px';

        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;
        this.ctx.imageSmoothingEnabled = false;
        
    }

    removeChilds(node) {
        var last;
        while (last = node.lastChild) node.removeChild(last);
    }

    updateLeaderBoard(leaderBoard) {
        let isTop10 = false;
        this.removeChilds(this.leaderBoard);
        let len = leaderBoard.length;
        for (let i = 0; i < (len < 10 ? len: 10); i++) {
            let player = leaderBoard[i];
            let li = document.createElement('li');
            textnode = document.createTextNode(player.name + ' ' + player.score);
            li.appendChild(textnode);
            this.leaderBoard.appendChild(li);
        }
        // if (!isTop10) {
        //     textnode = document.createTextNode(i + player.name + ' ' + player.score);
        //     this.leaderBoard.appendChild(textnode)
        // }
    }

    // Main Loop
    run() {
        // get update
        const { me, otherPlayers, bullets, leaderBoard } = this.state.getCurrentState();

        if (!me) return;
        this.camera.follow(me);
        this.camera.update();

        // clear screen
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // draw
        this.camera.draw(this.ctx, this.map);
        this.render.drawPlayer(this.ctx, me);
        this.render.drawPlayers(this.ctx, otherPlayers, bullets, this.camera);
        this.updateLeaderBoard(leaderBoard);
    }

    start(playerName) {
        this.canvas.style.display = 'block';
        this.network.start(playerName);
        this.input.listen(this.network, this.camera);
        Promise.all([this.network.connect(this.state, this.loopRef)]).then(() => {
            setInterval(this.run.bind(this), 1000 / 60);
        });
    }
}
