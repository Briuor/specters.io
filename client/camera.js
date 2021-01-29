class Animator {

    constructor(frame_set, delay) {

        this.count = 0;
        this.delay = delay;

        this.frame_set = frame_set;// animation frames
        this.frame_index = 0;// playhead
        this.frame_value = frame_set[0];// current frame

    }

    animate() {

        this.count++;

        if (this.count > this.delay) {

            this.count = 0;

            this.frame_index = (this.frame_index == this.frame_set.length - 1) ? 0 : this.frame_index + 1;
            this.frame_value = this.frame_set[this.frame_index];
        }

    }

}

module.exports = class Camera {

    constructor(w, h, map) {
        this.y = 0;
        this.x = 0;
        this.w = w;
        this.h = h;
        this.maxX = map.cols * map.tsize - w;
        this.maxY = map.rows * map.tsize - h;
        this.following = null;
        this.tilesetImage = null;
        this.animations = {
            22: new Animator([22, 23, 24, 25, 26, 38], 16),
            28: new Animator([29, 30, 31, 32, 38, 28], 16),
            33: new Animator([38, 33, 34, 35, 36, 37], 16),
        };

    }

    follow(me) {
        this.following = me;
        me.screenX = this.w / 2;
        me.screenY = this.h / 2;
    }

    update() {
        // Center player on screen
        // this.following.screenX = this.w / 2;
        // this.following.screenY = this.h / 2;

        // camera follow the player
        this.x = this.following.x - this.w / 2;
        this.y = this.following.y - this.h / 2;
    }

    draw(ctx, map) {
        Object.values(this.animations).forEach(animator => {
            animator.animate();
        });
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

                if (tile == 57 || tile == 37) {
                    ctx.fillStyle = tile == 57 ? "#252525" : "#ff0000";
                    ctx.fillRect(Math.floor(x), Math.floor(y), map.tsize, map.tsize);
                } else {
                    if (this.animations[tile]) {
                        tile = this.animations[tile].frame_value;
                    }
                    tile -= 1;
                    ctx.drawImage(this.tilesetImage, tile * map.tsize, 0, map.tsize, map.tsize, Math.floor(x), Math.floor(y), map.tsize, map.tsize);
                }
            }
        }
    }
}
