/**
 * The environment in which actors interact with each other
 */
class Supermarket extends Place {

    CANVAS_SIZE = 600;

    /**
     * @constructor
     * @param {canvas} canvas the canvas element
     * @param {dict} config the configuration file
     * @param {dict} stats the statistics object
     */
    constructor(canvas, config, stats, size) {
        super(canvas, config, stats, size);
        this.active = true;

        this.targets = new Array();
        this.items = new Array();
        this.targetIndexes = new Array();

        this.storeHeatmap = new StoreHeatmap(config.stageWidth, config.stageHeight);
        this.storeMap = new StoreMap(config.stageWidth, config.stageHeight);

        if(localStorage.getItem("design") != "1"){
            this.loadDefaultLayout();
        } else {
            this.loadDesignedLayout();
        }
        this.loadEntranceExits();
    };

    addLongShelveToStore(shelf, x1, x2, y1, y2) {
        this.shelves.push({
            x1: shelf.x + x1,
            y1: shelf.y + y1,
            x2: shelf.x + x2,
            y2: shelf.y + y2});
        for (let m = x1; m < x2; m++){
            for (let n = y1; n < y2; n++) {
                this.storeMap.clear(shelf.x + m, shelf.y + n);
            }
        }
    }

    addWideShelveToStore(shelf, x1, x2, y1, y2) {
        this.shelves.push({
            x1: shelf.x + y1,
            y1: shelf.y + x1,
            x2: shelf.x + y2,
            y2: shelf.y + x2});
        for (let m = x1; m < x2; m++){
            for (let n = y1; n < y2; n++){
                this.storeMap.clear(shelf.x + n, shelf.y + m);
            }
         }
    }

    loadDefaultLayout() {
        let index = (config.numShelves - 10) / 5;
        this.generateTargets(index);

        for (let shelf of config.shelf[index]) {
            this.addTarget(new Target(this.config, shelf.label, shelf.x, shelf.y, shelf.duration),
                false, this.collidingGroup, 'brown', shelf.sprite);

            if (shelf.label == 'hlong') {
                this.addLongShelveToStore(shelf, -130, 130, -6, 6);
            } else if (shelf.label == 'vlong'){
                this.addWideShelveToStore(shelf, -130, 130, -6, 6);
            } else if (shelf.label == 'hshort'){
                this.addLongShelveToStore(shelf, -70, 70, -6, 6);
            } else if (shelf.label == 'vshort'){
                this.addWideShelveToStore(shelf, -70, 70, -6, 6);
            }
        }

        for (var i=0; i<this.items.length; i++) {
            this.addTarget(new Target(this.config, this.items[i].label, this.items[i].x, this.items[i].y, this.items[i].duration),
                true, this.collidingGroup, 'brown', this.items[i].sprite);
        }
        let wall1 = new Wall(this.config, 0, config.stageHeight, config.stageWidth, config.stageHeight);
        let wall2 = new Wall(this.config, 0, 0, 0, config.stageHeight);
        let wall3 = new Wall(this.config, config.stageWidth, 0, config.stageWidth, config.stageHeight);
        let wall4 = new Wall(this.config, 0, 0, config.stageWidth, 0);

        this.addToRenderBodies(wall1.createBody(this.collidingGroup));
        this.addToRenderBodies(wall2.createBody(this.collidingGroup));
        this.addToRenderBodies(wall3.createBody(this.collidingGroup));
        this.addToRenderBodies(wall4.createBody(this.collidingGroup));

        this.addToObjects(wall1);
        this.addToObjects(wall2);
        this.addToObjects(wall3);
        this.addToObjects(wall4);

        this.storeMap.clearBorder();
    }

    loadDesignedLayout() {
        for (let i = 0; i < this.config.design.length; i++){
            if (this.config.design[i].label == "wall") {

                let wall = new Wall(this.config, this.config.design[i].x1,  this.config.design[i].y1, this.config.design[i].x2,this.config.design[i].y2);

                this.addToRenderBodies(wall.createBody(this.collidingGroup));
                this.addToObjects(wall);

                let length = Math.round(Math.sqrt(Math.pow(( this.config.design[i].x2- this.config.design[i].x1), 2) +  Math.pow(( this.config.design[i].y2- this.config.design[i].y1), 2)));
                let scaleX = (this.config.design[i].x2- this.config.design[i].x1)/length
                let scaleY = (this.config.design[i].y2- this.config.design[i].y1)/length
                let startX = Math.min(this.config.design[i].x1, this.config.design[i].x2)
                let startY = Math.min(this.config.design[i].y1, this.config.design[i].y2)

                for (let m = 0; m < Math.floor(length); m++){
                    if (Math.floor(startX + m * scaleX) >= 0 && Math.floor(startY + m * scaleY) >= 0)
                        this.storeMap.clear(Math.floor(startX + m * scaleX),
                                            Math.floor(startY + m * scaleY));
                }

            } else if (this.config.design[i].label == "shelf") {

                this.addTarget(new designShelf(this.config, this.config.design[i].x, this.config.design[i].y, this.config.design[i].x_offset, this.config.design[i].y_offset),
                false, this.collidingGroup, 'brown', { xScale: 0.3, yScale: 0.3 });

                for (let m = this.config.design[i].x - 3; m < this.config.design[i].x_offset + 3; m++) {
                    for (let n = this.config.design[i].x - 3; n < this.config.design[i].y_offset + 3; n++){
                        this.storeMap.clear(this.config.design[i].x + m,
                                            this.config.design[i].y + n);
                    }
                }

                let random = Math.max(1, Math.round(Math.random() * 5));
                for (var j = 1; j < random; j++) {
                    let itemX = 0;
                    let itemY = 0;
                    let div = Math.max(this.config.design[i].x_offset, this.config.design[i].y_offset) / (random + 1);

                    if (this.config.design[i].x_offset > this.config.design[i].y_offset) {
                        itemX = this.config.design[i].x + div * j;
                        itemY = this.config.design[i].y + 5;
                    } else {
                        itemX = this.config.design[i].x + 5;
                        itemY = this.config.design[i].y + div * j;
                    }
                    let item = {
                      label: 'item', x: itemX, y: itemY, duration: 1,
                      sprite: { xScale: 0.3, yScale: 0.3 }
                    }
                    this.items.push(item);
                }
            }
            for (var k = 0; k < this.items.length; k++) {
                this.addTarget(new Target(this.config, this.items[k].label, this.items[k].x, this.items[k].y, this.items[k].duration),
                true, this.collidingGroup, 'brown', this.items[k].sprite);
            }
        }
    }

