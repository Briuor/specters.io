module.exports = class Input {
    listen(network, camera, canvas) {
        document.addEventListener('keydown', (e) => this.handleKeyBoardInput(e, true, network));
        document.addEventListener('keyup', (e) => this.handleKeyBoardInput(e, false, network));
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e, network, camera, canvas), true);
        document.addEventListener('click', () => this.handleMouseClick(network), true);
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

    handleKeyBoardInput(e, value, network) {
        console.log('input')
        if (this.isDirection(e.which))
            network.channel.emit('ik', [e.which,value]);
    }

    handleMouseClick(network) {
        network.channel.emit('imc');
    }

    handleMouseMove(e, network, camera, canvas) {
        if (camera.following) {
            const distX = e.clientX - canvas.getBoundingClientRect().left - camera.following.scX;
            const distY = e.clientY - canvas.getBoundingClientRect().top - camera.following.scY;
            network.channel.emit('imm',  [distX, distY]);
        }
    }

}