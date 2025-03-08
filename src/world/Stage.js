import { gameState } from "../core/GameState.js";
import { StageGenerator } from "./StageGenerator.js";
import { eventBus } from "../core/EventBus.js";
import { STAGE_WIDTH, STAGE_HEIGHT, TILE_SIZE, COLOR_SOLID, COLOR_EMPTY, COLOR_EXIT } from "../config.js";

export class StageManager {
    constructor(scene) {
        this.scene = scene;
        this.walls = null;
        this.exits = null;
        this.currentStage = null;
    }

    initialize() {
        // Initialize walls and exits groups
        this.walls = this.scene.physics.add.staticGroup();
        this.exits = this.scene.physics.add.staticGroup();
    }

    // Generate a new stage or get an existing one
    getStage(stageId) {
        // Return existing stage if it exists
        if (gameState.stages[stageId]) {
            return gameState.stages[stageId];
        }

        // Create a new stage
        const stage = StageGenerator.createStage(stageId);

        // Store the stage
        gameState.registerStage(stage);

        return stage;
    }

    // Setup an existing stage in the scene
    setupStage(stageId) {
        // Clear existing objects
        this.walls.clear(true, true);
        this.exits.clear(true, true);

        // IMPORTANT: Keep track of the player entity
        const playerEntity = this.scene.player;

        // Get all entities EXCEPT the player
        const entitiesToRemove = Object.values(this.scene.entityManager.entities)
            .filter(entity => entity !== playerEntity);

        // Destroy all non-player entities
        entitiesToRemove.forEach(entity => entity.destroy());

        const stage = this.getStage(stageId);

        // Create a background
        this.scene.add.rectangle(
            STAGE_WIDTH * TILE_SIZE / 2,
            STAGE_HEIGHT * TILE_SIZE / 2,
            STAGE_WIDTH * TILE_SIZE,
            STAGE_HEIGHT * TILE_SIZE,
            0x666666
        );

        // Create game objects based on tile data
        for (let y = 0; y < STAGE_HEIGHT; y++) {
            for (let x = 0; x < STAGE_WIDTH; x++) {
                const tileX = x * TILE_SIZE + TILE_SIZE / 2;
                const tileY = y * TILE_SIZE + TILE_SIZE / 2;

                if (stage.tiles[y][x] === 1) { // Solid
                    const wall = this.scene.add.rectangle(tileX, tileY, TILE_SIZE, TILE_SIZE, COLOR_SOLID);
                    this.scene.physics.add.existing(wall, true);
                    this.walls.add(wall);
                }
                else if (stage.tiles[y][x] === 0) { // Empty
                    this.scene.add.rectangle(tileX, tileY, TILE_SIZE, TILE_SIZE, COLOR_EMPTY);
                }
                else if (stage.tiles[y][x] === 2) { // Exit
                    // Find the exit index
                    const exitIndex = stage.exits.findIndex(e => e.x === x && e.y === y);

                    // Create ONLY ONE exit representation
                    const exitEntity = this.scene.entityFactory.createFromPrefab('exit', {
                        x: tileX,
                        y: tileY,
                        exitIndex: exitIndex
                    });

                    // Get the render component and its gameObject
                    const renderComponent = exitEntity.getComponent('render');
                    if (renderComponent && renderComponent.gameObject) {
                        // Store the exitIndex on the gameObject for collision detection
                        //renderComponent.gameObject.exitIndex = exitIndex;

                        // Add to the exits group for collision detection
                        this.exits.add(renderComponent.gameObject);
                    }
                }
            }
        }

        gameState.currentStageId = stageId;
        eventBus.emit('stage:transition', { stageId });
        this.currentStage = stage;

        // Make sure camera is following the correct player


        return stage;
    }
}