import { TransformComponent } from '../../../components/TransformComponent.js';
import { RectangleComponent } from '../../../components/RectangleComponent.js';
import { PhysicsCapability } from '../../../components/PhysicsCapability.js';
import { TILE_SIZE } from '../../../config.js';

/**
 * Stone Wall - Solid environmental block that cannot be passed through
 * Used as the main structural element for level boundaries and obstacles
 */
export function createWallStone(scene, config = {}) {
    const {
        x = 0,
        y = 0,
        width = TILE_SIZE,
        height = TILE_SIZE,
        color = 0x444444, // Dark gray color
    } = config;

    // Create entity with a consistent naming pattern
    const wallEntity = scene.entityFactory.createEntity(`env_wall_stone_${Date.now()}`);
    wallEntity.type = 'wall_stone'; // Tag type for filtering

    // Add components in dependency order:
    
    // 1. Transform component (foundation)
    wallEntity.addComponent(new TransformComponent(x, y));

    // 2. Visual representation
    wallEntity.addComponent(new RectangleComponent(width, height, color));

    // 3. Physics - static body type makes it immovable
    wallEntity.addComponent(new PhysicsCapability('static', {
        bounce: 0,
        friction: 1
    }));

    return wallEntity;
}