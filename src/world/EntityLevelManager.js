import { gameState } from "../core/GameState.js";
import { EntityLevelGenerator } from "./EntityLevelGenerator.js";
import { eventBus } from "../core/EventBus.js";
import { STAGE_WIDTH, STAGE_HEIGHT, TILE_SIZE } from "../config.js";

/**
 * Manages entity-based levels
 * Replaces the old StageManager with a fully entity-component approach
 */
export class EntityLevelManager {
    /**
     * Create a new entity-based level manager
     * @param {Phaser.Scene} scene - The scene this manager belongs to
     */
    constructor(scene) {
        this.scene = scene;
        this.currentLevel = null;
        this.collisionGroups = {
            walls: null,  // For wall collision
            exits: null   // For exit detection
        };
    }

    /**
     * Initialize the manager
     */
    initialize() {
        // Initialize collision groups
        this.collisionGroups.walls = this.scene.physics.add.staticGroup();
        this.collisionGroups.exits = this.scene.physics.add.staticGroup();
        
        console.log("Entity Level Manager initialized");
    }

    /**
     * Get a level by ID, creating it if it doesn't exist
     * @param {string} levelId - The level ID to get or create
     * @returns {object} The level data
     */
    getLevel(levelId) {
        // Return existing level if it exists
        if (gameState.levels && gameState.levels[levelId]) {
            return gameState.levels[levelId];
        }

        // Otherwise create a new level
        const level = EntityLevelGenerator.createLevel(this.scene, levelId);

        // Store the level
        if (!gameState.levels) {
            gameState.levels = {};
        }
        gameState.levels[levelId] = level;
        
        // Register the level with game state
        gameState.registerLevel(level);

        return level;
    }

    /**
     * Setup a level in the scene
     * @param {string} levelId - The level ID to set up
     * @returns {object} The level data
     */
    setupLevel(levelId) {
        console.log(`Setting up level: ${levelId}`);
        
        // Clear existing entities
        this.clearCurrentLevel();

        // Keep track of the player entity
        const playerEntity = this.scene.player;

        // Get all entities EXCEPT the player
        const entitiesToRemove = Object.values(this.scene.entityManager.entities)
            .filter(entity => entity !== playerEntity);

        // Destroy all non-player entities
        entitiesToRemove.forEach(entity => entity.destroy());

        // Get the level data
        const level = this.getLevel(levelId);

        // Create a dark background
        this.scene.add.rectangle(
            STAGE_WIDTH * TILE_SIZE / 2,
            STAGE_HEIGHT * TILE_SIZE / 2,
            STAGE_WIDTH * TILE_SIZE,
            STAGE_HEIGHT * TILE_SIZE,
            0x222222 // Dark gray background
        ).setDepth(-20); // Put it behind everything

        // Generate the level content
        this.generateLevelContent(level);

        // Update game state
        gameState.currentLevelId = levelId;
        eventBus.emit('level:transition', { levelId });
        this.currentLevel = level;

        return level;
    }

