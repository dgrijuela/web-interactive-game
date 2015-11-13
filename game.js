var firstScript = document.getElementsByTagName('script')[0];
phaser = document.createElement('script');
phaser.src = 'https://cdnjs.cloudflare.com/ajax/libs/phaser/2.4.4/phaser.min.js';
phaser.onload = function () {
  // do stuff with your dynamically loaded script
  //snowStorm.snowColor = '#99ccff';
};
html2canvas = document.createElement('script');
html2canvas.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/0.4.1/html2canvas.min.js';
html2canvas.onload = function () {
  // do stuff with your dynamically loaded script
  //snowStorm.snowColor = '#99ccff';
};
firstScript.parentNode.insertBefore(phaser, firstScript);
firstScript.parentNode.insertBefore(html2canvas, firstScript);

function initGame(screenshot) {
  window.addEventListener("keyup", function(e) {
    if (e.keyCode == 27) { 
      location.reload();
    }
  }, false);

  var node = document.createElement("div");
  node.id = 'game';
  node.style.position = 'absolute';
  node.style.top = window.scrollY + 'px';
  node.style.zIndex = '999999';
  node.style.background = "rgba(0, 0, 0, 0.5)";
  document.body.appendChild(node);

  var game = new Phaser.Game(document.body.offsetWidth, document.body.offsetHeight, Phaser.AUTO, 'game', null, true);

  var ball;
  var bricks;
  var paddle;
  var page;

  var ballOnPaddle = true;

  var lives = 3;
  var score = 0;

  var scoreText;
  var bricksText;
  var livesText;
  var introText;
  var introText2;

  var divisionX = document.body.offsetWidth / 20;
  var divisionY = document.body.offsetHeight / 20;

  var s;

  var mainState = {
    preload: function() {
      game.load.atlas('breakout', '/breakout.png', '/breakout.json');
      game.load.spritesheet('page', screenshot, divisionX, divisionY);
    },
    create: function() {
      game.physics.startSystem(Phaser.Physics.ARCADE);

      // We check bounds collisions against all walls other than the bottom one
      game.physics.arcade.checkCollision.down = false;

      bricks = game.add.group();
      bricks.enableBody = true;
      bricks.physicsBodyType = Phaser.Physics.ARCADE;

      var brick;

      for(var y = 2; y < 13; y++) {
        for(var x = 2; x < 18; x++) {
          if(Math.round(Math.random() * 100) % 2 === 0) {
            brick = bricks.create(x * divisionX, y * divisionY, 'page', 20 * y + x);
            brick.body.bounce.set(1);
            brick.body.immovable = true;
          }
        }
      }

      paddle = game.add.sprite(game.world.centerX, document.body.offsetHeight - 100, 'breakout', 'paddle_big.png');
      paddle.anchor.setTo(0.5, 0.5);

      game.physics.enable(paddle, Phaser.Physics.ARCADE);

      paddle.body.collideWorldBounds = true;
      paddle.body.bounce.set(1);
      paddle.body.immovable = true;

      ball = game.add.sprite(game.world.centerX, paddle.y - 16, 'breakout', 'ball_1.png');
      ball.anchor.set(0.5);
      ball.checkWorldBounds = true;

      game.physics.enable(ball, Phaser.Physics.ARCADE);

      ball.body.collideWorldBounds = true;
      ball.body.bounce.set(1);

      ball.animations.add('spin', [ 'ball_1.png', 'ball_2.png', 'ball_3.png', 'ball_4.png', 'ball_5.png' ], 50, true, false);

      ball.events.onOutOfBounds.add(ballLost, this);

      scoreText = game.add.text(game.world.centerX, document.body.offsetHeight - 50, 'score: 0', { font: "20px Arial", fill: "#ffffff", align: "center" });
      bricksText = game.add.text(32, document.body.offsetHeight - 50, 'bricks left: ' + bricks.countLiving(), { font: "20px Arial", fill: "#ffffff", align: "left" });
      livesText = game.add.text(document.body.offsetWidth - 100, document.body.offsetHeight - 50, 'lives: 3', { font: "20px Arial", fill: "#ffffff", align: "right" });
      introText = game.add.text(game.world.centerX, document.body.offsetHeight / 1.3, '- click to start -', { font: "40px Arial", fill: "#ffffff", align: "center" });
      introText2 = game.add.text(game.world.centerX, document.body.offsetHeight / 1.3 + 23, '- esc to exit -', { font: "25px Arial", fill: "#ffffff", align: "center" });

      introText.anchor.setTo(0.5, 0.5);
      introText2.anchor.setTo(0.5, 0);
      scoreText.anchor.setTo(0.5, 0);

      game.input.onDown.add(releaseBall, this);

    },
    update: function() {
      //  Fun, but a little sea-sick inducing :) Uncomment if you like!
      // s.tilePosition.x += (game.input.speed.x / 2);
      paddle.x = game.input.x;

      if (paddle.x < 24) {
        paddle.x = 24;
      } else if (paddle.x > game.width - 24) {
        paddle.x = game.width - 24;
      }

      if (ballOnPaddle) {
        ball.body.x = paddle.x;
      } else {
        game.physics.arcade.collide(ball, paddle, ballHitPaddle, null, this);
        game.physics.arcade.collide(ball, bricks, ballHitBrick, null, this);
      }

      game.physics.arcade.collide(ball, bricks);
    }
  }

  function releaseBall () {
    if (ballOnPaddle) {
        ballOnPaddle = false;
        ball.body.velocity.y = -300;
        ball.body.velocity.x = -75;
        ball.animations.play('spin');
        introText.visible = false;
        introText2.visible = false;
      }
  }

  function ballLost () {
    lives--;
    livesText.text = 'lives: ' + lives;

    if (lives === 0) {
        gameOver();
        setTimeout(function() {
          location.reload();
        }, 1000);
      } else {
          ballOnPaddle = true;
          ball.reset(paddle.body.x + 16, paddle.y - 16);
          ball.animations.stop();
        }
  }

  function gameOver () {
    ball.body.velocity.setTo(0, 0);
    introText.text = 'Game Over! refreshing the page...';
    introText.visible = true;
  }

  function ballHitBrick (_ball, _brick) {
    _brick.kill();
    score += 10;
    scoreText.text = 'score: ' + score;
    bricksText.text = 'bricks left: ' + bricks.countLiving();
    //  Are they any bricks left?
    if (bricks.countLiving() == 0)
      {
        //  New level starts
        score += 1000;
        scoreText.text = 'score: ' + score;
        introText.text = '- Next Level -';

        //  Let's move the ball back to the paddle
        ballOnPaddle = true;
        ball.body.velocity.set(0);
        ball.x = paddle.x + 16;
        ball.y = paddle.y - 16;
        ball.animations.stop();

        //  And bring the bricks back from the dead :)
       bricks.callAll('revive');
      }
  }

  function ballHitPaddle (_ball, _paddle) {
    var diff = 0;
    if (_ball.x < _paddle.x) {
        //  Ball is on the left-hand side of the paddle
        diff = _paddle.x - _ball.x;
        _ball.body.velocity.x = (-10 * diff);
      } else if (_ball.x > _paddle.x) {
          //  Ball is on the right-hand side of the paddle
          diff = _ball.x -_paddle.x;
          _ball.body.velocity.x = (10 * diff);
        } else {
            //  Ball is perfectly in the middle
            //  Add a little random X to stop it bouncing straight up!
            _ball.body.velocity.x = 2 + Math.random() * 8;
          }
  }

  game.state.add('main', mainState);
  game.state.start('main');

  function resizeGame() {
    var height = document.body.offsetHeight;
    var width = document.body.offsetWidth;

    game.width = width;
    game.height = height;

    if (game.renderType === Phaser.WEBGL) {
        game.renderer.resize(width, height);
      }
  }
  window.addEventListener('resize', function() {
    resizeGame();
  });
  window.onscroll = function() {
    node.style.top = window.scrollY + 'px';
  };
}

var gameCode = "";
window.addEventListener("keydown",function(e) {
  gameCode = (gameCode+String.fromCharCode(e.keyCode || e.which)).substr(-4);
  if(gameCode == "GAME") {
    window.removeEventListener("keydown",arguments.callee);
    html2canvas(document.body, {
      onrendered: function(canvas) {
        initGame(canvas.toDataURL());
      }
    });
  }
}, false);
