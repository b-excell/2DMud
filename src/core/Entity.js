/**
 * Base Entity class
 * All game objects that need network sync should extend this
 */
class Entity {
    constructor(scene, type, x, y) {
        // Generate a unique ID (critical for network identification)
        this.id = `${type}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        this.type = type;
        this.scene = scene;
        this.gameObject = null; // Phaser game object reference
        this.position = { x, y };
        this.lastUpdateTime = Date.now();

        // Network synchronization flags (for future use)
        this.needsSync = true;
        this.isLocallyControlled = true; // Will be false for network entities

        // Register with game state
        eventBus.emit('entity:created', { entity: this });
    }

    /**
     * Update entity state
     * @param {number} deltaTime - Time since last update in ms
     */
    update(deltaTime) {
        this.lastUpdateTime = Date.now();

        // If this entity has moved/changed, mark for sync
        this.needsSync = true;
    }

    /**
     * Apply a network state update
     * Would be used to sync remote entities in multiplayer
     * @param {object} state - State data from network
     */
    applyNetworkState(state) {
        // Will be implemented for multiplayer
        // Updates position, rotation, animation state, etc.
    }

    /**
     * Get a network serializable state for this entity
     * @returns {object} Network-ready state object
     */
    getNetworkState() {
        return {
            id: this.id,
            type: this.type,
            position: this.position,
            timestamp: Date.now()
        };
    }

    /**
     * Destroy this entity
     */
    destroy() {
        if (this.gameObject) {
            this.gameObject.destroy();
        }

        eventBus.emit('entity:destroyed', { entityId: this.id });
    }

    /**
     * Set the position of this entity
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    setPosition(x, y) {
        this.position.x = x;
        this.position.y = y;

        if (this.gameObject) {
            this.gameObject.setPosition(x, y);
        }

        this.needsSync = true;
    }
}