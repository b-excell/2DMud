class ExitManager {
    constructor(scene) {
        this.scene = scene;
        this.canTransition = true;
    }

    handleExit(player, exitObj) {
        if (!this.canTransition) return;

        this.canTransition = false;

        const stage = stages[currentStageId];
        const exitIndex = exitObj.exitIndex;

        // Check if this exit has a connection
        if (!stage.exitConnections[exitIndex]) {
            // Generate a new stage
            const newStageId = 'stage-' + (Object.keys(stages).length + 1);
            const newStage = StageGenerator.createStage(newStageId);

            // Store the stage
            stages[newStageId] = newStage;

            // Set up the stage in the scene
            this.scene.stageManager.setupStage(newStageId);

            // Connect to a random exit in the new stage
            if (newStage.exits.length > 0) {
                const newExitIndex = Math.floor(Math.random() * newStage.exits.length);

                // Set up bidirectional connections
                stage.exitConnections[exitIndex] = {
                    stageId: newStage.id,
                    exitIndex: newExitIndex
                };

                newStage.exitConnections[newExitIndex] = {
                    stageId: stage.id,
                    exitIndex: exitIndex
                };
            }
        }

        // Get the connected stage
        const connection = stage.exitConnections[exitIndex];

        if (connection) {
            // Switch to the connected stage
            this.scene.stageManager.setupStage(connection.stageId);

            // Place player near the corresponding exit
            const targetExit = stages[connection.stageId].exits[connection.exitIndex];
            const tileX = targetExit.x * TILE_SIZE + TILE_SIZE / 2;
            const tileY = targetExit.y * TILE_SIZE + TILE_SIZE / 2;

            // Find safe spot near the exit
            const safeSpots = [];

            for (let dy = -2; dy <= 2; dy++) {
                for (let dx = -2; dx <= 2; dx++) {
                    if (dx === 0 && dy === 0) continue; // Skip the exit itself

                    const nx = targetExit.x + dx;
                    const ny = targetExit.y + dy;

                    // Check bounds and if it's an empty tile
                    if (nx >= 0 && nx < STAGE_WIDTH && ny >= 0 && ny < STAGE_HEIGHT &&
                        stages[connection.stageId].tiles[ny][nx] === 0) {
                        safeSpots.push({
                            x: nx * TILE_SIZE + TILE_SIZE / 2,
                            y: ny * TILE_SIZE + TILE_SIZE / 2
                        });
                    }
                }
            }

            // Place player at a safe spot or with an offset from the exit
            if (safeSpots.length > 0) {
                const safeSpot = safeSpots[Math.floor(Math.random() * safeSpots.length)];
                player.x = safeSpot.x;
                player.y = safeSpot.y;
            } else {
                // Fallback: Place with offset
                const offsetX = (Math.random() > 0.5 ? 1 : -1) * TILE_SIZE;
                const offsetY = (Math.random() > 0.5 ? 1 : -1) * TILE_SIZE;
                player.x = tileX + offsetX;
                player.y = tileY + offsetY;
            }
        }

        // Allow transitions again after a short delay
        setTimeout(() => {
            this.canTransition = true;
        }, 500);
    }
}