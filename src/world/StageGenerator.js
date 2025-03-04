class StageGenerator {
    // Generate empty areas in a stage
    static generateEmptyAreas(stage) {
        // Start with a central room
        const centerX = Math.floor(STAGE_WIDTH / 2);
        const centerY = Math.floor(STAGE_HEIGHT / 2);
        const roomSize = 3;

        // Create center room
        for (let y = centerY - roomSize; y <= centerY + roomSize; y++) {
            for (let x = centerX - roomSize; x <= centerX + roomSize; x++) {
                if (y >= 0 && y < STAGE_HEIGHT && x >= 0 && x < STAGE_WIDTH) {
                    stage.tiles[y][x] = 0; // Empty
                }
            }
        }

        // Generate additional random rooms
        const numRooms = 5 + Math.floor(Math.random() * 5); // 5-9 rooms

        for (let i = 0; i < numRooms; i++) {
            const roomX = 3 + Math.floor(Math.random() * (STAGE_WIDTH - 6));
            const roomY = 3 + Math.floor(Math.random() * (STAGE_HEIGHT - 6));
            const roomW = 2 + Math.floor(Math.random() * 3);
            const roomH = 2 + Math.floor(Math.random() * 3);

            // Create room
            for (let y = roomY - roomH; y <= roomY + roomH; y++) {
                for (let x = roomX - roomW; x <= roomX + roomW; x++) {
                    if (y >= 0 && y < STAGE_HEIGHT && x >= 0 && x < STAGE_WIDTH) {
                        stage.tiles[y][x] = 0; // Empty
                    }
                }
            }

            // Create horizontal corridor to center
            const startX = Math.min(roomX, centerX);
            const endX = Math.max(roomX, centerX);

            for (let x = startX; x <= endX; x++) {
                if (roomY >= 0 && roomY < STAGE_HEIGHT && x >= 0 && x < STAGE_WIDTH) {
                    stage.tiles[roomY][x] = 0; // Empty
                }
            }

            // Create vertical corridor to center
            const startY = Math.min(roomY, centerY);
            const endY = Math.max(roomY, centerY);

            for (let y = startY; y <= endY; y++) {
                if (y >= 0 && y < STAGE_HEIGHT && centerX >= 0 && centerX < STAGE_WIDTH) {
                    stage.tiles[y][centerX] = 0; // Empty
                }
            }
        }

        // Ensure there's a wall border around the entire stage
        for (let y = 0; y < STAGE_HEIGHT; y++) {
            for (let x = 0; x < STAGE_WIDTH; x++) {
                if (x === 0 || y === 0 || x === STAGE_WIDTH - 1 || y === STAGE_HEIGHT - 1) {
                    stage.tiles[y][x] = 1; // Solid
                }
            }
        }
    }

    // Add exits to a stage
    static addExits(stage) {
        // Find suitable locations for exits
        const candidates = [];

        // Check for suitable spots along the edges
        for (let y = 1; y < STAGE_HEIGHT - 1; y++) {
            for (let x of [1, STAGE_WIDTH - 2]) {
                if (stage.tiles[y][x] === 0) { // If it's an empty tile near the edge
                    candidates.push({ x, y });
                }
            }
        }

        for (let x = 1; x < STAGE_WIDTH - 1; x++) {
            for (let y of [1, STAGE_HEIGHT - 2]) {
                if (stage.tiles[y][x] === 0) { // If it's an empty tile near the edge
                    candidates.push({ x, y });
                }
            }
        }

        // If no suitable edge locations, find any empty tiles adjacent to walls
        if (candidates.length < 2) {
            for (let y = 1; y < STAGE_HEIGHT - 1; y++) {
                for (let x = 1; x < STAGE_WIDTH - 1; x++) {
                    if (stage.tiles[y][x] === 0) { // Empty tile
                        // Check if adjacent to a wall
                        if (stage.tiles[y - 1][x] === 1 ||
                            stage.tiles[y + 1][x] === 1 ||
                            stage.tiles[y][x - 1] === 1 ||
                            stage.tiles[y][x + 1] === 1) {
                            candidates.push({ x, y });
                        }
                    }
                }
            }
        }

        // Shuffle candidates and select a few
        shuffleArray(candidates);
        const numExits = 1 + Math.floor(Math.random() * 2); // 1-2 exits

        for (let i = 0; i < Math.min(numExits, candidates.length); i++) {
            const exit = candidates[i];
            stage.tiles[exit.y][exit.x] = 2; // Exit
            stage.exits.push({ x: exit.x, y: exit.y });
        }
    }

    // Create a full stage with the given ID
    static createStage(stageId) {
        // Create a new stage structure
        const stage = {
            id: stageId,
            tiles: [],
            exits: [],
            exitConnections: {}
        };

        // Initialize all tiles as solid
        for (let y = 0; y < STAGE_HEIGHT; y++) {
            stage.tiles[y] = [];
            for (let x = 0; x < STAGE_WIDTH; x++) {
                stage.tiles[y][x] = 1; // 1 = solid
            }
        }

        // Generate empty areas using a simple algorithm
        this.generateEmptyAreas(stage);

        // Add exits
        this.addExits(stage);

        return stage;
    }
}