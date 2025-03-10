import { StageGenerator } from "./StageGenerator.js";
import { STAGE_WIDTH, STAGE_HEIGHT, TILE_SIZE, PLAYER_RADIUS, COLOR_PLAYER } from "../config.js";
import { gameState } from "../core/GameState.js";
import { CircleComponent } from "../components/CircleComponent.js";
import { PhysicsCapability } from "../components/PhysicsCapability.js";
import { KeyboardInputComponent } from "../components/KeyboardInputComponent.js";
import { TransformComponent } from "../components/TransformComponent.js";

export class ExitManager {
    constructor(scene) {
        this.scene = scene;
        this.canTransition = true;
    }

    handleExit(playerEntity, exitIndex) {
        if (!this.canTransition) return;

        this.canTransition = false;

        const stage = gameState.stages[gameState.currentStageId];

        // Check if this exit has a connection
        if (!stage.exitConnections[exitIndex]) {
            // Generate a new stage
            const newStageId = 'stage-' + (Object.keys(gameState.stages).length + 1);
            const newStage = StageGenerator.createStage(newStageId);

            // Store the stage
            gameState.registerStage(newStage);

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
            const targetExit = gameState.stages[connection.stageId].exits[connection.exitIndex];
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
                        gameState.stages[connection.stageId].tiles[ny][nx] === 0) {
                        safeSpots.push({
                            x: nx * TILE_SIZE + TILE_SIZE / 2,
                            y: ny * TILE_SIZE + TILE_SIZE / 2
                        });
                    }
                }
            }

            // Get the player components
            const transform = playerEntity.getComponent('transform');
            const physics = playerEntity.getComponent('physics');

            // Define safe position
            let safeX, safeY;

            if (safeSpots.length > 0) {
                const safeSpot = safeSpots[Math.floor(Math.random() * safeSpots.length)];
                safeX = safeSpot.x;
                safeY = safeSpot.y;
            } else {
                // Fallback: Place with offset
                const offsetX = (Math.random() > 0.5 ? 1 : -1) * TILE_SIZE;
                const offsetY = (Math.random() > 0.5 ? 1 : -1) * TILE_SIZE;
                safeX = tileX + offsetX;
                safeY = tileY + offsetY;
            }

            // Update the transform position
            transform.setPosition(safeX, safeY);

            // Check if the player's visual component has a valid gameObject
            const visualComponent = playerEntity.getComponent('circle');
            if (!visualComponent || !visualComponent.gameObject) {
                console.log("Recreating player components after stage transition");
                
                // Completely rebuild the player entity
                // First, remove ALL components to ensure clean state
                const componentsToRemove = [...playerEntity.components.keys()];
                
                // Only keep the transform component's position data
                const transform = playerEntity.getComponent('transform');
                const position = transform ? { x: transform.position.x, y: transform.position.y } : { x: safeX, y: safeY };
                
                // Remove all components in reverse order to handle dependencies properly
                for (const componentType of componentsToRemove.reverse()) {
                    playerEntity.removeComponent(componentType);
                }
                
                // Add components back in the correct order
                // 1. Transform first (with saved position)
                const newTransform = new TransformComponent(
                    position.x, position.y
                );
                playerEntity.addComponent(newTransform);
                
                // 2. Circle visual component
                playerEntity.addComponent(new CircleComponent(
                    PLAYER_RADIUS,
                    COLOR_PLAYER
                ));
                
                // 3. Physics component
                playerEntity.addComponent(new PhysicsCapability(
                    'dynamic',
                    { drag: 0 }
                ));
                
                // 4. Input component
                playerEntity.addComponent(new KeyboardInputComponent());
                
                // Get the newly created visual component for camera following
                const newVisualComponent = playerEntity.getComponent('circle');
                if (newVisualComponent && newVisualComponent.gameObject) {
                    this.scene.cameras.main.startFollow(newVisualComponent.gameObject);
                }
            } else if (visualComponent.gameObject && visualComponent.gameObject.body) {
                // If visual and physics are still intact, just reset the position
                visualComponent.gameObject.body.reset(safeX, safeY);
            }

            // Update collisions after stage change
            this.scene.setupCollisions();
        }

        // Allow transitions again after a short delay
        setTimeout(() => {
            this.canTransition = true;
        }, 500);
    }
}