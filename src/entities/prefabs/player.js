import { TransformComponent } from "../../components/TransformComponent.js"
import { CircleComponent } from '../../components/CircleComponent.js';
import { PhysicsCapability } from '../../components/PhysicsCapability.js';
import { KeyboardInputComponent } from '../../components/KeyboardInputComponent.js';
import { PLAYER_RADIUS, COLOR_PLAYER } from '../../config.js';

/**
 * Creates a player entity with the updated component architecture
 * @param {Phaser.Scene} scene - The scene this entity belongs to
 * @param {object} config - Configuration options
 * @returns {Entity} The created player entity
 */
export function createPlayer(scene, config = {}) {
    const {
        x = 0,
        y = 0,
        radius = PLAYER_RADIUS,
        color = COLOR_PLAYER
    } = config;

    const player = scene.entityFactory.createEntity('player');
    player.type = 'player'; // Mark as player type for easier filtering

    // Add components in dependency order:

    // 1. First add the transform (foundation for other components)
    player.addComponent(new TransformComponent(x, y));

    // 2. Add the visual representation (creates the Phaser game object)
    player.addComponent(new CircleComponent(radius, color));

    // 3. Add physics capabilities to the existing game object
    player.addComponent(new PhysicsCapability('dynamic', {
        drag: 0  // Add some drag for better control
    }));

    // 4. Add input handling
    player.addComponent(new KeyboardInputComponent());

    // Set up camera following
    const objectComponent = player.getComponent('circle');
    if (objectComponent && objectComponent.gameObject) {
        scene.cameras.main.startFollow(objectComponent.gameObject);
    }

    return player;
}