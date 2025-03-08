import { TransformComponent } from '../../components/core/TransformComponent.js';
import { CircleRenderComponent } from '../../components/render/CircleRenderComponent.js';
import { RectangleRenderComponent } from '../../components/render/RectangleRenderComponent.js';
import { PhysicsComponent } from '../../components/physics/PhysicsComponent.js';
import { KeyboardInputComponent } from '../../components/input/KeyboardInputComponent.js';
import { PLAYER_RADIUS, COLOR_PLAYER } from '../../config.js';

export function createPlayer(scene, config = {}) {
    const {
        x = 0,
        y = 0,
        radius = PLAYER_RADIUS,
        color = COLOR_PLAYER
    } = config;

    const player = scene.entityFactory.createEntity('player');

    // Add core components
    player.addComponent(new TransformComponent(x, y))
        .addComponent(new CircleRenderComponent(radius, color))
        .addComponent(new PhysicsComponent('dynamic', radius))
        .addComponent(new KeyboardInputComponent());

    // Set up camera following
    const renderComponent = player.getComponent('render');
    if (renderComponent && renderComponent.gameObject) {
        scene.cameras.main.startFollow(renderComponent.gameObject);
    }

    return player;
}