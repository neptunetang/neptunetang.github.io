
/**
 * StoreMap
 * this class is used for the astar pathfinder and it contains a grid of the store
 */
class StoreMap {

    constructor(width, height) {
        this.storeWidth = width;
        this.storeHeight = height;

        this.store = new Array(this.storeHeight);

        for(var i=0; i<this.store.length; i++){
            this.store[i] = new Array(this.storeWidth);

            for(var j=0; j<this.store[i].length; j++){
                this.store[i][j] = 1;
            }
        }
    }

    set(x, y, val) {
        this.store[x][y] = val;
    }

    clear(x, y) {
        this.set(x, y, 0);
    }

    clearBorder() {
        for (let x = 0; x < this.storeHeight; x++){
            this.store[0][x] = 0;
            this.store[x][0] = 0;
            this.store[this.storeHeight - 1][x] = 0;
            this.store[x][this.storeWidth - 1] = 0;
        }
    }

    getGrid() {
        return this.store;
    }
}