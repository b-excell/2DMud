import { InputComponent } from './InputComponent.js';
import { actionManager } from '../core/ActionManager.js';
import { PLAYER_SPEED, PLAYER_SPRINT_MULTIPLIER } from '../config.js';

export class KeyboardInputComponent extends InputComponent {
    constructor() {
        super();
        this.keys = null;
        this.inputState = {
            up: false,
            down: false,
            left: false,
            right: false,
            sprint: false,
            attack: false
        };

        // Require physics capability to actually move the entity
        this.requireComponent('physics');
    }

    onAttach() {
        if (!super.onAttach()) return false;

        // Set up keyboard inputs
        this.keys = this.entity.scene.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            sprint: Phaser.Input.Keyboard.KeyCodes.SHIFT,
            attack: Phaser.Input.Keyboard.KeyCodes.SPACE
        });

        return true;
    }

    update() {
        if (!this.enabled) return;

        const previousState = { ...this.inputState };

        // Update input state
        this.inputState.up = this.keys.up.isDown;
        this.inputState.down = this.keys.down.isDown;
        this.inputState.left = this.keys.left.isDown;
        this.inputState.right = this.keys.right.isDown;
        this.inputState.sprint = this.keys.sprint.isDown;
        this.inputState.attack = this.keys.attack.isDown;

        // Process movement input
        this.processMovementInput();

        // Process action input (attack, etc.)
        this.processActionInput(previousState);
    }

    processMovementInput() {
        // Calculate movement direction
        const direction = {
            x: 0,
            y: 0
        };

        if (this.inputState.left) direction.x -= 1;
        if (this.inputState.right) direction.x += 1;
        if (this.inputState.up) direction.y -= 1;
        if (this.inputState.down) direction.y += 1;

        // Check if there's any movement input
        const isMoving = direction.x !== 0 || direction.y !== 0;

        if (isMoving) {
            // Normalize direction vector for diagonal movement
            if (direction.x !== 0 && direction.y !== 0) {
                const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
                direction.x /= length;
                direction.y /= length;
            }

            // Calculate speed based on sprint state
            const sprintMultiplier = this.inputState.sprint ? PLAYER_SPRINT_MULTIPLIER : 1;
            const speed = PLAYER_SPEED * sprintMultiplier;

            // Apply movement directly if we're handling a single-player game
            const physics = this.entity.getComponent('physics');
            if (physics) {
                physics.setVelocity(direction.x * speed, direction.y * speed);
            } else {
                console.warn('No physics component found for input to control');
            }

            // We can still queue the action for future multiplayer compatibility
            actionManager.queueAction({
                type: 'entity:move',
                entityId: this.entity.id,
                direction,
                speed,
                immediate: true
            });
        } else {
            // No movement keys pressed, stop movement
            const physics = this.entity.getComponent('physics');
            if (physics) {
                physics.setVelocity(0, 0);
            }

            actionManager.queueAction({
                type: 'entity:move',
                entityId: this.entity.id,
                direction: { x: 0, y: 0 },
                speed: 0,
                immediate: true
            });
        }
    }

    processActionInput(previousState) {
        // Process attack (on key down only)
        if (this.inputState.attack && !previousState.attack) {
            actionManager.queueAction({
                type: 'entity:attack',
                entityId: this.entity.id,
                immediate: true
            });
        }
    }
}