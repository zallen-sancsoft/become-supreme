// Global Constants
export const NUM_CUBES = 50;
export const MAP_WIDTH = 2000;
export const MAX_DEPTH = 2500;
export const START_SAFE_ZONE = 1000;
export const canvas = document.getElementById('gameCanvas');
export const ctx = canvas.getContext('2d');

// Locate and update the LEVELS array inside config.js:
export const LEVELS = [
    {
        scoreRequired: 0,
        cubeSpeed: 6,
        spawnSpread: 4000,
        skyColor: '#E65C00',
        groundColor: '#E6A15C',
        avoidShape: 'cube' // Level 1 uses standard cubes
    },
    {
        scoreRequired: 500,
        cubeSpeed: 8,
        spawnSpread: 4000,
        skyColor: '#A8DADC',
        groundColor: '#4F7942',
        avoidShape: 'triangle' // Level 2 spawns sharp spikes/pyramids
    },
    {
        scoreRequired: 1200,
        cubeSpeed: 11,
        spawnSpread: 4000,
        skyColor: '#A2D2FF',
        groundColor: '#90A955',
        avoidShape: 'diamond' // Level 3 spawns floating crystals/diamonds
    },
    { scoreRequired: 9999, cubeSpeed: 14, spawnSpread: 4000, skyColor: '#faf0e6', groundColor: '#d2b48c' },
    { scoreRequired: 9999, cubeSpeed: 16, spawnSpread: 4000, skyColor: '#f5e6d3', groundColor: '#cd853f' }
];

export const PIZZA_THEME = {
    crustStart: { r: 244, g: 208, b: 104 }, // Light Golden-Yellow (#f4d068)
    crustEnd: { r: 215, g: 130, b: 40 },     // Rich, warm baked brown (#a0522d)
    sauceColor: 'rgba(183, 28, 28, ',       // Base red string (we will append dynamic opacity)
    cheeseColor: 'rgba(255, 223, 122, '     // Base yellow string (we will append dynamic opacity)
};

// Screen Scaling Variables
export let screenProps = {
    halfW: 0,
    halfH: 0,
    projectionDist: 0
};

// Modifiable Live Game State
// --- UPDATE THE state OBJECT INSIDE config.js ---
export const state = {
    isMenuOpen: true,

    isVictory: false,      // Triggers the celebratory screen overlay
    ngPlusCount: 0,

    shakeTimer: 0,

    // NEW FOR SOUND REGULATION:
    proxSoundCooldown: 0, // Frame delay gap tracker for radar beeps

    playerX: 0,
    playerSpeed: 8,
    playerRadius: 15,
    playerTilt: 0,
    isGameOver: false,
    score: 0,
    currentLevelIndex: 0, // change to test different levels
    levelUpTimer: 0,
    cubes: [],

    // NEW TO TRACK COLLECTIBLES:
    tomatoes: [],       // Array holding live tomato objects
    sauceProgress: 0,    // Value from 0.0 to 1.0 (replaces the old time-based sauce)
    cheeseSlices: [],    // Array holding active cheese slices
    cheeseProgress: 0,
    veggies: [],          // Array holding active green peppers and onions
    toppingProgress: 0,
    meats: [],            // Array holding active pepperoni and sausage slices
    meatProgress: 0   
};


// Constants for steering tilt mechanics
export const TILT_CONFIG = {
    max: 0.35,
    speed: 0.05,
    recovery: 0.08
};
