const Player = require('./player');
const Matter = require("matter-js");
const MapServer = require('./map');

class Game {
    constructor() {
        const self = this;
        this.engine = Matter.Engine.create();
        this.engine.world.gravity.x = 0;
        this.engine.world.gravity.y = 0;
        this.frameRate = 1000 / 60;
        this.sockets = [];
        this.players = [];
        this.bullets = [];
        this.bodiesToBeMovedNextFrame = [];

        // add map
        this.map = new MapServer();
        // for (let mapBody of ) {
            Matter.World.add(this.engine.world, this.map.bodies);
        // }
        
        console.log(this.map.bodies[0].vertices);
        Matter.Events.on(this.engine, 'beforeUpdate', function (event) {
            for (let bodiesToMove of self.bodiesToBeMovedNextFrame) {

                let { b1, b2 } = bodiesToMove;
                const targetAngle = Matter.Vector.angle(b2.position, b1.position);
                Matter.Body.applyForce(b1, b1.position, {
                    x: Math.cos(targetAngle) * 0.3,
                    y: Math.sin(targetAngle) * 0.3
                });
            }
            self.bodiesToBeMovedNextFrame = [];
        });

        Matter.Events.on(this.engine, 'collisionStart', function (event) {
            var pairs = event.pairs;

            for (var i = 0; i < pairs.length; i++) {
                var pair = pairs[i];
                if (pair.bodyB.label === "shoot" && pair.bodyA.label === 'player' && pair.bodyB.parentId !== pair.bodyA.id) {
                    console.log('shoot-player colide')
                    self.bodiesToBeMovedNextFrame.push({ b1: pair.bodyA, b2: pair.bodyB })

                    // remove bullet
                    self.bullets.splice(self.bullets.findIndex(b => b.body.id == pair.bodyB.id), 1);
                    Matter.Composite.remove(self.engine.world, pair.bodyB);
                }
                else if (pair.bodyB.label === "shoot" && pair.bodyA.label === 'mapObject') {
                    self.bullets.splice(self.bullets.findIndex(b => b.body.id == pair.bodyB.id), 1);
                    Matter.Composite.remove(self.engine.world, pair.bodyB);
                }

            }
        });

        
        setInterval(this.update.bind(this), this.frameRate);
    }


    
    toVertices = e => e.vertices.map(({ x, y }) => ({ x, y }));

    addPlayer(socket) {
        this.sockets[socket.id] = socket;
        this.players[socket.id] = new Player(100, 100);
        
        Matter.World.add(this.engine.world, [this.players[socket.id].body]);
    }

    removePlayer(socket) {
        delete this.sockets[socket.id];
        delete this.players[socket.id];
    }

    handleInput(socket, input) {
        if (input.type == 'mousemove') {
            this.players[socket.id].updateAngle(input);
        }
        else if (input.type == 'mouseclick') {
            const bullet = this.players[socket.id].shoot(socket.id);
            Matter.World.add(this.engine.world, [bullet.body]);
            this.bullets.push(bullet);
        }
        else if (input.type == 'keyboard') {
            let { keyCode, value } = input;
            this.players[socket.id].updateDirection(keyCode, value);
        }
    }

    update() {
        Matter.Engine.update(this.engine, this.frameRate);
        // move player
        Object.keys(this.players).forEach(playerId => {
            this.players[playerId].move();
        });
        
        // move bullet
        this.bullets.forEach((bullet, index) => {
            bullet.move();
            if (bullet.body.position.x < 0 || bullet.body.position.x > 1240 || bullet.body.position.y < 0 || bullet.body.position.y > 1240) {
                Matter.Composite.remove(this.engine.world, this.bullets[index].body);
                this.bullets.splice(index, 1);
                console.log('bullet removed')
            }
        })

        // send update event to each client
        Object.keys(this.sockets).forEach(socketId => {
            let me = this.players[socketId];
            let otherPlayers = Object.values(this.players).filter(p => p !== me).map(p => p.serialize());
            let bullets = this.bullets.length > 0 ? this.bullets.map(b => b.serialize()) : [];
            this.sockets[socketId].emit('update', { t: Date.now(), me: me.serialize(), otherPlayers, bullets});
        });
    }
}

module.exports = Game;