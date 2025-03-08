import { Component } from './Component.js';

/**
 * Base class for components that own a Phaser game object
 * Each entity should have at most one PhaserObjectComponent
 */
export class PhaserObjectComponent extends Component {
    /**
     * Create a new PhaserObjectComponent
     * @param {string} type - Component type identifier (default: 'phaserObject')
     */
    constructor(type = 'phaserObject') {
        super(type);
        this.gameObject = null;
        this.depth = 0;
        this.visible = true;

        // All PhaserObjectComponents depend on transform data
        this.requireComponent('transform');
    }

    /**
     * Create the Phaser game object
     * Abstract method to be implemented by subclasses
     * @returns {Phaser.GameObjects.GameObject} The created game object
     */
    createGameObject() {
        throw new Error('PhaserObjectComponent subclasses must implement createGameObject()');
    }

    /**
     * When attached to an entity, create the game object
     * @returns {boolean} True if successfully attached
     */
    onAttach() {
        // Check dependencies first
        if (!super.onAttach()) return false;

        try {
            // Create the Phaser game object
            this.gameObject = this.createGameObject();

            if (!this.gameObject) {
                console.error(`Failed to create game object for entity ${this.entity.id}`);
                return false;
            }

            // Store a reference to the entity on the game object for easy access
            this.gameObject.entity = this.entity;

            // Apply initial state
            this.setVisible(this.visible);
            this.setDepth(this.depth);

            return true;
        } catch (error) {
            console.error(`Error creating game object for entity ${this.entity.id}:`, error);
            return false;
        }
    }

    /**
     * When detached from an entity, destroy the game object
     */
    onDetach() {
        if (this.gameObject) {
            this.gameObject.destroy();
            this.gameObject = null;
        }
    }

    /**
     * Update position and other properties from transform component
     * @param {number} deltaTime - Time in ms since last update
     */
    update(deltaTime) {
        if (!this.gameObject) return;

        const transform = this.entity.getComponent('transform');
        if (transform) {
            this.updateFromTransform(transform);
        }
    }

    /**
     * Update the game object from transform data
     * May be overridden by subclasses for specific behaviors
     * @param {TransformComponent} transform - The transform component
     */
    updateFromTransform(transform) {
        if (!this.gameObject) return;

        this.gameObject.setPosition(transform.position.x, transform.position.y);
        this.gameObject.setRotation(transform.rotation);

        // Scale might not be supported by all game objects
        if (typeof this.gameObject.setScale === 'function') {
            this.gameObject.setScale(transform.scale.x, transform.scale.y);
        }
    }

    /**
     * Set the visibility of the game object
     * @param {boolean} visible - Whether the object should be visible
     * @returns {PhaserObjectComponent} - Returns this for chaining
     */
    setVisible(visible) {
        this.visible = visible;
        if (this.gameObject) {
            this.gameObject.setVisible(visible);
        }
        return this;
    }

    /**
     * Set the depth (render order) of the game object
     * @param {number} depth - The render depth
     * @returns {PhaserObjectComponent} - Returns this for chaining
     */
    setDepth(depth) {
        this.depth = depth;
        if (this.gameObject) {
            this.gameObject.setDepth(depth);
        }
        return this;
    }

    /**
     * Get all information needed for network synchronization
     * @returns {object} Object containing serializable state
     */
    getNetworkState() {
        return {
            visible: this.visible,
            depth: this.depth
        };
    }

    /**
     * Apply network state updates
     * @param {object} state - Received state to apply
     */
    applyNetworkState(state) {
        if (state.visible !== undefined) {
            this.setVisible(state.visible);
        }

        if (state.depth !== undefined) {
            this.setDepth(state.depth);
        }
    }
}