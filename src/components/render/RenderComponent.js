import { Component } from "../../core/Component.js";

/**
 * Base class for all render components
 */
export class RenderComponent extends Component {
    constructor() {
        super('render');
        this.gameObject = null;
        this.visible = true;
        this.depth = 0;
    }

    setVisible(visible) {
        this.visible = visible;
        if (this.gameObject) {
            this.gameObject.setVisible(visible);
        }
    }

    setDepth(depth) {
        this.depth = depth;
        if (this.gameObject) {
            this.gameObject.setDepth(depth);
        }
    }

    onDetach() {
        if (this.gameObject) {
            this.gameObject.destroy();
            this.gameObject = null;
        }
    }

    getNetworkState() {
        return {
            visible: this.visible,
            depth: this.depth
        };
    }

    applyNetworkState(state) {
        if (state.visible !== undefined) {
            this.setVisible(state.visible);
        }

        if (state.depth !== undefined) {
            this.setDepth(state.depth);
        }
    }
}