    loadEntranceExits() {
        let entrance = new Target(this.config, 'entrance',
                                  this.config.entrance.x,
                                  this.config.entrance.y)
        let exit = new Target(this.config, 'exit',
                              this.config.exit.x,
                              this.config.exit.y)

        this.entranceTarget = this.addTarget(entrance, false,
                                            this.nonCollidingGroup,
                                            'darkgreen',
                                            config.entrance.sprite);
        this.exitTarget = this.addTarget(exit, false,
                                            this.collidingGroup,
                                            'darkgreen',
                                            config.exit.sprite);
    }

    /**
     * generate random target in the supermarket
     * (now it is totally randomized and thus showing circles everywhere)
     */
    generateTargets(index){
        let itemX = 0;
        let itemY = 0;
        let div = 0;

        for(var i = 0; i < config.shelf[index].length; i++){
            let random = Math.max(1, Math.round(Math.random() * 5));

            for(var j=0; j<random; j++){
                switch (config.shelf[index][i].label){
                    case "hlong":
                        div = 100 / random;
                        itemX = config.shelf[index][i].x - 60 + div * j;
                        itemY = config.shelf[index][i].y;
                        break;
                    case "hshort":
                        div = 60 / random;
                        itemX = config.shelf[index][i].x - 30 + div * j;
                        itemY = config.shelf[index][i].y;
                        break;
                    case "vlong":
                        div = 100 / random;
                        itemX = config.shelf[index][i].x;
                        itemY = config.shelf[index][i].y - 60 + div * j;
                        break;
                    case "vshort":
                        div = 60 / random;
                        itemX = config.shelf[index][i].x;
                        itemY = config.shelf[index][i].y - 30 + div * j;
                        break;
                }
                let item = {
                  label: 'item', x: itemX, y: itemY, duration: 1,
                  sprite: {}
                }
                this.items.push(item);
            }
        }
    }

    /**
     * Count the number of customers that are currently active
     * @return the amount of Person object active in the place
     */
    numPerson() {
        let total = 0;

        for (let obj of this.objects) {
            if (obj instanceof Person) total += 1;
        }

        return total;
    }

    /**
     * add target(entrance/exit OR items) into the world and the variables
     * @param {designShelf} target the targets for this object
     * @param {boolean} items whether this target has items (e.g. is a shelve)
     *                          or not (so entrance/exit)
     * @param {Bodies.group} collidingGroup the matter.js group
     * @param {string} colorStyle string indicating a color
     * @param {{xScale: number, yScale: number}} sprite dictionary indicating the sprite properties
     *
     * @return the provided target
     */
    addTarget(target, items, collidingGroup, colorStyle, sprite) {
        if (items) {
            this.targets.push(target);
            this.targetIndexes.push(this.targetIndexes.length);
        }
        this.addToRenderBodies(target.createBody(collidingGroup, colorStyle, sprite));

        return target;
    }

    /**
     * initialize a person and add it into the world
     * @param {Person} person the person that needs to be added
     * initialize: a random start position within the entrance area
     *             a starting speed and direction
     *             a shuffled shopping list(with a exitTarget in the end)
     */
     addPerson(person) {

        if(!this.paused) {
            // Add the person to this place
            person.setPlace(this);
            person.reset();
            this.addToObjects(person);

            let x = this.config.entrance.x;
            let y = this.config.entrance.y;

            x = this.CANVAS_SIZE*Math.abs((this.originScale-1)/2)+(x*this.originScale);
            y = this.CANVAS_SIZE*Math.abs((this.originScale-1)/2)+(y*this.originScale);

            let randomPersonSprite = randomIntInRange(1, 4);

            let newBody = person.createBody(x, y,
                                            this.collidingGroup,
                                            this.engine,
                                            this.originScale,
                                            randomPersonSprite);

            Matter.Body.scale(newBody, this.currentScale, this.currentScale);
            this.addToRenderBodies(newBody);
            Composite.add(this.engine.world, new Array(newBody));

            // Create new target waypoints for this person
            const shuffled = this.targets.sort(() => 0.5 - Math.random());
            let numTargetsToVisit = Math.max(2, Math.random() * 5);
            let targets = shuffled.slice(0, numTargetsToVisit);

            // Add the exit at the end of the target list
            targets.push(this.exitTarget);

            // Give the targets to the person
            person.setTargets(targets);
        }
    }
}
