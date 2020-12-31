module.exports = class Render {

    constructor() {
        this.playerImage = new Image();
        this.playerImage.src = './images/ghost2.png';
    }

    drawPlayer(ctx, me) {
        // ctx.save();
        // //ROTATE
        // ctx.translate(me.screenX, me.screenY);
        // ctx.rotate(me.angle);
        // ctx.translate(-(me.screenX), -(me.screenY));

        // //draw RECT
        ctx.fillStyle = me.color;
        ctx.beginPath();
        ctx.arc(me.screenX, me.screenY, me.r, 0, 2 * Math.PI);
        ctx.fill();

        //draw LINE
        // ctx.beginPath();
        // ctx.moveTo(me.screenX, me.screenY);
        // ctx.lineTo(me.screenX, (me.screenY) - 10);
        // ctx.stroke();
        // ctx.restore();
        // ctx.fillStyle = me.color;
        // ctx.fillRect(me.screenX - me.w / 2, me.screenY - me.h / 2, me.w, me.h);

        let angle = (180 * me.angle) / Math.PI; 
        if (angle < 0) angle = 360 + angle;
        let direction = 3; // left
        if (angle >= 45 && angle < 135) { //right
            direction = 1;
        }
        else if (angle >= 135 && angle < 225) {
            direction = 2; // down 
        }
        else if (angle >= 225 && angle < 315) {
            direction = 0; // top
        }

        ctx.drawImage(this.playerImage, direction * (me.r), 0, me.r, me.r, me.screenX-me.r, me.screenY-me.r, me.r*2, me.r*2);
        // this.ctx.drawImage(this.playerImage, this.currentFrame * (player.w + 42) + 21, 0, player.w, player.h, player.x, player.y + cameraOffset, player.w, player.h);

    }

    drawPlayers(ctx, otherPlayers, bullets, camera) {
        otherPlayers.forEach(p => this.draw(ctx, p, camera));
        bullets.forEach(b => this.draw(ctx, b, camera));
    }

    draw(ctx, p, camera) {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x - camera.x, p.y - camera.y, p.r, 0, 2 * Math.PI);
        ctx.fill();
    }

    // drawBullet(ctx, p, camera) {
    //     ctx.fillStyle = p.color;
    //     ctx.beginPath();
    //     ctx.arc(p.x - camera.x - p.r / 2, p.y - camera.y - p.r / 2, p.r, 0, 2 * Math.PI);
    //     ctx.fill();
    // }

    drawRect(ctx, { color, x, y, w, h, angle }) {
        ctx.save();
        //ROTATE
        ctx.translate(x + w / 2, y + h / 2);
        ctx.rotate(angle);
        ctx.translate(-(x + w / 2), -(y + h / 2));
        //draw RECT
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);
        //draw LINE
        ctx.beginPath();
        ctx.moveTo(x + w / 2, y + h / 2);
        ctx.lineTo(x + w / 2, (y + h / 2) - 10);
        ctx.stroke();
        ctx.restore();
    }
}