// Create the game instance
const game = new Phaser.Game(config);

// Global game state
let stages = {};
let currentStageId = 'stage-1';

// Handle window resize
window.addEventListener('resize', function () {
    game.scale.resize(window.innerWidth, window.innerHeight);
});