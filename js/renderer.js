import { LEVELS, TILT_CONFIG, screenProps, PIZZA_THEME } from './config.js';

export function getSafeInsets() {
    const style = getComputedStyle(document.documentElement);
    return {
        top: parseInt(style.getPropertyValue('--safe-top')) || 0,
        left: parseInt(style.getPropertyValue('--safe-left')) || 0
    };
}

export function drawGame(ctx, canvas, state) {
    let activeLevel = LEVELS[state.currentLevelIndex];
    const insets = getSafeInsets();

    // 1. SAVE CANVAS STATE BEFORE APPLYING SHAKE
    ctx.save();

    if (state.shakeTimer > 0) {
        let intensity = (state.shakeTimer / 30) * 15;
        let shakeX = (Math.random() - 0.5) * intensity;
        let shakeY = (Math.random() - 0.5) * intensity;
        ctx.translate(shakeX, shakeY);
    }

    // 2. RENDER SHAKING CHANNELS (Sky, Ground, Horizon Line)
    ctx.fillStyle = activeLevel.skyColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = activeLevel.groundColor;
    ctx.fillRect(0, screenProps.halfH, canvas.width, screenProps.halfH);

    ctx.strokeStyle = '#999';
    ctx.beginPath(); ctx.moveTo(0, screenProps.halfH); ctx.lineTo(canvas.width, screenProps.halfH); ctx.stroke();

    // Draw Projected Cubes
    for (let cube of state.cubes) {
        let relativeX = cube.x - state.playerX;
        let scale = screenProps.projectionDist / cube.z;

        let screenX = screenProps.halfW + (relativeX * scale);
        let screenY = screenProps.halfH + (cube.y * scale);
        let screenSize = cube.size * scale;

        // Only draw the obstacle if it is actually visible on the screen
        if (screenX + screenSize > 0 && screenX - screenSize < canvas.width) {

            ctx.save();
            ctx.strokeStyle = '#1e3f20'; // Dark forest green outline
            ctx.lineWidth = Math.max(1, scale * 1.5);

            // --- DRAW SHAPES CONDITIONALLY BASED ON LEVEL ---
            if (state.currentLevelIndex === 0) {
                // --- LEVEL 1: VEGAN VECTOR CACTUS ---
                ctx.fillStyle = '#38761d'; // Vibrant desert green

                // Central main trunk dimensions
                let trunkW = screenSize * 0.35;
                let trunkH = screenSize;

                ctx.beginPath();
                // Draw main center pillar
                ctx.rect(screenX - trunkW / 2, screenY - trunkH, trunkW, trunkH);
                ctx.fill();
                ctx.stroke();
                ctx.closePath();

                // Left Branch
                ctx.beginPath();
                ctx.moveTo(screenX - trunkW / 2, screenY - trunkH * 0.4);
                ctx.lineTo(screenX - screenSize * 0.4, screenY - trunkH * 0.4); // Branch out
                ctx.lineTo(screenX - screenSize * 0.4, screenY - trunkH * 0.7); // Branch up
                ctx.lineTo(screenX - screenSize * 0.4 + trunkW * 0.6, screenY - trunkH * 0.7); // Top thickness
                ctx.lineTo(screenX - screenSize * 0.4 + trunkW * 0.6, screenY - trunkH * 0.4 + trunkW * 0.6); // Corner inner
                ctx.lineTo(screenX - trunkW / 2, screenY - trunkH * 0.4 + trunkW * 0.6); // Back to trunk
                ctx.fill();
                ctx.stroke();
                ctx.closePath();

                // Right Branch (Slightly staggered height for visual asymmetry)
                ctx.beginPath();
                ctx.moveTo(screenX + trunkW / 2, screenY - trunkH * 0.5);
                ctx.lineTo(screenX + screenSize * 0.4, screenY - trunkH * 0.5); // Branch out
                ctx.lineTo(screenX + screenSize * 0.4, screenY - trunkH * 0.8); // Branch up
                ctx.lineTo(screenX + screenSize * 0.4 - trunkW * 0.6, screenY - trunkH * 0.8); // Top thickness
                ctx.lineTo(screenX + screenSize * 0.4 - trunkW * 0.6, screenY - trunkH * 0.5 + trunkW * 0.6); // Corner inner
                ctx.lineTo(screenX + trunkW / 2, screenY - trunkH * 0.5 + trunkW * 0.6); // Back to trunk
                ctx.fill();
                ctx.stroke();
                ctx.closePath();
            }
            else if (state.currentLevelIndex === 1) {
                // --- LEVEL 2 (SAUCING): WOODEN PICKET FENCE ---
                ctx.fillStyle = '#8b5a2b';   // Rich wooden brown color
                ctx.strokeStyle = '#4a2e16'; // Dark brown outline for depth texture
                ctx.lineWidth = Math.max(1, scale * 1.5);

                // Fence dimensional mapping based on core 3D projection parameters
                let totalFenceW = screenSize * 1.2; // Slightly wider than standard cubes
                let fenceH = screenSize * 0.8;       // Slightly shorter than standard cubes
                let fenceStartX = screenX - totalFenceW / 2;

                ctx.beginPath();

                // 1. DRAW HORIZONTAL SUPPORT RAILS
                // Top cross-beam
                ctx.rect(fenceStartX, screenY - fenceH * 0.75, totalFenceW, fenceH * 0.15);
                // Bottom cross-beam
                ctx.rect(fenceStartX, screenY - fenceH * 0.35, totalFenceW, fenceH * 0.15);
                ctx.fill();
                ctx.stroke();
                ctx.closePath();

                // 2. DRAW 4 VERTICAL PICKET POSTS (with pointed triangular tips)
                let picketCount = 4;
                let picketW = totalFenceW * 0.15;
                // Spacing distance between individual vertical slats
                let spacing = (totalFenceW - (picketW * picketCount)) / (picketCount - 1);

                for (let p = 0; p < picketCount; p++) {
                    let picketX = fenceStartX + p * (picketW + spacing);

                    ctx.beginPath();
                    // Start at bottom of the picket on the ground line
                    ctx.moveTo(picketX, screenY);
                    // Line straight up to the shoulder edge
                    ctx.lineTo(picketX, screenY - fenceH * 0.85);
                    // Diagonal line to the center tip point
                    ctx.lineTo(picketX + picketW / 2, screenY - fenceH);
                    // Diagonal down to the right shoulder edge
                    ctx.lineTo(picketX + picketW, screenY - fenceH * 0.85);
                    // Line straight down back to the ground plane
                    ctx.lineTo(picketX + picketW, screenY);

                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                }
            }
            else if (state.currentLevelIndex === 2) {
                // --- LEVEL 3 (CHEESING): HOOFING VECTOR COW ---
                ctx.save();

                // Core sizing references mapped to our 3D projection engine
                let bodyW = screenSize * 1.3;  // Wide body profile
                let bodyH = screenSize * 0.7;  // Short torso profile
                let cowX = screenX - bodyW / 2; // Left anchor point
                let cowY = screenY - bodyH - (screenSize * 0.3); // Raised slightly to clear legs

                ctx.lineWidth = Math.max(1, scale * 1.5);
                ctx.strokeStyle = '#222222'; // Clean dark outline

                // 1. DRAW 4 LEGS (Sturdy black pegs sitting on the ground)
                ctx.fillStyle = '#111111';
                let legW = bodyW * 0.12;
                let legH = screenSize * 0.3;
                // Front Legs
                ctx.fillRect(cowX + bodyW * 0.1, screenY - legH, legW, legH);
                ctx.strokeRect(cowX + bodyW * 0.1, screenY - legH, legW, legH);
                ctx.fillRect(cowX + bodyW * 0.3, screenY - legH, legW, legH);
                ctx.strokeRect(cowX + bodyW * 0.3, screenY - legH, legW, legH);
                // Back Legs
                ctx.fillRect(cowX + bodyW * 0.6, screenY - legH, legW, legH);
                ctx.strokeRect(cowX + bodyW * 0.6, screenY - legH, legW, legH);
                ctx.fillRect(cowX + bodyW * 0.8, screenY - legH, legW, legH);
                ctx.strokeRect(cowX + bodyW * 0.8, screenY - legH, legW, legH);

                // 2. DRAW THE MAIN TORSO (White base container)
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.rect(cowX, cowY, bodyW, bodyH);
                ctx.fill();
                ctx.stroke();
                ctx.closePath();

                // 3. ADD COWS SPOTS (Irregular dark spots inside the torso boundaries)
                ctx.fillStyle = '#111111';
                ctx.beginPath();
                // Center spot
                ctx.arc(cowX + bodyW * 0.5, cowY + bodyH * 0.4, bodyH * 0.3, 0, 2 * Math.PI);
                // Back flank spot
                ctx.arc(cowX + bodyW * 0.8, cowY + bodyH * 0.3, bodyH * 0.25, 0, 2 * Math.PI);
                // Low belly spot
                ctx.arc(cowX + bodyW * 0.2, cowY + bodyH * 0.7, bodyH * 0.2, 0, 2 * Math.PI);
                ctx.fill();
                ctx.closePath();

                // 4. DRAW THE NECK AND HEAD (Positioned on the left side)
                ctx.fillStyle = '#ffffff';
                let headW = screenSize * 0.5;
                let headH = screenSize * 0.5;
                let headX = cowX - headW * 0.3;
                let headY = cowY - headH * 0.4;

                ctx.beginPath();
                ctx.rect(headX, headY, headW, headH);
                ctx.fill();
                ctx.stroke();
                ctx.closePath();

                // Pink Snout overlay
                ctx.fillStyle = '#ffb6c1'; // Soft pink
                ctx.beginPath();
                ctx.rect(headX, headY + headH * 0.5, headW, headH * 0.5);
                ctx.fill();
                ctx.stroke();
                ctx.closePath();

                // Cute Black Eyes
                ctx.fillStyle = '#111111';
                ctx.beginPath();
                ctx.arc(headX + headW * 0.3, headY + headH * 0.3, Math.max(1, scale * 1.5), 0, 2 * Math.PI);
                ctx.arc(headX + headW * 0.7, headY + headH * 0.3, Math.max(1, scale * 1.5), 0, 2 * Math.PI);
                ctx.fill();
                ctx.closePath();

                // Small triangular ears
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.moveTo(headX, headY);
                ctx.lineTo(headX - headW * 0.2, headY - headH * 0.2);
                ctx.lineTo(headX + headW * 0.2, headY);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                ctx.restore();
            }
            else if (state.currentLevelIndex === 3) {
                // --- LEVEL 4 (TOPPING): CAST-IRON SKILLET ---
                ctx.save();

                let panRadius = screenSize * 0.5;
                let handleW = screenSize * 0.7;
                let handleH = screenSize * 0.12;

                // Draw the long skillet handle shooting out to the side
                ctx.fillStyle = '#1c1c1c'; // Dark charcoal cast iron
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = Math.max(1, scale * 1.2);
                ctx.fillRect(screenX + panRadius * 0.5, screenY - panRadius - handleH / 2, handleW, handleH);
                ctx.strokeRect(screenX + panRadius * 0.5, screenY - panRadius - handleH / 2, handleW, handleH);

                // Draw the deep main circular pan
                ctx.fillStyle = '#2b2b2b';
                ctx.beginPath();
                ctx.arc(screenX, screenY - panRadius, panRadius, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
                ctx.closePath();

                // Draw an inner lighter ring to mimic the rim of a frying pan
                ctx.strokeStyle = '#444444';
                ctx.beginPath();
                ctx.arc(screenX, screenY - panRadius, panRadius * 0.8, 0, 2 * Math.PI);
                ctx.stroke();
                ctx.closePath();

                ctx.restore();
            }
            else if (state.currentLevelIndex === 4) {
                // --- LEVEL 5 (MEATING): SPINNING 3D PIZZA CUTTER ---
                ctx.save();

                // Core sizing parameters mapped to our 3D perspective projection
                let bladeRadius = screenSize * 0.45; // Size of the circular cutting wheel
                let handleH = screenSize * 0.8;      // Height of the structural handle
                let handleW = screenSize * 0.14;     // Width of the handle stem

                // 1. DRAW THE HANDLE AND EXTENSION SHAFT (Standing up from the track)
                ctx.fillStyle = '#cc1111'; // Classic commercial red handle
                ctx.strokeStyle = '#660000';
                ctx.lineWidth = Math.max(1, scale * 1.2);

                ctx.beginPath();
                // Draws the main thick handle grip at the base
                ctx.rect(screenX - handleW / 2, screenY - handleH * 0.6, handleW, handleH * 0.6);
                ctx.fill();
                ctx.stroke();
                ctx.closePath();

                // Metallic connecting fork shaft
                ctx.fillStyle = '#aaaaaa';
                ctx.strokeStyle = '#444444';
                ctx.fillRect(screenX - handleW * 0.3, screenY - handleH, handleW * 0.6, handleH * 0.4);
                ctx.strokeRect(screenX - handleW * 0.3, screenY - handleH, handleW * 0.6, handleH * 0.4);

                // 2. TRANSLATE TO CUTTING WHEEL HUB FOR DYNAMIC SPINNING
                // We shift our coordinate context right to the center axis point of the silver blade
                ctx.translate(screenX, screenY - handleH);

                // DYNAMIC ANIMATION CALCULATION:
                // Uses the player's cumulative score as a continuous timeline seed to turn the wheel
                let spinAngle = (state.score * 0.12) % (Math.PI * 2);
                ctx.rotate(spinAngle);

                // 3. DRAW THE MAIN CIRCULAR CUTTING BLADE
                ctx.fillStyle = '#e6e6e6'; // Bright reflective steel color
                ctx.strokeStyle = '#737373';

                ctx.beginPath();
                ctx.arc(0, 0, bladeRadius, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
                ctx.closePath();

                // 4. ADD VISUAL BLADE SPINDLES / SHARP BLADE SLATS
                // Drawing explicit cross-lines inside the circle makes the spinning motion visible to the player!
                ctx.strokeStyle = '#999999';
                ctx.lineWidth = Math.max(1, scale * 1.0);

                ctx.beginPath();
                // 3 crossing intersection lines to create a 6-spoke steel layout
                for (let i = 0; i < 3; i++) {
                    let angle = (i * Math.PI) / 3;
                    ctx.moveTo(Math.cos(angle) * bladeRadius, Math.sin(angle) * bladeRadius);
                    ctx.lineTo(-Math.cos(angle) * bladeRadius, -Math.sin(angle) * bladeRadius);
                }
                ctx.stroke();
                ctx.closePath();

                // Center dark metal rivet pin cap
                ctx.fillStyle = '#333333';
                ctx.beginPath();
                ctx.arc(0, 0, bladeRadius * 0.15, 0, 2 * Math.PI);
                ctx.fill();
                ctx.closePath();

                ctx.restore();
            }

            ctx.restore();
        }
    }

    // --- REPLACE THE TOMATO FOR-LOOP IN renderer.js WITH THIS ---
    for (let tomato of state.tomatoes) {
        // 1. Calculate relative horizontal position based on player steering camera
        let relativeX = tomato.x - state.playerX;

        // 2. Calculate the 3D perspective scale factor based on depth (Z)
        let scale = screenProps.projectionDist / tomato.z;

        // 3. Project 3D coordinates onto the flat 2D screen grid
        let screenX = screenProps.halfW + (relativeX * scale);

        // Core Correction: Match the exact 3D ground projection formula used by cubes
        let screenY = screenProps.halfH + (tomato.y * scale);
        let screenSize = tomato.size * scale;

        // Only render if it is physically visible on the canvas
        if (screenX + screenSize > 0 && screenX - screenSize < canvas.width) {
            ctx.save();

            // Draw the glossy red outer tomato wheel
            ctx.fillStyle = '#ff3333';
            ctx.strokeStyle = '#990000';
            ctx.lineWidth = Math.max(1, scale * 1.5);

            ctx.beginPath();
            // Sits perfectly flat on the ground plane, scaling outward from its center
            ctx.arc(screenX, screenY - screenSize / 2, screenSize / 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            ctx.closePath();

            // Inner wedge/seed segments
            ctx.fillStyle = '#ff6666';
            ctx.beginPath();
            ctx.arc(screenX - screenSize / 5, screenY - screenSize / 2, screenSize / 6, 0, 2 * Math.PI);
            ctx.arc(screenX + screenSize / 5, screenY - screenSize / 2, screenSize / 6, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();

            ctx.restore();
        }
    }

    for (let cheese of state.cheeseSlices) {
        let relativeX = cheese.x - state.playerX;
        let scale = screenProps.projectionDist / cheese.z;

        let screenX = screenProps.halfW + (relativeX * scale);
        let screenY = screenProps.halfH + (cheese.y * scale);
        let screenSize = cheese.size * scale;

        if (screenX + screenSize > 0 && screenX - screenSize < canvas.width) {
            ctx.save();

            // Draw a triangular wedge of Swiss/Mozzarella cheese
            ctx.fillStyle = '#fff099'; // Bright cheese yellow
            ctx.strokeStyle = '#cca300'; // Golden outline
            ctx.lineWidth = Math.max(1, scale * 1.5);

            ctx.beginPath();
            // Sits flat on the track, drawing a triangular wedge shape
            ctx.moveTo(screenX, screenY - screenSize);                  // Top tip
            ctx.lineTo(screenX - screenSize / 2, screenY);               // Bottom left
            ctx.lineTo(screenX + screenSize / 2, screenY);               // Bottom right
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Draw cute little cheese holes inside the slice
            ctx.fillStyle = '#e6c84d';
            ctx.beginPath();
            ctx.arc(screenX - screenSize / 6, screenY - screenSize / 3, screenSize / 10, 0, 2 * Math.PI);
            ctx.arc(screenX + screenSize / 8, screenY - screenSize / 2, screenSize / 12, 0, 2 * Math.PI);
            ctx.arc(screenX, screenY - screenSize / 6, screenSize / 14, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();

            ctx.restore();
        }
    }

    for (let veg of state.veggies) {
        let relativeX = veg.x - state.playerX;
        let scale = screenProps.projectionDist / veg.z;

        let screenX = screenProps.halfW + (relativeX * scale);
        let screenY = screenProps.halfH + (veg.y * scale);
        let screenSize = veg.size * scale;

        if (screenX + screenSize > 0 && screenX - screenSize < canvas.width) {
            ctx.save();
            ctx.lineWidth = Math.max(1, scale * 1.2);

            if (veg.type === 'pepper') {
                // Draw a shiny green bell pepper slice (hollow ring)
                ctx.strokeStyle = '#1e5614';
                ctx.fillStyle = '#44ad29';
                ctx.beginPath();
                ctx.arc(screenX, screenY - screenSize / 2, screenSize / 2, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();

                // Cutout inner core center hole
                ctx.fillStyle = activeLevel.groundColor; // Matches the floor color
                ctx.beginPath();
                ctx.arc(screenX, screenY - screenSize / 2, screenSize / 3, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
            }
            else {
                // Draw a purple onion crescent wedge
                ctx.strokeStyle = '#4a154b';
                ctx.fillStyle = '#ba55d3'; // Orchid purple
                ctx.beginPath();
                ctx.arc(screenX, screenY, screenSize * 0.6, Math.PI, 2 * Math.PI); // Arching semicircle
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Add interior white onion layering rings
                ctx.strokeStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(screenX, screenY, screenSize * 0.4, Math.PI, 2 * Math.PI);
                ctx.stroke();
            }

            ctx.restore();
        }
    }

    for (let meat of state.meats) {
        let relativeX = meat.x - state.playerX;
        let scale = screenProps.projectionDist / meat.z;

        let screenX = screenProps.halfW + (relativeX * scale);
        let screenY = screenProps.halfH + (meat.y * scale);
        let screenSize = meat.size * scale;

        if (screenX + screenSize > 0 && screenX - screenSize < canvas.width) {
            ctx.save();
            ctx.lineWidth = Math.max(1, scale * 1.2);

            if (meat.type === 'pep') {
                // Draw a deep red Pepperoni slice circle
                ctx.fillStyle = '#b71c1c';
                ctx.strokeStyle = '#5f0909';
                ctx.beginPath();
                ctx.arc(screenX, screenY - screenSize / 2, screenSize / 2, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
                ctx.closePath();

                // Add tiny stylized fat-marbling speckles inside the pepperoni
                ctx.fillStyle = '#ffcdd2';
                ctx.beginPath();
                ctx.arc(screenX - screenSize / 4, screenY - screenSize / 2, 1.5 * scale, 0, 2 * Math.PI);
                ctx.arc(screenX + screenSize / 5, screenY - screenSize / 3, 1 * scale, 0, 2 * Math.PI);
                ctx.fill();
            }
            else {
                // Draw a lumpy, rustic brown Italian Sausage chunk
                ctx.fillStyle = '#5c3a21'; // Cooked meat brown
                ctx.strokeStyle = '#2e1a0b';
                ctx.beginPath();
                // Create an irregular jagged meat lump path
                ctx.moveTo(screenX - screenSize / 2, screenY);
                ctx.lineTo(screenX - screenSize / 3, screenY - screenSize * 0.8);
                ctx.lineTo(screenX + screenSize / 4, screenY - screenSize * 0.9);
                ctx.lineTo(screenX + screenSize / 2, screenY - screenSize * 0.4);
                ctx.lineTo(screenX + screenSize / 3, screenY);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }

            ctx.restore();
        }
    }

    // Draw Ship Avatar
    // --- REPLACE THE PLAYER AVATAR BLOCK IN renderer.js WITH THIS ---

    let px = canvas.width / 2;
    let py = canvas.height - 50;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(state.playerTilt);



    // --- PROGRESSION PERCENTAGE CALCULATIONS ---
    let currentLevel = state.currentLevelIndex;
    let crustColor = `rgb(${PIZZA_THEME.crustStart.r}, ${PIZZA_THEME.crustStart.g}, ${PIZZA_THEME.crustStart.b})`;
    let sauceOpacity = 0;
    let cheeseOpacity = 0;

    if (currentLevel === 0) {
        // LEVEL 1: Crust slowly bakes from light to dark brown
        let maxLevelScore = LEVELS[1].scoreRequired;
        let pct = Math.min(state.score / maxLevelScore, 1); // 0.0 to 1.0 progression

        // Linear interpolation math to blend RGB values smoothly
        let r = Math.floor(PIZZA_THEME.crustStart.r + (PIZZA_THEME.crustEnd.r - PIZZA_THEME.crustStart.r) * pct);
        let g = Math.floor(PIZZA_THEME.crustStart.g + (PIZZA_THEME.crustEnd.g - PIZZA_THEME.crustStart.g) * pct);
        let b = Math.floor(PIZZA_THEME.crustStart.b + (PIZZA_THEME.crustEnd.b - PIZZA_THEME.crustStart.b) * pct);
        crustColor = `rgb(${r}, ${g}, ${b})`;
    }
    // --- UPDATE THE LEVEL 2 IF-STATEMENT INSIDE drawGame() IN renderer.js ---
    else if (currentLevel === 1) {
        crustColor = `rgb(${PIZZA_THEME.crustEnd.r}, ${PIZZA_THEME.crustEnd.g}, ${PIZZA_THEME.crustEnd.b})`;

        // OLD TIME-BASED WAY: sauceOpacity = pct;
        // NEW COLLECTIBLE-BASED WAY: 
        sauceOpacity = state.sauceProgress;
    } 
    else {
        // LEVEL 3+: Crust is dark, sauce is full, cheese slowly sprinkles/melts on top
        crustColor = `rgb(${PIZZA_THEME.crustEnd.r}, ${PIZZA_THEME.crustEnd.g}, ${PIZZA_THEME.crustEnd.b})`;
        sauceOpacity = 1.0;

        // OLD TIME-BASED WAY: let pct = Math.min((state.score - levelStartScore) / 1000, 1); cheeseOpacity = pct;
        // NEW COLLECTIBLE-BASED WAY:
        cheeseOpacity = state.cheeseProgress; 
    }

    // --- LAYER 1: THE DOUGH CRUST BASE ---
    ctx.beginPath();
    ctx.arc(0, 0, state.playerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = crustColor;
    ctx.fill();
    ctx.strokeStyle = '#2d1500';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();

    // --- LAYER 2: THE TOMATO SAUCE LAYER ---
    if (sauceOpacity > 0) {
        ctx.beginPath();
        ctx.arc(0, 0, state.playerRadius * 0.78, 0, 2 * Math.PI);
        ctx.fillStyle = PIZZA_THEME.sauceColor + sauceOpacity + ')';
        ctx.fill();
        ctx.closePath();
    }

    // --- LAYER 3: THE MELTING CHEESE LAYER ---
    if (cheeseOpacity > 0) {
        ctx.beginPath();
        // Slightly smaller radius so a rim of red sauce peeks out from under the cheese edge
        ctx.arc(0, 0, state.playerRadius * 0.70, 0, 2 * Math.PI);
        ctx.fillStyle = PIZZA_THEME.cheeseColor + cheeseOpacity + ')';
        ctx.fill();
        ctx.closePath();
    }

    // --- LAYER 4: DETAILED TEXTURE ACCENTS ---
    // Add 3 pepperonis that only appear once there is a solid base of sauce and cheese
    /*if (currentLevel >= 2) {
        ctx.fillStyle = '#b71c1c';
        let pepRadius = state.playerRadius * 0.16;
        ctx.beginPath();
        ctx.arc(-4, -4, pepRadius, 0, 2 * Math.PI);
        ctx.arc(4, -2, pepRadius, 0, 2 * Math.PI);
        ctx.arc(-1, 4, pepRadius, 0, 2 * Math.PI);
        ctx.fill();
    }*/

    if (state.currentLevelIndex === 3 && state.toppingProgress > 0) {
        // Draw 3 tiny green dashes on the pizza indicating seasoning/peppers!
        ctx.strokeStyle = '#44ad29';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(-6, 2); ctx.lineTo(-2, 4);
        ctx.moveTo(4, 3); ctx.lineTo(8, 1);
        ctx.stroke();
    }

    ctx.restore();
    ctx.restore();


    // Level Up Flashes
    if (state.levelUpTimer > 0) {
        ctx.save();
        ctx.globalAlpha = state.levelUpTimer / 60;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, canvas.height / 2 - 50, canvas.width, 90);
        ctx.fillStyle = '#ffcc00'; ctx.font = 'bold 36px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('LEVEL UP!', canvas.width / 2, canvas.height / 2 + 2);
        ctx.fillStyle = '#ffffff'; ctx.font = '16px sans-serif';
        ctx.fillText('SPEED INCREASED!', canvas.width / 2, canvas.height / 2 + 28);
        ctx.restore();
    }

    // Interface Scores
    // 1. Calculate the active level progress percentage (0.0 to 1.0)
    let progressPct = 0;

    if (state.currentLevelIndex === 0) {
        let target = LEVELS[1].scoreRequired;
        progressPct = Math.min(state.score / target, 1.0);
    } else if (state.currentLevelIndex === 1) {
        progressPct = state.sauceProgress;
    } else if (state.currentLevelIndex === 2) {
        progressPct = state.cheeseProgress;
    } else if (state.currentLevelIndex === 3) {
        progressPct = state.toppingProgress;
    } else {
        // Level 5 (Meating Stage): Links bar to meat collections!
        progressPct = state.meatProgress;
    }

    // 2. Define sizing parameters for our UI Bar
    let barW = 180; // Total width of the progress bar in pixels
    let barH = 16;  // Height of the progress bar
    let barX = 20 + insets.left;
    let barY = 55 + insets.top;

    // 3. Draw Level Title Text Above the Bar
    const LEVEL_NAMES = ["Baking", "Saucing", "Cheesing", "Vegging", "Meating"];  // Added Topping
    let currentStepName = LEVEL_NAMES[state.currentLevelIndex] || "Meating";


    // 2. Define sizing parameters for our UI Bar (kept exactly the same)
    //let barW = 180;
    //let barH = 16;
    //let barX = 20 + insets.left;
    //let barY = 55 + insets.top;

    // 3. Draw Cooking Step Title Text Above the Bar
    ctx.fillStyle = (activeLevel.skyColor === '#111122') ? '#ffffff' : '#000000';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'left';

    // UPDATED LINE: Draws "Baking", "Saucing", or "Cheesing" instead of "LEVEL X"
    ctx.fillText(currentStepName, barX, barY - 12); 


    // 4. Draw Progress Bar Background Container
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // Translucent backing tray
    ctx.fillRect(barX, barY, barW, barH);

    // 5. Draw Dynamic Filled Progress Portion
    // Pick an accent color based on what layer you are assembling
    let barColor = '#f4d068'; // Level 1: Golden dough theme color
    if (state.currentLevelIndex === 1) barColor = '#ff3333'; // Level 2: Tomato Sauce theme red
    if (state.currentLevelIndex === 2) barColor = '#ffdf7a'; // Level 3: Mozzarella Cheese theme yellow
    if (state.currentLevelIndex === 3) barColor = '#228b22'; // Level 4: Forest Green for Veggies
    if (state.currentLevelIndex === 4) barColor = '#a52a2a'; // Level 5: Rich Brown for Meats

    ctx.fillStyle = barColor;
    ctx.fillRect(barX, barY, barW * progressPct, barH);

    // 6. Draw clean outline container around the bar
    ctx.strokeStyle = (activeLevel.skyColor === '#111122') ? '#ffffff' : '#333333';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barW, barH);

    // End Game Overlay
    if (state.isGameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 40px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '20px sans-serif'; ctx.fillStyle = '#aaaaaa';
        ctx.fillText('Tap Screen or Space to Restart', canvas.width / 2, canvas.height / 2 + 30);
    }

    if (state.isMenuOpen) {
        // Semi-transparent clean dark backdrop overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.82)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 1. Draw Stylized Title Headline
        ctx.fillStyle = '#ffcc00'; // Warm pizza cheese gold
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('BECOME SUPREME', canvas.width / 2, canvas.height / 2 - 120);

        // Subtitle Instructions
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px sans-serif';
        ctx.fillText('Adventure to transform from a humble', canvas.width / 2, canvas.height / 2 - 35);
        ctx.fillText('crust into a supreme pizza!', canvas.width / 2, canvas.height / 2 - 10);
        ctx.fillText('Steer Left/Right to dodge obstacles', canvas.width / 2, canvas.height / 2 + 15);
        ctx.fillText('and gather ingredients using', canvas.width / 2, canvas.height / 2 + 40);
        ctx.fillText('left and righ arrow keys or tapping', canvas.width / 2, canvas.height / 2 + 65);
        ctx.fillText('the right and left side of your screen', canvas.width / 2, canvas.height / 2 + 90);
        /*ctx.fillText('Assemble the ultimate pizza across 5 culinary stages!', canvas.width / 2, canvas.height / 2 - 35);
        ctx.fillText('Steer Left/Right to dodge obstacles and gather ingredients.', canvas.width / 2, canvas.height / 2 - 10);*/

        // 2. Draw Interactive Start Button Box
        let btnW = 220;
        let btnH = 50;
        let btnX = canvas.width / 2 - btnW / 2;
        let btnY = canvas.height / 2 + 160;

        ctx.fillStyle = '#ff3333'; // Vibrant marinara red button color
        ctx.beginPath();
        // Custom smooth rounded corners for an arcade button look
        ctx.roundRect(btnX, btnY, btnW, btnH, 8);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.closePath();

        // 3. Draw Button Call-To-Action Text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText('START', canvas.width / 2, btnY + 31);
    }

    if (state.isVictory) {
        // Semi-transparent deep emerald/gold victory overlay backing panel
        ctx.fillStyle = 'rgba(15, 32, 15, 0.88)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 1. Victory Message Texts
        ctx.fillStyle = '#ffcc00'; // Crown Gold
        ctx.font = 'bold 46px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('CHEF VICTORY!', canvas.width / 2, canvas.height / 2 - 90);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText('The Ultimate Pizza is Fully Assembled!', canvas.width / 2, canvas.height / 2 - 40);

        ctx.fillStyle = '#b3ffb3';
        ctx.font = '16px sans-serif';
        ctx.fillText('Total Survival Score: ' + state.score, canvas.width / 2, canvas.height / 2 - 10);

        // Display current loop index context
        let loopLabel = state.ngPlusCount === 0 ? "First Complete Run" : "Completed NG+" + state.ngPlusCount;
        ctx.fillText('Current Status: ' + loopLabel, canvas.width / 2, canvas.height / 2 + 15);

        // 2. Render Interactive "START NEW GAME+" Button Boundary Box
        let vBtnW = 260;
        let vBtnH = 52;
        let vBtnX = canvas.width / 2 - vBtnW / 2;
        let vBtnY = canvas.height / 2 + 65;

        ctx.fillStyle = '#ff9900'; // Bright blazing orange button
        ctx.beginPath();
        ctx.roundRect(vBtnX, vBtnY, vBtnW, vBtnH, 8);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.closePath();

        // Button text prompt
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px sans-serif';
        // Dynamic naming updates: "START NG+1", "START NG+2"...
        ctx.fillText('ENTER NEW GAME+ ' + (state.ngPlusCount + 1), canvas.width / 2, vBtnY + 32);

        ctx.fillStyle = '#aaaaaa';
        ctx.font = 'italic 13px sans-serif';
        ctx.fillText('(WARNING: Speed increases, fields tighten!)', canvas.width / 2, vBtnY + 80);
    }
}


