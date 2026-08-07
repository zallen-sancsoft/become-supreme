// Input listeners
// Modify your existing keys object to handle inputs uniformly
let controls = {
    left: false,
    right: false
};

// --- Desktop Keyboard Controls ---
window.addEventListener('keydown', e => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') controls.left = true;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') controls.right = true;
});

window.addEventListener('keyup', e => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') controls.left = false;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') controls.right = false;
});



// Attach touch events directly to the window or canvas
window.addEventListener('touchstart', handleTouch, { passive: false });
window.addEventListener('touchmove', handleTouch, { passive: false });
window.addEventListener('touchend', handleTouch, { passive: false });
window.addEventListener('keydown', e => { if (e.code === 'Space') resetGame(); });
window.addEventListener('touchstart', resetGame);

// --- Mobile Touch Controls ---
function handleTouch(e) {
    // Prevent default browser behaviors like zooming or scrolling
    e.preventDefault();

    // Reset control states before checking active touches
    controls.left = false;
    controls.right = false;

    // Loop through all active fingers on the screen
    for (let i = 0; i < e.touches.length; i++) {
        let touchX = e.touches[i].clientX;
        let screenWidth = window.innerWidth;

        // If touch is on the left half of the window
        if (touchX < screenWidth / 2) {
            controls.left = true;
        }
        // If touch is on the right half of the window
        else {
            controls.right = true;
        }
    }
}