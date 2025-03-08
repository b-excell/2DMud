import { PhaserObjectComponent } from "./PhaserObjectComponent.js";

/**
 * Component that creates and manages a rectangular Phaser game object
 */
export class RectangleComponent extends PhaserObjectComponent {
    /**
     * Create a new RectangleComponent
     * @param {number} width - Width of the rectangle
     * @param {number} height - Height of the rectangle
     * @param {number} color - Fill color (hex value)
     * @param {number} alpha - Alpha transparency (0-1)
     */
    constructor(width, height, color, alpha = 1) {
        super('rectangle');
        this.width = width;
        this.height = height;
        this.color = color;
        this.alpha = alpha;
    }

    /**
     * Create a Phaser rectangle game object
     * @returns {Phaser.GameObjects.Rectangle} The created rectangle object
     */
    createGameObject() {
        const transform = this.getRequiredComponent('transform');

        const rectangle = this.entity.scene.add.rectangle(
            transform.position.x,
            transform.position.y,
            this.width,
            this.height,
            this.color,
            this.alpha
        );

        return rectangle;
    }

    /**
     * Get dimensions for physics body creation
     * @returns {object} Width and height of the rectangle
     */
    getDimensions() {
        return {
            width: this.width,
            height: this.height
        };
    }

    /**
     * Get network serializable state
     * @returns {object} Serializable state
     */
    getNetworkState() {
        return {
            ...super.getNetworkState(),
            width: this.width,
            height: this.height,
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

        if ((state.width !== undefined || state.height !== undefined) && this.gameObject) {
            this.width = state.width !== undefined ? state.width : this.width;
            this.height = state.height !== undefined ? state.height : this.height;
            this.gameObject.setSize(this.width, this.height);
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