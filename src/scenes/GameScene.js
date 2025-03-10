import Phaser from 'phaser';
import { EntityManager } from '../entities/EntityManager.js';
import { EntityLevelManager } from '../world/EntityLevelManager.js';
import { ExitManager } from '../world/ExitManager.js';
import { gameState } from '../core/GameState.js';
import { findEmptyTile } from '../utils/helpers.js';
import { actionManager } from '../core/ActionManager.js';

/**
 * Main game scene, updated for entity-based levels
 */
export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        // Initialize managers
        this.entityManager = new EntityManager(this);
        this.levelManager = new EntityLevelManager(this);
        this.levelManager.initialize();
        this.exitManager = new ExitManager(this);

        // Track time for fixed updates
        this.lastUpdateTime = Date.now();
        this.fixedTimeStep = 16.67; // ~60 updates per second
        this.accumulator = 0;

        // Generate initial level (or use an existing one)
        const initialLevelId = gameState.currentLevelId || 'level-1';
        const initialLevel = this.levelManager.setupLevel(initialLevelId);

        // Create player at a safe spot
        this.createPlayerInLevel(initialLevel);

        // Set up collisions
        this.setupCollisions();
        
        // Enable debug graphics for physics
        this.physics.world.createDebugGraphic();
    }

    /**
     * Create a player in a safe location in the given level
     * @param {object} level - The level to create player in
     */
    createPlayerInLevel(level) {
        // Find a safe spot (floor tile not near exits or walls)
        const safePosition = this.findSafePlayerPosition(level);
        
        // Create the player entity
        this.player = this.entityFactory.createFromPrefab('player', {
            x: safePosition.x,
            y: safePosition.y
        });
        
        console.log(`Player created at position (${safePosition.x}, ${safePosition.y})`);
    }

    /**
     * Find a safe position for the player in the level
     * @param {object} level - The level to find a position in
     * @returns {object} Safe position {x, y}
     */
    findSafePlayerPosition(level) {
        // Get all empty floor tiles
        const floorTiles = [];
        
        for (let y = 0; y < level.grid.length; y++) {
            for (let x = 0; x < level.grid[y].length; x++) {
                if (level.grid[y][x] === 0) { // Floor tile
                    // Check if it's not too close to exits or edges
                    let isSafe = true;
                    
                    // Check if it's at least 2 tiles away from any exit
                    for (const exit of level.exits || []) {
                        const distance = Math.abs(exit.x - x) + Math.abs(exit.y - y);
                        if (distance < 3) {
                            isSafe = false;
                            break;
                        }
                    }
                    
                    // Check if it's not too close to the edge
                    if (x < 2 || y < 2 || x >= level.grid[y].length - 2 || y >= level.grid.length - 2) {
                        isSafe = false;
                    }
                    
                    if (isSafe) {
                        floorTiles.push({
                            x: x * 64 + 32, // Convert to world coordinates (centered)
                            y: y * 64 + 32
                        });
                    }
                }
            }
        }
        
        // If we have safe tiles, pick a random one
        if (floorTiles.length > 0) {
            return floorTiles[Math.floor(Math.random() * floorTiles.length)];
        }
        
        // Fallback: center of the map
        return {
            x: level.grid[0].length * 32,
            y: level.grid.length * 32
        };
    }

    setupCollisions() {
        console.log("Setting up collisions for all entities");
        
        // Get the player entity
        const playerEntity = this.player;
        
        // Get the player's physics component via its visual component
        const playerVisual = playerEntity.getComponent('circle');
        
        if (playerVisual && playerVisual.gameObject && playerVisual.gameObject.body) {
            console.log("Setting up player collisions");
            
            // Setup collisions with walls
            this.physics.add.collider(
                playerVisual.gameObject, 
                this.levelManager.collisionGroups.walls,
                null, // No callback needed for basic wall collisions
                null,
                this
            );

            // Get all exit entities and set up overlaps with each
            const exitEntities = this.entityManager.getEntitiesByType('exit');
            console.log(`Found ${exitEntities.length} exit entities for collision setup`);
            
            for (const exitEntity of exitEntities) {
                const exitVisual = exitEntity.getComponent('rectangle');
                
                if (exitVisual && exitVisual.gameObject && exitVisual.gameObject.body) {
                    // Setup overlap detection between player and this exit
                    this.physics.add.overlap(
                        playerVisual.gameObject,
                        exitVisual.gameObject,
                        () => {
                            const exitComponent = exitEntity.getComponent('exit');
                            if (exitComponent) {
                                this.exitManager.handleExit(playerEntity, exitComponent.exitIndex);
                            }
                        },
                        null, // No custom process callback needed
                        this
                    );
                    
                    console.log(`Set up overlap detection between player and exit ${exitEntity.id}`);
                } else {
                    console.warn(`Exit entity ${exitEntity.id} is missing visual component or physics body`);
                }
            }
        } else {
            console.error("Player entity missing visual component or physics body - cannot set up collisions");
        }
    }

    /**
     * Main update loop - processes variable-time updates
     * @param {number} time - Current time
     * @param {number} delta - Time since last frame
     */
    update(time, delta) {
        // Use fixed timestep for physics and game logic
        this.accumulator += delta;

        while (this.accumulator >= this.fixedTimeStep) {
            this.fixedUpdate(this.fixedTimeStep);
            this.accumulator -= this.fixedTimeStep;
        }

        // Process rendering-specific updates (interpolation)
        const alpha = this.accumulator / this.fixedTimeStep;
        this.renderUpdate(alpha);
    }

    /**
     * Fixed update - runs at consistent intervals
     * @param {number} deltaTime - Fixed time step in ms
     */
    fixedUpdate(deltaTime) {
        // Process all actions
        actionManager.processActions();

        // Update all entities
        this.entityManager.update(deltaTime);
    }

    /**
     * Render update - for smooth visual updates between fixed steps
     * @param {number} alpha - Interpolation factor (0-1)
     */
    renderUpdate(alpha) {
        // In the future, we would implement interpolation here
        // Currently, this is a placeholder for future enhancements
    }
}