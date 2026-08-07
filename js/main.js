import { canvas, ctx, state } from './config.js';
import { updateGame, initCubes } from './physics.js';
import { drawGame } from './renderer.js';
import { resizeGame, resetGame } from './manager.js'; // Import our new management features

// Set up initial canvas size configuration
resizeGame(canvas);

// Hook up window resizing listeners
window.addEventListener('resize', () => resizeGame(canvas));

// Hook up event listeners for restarting the game
window.addEventListener('keydown', e => {
    if (e.code === 'Space') resetGame(state);
});
window.addEventListener('touchstart', () => resetGame(state));

// --- ENGINE TICK RECURSION ---
function loop() {
    updateGame(state);            // Process game state changes (physics)
    drawGame(ctx, canvas, state);  // Render game state to the screen (renderer)
    requestAnimationFrame(loop);  // Request next frame
}

// Boot up game engine
initCubes(state);
loop();
