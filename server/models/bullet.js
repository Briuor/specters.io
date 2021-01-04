class Bullet {
    constructor(x, y, r, angle, ownerId) {
        this.x = x + 2 * r * Math.cos(angle - Math.PI / 2);
        this.y = y + 2 * r * Math.sin(angle - Math.PI / 2);
        this.r = r;
        this.speed = 10;
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