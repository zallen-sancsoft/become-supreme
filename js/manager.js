import { START_SAFE_ZONE, MAX_DEPTH, LEVELS, screenProps } from './config.js';
import { initCubes } from './physics.js';

// --- FULL-SCREEN MOBILE COMPATIBILITY ---
export function resizeGame(canvas) {
    const targetRatio = 9 / 16; // Locks project into a mobile portrait layout
    let windowW = window.innerWidth;
    let windowH = window.innerHeight;

    // Scale canvas to best fit available space while maintaining aspect ratio
    if (windowW / windowH > targetRatio) {
        canvas.height = windowH;
        canvas.width = windowH * targetRatio;
    } else {
        canvas.width = windowW;
        canvas.height = windowW / targetRatio;
    }

    // Recalculate global 3D drawing parameters
    screenProps.halfW = canvas.width / 2;
    screenProps.halfH = canvas.height / 2;
    screenProps.projectionDist = canvas.width * 0.8;
}

// --- STATE RESTORATION ENGINE ---
export function resetGame(state) {
    if (!state.isGameOver) return;

    // Clear out spatial positioning metrics
    state.playerX = 0;
    state.playerTilt = 0;
    state.score = 0;

    // FIX: Explicitly drop the level tracking index completely back to 0 (Level 1)
    state.currentLevelIndex = 0;

    state.levelUpTimer = 0;

    // Flush out item lists and progress tracks completely
    state.tomatoes = [];
    state.sauceProgress = 0;

    state.cheeseSlices = [];
    state.cheeseProgress = 0;

    state.isGameOver = false;
    initCubes(state);

    // Wake up physics engine cycle
    state.isGameOver = false;

    // Re-initialize starting field arrays
    initCubes(state);
}
