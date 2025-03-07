import { TransformComponent } from '../../components/core/TransformComponent.js';
import { RectangleRenderComponent } from '../../components/render/RectangleRenderComponent.js';
import { PhysicsComponent } from '../../components/physics/PhysicsComponent.js';
import { TILE_SIZE, COLOR_EXIT } from '../../config.js';
import { Component } from '../../core/Component.js';

// Add this component for exits
class ExitComponent extends Component {
    constructor(exitIndex) {
        super('exit');
        this.exitIndex = exitIndex;
    }

    getNetworkState() {
        return {
            exitIndex: this.exitIndex
        };
    }
}

export function createExit(scene, config = {}) {
    const {
        x = 0,
        y = 0,
        width = TILE_SIZE,
        height = TILE_SIZE,
        color = COLOR_EXIT,
        exitIndex = 0
    } = config;

    const exit = scene.entityFactory.createEntity(`exit_${exitIndex}`);

    // Add components
    exit.addComponent(new TransformComponent(x, y))
        .addComponent(new RectangleRenderComponent(width, height, color))
        .addComponent(new PhysicsComponent('static'))
        .addComponent(new ExitComponent(exitIndex));

    return exit;
}