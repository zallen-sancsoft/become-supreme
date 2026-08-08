import { canvas, ctx, state } from './config.js';
import { updateGame, initCubes } from './physics.js';
import { drawGame } from './renderer.js';
import { resizeGame, resetGame, handleMenuClick, handleVictoryClick } from './manager.js';

// Set up initial canvas size configuration
resizeGame(canvas);

// Hook up window resizing listeners
window.addEventListener('resize', () => resizeGame(canvas));

// Hook up event listeners for restarting the game
window.addEventListener('keydown', e => {
    // Spacebar ONLY triggers a hard reset if you died
    if (e.code === 'Space' && state.isGameOver) {
        resetGame(state);
    }
});
window.addEventListener('touchstart', () => resetGame(state));

// --- ATTACH EVENTS FOR MOUSE AND MOBILE TAPS ---
canvas.addEventListener('click', (e) => handleMenuClick(e, canvas, state));
canvas.addEventListener('click', (e) => handleVictoryClick(e, canvas, state));

canvas.addEventListener('touchstart', (e) => {
    if (state.isMenuOpen && e.touches.length > 0) {
        handleMenuClick(e.touches[0], canvas, state);
    }
});

canvas.addEventListener('touchstart', (e) => {
    if (state.isVictory && e.touches.length > 0) {
        handleVictoryClick(e.touches[0], canvas, state);
    }
});

// --- ENGINE TICK RECURSION ---
function loop() {
    updateGame(state);            // Process game state changes (physics)
    drawGame(ctx, canvas, state);  // Render game state to the screen (renderer)
    requestAnimationFrame(loop);  // Request next frame
}

// Boot up game engine
initCubes(state);
loop();


/*async function loadAudioFile(audioContext, fileUrl) {
    const response = await fetch(fileUrl);
    const arrayBuffer = await response.arrayBuffer();
    // Decode the audio data into an AudioBuffer
    return await audioContext.decodeAudioData(arrayBuffer);
}

// 1. Initialize Context
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let cachedBuffer = null;

// 2. Load and cache the file once
async function init() {
    cachedBuffer = await loadAudioFile(audioCtx, 'assets/audio/test.mp3');
}

// 3. Play the sound (call this on a user click event)
function playSound() {
    if (!cachedBuffer) return;

    // Create the source node (replaces createOscillator)
    const source = audioCtx.createBufferSource();

    // Assign the loaded audio data
    source.buffer = cachedBuffer;

    // Connect to speakers and start
    source.connect(audioCtx.destination);
    source.start(0);
}*/