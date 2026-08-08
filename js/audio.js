// --- NEW MODULE: audio.js ---
let audioCtx = null;
let activeBgmOsc = null;
let activeBgmGain = null;

// Initialize the browser's audio hardware cleanly upon first user interaction
function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

// --- SYSTEM 1: PLAY LEVEL-SPECIFIC BACKGROUND MUSIC SINE WAVES ---
export function playLevelBgm(levelIndex) {
    const ctx = getAudioContext();
    stopBgm(); // Kill previous tracks cleanly

    activeBgmOsc = ctx.createOscillator();
    activeBgmGain = ctx.createGain();

    // Map each stage to a unique looping drone frequency
    // Stage 1: Warm low C | Stage 2: F minor drone | Stage 3: Deep space drone | Stage 4: Arid drone | Stage 5: Intense tension
    const frequencies = [130.81, 174.61, 110.00, 146.83, 98.00];
    let freq = frequencies[levelIndex] || 110.00;

    // Use a mellow triangle wave for Baking/Saucing, and an intense sawtooth wave for cutting stages
    activeBgmOsc.type = levelIndex >= 3 ? 'sawtooth' : 'triangle';
    activeBgmOsc.frequency.setValueAtTime(freq, ctx.currentTime);

    // Keep music low in the mix so it doesn't hurt ears
    activeBgmGain.gain.setValueAtTime(0.04, ctx.currentTime);

    activeBgmOsc.connect(activeBgmGain);
    activeBgmGain.connect(ctx.destination);
    activeBgmOsc.start();
}

export function stopBgm() {
    if (activeBgmOsc) {
        try { activeBgmOsc.stop(); } catch (e) { }
        activeBgmOsc.disconnect();
        activeBgmOsc = null;
    }
}

// --- SYSTEM 2: COLLECTIBLE CORNER CHIMES (Tomatoes, Cheese, Veggies, Meats) ---
export function playCollectSound(type) {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';

    // Choose custom note profiles for food steps
    let baseFreq = 440; // Default Tomato Pop A4
    if (type === 'cheese') baseFreq = 587.33; // Cheese Ping D5
    if (type === 'veg') baseFreq = 659.25;    // Vegetable Twang E5
    if (type === 'meat') baseFreq = 783.99;   // Heavy Meat Chime G5

    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    // Arcade arpeggio frequency rise effect
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15); // Fast decay drop

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
}

// --- SYSTEM 3: OBSTACLE HIT CRASH EFFECTS ---
export function playHitSound(levelIndex) {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Use harsh sawtooth/square waves to simulate a heavy impact crunch
    osc.type = levelIndex === 4 ? 'square' : 'sawtooth';
    osc.frequency.setValueAtTime(120, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(30, ctx.currentTime + 0.4); // Downward drop

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
}

// --- SYSTEM 4: DYNAMIC CLOSE PROXIMITY BUZZER WARNINGS ---
export function playProximityTick() {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // High pitch warning click

    gain.gain.setValueAtTime(0.07, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.03); // Quick click sound

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
}
