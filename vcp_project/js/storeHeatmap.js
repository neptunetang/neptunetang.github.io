

class StoreHeatmap {

  constructor(width, height) {
    this.storeWidth = width;
    this.storeHeight = height;

    this.store = new Array(this.storeHeight);

    for(var i=0; i<this.store.length; i++){
        this.store[i] = new Array(this.storeWidth);

        for(var j=0; j<this.store[i].length; j++){
            this.store[i][j] = 0.0;
        }
    }
  }

  add(x, y, val) {
    this.store[x][y] += val;
  }

  getHeatmapData() {
    // Calculate the required data for the heatmap instance
    let points = [];
    let max = 0;

    for (let i=0; i<this.storeWidth; i++){
        for (let j=0; j<this.storeHeight; j++){
            if(this.store[i][j] > 0){
                max = Math.max(max, this.store[i][j]);

                let point = {
                    x: i,
                    y: j,
                    value: this.store[i][j]
                };

                points.push(point);
            }

            this.store[i][j] -= 0.00005;

            if(this.store[i][j] < 0)
                this.store[i][j] = 0.0;
            }
    }

    let data = {
        max: Math.fround(max),
        min: 0.0,
        data: points
    };

    return data;
  }
}