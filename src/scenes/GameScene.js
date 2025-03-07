import Phaser from 'phaser';
import { EntityManager } from '../entities/EntityManager.js';
import { StageManager } from '../world/Stage.js';
import { ExitManager } from '../world/ExitManager.js';
import { gameState } from '../core/GameState.js';
import { findEmptyTile } from '../utils/helpers.js';
import { actionManager } from '../core/ActionManager.js';

/**
 * Main game scene, updated for component-based entities
 */
export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        // Initialize managers
        this.entityManager = new EntityManager(this);
        this.stageManager = new StageManager(this);
        this.stageManager.initialize();
        this.exitManager = new ExitManager(this);

        // Create physics groups for exits and walls
        this.walls = this.physics.add.staticGroup();
        this.exits = this.physics.add.staticGroup();

        // Track time for fixed updates
        this.lastUpdateTime = Date.now();
        this.fixedTimeStep = 16.67; // ~60 updates per second
        this.accumulator = 0;

        // Generate initial stage
        const initialStage = this.stageManager.setupStage(gameState.currentStageId);
        gameState.registerStage(initialStage);

        // Create player at a safe spot
        const safeSpot = findEmptyTile(initialStage);
        this.player = this.entityFactory.createFromPrefab('player', {
            x: safeSpot.x,
            y: safeSpot.y
        });

        // Set up collisions
        this.setupCollisions();
    }

    setupCollisions() {
        // Get all entities with physics components
        const playerEntity = this.player;
        const playerRender = playerEntity.getComponent('render');

        if (playerRender && playerRender.gameObject) {
            // Setup collisions with walls
            this.physics.add.collider(playerRender.gameObject, this.stageManager.walls);

            // Setup overlaps with exits
            this.physics.add.overlap(
                playerRender.gameObject,
                this.stageManager.exits,
                (playerObj, exitObj) => {
                    const exitEntity = exitObj.entity;
                    if (exitEntity) {
                        const exitComponent = exitEntity.getComponent('exit');
                        if (exitComponent) {
                            this.exitManager.handleExit(playerObj, exitComponent.exitIndex);
                        }
                    }
                },
                null,
                this
            );
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