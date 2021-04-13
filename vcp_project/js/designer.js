

const MIN_SHELF_SIZE = 10;

// State variables for the event handlers
let drawingShelf = false;
let drawingWall = false;
let moving = false;
let deleting = false;
let placingEntrance = false;
let placingExit = false;
let mouseDown = false;

// Variables related to the grid
let scale = 100;  // Scale in percentages
let shownScale = 100;
let gridSize = 1; // Grid in factor (1 = 100cm)

// Variables related to manipulating objects
let moveObj = null;  // The object that is currently moved
let clickInitX, clickInitY = null;  // The initial click locationn

// All the shelf objects (including defaults)
let shelves = [
    {'x1': 10, 'y1': 10, 'xSize': 100, 'ySize': 100},
]

let entrance = []
let exit = []
let walls = [
    {'x1': 500, 'y1': 20, 'x2': 500, 'y2': 500}
]
let wallCorner = null;

// All drawable objects
let elems = {shelves, walls, entrance, exit}

// Get the DOM elements
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let shelfBtn = document.getElementById('shelfBtn');
let moveBtn = document.getElementById('moveBtn');
let delBtn = document.getElementById('delBtn');
let createWallBtn = document.getElementById('createWallBtn');
let delWallBtn = document.getElementById('delWallBtn');

let configScale = document.getElementById('configScaleRange');
let configScaleRangeVal = document.getElementById('configScaleRangeVal');
let configGridRange = document.getElementById('configGridRange');
let configGridRangeVal = document.getElementById('configGridRangeVal');
let placeEntrance = document.getElementById('placeEntrance');
let placeExit = document.getElementById('placeExit');
let save = document.getElementById('save');

let cwidth = canvas.width;
let cheight = canvas.height;

let xMid = cwidth / 2;
let yMid = cheight / 2;

let storage = new LocalStorage();

configScale.onchange = function(e) {
    configScaleRangeVal.innerHTML = configScale.value + "%";
    scale = 100 / (100 / configScale.value);
    shownScale = configScale.value/100;
    redraw();
}

configGridRange.onchange = function(e) {
    configGridRangeVal.innerHTML = configGridRange.value + " cm";
    gridSize = (100 / configGridRange.value);
    redraw();
}

placeEntrance.onclick = function() {
    placingEntrance = true;
}

placeExit.onclick = function() {
    placingExit = true;
}

shelfBtn.onclick = function() {
    drawingShelf = true;
    canvas.style.cursor = 'crosshair';
}

moveBtn.onclick = function() {
    moving = true;
    canvas.style.cursor = 'pointer';
}

delBtn.onclick = function() {
    deleting = true;
    canvas.style.cursor = 'pointer';
}

createWallBtn.onclick = function() {
    drawingWall = true;
    canvas.style.cursor = 'crosshair';
}

delWallBtn.onclick = function(e) {
    elems.walls = [];
    elems.entrance = [];
    elems.exit = [];
    wallCorner = null;
    redraw();
}

save.onclick = function () {
    storage.setDesign(elems, shownScale);
}

canvas.onclick = function(e) {
    let clickX = e.offsetX;
    let clickY = e.offsetY;

    if (drawingWall) {
        if (wallCorner == null) {
            wallCorner = {'x': clickX, 'y': clickY};
        } else {
            elems.walls.push(getObjWallCoords({
                'x1': wallCorner.x, 'y1': wallCorner.y, 'x2': clickX, 'y2': clickY
            }));
            wallCorner.x = clickX;
            wallCorner.y = clickY;
        }
    }

    if (deleting) {
        for (let elem in elems) {
            for (let item in elems[elem]) {
                let obj = getScaledCoords(elems[elem][item]);

                let clickXinObj = obj.x1 < clickX && obj.x1 + obj.xSize > clickX;
                let clickYinObj = obj.y1 < clickY && obj.y1 + obj.ySize > clickY;

                if (clickXinObj && clickYinObj) elems[elem].splice(item, 1);
            }

            deleting = false;
            canvas.style.cursor = 'auto';
        }
    }

    if (placingEntrance) {
        let closest = calcOpening({x: mouseX, y: mouseY});
        elems.entrance = [{'x': scaleToObj(closest.x), 'y': scaleToObj(closest.y)}];
        placingEntrance = false;
    }

    if (placingExit) {
        let closest = calcOpening({x: mouseX, y: mouseY});
        elems.exit = [{'x': scaleToObj(closest.x), 'y': scaleToObj(closest.y)}];
        placingExit = false;
    }

    redraw();
}

canvas.ondblclick = function(e) {
    if (drawingWall) {
        drawingWall = false;
        elems.walls.splice(-1,1);
        elems.walls.push({
            'x1': scaleToObj(e.offsetX),
            'y1': scaleToObj(e.offsetY),
            'x2': elems.walls[0].x1,
            'y2': elems.walls[0].y1
        });
    }
    redraw();
}

