class StageManager {
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
        if (stages[stageId]) {
            return stages[stageId];
        }

        // Create a new stage
        const stage = StageGenerator.createStage(stageId);

        // Store the stage
        stages[stageId] = stage;

        return stage;
    }

    // Setup an existing stage in the scene
    setupStage(stageId) {
        // Clear existing objects
        this.walls.clear(true, true);
        this.exits.clear(true, true);

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
                    const exitTile = this.scene.add.rectangle(tileX, tileY, TILE_SIZE, TILE_SIZE, COLOR_EXIT);
                    this.scene.physics.add.existing(exitTile, true);
                    exitTile.exitIndex = stage.exits.findIndex(e => e.x === x && e.y === y);
                    this.exits.add(exitTile);
                }
            }
        }

        currentStageId = stageId;
        this.currentStage = stage;
        return stage;
    }
}