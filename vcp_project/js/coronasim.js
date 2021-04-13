/**
 * The simulator class
 */
class CoronaSim {

    /**
     * @constructor
     * @param {obj} config the configuration of the simulation
     * @param {dict} stats object which holds statistics related to the sim
     */
    constructor(config, stats) {
        Matter.Resolver._restingThresh = 1;
        this.config = config;
        this.persons = new Array();
        this.stats = stats;

        this.stopFlag = false;
        this.currentScale = 1;

        // number of sick people out of 10, interesting magic number, 10
        // wont work :(
        this.sickFrequency = config.numberOfSickPeople / 9.99;
        this.accumSickFrequency = 0;

        // Create customers according to the config file
        for (let i=0; i< config.numPerson; i++) {
            let isCompliant = parseInt(config.socialDistanceCompliance);
            let myWorker = null;
            if (window.Worker) {
                function workerCros(url) {
                    const iss = "importScripts('" + url + "');";
                    return URL.createObjectURL(new Blob([iss]));
                }
                const workerUrl = workerCros(new URL('js/worker.js', window.location).href);
                myWorker = new Worker(workerUrl);
            }
            let person = new Person(config, isCompliant, stats, myWorker);
            this.persons.push(person);
        }

        // Create the supermarket place
        let canvas = document.getElementById("render");
        this.supermarket = new Supermarket(canvas, config, stats, 600);

        let heatmapSettings = [.2, 40, .9];
        if (config.mask) heatmapSettings[1] = 20;

        this.config.heatmapInstance = h337.create({
            container: document.getElementById('container'),
            maxOpacity: heatmapSettings[0],
            radius: heatmapSettings[1],
            blur: heatmapSettings[2],
        });

        // Start the update loop
        let self = this;
        let interval = 2000;
        setInterval(function(){ self.update(); }, interval);
    }

    /**
     * Reset the supermarket and clear the heatmap canvas
     */
    reset() {
        this.supermarket.reset();

        // Clear the heatmap instance
        this.config.heatmapInstance.setData({data:[]});
    }

    /**
     * Pause the simulation
     */
    stop(){
        this.stopFlag = true;
        this.supermarket.stop();
    }

    /**
     * Resume the simulation
     */
    resume(){
        this.stopFlag = false;
        this.supermarket.resume();
    }

    /**
     * Scale the world in the canvas with value
     * @param int value the multiplier
     */
    scale(val) {
      this.supermarket.scale(val / this.currentScale, val);
      this.currentScale = val;
    }

    setMaxPersonInPlace(val) {
        this.config.maxPersonInPlace = val;
    }

    setNumberOfSickPersons(val) {
        this.sickFrequency = val / 9.99;
    }

    setSocialDistanceCompliance(val) {
        let isCompliant = parseInt(val);

        for (let person of this.persons) {
            person.setSocialDistance(isCompliant);
        }
    }

    setMaskWear(val) {
        this.config.heatmapInstance.radius = (val) ? 20 : 40;
    }

    /**
     * Update function
     *
     * This function decides if new people should be added to the supermarket
     */
    update() {
        if(this.stopFlag) return;

        let supermarketIsFull = this.supermarket.numPerson()
                                        >= this.config.maxPersonInPlace;
        let maximumPeople = this.stats.numPeopleEntered
                                        >= this.config.numPerson;

        // If there are too many people, do not add more
        if (supermarketIsFull || maximumPeople) return;

        for (let person of this.persons) {
            if (person.place != this.supermarket) {
                this.supermarket.addPerson(person);

                // Decide if this person is supposed to be sick
                this.accumSickFrequency += this.sickFrequency;

                if (this.accumSickFrequency >= 1.0) {
                    this.accumSickFrequency -= 1.0;

                    // Add a new sick person into the supermarket
                    person.startSick(false);
                }
                this.stats.numPeopleEntered += 1;
                break;
            }
        }
    }
}
