import { Entity } from '../core/Entity.js';
import { eventBus } from '../core/EventBus.js';

/**
 * Factory for creating game entities
 */
export class EntityFactory {
    constructor(scene) {
        this.scene = scene;
        this.prefabs = {};
    }

    /**
     * Create a basic entity
     * @param {string} id - Optional entity ID
     * @returns {Entity} - New entity
     */
    createEntity(id = null) {
        return new Entity(this.scene, id);
    }

    /**
     * Create an entity from a prefab
     * @param {string} prefabName - Name of the prefab
     * @param {object} config - Configuration override
     * @returns {Entity} - The created entity
     */
    createFromPrefab(prefabName, config = {}) {
        if (!this.prefabs[prefabName]) {
            console.error(`Prefab "${prefabName}" not found`);
            return null;
        }

        return this.prefabs[prefabName](this.scene, config);
    }

    /**
     * Register a prefab
     * @param {string} name - Prefab name
     * @param {function} factoryFn - Factory function
     */
    registerPrefab(name, factoryFn) {
        this.prefabs[name] = factoryFn;
    }
}