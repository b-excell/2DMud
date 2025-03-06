import './utils/helpers.js';
import { eventBus } from './core/EventBus.js';
import { Entity } from './core/Entity.js';
import { gameState } from './core/GameState.js';
import { actionManager } from './core/ActionManager.js';
import './entities/EntityManager.js';
import './input/InputManager.js';
import './scenes/GameScene.js';
import { Player } from './entities/Player.js';
import { StageGenerator } from './world/StageGenerator.js';
import { StageManager } from './world/Stage.js';
import { ExitManager } from './world/ExitManager.js';
import { config } from './config.js';
import './game.js';

// Setup window resize handler
window.addEventListener('resize', function () {
    if (window.game) {
        window.game.scale.resize(window.innerWidth, window.innerHeight);
    }
});