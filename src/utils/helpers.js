// Utility: Shuffle array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Find a random empty tile in a stage
function findEmptyTile(stage) {
    const emptyTiles = [];

    for (let y = 0; y < STAGE_HEIGHT; y++) {
        for (let x = 0; x < STAGE_WIDTH; x++) {
            if (stage.tiles[y][x] === 0) { // Empty
                emptyTiles.push({
                    x: x * TILE_SIZE + TILE_SIZE / 2,
                    y: y * TILE_SIZE + TILE_SIZE / 2
                });
            }
        }
    }

    if (emptyTiles.length === 0) {
        return {
            x: STAGE_WIDTH * TILE_SIZE / 2,
            y: STAGE_HEIGHT * TILE_SIZE / 2
        };
    }

    return emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
}