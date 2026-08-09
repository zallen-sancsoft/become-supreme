import { START_SAFE_ZONE, MAX_DEPTH, LEVELS, screenProps } from './config.js';
import { initCubes } from './physics.js';
import { playLevelBgm, stopBgm } from './audio.js';

export function startGameFromMenu(state) {
    state.isMenuOpen = false; // Turn off main menu overlay panel
    playLevelBgm(0);          // Start Level 1 (Baking) background music loop
}

// Standalone initialization routine shared by spacebar and mouse clicks for Victory
export function startNextNgPlus(state) {
    state.ngPlusCount++;         // Step up difficulty multiplier counter
    state.currentLevelIndex = 0; // Return to stage 1: "Baking" (Cacti obstacles)

    // Flush and clean all ingredient states for the new assembly run
    state.sauceProgress = 0;
    state.cheeseProgress = 0;
    state.toppingProgress = 0;
    state.meatProgress = 0;
    state.tomatoes = [];
    state.cheeseSlices = [];
    state.veggies = [];
    state.meats = [];

    state.playerX = 0;
    state.playerTilt = 0;
    state.levelUpTimer = 60;     // Flash standard level up layout notifications

    state.isVictory = false;     // Close victory screen and wake engine up!
    initCubes(state);            // Respawn fresh field assets scattered across depth
    playLevelBgm(0);             // Start background soundtrack over for the new loop run
}

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

    state.playerX = 0;
    state.playerTilt = 0;
    state.score = 0;
    state.currentLevelIndex = 0;
    state.levelUpTimer = 0;

    // CRUCIAL: Clear out difficulty modifiers upon a hard Game Over death!
    state.ngPlusCount = 0;

    state.tomatoes = [];
    state.sauceProgress = 0;
    state.cheeseSlices = [];
    state.cheeseProgress = 0;
    state.veggies = [];
    state.toppingProgress = 0;
    state.meats = [];
    state.meatProgress = 0;

    state.isGameOver = false;
    playLevelBgm(0); 
    initCubes(state);
}

export function handleMenuClick(e, canvas, state) {
    // Exit out instantly if the main menu is already closed
    if (!state.isMenuOpen) return;

    // Calculate exact canvas bounding box offsets
    const rect = canvas.getBoundingClientRect();

    // Scale client click pixels directly to matching internal game engine canvas pixels
    let mouseX = ((e.clientX - rect.left) / rect.width) * canvas.width;
    let mouseY = ((e.clientY - rect.top) / rect.height) * canvas.height;

    // Target Start Button Boundaries (must match sizes configured in renderer.js!)
    let btnW = 220;
    let btnH = 50;
    let btnX = canvas.width / 2 - btnW / 2;
    let btnY = canvas.height / 2 + 160;

    // Check if the coordinate position lands inside the start button rectangle box
    if (mouseX >= btnX && mouseX <= btnX + btnW && mouseY >= btnY && mouseY <= btnY + btnH) {
        startGameFromMenu(state); 
    }
}

export function handleVictoryClick(e, canvas, state) {
    if (!state.isVictory) return;

    const rect = canvas.getBoundingClientRect();
    let mouseX = ((e.clientX - rect.left) / rect.width) * canvas.width;
    let mouseY = ((e.clientY - rect.top) / rect.height) * canvas.height;

    // Victory button configurations matching the dimensions in renderer.js
    let vBtnW = 260;
    let vBtnH = 52;
    let vBtnX = canvas.width / 2 - vBtnW / 2;
    let vBtnY = canvas.height / 2 + 65;

    if (mouseX >= vBtnX && mouseX <= vBtnX + vBtnW && mouseY >= vBtnY && mouseY <= vBtnY + vBtnH) {
        // REPLACED DUPLICATED RUNS CODE WITH THE UNIFIED REUSE INITIALIZER:
        startNextNgPlus(state);
    }
}
