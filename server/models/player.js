const { World } = require('matter-js');
const Matter = require('matter-js');
const Bullet = require("./bullet");

class Player {
    constructor(id, x, y) {
        this.id = id;
        this.hp = 100;
        this.r = 24;
        this.body = Matter.Bodies.circle(x, y, this.r, [], 50);
        this.body.label = 'player';
        this.body.playerId = id;
        this.body.restitution = 0.8;
        // this.body.friction = 0.0001;
        // this.body.frictionAir = 0.001;
        Matter.Body.setDensity(this.body, 0.002);
        Matter.Body.setAngle(this.body, 0);
        this.direction = { right: false, left: false, up: false, down: false };
        this.speed = 200;
        this.color = 'white';
        this.angle = 0;
        this.score = 0;
        this.rope = null;
        this.BULLET_COOLDOWN = 400;
        this.HOOK_COOLDOWN = 1000;
        this.bulletFireTime = 0;
        this.hookFireTime = 0;
    }

    serialize() {
        let me = { x: this.body.position.x, y: this.body.position.y, color: this.color, r: 24, hp: this.hp };
        if (this.rope) { 
            me = { ...me, rope: { p1: this.rope.bodyA.position, p2: this.rope.bodyB.position }}
        }
        return me
    }

    move(dt) {
        const MAP_SIZE = 1280;
        let vec = { x: 0, y: 0 };
        if (this.direction.up) vec.y = -1;
        if (this.direction.down) vec.y = 1;
        if (this.direction.left) vec.x = -1;
        if (this.direction.right) vec.x = 1;

        Matter.Body.setVelocity(this.body, { x: vec.x * this.speed * dt, y: vec.y * this.speed * dt });

        // this.body.position.x = Math.max(0, Math.min(MAP_SIZE, this.body.position.x));
        // this.body.position.y = Math.max(0, Math.min(MAP_SIZE, this.body.position.y));
    }

    updateHook(dt) {
        if (this.rope) {
            this.rope.length -= 500 * dt;
        }
    }

    inscreaseScore(value) {
        this.score += value;
    }

    takeDamage(value) {
        this.hp -= value;
    }

    shoot(ownerId) {
        let isNotInCoolDown = ((Date.now() - this.bulletFireTime) > this.BULLET_COOLDOWN);
        if (isNotInCoolDown) {
            this.bulletFireTime = Date.now();
            Matter.Body.setAngle(this.body, this.angle);
            return new Bullet(this.body.position.x, this.body.position.y, 20, this.body.angle, ownerId, this.body);
        }
        return null;
    }

    fireHook(engine, input) {
        let isNotInCoolDown = ((Date.now() - this.hookFireTime) > this.HOOK_COOLDOWN);
        if (!this.rope && isNotInCoolDown) {
            this.hookFireTime = Date.now();
            let mousePosition = { x: input.x, y: input.y }
            let camera = { x: input.camera.x, y: input.camera.y }
            // getting all bodies
            let bodies = Matter.Composite.allBodies(engine.world);

            // looping through bodies
            for (let i = 0; i < bodies.length; i++) {

                // getting body vertices
                let vertices = bodies[i].parts[0].vertices;

                // do the vertices contain the pointer AND the body is labeled as WALL?
                if (Matter.Vertices.contains(vertices, { x: mousePosition.x + camera.x, y: mousePosition.y + camera.y }) && bodies[i].label == 'mapObject') {

                    // calculate the distance between the ball and the body
                    let distance = this.distance2points(this.body.position.x, this.body.position.y, bodies[i].position.x, bodies[i].position.y)

                    // is the distance greater than ball radius?
                    if (distance > this.r) {
                        // add the constraint
                        this.rope = Matter.Constraint.create({ bodyA: this.body, bodyB: bodies[i], length: distance, stiffness: 0 })
                        Matter.World.add(engine.world, this.rope);
                    }
                    break;
                }
            }
        }
    }

    releaseHook(engine) {
        if (this.rope) {
            Matter.Composite.remove(engine.world, this.rope);
            this.rope = null;
        }
    }

    distance2points(x1, y1, x2, y2) {
        let x = x2 - x1;
        let y = y2 - y1;

        return Math.sqrt((x * x) + (y * y));
    }

    updateAngle(input) {
        let centerX = input.screen.x;
        let centerY = input.screen.y;

        const angle = Math.atan2(input.y - centerY, input.x - centerX) + Math.PI / 2;
        this.angle = angle;
        Matter.Body.setAngle(this.body, angle);
    }

    updateDirection(code, value) {
        if (code == 68 || code == 39)
            this.direction.right = value;
        else if (code == 83 || code == 40)
            this.direction.down = value;
        else if (code == 65 || code == 37)
            this.direction.left = value;
        else if (code == 87 || code == 38)
            this.direction.up = value;
    }
}

module.exports = Player;