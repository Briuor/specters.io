const Matter = require('matter-js');

class Bullet {
    constructor(x, y, r, angle, ownerId, parentBody) {
        this.body = Matter.Bodies.circle(x + 3 * r * Math.cos(angle - Math.PI / 2), y + 3 * r * Math.sin(angle - Math.PI / 2), r, [], 50);
        Matter.Body.setAngle(this.body, angle);
        this.angle = angle;
        this.body.parentId = parentBody.id;
        this.body.label = 'shoot';
        this.speed = 7;
        this.ownerId = ownerId;
        this.color = "yellow";
    }

    serialize() {
        return { x: this.body.position.x, y: this.body.position.y, color: this.color, r: 10 }
    }

    move() {
        Matter.Body.setAngle(this.body, this.angle);
        let x = this.body.position.x + Math.cos(this.body.angle - Math.PI / 2) * this.speed;
        let y = this.body.position.y + Math.sin(this.body.angle - Math.PI / 2) * this.speed;
        Matter.Body.setPosition(this.body, { x, y });
        // Matter.Body.setVelocity(this.body, { x: Math.cos(this.body.angle - Math.PI / 2) * this.speed, y: Math.sin(this.body.angle - Math.PI / 2) * this.speed });

    }
}

module.exports = Bullet;