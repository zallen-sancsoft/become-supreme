import { NUM_CUBES, MAP_WIDTH, MAX_DEPTH, START_SAFE_ZONE, LEVELS, TILT_CONFIG } from './config.js';
import { controls } from './input.js';
import { playLevelBgm, stopBgm, playCollectSound, playHitSound, playProximityTick } from './audio.js';

// Moves the array setup logic into the physics module
export function initCubes(state) {
    state.cubes = [];
    for (let i = 0; i < NUM_CUBES; i++) {
        state.cubes.push({
            x: (Math.random() - 0.5) * MAP_WIDTH,
            y: 100,
            // Ensures starting blocks are perfectly scattered into the depth field
            z: START_SAFE_ZONE + (Math.random() * (MAX_DEPTH - START_SAFE_ZONE)),
            size: 40,
            color: `hsl(${Math.random() * 40 + 20}, 100%, 50%)`
        });
    }
}

// Houses the isolated mathematical physics tick
export function updateGame(state) {
    if (state.isMenuOpen) return;

    if (state.shakeTimer > 0) {
        state.shakeTimer--;
    }

    if (state.isGameOver) return;
    // NEW: Freeze the engine logic frame when victory window is active
    if (state.isVictory) return;

    // 1. Steering & Easing calculations
    if (controls.left) {
        state.playerX -= state.playerSpeed;
        state.playerTilt = Math.max(state.playerTilt - TILT_CONFIG.speed, -TILT_CONFIG.max);
    } else if (controls.right) {
        state.playerX += state.playerSpeed;
        state.playerTilt = Math.min(state.playerTilt + TILT_CONFIG.speed, TILT_CONFIG.max);
    } else {
        if (state.playerTilt > 0) state.playerTilt = Math.max(state.playerTilt - TILT_CONFIG.recovery, 0);
        if (state.playerTilt < 0) state.playerTilt = Math.min(state.playerTilt - TILT_CONFIG.recovery, 0);
    }

    // Increments scoring metrics
    state.score += 1;

    // Cooldown ticker for close alerts
    if (state.proxSoundCooldown > 0) state.proxSoundCooldown--;

    // 2. Level Progression Evaluations
    let activeLevel = LEVELS[state.currentLevelIndex];

    // NEW DYNAMIC DIFFICULTY: Every NG+ loop scales speed up by 15% and narrows the spawn spread by 10%
    let dynamicSpeed = activeLevel.cubeSpeed * (1 + state.ngPlusCount * 0.15);
    let dynamicSpread = activeLevel.spawnSpread * (1 - Math.min(state.ngPlusCount * 0.10, 0.5));

    if (state.currentLevelIndex < LEVELS.length - 1) {
        let nextLevel = LEVELS[state.currentLevelIndex + 1];

        if (state.currentLevelIndex === 1) {
            // Saucing -> Cheesing condition
            if (state.sauceProgress >= 1.0) {
                state.currentLevelIndex++;
                activeLevel = LEVELS[state.currentLevelIndex];
                state.levelUpTimer = 60;
            }
        }
        else if (state.currentLevelIndex === 2) {
            // NEW GATING: Cheesing -> Topping condition
            if (state.cheeseProgress >= 1.0) {
                state.currentLevelIndex++;
                activeLevel = LEVELS[state.currentLevelIndex];
                state.levelUpTimer = 60;
            }
        }
        else if (state.currentLevelIndex === 3) {
            // NEW GATING: Topping -> Meat condition
            if (state.toppingProgress >= 1.0) {
                state.currentLevelIndex++;
                activeLevel = LEVELS[state.currentLevelIndex];
                state.levelUpTimer = 60;
            }
        }
        else {
            if (state.score >= nextLevel.scoreRequired) {
                state.currentLevelIndex++;
                activeLevel = LEVELS[state.currentLevelIndex];
                state.levelUpTimer = 60;
            }
        }
    } else {
        if (state.meatProgress >= 1.0) {
            state.isVictory = true;
            return;
        }
        activeLevel = LEVELS[LEVELS.length - 1];
    }
    if (state.levelUpTimer > 0) state.levelUpTimer--;

    updateCollectibles(state, dynamicSpeed);
    updateCheeseCollectibles(state, dynamicSpeed);
    updateVeggieCollectibles(state, dynamicSpeed);
    updateMeatCollectibles(state, dynamicSpeed);

    // 3. Object movement and spatial boundaries check
    for (let cube of state.cubes) {
        cube.z -= dynamicSpeed;

        // --- ACCURATE 2D PLAYER PLANE COLLISION ---
        // The player sits at playerZPlane on screen. We check a predictive window matching the frame speed.
        let playerZPlane = 85;

        if (cube.z >= playerZPlane - dynamicSpeed && cube.z <= playerZPlane + 20) {

            // Calculate the horizontal distance
            let distanceX = Math.abs(cube.x - state.playerX);

            // Scale the collision width threshold by shape format
            let visualWidthFactor = 1.0;
            if (activeLevel.cubeShape === 'triangle' || activeLevel.cubeShape === 'diamond') {
                visualWidthFactor = 0.85;
            }

            let collisionBuffer = (cube.size / 2 * visualWidthFactor);

            // Trigger instant crash
            if (distanceX < collisionBuffer) {
                state.isGameOver = true;
                // --- TRIGGER CAMERA SHAKE FOR 30 FRAMES ---
                state.shakeTimer = 30;
                stopBgm();                     // Freeze background score track
                playHitSound(state.currentLevelIndex); 
            }
        }

        // FEATURE B: CLOSE PROXIMITY TICK CHIPS RADAR
        // Trigger a beep if an obstacle is getting close (Z is right in front of you) AND horizontally aligned with you
        if (cube.z > playerZPlane && cube.z < playerZPlane + 180) {
            let distanceX = Math.abs(cube.x - state.playerX);
            // If the obstacle is directly heading into your collision path
            if (distanceX < cube.size + 40) {
                if (state.proxSoundCooldown === 0) {
                    playProximityTick();
                    state.proxSoundCooldown = 15; // Beep every 15 frames while near danger
                }
            }
        }

        // Recycle objects when they fly completely past the screen view (Z <= 20)
        if (cube.z <= 20) {
            // OLD WAY: cube.z = MAX_DEPTH; (This caused the "line" bug!)

            // NEW WAY: Randomly distribute their depth between 400 and your new MAX_DEPTH
            cube.z = START_SAFE_ZONE + (Math.random() * (MAX_DEPTH - START_SAFE_ZONE));

            // Keep the horizontal spread randomized relative to player steering
            cube.x = state.playerX + (Math.random() - 0.5) * dynamicSpread;
        }
    }

    // Depth sorting
    state.cubes.sort((a, b) => b.z - a.z);
}

