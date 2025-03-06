import Phaser from 'phaser';

// Game Constants
export const TILE_SIZE = 64;
export const STAGE_WIDTH = 20;
export const STAGE_HEIGHT = 20;
export const PLAYER_RADIUS = 16;
export const PLAYER_SPEED = 200;
export const PLAYER_SPRINT_MULTIPLIER = 1.75;

// Colors
export const COLOR_SOLID = 0x000000; // Black
export const COLOR_EMPTY = 0xDDDDDD; // Light gray
export const COLOR_EXIT = 0x0000FF;  // Blue
export const COLOR_PLAYER = 0xFF0000; // Red

// Game configuration
export const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    },
    scene: [] // We'll add scenes dynamically
};