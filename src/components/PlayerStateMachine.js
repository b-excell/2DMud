import { Component } from './Component.js';
import { eventBus } from '../core/EventBus.js';

/**
 * Movement and attack state machine for the player
 * Controls player behavior based on input and current state
 */
export class PlayerStateMachine extends Component {
    /**
     * Create a new PlayerStateMachine component
     */
    constructor() {
        super('playerStateMachine');
        
        // Define all possible movement states
        this.movementStates = {
            STANDING: 'standing',
            WALKING: 'walking',
            RUNNING: 'running',
            DASHING: 'dashing'
        };
        
        // Define all possible attack types
        this.attackTypes = {
            PRIMARY: 'primary',
            SECONDARY: 'secondary'
        };
        
        // Current state tracking
        this.currentMovementState = this.movementStates.STANDING;
        this.dashCooldown = 0;
        this.dashDuration = 0;
        this.dashDirection = { x: 0, y: 0 };
        this.maxDashCooldown = 1000; // 1 second cooldown between dashes
        this.maxDashDuration = 250;  // dash lasts 250ms
        
        // Set dependencies
        this.requireComponent('keyboard');
        this.requireComponent('physics');
    }
    
    /**
     * Handle component initialization
     * @returns {boolean} True if successfully attached
     */
    onAttach() {
        if (!super.onAttach()) return false;
        
        // Set up attack input listeners
        this.setupMouseInput();
        
        console.log("Player state machine initialized");
        return true;
    }
    
    /**
     * Set up mouse input for attacks
     */
    setupMouseInput() {
        // First remove any existing listeners to avoid duplicates
        this.entity.scene.input.off('pointerdown', this.handleMouseClick, this);
        
        // Add new listener with proper context binding
        this.entity.scene.input.on('pointerdown', this.handleMouseClick, this);
        
        console.log("Mouse input setup completed for attacks");
    }
    
    /**
     * Handle mouse click events
     * @param {Phaser.Input.Pointer} pointer - The pointer that triggered the event
     */
    handleMouseClick(pointer) {
        if (!this.entity.scene.player || this.entity.id !== this.entity.scene.player.id) {
            return; // Only process for the player entity
        }
        
        console.log("Click detected on player entity");
        
        // Left click - primary attack
        if (pointer.leftButtonDown()) {
            console.log("Left mouse button detected");
            this.attack(this.attackTypes.PRIMARY);
        }
        // Right click - secondary attack
        else if (pointer.rightButtonDown()) {
            console.log("Right mouse button detected");
            this.attack(this.attackTypes.SECONDARY);
        }
    }
    
    /**
     * Update movement state based on current input
     * @param {object} inputState - Current input state from KeyboardInputComponent
     * @param {number} deltaTime - Time in ms since last update
     */
    updateMovementState(inputState, deltaTime) {
        // If currently dashing, manage dash state
        if (this.currentMovementState === this.movementStates.DASHING) {
            this.dashDuration -= deltaTime;
            
            if (this.dashDuration <= 0) {
                // Dash has finished
                this.dashDuration = 0;
                
                // Determine the next state based on input
                if (inputState.up || inputState.down || inputState.left || inputState.right) {
                    this.currentMovementState = inputState.sprint ? 
                        this.movementStates.RUNNING : this.movementStates.WALKING;
                } else {
                    this.currentMovementState = this.movementStates.STANDING;
                }
                
                console.log(`Dash ended, now ${this.currentMovementState}`);
            }
            return;
        }
        
        // Update dash cooldown
        if (this.dashCooldown > 0) {
            this.dashCooldown -= deltaTime;
            if (this.dashCooldown < 0) this.dashCooldown = 0;
        }
        
        // Check for dash input (space)
        if (inputState.dash && this.dashCooldown === 0 && 
            this.currentMovementState !== this.movementStates.STANDING) {
            // Start a dash
            this.startDash();
            return;
        }
        
        // Handle regular movement states
        if (inputState.up || inputState.down || inputState.left || inputState.right) {
            // Moving in some direction
            const newState = inputState.sprint ? 
                this.movementStates.RUNNING : this.movementStates.WALKING;
                
            if (this.currentMovementState !== newState) {
                this.currentMovementState = newState;
                console.log(`Movement state: ${this.currentMovementState}`);
            }
        } else {
            // No movement input
            if (this.currentMovementState !== this.movementStates.STANDING) {
                this.currentMovementState = this.movementStates.STANDING;
                console.log(`Movement state: ${this.currentMovementState}`);
            }
        }
    }
    
    /**
     * Start a dash in the current movement direction
     */
    startDash() {
        // Can only dash if moving
        if (this.currentMovementState === this.movementStates.STANDING) {
            return;
        }
        
        // Get keyboard component to determine dash direction
        const keyboard = this.entity.getComponent('keyboard');
        if (!keyboard) return;
        
        // Calculate dash direction from current input
        this.dashDirection = keyboard.getMovementDirection();
        
        // If no direction, use the last known direction or default to down
        if (this.dashDirection.x === 0 && this.dashDirection.y === 0) {
            // Default to downward dash if no direction is available
            this.dashDirection = { x: 0, y: 1 };
        }
        
        // Set dash state
        this.currentMovementState = this.movementStates.DASHING;
        this.dashDuration = this.maxDashDuration;
        this.dashCooldown = this.maxDashCooldown;
        
        console.log(`Started dash in direction (${this.dashDirection.x}, ${this.dashDirection.y})`);
        
        // Apply dash movement through physics
        this.applyDashForce();
    }
    