    /**
     * Generate the content for a level
     * @param {object} level - The level data
     */
    generateLevelContent(level) {
        console.log("Generating level content...");
        
        // First, place all floor entities
        for (let y = 0; y < STAGE_HEIGHT; y++) {
            for (let x = 0; x < STAGE_WIDTH; x++) {
                const tileX = x * TILE_SIZE + TILE_SIZE / 2;
                const tileY = y * TILE_SIZE + TILE_SIZE / 2;
                
                if (level.grid[y][x] === 0) { // Floor
                    // Use dirt as the default floor
                    const floor = this.scene.entityFactory.createFromPrefab('floor_dirt', {
                        x: tileX,
                        y: tileY
                    });
                    
                    // Track the entity
                    if (!level.entities.floors) {
                        level.entities.floors = [];
                    }
                    level.entities.floors.push(floor);
                }
            }
        }
        
        // Place wall entities
        EntityLevelGenerator.placeWalls(this.scene, level);
        
        // Add walls to collision group for easy physics setup
        if (level.entities.walls) {
            level.entities.walls.forEach(wall => {
                const visualComponent = wall.getComponent('rectangle');
                if (visualComponent && visualComponent.gameObject) {
                    this.collisionGroups.walls.add(visualComponent.gameObject);
                }
            });
        }
        
        // Initialize the exit entities array if it doesn't exist
        if (!level.entities.exits) {
            level.entities.exits = [];
        }
        
        // Clear any existing exit entities - we'll recreate them
        level.entities.exits.forEach(exit => {
            if (exit && exit.destroy) {
                exit.destroy();
            }
        });
        level.entities.exits = [];
        
        // Create exit entities using exit data from level.exits
        if (level.exits && level.exits.length > 0) {
            console.log(`Creating ${level.exits.length} exits from level data`);
            
            // Create an exit entity for each exit in the level data
            level.exits.forEach(exitData => {
                const x = exitData.x;
                const y = exitData.y;
                const exitIndex = exitData.exitIndex;
                
                // Calculate position
                const tileX = x * TILE_SIZE + TILE_SIZE / 2;
                const tileY = y * TILE_SIZE + TILE_SIZE / 2;
                
                // Create exit entity
                const exitEntity = this.scene.entityFactory.createFromPrefab('exit', {
                    x: tileX,
                    y: tileY,
                    exitIndex: exitIndex
                });
                
                // Add to the entities collection
                level.entities.exits.push(exitEntity);
                
                // Mark as exit in the grid if not already
                level.grid[y][x] = 2;
                
                console.log(`Created exit ${exitIndex} at (${x}, ${y})`);
            });
        } else {
            // Generate new random exits if none exist
            console.log("No exit data found - generating new exits");
            EntityLevelGenerator.addExits(this.scene, level);
        }
        
        // Add exits to collision group
        level.entities.exits.forEach(exit => {
            const visualComponent = exit.getComponent('rectangle');
            if (visualComponent && visualComponent.gameObject) {
                this.collisionGroups.exits.add(visualComponent.gameObject);
            }
        });
        
        console.log(`Level content generated: ${level.entities.floors?.length || 0} floors, ${level.entities.walls?.length || 0} walls, ${level.entities.exits?.length || 0} exits`);
    }

    /**
     * Clear the current level's entities
     */
    clearCurrentLevel() {
        // Clear collision groups
        if (this.collisionGroups.walls) {
            this.collisionGroups.walls.clear(true, true);
        }
        
        if (this.collisionGroups.exits) {
            this.collisionGroups.exits.clear(true, true);
        }
        
        // If we have a current level, clear its entities
        if (this.currentLevel && this.currentLevel.entities) {
            // We'll let the EntityManager handle actual entity destruction
            this.currentLevel.entities = {
                walls: [],
                floors: [],
                exits: []
            };
        }
    }

    /**
     * Connect two levels via their exits
     * @param {string} level1Id - First level ID
     * @param {number} exit1Index - Exit index in first level
     * @param {string} level2Id - Second level ID
     * @param {number} exit2Index - Exit index in second level
     */
    connectLevels(level1Id, exit1Index, level2Id, exit2Index) {
        const level1 = this.getLevel(level1Id);
        const level2 = this.getLevel(level2Id);
        
        if (!level1 || !level2) {
            console.error(`Cannot connect levels: ${level1Id} or ${level2Id} not found`);
            return;
        }
        
        console.log(`Connecting levels: ${level1Id} exit ${exit1Index} ↔ ${level2Id} exit ${exit2Index}`);
        
        // Initialize connections if needed
        if (!level1.exitConnections) level1.exitConnections = {};
        if (!level2.exitConnections) level2.exitConnections = {};
        
        // Check if exits exist in both levels
        const level1Exit = level1.exits.find(e => e.exitIndex === exit1Index);
        const level2Exit = level2.exits.find(e => e.exitIndex === exit2Index);
        
        if (!level1Exit) {
            console.error(`Exit ${exit1Index} not found in level ${level1Id}`);
            return;
        }
        
        if (!level2Exit) {
            console.error(`Exit ${exit2Index} not found in level ${level2Id}`);
            return;
        }
        
        // Set up bidirectional connections
        level1.exitConnections[exit1Index] = {
            levelId: level2Id,
            exitIndex: exit2Index
        };
        
        level2.exitConnections[exit2Index] = {
            levelId: level1Id,
            exitIndex: exit1Index
        };
        
        console.log(`Connection established: ${level1Id}#${exit1Index} ↔ ${level2Id}#${exit2Index}`);

        // Save the connected levels in game state to make sure they persist
        if (gameState.levels) {
            gameState.levels[level1Id] = level1;
            gameState.levels[level2Id] = level2;
        }
    }
}