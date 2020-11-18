class Input {
    constructor(network, camera) {
        document.addEventListener('keydown', (e) => this.handleKeyBoardInput(e, true, network));
        document.addEventListener('keyup', (e) => this.handleKeyBoardInput(e, false, network));
        document.addEventListener('mousemove', (e) => this.handleMouseInput(e, 'mousemove',network, camera));
        // document.addEventListener('click', (e) => this.handleMouseInput(e, 'mouseclick', network, camera));
        document.addEventListener('mousedown', (e) => this.handleMouseInput(e, 'mouseclick', network, camera));
    }
    
    isDirection(code) {
        return (code == 68 || code == 39 || code == 83 || code == 40 || code == 65 || code == 37 || code == 87 || code == 38)
    }

    handleKeyBoardInput(e, value, network) {
        if (this.isDirection(e.which))
            network.socket.emit('input', { keyCode: e.which, value, type: 'keyboard' });
    }

    handleMouseInput(e, type, network, camera) {
        if (camera.following) {
            if (type == 'mousemove') {
                network.socket.emit('input', { x: e.clientX, y: e.clientY, type, screen: { x: camera.following.screenX, y: camera.following.screenY }, camera: { x: camera.x, y: camera.y } });
            }
            else if (e.which == 1) {
                console.log('Left')
                network.socket.emit('input', { x: e.clientX, y: e.clientY, type, btn: 'left', screen: { x: camera.following.screenX, y: camera.following.screenY }, camera: { x: camera.x, y: camera.y } });
            }
            else if (e.which == 3) {
                console.log('Right')
                network.socket.emit('input', { x: e.clientX, y: e.clientY, type, btn: 'right', screen: { x: camera.following.screenX, y: camera.following.screenY }, camera: { x: camera.x, y: camera.y } });
            }
        }
    }

}