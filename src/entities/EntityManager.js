/**
 * Manages all entities in the game
 * Provides a central place to update and track entities
 */
class EntityManager {
    constructor(scene) {
        this.scene = scene;
        this.entities = {};
        this.entityTypes = {};

        // Listen for entity events
        eventBus.on('entity:created', this.registerEntity.bind(this));
        eventBus.on('entity:destroyed', this.unregisterEntity.bind(this));
    }

    /**
     * Register a new entity
     * @param {object} data - Entity data
     */
    registerEntity(data) {
        const { entity } = data;
        this.entities[entity.id] = entity;

        // Group by type for efficient querying
        if (!this.entityTypes[entity.type]) {
            this.entityTypes[entity.type] = {};
        }
        this.entityTypes[entity.type][entity.id] = entity;
    }

    /**
     * Unregister an entity
     * @param {object} data - Entity data
     */
    unregisterEntity(data) {
        const { entityId } = data;

        if (this.entities[entityId]) {
            const entity = this.entities[entityId];

            // Remove from type groups
            if (this.entityTypes[entity.type] && this.entityTypes[entity.type][entityId]) {
                delete this.entityTypes[entity.type][entityId];
            }

            delete this.entities[entityId];
        }
    }

    /**
     * Update all entities
     * @param {number} deltaTime - Time since last update in ms
     */
    update(deltaTime) {
        Object.values(this.entities).forEach(entity => {
            if (entity.update) {
                entity.update(deltaTime);
            }
        });
    }

    /**
     * Get entities by type
     * @param {string} type - Entity type
     * @returns {object} Map of entities of the specified type
     */
    getEntitiesByType(type) {
        return this.entityTypes[type] || {};
    }

    /**
     * Get entity by ID
     * @param {string} id - Entity ID
     * @returns {Entity} The entity if found
     */
    getEntityById(id) {
        return this.entities[id];
    }

    /**
     * Get all entities in a radius
     * @param {number} x - Center X
     * @param {number} y - Center Y
     * @param {number} radius - Search radius
     * @returns {Array} Entities within radius
     */
    getEntitiesInRadius(x, y, radius) {
        const radiusSquared = radius * radius;

        return Object.values(this.entities).filter(entity => {
            const dx = entity.position.x - x;
            const dy = entity.position.y - y;
            return (dx * dx + dy * dy) <= radiusSquared;
        });
    }
}