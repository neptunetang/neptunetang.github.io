/**
 * An interface class for all objects that possibly need to interact with
 * other objects
 *
 * Can be implemented by extending
 */
class Actor {

    /**
     * @constructor
     * @param {dict} config the configuration object for the simulation
     */
    constructor(config) {
        // The visual representation of the actor
        // (i.e. a circle, rectangle etc.)
        this.body = null;

        // This variable can be 'null' or the instance of the supermarket
        // to check whether this actor is in the supermarket or not
        this.place = null;

        // The configuration file
        this.config = config;

        this.paused = false;
    }

    /**
     * Calculate the  vector to another actor
     * @param {Actor} actor another actor
     * @return the vector from this actor to the other actor
     */
    distance(actor) {
        return Vector.sub(actor.body.position, this.body.position);
    }

    /**
     * interface
     */
    collideWith(obj) {
    }

    /**
     * interface
     */
    closeTo(obj) {
    }


    pause() {
        this.paused = true;
    }

    resume() {
        this.paused = false;
    }

    /**
     * @return the body object of this actor
     */
    getBody() {
        return this.body;
    }

    /**
     * Set the position of this actor on the canvas
     * @param {obj} place the new position of the actor
     */
    setPlace(place) {
        this.place = place;
    }
}
