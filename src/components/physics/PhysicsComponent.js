import { Component } from "../../core/Component.js";

export class PhysicsComponent extends Component {
    constructor(bodyType = 'dynamic', radius = 16) {
        super('physics');
        this.bodyType = bodyType; // 'dynamic' or 'static'
        this.radius = radius;
        this.velocity = { x: 0, y: 0 };
        this.immovable = bodyType === 'static';
    }

    onAttach() {
        const render = this.entity.getComponent('render');
        if (!render || !render.gameObject) {
            console.error('PhysicsComponent requires a RenderComponent with a gameObject');
            return;
        }

        // Add physics to the render game object
        this.entity.scene.physics.add.existing(
            render.gameObject,
            this.bodyType === 'static'
        );

        // Set circle body if applicable
        if (this.radius) {
            render.gameObject.body.setCircle(this.radius);
            render.gameObject.body.offset.set(this.radius, this.radius);

        }

        // Set immovable for static bodies
        render.gameObject.body.immovable = this.immovable;
    }

    setVelocity(x, y) {
        this.velocity.x = x;
        this.velocity.y = y;

        const render = this.entity.getComponent('render');
        if (render && render.gameObject && render.gameObject.body) {
            render.gameObject.body.setVelocity(x, y);
        }
    }

    update() {
        const transform = this.entity.getComponent('transform');
        const render = this.entity.getComponent('render');

        if (transform && render && render.gameObject && render.gameObject.body) {
            // Update transform position from physics body
            transform.setPosition(
                render.gameObject.body.x,
                render.gameObject.body.y
            );
        }
    }

    getNetworkState() {
        return {
            velocity: { ...this.velocity },
            immovable: this.immovable
        };
    }

    applyNetworkState(state) {
        if (state.velocity) {
            this.setVelocity(state.velocity.x, state.velocity.y);
        }
    }
}