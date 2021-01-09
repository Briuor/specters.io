const Bullet = require("./bullet");

class Player {
    constructor(id, name, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.r = 28;
        this.name = name;
        this.direction = { right: false, left: false, up: false, down: false };
        this.speed = 180;
        this.color = '#fff';
        this.angle = 0;
        this.score = 0;
        this.impulsed = false;
        this.impulseSpeed = 0.1*80;
        this.impulseVel = 20*80;
        this.hittedById = null;
        this.force = 320;
        this.shootCooldown = 600;
        this.shootTime = 0;
        this.shot = false;
        this.sendFlag = false;
        this.die = false;
        this.dieDelay = 600;
        this.dieTime = 0;
    }

    move(dt) {
        const MAP_SIZE = 57*50;
        if (this.impulsed && this.impulseVel > 0) {
            this.impulseVel -= this.impulseSpeed;
            this.x += this.impulseVel * Math.cos(this.impulseAngle - Math.PI / 2) * dt;
            this.y += this.impulseVel * Math.sin(this.impulseAngle - Math.PI / 2) * dt;
            this.impulseVel *= 0.9;
        }
        if (this.direction.right) this.x += this.speed * dt;
        if (this.direction.left) this.x -= this.speed * dt;
        if (this.direction.up) this.y -= this.speed * dt;
        if (this.direction.down) this.y += this.speed * dt;
        this.x = Math.max(0, Math.min(MAP_SIZE, this.x));
        this.y = Math.max(0, Math.min(MAP_SIZE, this.y));
    }

    prepareImpulse() {
        this.impulseSpeed = 0.1*80;
        this.impulseVel = 20*80;
        this.impulsed = true;
    }

    impulse(player, bullet) {
        this.impulseAngle = Math.atan2(bullet.y - player.y, bullet.x - player.x) + Math.PI / 2;
        this.prepareImpulse();
    }

    increaseScore(value) {
        this.score += value;
    }

    shoot(ownerId) {
        if (Date.now() - this.shootCooldown >= this.shootTime) {
            this.shootTime = Date.now();
            this.shot = true;
            return new Bullet(this.x, this.y, 10, this.angle, ownerId);
        }
        return false;
    }

    checkDie() {
        if (this.die && Date.now() - this.dieDelay >= this.dieTime) {
            return true;
        }
        return false;
    }


    updateAngle(input) {
        let centerX = input.screen.x;
        let centerY = input.screen.y;

        this.angle = Math.atan2(input.y - centerY, input.x - centerX) + Math.PI / 2;
    }

    updateColor() {
        let newColor = 255 - this.score;
        this.color = `rgb(${ newColor >= 0 ? newColor : 0}, 255, 255)`
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