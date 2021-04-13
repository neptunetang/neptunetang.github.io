
/**
 * Main
 *
 * From this file, the simulation is run.
 * This file contains the config object and creates an instance of the
 * simulator.
 */

/**
 * get the parameters from html(user input)
 */
let socialDistanceRadio = document.getElementById("shoppingCartCheck");
let maskWearCheck = document.getElementById("maskWearCheck")

let maxPersonPerSiteSlider = document.getElementById("maxPersonPerSiteSlider");
let maxPersonPerSiteOutput = document.getElementById("maxPersonPerSiteOutput");

let numberOfSickPersonSlider = document.getElementById("numberOfSickPeopleEnteredSlider");
let numberOfSickPersonOutput = document.getElementById("numberOfSickPeopleEnteredOutput");

let shelfSlider = document.getElementById("shelvesSlider");
let shelfOutput = document.getElementById("shelvesOutput");

let reset = document.getElementById('reset');

let resume = document.getElementById("continue");
let pause = document.getElementById("pause");
let restartButton = document.getElementById("restartSimulation");

let scaleRange = document.getElementById('scaleRange');
let scaleRangeVal = document.getElementById('scaleRangeVal');

let sim = null;

let storage = new LocalStorage();

/**
 * Start the simulation
 */
function start() {
    /**
     * this will be used later for the statistics showing in the window
     * currently it is not shown but it is calculated properly
     */
    let stats = {
        numPeopleEntered: 0,
        numSickPeopleEntered: 0,
        numSickPeopleAcquired: 0
    };

    let sdCompliance = (socialDistanceRadio.checked) ? 1 : 0;
    let mask = (maskWearCheck.checked) ? 1 : 0;

    // Completing the configuration with the user input

    //indicating whether we apply the social distance(shopping kart)
    config.socialDistanceCompliance = sdCompliance;
    config.mask = mask;

    config.numberOfSickPeople = numberOfSickPersonSlider.value; // out of 10
    config.maxPersonInPlace =  maxPersonPerSiteSlider.value;
    config.numShelves = shelfSlider.value;

    // Reset the simulation if it already exists
    if(sim != null) sim.reset();
    if (storage.hasDesign()) config = storage.getDesign(config);

    sim = new CoronaSim(config, stats);
}

// Update the text according to the value of the sliders
maxPersonPerSiteSlider.oninput = function() {
    maxPersonPerSiteOutput.innerHTML = this.value + " in the supermarket";
    if (sim) sim.setMaxPersonInPlace(this.value);
}

numberOfSickPersonSlider.oninput = function() {
    numberOfSickPersonOutput.innerHTML = this.value + " out of 10";
    if (sim) sim.setNumberOfSickPersons(this.value);
}

shelfSlider.onchange = function(e) {
    shelfOutput.innerHTML = this.value + " shelves in total";
}

scaleRange.onclick = function(e) {
    if (!sim) {
        e.preventDefault();
        scaleRange.value = 100;
    }
}

scaleRange.onchange = function(e) {
    if (sim) {
        sim.scale(scaleRange.value/100);
        scaleRangeVal.innerHTML = scaleRange.value + "%";
    }
}

socialDistanceRadio.onchange = function(e) {
    if (sim) sim.setSocialDistanceCompliance((this.checked) ? 1 : 0);
}

maskWearCheck.onchange = function(e) {
    if (sim) sim.setMaskWear((this.checked) ? 1 : 0);
}

resume.onclick = function (){
    sim.resume();
}

pause.onclick = function (){
    sim.stop();
}

restartButton.onclick = function() {
    start();
}

reset.onclick = function (){
    storage.clear();
    start();
}

window.addEventListener("beforeunload", () => localStorage.clear());
