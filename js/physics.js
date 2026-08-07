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
            color: `hsl(${Math.random() * 40 + 20}, 100%, 50%)`
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
        if (state.score >= nextLevel.scoreRequired) {
            state.currentLevelIndex++;
            activeLevel = LEVELS[state.currentLevelIndex];
            state.levelUpTimer = 60;
        }
    }

    if (state.levelUpTimer > 0) state.levelUpTimer--;

    // 3. Object movement and spatial boundaries check
    for (let cube of state.cubes) {
        cube.z -= activeLevel.cubeSpeed;

        // 1. Get the current speed of the cubes for this level
        let speed = activeLevel.cubeSpeed;

        // 2. Check if the cube is touching or has crossed past the player's camera plane
        // Instead of checking if Z is between 0 and 30, we check if it is between 0 and its current frame speed
        if (cube.z > 0 && cube.z <= speed + 10) { // added a tiny 10-unit safety padding

            // 3. Calculate horizontal distance
            let distanceX = Math.abs(cube.x - state.playerX);

            // 4. Adapt the buffer size dynamically based on the shape's visual width
            let visualWidthFactor = 1.0;
            if (activeLevel.cubeShape === 'triangle' || activeLevel.cubeShape === 'diamond') {
                visualWidthFactor = 0.85; // slightly narrower footprint for pointed shapes
            }

            let collisionBuffer = (cube.size / 2 * visualWidthFactor) + state.playerRadius;

            // 5. Trigger Game Over immediately
            if (distanceX < collisionBuffer) {
                state.isGameOver = true;
            }
        }

        // Deep horizon recycling pool
        if (cube.z <= 0) {
            cube.z = MAX_DEPTH;
            cube.x = state.playerX + (Math.random() - 0.5) * activeLevel.spawnSpread;
        }
    }

    // Depth sorting
    state.cubes.sort((a, b) => b.z - a.z);
}
