/**
 * Handles player input and converts to game actions
 * Separating input from game logic is crucial for multiplayer
 */
class InputManager {
    constructor(scene) {
        this.scene = scene;
        this.keys = null;
        this.inputEnabled = true;
        this.lastInputTime = Date.now();

        // Current input state
        this.inputState = {
            up: false,
            down: false,
            left: false,
            right: false,
            sprint: false
        };

        this.initialize();
    }

    /**
     * Initialize input handlers
     */
    initialize() {
        // Set up keyboard inputs
        this.keys = this.scene.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            sprint: Phaser.Input.Keyboard.KeyCodes.SHIFT
        });

        // Track input changes
        eventBus.on('game:pause', () => {
            this.inputEnabled = false;
        });

        eventBus.on('game:resume', () => {
            this.inputEnabled = true;
        });
    }

    /**
     * Update input state
     * Call this each frame to get fresh input
     */
    update() {
        if (!this.inputEnabled) return;

        // Update input state
        const previousState = { ...this.inputState };

        this.inputState.up = this.keys.up.isDown;
        this.inputState.down = this.keys.down.isDown;
        this.inputState.left = this.keys.left.isDown;
        this.inputState.right = this.keys.right.isDown;
        this.inputState.sprint = this.keys.sprint.isDown;

        // Check if input state has changed
        const stateChanged =
            previousState.up !== this.inputState.up ||
            previousState.down !== this.inputState.down ||
            previousState.left !== this.inputState.left ||
            previousState.right !== this.inputState.right ||
            previousState.sprint !== this.inputState.sprint;

        // Always process input every frame for smooth movement
        // This ensures releasing keys properly stops movement
        this.processInput();

        this.lastInputTime = Date.now();
    }

    /**
     * Process current input state into game actions
     */
    processInput() {
        // Convert input state to movement direction
        const direction = {
            x: 0,
            y: 0
        };

        // Add movement components based on key state
        if (this.inputState.left) direction.x -= 1;
        if (this.inputState.right) direction.x += 1;
        if (this.inputState.up) direction.y -= 1;
        if (this.inputState.down) direction.y += 1;

        // Normalize the direction vector if moving diagonally
        if (direction.x !== 0 && direction.y !== 0) {
            const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
            direction.x /= length;
            direction.y /= length;
        }

        // Calculate speed based on sprint state
        const sprintMultiplier = this.inputState.sprint ? 1.75 : 1;
        const currentSpeed = PLAYER_SPEED * sprintMultiplier;

        // Always queue a movement action (even with zero direction to stop movement)
        actionManager.queueAction({
            type: 'player:move',
            entityId: this.scene.player.id,
            direction,
            speed: currentSpeed,
            immediate: true
        });

        // This pattern makes it easy to add new input-driven actions later
    }
}