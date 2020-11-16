const Matter = require('matter-js');
const Bullet = require("./bullet");

class Player {
    constructor(x, y) {
        this.hp = 100;
        this.body = Matter.Bodies.circle(x, y, 24, [], 50);
        this.body.label = 'player';
        // this.body.restitution = 0.8;
        this.body.friction = 0.0001;
        // this.body.frictionAir = 0.001;
        // Matter.Body.setDensity(this.body, 0.0005);
        // Matter.Body.setMass(this.body, 0.9);
        // this.body.density = 0.2;        
        Matter.Body.setAngle(this.body, 0);
        this.direction = { right: false, left: false, up: false, down: false };
        this.speed = 5;
        this.color = 'red';
        this.angle = 0;
        this.score = 0;
    }

    serialize() {
        return { x: this.body.position.x, y: this.body.position.y, color: this.color, r: 24}
    }

    move() {
        const MAP_SIZE = 1280;
        let vec = { x: 0, y: 0 };
        if (this.direction.up) vec.y = -1;
        if (this.direction.down) vec.y = 1;
        if (this.direction.left) vec.x = -1;
        if (this.direction.right) vec.x = 1;

        Matter.Body.setVelocity(this.body, { x: vec.x * this.speed, y: vec.y * this.speed });

        // this.body.position.x = Math.max(0, Math.min(MAP_SIZE, this.body.position.x));
        // this.body.position.y = Math.max(0, Math.min(MAP_SIZE, this.body.position.y));

    }

    inscreaseScore(value) {
        this.score += value;
    }

    takeDamage(value) {
        this.hp -= value;
    }

    shoot(ownerId) {
        console.log(this.body.angle)
        return new Bullet(this.body.position.x, this.body.position.y, 10, this.body.angle, ownerId, this.body);
    }

    updateAngle(input) {
        let centerX = input.screen.x;
        let centerY = input.screen.y;

        const angle = Math.atan2(input.y - centerY, input.x - centerX) + Math.PI / 2;
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