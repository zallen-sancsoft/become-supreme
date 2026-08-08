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

// Array of MP3 paths for each level
const levelTracks = [
  './assets/audio/background/wind.mp3',
  './assets/audio/background/farm.mp3',
  './assets/audio/background/farm.mp3',
  './assets/audio/background/sizzle.mp3',
  './assets/audio/background/sizzle.mp3'
];

const collectableSounds = []
collectableSounds['tomato'] = './assets/audio/collectable/tomato.mp3';
collectableSounds['cheese'] = './assets/audio/collectable/cheese.mp3';
collectableSounds['veg'] = './assets/audio/collectable/veg.mp3';
collectableSounds['meat'] = './assets/audio/collectable/meat.mp3';

const collisionSounds = [
    './assets/audio/collision/plant.mp3',
    './assets/audio/collision/wood.mp3',
    './assets/audio/collision/kick.mp3',
    './assets/audio/collision/pan.mp3',
    './assets/audio/collision/blade.mp3'
];

const proximitySounds = [
    './assets/audio/proximity/swoosh.mp3',
    './assets/audio/proximity/swoosh.mp3',
    './assets/audio/proximity/moo.mp3',
    './assets/audio/proximity/swoosh.mp3',
    './assets/audio/proximity/swoosh.mp3'
];

let activeBgmAudio = null;
let collectAudio = null;
let hitAudio = null;
let proxAudio = null;

export function stopBgm() {
    if (activeBgmAudio) {
        try {
            activeBgmAudio.pause();
            activeBgmAudio.currentTime = 0;
        } catch (e) { }
        activeBgmAudio = null;
    }
}

export function playLevelBgm(levelIndex) {
    if (levelIndex != 2 && levelIndex != 4) {
        stopBgm(); // Stop previous track cleanly
        const trackPath = levelTracks[levelIndex] || levelTracks[0];

        activeBgmAudio = new Audio(trackPath);
        activeBgmAudio.loop = true;
        activeBgmAudio.volume = 0.1;
        activeBgmAudio.play().catch(err => console.log("Audio play blocked:", err));
    }
}

// --- SYSTEM 2: COLLECTIBLE CORNER CHIMES (Tomatoes, Cheese, Veggies, Meats) ---
export function playCollectSound(type) {
    const trackPath = collectableSounds[type];
    collectAudio = new Audio(trackPath);
    collectAudio.loop = false;
    collectAudio.play().catch(err => console.log("Audio play blocked:", err));
}

// --- SYSTEM 3: OBSTACLE HIT CRASH EFFECTS ---
export function playHitSound(levelIndex) {
    const trackPath = collisionSounds[levelIndex];
    hitAudio = new Audio(trackPath);
    hitAudio.loop = false;
    hitAudio.play().catch(err => console.log("Audio play blocked:", err));
}

// --- SYSTEM 4: DYNAMIC CLOSE PROXIMITY BUZZER WARNINGS ---
export function playProximitySound(levelIndex) {
    const trackPath = proximitySounds[levelIndex];
    proxAudio = new Audio(trackPath);
    proxAudio.loop = false;
    proxAudio.volume = 0.1;
    proxAudio.play().catch(err => console.log("Audio play blocked:", err));
}