export function updateCollectibles(state, currentSpeed) {
    let activeLevel = LEVELS[state.currentLevelIndex];
    if (state.currentLevelIndex !== 1) { state.tomatoes = []; return; }

    if (state.tomatoes.length < 3 && Math.random() < 0.01) {
        state.tomatoes.push({
            x: state.playerX + (Math.random() - 0.5) * 800,
            y: 100, z: 1200, size: 40
        });
    }

    for (let i = state.tomatoes.length - 1; i >= 0; i--) {
        let tomato = state.tomatoes[i];

        // FIX: Move forward using the incoming currentSpeed instead of base speed
        tomato.z -= currentSpeed;

        let playerZPlane = 140;
        if (tomato.z >= playerZPlane - currentSpeed && tomato.z <= playerZPlane + 20) {
            let distanceX = Math.abs(tomato.x - state.playerX);
            let collectionBuffer = (tomato.size / 2) + state.playerRadius + 25;
            if (distanceX < collectionBuffer) {
                state.sauceProgress = Math.min(state.sauceProgress + 0.15, 1.0);
                try { playCollectSound('tomato'); } catch (e) { }
                state.tomatoes.splice(i, 1);
                continue;
            }
        }
        if (tomato.z <= 10) state.tomatoes.splice(i, 1);
    }
}

