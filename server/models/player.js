const Bullet = require("./bullet");

class Player {
    constructor(x, y) {
        this.hp = 100;
        this.x = x;
        this.y = y;
        this.w = 32;
        this.h = 32;
        this.direction = { right: false, left: false, up: false, down: false };
        this.speed = 5;
        this.color = 'red';
        this.angle = 0;
    }

    move() {
        if (this.direction.right) this.x += this.speed;
        if (this.direction.left) this.x -= this.speed;
        if (this.direction.up) this.y -= this.speed;
        if (this.direction.down) this.y += this.speed;
    }

    shoot(screen, ownerId) {
        console.log(this.x, this.y)
        return new Bullet(this.x, this.y, 10, 10, this.angle, ownerId);
    }

    updateAngle(input) {
        let centerX = input.screen.x + this.w / 2;
        let centerY = input.screen.y + this.h / 2;

        this.angle = Math.atan2(input.y - centerY, input.x - centerX) + Math.PI / 2;
    }

    updateDirection(code, value) {
        if (code == 68 || code == 39)
            this.direction.right = value;
        else if (code == 83 || code == 40)
            this.direction.down = value;
        else if (code == 65 || code == 37)
            this.direction.left = value;
        else if (code == 87 || code == 38)
            this.direction.up = value;
    }
}

module.exports = Player;