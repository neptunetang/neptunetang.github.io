/**
 * An implementation of Actor representing a wall in a supermarket
 */
class Wall extends Actor {
    /**
     * @constructor
     * @param {dict} config the configuration file
     * @param {int} x1 top-left x position
     * @param {int} y1 top-left y position
     * @param {int} x2 bottom-right x position
     * @param {int} y2 bottom-right y position
     */
    constructor(config, x1, y1, x2, y2) {
        super(config);

        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }

    /**
     * create a visual representation of the wall (a rectangle)
     * and add it to the physics engine
     * @param {Bodies.group} group the matter.js group on which the physics
     * are applied
     * @return the created body object
     */
    createBody(group) {
        let centerX = (this.x2 + this.x1) / 2;
        let centerY = (this.y2 + this.y1) / 2;
        let length = Math.round(Math.sqrt(Math.pow((this.x2-this.x1), 2) +  Math.pow((this.y2-this.y1), 2)));
        let angle = (this.y2-this.y1) == 0? 0 : Math.atan2(this.y2-this.y1, this.x2-this.x1);

        this.body = Bodies.rectangle(centerX, centerY, length, 1,
            {
                isStatic: true,
                collisionFilter: {
                    group: group
                },
                angle: angle,
                render: {
                    fillStyle: 'rgb(255,255,255)'
                }
            })

        this.body.object = this;

        return this.body;
    }

    /**
     * Update the wall
     * EMPTY
     */
    update() {
        return true;
    }

}