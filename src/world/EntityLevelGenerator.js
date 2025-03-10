import { STAGE_WIDTH, STAGE_HEIGHT, TILE_SIZE } from "../config.js";
import { shuffleArray } from "../utils/helpers.js";

/**
 * Generates game levels using entity-based environmental prefabs
 * Replaces the old tile-based approach with a fully entity-component system
 */
export class EntityLevelGenerator {
    /**
     * Create and return a complete level structure
     * @param {Phaser.Scene} scene - The scene to create entities in
     * @param {string} levelId - Unique identifier for this level
     * @returns {object} Level data object
     */
    static createLevel(scene, levelId) {
        console.log(`Creating new level: ${levelId}`);
        
        // Create the level data structure
        const level = {
            id: levelId,
            // Instead of a tile matrix, we'll track generated entities
            // for managing them later
            entities: {
                walls: [],
                floors: [],
                exits: []
            },
            // We'll still use a grid for tracking what's been placed where
            // 0 = empty/floor, 1 = wall, 2 = exit
            grid: [],
            // Keep exit data for connections between levels
            exits: [],
            exitConnections: {}
        };

        // Initialize all grid cells as walls
        for (let y = 0; y < STAGE_HEIGHT; y++) {
            level.grid[y] = [];
            for (let x = 0; x < STAGE_WIDTH; x++) {
                level.grid[y][x] = 1; // 1 = wall
            }
        }

        // Generate rooms and corridors
        this.generateRoomsAndCorridors(scene, level);

        // Add exits
        this.addExits(scene, level);
        
        console.log(`Level generation complete: ${level.exits.length} exits created`);

        return level;
    }

    /**
     * Generate rooms and corridors in the level
     * @param {Phaser.Scene} scene - The scene to create entities in
     * @param {object} level - The level data structure
     */
    static generateRoomsAndCorridors(scene, level) {
        // Create a central room first
        const centerX = Math.floor(STAGE_WIDTH / 2);
        const centerY = Math.floor(STAGE_HEIGHT / 2);
        const centerRoomSize = 3;

        // Create the center room
        this.createRoom(scene, level, centerX, centerY, centerRoomSize, centerRoomSize);

        // Generate additional random rooms
        const numRooms = 5 + Math.floor(Math.random() * 5); // 5-9 rooms
        
        for (let i = 0; i < numRooms; i++) {
            const roomX = 3 + Math.floor(Math.random() * (STAGE_WIDTH - 6));
            const roomY = 3 + Math.floor(Math.random() * (STAGE_HEIGHT - 6));
            const roomW = 2 + Math.floor(Math.random() * 3);
            const roomH = 2 + Math.floor(Math.random() * 3);

            // Create the room
            this.createRoom(scene, level, roomX, roomY, roomW, roomH);

            // Connect room to center with corridors
            this.createCorridor(scene, level, roomX, roomY, centerX, centerY);
        }
    }

    /**
     * Create a room at the specified location
     * @param {Phaser.Scene} scene - The scene to create entities in
     * @param {object} level - The level data structure
     * @param {number} centerX - Center X coordinate of the room
     * @param {number} centerY - Center Y coordinate of the room
     * @param {number} halfWidth - Half the width of the room
     * @param {number} halfHeight - Half the height of the room
     */
    static createRoom(scene, level, centerX, centerY, halfWidth, halfHeight) {
        for (let y = centerY - halfHeight; y <= centerY + halfHeight; y++) {
            for (let x = centerX - halfWidth; x <= centerX + halfWidth; x++) {
                if (y >= 0 && y < STAGE_HEIGHT && x >= 0 && x < STAGE_WIDTH) {
                    // Only place a floor if there wasn't one already
                    if (level.grid[y][x] === 1) {
                        level.grid[y][x] = 0; // Mark as floor
                        
                        // Decide whether to use dirt or grass (70% dirt, 30% grass)
                        const floorType = Math.random() < 0.7 ? 'floor_dirt' : 'floor_grass';
                        
                        // Create the floor entity
                        const tileX = x * TILE_SIZE + TILE_SIZE / 2;
                        const tileY = y * TILE_SIZE + TILE_SIZE / 2;
                        
                        const floor = scene.entityFactory.createFromPrefab(floorType, {
                            x: tileX,
                            y: tileY
                        });
                        
                        // Track the entity in our level data
                        level.entities.floors.push(floor);
                    }
                }
            }
        }
    }

