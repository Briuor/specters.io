class Render {

    drawPlayer(ctx, me) {
        // ctx.save();
        // //ROTATE
        // ctx.translate(me.screenX, me.screenY);
        // ctx.rotate(me.angle);
        // ctx.translate(-(me.screenX), -(me.screenY));
        // //draw RECT
        ctx.fillStyle = me.color;
        ctx.beginPath();
        console.log(me)
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