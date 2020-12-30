const Matter = require('matter-js');
const Bullet = require("./bullet");

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.r = 24;
        this.direction = { right: false, left: false, up: false, down: false };
        this.speed = 5;
        this.color = 'white';
        this.angle = 0;
        this.score = 0;
        this.impulsed = false;
        this.impulseSpeed = 0.1;
        this.impulseVel = 20;
    }

    move() {
        const MAP_SIZE = 1280;
        if (this.impulsed && this.impulseVel > 0) {
            this.impulseVel -= this.impulseSpeed;
            this.x += this.impulseVel * Math.cos(this.impulseAngle - Math.PI / 2);
            this.y += this.impulseVel * Math.sin(this.impulseAngle - Math.PI / 2);
            this.impulseVel *= 0.9;
        }
        else {
            if (this.direction.right) this.x += this.speed;
            if (this.direction.left) this.x -= this.speed;
            if (this.direction.up) this.y -= this.speed;
            if (this.direction.down) this.y += this.speed;
        }
        this.x = Math.max(0, Math.min(MAP_SIZE, this.x));
        this.y = Math.max(0, Math.min(MAP_SIZE, this.y));

    }

    prepareImpulse() {
        this.impulseSpeed = 0.1;
        this.impulseVel = 20;
        this.impulsed = true;
    }

    impulse(player, bullet) {
        this.impulseAngle = Math.atan2(bullet.y - player.y, bullet.x - player.x) + Math.PI / 2;
        this.prepareImpulse();
    }

    inscreaseScore(value) {
        this.score += value;
    }

    shoot(ownerId) {
        return new Bullet(this.x, this.y, 10, this.angle, ownerId);
    }

    updateAngle(input) {
        let centerX = input.screen.x;
        let centerY = input.screen.y;

        this.angle = Math.atan2(input.y - centerY, input.x - centerX) + Math.PI / 2;
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