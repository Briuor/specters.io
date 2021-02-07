const { nanoid } = require('nanoid');

class Bullet {
    constructor(x, y, r, angle, ownerId, ownerSocketId, meRay, kills) {
        this.id = nanoid(10);
        this.x = x + (meRay/2) * Math.cos(angle - Math.PI / 2);
        this.y = y + (meRay/2) * Math.sin(angle - Math.PI / 2);
        this.r = r + (kills*2);
        this.speed = 250;
        this.angle = angle;
        this.ownerId = ownerId;
        this.ownerSocketId = ownerSocketId;
        this.color = "yellow";
    }

    serialize() {
        return { id: this.id, x: this.x, y: this.y, angle: this.angle, r: this.r, ownerId: this.ownerId };
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