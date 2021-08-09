const config = {
    type: Phaser.AUTO,
    parent: 'game',
    width: 800,
    height: 640,
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: {
        preload,
        create,
        update
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: false,
            debug: false
        }
    }
};

const game = new Phaser.Game(config);
const INITIAL_VELOCITY_X = 300;
const INITIAL_VELOCITY_Y = Phaser.Math.Between(0, 300);
const VICTORY_FONT_STYLE = {fontSize: '32px', fill: '#00FFFF'};

let ball;
let player1, player2;
let isPlaying = false;
let isPlayer1Scored = false;
let isPlayer2Scored = false;
let cursors;
let keys = {};
let victoryText, player1ScoreText, player2ScoreText;
let startButton;
let initialBallX;
let initialBallY;
let initialPlayer1X;
let initialPlayer1Y;
let initialPlayer2X;
let initialPlayer2Y;

function preload() {
    this.load.image('ball', 'img/ball.png');
    this.load.image('paddle', 'img/paddle.png');
}

function create() {
    initialBallX = this.physics.world.bounds.width / 2;
    initialBallY = this.physics.world.bounds.height / 2;

    ball = this.physics.add.sprite(initialBallX, initialBallY, 'ball');
    ball.setCollideWorldBounds(true);
    ball.setBounce(1, 1);

    initialPlayer1X = ball.body.width / 2 + 10;
    initialPlayer1Y = this.physics.world.bounds.height / 2;
    initialPlayer2X = this.physics.world.bounds.width - (ball.body.width / 2 + 10);
    initialPlayer2Y = this.physics.world.bounds.height / 2;

    player1 = this.physics.add.sprite(initialPlayer1X, initialPlayer1Y, 'paddle');
    player1.setImmovable(true);
    player1.setCollideWorldBounds(true);
    player1.score = 0;
    this.physics.add.collider(ball, player1, ballHitsPaddle);

    player2 = this.physics.add.sprite(initialPlayer2X, initialPlayer2Y, 'paddle');
    player2.setImmovable(true);
    player2.setCollideWorldBounds(true);
    player2.score = 0;
    this.physics.add.collider(ball, player2, ballHitsPaddle);

    cursors = this.input.keyboard.createCursorKeys();
    keys.w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    keys.s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    keys.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    victoryText = this.add.text(this.physics.world.bounds.width / 2, this.physics.world.bounds.height / 2 - 50, '', VICTORY_FONT_STYLE);
    victoryText.setVisible(false);
    victoryText.setOrigin(0.5);

    player1ScoreText = this.add.text(100, 20, 'Player 1: 0');
    player1ScoreText.setOrigin(0.5);

    player2ScoreText = this.add.text(this.physics.world.bounds.width - 200, 20, 'Player 2: 0');
    player2ScoreText.setOrigin(0.5);
}

function update() {
    if (!isPlaying) {
        if (keys.space.isDown) {
            ball.setVelocityX(isPlayer1Scored ? -INITIAL_VELOCITY_X : INITIAL_VELOCITY_X);
            ball.setVelocityY(INITIAL_VELOCITY_Y);
            isPlaying = true;
            isPlayer1Scored = false;
            isPlayer2Scored = false;
            victoryText.setVisible(false);
        }
    }

    if (isPlaying && !(isPlayer1Scored || isPlayer2Scored)) {
        if (ball.body.x > player2.body.x) {
            isPlaying = false;
            player1.score++;
            isPlayer1Scored = true;
            isPlayer2Scored = false;
            ball.setVelocity(0, 0);
            victoryText.setText('Player 1 scores!');
            victoryText.setVisible(true);
        }

        if (ball.body.x < player1.body.x) {
            isPlaying = false;
            player2.score++;
            isPlayer1Scored = false;
            isPlayer2Scored = true;
            ball.setVelocity(0, 0);
            victoryText.setText('Player 2 scores!');
            victoryText.setVisible(true);
        }
    }

    player1.body.setVelocityY(0);
    player2.body.setVelocityY(0);

    if (isPlaying && !(isPlayer1Scored || isPlayer2Scored)) {
        if (keys.w.isDown) {
            player1.body.setVelocityY(-300);
        }
        if (keys.s.isDown) {
            player1.body.setVelocityY(300);
        }
        if (cursors.up.isDown) {
            player2.body.setVelocityY(-300);
        }
        if (cursors.down.isDown) {
            player2.body.setVelocityY(300);
        }
    }

    if (isPlayer1Scored || isPlayer2Scored) {
        resetPositions();
    }
}

function resetPositions() {
    player1ScoreText.setText('Player 1: ' + player1.score);
    player2ScoreText.setText('Player 2: ' + player2.score);
    player1.setPosition(initialPlayer1X, initialPlayer1Y);
    player2.setPosition(initialPlayer2X, initialPlayer2Y);
    ball.setPosition(initialBallX, initialBallY);
}

function ballHitsPaddle(ball, player) {
    ball.body.setVelocityY(10 * (ball.y - player.y));
    ball.body.setAccelerationX(ball.x - player.x);
}