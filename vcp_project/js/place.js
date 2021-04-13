let Engine = Matter.Engine,
    Render = Matter.Render,
    Composite = Matter.Composite,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Vector = Matter.Vector,
    Runner = Matter.Runner;
/**
 * An implementation of Place representing the supermarket environment
 */
class Place {

    /**
     * @constructor
     * @param {canvas} canvas the canvas element
     * @param {dict} config the configuration file
     * @param {dict} stats the statistics object
     */
    constructor(canvas, config, stats, size) {
        this.canvas = canvas;
        this.stats = stats;
        this.config = config;

        this.currentScale = 1;
        this.originScale = 1;//the scale value on the html page
        this.paused = false;

        this.objects = new Array();
        this.shelves = new Array();
        this.renderBodies = new Array();

        this.collidingGroup = Body.nextGroup(false); // persons/target
        this.nonCollidingGroup = Body.nextGroup(true); // entrance/exit

        this.engine = Engine.create();
        this.engine.timing.timeScale = 1;
        this.engine.world.gravity.scale = 0;

        this.render = Render.create({
            canvas: canvas,
            engine: this.engine,
            options: {
                height: size * this.currentScale,
                width: size * this.currentScale,
                wireframes: false
            }
        });

        this.runner = Engine.run(this.engine); // run the engine
        Render.run(this.render); // run the renderer

        let self = this;
        Matter.Events.on(this.engine, 'collisionStart', function (event) {
            self.ifCollision(event);
        });
        Matter.Events.on(this.engine, 'beforeUpdate', function (event) {
            self.ifUpdate();
        });
        Matter.Events.on(this.render, 'afterRender', function (event) {
            self.ifRendering();
        });
    }

    /** Reset the current simulation and clear the canvas */
    reset() {
        Composite.clear(this.engine.world);
        Engine.clear(this.engine);
        this.render.canvas = null;
        this.render.context = null;
        this.render.texture = {};
        Render.stop(this.render);
        Runner.stop(this.runner);
    }

    /** Stop the current simulation and communicate this to all the objects */
    stop(){
        this.paused = true;

        for (let obj of this.objects) {
            if (obj instanceof Person) {
                obj.pause();
            }
        }
    }

    /** Resume the simulation and communicate this to all the objects */
    resume(){
        this.paused = false;

        for (let obj of this.objects) {
            if (obj instanceof Person) {
                obj.resume();
            }
        }
    }

    /**
    * Scale the place in the canvas with value
    * @param int val1 the multiplier
    */
    scale(val1, val2) {
        this.currentScale = val1;
        Composite.scale(this.engine.world,
            this.currentScale,
            this.currentScale, {
                x: this.CANVAS_SIZE / 2,
                y: this.CANVAS_SIZE / 2});
        this.originScale = val2;
        this.config.heatmapInstance._config.radius *= this.currentScale;
        for (let obj of this.objects) {
            if (obj instanceof Person) {
                obj.currentScale = this.originScale;
            }
        }
    }

    addToObjects(obj) {
        this.objects.push(obj);
    }

    addToRenderBodies(obj) {
        this.renderBodies.push(obj);
        Composite.add(this.engine.world, obj);
    }

    /**
    * update when:
    * a target(item/shelf/entrance/exit) is added
    * a new person is added
    * a person's state change from HEALTHY to NEWLY-SICK
    */
    ifUpdate() {
        // Do not update if this place is not active
        if (!this.active) return;

        // Update the list of render bodies and objects. New objects are added
        // if that object must be updated
        let newRenderBodies = new Array();
        let newObjects = new Array();

        for (let obj of this.objects) {
            if (obj.update(this.objects, this.shelves)) {
                newObjects.push(obj);
                newRenderBodies.push(obj.getBody());
            } else {
                obj.setPlace(null);
                Matter.World.remove(this.engine.world, obj.body);
                Matter.World.remove(this.render.engine.world, obj.body);
            }
        }
        this.renderBodies = newRenderBodies;
        this.objects = newObjects;
    }

    /**
     * dealing with the collision event, it will call different collideWith() depending on the type of our pair
     * 1. person with person -> this will not really happen(because in real life you will not run into someone in the supermarket :p)
     *  so we have another function to push each other away(more detailed in Person.js @function closeTo())
     * 2. person with target(items) -> pop up the current target in the list and go for the next one
     * 3. person with EXIT -> remove the person from the world(shopping finish)
     * @param {Matter.event} event an event generated by the physics engine
     */
    ifCollision(event) {
        for (let pair of event.pairs) {
            let bodyA = pair.bodyA.object;
            let bodyB = pair.bodyB.object;

            bodyA.collideWith(bodyB);
            bodyB.collideWith(bodyA);
        }
    }

    /**
     * during the rendering(simulation), we need to determine whether the simulation is done(e.g. all the customers have visited the supermarket/ time is up).
     * Check the current progress >= 100%
     * True: we stop our simulation
     * False: print the heatmap whenever the maximum plumes is found
     * @param {Matter.event} event an event generated by the physics engine
     */
    ifRendering(event) {
        let infectionRate = 0;
        if (this.stats.numPeopleEntered > 0) {
            // show the rate of infection (newly infected / total healthy people entered the shop)
            infectionRate = Math.round(this.stats.numSickPeopleAcquired * 100
                / (this.stats.numPeopleEntered - this.stats.numSickPeopleEntered));
        }

        let context = this.render.context;
        let progress = (this.engine.timing.timestamp / 10) /
                              this.config.simulationDuration;

        this.engine.timing.timeScale = (this.paused) ? 0 : 1;

        context.font = "13px Arial";
        let finalProgress = 100;

        // Deactivate if the simulation is done
        if (progress >= finalProgress) {
            this.active = false;
            context.fillStyle = "rgba(0, 0, 0, " + 0.8 + ")";
            context.fillRect(0, 0, this.config.stageWidth, this.config.stageHeight);

            context.font = "30px Arial";
            context.fillStyle = "rgb(238, 197, 23)";
            let newInfectionStr = "Infection Rate " + infectionRate + "%";
            context.fillText(newInfectionStr, 195, 150);
        }

        else {
            if (!this.paused) {
              // Update the heatmap
              this.config.heatmapInstance.setData(this.storeHeatmap.getHeatmapData());
            }

            let offset = 30;
            context.font = "23px Arial";
            context.fillStyle = "Gray";
            context.fillText("Entered:", offset - 10, 30);
            context.fillStyle = "rgb(58, 136, 254)";
            context.fillText("Healthy:", 130 + offset, 30);
            context.fillStyle = "rgb(255, 100, 100)";
            context.fillText("Sick:", 265 + offset, 30);
            context.fillStyle = "rgb(238, 197, 23)";
            context.fillText("Infected:", 355 + offset, 30);

            context.font = "23px Arial";
            context.fillStyle = "rgb(220, 220, 220)";
            context.fillText(this.stats.numPeopleEntered, 80 + offset, 30);
            context.fillText(this.stats.numPeopleEntered - this.stats.numSickPeopleEntered, 220 + offset, 30);
            context.fillText(this.stats.numSickPeopleEntered, 320 + offset, 30);
            let curNewInfectionStr = this.stats.numSickPeopleAcquired;
            context.fillText(curNewInfectionStr, 445 + offset, 30);
        }
    }
}