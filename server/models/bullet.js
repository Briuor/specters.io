const Matter = require('matter-js');

class Bullet {
    constructor(x, y, r, angle, ownerId, parentBody) {
        this.r = r;
        this.body = Matter.Bodies.circle(x + 2 * r * Math.cos(angle - Math.PI / 2), y + 2 * r * Math.sin(angle - Math.PI / 2), r, [], 50);
        Matter.Body.setAngle(this.body, angle);
        this.angle = angle;
        this.body.parentBodyId = parentBody.id;
        this.body.ownerId = ownerId;
        this.body.label = 'shoot';
        this.speed = 800;
        this.ownerId = ownerId;
        this.color = "yellow";
    }

    serialize() {
        return { x: this.body.position.x, y: this.body.position.y, color: this.color, r: this.r }
    }

    move(dt) {
        Matter.Body.setAngle(this.body, this.angle);
        let x = Math.cos(this.body.angle - Math.PI / 2) * this.speed * dt;
        let y = Math.sin(this.body.angle - Math.PI / 2) * this.speed * dt;
        Matter.Body.setVelocity(this.body, { x, y });
        // Matter.Body.setVelocity(this.body, { x: Math.cos(this.body.angle - Math.PI / 2) * this.speed, y: Math.sin(this.body.angle - Math.PI / 2) * this.speed });

    }
}

module.exports = Bullet;