class Bullet {
    constructor(x, y, r, angle, ownerId) {
        this.x = x;
        this.y = y;
        this.r = r;
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