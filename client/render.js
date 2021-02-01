const PixelCanvas = require('./pixelCanvas');

module.exports = class Render {

    constructor() {
        this.pixelCanvas = new PixelCanvas();
        this.attackList = [];
        this.dieList = [];
        // me
        this.meId = '';
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

    drawPlayer(ctx, me, gameOver, attackSound, dieSound, kills) {
        let sizeIncrease = kills * 4;
        // ctx.fillStyle = 'yellow';
        // ctx.beginPath();
        // ctx.arc(me.screenX, me.screenY, this.meRay/2 + sizeIncrease/2, 0, 2 * Math.PI);
        // ctx.fill();

        let col;
        let angle = (180 * me.angle) / Math.PI; 
        if (angle < 0) angle = 360 + angle;

        if (this.attackList.length > 0 && this.attackList.includes(this.meId)) {
            this.currentFrame = 0;
            this.attackAnimation = true;
            this.attackList.splice(this.attackList.findIndex(id => this.meId == id), 1);
            attackSound.play();
        }

        if (this.dieList.length > 0 && this.dieList.includes(this.meId)) {
            this.attackAnimation = false;
            this.currentFrame = 0;
            this.dieAnimation = true;
            this.dieList.splice(this.dieList.findIndex(id => this.meId == id), 1);
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
        this.pixelCanvas.drawName(ctx, this.playerName, 1, Math.floor(me.screenX - (this.playerName.length * 2)), Math.floor(me.screenY - playerSizeIncrease - 7));
    }

    drawPlayers(ctx, otherPlayers, bullets, camera, attackSound, dieSound) {
        otherPlayers.forEach((p, index) => this.drawOther(ctx, p, camera, p.id, attackSound, dieSound));
        bullets.forEach(b => this.drawBullet(ctx, b, camera));
    }

    drawOther(ctx, p, camera, index, attackSound, dieSound) {
        let sizeIncrease = p.kills * 4;

        // ctx.fillStyle = p.color;
        // ctx.beginPath();
        // ctx.arc(p.x - camera.x, p.y - camera.y, p.r, 0, 2 * Math.PI);
        // ctx.fill();

        if (this.oanimationTime[index] == null ) {
            this.oanimationTime[index] = 0;
        }
        if (this.ocurrentFrame[index] == null) {
            this.ocurrentFrame[index] = 0;
        }

        let angle = (180 * p.angle) / Math.PI;
        if (angle < 0) angle = 360 + angle;

        if (this.attackList.length > 0 && this.attackList.includes(p.id)) {
            this.ocurrentFrame[index] = 0;
            this.oattackAnimation[index] = true;
            this.attackList.splice(this.attackList.findIndex(id => p.id == id), 1);
            attackSound.play();
        }
        if (this.dieList.length > 0 && this.dieList.includes(p.id)) {
            this.oattackAnimation[index] = false;
            this.ocurrentFrame[index] = 0;
            this.odieAnimation[index] = true;
            this.dieList.splice(this.dieList.findIndex(id => p.id == id), 1);
            dieSound.play();
        }
        let col;
        if (angle >= 45 && angle < 135) { //right
            col = this.oattackAnimation[index] ? 5 : 1;
        }
        else if (angle >= 135 && angle < 225) { // down
            col = this.oattackAnimation[index] ? 6 : 2;
        }
        else if (angle >= 225 && angle < 315) { // left
            col = this.oattackAnimation[index] ? 4 : 0;
        }
        else { // top
            col = this.oattackAnimation[index] ? 7 : 3;
        }

        if (this.odieAnimation[index]) col = 8;
        let totalFrames = this.oattackAnimation[index] ? 3 : 5;
        if (this.odieAnimation[index]) {
            totalFrames = 5;
        }
        if (Date.now() - this.oanimationDuration >= this.oanimationTime[index]) {
            this.ocurrentFrame[index] = this.ocurrentFrame[index] >= totalFrames ? 0 : this.ocurrentFrame[index] + 1;
            this.oanimationTime[index] = Date.now();
        }
        if (this.dieAnimation[index] && this.currentFrame[index] == totalFrames && totalFrames == 5) {
            this.dieAnimation[index] = false;
        }
        if (this.oattackAnimation[index] && this.ocurrentFrame[index] == 3 && totalFrames == 3) {
            this.oattackAnimation[index] = false;
        }

        let playerSizeIncrease = sizeIncrease / 2 + this.meRay / 2;
        ctx.drawImage(this.playerImage, this.ocurrentFrame[index] * (this.meRay), col * 26, this.meRay, 26, p.x - playerSizeIncrease - camera.x, p.y - playerSizeIncrease - camera.y, this.meRay + sizeIncrease, 26 + sizeIncrease);
        this.pixelCanvas.drawName(ctx, p.name, 1, Math.floor(p.x - camera.x - (p.name.length * 2)), Math.floor(p.y - this.meRay - camera.y + 7));
    }

    drawBullet(ctx, p, camera) {
        // ctx.fillStyle = 'yellow';
        // ctx.beginPath();
        // ctx.arc(p.x - this.bulletRay - camera.x, p.y - this.bulletRay - camera.y, this.bulletRay/2, 0, 2 * Math.PI);
        // ctx.fill();

        ctx.save();
        ctx.translate(p.x - camera.x, p.y - camera.y);
        ctx.rotate(Math.PI + p.angle);
        ctx.translate(-(p.x - camera.x), -(p.y - camera.y));
        ctx.drawImage(this.projectileImage, 0, 0, this.bulletRay, this.bulletRay, p.x - p.r/2 - camera.x, p.y - p.r - camera.y, p.r, p.r);
        ctx.restore();
    }
}