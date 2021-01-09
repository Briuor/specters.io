
module.exports = class Render {

    constructor() {

        this.attackList = [];
        this.dieList = [];
        // me
        this.playerImage = new Image();
        this.playerImage.src = './images/ghost2.png';
        this.currentFrame = 0;
        this.animationTime = Date.now();
        this.animationDuration = 100;
        // me attack
        this.attackAnimation = false;
        this.dieAnimation = false;

        // other
        this.ocurrentFrame = {};
        this.oanimationTime = {}
        this.oanimationDuration = 80;
        // other attack
        this.oattackAnimation = {};
        this.odieAnimation = {};

        // projectile
        this.projectileImage = new Image();
        this.projectileImage.src = './images/projectile.png';
        this.currentProjectileFrame = 0;
        this.animationProjectileTime = Date.now();
        this.animationProjectileDuration = 400;


    }

    drawPlayer(ctx, me, gameOver) {
        ctx.fillStyle = me.color;
        ctx.beginPath();
        ctx.arc(me.screenX, me.screenY, me.r, 0, 2 * Math.PI);
        ctx.fill();

        let col;
        let angle = (180 * me.angle) / Math.PI; 
        if (angle < 0) angle = 360 + angle;


        if (this.attackList.length > 0 && this.attackList.includes(me.id)) {
            this.currentFrame = 0;
            this.attackAnimation = true;
            this.attackList.splice(this.attackList.findIndex(id => me.id == id), 1);
        }

        if (this.dieList.length > 0 && this.dieList.includes(me.id)) {
            this.attackAnimation = false;
            this.currentFrame = 0;
            this.dieAnimation = true;
            this.dieList.splice(this.dieList.findIndex(id => me.id == id), 1);
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
        ctx.drawImage(this.playerImage, this.currentFrame * (me.r), col*26, me.r, 26, me.screenX-me.r, me.screenY-me.r, me.r*2, me.r*2);
    }

    drawPlayers(ctx, otherPlayers, bullets, camera) {
        otherPlayers.forEach((p, index) => this.drawOther(ctx, p, camera, p.id));
        bullets.forEach(b => this.drawBullet(ctx, b, camera));
    }

    drawOther(ctx, p, camera, index) {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x - camera.x, p.y - camera.y, p.r, 0, 2 * Math.PI);
        ctx.fill();

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
        }
        if (this.dieList.length > 0 && this.dieList.includes(p.id)) {
            this.oattackAnimation[index] = false;
            this.ocurrentFrame[index] = 0;
            this.odieAnimation[index] = true;
            this.dieList.splice(this.dieList.findIndex(id => p.id == id), 1);
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
        ctx.drawImage(this.playerImage, this.ocurrentFrame[index] * (p.r), col * 26, p.r, 26, p.x - p.r - camera.x, p.y - p.r - camera.y, p.r * 2, p.r * 2);
    }

    drawBullet(ctx, p, camera) {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x - camera.x, p.y - camera.y, p.r, 0, 2 * Math.PI);
        ctx.fill();

        ctx.save();
        ctx.translate(p.x - camera.x, p.y - camera.y);
        ctx.rotate(p.angle);
        ctx.translate(-(p.x - camera.x), -(p.y - camera.y));
        if (Date.now() - this.animationProjectileDuration >= this.animationProjectileTime) {
            this.currentProjectileFrame = this.currentProjectileFrame >= 3 ? 0 : this.currentProjectileFrame + 1;
            this.animationProjectileTime = Date.now();
        }
        ctx.drawImage(this.projectileImage, this.currentProjectileFrame * p.r, 0, p.r, p.r, p.x - p.r - camera.x, p.y - p.r - camera.y, p.r*2, p.r*2);
        ctx.restore();
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