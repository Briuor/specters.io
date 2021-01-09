module.exports = class Camera {
    constructor(w, h, map) {
        this.y = 0;
        this.x = 0;
        this.w = w;
        this.h = h;
        this.maxX = map.cols * map.tsize - w;
        this.maxY = map.rows * map.tsize - h;
        this.following = null;
        this.tileSetImage = new Image();
        this.tileSetImage.src = './images/tileset.png';
    }

    follow(me) {
        this.following = me;
        me.screenX = 0;
        me.screenY = 0;
    }

    update() {
        // Center player on screen
        this.following.screenX = this.w / 2;
        this.following.screenY = this.h / 2;

        // camera follow the player
        this.x = this.following.x - this.w / 2;
        this.y = this.following.y - this.h / 2;

        // Fixa os valores
        // this.x = Math.max(0, Math.min(this.x, this.maxX));
        // this.y = Math.max(-12*57, Math.min(this.y, this.maxY));

        // left right limits
        // if (this.following.x < this.w / 2 ||
        //     this.following.x > this.maxX + this.w / 2) {
        //     this.following.screenX = this.following.x - this.x;
        // }

        // // top bottom limits
        // if (this.following.y < this.h / 2 ||
        //     this.following.y > this.maxY + this.h / 2) {
        //     this.following.screenY = this.following.y - this.y;
        // }

    }

    draw(ctx, map) {
        var startCol = Math.floor(this.x / map.tsize);
        var endCol = startCol + (this.w / map.tsize)+1;
        var startRow = Math.floor(this.y / map.tsize);
        var endRow = startRow + (this.h / map.tsize)+1;
        var offsetX = -this.x + startCol * map.tsize;
        var offsetY = -this.y + startRow * map.tsize;

        for (var c = startCol; c <= endCol; c++) {
            for (var r = startRow; r <= endRow; r++) {
                var tile = map.getTile(c, r);
                var x = (c - startCol) * map.tsize + offsetX;
                var y = (r - startRow) * map.tsize + offsetY;
                

                let ty = 0;
                if (typeof tile === 'undefined' )
                    ctx.drawImage(this.tileSetImage, (11 - 1) * map.tsize, 0, map.tsize, map.tsize, Math.round(x), Math.round(y), map.tsize, map.tsize);
                else {
                    if (tile > 17) {
                        tile = (tile % 17);
                        ty = 1;
                    }
                    ctx.drawImage(this.tileSetImage, (tile - 1) * map.tsize, ty * 57, map.tsize, map.tsize, Math.round(x), Math.round(y), map.tsize, map.tsize);
                }
            }
        }
    }
}
