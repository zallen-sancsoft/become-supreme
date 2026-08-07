import { LEVELS, TILT_CONFIG, screenProps } from './config.js';

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

    // Render Sky and Ground
    ctx.fillStyle = activeLevel.skyColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = activeLevel.groundColor;
    ctx.fillRect(0, screenProps.halfH, canvas.width, screenProps.halfH);

    // Horizon Line
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

            ctx.fillStyle = cube.color;
            ctx.strokeStyle = '#000000'; // Dark outline for depth distinction
            ctx.lineWidth = Math.max(1, scale * 1.5); // Outline scales slightly with depth

            ctx.beginPath();

            // --- DRAW SHAPES CONDITIONALLY BASED ON LEVEL ---
            if (activeLevel.avoidShape === 'triangle') {
                // Draw a Pyramid/Triangle
                ctx.moveTo(screenX, screenY - screenSize);          // Top tip point
                ctx.lineTo(screenX - screenSize / 2, screenY);       // Bottom left corner
                ctx.lineTo(screenX + screenSize / 2, screenY);       // Bottom right corner
            }
            else if (activeLevel.avoidShape === 'diamond') {
                // Draw a Floating Diamond Crystal
                ctx.moveTo(screenX, screenY - screenSize);          // Top point
                ctx.lineTo(screenX + screenSize / 2, screenY - screenSize / 2); // Right side
                ctx.lineTo(screenX, screenY);                       // Bottom point
                ctx.lineTo(screenX - screenSize / 2, screenY - screenSize / 2); // Left side
            }
            else {
                // Default: Draw Classic Cubefield Square
                ctx.rect(screenX - screenSize / 2, screenY - screenSize, screenSize, screenSize);
            }

            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    }

    // Draw Ship Avatar
    let px = canvas.width / 2;
    let py = canvas.height - 50;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(state.playerTilt);
    ctx.beginPath();
    ctx.ellipse(0, 0, state.playerRadius * 0.8, state.playerRadius * 1.2, 0, 0, 2 * Math.PI);
    ctx.fillStyle = '#333333'; ctx.fill();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.stroke();
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.moveTo(0, -state.playerRadius * 0.8); ctx.lineTo(-5, 0); ctx.lineTo(5, 0); ctx.fill();
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
    ctx.fillStyle = (activeLevel.skyColor === '#111122') ? '#ffffff' : '#000000';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('LEVEL: ' + (state.currentLevelIndex + 1), 20 + insets.left, 40 + insets.top);
    ctx.fillText('SCORE: ' + state.score, 20 + insets.left, 70 + insets.top);

    // End Game Overlay
    if (state.isGameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 40px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '20px sans-serif'; ctx.fillStyle = '#aaaaaa';
        ctx.fillText('Tap Screen or Space to Restart', canvas.width / 2, canvas.height / 2 + 30);
    }
}
