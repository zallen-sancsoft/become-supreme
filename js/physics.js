import { NUM_CUBES, MAP_WIDTH, MAX_DEPTH, START_SAFE_ZONE, LEVELS, TILT_CONFIG } from './config.js';
import { controls } from './input.js';

// Moves the array setup logic into the physics module
export function initCubes(state) {
    state.cubes = [];
    for (let i = 0; i < NUM_CUBES; i++) {
        state.cubes.push({
            x: (Math.random() - 0.5) * MAP_WIDTH,
            y: 100,
            z: START_SAFE_ZONE + (Math.random() * (MAX_DEPTH - START_SAFE_ZONE)),
            size: 40,
            color: `#8A9A5B`

        });
    }
}

// Houses the isolated mathematical physics tick
export function updateGame(state) {
    if (state.isGameOver) return;

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

    // 2. Level Progression Evaluations
    let activeLevel = LEVELS[state.currentLevelIndex];
    if (state.currentLevelIndex < LEVELS.length - 1) {
        let nextLevel = LEVELS[state.currentLevelIndex + 1];

        // --- UPDATED LEVEL PROGRESSION LOGIC ---
        if (state.currentLevelIndex === 1) {
            // LEVEL 2 TO 3 CONDITION: Progress ONLY if the pizza is 100% covered in sauce
            if (state.sauceProgress >= 1.0) {
                state.currentLevelIndex++;
                activeLevel = LEVELS[state.currentLevelIndex];
                state.levelUpTimer = 60;
            }
        } else {
            // DEFAULT CONDITION (Level 1 to 2): Progress based on standard score threshold
            if (state.score >= nextLevel.scoreRequired) {
                state.currentLevelIndex++;
                activeLevel = LEVELS[state.currentLevelIndex];
                state.levelUpTimer = 60;
            }
        }
    } else {
        // Keep locked on the final level once reached
        activeLevel = LEVELS[LEVELS.length - 1];
    }
    if (state.levelUpTimer > 0) state.levelUpTimer--;

    updateCollectibles(state);
    updateCheeseCollectibles(state);

    // 3. Object movement and spatial boundaries check
    for (let cube of state.cubes) {
        cube.z -= activeLevel.cubeSpeed;

        // --- ACCURATE 2D PLAYER PLANE COLLISION ---
        // The player sits at Z ≈ 140 on screen. We check a predictive window matching the frame speed.
        let playerZPlane = 85;
        if (cube.z >= playerZPlane - activeLevel.cubeSpeed && cube.z <= playerZPlane + 20) {

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
            }
        }

        // Recycle objects when they fly completely past the screen view (Z <= 20)
        if (cube.z <= 20) {
            cube.z = MAX_DEPTH;
            cube.x = state.playerX + (Math.random() - 0.5) * activeLevel.spawnSpread;
        }
    }

    // Depth sorting
    state.cubes.sort((a, b) => b.z - a.z);
}

// Generates a tomato slice far out in the distance
export function spawnTomato(state) {
    state.tomatoes.push({
        x: (Math.random() - 0.5) * 1500, // Spawn spread matching level 2
        y: 100,
        z: 1200, // Spawn at MAX_DEPTH
        size: 30, // Tomatos are slightly smaller than cubes
        collected: false
    });
}

export function updateCollectibles(state) {
    let activeLevel = LEVELS[state.currentLevelIndex];

    // Spawning routine remains identical
    if (state.currentLevelIndex === 1) {
        if (state.tomatoes.length < 3 && Math.random() < 0.01) {
            state.tomatoes.push({
                x: (Math.random() - 0.5) * 1500,
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
                x: (Math.random() - 0.5) * 1000, // Tighter level 3 spread
                y: 100, // Ground level height
                z: 1200, // Starts far away at MAX_DEPTH
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