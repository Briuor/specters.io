class Player extends GameObject {
    constructor(x, y, w, h, speed) {
        super(x, y, w, h, 'red');
        this.speed = speed;
        this.direction = {
            up: false,
            down: false,
            left: false,
            right: false
        };
        this.moved = false;
        this.initEvents(this);
    }

    initEvents(playerContext) {
        document.addEventListener('keydown', function (event) {
            console.log(`Pressed: ${event.which}`);
            playerContext.updateDirection(event.which, true);
        });

        document.addEventListener('keyup', function (event) {
            console.log(`Released: ${event.which}`);
            playerContext.updateDirection(event.which, false);
        });
    }

    move() {
        if (this.direction.right) this.x += this.speed;
        if (this.direction.left) this.x -= this.speed;
        if (this.direction.up) this.y -= this.speed;
        if (this.direction.down) this.y += this.speed;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }

    update(ctx) {
        this.move();
        this.draw(ctx);
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
        else {
            this.moved = false;
            return;
        }
        this.moved = true;
    }

}