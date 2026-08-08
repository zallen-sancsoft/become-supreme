import { state } from './config.js';
import { startGameFromMenu, startNextNgPlus } from './manager.js';

export let controls = { left: false, right: false };

window.addEventListener('keydown', e => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') controls.left = true;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') controls.right = true;

    if (e.code === 'Space' && state.isMenuOpen) {
        // Prevent the browser from scrolling down the page when hitting Space
        e.preventDefault();
        startGameFromMenu(state);
    }

    // --- NEW 2: DETECT SPACEBAR PRESS TO ENTER NEXT NG+ RUN ---
    if (e.code === 'Space' && state.isVictory) {
        e.preventDefault(); // Prevents page scrolling layout jumps
        startNextNgPlus(state);
    }
});

window.addEventListener('keyup', e => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') controls.left = false;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') controls.right = false;
});

function handleTouch(e) {
    e.preventDefault();
    controls.left = false;
    controls.right = false;

    for (let i = 0; i < e.touches.length; i++) {
        let touchX = e.touches[i].clientX;
        if (touchX < window.innerWidth / 2) {
            controls.left = true;
        } else {
            controls.right = true;
        }
    }
}

window.addEventListener('touchstart', handleTouch, { passive: false });
window.addEventListener('touchmove', handleTouch, { passive: false });
window.addEventListener('touchend', handleTouch, { passive: false });
