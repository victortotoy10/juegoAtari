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

Game.update = function () {
  if (!this.over) {
    // Rebotes con los bordes superior e inferior
    if (this.ball.y <= 0) this.ball.moveY = DIRECTION.DOWN;
    if (this.ball.y >= this.canvas.height - this.ball.height) this.ball.moveY = DIRECTION.UP;

    // Movimiento del jugador (paddle izquierdo)
    if (this.player.move === DIRECTION.UP) this.player.y -= this.player.speed;
    else if (this.player.move === DIRECTION.DOWN) this.player.y += this.player.speed;

    // Limitar movimiento del jugador dentro del canvas
    if (this.player.y <= 0) this.player.y = 0;
    if (this.player.y >= this.canvas.height - this.player.height) this.player.y = this.canvas.height - this.player.height;

    // Movimiento de la pelota
    if (this.ball.moveY === DIRECTION.UP) this.ball.y -= this.ball.speed / 1.5;
    else if (this.ball.moveY === DIRECTION.DOWN) this.ball.y += this.ball.speed / 1.5;

    if (this.ball.moveX === DIRECTION.LEFT) this.ball.x -= this.ball.speed;
    else if (this.ball.moveX === DIRECTION.RIGHT) this.ball.x += this.ball.speed;

    // Colisiones con la paleta del jugador
    if (
      this.ball.x - this.ball.width <= this.player.x &&
      this.ball.x >= this.player.x - this.player.width &&
      this.ball.y <= this.player.y + this.player.height &&
      this.ball.y + this.ball.height >= this.player.y
    ) {
      this.ball.x = this.player.x + this.ball.width;
      this.ball.moveX = DIRECTION.RIGHT;
    }

    // (Aquí agregaremos colisiones con el paddle derecho luego)
  }
};

Game.draw = function () {
  // Limpiar canvas
  this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

  // Fondo
  this.context.fillStyle = this.color;
  this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

  // Paletas y pelota
  this.context.fillStyle = '#fff';

  // Jugador (paddle izquierdo)
  this.context.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);

  // Oponente (paddle derecho) - aún sin movimiento
  this.context.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);

  // Pelota
  this.context.fillRect(this.ball.x, this.ball.y, this.ball.width, this.ball.height);

  // Línea central punteada
  this.context.beginPath();
  this.context.setLineDash([7, 15]);
  this.context.moveTo(this.canvas.width / 2, 0);
  this.context.lineTo(this.canvas.width / 2, this.canvas.height);
  this.context.lineWidth = 10;
  this.context.strokeStyle = '#fff';
  this.context.stroke();

  // Puntajes (puedes agregar luego)
};

Game.loop = function () {
  this.update();
  this.draw();

  if (!this.over) {
    requestAnimationFrame(this.loop.bind(this));
  }
};

var Pong = Object.assign({}, Game);
Pong.initialize();

