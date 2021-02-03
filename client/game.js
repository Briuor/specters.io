const Map = require('../shared/map');
const Camera = require('./camera');
const State = require('./state');
const Render = require('./render');
const Input = require('./input');
const Network = require('./network');
const { Howl } = require('howler');
const { validateName } = require('./util/validations');
const Loader = require('./util/loader');
const { SnapshotInterpolation, Vault } = require('@geckos.io/snapshot-interpolation');
const Player = require('../server/models/player');
const Bullet = require('../server/models/bullet');

module.exports = class Game {
    constructor() {
        this.leaderBoardWrapper = document.getElementById('leaderboard-wrapper');
        this.leaderBoard = document.getElementById('leaderboard');
        this.playAgainModal = document.getElementById('play-again-modal');
        this.playAgainForm = document.getElementById('play-again-form');
        this.namePlayAgainTextField = document.getElementById('name-play-again');
        this.killsElement = document.getElementById('kills');

        this.SI = new SnapshotInterpolation(60);
        this.playerVault = new Vault();

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
        this.otherPlayers = [];
        this.bullets = [];
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
        for (let i = 0; i < liList.length; i++) {
            let player = leaderBoard[i];
            let nameEl = liList[i].children[0];
            let scoreEl = liList[i].children[1];
            let highlight = '';
            if (player) {
                if (player.id == context.render.meId) {
                    highlight = '>';
                }
                nameEl.innerText = highlight + (i == 5 ? '?.-' : (i + 1) + '.' + player.name);
                scoreEl.innerText = player.score;
            }
            else {
                nameEl.innerText = highlight + (i == 5 ? '?.-' : (i + 1) + '.-');
                scoreEl.innerText = '-';
            }
        }
        context.leaderBoardWrapper.style.marginRight = context.canvas.getBoundingClientRect().left;
    }

    gameOver() {
        if (this.network.channel && this.network.channel.id) {
            this.network.channel.close();
        }
        clearInterval(this.loopRef);
        this.playAgainModal.style.display = "block";
        this.killsElement.innerText = this.kills + " Kills";
        this.namePlayAgainTextField.value = localStorage.getItem('name') ? localStorage.getItem('name') : 'unnamed';
    }

    // Main Loop
    run() {
        if (this.network.channel.id) {
            let now = Date.now();
            let dt = (now - this.lastUpdateTime) / 1000;
            this.lastUpdateTime = now;

            // send move to server
            this.network.channel.emit('ik', this.player.direction);

            // client prediction
            this.player.move(dt);
            this.playerVault.add(this.SI.snapshot.create([{ id: this.network.channel.id, x: this.player.x, y: this.player.y }]));

            // reconciliation
            const serverSnapshot = this.SI.vault.get();
            // get the closest player snapshot that matches the server snapshot time
            let playerSnapshot = null;
            if (serverSnapshot && serverSnapshot.time) {
                playerSnapshot = this.playerVault.get(serverSnapshot.time, true)
            }
            if (serverSnapshot && playerSnapshot) {
                // get the current player position on the server
                const serverPos = serverSnapshot.state.me[0];

                // calculate the offset between server and client
                const offsetX = playerSnapshot.state[0].x - serverPos.x
                const offsetY = playerSnapshot.state[0].y - serverPos.y
                // this.me = { x: serverPos.x, y: serverPos.y };
                // check if the player is currently on the move
                const isMoving = this.player.direction.left || this.player.direction.up || this.player.direction.right || this.player.direction.down

                // we correct the position faster if the player moves
                const correction = isMoving ? 40 : 80
                // const correction = 40;

                // apply a step by step correction of the player's position
                this.player.x -= offsetX / correction
                this.player.y -= offsetY / correction
            }

            // interpolation
            const otherPlayersSnapshot = this.SI.calcInterpolation('x y', 'otherPlayers');
            if (otherPlayersSnapshot) {
                this.otherPlayers = otherPlayersSnapshot.state;
            }
            const bulletsSnapshot = this.SI.calcInterpolation('x y', 'bullets');
            if (bulletsSnapshot) {
                this.bullets = bulletsSnapshot.state;
            }

            this.camera.follow(this.player);
            this.camera.update();
            this.camera.following.scX = this.cwidth / 2;
            this.camera.following.scY = this.cheight / 2;

            // clear screen
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // draw
            this.camera.draw(this.ctx, this.map);
            // this.ctx.fillStyle = 'blue';
            // this.ctx.beginPath();
            // this.ctx.arc(this.me.x - this.camera.x, this.me.y - this.camera.y, 28 / 2, 0, 2 * Math.PI);
            // this.ctx.fill();
            this.render.drawPlayer(this.ctx, this.player, this.gameOver, this.attackSound, this.dieSound, this.kills);
            this.render.drawPlayers(this.ctx, this.otherPlayers, this.bullets, this.camera, this.attackSound, this.dieSound);
        }
    }

    start(playerName) {
        this.canvas.style.display = 'block';
        this.network.start(playerName, this.player);

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
