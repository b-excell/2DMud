import { Component } from './Component.js';
import { PhaserObjectComponent } from './PhaserObjectComponent.js';
import { CircleComponent } from './CircleComponent.js';
import { RectangleComponent } from './RectangleComponent.js';

/**
 * Adds physics capabilities to an entity with a PhaserObjectComponent
 */
export class PhysicsCapability extends Component {
    /**
     * Create a new PhysicsCapability component
     * @param {string} bodyType - 'dynamic' or 'static'
     * @param {object} options - Additional physics options
     */
    constructor(bodyType = 'dynamic', options = {}) {
        super('physics');

        this.bodyType = bodyType;
        this.immovable = bodyType === 'static';
        this.velocity = { x: 0, y: 0 };

        // Store collision configuration
        this.options = {
            // Default options
            bounce: 0,
            friction: 1,
            drag: 0,
            ...options
        };

        // Define dependencies - but we don't directly require 'phaserObject' anymore
        this.requireComponent('transform');
        // We'll check for visual components in the onAttach method instead
    }

    /**
     * When attached to an entity, set up physics for the existing game object
     * @returns {boolean} True if successfully attached
     */
    onAttach() {
        // First check if transform is there
        if (!this.entity.hasComponent('transform')) {
            console.error(`Component ${this.type} requires transform, but it's missing from entity ${this.entity.id}`);
            return false;
        }

        // Find a visual component (circle or rectangle)
        const visualComponent = this.findVisualComponent();
        if (!visualComponent) {
            console.error(`Component ${this.type} requires a visual component (circle/rectangle), but none found on entity ${this.entity.id}`);
            return false;
        }

        // Add physics to the existing game object
        if (!visualComponent.gameObject) {
            console.error(`Visual component has no gameObject for entity ${this.entity.id}`);
            return false;
        }

        // Add physics to the existing game object
        this.entity.scene.physics.add.existing(
            visualComponent.gameObject,
            this.bodyType === 'static'
        );

        const body = visualComponent.gameObject.body;
        if (!body) {
            console.error('Failed to create physics body');
            return false;
        }

        // Configure the body shape based on the type of object component
        this.configureCollisionShape(visualComponent);

        // Set physics properties
        body.immovable = this.immovable;
        body.bounce = this.options.bounce;
        body.friction = this.options.friction;
        body.drag = this.options.drag, this.options.drag;

        return true;
    }

    /**
     * Find the first visual component on the entity (circle or rectangle)
     * @returns {Component} The visual component
     */
    findVisualComponent() {
        // Try to find circle or rectangle components
        const circle = this.entity.getComponent('circle');
        if (circle) return circle;

        const rectangle = this.entity.getComponent('rectangle');
        if (rectangle) return rectangle;

        // No visual component found
        return null;
    }

    /**
     * Configure the collision shape based on the PhaserObjectComponent type
     * @param {PhaserObjectComponent} visualComponent - The visual component
     */
    configureCollisionShape(visualComponent) {
        const gameObject = visualComponent.gameObject;
        if (!gameObject || !gameObject.body) return;

        if (visualComponent instanceof CircleComponent) {
            // For circles, use a circle collider with the component's radius
            gameObject.body.setCircle(visualComponent.radius);
        }
        else if (visualComponent instanceof RectangleComponent) {
            // For rectangles, use a rectangular collider matching the visual size
            gameObject.body.setSize(visualComponent.width, visualComponent.height);
        }
        // We could add more shape types here in the future
    }

    /**
     * Set the velocity of the physics body
     * @param {number} x - X velocity component
     * @param {number} y - Y velocity component
     * @returns {PhysicsCapability} - Returns this for chaining
     */
    setVelocity(x, y) {
        this.velocity.x = x;
        this.velocity.y = y;

        const visualComponent = this.findVisualComponent();
        if (visualComponent && visualComponent.gameObject && visualComponent.gameObject.body) {
            visualComponent.gameObject.body.setVelocity(x, y);
        }

        return this;
    }

    /**
     * Update physics state
     * In this updated architecture, the physics body updates the transform
     * rather than the other way around
     * @param {number} deltaTime - Time in ms since last update
     */
    update(deltaTime) {
        // Only needed for dynamic bodies
        if (this.bodyType !== 'dynamic') return;

        const transform = this.entity.getComponent('transform');
        const visualComponent = this.findVisualComponent();

        if (transform && visualComponent && visualComponent.gameObject && visualComponent.gameObject.body) {
            const body = visualComponent.gameObject.body;

            // Update transform from physics body (critical for accurate physics)
            if (body.center) {
                // Use the body center for accurate positioning
                transform.setPosition(body.center.x, body.center.y);
            } else {
                // Fallback if center isn't available
                transform.setPosition(
                    body.x + body.width / 2,
                    body.y + body.height / 2
                );
            }
        }
    }

    /**
     * Get network state
     * @returns {object} Serializable state
     */
    getNetworkState() {
        return {
            velocity: { ...this.velocity },
            immovable: this.immovable
        };
    }

    /**
     * Apply network state
     * @param {object} state - State to apply
     */
    applyNetworkState(state) {
        if (state.velocity) {
            this.setVelocity(state.velocity.x, state.velocity.y);
        }
    }
}