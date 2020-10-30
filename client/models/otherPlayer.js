class OtherPlayer extends GameObject{
    constructor(id, x = 0, y = 0, w = 32, h = 32) {
        super(x, y, w, h, 'blue');
        this.id = id;
    }

    draw(ctx) {
        super.drawReact(ctx);
    }
}