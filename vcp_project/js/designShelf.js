class designShelf extends Actor {
    constructor(config, x, y, xoffset, yoffset) {
        super(config)
        this.x = x
        this.y = y
        this.xoffset = xoffset
        this.yoffset = yoffset
    }

    createBody(group, colorStyle, sprite) {
        let centerX = this.x + this.xoffset / 2;
        let centerY = this.y + this.yoffset / 2;
        this.body = Bodies.rectangle(centerX, centerY, this.xoffset, this.yoffset,
            {
                isStatic: true, //cannot be moved/pushed/...
                collisionFilter: {
                    group: group,
                    mask: 4
                },
                render: {
                    sprite: sprite
                }
            })

        this.body.object = this
        return this.body
    }
    update() {
        return true
    }
}