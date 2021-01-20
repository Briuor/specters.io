const Map = require('../shared/map');
const Camera = require('./camera');
const State = require('./state');
const Render = require('./render');
const Input = require('./input');
const Network = require('./network');
const { Howl } = require('howler');
const { validateName } = require('./util/validations');

module.exports = class Game {
    constructor() {
        this.leaderBoardWrapper = document.getElementById('leaderboard-wrapper');
        this.leaderBoard = document.getElementById('leaderboard');
        this.playAgainModal = document.getElementById('play-again-modal');
        this.playAgainForm = document.getElementById('play-again-form');
        this.namePlayAgainTextField = document.getElementById('name-play-again');
        this.killsElement = document.getElementById('kills');
        
        this.playAgainForm.addEventListener("submit", (e) => {
            e.preventDefault();
            this.playAgainModal.style.display = 'none';
            this.init();
            this.start(validateName(this.namePlayAgainTextField.value));
        })
        this.canvas = document.getElementById('canvas');
        this.canvas.style.background = "black";

        this.kills = 0;

        this.ctx = this.canvas.getContext('2d');
        this.gameWidth = 1280;
        this.gameHeight = 720;
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
            volume: 1,
        });
        this.lavaSound = new Howl({
            src: ['./sounds/lava.mp3'],
            volume: 0.3,
            loop: true,
        });
        this.windSound = new Howl({
            src: ['./sounds/wind.ogg'],
            volume: 0.1,
            loop: true,
        });

        this.map = new Map();
        this.camera = new Camera(this.gameWidth, this.gameHeight, this.map);
        this.state = new State();
        this.network = new Network();
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

    removeChilds(node) {
        var last;
        while (last = node.lastChild) node.removeChild(last);
    }

    updateLeaderBoard(leaderBoard, context) {
        let isTop10 = false;
        context.removeChilds(context.leaderBoard);
        let len = leaderBoard.length - 1;
        console.log(len)
        for (let i = (len < 5 ? len : 4), rankPos = 1; i >= 0; i--, rankPos++) {
            let player = leaderBoard[i];
            let li = document.createElement('li');
            let spanName = document.createElement('span');
            let highlight = '';
            if (player.id == context.render.meId) {
                isTop10 = true;
                highlight = '>';
                spanName.style.marginLeft -= 13;
            }
            let textnode = document.createTextNode(highlight + ' ' + (rankPos) + '. ' +player.name);
            spanName.appendChild(textnode);

            let spanScore = document.createElement('span');
            spanScore.className = 'leaderboard-score';
            textnode = document.createTextNode(player.score);
            spanScore.appendChild(textnode);


            li.appendChild(spanName);
            li.appendChild(spanScore);
            context.leaderBoard.appendChild(li);
        }
        if (!isTop10) {
            let li = document.createElement('li');
            let spanName = document.createElement('span');
            spanName.style.marginLeft -= 13;
            textnode = document.createTextNode('> ?. ' + localStorage.getItem('name'));
            spanName.appendChild(textnode);
            let spanScore = document.createElement('span');
            spanScore.className = 'leaderboard-score';
            textnode = document.createTextNode(context.kills);
            spanScore.appendChild(textnode);


            li.appendChild(spanName);
            li.appendChild(spanScore);
            context.leaderBoard.appendChild(li);

        }
        context.leaderBoardWrapper.style.marginRight = context.canvas.getBoundingClientRect().left;

    }

    gameOver() {
        this.network.socket.disconnect();
        clearInterval(this.loopRef);
        this.playAgainModal.style.display = "block";
        this.killsElement.innerText = this.kills + " Kills";
        this.namePlayAgainTextField.value = localStorage.getItem('name') ? localStorage.getItem('name') : 'unnamed';
    }

    // Main Loop
    run() {
        // get update
        const { me, otherPlayers, bullets } = this.state.getCurrentState();

        if (!me) return;
        this.kills = me.kills;

        this.camera.follow(me);
        this.camera.update();
        this.camera.following.scX = this.cwidth / 2;
        this.camera.following.scY = this.cheight / 2;

        // clear screen
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // draw
        this.camera.draw(this.ctx, this.map);
        this.render.drawPlayer(this.ctx, me, this.gameOver, this.attackSound, this.dieSound);
        this.render.drawPlayers(this.ctx, otherPlayers, bullets, this.camera, this.attackSound, this.dieSound);
    }

    start(playerName) {
        this.canvas.style.display = 'block';
        this.network.start(playerName);

        this.input.listen(this.network, this.camera, this.canvas);
        Promise.all([this.network.connect(this.state, this.loopRef, this.render, this.updateLeaderBoard, this)]).then(() => {
            this.loopRef = setInterval(this.run.bind(this), 1000 / 60);
            this.lavaSound.play();
            this.windSound.play();
            this.leaderBoardWrapper.style.marginRight = this.canvas.getBoundingClientRect().left;
            this.leaderBoardWrapper.style.display = 'block';
        });
    }
}
