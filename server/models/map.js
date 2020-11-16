const Matter = require('matter-js');

class MapServer {
    constructor() {
        this.bodies = [
            Matter.Bodies.rectangle(6*32+16, 3*32+16, 3*32, 3*32, { isStatic: true, label: 'mapObject' })
        ]
    }
}

module.exports = MapServer;