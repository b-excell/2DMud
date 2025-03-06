import Phaser from 'phaser';
import { EntityManager } from '../entities/EntityManager.js';
import { StageManager } from '../world/Stage.js';
import { ExitManager } from '../world/ExitManager.js';
import { InputManager } from '../input/InputManager.js';
import { gameState } from '../core/GameState.js';
import { findEmptyTile } from '../utils/helpers.js';
import { Player } from '../entities/Player.js';
import { actionManager } from '../core/ActionManager.js';

/**
 * Main game scene
 * Updated to use our new multiplayer-ready architecture
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
        this.inputManager = new InputManager(this);

        // Track time for fixed updates
        this.lastUpdateTime = Date.now();
        this.fixedTimeStep = 16.67; // ~60 updates per second
        this.accumulator = 0;

        // Generate initial stage
        const initialStage = this.stageManager.setupStage(gameState.currentStageId);
        gameState.registerStage(initialStage);

        // Create player
        const safeSpot = findEmptyTile(initialStage);
        this.player = new Player(this, safeSpot.x, safeSpot.y);

        // Set up collisions
        this.physics.add.collider(this.player.gameObject, this.stageManager.walls);
        this.physics.add.overlap(
            this.player.gameObject,
            this.stageManager.exits,
            (playerObj, exit) => this.exitManager.handleExit(playerObj, exit),
            null,
            this
        );

        // Register action handlers specific to this scene
        actionManager.registerHandler('player:teleport', action => {
            const { entityId, position } = action;
            const entity = gameState.entities[entityId];

            if (entity) {
                entity.setPosition(position.x, position.y);
            }
        });
    }

    /**
     * Main update loop - processes variable-time updates
     * @param {number} time - Current time
     * @param {number} delta - Time since last frame
     */
    update(time, delta) {
        // Update input
        this.inputManager.update();

        // Use fixed timestep for physics and game logic
        // This is crucial for deterministic updates in multiplayer
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
     * All game logic and physics go here for deterministic behavior
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
        // In a more complex game, we would interpolate entity positions here
        // based on their previous and current states
    }
}