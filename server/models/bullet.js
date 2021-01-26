const { nanoid } = require('nanoid');

class Bullet {
    constructor(x, y, r, angle, ownerId, meRay, kills) {
        this.id = nanoid();
        this.x = x + (meRay/2) * Math.cos(angle - Math.PI / 2);
        this.y = y + (meRay/2) * Math.sin(angle - Math.PI / 2);
        this.r = r + (kills*2);
        this.speed = 300;
        this.angle = angle;
        this.ownerId = ownerId;
        this.color = "yellow";
    }

    serialize() {
        return [this.id, this.x, this.y, this.angle, this.r];
    }

    move(dt) {
        this.x += Math.cos(this.angle - Math.PI / 2) * this.speed * dt;
        this.y += Math.sin(this.angle - Math.PI / 2) * this.speed * dt;
    }

    distanceTo(object) {
        const dx = this.x - object.x;
        const dy = this.y - object.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

module.exports = Bullet;