class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.w = 32;
        this.h = 32;
        this.direction = { right: false, left: false, up: false, down: false };
        this.speed = 5;
        this.color = 'red';
    }

    move() {
        if (this.direction.right) this.x += this.speed;
        if (this.direction.left) this.x -= this.speed;
        if (this.direction.up) this.y -= this.speed;
        if (this.direction.down) this.y += this.speed;
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