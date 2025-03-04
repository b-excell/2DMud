// Game Constants
const TILE_SIZE = 64;
const STAGE_WIDTH = 20;
const STAGE_HEIGHT = 20;
const PLAYER_RADIUS = 16;
const PLAYER_SPEED = 200;

// Colors
const COLOR_SOLID = 0x000000; // Black
const COLOR_EMPTY = 0xDDDDDD; // Light gray
const COLOR_EXIT = 0x0000FF;  // Blue
const COLOR_PLAYER = 0xFF0000; // Red

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    },
    scene: [GameScene]
};