    /**
     * Create a corridor connecting two points
     * @param {Phaser.Scene} scene - The scene to create entities in
     * @param {object} level - The level data structure
     * @param {number} x1 - Starting X coordinate
     * @param {number} y1 - Starting Y coordinate
     * @param {number} x2 - Ending X coordinate
     * @param {number} y2 - Ending Y coordinate
     */
    static createCorridor(scene, level, x1, y1, x2, y2) {
        // First create a horizontal corridor
        const startX = Math.min(x1, x2);
        const endX = Math.max(x1, x2);
        
        for (let x = startX; x <= endX; x++) {
            if (y1 >= 0 && y1 < STAGE_HEIGHT && x >= 0 && x < STAGE_WIDTH) {
                if (level.grid[y1][x] === 1) {
                    level.grid[y1][x] = 0; // Mark as floor
                    
                    // Always use dirt for corridors
                    const tileX = x * TILE_SIZE + TILE_SIZE / 2;
                    const tileY = y1 * TILE_SIZE + TILE_SIZE / 2;
                    
                    const floor = scene.entityFactory.createFromPrefab('floor_dirt', {
                        x: tileX,
                        y: tileY
                    });
                    
                    level.entities.floors.push(floor);
                }
            }
        }
        
        // Then create a vertical corridor
        const startY = Math.min(y1, y2);
        const endY = Math.max(y1, y2);
        
        for (let y = startY; y <= endY; y++) {
            if (y >= 0 && y < STAGE_HEIGHT && x2 >= 0 && x2 < STAGE_WIDTH) {
                if (level.grid[y][x2] === 1) {
                    level.grid[y][x2] = 0; // Mark as floor
                    
                    // Always use dirt for corridors
                    const tileX = x2 * TILE_SIZE + TILE_SIZE / 2;
                    const tileY = y * TILE_SIZE + TILE_SIZE / 2;
                    
                    const floor = scene.entityFactory.createFromPrefab('floor_dirt', {
                        x: tileX,
                        y: tileY
                    });
                    
                    level.entities.floors.push(floor);
                }
            }
        }
    }

    /**
     * Add exits to the level
     * @param {Phaser.Scene} scene - The scene to create entities in
     * @param {object} level - The level data structure
     * @param {Array} [targetExits] - Optional list of predefined exit positions to use
     */
    static addExits(scene, level, targetExits = null) {
        // If we have predefined exits to use, place those
        if (targetExits && targetExits.length > 0) {
            console.log(`Creating ${targetExits.length} predefined exits`);
            
            targetExits.forEach((exitData, index) => {
                // Use the provided exit data with index
                this.createExitAtPosition(scene, level, exitData.x, exitData.y, exitData.exitIndex);
            });
            
            return;
        }
        
        // Otherwise, find potential exit locations (floor tiles adjacent to walls)
        const potentialExits = [];
        
        for (let y = 1; y < STAGE_HEIGHT - 1; y++) {
            for (let x = 1; x < STAGE_WIDTH - 1; x++) {
                // Only consider floor tiles
                if (level.grid[y][x] === 0) {
                    // Check if there's at least one adjacent wall
                    if (
                        level.grid[y-1][x] === 1 || 
                        level.grid[y+1][x] === 1 || 
                        level.grid[y][x-1] === 1 || 
                        level.grid[y][x+1] === 1
                    ) {
                        potentialExits.push({x, y});
                    }
                }
            }
        }
        
        // Ensure we have at least one exit
        if (potentialExits.length === 0) {
            console.warn("No potential exit locations found - using center of level");
            potentialExits.push({
                x: Math.floor(STAGE_WIDTH / 2),
                y: Math.floor(STAGE_HEIGHT / 2)
            });
        }
        
        // Shuffle and take a random number of exits (1-3)
        shuffleArray(potentialExits);
        const numExits = Math.max(1, Math.min(3, Math.floor(Math.random() * 3) + 1));
        const selectedExits = potentialExits.slice(0, numExits);
        
        console.log(`Creating ${selectedExits.length} randomly selected exits`);
        
        // Create exit entities
        selectedExits.forEach((exit, index) => {
            this.createExitAtPosition(scene, level, exit.x, exit.y, index);
        });
    }
    