canvas.onmousedown = function(e) {
    if (drawingShelf) {
        mouseDown = true;
        clickInitX = e.offsetX;
        clickInitY = e.offsetY;
    }

    if (moving) {
        for (let elem in elems) {
            for (let item in elems[elem]) {
                let obj = elems[elem][item];
                scaledObj = getScaledCoords(obj);

                let clickXinObj = scaledObj.x1 < e.offsetX &&
                scaledObj.x1 + scaledObj.xSize > e.offsetX;
                let clickYinObj = scaledObj.y1 < e.offsetY &&
                scaledObj.y1 + scaledObj.ySize > e.offsetY;

                if (clickXinObj && clickYinObj) {
                    if (!moveObj) {
                        mouseDown = true;
                        moveObj = obj;
                        moveObj.xDiff = e.offsetX - scaledObj.x1;
                        moveObj.yDiff = e.offsetY - scaledObj.y1;
                    }
                }
            }
        }
    }
}

canvas.onmousemove = function(e) {
    mouseX = e.offsetX;
    mouseY = e.offsetY;

    if (drawingShelf && mouseDown) {
        redraw(elems);

        ctx.strokeStyle = 'lightgray';
        ctx.strokeRect(clickInitX, clickInitY, mouseX - clickInitX, mouseY - clickInitY);

        obj = {'x1': clickInitX,
        'y1': clickInitY,
        'xSize': mouseX - clickInitX,
        'ySize': mouseY - clickInitY}
        drawShelfSize(getObjCoords(obj), obj);
    }

    if (moving && mouseDown && moveObj) {
        moveObj.x1 = ((mouseX - moveObj.xDiff) - xMid) / (scale / 100) + xMid;
        moveObj.y1 = ((mouseY - moveObj.yDiff) - yMid) / (scale / 100) + yMid;
        redraw();
    }

    if (drawingWall && wallCorner) {
        redraw();
        drawWall(getObjWallCoords(
            {'x1': wallCorner.x, 'y1': wallCorner.y, 'x2': e.offsetX, 'y2': e.offsetY}));
        }

    if (placingEntrance) {
        let closest = calcOpening({x: mouseX, y: mouseY});

        redraw();
        drawOpening({'x': scaleToObj(closest.x), 'y': scaleToObj(closest.y)}, 'yellow');
    }

    if (placingExit) {
        let closest = calcOpening({x: mouseX, y: mouseY});

        redraw();
        drawOpening({'x': scaleToObj(closest.x), 'y': scaleToObj(closest.y)}, 'red');
    }
}

canvas.onmouseup = function(e) {
    moving = mouseDown = false;
    moveObj = null;

    if (drawingShelf) {
        drawingShelf = false;

        let xSize = Math.abs(e.offsetX - clickInitX);
        let ySize = Math.abs(e.offsetY - clickInitY);

        if (xSize > MIN_SHELF_SIZE && ySize > MIN_SHELF_SIZE) {

            obj = {'x1': Math.min(clickInitX, e.offsetX),
            'y1': Math.min(clickInitY, e.offsetY),
            'xSize': xSize,
            'ySize': ySize}
            shelves.push(getObjCoords(obj));

            clickInitX = clickInitY = null;
        }
        redraw();
    }

    if (!drawingWall) canvas.style.cursor = 'auto';
}

function calcOpening(mouseLoc) {
    let distances = [];

    for (let wall of elems.walls) {
        wall = getScaledWallCoords(wall);

        let distToWall = distToLineSeg( mouseLoc,
            {x: wall.x1, y: wall.y1},
            {x: wall.x2, y: wall.y2});
        let pointOnWall = pointOnLineSeg(mouseLoc,
            {x: wall.x1, y: wall.y1},
            {x: wall.x2, y: wall.y2});

        distances.push({'dist': distToWall, 'x': pointOnWall.x, 'y': pointOnWall.y});
    }

    let closest = null;
    let max = Number.POSITIVE_INFINITY;
    for (let distant of distances) {
        if (distant.dist < max) {
            max = distant.dist;
            closest = distant;
        }
    }
    return closest;
}

function scaleToView(val) {
    return (val - xMid)  * (scale / 100) + xMid;
}

function scaleToObj(val) {
    return (val - xMid) / (scale / 100) + xMid;
}

function getScaledCoords(obj) {
    return {
        'x1': ((obj.x1 - xMid)  * scale / 100) + xMid,
        'y1': ((obj.y1 - yMid) * scale / 100) + xMid,
        'xSize': obj.xSize * scale / 100,
        'ySize': obj.ySize * scale / 100
    }
            }

