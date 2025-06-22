// Dirección de movimiento
var DIRECTION = {
  IDLE: 0,
  UP: 1,
  DOWN: 2,
  LEFT: 3,
  RIGHT: 4
};

// Configuración del juego
var rounds = [5, 5, 3, 3, 2];
var colors = ['#1abc9c', '#2ecc71', '#3498db', '#e74c3c', '#9b59b6'];
 
// Objeto pelota
var Ball = {
  new: function (speed) {
    return {
      width: 18,
      height: 18,
      x: (this.canvas.width / 2) - 9,
      y: (this.canvas.height / 2) - 9,
      moveX: DIRECTION.IDLE,
      moveY: DIRECTION.IDLE,
      speed: speed || 9
    };
  }
};

// Objeto paddle
var Paddle = {
  new: function (side) {
    return {
      width: 18,
      height: 70,
      x: side === 'left' ? 150 : this.canvas.width - 150,
      y: (this.canvas.height / 2) - 35,
      score: 0,
      move: DIRECTION.IDLE,
      speed: 10
    };
  }
};
var Game = {
  initialize: function () {
    this.canvas = document.querySelector('canvas');
    this.context = this.canvas.getContext('2d');

    this.canvas.width = 1000;
    this.canvas.height = 700;

    this.player = Paddle.new.call(this, 'left');
    this.paddle = Paddle.new.call(this, 'right');
    this.ball = Ball.new.call(this);

    this.running = this.over = false;
    this.turn = this.paddle;
    this.timer = this.round = 0;
    this.color = '#2c3e50';

    Pong.listen();
  },

  listen: function () {
    document.addEventListener('keydown', function (key) {
      // Empezar el juego al presionar cualquier tecla
      if (Pong.running === false) {
        Pong.running = true;
        window.requestAnimationFrame(Pong.loop);
      }

      // Teclas para mover el jugador
      if (key.keyCode === 38 || key.keyCode === 87) Pong.player.move = DIRECTION.UP;
      if (key.keyCode === 40 || key.keyCode === 83) Pong.player.move = DIRECTION.DOWN;
    });

    document.addEventListener('keyup', function () {
      Pong.player.move = DIRECTION.IDLE;
    });
  }
};

var Pong = Object.assign({}, Game);
Pong.initialize();