    /**
     * Create an exit entity at the specified position
     * @param {Phaser.Scene} scene - The scene to create the exit in
     * @param {object} level - The level data structure
     * @param {number} x - Grid X coordinate
     * @param {number} y - Grid Y coordinate
     * @param {number} exitIndex - The index of this exit
     */
    static createExitAtPosition(scene, level, x, y, exitIndex) {
        // Check if an exit with this index already exists
        const existingExitIndex = level.exits.findIndex(e => e.exitIndex === exitIndex);
        if (existingExitIndex !== -1) {
            console.warn(`Exit with index ${exitIndex} already exists - removing it`);
            level.exits.splice(existingExitIndex, 1);
        }
        
        // Remove any existing floor at this position
        if (level.grid[y] && level.grid[y][x] === 0) {
            // Find and remove any floor entity at this position
            const tilePos = {
                x: x * TILE_SIZE + TILE_SIZE / 2,
                y: y * TILE_SIZE + TILE_SIZE / 2
            };
            
            if (level.entities.floors) {
                // Find any floor entities at this exact position
                const floorsToRemove = level.entities.floors.filter(floor => {
                    if (!floor) return false;
                    const transform = floor.getComponent('transform');
                    return transform && 
                           Math.abs(transform.position.x - tilePos.x) < 1 && 
                           Math.abs(transform.position.y - tilePos.y) < 1;
                });
                
                // Remove them
                floorsToRemove.forEach(floor => {
                    if (floor && floor.destroy) {
                        floor.destroy();
                        const index = level.entities.floors.indexOf(floor);
                        if (index !== -1) {
                            level.entities.floors.splice(index, 1);
                        }
                    }
                });
            }
        }
        
        // Mark as exit in the grid
        if (level.grid[y]) {
            level.grid[y][x] = 2;
        } else {
            console.error(`Invalid grid position ${x},${y}`);
            return;
        }
        
        // Calculate position
        const tileX = x * TILE_SIZE + TILE_SIZE / 2;
        const tileY = y * TILE_SIZE + TILE_SIZE / 2;
        
        // Create exit entity
        const exitEntity = scene.entityFactory.createFromPrefab('exit', {
            x: tileX,
            y: tileY,
            exitIndex: exitIndex
        });
        
        if (!exitEntity) {
            console.error(`Failed to create exit entity at ${x},${y} with index ${exitIndex}`);
            return;
        }
        
        // Track the entity
        if (!level.entities.exits) {
            level.entities.exits = [];
        }
        
        // Track the entity and exit data
        level.entities.exits.push(exitEntity);
        
        // Add to the exits array (for connection data)
        if (!level.exits) {
            level.exits = [];
        }
        
        // Add a NEW exit data object (don't reuse existing ones to avoid reference issues)
        level.exits.push({
            x: x,
            y: y,
            exitIndex: exitIndex
        });
        
        console.log(`Created exit ${exitIndex} at grid position (${x}, ${y}), world position (${tileX}, ${tileY})`);
    }

    /**
     * Place wall entities around the non-wall grid cells
     * @param {Phaser.Scene} scene - The scene to create entities in
     * @param {object} level - The level data structure 
     */
    static placeWalls(scene, level) {
        // Create wall entities for all wall grid cells that are adjacent to non-wall cells
        for (let y = 0; y < STAGE_HEIGHT; y++) {
            for (let x = 0; x < STAGE_WIDTH; x++) {
                // Only consider wall cells
                if (level.grid[y][x] === 1) {
                    // Check if it's adjacent to a non-wall cell or at map edge
                    let shouldCreateWall = false;
                    
                    // Check adjacency (including diagonals)
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            if (dx === 0 && dy === 0) continue;
                            
                            const nx = x + dx;
                            const ny = y + dy;
                            
                            // If it's at map edge or adjacent to floor/exit, create a wall
                            if (
                                nx < 0 || nx >= STAGE_WIDTH || 
                                ny < 0 || ny >= STAGE_HEIGHT ||
                                level.grid[ny][nx] === 0 || 
                                level.grid[ny][nx] === 2
                            ) {
                                shouldCreateWall = true;
                                break;
                            }
                        }
                        if (shouldCreateWall) break;
                    }
                    
                    if (shouldCreateWall) {
                        // Create wall entity
                        const tileX = x * TILE_SIZE + TILE_SIZE / 2;
                        const tileY = y * TILE_SIZE + TILE_SIZE / 2;
                        
                        const wall = scene.entityFactory.createFromPrefab('wall_stone', {
                            x: tileX,
                            y: tileY
                        });
                        
                        level.entities.walls.push(wall);
                    }
                }
            }
        }
    }
}