function getScaledWallCoords(obj) {
    return {
        'x1': ((obj.x1 - xMid)  * scale / 100) + xMid,
        'y1': ((obj.y1 - yMid) * scale / 100) + xMid,
        'x2': ((obj.x2 - xMid)  * scale / 100) + xMid,
        'y2': ((obj.y2 - yMid) * scale / 100) + xMid
    }
}

function getObjWallCoords(obj) {
    return {
        'x1': (obj.x1 - xMid) / (scale / 100) + xMid,
        'y1': (obj.y1 - yMid) / (scale / 100) + xMid,
        'x2': (obj.x2 - xMid) / (scale / 100) + xMid,
        'y2': (obj.y2 - yMid) / (scale / 100) + xMid
    }
}

function getObjCoords(obj) {
    return {
        'x1': (obj.x1 - xMid) / (scale / 100) + xMid,
        'y1': (obj.y1 - yMid) / (scale / 100) + yMid,
        'xSize': obj.xSize / (scale / 100),
        'ySize': obj.ySize / (scale / 100)
    }
}

function getEntranceOrExitCoords(obj){
    return {
        'x': (obj.x - xMid) / (scale / 100) + xMid,
        'y': (obj.y - yMid) / (scale / 100) + yMid,
    }
}

/** Draws the grid */
function drawGrid(scale, size) {
    let xGrid = yGrid = scale / size;

    let x = xMid - Math.ceil(xMid / xGrid) * xGrid;
    let y = yMid - Math.ceil(yMid / yGrid) * yGrid;

    ctx.strokeStyle = 'rgb(86 86 86)';

    while (x < cwidth + xGrid) {
        while (y < cheight + yGrid) {
            ctx.strokeRect(x, y, xGrid, yGrid);
            y += yGrid;
        }

        x += xGrid;
        y = yMid - Math.ceil(yMid / yGrid) * yGrid;
    }
}

/**
* Draws the size of an object at a given location
* @param {int} size the size of the object in pixels
* @param {obj} loc the x,y location where the size should be drawn on the
*                  canvas
* @param {int} angle the angle of the text in radians
*/
function drawSize(size, loc, angle) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.lineWidth = 10;
    ctx.fillStyle = 'white';
    ctx.translate(loc.x, loc.y);
    ctx.rotate(angle);
    ctx.fillText(Math.round(size), 0, 0);
    ctx.restore();
}

/** Draws a shelf */
function drawShelf(shelfObj) {
    let scaledObj = getScaledCoords(shelfObj);
    ctx.fillRect(scaledObj.x1, scaledObj.y1, scaledObj.xSize, scaledObj.ySize);
    drawShelfSize(shelfObj, scaledObj);
}

/** Draws the shelf size */
function drawShelfSize(obj, scaledObj) {
    drawSize(obj.xSize,
        {x: scaledObj.x1 + scaledObj.xSize / 2,
         y: scaledObj.y1 + scaledObj.ySize - 5}, 0);
    drawSize(obj.ySize,
        {x: scaledObj.x1 + scaledObj.xSize - 5,
         y: scaledObj.y1 + scaledObj.ySize / 2}, -Math.PI / 2);
}

/** Draws a wall */
function drawWall(wallObj) {
    let obj = getScaledWallCoords(wallObj);
    ctx.save();
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#52514e';
    ctx.beginPath();
    ctx.moveTo(obj.x1, obj.y1);
    ctx.lineTo(obj.x2, obj.y2);
    ctx.stroke();
    ctx.restore();

    let angle = Math.atan2(obj.y2 - obj.y1, obj.x2 - obj.x1);
    let size = Math.sqrt(Math.pow(wallObj.x1 - wallObj.x2, 2)
    + Math.pow(wallObj.y1 - wallObj.y2, 2));

    drawSize(size, {x: (obj.x1 + obj.x2) / 2, y: (obj.y1 + obj.y2) / 2}, angle);
}

/**
* Draws all the elements in the elems obj
* @param {obj} opening the location of the opening
* @param {String} color the color for the opening on the canavs
*/
function drawOpening(opening, color) {
    ctx.beginPath();
    ctx.arc(scaleToView(opening.x), scaleToView(opening.y), 10, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
}

/**
* Draws all the elements in the elems obj
* @param {obj} elems the object containing elements to be drawn
*/
function draw(elems) {
    ctx.fillStyle = '#2F2E50';

    for (let elem in elems) {
        for (let item in elems[elem]) {

            let obj = elems[elem][item];

            if (elem == 'shelves') drawShelf(obj);
            if (elem == 'walls') drawWall(obj);
            if (elem == 'entrance') drawOpening(obj, 'yellow');
            if (elem == 'exit') drawOpening(obj, 'red');
        }
    }
}

/** Redraw the elements on the canvas */
function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(scale, gridSize);
    draw(elems);
}

redraw();
