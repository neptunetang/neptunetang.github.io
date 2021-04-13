/**
 * The configuration file
 *
 * This file is used when the simulation is started in index.js
 * This file only contains static values, the values that are derived from
 * the user inputs are added to the config object in index.js
 */

 // Sprite (components) directory
let spriteDir = 'static/images/';

let spriteExt = '.png';

let config = {
    heatmapInstance: null,

    numPerson: 100,

    // Size of the supermarket in pixels
    // should be same as the window, otherwise the heatmap won't work properly
    stageWidth: 600,
    stageHeight: 600,

    simulationDuration: 180,

    // Within this distance, you are possibly being infected
    infectedRadius: 60,

    // 5% chance of getting infected if within infected radius
    infectionProbabilityContact: 0.05,

    // cough probability per step
    coughProbability: 1.0/3600,

    // How long each person is in the store in total (in seconds)
    maxTimeForPersonToBeActive: 300,

    // 2-d array containing for each pixel location of the supermarket
    // how many covid particles there are
    store: new Array(),

    // Sprites
    sprites: {
        patient1_1: spriteDir + 'patient1_1' + spriteExt,
        patient1_2: spriteDir + 'patient1_2' + spriteExt,
        patient1_1cart: spriteDir + 'patient1_1-cart' + spriteExt,
        patient1_2cart: spriteDir + 'patient1_1-cart' + spriteExt,
        person1_1: spriteDir + 'person1_1' + spriteExt,
        person1_2: spriteDir + 'person1_2' + spriteExt,
        person1_1cart: spriteDir + 'person1_1-cart' + spriteExt,
        person1_2cart: spriteDir + 'person1_2-cart' + spriteExt,
        person2_1: spriteDir + 'person2_1' + spriteExt,
        person2_2: spriteDir + 'person2_2' + spriteExt,
        person2_1cart: spriteDir + 'person2_1-cart' + spriteExt,
        person2_2cart: spriteDir + 'person2_2-cart' + spriteExt,
        person3_1: spriteDir + 'person3_1' + spriteExt,
        person3_2: spriteDir + 'person3_2' + spriteExt,
        person3_1cart: spriteDir + 'person3_1-cart' + spriteExt,
        person3_2cart: spriteDir + 'person3_2-cart' + spriteExt,
        person4_1: spriteDir + 'person4_1' + spriteExt,
        person4_2: spriteDir + 'person4_2' + spriteExt,
        person4_1cart: spriteDir + 'person4_1-cart' + spriteExt,
        person4_2cart: spriteDir + 'person4_2-cart' + spriteExt,
    },


    // The location of the entrance
    entrance: {
        x: 100,
        y: 540,
        sprite: { xScale: 0.5, yScale: 0.5 }
    },

    // The location of the exit
    exit: {
        x: 500,
        y: 540,
        duration: 20,
        sprite: { xScale: 0.5, yScale: 0.5 }
    },

    // The locations of the shelves
    shelf:[[{
            label: 'hlong', x: 150, y: 230, duration: 1,
            sprite: { xScale: 0.3, yScale: 0.3 }
        },
        {
            label: 'hlong', x: 150, y: 310, duration: 1,
            sprite: { xScale: 0.3, yScale: 0.3 }
        },
        {
            label: 'hlong', x: 150, y: 150, duration: 1,
            sprite: { xScale: 0.3, yScale: 0.3 }
        },
        {
            label: 'hlong', x: 150, y: 70, duration: 1,
            sprite: {  xScale: 0.3, yScale: 0.3 }
        },
        {
            label: 'vlong', x: 520, y: 130, duration: 1,
            sprite: { xScale: 0.3, yScale: 0.3 }
        },
        {
            label: 'vlong', x: 450, y: 130, duration: 1,
            sprite: { xScale: 0.3, yScale: 0.3 }
        },
        {
            label: 'vlong', x: 380, y: 130, duration: 1,
            sprite: { xScale: 0.3, yScale: 0.3 }
        },
        {
            label: 'vlong', x: 520, y: 330, duration: 1,
            sprite: { xScale: 0.3, yScale: 0.3 }
        },
        {
            label: 'vlong', x: 450, y: 330, duration: 1,
            sprite: { xScale: 0.3, yScale: 0.3 }
        },
        {
            label: 'vlong', x: 380, y: 330, duration: 1,
            sprite: { xScale: 0.3, yScale: 0.3 }
        }],
        [{
            label: 'hlong', x: 150, y: 60, duration: 1,
            sprite: { xScale: 0.3, yScale: 0.3 }
        },
        {
            label: 'hlong', x: 150, y: 120, duration: 1,
            sprite: { xScale: 0.3, yScale: 0.3 }
        },
        {
            label: 'hlong', x: 150, y: 180, duration: 1,
            sprite: { xScale: 0.3, yScale: 0.3 }
        },
        {
            label: 'hlong', x: 150, y: 240, duration: 1,
            sprite: {  xScale: 0.3, yScale: 0.3 }
        },
        {
            label: 'hlong', x: 150, y: 300, duration: 1,
            sprite: { xScale: 0.3, yScale: 0.3 }
        },
        {
            label: 'hlong', x: 150, y: 360, duration: 1,
            sprite: { xScale: 0.3, yScale: 0.3 }
        },
        {
            label: 'hlong', x: 150, y: 420, duration: 1,
            sprite: {  xScale: 0.3, yScale: 0.3 }
        },
        {
            label: 'vlong', x: 500, y: 130, duration: 1,
            sprite: { xScale: 0.3, yScale: 0.3 }
        },
        {
            label: 'vlong', x: 450, y: 130, duration: 1,
            sprite: { xScale: 0.3, yScale: 0.3 }
        },
        {
            label: 'vlong', x: 400, y: 130, duration: 1,
            sprite: { xScale: 0.3, yScale: 0.3 }
        },
        {
            label: 'vlong', x: 500, y: 330, duration: 1,
            sprite: { xScale: 0.3, yScale: 0.3 }
        },
        {
            label: 'vlong', x: 450, y: 330, duration: 1,
            sprite: { xScale: 0.3, yScale: 0.3 }
        },
        {
            label: 'vlong', x: 400, y: 330, duration: 1,
            sprite: { xScale: 0.3, yScale: 0.3 }
        },
        {
            label: 'hshort', x: 500, y: 450, duration: 1,
            sprite: { xScale: 0.3, yScale: 0.3 }
        },
        {
            label: 'hshort', x: 400, y: 450, duration: 1,
            sprite: { xScale: 0.3, yScale: 0.3 }
        }],
        [{
            label: 'hlong', x: 150, y: 60, duration: 1,
            sprite: { xScale: 0.3, yScale: 0.3 }
        },
        {
            label: 'hlong', x: 150, y: 120, duration: 1,
            sprite: { xScale: 0.3, yScale: 0.3 }
        },
        {
            label: 'hlong', x: 150, y: 180, duration: 1,
            sprite: { xScale: 0.3, yScale: 0.3 }
        },
        {
            label: 'hlong', x: 150, y: 240, duration: 1,
            sprite: {  xScale: 0.3, yScale: 0.3 }
        },
        {
            label: 'hlong', x: 150, y: 300, duration: 1,
            sprite: { xScale: 0.3, yScale: 0.3 }
        },
        {
            label: 'hlong', x: 150, y: 360, duration: 1,
            sprite: { xScale: 0.3, yScale: 0.3 }
        },
        {
            label: 'hlong', x: 150, y: 420, duration: 1,
            sprite: {  xScale: 0.3, yScale: 0.3 }
        },
        {
            label: 'vlong', x: 500, y: 130, duration: 1,
            sprite: { xScale: 0.3, yScale: 0.3 }
        },
        {
            label: 'vlong', x: 450, y: 130, duration: 1,
            sprite: { xScale: 0.3, yScale: 0.3 }
        },
        {
            label: 'vlong', x: 400, y: 130, duration: 1,
            sprite: { xScale: 0.3, yScale: 0.3 }
        },
        {
            label: 'vlong', x: 500, y: 330, duration: 1,
            sprite: { xScale: 0.3, yScale: 0.3 }
        },
        {
            label: 'vlong', x: 450, y: 330, duration: 1,
            sprite: { xScale: 0.3, yScale: 0.3 }
        },
        {
            label: 'vlong', x: 400, y: 330, duration: 1,
            sprite: { xScale: 0.3, yScale: 0.3 }
        },
        {
            label: 'hshort', x: 500, y: 450, duration: 1,
            sprite: { xScale: 0.3, yScale: 0.3 }
        },
        {
            label: 'hshort', x: 400, y: 450, duration: 1,
            sprite: { xScale: 0.3, yScale: 0.3 }
        },
        {
            label: 'vshort', x: 330, y: 100, duration: 1,
            sprite: { xScale: 0.3, yScale: 0.3 }
        },
            {
            label: 'vshort', x: 330, y: 200, duration: 1,
            sprite: { xScale: 0.3, yScale: 0.3 }
        },
            {
            label: 'vshort', x: 330, y: 300, duration: 1,
            sprite: { xScale: 0.3, yScale: 0.3 }
        },
            {
            label: 'vshort', x: 330, y: 400, duration: 1,
            sprite: { xScale: 0.3, yScale: 0.3 }
        }]
    ],
    design:[],



}
