class Camera {
    constructor(w, h) {
        this.y = 0;
        this.x = 0;
        this.w = w;
        this.h = h;
        this.maxX = map.cols * map.tsize - w;
        this.maxY = map.rows * map.tsize - h;
        this.following = null;
    }

    follow(me) {
        this.following = me;
        me.screenX = 0;
        me.screenY = 0;
    }

    update(me) {
        // Center player on screen
        this.following.screenX = this.w / 2;
        this.following.screenY = this.h / 2;

        // camera follow the player
        this.x = this.following.x - this.w / 2;
        this.y = this.following.y - this.h / 2;

        // Fixa os valores
        this.x = Math.max(0, Math.min(this.x, this.maxX));
        this.y = Math.max(0, Math.min(this.y, this.maxY));

        // left right limits
        if (this.following.x < this.w / 2 ||
            this.following.x > this.maxX + this.w / 2) {
            this.following.screenX = this.following.x - this.x;
        }

        // top bottom limits
        if (this.following.y < this.h / 2 ||
            this.following.y > this.maxY + this.h / 2) {
            this.following.screenY = this.following.y - this.y;
        }

    }

    draw(ctx, map) {
        var startCol = Math.floor(this.x / map.tsize);
        var endCol = startCol + (this.w / map.tsize);
        var startRow = Math.floor(this.y / map.tsize);
        var endRow = startRow + (this.h / map.tsize);
        var offsetX = -this.x + startCol * map.tsize;
        var offsetY = -this.y + startRow * map.tsize;

        for (var c = startCol; c <= endCol; c++) {
            for (var r = startRow; r <= endRow; r++) {
                var tile = map.getTile(c, r);
                var x = (c - startCol) * map.tsize + offsetX;
                var y = (r - startRow) * map.tsize + offsetY;
                if (tile == 1)
                    ctx.fillStyle = 'grey';
                else
                    ctx.fillStyle = 'blue';

                ctx.fillRect(
                    Math.round(x),  // target x
                    Math.round(y), // target y
                    map.tsize, // target width
                    map.tsize // target height
                );
            }
        }
    }
}
