import { eventBus } from './EventBus.js';

/**
 * Central game state manager
 * Acts as single source of truth for game state
 * Will be critical for syncing with server state in multiplayer
 */
class GameState {
    constructor() {
        this.entities = {}; // All game entities by ID
        this.players = {}; // Player entities specifically
        this.currentStageId = 'stage-1';
        this.stages = {}; // All stages by ID

        // Example of network-ready state tracking
        this.lastUpdateTime = Date.now();
        this.stateSequence = 0; // For state reconciliation in multiplayer

        // Listen for events to update state
        eventBus.on('stage:transition', this.handleStageTransition.bind(this));
        eventBus.on('entity:created', this.registerEntity.bind(this));
        eventBus.on('entity:destroyed', this.unregisterEntity.bind(this));
    }

    /**
     * Get current game state (useful for snapshots)
     * @returns {object} Current state
     */
    getState() {
        return {
            currentStageId: this.currentStageId,
            entities: this.entities,
            stateSequence: this.stateSequence,
            timestamp: Date.now()
        };
    }

    /**
     * Register a new entity in the game state
     * @param {object} data - Entity data
     */
    registerEntity(data) {
        const { entity } = data;
        this.entities[entity.id] = entity;

        // Track players specifically
        if (entity.type === 'player') {
            this.players[entity.id] = entity;
        }

        this.stateSequence++;
    }

    /**
     * Remove an entity from the game state
     * @param {object} data - Entity data
     */
    unregisterEntity(data) {
        const { entityId } = data;

        if (this.entities[entityId]) {
            const entity = this.entities[entityId];

            // Remove from players if applicable
            if (entity.type === 'player' && this.players[entityId]) {
                delete this.players[entityId];
            }

            delete this.entities[entityId];
            this.stateSequence++;
        }
    }

    /**
     * Handle stage transition events
     * @param {object} data - Transition data
     */
    handleStageTransition(data) {
        const { stageId } = data;
        this.currentStageId = stageId;
        this.stateSequence++;

        // This would be a critical network event in multiplayer
    }

    /**
     * Register a stage in the game state
     * @param {object} stage - The stage to register
     */
    registerStage(stage) {
        this.stages[stage.id] = stage;
    }
}

// Create a global instance and export it
export const gameState = new GameState();