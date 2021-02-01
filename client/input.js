module.exports = class Input {
    listen(network, camera, canvas, player) {
        document.addEventListener('keydown', (e) => this.handleKeyBoardInput(e, true, player));
        document.addEventListener('keyup', (e) => this.handleKeyBoardInput(e, false, player));
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e, network, camera, canvas, player), true);
        document.addEventListener('click', (e) => this.handleMouseClick(e,network, canvas, camera, player), true);
    }

    // stopListen(network, camera) {
    //     document.removeEventListener('keydown', (e) => this.handleKeyBoardInput(e, true, network));
    //     document.removeEventListener('keyup', (e) => this.handleKeyBoardInput(e, false, network));
    //     document.removeEventListener('mousemove', (e) => this.handleMouseMove(e, network, camera));
    //     document.removeEventListener('click', () => this.handleMouseClick(network));
    // }
    
    isDirection(code) {
        return (code == 68 || code == 39 || code == 83 || code == 40 || code == 65 || code == 37 || code == 87 || code == 38)
    }

    handleKeyBoardInput(e, value, player) {
        if (this.isDirection(e.which)) {
            player.updateDirection({ keyCode: e.which, value });
        }
    }

    handleMouseClick(e, network, canvas, camera, player) {
        network.channel.emit('imc');
        const x = e.clientX - canvas.getBoundingClientRect().left - camera.following.scX;
        const y = e.clientY - canvas.getBoundingClientRect().top - camera.following.scY;
        player.shotPos = { x, y };
        player.beforePos = { x: player.x, y: player.y }
    }

    handleMouseMove(e, network, camera, canvas, player) {
        if (camera.following) {
            const distX = e.clientX - canvas.getBoundingClientRect().left - camera.following.scX;
            const distY = e.clientY - canvas.getBoundingClientRect().top - camera.following.scY;
            network.channel.emit('imm', [distX, distY]);
            player.updateAngle({distX, distY});
        }
    }

}