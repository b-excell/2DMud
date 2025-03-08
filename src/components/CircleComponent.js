import { PhaserObjectComponent } from "./PhaserObjectComponent";

/**
 * Component that creates and manages a circular Phaser game object
 */
export class CircleComponent extends PhaserObjectComponent {
    /**
     * Create a new CircleComponent
     * @param {number} radius - Radius of the circle
     * @param {number} color - Fill color (hex value)
     * @param {number} alpha - Alpha transparency (0-1)
     */
    constructor(radius, color, alpha = 1) {
        super('circle');
        this.radius = radius;
        this.color = color;
        this.alpha = alpha;
    }

    /**
     * Create a Phaser circle game object
     * @returns {Phaser.GameObjects.Arc} The created circle object
     */
    createGameObject() {
        const transform = this.getRequiredComponent('transform');

        const circle = this.entity.scene.add.circle(
            transform.position.x,
            transform.position.y,
            this.radius,
            this.color,
            this.alpha
        );

        return circle;
    }

    /**
     * Get network serializable state
     * @returns {object} Serializable state
     */
    getNetworkState() {
        return {
            ...super.getNetworkState(),
            radius: this.radius,
            color: this.color,
            alpha: this.alpha
        };
    }

    /**
     * Apply network state
     * @param {object} state - State to apply
     */
    applyNetworkState(state) {
        super.applyNetworkState(state);

        if (state.radius !== undefined && this.gameObject) {
            this.radius = state.radius;
            // Note: Phaser doesn't provide a direct way to update circle radius
            // We'd need to recreate the circle or use a custom approach
        }

        if (state.color !== undefined && this.gameObject) {
            this.color = state.color;
            this.gameObject.fillColor = state.color;
        }

        if (state.alpha !== undefined && this.gameObject) {
            this.alpha = state.alpha;
            this.gameObject.alpha = state.alpha;
        }
    }
}