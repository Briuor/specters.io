module.exports = class Input {
    listen(network, camera, canvas) {
        document.addEventListener('keydown', (e) => this.handleKeyBoardInput(e, true, network));
        document.addEventListener('keyup', (e) => this.handleKeyBoardInput(e, false, network));
        document.addEventListener('mousemove', (e) => this.handleMouseInput(e, 'mousemove', network, camera, canvas), true);
        document.addEventListener('click', (e) => this.handleMouseInput(e, 'mouseclick', network, camera, canvas), true);
    }

    stopListen(network, camera) {
        document.removeEventListener('keydown', (e) => this.handleKeyBoardInput(e, true, network));
        document.removeEventListener('keyup', (e) => this.handleKeyBoardInput(e, false, network));
        document.removeEventListener('mousemove', (e) => this.handleMouseInput(e, 'mousemove', network, camera));
        document.removeEventListener('click', (e) => this.handleMouseInput(e, 'mouseclick', network, camera));
    }
    
    isDirection(code) {
        return (code == 68 || code == 39 || code == 83 || code == 40 || code == 65 || code == 37 || code == 87 || code == 38)
    }

    handleKeyBoardInput(e, value, network) {
        if (this.isDirection(e.which))
            network.socket.emit('input', { keyCode: e.which, value, type: 'keyboard' });
    }

    handleMouseInput(e, type, network, camera, canvas) {

        if (camera.following) {
            network.socket.emit('input', { x: e.clientX - canvas.getBoundingClientRect().left, y: e.clientY - canvas.getBoundingClientRect().top, type, screen: { x: camera.following.scX , y: camera.following.scY } });
        }
    }

}