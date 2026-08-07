// Global Constants
export const NUM_CUBES = 20;
export const MAP_WIDTH = 4000;
export const MAX_DEPTH = 1200;
export const START_SAFE_ZONE = 1000;
export const canvas = document.getElementById('gameCanvas');
export const ctx = canvas.getContext('2d');

// Locate and update the LEVELS array inside config.js:
export const LEVELS = [
    {
        scoreRequired: 0,
        cubeSpeed: 6,
        spawnSpread: 2000,
        skyColor: '#e0f6ff',
        groundColor: '#cccccc',
        avoidShape: 'cube' // Level 1 uses standard cubes
    },
    {
        scoreRequired: 500,
        cubeSpeed: 8,
        spawnSpread: 1500,
        skyColor: '#ffe5e5',
        groundColor: '#bfa3a3',
        avoidShape: 'triangle' // Level 2 spawns sharp spikes/pyramids
    },
    {
        scoreRequired: 1200,
        cubeSpeed: 11,
        spawnSpread: 1000,
        skyColor: '#111122',
        groundColor: '#333344',
        avoidShape: 'diamond' // Level 3 spawns floating crystals/diamonds
    }
];


// Screen Scaling Variables
export let screenProps = {
    halfW: 0,
    halfH: 0,
    projectionDist: 0
};

// Modifiable Live Game State
export let state = {
    playerX: 0,
    playerSpeed: 8,
    playerRadius: 15,
    playerTilt: 0,
    isGameOver: false,
    score: 0,
    currentLevelIndex: 0,
    levelUpTimer: 0,
    cubes: []
};

// Constants for steering tilt mechanics
export const TILT_CONFIG = {
    max: 0.35,
    speed: 0.05,
    recovery: 0.08
};
