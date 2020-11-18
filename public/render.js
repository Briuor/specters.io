class Render {

    drawPlayer(ctx, me, camera) {
        // ctx.save();
        // //ROTATE
        // ctx.translate(me.screenX, me.screenY);
        // ctx.rotate(me.angle);
        // ctx.translate(-(me.screenX), -(me.screenY));
        // //draw RECT
        ctx.fillStyle = me.color;
        ctx.beginPath();
        // console.log(me)
        ctx.arc(me.screenX, me.screenY, me.r, 0, 2 * Math.PI);
        ctx.fill();
        if (me.rope) {
            ctx.strokeStyle = 'red';
            ctx.beginPath();
            ctx.moveTo(me.rope.p1.x - camera.x, me.rope.p1.y - camera.y);
            ctx.lineTo(me.rope.p2.x - camera.x, me.rope.p2.y - camera.y);
            ctx.stroke();
        }
        //draw LINE
        // ctx.beginPath();
        // ctx.moveTo(me.screenX, me.screenY);
        // ctx.lineTo(me.screenX, (me.screenY) - 10);
        // ctx.stroke();
        // ctx.restore();
        // ctx.fillStyle = me.color;
        // ctx.fillRect(me.screenX - me.w / 2, me.screenY - me.h / 2, me.w, me.h);

        // m.r * 2 = 100
        this.drawLife(ctx, me)
    }

    drawLife(ctx, player) {
        ctx.fillStyle = 'red';
        ctx.fillRect(
            player.screenX - player.r,
            player.screenY + player.r + 8,
            (player.r * 2 * 100) / 100,
            4,
        );
        ctx.fillStyle = 'white';
        ctx.fillRect(
            player.screenX - player.r,
            player.screenY + player.r + 8,
            (player.r * 2 * player.hp) / 100,
            4,
        );
    }

    drawLifeOtherPlayer(ctx, player, camera) {
        ctx.fillStyle = 'red';
        ctx.fillRect(
            player.x - player.r - camera.x,
            player.y + player.r - camera.y + 8,
            (player.r * 2 * 100) / 100,
            4,
        );
        ctx.fillStyle = 'white';
        ctx.fillRect(
            player.x - player.r - camera.x,
            player.y + player.r - camera.y + 8,
            (player.r * 2 * player.hp) / 100,
            4,
        );
    }

    draw(ctx, otherPlayers, bullets, camera) {
        otherPlayers.forEach(p => this.drawOtherPlayer(ctx, p, camera));
        bullets.forEach(b => this.drawBullet(ctx, b, camera));
    }

    drawOtherPlayer(ctx, p, camera) {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x - camera.x, p.y - camera.y, p.r, 0, 2 * Math.PI);
        ctx.fill();
        if (p.rope) {
            ctx.strokeStyle = 'red';
            ctx.beginPath();
            ctx.moveTo(p.rope.p1.x - camera.x, p.rope.p1.y - camera.y);
            ctx.lineTo(p.rope.p2.x - camera.x, p.rope.p2.y - camera.y);
            ctx.stroke();
        }
        this.drawLifeOtherPlayer(ctx, p, camera);
    }

    drawBullet(ctx, p, camera) {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x - camera.x, p.y - camera.y, p.r, 0, 2 * Math.PI);
        ctx.fill();
    }
}