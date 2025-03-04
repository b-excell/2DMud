class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        // Initialize stage manager
        this.stageManager = new StageManager(this);
        this.stageManager.initialize();

        // Initialize exit manager
        this.exitManager = new ExitManager(this);

        // Generate initial stage
        const initialStage = this.stageManager.setupStage(currentStageId);

        // Create player
        const safeSpot = findEmptyTile(initialStage);
        this.player = new Player(this, safeSpot.x, safeSpot.y);

        // Set up collisions
        this.physics.add.collider(this.player.gameObject, this.stageManager.walls);
        this.physics.add.overlap(
            this.player.gameObject,
            this.stageManager.exits,
            (player, exit) => this.exitManager.handleExit(player, exit),
            null,
            this
        );
    }

    update() {
        // Update player
        this.player.update();
    }
}