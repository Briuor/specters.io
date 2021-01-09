const { nanoid } = require('nanoid');

class Bullet {
    constructor(x, y, r, angle, ownerId) {
        this.id = nanoid();
        this.x = x + 2 * r * Math.cos(angle - Math.PI / 2);
        this.y = y + 2 * r * Math.sin(angle - Math.PI / 2);
        this.r = r;
        this.speed = 700;
        this.angle = angle;
        this.ownerId = ownerId;
        this.color = "yellow";
        
    }

    move(dt) {
        this.x += Math.cos(this.angle - Math.PI / 2) * this.speed * dt;
        this.y += Math.sin(this.angle - Math.PI / 2) * this.speed * dt;
    }
}

module.exports = Bullet;