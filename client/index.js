const Game = require('./game');
const {validateName} = require('./util/validations');

window.onload = () => {
    const game = new Game();
    const playForm = document.getElementById('play-form');
    const body = document.getElementsByTagName('body')[0];
    const name = document.getElementById('name-play');
    
    const gameName = document.getElementsByClassName('game-name')[0];
    name.focus();
    playForm.addEventListener('submit', (e) => {
        e.preventDefault();
        playForm.style.display = 'none';
        gameName.style.display = 'none';
        body.style.background = '#000';
        body.style.cursor = 'crosshair';
        game.start(validateName(name.value));
    });
}

