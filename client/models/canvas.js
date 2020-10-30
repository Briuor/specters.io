class Canvas {
    constructor(width = window.innerWidth, height = window.innerHeight) {
        this.el = document.getElementById('canvas');
        this.el.style.background = "black"
        this.ctx = this.el.getContext('2d');
        this.width = width;
        this.height = height;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
}