    /**
     * Apply force for dash movement
     */
    applyDashForce() {
        const physics = this.entity.getComponent('physics');
        if (!physics) return;
        
        // Calculate dash velocity - much faster than running
        const dashSpeed = 800; // Adjust as needed
        const dashVelocityX = this.dashDirection.x * dashSpeed;
        const dashVelocityY = this.dashDirection.y * dashSpeed;
        
        // Apply the dash velocity
        physics.setVelocity(dashVelocityX, dashVelocityY);
    }
    
    /**
     * Perform an attack based on current movement state
     * @param {string} attackType - Type of attack (primary or secondary)
     */
    attack(attackType) {
        const attackName = `${this.currentMovementState}_${attackType}`;
        console.log(`Performing attack: ${attackName}`);
        
        // Different attacks based on movement state
        switch (this.currentMovementState) {
            case this.movementStates.STANDING:
                this.performStandingAttack(attackType);
                break;
            case this.movementStates.WALKING:
                this.performWalkingAttack(attackType);
                break;
            case this.movementStates.RUNNING:
                this.performRunningAttack(attackType);
                break;
            case this.movementStates.DASHING:
                this.performDashingAttack(attackType);
                break;
        }
        
        // Emit an event for attack
        eventBus.emit('player:attack', {
            entity: this.entity,
            attackType: attackType,
            movementState: this.currentMovementState
        });
    }
    
    /**
     * Perform standing attack
     * @param {string} attackType - Type of attack (primary or secondary)
     */
    performStandingAttack(attackType) {
        if (attackType === this.attackTypes.PRIMARY) {
            console.log("Standing Primary Attack: A precise strike");
        } else {
            console.log("Standing Secondary Attack: A defensive counter move");
        }
    }
    
    /**
     * Perform walking attack
     * @param {string} attackType - Type of attack (primary or secondary)
     */
    performWalkingAttack(attackType) {
        if (attackType === this.attackTypes.PRIMARY) {
            console.log("Walking Primary Attack: A mobile strike");
        } else {
            console.log("Walking Secondary Attack: A directional power move");
        }
    }
    
    /**
     * Perform running attack
     * @param {string} attackType - Type of attack (primary or secondary)
     */
    performRunningAttack(attackType) {
        if (attackType === this.attackTypes.PRIMARY) {
            console.log("Running Primary Attack: A lunging strike with momentum");
        } else {
            console.log("Running Secondary Attack: A spinning area attack");
        }
    }
    
    /**
     * Perform dashing attack
     * @param {string} attackType - Type of attack (primary or secondary)
     */
    performDashingAttack(attackType) {
        if (attackType === this.attackTypes.PRIMARY) {
            console.log("Dashing Primary Attack: A powerful piercing attack");
        } else {
            console.log("Dashing Secondary Attack: A shockwave blast on impact");
        }
    }
    
    /**
     * Update component state
     * @param {number} deltaTime - Time in ms since last update
     */
    update(deltaTime) {
        const keyboard = this.entity.getComponent('keyboard');
        if (!keyboard) return;
        
        // Update movement state based on input
        this.updateMovementState(keyboard.inputState, deltaTime);
        
        // Apply appropriate movement based on state
        this.applyMovement(keyboard.inputState);
    }
    
    /**
     * Apply movement based on current state and input
     * @param {object} inputState - Current input state
     */
    applyMovement(inputState) {
        // Skip if dashing (handled in startDash)
        if (this.currentMovementState === this.movementStates.DASHING) {
            return;
        }
        
        const physics = this.entity.getComponent('physics');
        if (!physics) return;
        
        // Calculate movement direction
        const direction = {
            x: 0,
            y: 0
        };
        
        if (inputState.left) direction.x -= 1;
        if (inputState.right) direction.x += 1;
        if (inputState.up) direction.y -= 1;
        if (inputState.down) direction.y += 1;
        
        // Check if there's any movement input
        const isMoving = direction.x !== 0 || direction.y !== 0;
        
        if (isMoving) {
            // Normalize direction vector for diagonal movement
            if (direction.x !== 0 && direction.y !== 0) {
                const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
                direction.x /= length;
                direction.y /= length;
            }
            
            // Set speed based on movement state
            let speed = 0;
            switch (this.currentMovementState) {
                case this.movementStates.WALKING:
                    speed = 200;
                    break;
                case this.movementStates.RUNNING:
                    speed = 350;
                    break;
                default:
                    speed = 0;
            }
            
            // Apply movement
            physics.setVelocity(direction.x * speed, direction.y * speed);
        } else {
            // No movement
            physics.setVelocity(0, 0);
        }
    }
} 