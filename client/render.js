const PixelCanvas = require('./pixelCanvas');

module.exports = class Render {

    constructor() {
        this.pixelCanvas = new PixelCanvas();
        this.attackList = [];
        this.dieList = [];
        // me
        this.playerName = 'Unammed';
        this.playerImage = null;
        this.currentFrame = 0;
        this.animationTime = Date.now();
        this.animationDuration = 100;
        this.meRay = 28;
        // me attack
        this.attackAnimation = false;
        this.dieAnimation = false;

        // other
        this.ocurrentFrame = {};
        this.oanimationTime = {}
        this.oanimationDuration = 100;
        // other attack
        this.oattackAnimation = {};
        this.odieAnimation = {};

        // projectile
        this.projectileImage = null;
        this.bulletRay = 10;
    }

    drawPlayer(ctx, me, gameOver, attackSound, dieSound) {
        let sizeIncrease = me.kills * 4;
        // debug hit box
        // let collisionAdjustSize = (this.meRay + sizeIncrease) / 10;
        // let collisionAdjustY = (this.meRay + sizeIncrease) / 18;
        // ctx.fillStyle = 'yellow';
        // ctx.beginPath();
        // ctx.arc(me.screenX, me.screenY, this.meRay/2 + sizeIncrease/2, 0, 2 * Math.PI);
        // ctx.arc(me.screenX, me.screenY - collisionAdjustY, (this.meRay / 2 + sizeIncrease / 2) - collisionAdjustSize, 0, 2 * Math.PI);
        // ctx.fill();

        let col;
        let angle = (180 * me.angle) / Math.PI;
        if (angle < 0) angle = 360 + angle;

        if (this.attackList.length > 0 && this.attackList.includes(me.id)) {
            this.currentFrame = 0;
            this.attackAnimation = true;
            this.attackList.splice(this.attackList.findIndex(id => me.id == id), 1);
            attackSound.play();
        }

        if (this.dieList.length > 0 && this.dieList.includes(me.id)) {
            this.attackAnimation = false;
            this.currentFrame = 0;
            this.dieAnimation = true;
            this.dieList.splice(this.dieList.findIndex(id => me.id == id), 1);
            dieSound.play();
        }
        else {
            if (angle >= 45 && angle < 135) { //right
                col = this.attackAnimation ? 5 : 1;
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
        }
       
        if (this.dieAnimation) col = 8;
        let totalFrames = this.attackAnimation ? 3 : 5;
        if (this.dieAnimation) {
            totalFrames = 5;
        }

        if (Date.now() - this.animationDuration >= this.animationTime) {
            this.currentFrame = this.currentFrame >= totalFrames ? 0 : this.currentFrame + 1;
            this.animationTime = Date.now();
        }
        if (this.dieAnimation && this.currentFrame == totalFrames && totalFrames == 5) {
            this.dieAnimation = false;
            gameOver();
        }
        if (this.attackAnimation && this.currentFrame == totalFrames && totalFrames == 3) {
            this.attackAnimation = false;
        }
        
        let playerSizeIncrease = sizeIncrease / 2 + this.meRay/2;
        ctx.drawImage(this.playerImage, this.currentFrame * (this.meRay), col * 26, this.meRay, 26, me.screenX - playerSizeIncrease, me.screenY - playerSizeIncrease, (this.meRay) + sizeIncrease, 26 + sizeIncrease);
        this.pixelCanvas.drawName(ctx, me.name, 1, Math.floor(me.screenX - (me.name.length * 2)), Math.floor(me.screenY - playerSizeIncrease - 7));
    }

    drawPlayers(ctx, otherPlayers, bullets, camera, attackSound, dieSound) {
        otherPlayers.forEach((p, index) => this.drawOther(ctx, p, camera, attackSound, dieSound));
        bullets.forEach(b => this.drawBullet(ctx, b, camera));
    }

    drawOther(ctx, p, camera, attackSound, dieSound) {
        let sizeIncrease = p.kills * 4;

        // ctx.fillStyle = p.color;
        // ctx.beginPath();
        // ctx.arc(p.x - camera.x, p.y - camera.y, p.r, 0, 2 * Math.PI);
        // ctx.fill();

        if (this.oanimationTime[p.id] == null ) {
            this.oanimationTime[p.id] = 0;
        }
        if (this.ocurrentFrame[p.id] == null) {
            this.ocurrentFrame[p.id] = 0;
        }

        let angle = (180 * p.angle) / Math.PI;
        if (angle < 0) angle = 360 + angle;

        if (this.attackList.length > 0 && this.attackList.includes(p.id)) {
            this.ocurrentFrame[p.id] = 0;
            this.oattackAnimation[p.id] = true;
            this.attackList.splice(this.attackList.findIndex(id => p.id == id), 1);
            attackSound.play();
        }
        if (this.dieList.length > 0 && this.dieList.includes(p.id)) {
            this.oattackAnimation[p.id] = false;
            this.ocurrentFrame[p.id] = 0;
            this.odieAnimation[p.id] = true;
            this.dieList.splice(this.dieList.findIndex(id => p.id == id), 1);
            dieSound.play();
        }
        let col;
        if (angle >= 45 && angle < 135) { //right
            col = this.oattackAnimation[p.id] ? 5 : 1;
        }
        else if (angle >= 135 && angle < 225) { // down
            col = this.oattackAnimation[p.id] ? 6 : 2;
        }
        else if (angle >= 225 && angle < 315) { // left
            col = this.oattackAnimation[p.id] ? 4 : 0;
        }
        else { // top
            col = this.oattackAnimation[p.id] ? 7 : 3;
        }

        if (this.odieAnimation[p.id]) col = 8;
        let totalFrames = this.oattackAnimation[p.id] ? 3 : 5;
        if (this.odieAnimation[p.id]) {
            totalFrames = 5;
        }
        if (Date.now() - this.oanimationDuration >= this.oanimationTime[p.id]) {
            this.ocurrentFrame[p.id] = this.ocurrentFrame[p.id] >= totalFrames ? 0 : this.ocurrentFrame[p.id] + 1;
            this.oanimationTime[p.id] = Date.now();
        }
        if (this.dieAnimation[p.id] && this.currentFrame[p.id] == totalFrames && totalFrames == 5) {
            this.dieAnimation[p.id] = false;
        }
        if (this.oattackAnimation[p.id] && this.ocurrentFrame[p.id] == 3 && totalFrames == 3) {
            this.oattackAnimation[p.id] = false;
        }

        let playerSizeIncrease = sizeIncrease / 2 + this.meRay / 2;
        ctx.drawImage(this.playerImage, this.ocurrentFrame[p.id] * (this.meRay), col * 26, this.meRay, 26, p.x - playerSizeIncrease - camera.x, p.y - playerSizeIncrease - camera.y, this.meRay + sizeIncrease, 26 + sizeIncrease);
        this.pixelCanvas.drawName(ctx, p.name.trim(), 1, Math.floor(p.x - camera.x - (p.name.trim().length * 2)), Math.floor(p.y - this.meRay - camera.y + 7));
    }

    drawBullet(ctx, p, camera) {
        // ctx.fillStyle = 'yellow';
        // ctx.beginPath();
        // ctx.arc(p.x - camera.x, p.y - camera.y, p.r / 2, 0, 2 * Math.PI);
        // ctx.fill();

        ctx.save();
        ctx.translate(p.x - camera.x, p.y - camera.y);
        ctx.rotate(Math.PI + p.angle);
        ctx.translate(-(p.x - camera.x), -(p.y - camera.y));
        ctx.drawImage(this.projectileImage, 0, 0, this.bulletRay, this.bulletRay, p.x - p.r/2 - camera.x, p.y - p.r/2 - camera.y, p.r, p.r);
        ctx.restore();


    }
}