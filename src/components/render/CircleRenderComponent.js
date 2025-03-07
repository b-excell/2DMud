import { RenderComponent } from "./RenderComponent.js";

export class CircleRenderComponent extends RenderComponent {
    constructor(radius, color) {
        super();
        this.radius = radius;
        this.color = color;
    }

    onAttach() {
        const transform = this.entity.getComponent('transform');
        if (!transform) {
            console.error('CircleRenderComponent requires a TransformComponent');
            return;
        }

        this.gameObject = this.entity.scene.add.circle(
            transform.position.x,
            transform.position.y,
            this.radius,
            this.color
        );

        this.gameObject.setDepth(this.depth);
        this.gameObject.setVisible(this.visible);

        // Store a reference to the entity on the game object
        this.gameObject.entity = this.entity;
    }

    update() {
        const transform = this.entity.getComponent('transform');
        if (transform && this.gameObject) {
            this.gameObject.setPosition(transform.position.x, transform.position.y);
        }
    }
}