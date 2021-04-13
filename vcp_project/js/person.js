const condition = {
    HEALTHY: 'healthy',
    ORIGINALLY_SICK: 'originally sick',
    NEWLY_SICK: 'newly sick'
}

/**
* An implementation of Actor representing a person shopping in the supermarket
*/
class Person extends Actor {

    /**
    * @constructor
    * @param {dict} config the configuration object for the simulation
    * @param {int} socialDistanceFactor which compliancy towards SD
    * @param {dict} stats the statistics object
    */
    constructor(config, socialDistanceFactor, stats, worker) {
        super(config);

        this.stats = stats;
        this.targets = new Array();
        this.currentTarget = -1;
        this.active = false;
        this.socialDistanceFactor = socialDistanceFactor;
        this.condition = condition.HEALTHY;
        this.radius = 10;
        this.activeTimer = null;
        this.pausedTimer = null;
        this.changeRoute = false;
        this.count = 0;
        this.path = null;
        this.pathFinding = false;
        this.findStart = 0;
        this.spriteNum = 1;
        this.spriteVer = 1;
        this.timer = 0;
        this.worker = worker;

        //set the radius of the person to simulate social distance
        this.socialDistance = this.radius * (4 + parseInt(socialDistanceFactor) * 4);
    }

    /**
    * create a visual representation of the person (a circle)
    * and add it to the physics engine
    * @param {int} x the x position in pixels
    * @param {int} y the y position in pixels
    * @param {Bodies.group} group the matter.js group on which the physics
    * are applied
    * @param {Engine} engine the matter.js engine
    *
    * @return the created body object
    */
    createBody(x, y, group, engine, scale, spriteNum) {
        this.spriteNum = spriteNum;
        this.spriteVer = 1;

        this.body = Bodies.circle(x, y, this.radius, {
            collisionFilter: { group: group },
            render: {
                sprite: {
                    texture: this.config.sprites['person' + String(this.spriteNum)
                    + '_' + String(this.spriteVer)],
                    xScale: .2,
                    yScale: .2
                }
            }
        });
        this.engine = engine;
        this.body.restitution = 0.2;
        this.body.object = this;
        this.currentScale = scale;
        return this.body;
    }

    /**
    * Update the person if anything interesting happens:
    * a person changes health condition
    * a person wants to find the next target
    */
    update(objects, shelves) {
        // Only update the person if it is active
        if (!this.active) return false;

        this.updateSprite();

        // Check if this person should still be active, because a person can
        // only be in the supermarket for a given amount of time as defined
        // in the configuration file
        if (this.activeTimer == null) {
            this.activeTimer = this.engine.timing.timestamp;
        } else {
            let elapsedTime = (this.engine.timing.timestamp - this.activeTimer) / 1000;

            if (elapsedTime > this.config.maxTimeForPersonToBeActive) {
                this.active = false;
                return false;
            }
        }

        // Pause the movement of the person if the simulation is paused
        // or finished
        if (this.pausedTimer > this.engine.timing.timestamp || this.paused) {
            Body.setVelocity(this.body, {x: 0, y:0});
            this.body.render.sprite.texture = null;
            switch (this.condition) {
                // TODO: delete this when fix TODO(kart)
                case condition.HEALTHY:
                this.body.render.fillStyle = 'rgb(58,136,254)';
                break;
                case condition.ORIGINALLY_SICK:
                this.body.render.fillStyle = 'rgb(255, 100, 100)';
                break;
                case condition.NEWLY_SICK:
                this.body.render.fillStyle = 'rgb(238, 197, 23)';
                break;
            }

            return true;
        }

        // Reset the timer that keeps track of the pause
        this.pausedTimer = null;

        // If the person does not have any more targets, it should not be
        // updated?
        if (!this.hasTarget()) {
            if (this.nextTarget() == null) {
                this.worker.terminate();
                return false;
            }
        }

        // If there is a target for this person, set a force in the direction
        // of the target, such that the person moves there
        if ((this.hasTarget() || !this.paused) && this.active) {
            this.setMovement(objects, shelves);
        }

        //spread the plume if the person is sick
        if(this.isSick() && !this.paused) this.spread();

        return true;
    }

