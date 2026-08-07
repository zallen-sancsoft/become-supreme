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
    // Only permit a reset if the player is sitting on a Game Over state
    if (!state.isGameOver) return;

    // Flush player active telemetry coordinates
    state.playerX = 0;
    state.playerTilt = 0;
    state.score = 0;
    state.currentLevelIndex = 0;
    state.levelUpTimer = 0;

    // Wake up physics cycle
    state.isGameOver = false;

    // Re-initialize a safe starting obstacle layout
    initCubes(state);
}
