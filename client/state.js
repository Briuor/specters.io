module.exports = class State {

    constructor() {
        this.firstServerTimestamp = 0;
        this.gameStart = 0;
        this.updates = [];
        this.RENDER_DELAY = 100;
    }

    currentServerTime() {
        return this.firstServerTimestamp + (Date.now() - this.gameStart) - this.RENDER_DELAY;
    }


    getBaseUpdate() {
        const serverTime = this.currentServerTime();
        for (let i = this.updates.length - 1; i >= 0; i--) {
            if (this.updates[i].t <= serverTime) {
                return i;
            }
        }
        return -1;
    }

    // handle Update
    getCurrentState() {
        if (!this.firstServerTimestamp) {
            return {};
        }

        const base = this.getBaseUpdate();
        const serverTime = this.currentServerTime();

        if (base < 0 || base === this.updates.length - 1) {
            return this.updates[this.updates.length - 1];
        } else {
            const baseUpdate = this.updates[base];
            const next = this.updates[base + 1];
            const ratio = (serverTime - baseUpdate.t) / (next.t - baseUpdate.t);
            return {
                me: this.interpolateObject(baseUpdate.me, next.me, ratio),
                otherPlayers: this.interpolateObjectArray(baseUpdate.otherPlayers, next.otherPlayers, ratio),
                bullets: this.interpolateObjectArray(baseUpdate.bullets, next.bullets, ratio),
                leaderBoard: baseUpdate.leaderBoard
            };
        }
    }

    interpolateObject(object1, object2, ratio) {
        if (!object2) {
            return object1;
        }

        const interpolated = {};
        Object.keys(object1).forEach(key => {
            if (key == 'x' || key == 'y')
                interpolated[key] = object1[key] + (object2[key] - object1[key]) * ratio;
            else if (key == 'angle' || key == 'id' || key == 'name') {
                interpolated[key] = object2[key];
            }
        });
        return interpolated;
    }

    interpolateObjectArray(objects1, objects2, ratio) {
        return objects1.map(o => this.interpolateObject(o, objects2.find(o2 => o.id === o2.id), ratio));
    }

    deserialize(updateBuffer) {
        let me = this.deserializeMe(updateBuffer[0]);
        let otherPlayers = updateBuffer[1].map(buffer => this.deserializeOthers(buffer));
        console.log(otherPlayers);
        let bullets = updateBuffer[2].map(buffer => this.deserializeBullet(buffer));
        let leaderBoard = updateBuffer[3].map(buffer => this.deserializeLeaderBoard(buffer));
        let t = updateBuffer[4];
        return { me, otherPlayers, bullets, leaderBoard, t };
    }

    deserializeMe(buffer) {
        return { x: buffer[0], y: buffer[1], angle: buffer[2] };
    }


    deserializeOthers(buffer) {
        console.log(buffer);
        return { id: buffer[0], name: buffer[1], x: buffer[2], y: buffer[3], angle: buffer[4] };
    }

    deserializeBullet(buffer) {
        return { id: buffer[0], x: buffer[1], y: buffer[2], angle: buffer[3] };
    }

    deserializeLeaderBoard(buffer) {
        return { name: buffer[0], score: buffer[1] };
    }

    handleUpdate(updateBuffer) {
        const newUpdate = this.deserialize(updateBuffer);
        if (!this.firstServerTimestamp) {
            this.firstServerTimestamp = newUpdate.t;
            this.gameStart = Date.now();
        }

        this.updates.push(newUpdate);
        const base = this.getBaseUpdate();
        if (base > 0) {
            this.updates.splice(0, base);
        }
    }
}