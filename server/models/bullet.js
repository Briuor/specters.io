const { nanoid } = require('nanoid');

class Bullet {
    constructor(x, y, r, angle, ownerId) {
        this.id = nanoid();
        this.x = x + 2 * r * Math.cos(angle - Math.PI / 2);
        this.y = y + 2 * r * Math.sin(angle - Math.PI / 2);
        this.r = r;
        this.speed = 600;
        this.angle = angle;
        this.ownerId = ownerId;
        this.color = "yellow";
    }

    serialize() {
        return [this.id, Number(this.x.toFixed(2)), Number(this.y.toFixed(2)), Number(this.angle.toFixed(2))];
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