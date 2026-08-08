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

    updateCollectibles(state);
    updateCheeseCollectibles(state);
    updateVeggieCollectibles(state);
    updateMeatCollectibles(state);

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

export function updateCollectibles(state) {
    let activeLevel = LEVELS[state.currentLevelIndex];

    // Spawning routine remains identical
    if (state.currentLevelIndex === 1) {
        if (state.tomatoes.length < 3 && Math.random() < 0.01) {
            state.tomatoes.push({
                // OLD WAY: x: (Math.random() - 0.5) * 1500,
                // NEW WAY: Center the random spread directly on top of the player's camera position!
                x: state.playerX + (Math.random() - 0.5) * 800,
                y: 100,
                z: 1200,
                size: 40
            });
        }
    }

    // Process movement and item collection
    for (let i = state.tomatoes.length - 1; i >= 0; i--) {
        let tomato = state.tomatoes[i];
        tomato.z -= activeLevel.cubeSpeed;

        // --- ACCURATE 2D PLAYER PLANE COLLECTION ---
        // Synchronized to the exact same Z-plane (140) as the obstacles
        let playerZPlane = 85;
        if (tomato.z >= playerZPlane - activeLevel.cubeSpeed && tomato.z <= playerZPlane + 20) {

            let distanceX = Math.abs(tomato.x - state.playerX);
            let collectionBuffer = (tomato.size / 2) + state.playerRadius + 25; // Generous buffer for fun play

            if (distanceX < collectionBuffer) {
                // INSTANT ARCADE DELETION
                state.sauceProgress = Math.min(state.sauceProgress + 0.15, 1.0);
                playCollectSound('tomato');
                state.tomatoes.splice(i, 1);
                continue;
            }
        }

        // Clean up tomatoes that pass entirely behind the viewport
        if (tomato.z <= 20) {
            state.tomatoes.splice(i, 1);
        }
    }
}

export function updateCheeseCollectibles(state) {
    let activeLevel = LEVELS[state.currentLevelIndex];

    // Only spawn and handle cheese during the Cheesing Stage (index 2)
    if (state.currentLevelIndex === 2) {
        // Random chance to spawn a cheese slice if there are few on screen
        if (state.cheeseSlices.length < 3 && Math.random() < 0.012) {
            state.cheeseSlices.push({
                // NEW WAY: Centers cheese drops relative to where the player is driving
                x: state.playerX + (Math.random() - 0.5) * 600,
                y: 100,
                z: 1200,
                size: 35
            });
        }
    }

    // Loop backward to process movement and collision cleanup
    for (let i = state.cheeseSlices.length - 1; i >= 0; i--) {
        let cheese = state.cheeseSlices[i];

        // Move cheese forward toward the camera
        cheese.z -= activeLevel.cubeSpeed;

        // Collision Check (Kept identical to your dialed-in player plane)
        let playerZPlane = 140;
        if (cheese.z >= playerZPlane - activeLevel.cubeSpeed && cheese.z <= playerZPlane + 20) {
            let distanceX = Math.abs(cheese.x - state.playerX);
            let collectionBuffer = (cheese.size / 2) + state.playerRadius + 25;

            if (distanceX < collectionBuffer) {
                state.cheeseProgress = Math.min(state.cheeseProgress + 0.15, 1.0);
                playCollectSound('cheese');
                state.cheeseSlices.splice(i, 1);
                continue;
            }
        }

        // --- FIX: LEAK-PROOF ARRWAY CLEANUP ---
        // Instead of checking <= 20, check if the cheese has crossed 0 (pushed behind the camera lens)
        // OR check if it crossed well past your active player plane (e.g., playerZPlane - 50)
        if (cheese.z <= 10) {
            state.cheeseSlices.splice(i, 1); // Cleanly drop from array memory
        }
    }
}
// --- ADD THIS TO THE VERY BOTTOM OF physics.js ---

export function updateVeggieCollectibles(state) {
    let activeLevel = LEVELS[state.currentLevelIndex];

    // Strictly gate the entire routine by the Topping level index (3)
    if (state.currentLevelIndex !== 3) {
        state.veggies = [];
        return;
    }

    // Spawning engine routine (randomly chooses between pepper and onion)
    if (state.veggies.length < 4 && Math.random() < 0.015) {
        state.veggies.push({
            // NEW WAY: Centers peppers and onions directly in the player's path
            x: state.playerX + (Math.random() - 0.5) * 500,
            y: 100,
            z: 1200,
            size: 32,
            type: Math.random() < 0.5 ? 'pepper' : 'onion'
        });
    }

    // Process movement tracking and player impact deletion
    for (let i = state.veggies.length - 1; i >= 0; i--) {
        let veg = state.veggies[i];
        veg.z -= activeLevel.cubeSpeed;

        // Collision Check using your dialed-in Z-plane variable value
        let playerZPlane = 140;
        if (veg.z >= playerZPlane - activeLevel.cubeSpeed && veg.z <= playerZPlane + 20) {
            let distanceX = Math.abs(veg.x - state.playerX);
            let collectionBuffer = (veg.size / 2) + state.playerRadius + 25;

            if (distanceX < collectionBuffer) {
                // SUCCESS: Add 10% to your topping bar and instantly disappear
                state.toppingProgress = Math.min(state.toppingProgress + 0.10, 1.0);
                playCollectSound('veg');
                state.veggies.splice(i, 1);
                continue;
            }
        }

        // Leak-proof cleanup drop
        if (veg.z <= 10) {
            state.veggies.splice(i, 1);
        }
    }
}

// --- ADD THIS TO THE VERY BOTTOM OF physics.js ---

export function updateMeatCollectibles(state) {
    let activeLevel = LEVELS[state.currentLevelIndex];

    // Strictly gate the entire routine by the Meat level index (4)
    if (state.currentLevelIndex !== 4) {
        state.meats = [];
        return;
    }

    // Spawning engine routine (randomly chooses between pepperoni and sausage)
    if (state.meats.length < 4 && Math.random() < 0.015) {
        state.meats.push({
            // NEW WAY: Centers pepperonis and sausages directly down your steering sightline
            x: state.playerX + (Math.random() - 0.5) * 400,
            y: 100,
            z: 1200,
            size: 32,
            type: Math.random() < 0.5 ? 'pep' : 'sausage'
        });
    }

    // Process movement tracking and player impact deletion
    for (let i = state.meats.length - 1; i >= 0; i--) {
        let meat = state.meats[i];
        meat.z -= activeLevel.cubeSpeed;

        // Collision Check using your dialed-in Z-plane variable value
        let playerZPlane = 140;
        if (meat.z >= playerZPlane - activeLevel.cubeSpeed && meat.z <= playerZPlane + 20) {
            let distanceX = Math.abs(meat.x - state.playerX);
            let collectionBuffer = (meat.size / 2) + state.playerRadius + 25;

            if (distanceX < collectionBuffer) {
                // SUCCESS: Add 10% to your meat bar and instantly disappear
                state.meatProgress = Math.min(state.meatProgress + 0.10, 1.0);
                playCollectSound('meat');
                state.meats.splice(i, 1);
                continue;
            }
        }

        // Leak-proof cleanup drop
        if (meat.z <= 10) {
            state.meats.splice(i, 1);
        }
    }
}
