/**
 * Player entity
 * Updated to extend from the Entity base class
 */
class Player extends Entity {
    constructor(scene, x, y) {
        super(scene, 'player', x, y);

        // Create player object
        this.gameObject = scene.add.circle(x, y, PLAYER_RADIUS, COLOR_PLAYER);
        scene.physics.add.existing(this.gameObject);
        this.gameObject.setDepth(100); // Ensure player is on top

        // Store reference to this entity on the game object for collision callbacks
        this.gameObject.entity = this;

        // Movement state
        this.movementVector = { x: 0, y: 0 };

        // Player specific properties
        this.health = 100;
        this.maxHealth = 100;

        // Follow with camera
        scene.cameras.main.startFollow(this.gameObject);
    }

    /**
     * Update player state
     * @param {number} deltaTime - Time since last update in ms
     */
    update(deltaTime) {
        super.update(deltaTime);

        // Update position from game object
        if (this.gameObject) {
            this.position.x = this.gameObject.x;
            this.position.y = this.gameObject.y;
        }

        // Emit player position update event if needed
        // This would be used for multiplayer sync
        if (this.needsSync) {
            eventBus.emit('player:moved', {
                id: this.id,
                position: this.position
            });

            this.needsSync = false;
        }
    }

    /**
     * Apply movement directly - called from action handler
     * @param {object} direction - Direction vector {x, y}
     * @param {number} speed - Movement speed
     */
    move(direction, speed) {
        this.movementVector = { ...direction };

        // Apply movement to physics body
        if (this.gameObject && this.gameObject.body) {
            this.gameObject.body.setVelocity(
                direction.x * speed,
                direction.y * speed
            );
        }
    }

    /**
     * Stop all movement
     */
    stopMovement() {
        this.movementVector = { x: 0, y: 0 };

        if (this.gameObject && this.gameObject.body) {
            this.gameObject.body.setVelocity(0, 0);
        }
    }

    /**
     * Get network state for this player
     * Important for multiplayer syncing
     */
    getNetworkState() {
        return {
            ...super.getNetworkState(),
            health: this.health,
            movementVector: this.movementVector
        };
    }

    /**
     * Set player position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    setPosition(x, y) {
        super.setPosition(x, y);

        // This is a critical network sync point
        eventBus.emit('player:teleported', {
            id: this.id,
            position: { x, y }
        });
    }
}