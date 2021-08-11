const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.RESIZE,
    },
    scene: {
        preload,
        create,
        update
    },
    physics: {
        default: 'arcade',
    }
};

const game = new Phaser.Game(config);
const INITIAL_VELOCITY_X = 300;
const INITIAL_VELOCITY_Y = Phaser.Math.Between(0, 300);
const VICTORY_FONT_STYLE = {fontSize: '32px', fill: '#00FFFF'};

let ball;
let humanPlayer, cpuPlayer;
let isPlaying = false;
let isHumanPlayerScored = false;
let isCpuPlayerScored = false;
let cursors;
let keys = {};
let victoryText, humanPlayerScoreText, cpuPlayerScoreText;
let initialBallX;
let initialBallY;
let initialHumanPlayerX;
let initialHumanPlayerY;
let initialCpuPlayerX;
let initialCpuPlayerY;

function preload() {
    this.load.image('ball', 'img/ball.png');
    this.load.image('paddle', 'img/paddle.png');
}

function create() {
    const worldWidth = this.physics.world.bounds.width;
    const worldHeight = this.physics.world.bounds.height;

    initialBallX = worldWidth / 2;
    initialBallY = worldHeight / 2;

    ball = this.physics.add.sprite(initialBallX, initialBallY, 'ball');
    ball.setCollideWorldBounds(true);
    ball.setBounce(1, 1);

    const ballWidth = ball.body.width;

    initialHumanPlayerX = ballWidth / 2 + 10;
    initialHumanPlayerY = worldHeight / 2;
    initialCpuPlayerX = worldWidth - (ballWidth / 2 + 10);
    initialCpuPlayerY = worldHeight / 2;

    humanPlayer = this.physics.add.sprite(initialHumanPlayerX, initialHumanPlayerY, 'paddle');
    humanPlayer.setImmovable(true);
    humanPlayer.setCollideWorldBounds(true);
    humanPlayer.score = 0;
    this.physics.add.collider(ball, humanPlayer, ballHitsPaddle);

    cpuPlayer = this.physics.add.sprite(initialCpuPlayerX, initialCpuPlayerY, 'paddle');
    cpuPlayer.setImmovable(true);
    cpuPlayer.setCollideWorldBounds(true);
    cpuPlayer.score = 0;
    this.physics.add.collider(ball, cpuPlayer, ballHitsPaddle);

    cursors = this.input.keyboard.createCursorKeys();
    keys.w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    keys.s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    keys.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    victoryText = this.add.text(worldWidth / 2, worldHeight / 2 - 50, '', VICTORY_FONT_STYLE);
    victoryText.setVisible(false);
    victoryText.setOrigin(0.5);

    humanPlayerScoreText = this.add.text(100, 20, 'Player: 0');
    humanPlayerScoreText.setOrigin(0.5);

    cpuPlayerScoreText = this.add.text(worldWidth - 100, 20, 'CPU: 0');
    cpuPlayerScoreText.setOrigin(0.5);
}

function update() {
    if (!isPlaying) {
        if (keys.space.isDown) {
            ball.setVelocityX(isHumanPlayerScored ? -INITIAL_VELOCITY_X : INITIAL_VELOCITY_X);
            ball.setVelocityY(INITIAL_VELOCITY_Y);
            isPlaying = true;
            isHumanPlayerScored = false;
            isCpuPlayerScored = false;
            victoryText.setVisible(false);
        }
    }

    if (isPlaying && !(isHumanPlayerScored || isCpuPlayerScored)) {
        /* CPU Player movement */
        if (cpuPlayer.y > ball.y) {
            cpuPlayer.setVelocityY(-300);
        } else if (cpuPlayer.y < ball.y) {
            cpuPlayer.setVelocityY(300);
        } else {
            cpuPlayer.setVelocityY(0);
        }

        /* Human Player movement */
        if (keys.w.isDown || cursors.up.isDown) {
            humanPlayer.setVelocityY(-300);
        } else if (keys.s.isDown || cursors.down.isDown) {
            humanPlayer.setVelocityY(300);
        } else {
            humanPlayer.setVelocityY(0);
        }

        if (ball.body.x > cpuPlayer.body.x) {
            isPlaying = false;
            humanPlayer.score++;
            isHumanPlayerScored = true;
            isCpuPlayerScored = false;
            ball.setVelocity(0, 0);
            victoryText.setText('Player scores!');
            victoryText.setVisible(true);
            humanPlayer.setVelocityY(0);
            cpuPlayer.setVelocityY(0);
        }

        if (ball.body.x < humanPlayer.body.x) {
            isPlaying = false;
            cpuPlayer.score++;
            isHumanPlayerScored = false;
            isCpuPlayerScored = true;
            ball.setVelocity(0, 0);
            victoryText.setText('CPU scores!');
            victoryText.setVisible(true);
            humanPlayer.setVelocityY(0);
            cpuPlayer.setVelocityY(0);
        }
    }

    if (isHumanPlayerScored || isCpuPlayerScored) {
        resetPositions();
    }
}

function resetPositions() {
    humanPlayerScoreText.setText('Player: ' + humanPlayer.score);
    cpuPlayerScoreText.setText('CPU: ' + cpuPlayer.score);
    humanPlayer.setPosition(initialHumanPlayerX, initialHumanPlayerY);
    cpuPlayer.setPosition(initialCpuPlayerX, initialCpuPlayerY);
    ball.setPosition(initialBallX, initialBallY);
}

function ballHitsPaddle(ball, player) {
    ball.body.setVelocityY(10 * (ball.y - player.y));
    ball.body.setAccelerationX(ball.x - player.x);
}