const Map = require('../shared/map');
const Camera = require('./camera');
const State = require('./state');
const Render = require('./render');
const Input = require('./input');
const Network = require('./network');
const { Howl } = require('howler');
const { validateName } = require('./util/validations');
const Loader = require('./util/loader');
const { SnapshotInterpolation } = require('@geckos.io/snapshot-interpolation');
const Player = require('../server/models/player');

module.exports = class Game {
    constructor() {
        this.leaderBoardWrapper = document.getElementById('leaderboard-wrapper');
        this.leaderBoard = document.getElementById('leaderboard');
        this.playAgainModal = document.getElementById('play-again-modal');
        this.playAgainForm = document.getElementById('play-again-form');
        this.namePlayAgainTextField = document.getElementById('name-play-again');
        this.killsElement = document.getElementById('kills');

        this.SI = new SnapshotInterpolation(60);
        this.lastUpdateTime = 0;

        this.playAgainForm.addEventListener("submit", (e) => {
            e.preventDefault();
            this.playAgainModal.style.display = 'none';
            this.init();
            this.start(validateName(this.namePlayAgainTextField.value));
        })
        this.canvas = document.getElementById('canvas');
        this.canvas.style.background = "black";
        this.ctx = this.canvas.getContext('2d');

        this.loader = new Loader();

        this.kills = 0;

        this.gameWidth = 640;
        this.gameHeight = 360;
        this.cwidth = window.innerWidth - 4;
        this.cheight = window.innerHeight - 4;

        this.resizeCanvas.bind(this);
        window.addEventListener("resize", () => { this.resizeCanvas(); });

        this.init();
    }

    init() {
        this.attackSound = new Howl({
            src: ['./sounds/attack.mp3'],
            volume: 1,
        });
        this.dieSound = new Howl({
            src: ['./sounds/die.mp3'],
            volume: 0.4,
        });
        this.map = new Map();
        this.camera = new Camera(this.gameWidth, this.gameHeight, this.map);
        this.state = new State(this.SI);
        this.network = new Network();
        window.onbeforeunload = () => {
            this.network.channel.close();
        };
        this.player = new Player(null, 'b', 700, 600);
        this.render = new Render();
        this.input = new Input();
        this.loopRef = null;
        this.gameOver = this.gameOver.bind(this);
        
        this.resizeCanvas();
    }

    resizeCanvas() {
        this.cwidth = window.innerWidth - 4;
        this.cheight = window.innerHeight - 4;

        let ratio = 16 / 9;
        if (this.cheight < this.cwidth / ratio) {
            this.cwidth = this.cheight * ratio;
        }
        else {
            this.cheight = this.cwidth / ratio;
        }
        this.canvas.width = this.gameWidth;
        this.canvas.height = this.gameHeight;

        this.canvas.style.width = '' + this.cwidth + 'px';
        this.canvas.style.height = '' + this.cheight + 'px';

        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;
        this.ctx.imageSmoothingEnabled = false;
        this.leaderBoardWrapper.style.marginRight = this.canvas.getBoundingClientRect().left;
    }


    updateLeaderBoard(leaderBoard, context) {
        let liList = context.leaderBoard.children;
        for (let i = 0; i < liList.length; i++){
            let player = leaderBoard[i];
            let nameEl = liList[i].children[0];
            let scoreEl = liList[i].children[1];
            let highlight = '';
            if (player) {
                if (player.id == context.render.meId) {
                    console.log(player.id, context.render.meId)
                    highlight = '>';
                }
                nameEl.innerText = highlight + (i == 5 ? '?.-' : (i + 1)+'.'+player.name);
                scoreEl.innerText = player.score;
            }
            else {
                nameEl.innerText = highlight + (i == 5 ? '?.-' : (i + 1) +'.-');
                scoreEl.innerText = '-';                
            }
        }
        context.leaderBoardWrapper.style.marginRight = context.canvas.getBoundingClientRect().left;
    }

    gameOver() {
        this.network.channel.close();
        clearInterval(this.loopRef);
        this.playAgainModal.style.display = "block";
        this.killsElement.innerText = this.kills + " Kills";
        this.namePlayAgainTextField.value = localStorage.getItem('name') ? localStorage.getItem('name') : 'unnamed';
    }

    // Main Loop
    run() {
        let now = Date.now();
        let dt = (now - this.lastUpdateTime) / 1000;
        this.lastUpdateTime = now;
        this.player.move(dt);

        // get update
        const snapshot = this.SI.calcInterpolation('x y');

        const { state } = snapshot;

        const me = state[0];
        // console.log(state[0])

        // this.kills = me.kills;
        console.log(this.player)
        this.camera.follow(this.player);
        this.camera.update();
        this.camera.following.scX = this.cwidth / 2;
        this.camera.following.scY = this.cheight / 2;

        // clear screen
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // draw
        this.camera.draw(this.ctx, this.map);
        this.render.drawPlayer(this.ctx, this.player, this.gameOver, this.attackSound, this.dieSound, this.kills);
        // this.render.drawPlayers(this.ctx, otherPlayers, bullets, this.camera, this.attackSound, this.dieSound);
    }

    start(playerName) {
        this.canvas.style.display = 'block';
        this.network.start(playerName);

        this.input.listen(this.network, this.camera, this.canvas, this.player);
        Promise.all([
            this.loader.loadImage('ghost', 'images/ghost.png'),
            this.loader.loadImage('tileset', 'images/tileset.png'),
            this.loader.loadImage('projectile', 'images/projectile.png'),
            this.network.connect(this.state, this.loopRef, this.render, this.updateLeaderBoard, this)
        ]).then(() => {
            
            this.loopRef = setInterval(this.run.bind(this), 1000 / 60);
            this.render.playerImage = this.loader.getImage('ghost');
            this.camera.tilesetImage = this.loader.getImage('tileset');
            this.render.projectileImage = this.loader.getImage('projectile');
            this.leaderBoardWrapper.style.marginRight = this.canvas.getBoundingClientRect().left;
            this.leaderBoardWrapper.style.display = 'block';
        });
    }
}
