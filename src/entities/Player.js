class Player {
    constructor(scene, x, y) {
        this.scene = scene;

        // Create player object
        this.gameObject = scene.add.circle(x, y, PLAYER_RADIUS, COLOR_PLAYER);
        scene.physics.add.existing(this.gameObject);
        this.gameObject.setDepth(100); // Ensure player is on top

        // Setup input keys
        this.keys = scene.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });

        // Follow with camera
        scene.cameras.main.startFollow(this.gameObject);
    }

    update() {
        // Reset velocity
        this.gameObject.body.setVelocity(0);

        // Movement controls
        if (this.keys.left.isDown) {
            this.gameObject.body.setVelocityX(-PLAYER_SPEED);
        } else if (this.keys.right.isDown) {
            this.gameObject.body.setVelocityX(PLAYER_SPEED);
        }

        if (this.keys.up.isDown) {
            this.gameObject.body.setVelocityY(-PLAYER_SPEED);
        } else if (this.keys.down.isDown) {
            this.gameObject.body.setVelocityY(PLAYER_SPEED);
        }
    }

    setPosition(x, y) {
        this.gameObject.setPosition(x, y);
    }
}