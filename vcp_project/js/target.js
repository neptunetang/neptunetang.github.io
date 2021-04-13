/**
 * shapes and coordinate of the target
 * entrance/exit
 * items(shelf)
 */
class Target extends Actor {
    constructor(config, label, x, y) {
        super(config)
        this.x = x
        this.y = y
        this.label = label
    }

    createBody(group, colorStyle, sprite) {
        // define shape and the center coordinate of this object(body), which will be added later into the engine.world
        if (this.label == 'entrance' || this.label == 'exit') {
            this.body = Bodies.rectangle(this.x, this.y, 40, 40,
                {
                    isStatic: true, //cannot be moved/pushed/...
                    collisionFilter: {
                        group: group,
                        mask: 4
                    },
                    render: {
                        sprite: sprite,
                    }
                })
        } else if (this.label == 'item') {
            this.body = Bodies.rectangle(this.x, this.y, 10,10,
                {
                    isStatic: true,
                    collisionFilter: {
                        group: group,
                        mask: 4
                    },
                    render: {
                        sprite: sprite
                    }
                })
        } else if (this.label == 'hlong') {
            this.body = Bodies.rectangle(this.x, this.y, 240, 10,
                {
                    isStatic: true,
                    collisionFilter: {
                        group: group,
                        mask: 4
                    },
                    render: {
                        sprite: sprite
                    }
                })
        } else if (this.label == 'vlong'){
            this.body = Bodies.rectangle(this.x, this.y, 10, 120,
                {
                    isStatic: true,
                    collisionFilter: {
                        group: group,
                        mask: 4
                    },
                    render: {
                        sprite: sprite
                    }
                })
        } else if (this.label == 'hshort'){
            this.body = Bodies.rectangle(this.x, this.y, 60, 10,
                {
                    isStatic: true,
                    collisionFilter: {
                        group: group,
                        mask: 4
                    },
                    render: {
                        sprite: sprite
                    }
                })
        } else if (this.label == 'vshort'){
            this.body = Bodies.rectangle(this.x, this.y, 10, 60,
                {
                    isStatic: true,
                    collisionFilter: {
                        group: group,
                        mask: 4
                    },
                    render: {
                        sprite: sprite
                    }
                })
        }
        this.body.object = this
        return this.body
    }
    update() {
        return true;
    }
}