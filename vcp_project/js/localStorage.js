

class LocalStorage {

    clear() {
        localStorage.removeItem("design");
    }

    setDesign(elems, shownScale) {
        localStorage.setItem("design", "1");
        // create a JSON object
        let jsonObj = [];
        for (let elem in elems) {
            for (let item in elems[elem]) {
                if (elem.toString() == "walls") {
                    let obj = getObjWallCoords(elems[elem][item]);
                    item = {};
                    item["type"] = elem.toString();
                    item["coords"] = [obj.x1, obj.y1, obj.x2, obj.y2];
                    jsonObj.push(item);
                } else if(elem.toString() == "exit" || elem.toString()=="entrance" ){
                    let obj = getEntranceOrExitCoords(elems[elem][item])
                    item = {};
                    item["type"] = elem.toString();
                    item["coords"] = [obj.x, obj.y];
                    jsonObj.push(item);
                } else {
                    let obj = getScaledCoords(elems[elem][item]);
                    item = {};
                    item["type"] = elem.toString();
                    item["coords"] = [obj.x1, obj.y1, obj.xSize, obj.ySize];
                    jsonObj.push(item);
                }
            }
        }
        let item = {};
        item["type"] = "scale";
        item["coords"] = shownScale;
        jsonObj.push(item);
        // convert JSON object to string
        const data = JSON.stringify(jsonObj);
        // write JSON string to a file
        localStorage.setItem("config", data);
    }

    hasDesign() {
        return localStorage.getItem("design") == "1";
    }

    getDesign(config) {
        let design = [];
        let data = JSON.parse(localStorage.getItem("config"));
        for (let d in data){
            let items = {};
            if(data[d].type == "walls"){
                items["label"] = "wall";
                items["x1"] = data[d].coords[0];
                items["y1"] = data[d].coords[1];
                items["x2"] = data[d].coords[2];
                items["y2"] = data[d].coords[3];
                design.push(items);
            } else if(data[d].type == "shelves"){
                items["label"] = "shelf";
                items["x"] = data[d].coords[0];
                items["y"] = data[d].coords[1];
                items["x_offset"] = data[d].coords[2];
                items["y_offset"] = data[d].coords[3];
                design.push(items);
            } else if (data[d].type == "exit"){
                config.exit = {
                    x: data[d].coords[0],
                    y: data[d].coords[1],
                    duration: 20,
                    sprite: { xScale: 0.5, yScale: 0.5 }
                }
            } else if(data[d].type == "entrance"){
                config.entrance = {
                    x: data[d].coords[0],
                    y: data[d].coords[1],
                    sprite: { xScale: 0.5, yScale: 0.5 }
                }
            } else {
                config.designScale = data[d].coords;
            }
        }
        config.design = design;
        return config;
    }

}