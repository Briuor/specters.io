const Game = require('./game');

window.onload = () => {
    const game = new Game();
    const playForm = document.getElementById('play-form');
    const name = document.getElementById('name');
    const gameName = document.getElementsByClassName('game-name')[0];
    name.focus();
    playForm.addEventListener('submit', (e) => {
        e.preventDefault();
        playForm.style.display = 'none';
        gameName.style.display = 'none';
        console.log(name.value)
        game.start(name.value);
    });
}