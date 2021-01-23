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
        this.tileSetImage = new Image();
        this.tileSetImage.src = './images/tileset.png';
        this.animations = {
            38: new Animator([38, 39, 40, 41, 42, 60], 15),
            55: new Animator([57, 58, 59, 60, 55, 56], 15),
        };

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
                
                if (this.animations[tile]) {
                    tile = this.animations[tile].frame_value;
                }

                let ty = 0;
                if (typeof tile === 'undefined' )
                    ctx.drawImage(this.tileSetImage, (11 - 1) * map.tsize, 0, map.tsize, map.tsize, Math.round(x), Math.round(y), map.tsize, map.tsize);
                else {
                    if (tile > 17) {
                        ty = Math.floor((tile / 17));
                        tile = (tile % 17);
                    }
                    ctx.drawImage(this.tileSetImage, (tile - 1) * map.tsize, ty * 57, map.tsize, map.tsize, Math.round(x), Math.round(y), map.tsize, map.tsize);
                }
            }
        }
    }
}
