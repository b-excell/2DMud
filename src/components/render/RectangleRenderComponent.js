import { RenderComponent } from "./RenderComponent.js";

export class RectangleRenderComponent extends RenderComponent {
    constructor(width, height, color) {
        super();
        this.width = width;
        this.height = height;
        this.color = color;
    }

    onAttach() {
        const transform = this.entity.getComponent('transform');
        if (!transform) {
            console.error('RectangleRenderComponent requires a TransformComponent');
            return;
        }

        this.gameObject = this.entity.scene.add.rectangle(
            transform.position.x,
            transform.position.y,
            this.width,
            this.height,
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
            this.gameObject.setRotation(transform.rotation);
            this.gameObject.setScale(transform.scale.x, transform.scale.y);
        }
    }
}