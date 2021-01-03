module.exports = class Render {

    constructor() {
        this.playerImage = new Image();
        this.playerImage.src = './images/ghost2.png';
        this.currentFrame = 0;
        this.animationTime = Date.now();
        this.animationDuration = 100;

        this.projectileImage = new Image();
        this.projectileImage.src = './images/projectile.png';
        this.currentProjectileFrame = 0;
        this.animationProjectileTime = Date.now();
        this.animationProjectileDuration = 100;

        this.attackAnimation = false;
    }

    drawPlayer(ctx, me) {
        let angle = (180 * me.angle) / Math.PI; 
        if (angle < 0) angle = 360 + angle;
        
        let col;
        if (angle >= 45 && angle < 135) { //right
            col = this.attackAnimation ? 5 :  1;
        }
        else if (angle >= 135 && angle < 225) { // down
            col = this.attackAnimation ? 6 : 2;
        }
        else if (angle >= 225 && angle < 315) { // left
            col = this.attackAnimation ? 4 : 0;
        }
        else { // top
            col = this.attackAnimation ? 7 : 3;
        }
        let totalFrames = this.attackAnimation ? 3 : 5;

        if (this.attackAnimation && this.currentFrame == 3 && totalFrames == 3) {
            this.attackAnimation = false;
        }
        if (Date.now() - this.animationDuration >= this.animationTime) {
            this.currentFrame = this.currentFrame >= totalFrames ? 0 : this.currentFrame + 1;
            this.animationTime = Date.now();
        }
        ctx.drawImage(this.playerImage, this.currentFrame * (me.r), col*26, me.r, 26, me.screenX-me.r, me.screenY-me.r, me.r*2, me.r*2);
        // this.ctx.drawImage(this.playerImage, this.currentFrame * (player.w + 42) + 21, 0, player.w, player.h, player.x, player.y + cameraOffset, player.w, player.h);

    }

    drawPlayers(ctx, otherPlayers, bullets, camera) {
        otherPlayers.forEach(p => this.draw(ctx, p, camera));
        bullets.forEach(b => this.drawBullet(ctx, b, camera));
    }

    draw(ctx, p, camera) {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x - camera.x, p.y - camera.y, p.r, 0, 2 * Math.PI);
        ctx.fill();
    }

    drawBullet(ctx, p, camera) {
        ctx.save();
        ctx.translate(p.x - camera.x, p.y - camera.y);
        ctx.rotate(p.angle);
        ctx.translate(-(p.x - camera.x), -(p.y - camera.y));
        console.log(this.currentProjectileFrame)
        if (Date.now() - this.animationProjectileDuration >= this.animationProjectileTime) {
            this.currentProjectileFrame = this.currentProjectileFrame >= 3 ? 0 : this.currentProjectileFrame + 1;
            this.animationProjectileTime = Date.now();
        }
        ctx.drawImage(this.projectileImage, this.currentProjectileFrame * p.r, 0, p.r, p.r, p.x - camera.x, p.y - camera.y, p.r*2, p.r*2);
        ctx.restore();
        // ctx.fillStyle = p.color;
        // ctx.beginPath();
        // ctx.arc(p.x - camera.x, p.y - camera.y, p.r, 0, 2 * Math.PI);
        // ctx.fill();
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