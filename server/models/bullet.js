class Bullet {
    constructor(x, y, w, h, angle, ownerId) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.speed = 5;
        this.angle = angle;
        this.ownerId = ownerId;
        this.color = "yellow";
    }

    move() {
        this.x += Math.cos(this.angle - Math.PI / 2) * this.speed;
        this.y += Math.sin(this.angle - Math.PI / 2) * this.speed;
    }
}

module.exports = Bullet;