    setMovement(objects, shelves) {
        if (this.pathFinding && this.timer - this.findStart > 500) {
            if (this.hasTarget()) {
                this.nextTarget();
            }
        }

        let nextVel = null;
        let goal = null;

        if (this.path == null) {
            nextVel = {x: 0, y: 0};
        } else {
            if (this.count + 2 < this.path.length - 1) {
                this.count += 2;
            } else {
                this.path = null;
                if (this.closeToTarget()) {
                    this.nextTarget();
                } else {
                    if (!this.pathFinding) this.findPath();
                }
                return;
            }
            goal = {
                x: this.path[this.count].x,
                y: this.path[this.count].y
            }
            nextVel = Vector.sub(goal, this.body.position);
        }

        let closeObj = this.closeToAny(objects, shelves);
        if (closeObj) {
            if (closeObj instanceof Person) {
                if (this.handleClose(closeObj, nextVel, shelves)) {
                    return;
                }
            }
        }

        Body.setVelocity(this.body, Vector.normalise(nextVel));
        Body.setAngle(this.body, Math.atan2(nextVel.y, nextVel.x));
    }

    closeToTarget() {
        return Vector.magnitude(Vector.sub(this.getCurrentTarget(), this.body.position)) < 50;
    }

    closeToAny(objects) {
        for (let obj of objects) {
            if (obj == this) continue;

            let vecToObj = this.distance(obj);
            let length = Vector.magnitude(vecToObj);

            if (this.socialDistance >= 0 && length <= this.socialDistance) {
                return obj;
            }
        }
        return null;
    }

    /**
    * check this customers and obj(possibly another customer) if the distance
    * is too close(with/without social distance)
    * @param {Actor} obj the other object
    *
    * @return whether this person is close to the other object
    */
    handleClose(obj, goal, shelves) {

        if (this.collisionThroughWall(obj, shelves)) {
            return false;
        }

        if (!this.isImune()) {
            let length = Vector.magnitude(this.distance(obj));
            this.evaluateSick(length, obj);
        }

        // If the other object is also a person
        let vec = this.distance(obj);
        let rotated = Vector.rotate(vec, Math.PI/1.5);
        Body.setVelocity(this.body, Vector.mult(Vector.normalise(rotated), 1.5));
        if (goal) {
            vec = goal;
        } else {
            vec = Vector.neg(vec);
        }
        Body.setAngle(this.body, Math.atan2(vec.y, vec.x));
        return true;
    }

    collisionThroughWall(obj, shelves) {
        let wall = false;
        for (let shelf of shelves) {
            if (lineRect(this.body.position, obj.body.position, shelf)) {
                wall = true;
                break;
            }
        }
        if (wall) {
            return true;
        }
        return false;
    }

    setSocialDistance(val) {
        this.socialDistanceFactor = val;
        //set the radius of the person to simulate social distance
        this.socialDistance = this.radius * (4 + parseInt(val) * 4);
    }

    /**
    * Update every step to record the path of a sick person and the possible
    * plumes spread by the person.
    * simulate the cough by comparing the possibility and the random(0,1)
    */
    spread(){
        let xPos = Math.floor(this.body.position.x);
        let yPos = Math.floor(this.body.position.y);

        this.place.storeHeatmap.add(xPos, yPos, 0.01);

        let shouldCough = Math.random() < this.config.coughProbability;

        if(shouldCough && this.isSick()) {
            this.place.storeHeatmap.add(xPos, yPos, 0.6);
        }
    }

    /**
    * Checks if this person has a target left to visit in the supermarket
    * @return boolean value indicating if there are any targets left
    */
    hasTarget() {
        return this.targets.length > 0;
    }

    /**
    * Sets the target this person needs to visit in the supermarket
    * @param {dict} targets a list of targets for this person
    */
    setTargets(targets) {
        this.targets = targets;
        this.currentTarget = 0;
        this.findPath();
    }

    /**
    * Gives the next target for this person
    * @return the next target in the list
    */
    nextTarget() {
        if (this.currentTarget < this.targets.length-1) {
            let curTarget = this.targets[this.currentTarget];
            this.pausedTimer = this.engine.timing.timestamp + curTarget.duration;
            this.currentTarget += 1;
            //if(Math.random()>0.8) {//a probability that the customer uses the path-finding
                this.findPath();
            //}
            return this.targets[this.currentTarget];
        }
        // If there are no more targets available, this person is done
        this.active = false;
    }