export function updateCheeseCollectibles(state, currentSpeed) {
    let activeLevel = LEVELS[state.currentLevelIndex];
    if (state.currentLevelIndex !== 2) { state.cheeseSlices = []; return; }

    if (state.cheeseSlices.length < 3 && Math.random() < 0.012) {
        state.cheeseSlices.push({
            x: state.playerX + (Math.random() - 0.5) * 600,
            y: 100, z: 1200, size: 35
        });
    }

    for (let i = state.cheeseSlices.length - 1; i >= 0; i--) {
        let cheese = state.cheeseSlices[i];

        // FIX: Move forward using currentSpeed
        cheese.z -= currentSpeed;

        let playerZPlane = 140;
        if (cheese.z >= playerZPlane - currentSpeed && cheese.z <= playerZPlane + 20) {
            let distanceX = Math.abs(cheese.x - state.playerX);
            let collectionBuffer = (cheese.size / 2) + state.playerRadius + 25;
            if (distanceX < collectionBuffer) {
                state.cheeseProgress = Math.min(state.cheeseProgress + 0.15, 1.0);
                try { playCollectSound('cheese'); } catch (e) { }
                state.cheeseSlices.splice(i, 1);
                continue;
            }
        }
        if (cheese.z <= 10) state.cheeseSlices.splice(i, 1);
    }
}

export function updateVeggieCollectibles(state, currentSpeed) {
    let activeLevel = LEVELS[state.currentLevelIndex];
    if (state.currentLevelIndex !== 3) { state.veggies = []; return; }

    if (state.veggies.length < 4 && Math.random() < 0.015) {
        state.veggies.push({
            x: state.playerX + (Math.random() - 0.5) * 500,
            y: 100, z: 1200, size: 32,
            type: Math.random() < 0.5 ? 'pepper' : 'onion'
        });
    }

    for (let i = state.veggies.length - 1; i >= 0; i--) {
        let veg = state.veggies[i];

        // FIX: Move forward using currentSpeed
        veg.z -= currentSpeed;

        let playerZPlane = 140;
        if (veg.z >= playerZPlane - currentSpeed && veg.z <= playerZPlane + 20) {
            let distanceX = Math.abs(veg.x - state.playerX);
            let collectionBuffer = (veg.size / 2) + state.playerRadius + 25;
            if (distanceX < collectionBuffer) {
                state.toppingProgress = Math.min(state.toppingProgress + 0.10, 1.0);
                try { playCollectSound('veg'); } catch (e) { }
                state.veggies.splice(i, 1);
                continue;
            }
        }
        if (veg.z <= 10) state.veggies.splice(i, 1);
    }
}

export function updateMeatCollectibles(state, currentSpeed) {
    let activeLevel = LEVELS[state.currentLevelIndex];
    if (state.currentLevelIndex !== 4) { state.meats = []; return; }

    if (state.meats.length < 4 && Math.random() < 0.015) {
        state.meats.push({
            x: state.playerX + (Math.random() - 0.5) * 400,
            y: 100, z: 1200, size: 32,
            type: Math.random() < 0.5 ? 'pep' : 'sausage'
        });
    }

    for (let i = state.meats.length - 1; i >= 0; i--) {
        let meat = state.meats[i];

        // FIX: Move forward using currentSpeed
        meat.z -= currentSpeed;

        let playerZPlane = 140;
        if (meat.z >= playerZPlane - currentSpeed && meat.z <= playerZPlane + 20) {
            let distanceX = Math.abs(meat.x - state.playerX);
            let collectionBuffer = (meat.size / 2) + state.playerRadius + 25;
            if (distanceX < collectionBuffer) {
                state.meatProgress = Math.min(state.meatProgress + 0.10, 1.0);
                try { playCollectSound('meat'); } catch (e) { }
                state.meats.splice(i, 1);
                continue;
            }
        }
        if (meat.z <= 10) state.meats.splice(i, 1);
    }
}