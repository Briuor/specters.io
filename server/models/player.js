const Bullet = require("./bullet");

class Player {
    constructor(id, name, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.kills = 0;
        this.r = 28 + this.kills * 4; // 28 initial ray;
        this.name = name;
        this.direction = { right: false, left: false, up: false, down: false };
        this.speed = 100;
        this.color = '#fff';
        this.angle = 0;
        this.impulsed = false;
        this.impulseSpeed = 8;
        this.impulseVel = 20 * 80;
        this.hittedById = null;
        this.shootCooldown = 600;
        this.shootTime = 0;
        this.shot = false;
        this.sendFlag = false;
        this.die = false;
        this.dieDelay = 600;
        this.dieTime = 0;
    }
    serializeMe() {
        return { id: this.id, x:this.x, y:this.y, angle:this.angle, kills: this.kills };
    }

    serialize() {
        return { id: this.id, name: this.name, x: this.x, y: this.y, angle:this.angle, kills: this.kills };
    }

    leaderBoardSerialize() {
        return { id: this.id, name: this.name, kills: this.kills };
    }

    move(dt) {
        const MAP_SIZE = 57 * 50;
        if (this.impulseVel > 0 && this.impulsed) {
            this.impulseVel -= this.impulseSpeed;
            this.x += this.impulseVel * Math.cos(this.impulseAngle - Math.PI / 2) * dt;
            this.y += this.impulseVel * Math.sin(this.impulseAngle - Math.PI / 2) * dt;
            this.impulseVel *= 0.9;
        } else {
            this.impulsed = false;
            if (this.direction.right) this.x += this.speed * dt;
            if (this.direction.left) this.x -= this.speed * dt;
            if (this.direction.up) this.y -= this.speed * dt;
            if (this.direction.down) this.y += this.speed * dt;
        }

        this.x = Math.max(0, Math.min(MAP_SIZE, this.x));
        this.y = Math.max(0, Math.min(MAP_SIZE, this.y));
    }

    prepareImpulse() {
        this.impulseSpeed = 0.1 * 80;
        this.impulseVel = 20 * 80;
        this.impulsed = true;
    }

    impulse(player, bullet) {
        this.impulseAngle = Math.atan2(bullet.y - player.y, bullet.x - player.x) + Math.PI / 2;
        this.prepareImpulse();
    }

    shoot(ownerId) {
        if (Date.now() - this.shootCooldown >= this.shootTime) {
            this.shootTime = Date.now();
            this.shot = true;
            return new Bullet(this.x, this.y, 10, this.angle, ownerId, this.r, this.kills);
        }
        return false;
    }

    checkDie() {
        if (this.die && Date.now() - this.dieDelay >= this.dieTime) {
            return true;
        }
        return false;
    }


    updateAngle({ distX, distY }) {
        this.angle = Math.atan2(distY, distX) + Math.PI / 2;
    }

    updateStatus() {
        this.kills++;
        this.r = 28 + this.kills * 4; // 28 initial ray
        this.impulseSpeed += this.impulseSpeed <= 20 ? 1 : 0;
        this.speed += this.speed <= 300 ? 10 : 0;
    }

    updateDirection({ keyCode, value, direction = null }) {
        if (direction) {
            this.direction = direction;
        }
        else {
            if (keyCode == 68 || keyCode == 39)
                this.direction.right = value;
            else if (keyCode == 83 || keyCode == 40)
                this.direction.down = value;
            else if (keyCode == 65 || keyCode == 37)
                this.direction.left = value;
            else if (keyCode == 87 || keyCode == 38)
                this.direction.up = value;
        }
    }

    distanceTo(object) {
        const dx = this.x - object.x;
        const dy = this.y - object.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

module.exports = Player;