    findPath(){
        this.pathFinding = true;
        this.findStart = this.timer;
        if(this.active){
            let data = {
                'storeMap': this.place.storeMap.getGrid(),
                'start': {
                    'x': Math.floor(this.body.position.x),
                    'y': Math.floor(this.body.position.y)
                },
                'end': {
                    'x': Math.floor(this.getCurrentTarget().x + 7),
                    'y': Math.floor(this.getCurrentTarget().y + 7)
                }
            }
            if (this.worker != null) {
                this.worker.postMessage(data);
                var self = this;
                this.worker.onmessage = function(e) {
                    self.path = e.data;
                    self.pathFinding = false;
                }
            } else {
                this.path = this.slowAstar(data);
            }
            this.count = 0;
        }
    }

    slowAstar(data) {
        console.log(data);
        let graph = new Graph(data.storeMap, { diagonal: true });
        let start = graph.grid[data.start.x][data.start.y];
        let end = graph.grid[data.end.x][data.end.y];
        return astar.search(graph, start, end, { heuristic:  astar.heuristics.diagonal });
    }

    /**
    * return the last item in the stack if it is not the last one(because the
    * exit pushed in the end so it is on the top of the stack)
    * @return the current target
    */
    getCurrentTarget() {
        if (this.currentTarget >= 0 && this.currentTarget < this.targets.length) {
            return this.targets[this.currentTarget];
        }
        return null;
    }

    /**
    * check whether the person hit the target items
    * True : find the next target
    * False : keep on searching
    * @param {Actor} obj the object which this person collides with
    */
    collideWith(obj) {
        super.collideWith(obj);
        if (obj == this.getCurrentTarget()) {
            this.nextTarget();
        }
    }

    /**
    * to determine whether it is infected or originally sick
    * @param {boolean} newlyAcquired newly infected by other sick person
    *                                        in the supermarket
    * - True : set condition to NEWLY_SICK(yellow) sick newly++
    * - False : set condition to ORIGINALLY_SICK(red) sick enter++
    */
    startSick(newlyAcquired=true) {
        if (newlyAcquired) {
            this.stats.numSickPeopleAcquired += 1;
            this.condition = condition.NEWLY_SICK;
        } else {
            this.stats.numSickPeopleEntered += 1;
            this.condition = condition.ORIGINALLY_SICK;
        }
    }

    /**
    * reinitialize the person instance, set back all the parameters.
    */
    reset() {
        this.condition = condition.HEALTHY;
        this.currentTarget = -1;
        this.pausedTimer = null;
        this.active = true;
        this.activeTimer = null;
    }

    /**
    * Whether this person is sick or not
    * @return whether the person is sick
    */
    isSick() {
        let originallySick = this.condition == condition.ORIGINALLY_SICK;
        let newlySick = this.condition == condition.NEWLY_SICK;

        return originallySick || newlySick;
    }

    /**
    * Imune when entering or exiting the store otherwise everyone will be sick
    * as they are passing each other at the door
    * @return whether the person is at the entrance or exit
    */
    isImune() {
        let targetIsEntrance = this.currentTarget == 0;
        let targetIsExit = this.currentTarget == this.targets.length - 1

        return (targetIsEntrance || targetIsExit);
    }

    /**
    * Check if the person should become sick
    * @param {int} length distance from this person to the other person
    * @param {Person} obj the other person
    */
    evaluateSick(length, obj) {
        let inInfectionRadius = length < this.config.infectedRadius;
        let isHealthy = this.condition == condition.HEALTHY;
        let otherIsSick = obj.isSick();
        let heuristic = 1.0 - (((2-length/this.config.infectedRadius)*this.config.infectionProbabilityContact)-(this.config.mask*0.2));
        let getSickChance = Math.random() > heuristic;

        if (inInfectionRadius && isHealthy && otherIsSick && getSickChance) {
            this.startSick();
        }
    }

    /**
    * Update the sprites to immitate a walking animation
    */
    updateSprite() {
        this.timer += 1;

        if (this.timer % 30 == 0) {
            this.spriteVer = (this.spriteVer == 1) ? 2 : 1;
        }

        let spriteCond = (this.condition == condition.HEALTHY) ? 'person' : 'patient';
        if (spriteCond == 'patient') this.spriteNum = 1;
        let cart = (this.socialDistanceFactor == 0) ? '' : 'cart';

        let currentSprite = spriteCond + String(this.spriteNum) + '_' + String(this.spriteVer) + cart;
        this.body.render.sprite.texture = this.config.sprites[currentSprite];
    }
}
