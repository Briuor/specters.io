class State {

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

        // const base = this.getBaseUpdate();
        // const serverTime = this.currentServerTime();

        // if (base < 0 || base === this.updates.length - 1) {
        return this.updates[this.updates.length - 1];
        // } else {
        //     const baseUpdate = this.updates[base];
        //     const next = this.updates[base + 1];
        //     const ratio = (serverTime - baseUpdate.t) / (next.t - baseUpdate.t);
        //     return {
        //         me: this.interpolateObject(baseUpdate.me, next.me, ratio),
        //         otherPlayers: this.interpolateObjectArray(baseUpdate.otherPlayers, next.otherPlayers, ratio),
        //         bullets: this.interpolateObjectArray(baseUpdate.bullets, next.bullets, ratio),
        //     };
        // }
    }

    interpolateObject(object1, object2, ratio) {
        if (!object2) {
            return object1;
        }

        const interpolated = object1;
        Object.keys(object1).forEach(key => {
            if (key == 'x' || key == 'y')
                interpolated[key] = object1[key] + (object2[key] - object1[key]) * ratio;
        });
        return interpolated;
    }

    interpolateObjectArray(objects1, objects2, ratio) {
        return objects1.map(o => this.interpolateObject(o, objects2.find(o2 => o.id === o2.id), ratio));
    }

    handleUpdate(newUpdate) {
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