export let controls = { left: false, right: false };

window.addEventListener('keydown', e => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') controls.left = true;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') controls.right = true;
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
