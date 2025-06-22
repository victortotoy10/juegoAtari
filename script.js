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

// Arreglo de colores para las rondas
var colors = ['#1abc9c', '#2ecc71', '#3498db', '#e74c3c', '#9b59b6'];

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
    this.turn = null; // Control de turno
    this.timer = 0;   // Control de tiempo de turno
    this.color = '#2c3e50'; // color inicial del fondo
    this.round = 0;

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
  },

  _generateRoundColor: function () {
    var newColor = colors[Math.floor(Math.random() * colors.length)];
    if (newColor === this.color) return this._generateRoundColor();
    return newColor;
  },

  _turnDelayIsOver: function() {
    return ((new Date()).getTime() - this.timer >= 1000); // 1 segundo de retraso
  },

  _resetTurn: function(victor, loser) {
    beep2.play(); // Sonido de punto/anotación
    this.ball = Ball.new.call(this, this.ball.speed);
    this.turn = loser;
    this.timer = (new Date()).getTime();
    this.color = this._generateRoundColor(); // Cambia el color de fondo cada ronda
    // El puntaje ya se suma en update, si quieres puedes dejar solo aquí:
    // victor.score++;
    beep3.play(); // Sonido de nueva ronda
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
    if (this.player.y < 0) this.player.y = 0;
    if (this.player.y > this.canvas.height - this.player.height) this.player.y = this.canvas.height - this.player.height;

    // Movimiento IA paddle derecho (oponente)
    if (this.paddle.y + this.paddle.height / 2 < this.ball.y) {
      this.paddle.y += this.paddle.speed / 1.5;
    } else {
      this.paddle.y -= this.paddle.speed / 1.5;
    }

    // Limitar movimiento paddle derecho dentro del canvas
    if (this.paddle.y <= 0) this.paddle.y = 0;
    if (this.paddle.y >= this.canvas.height - this.paddle.height) {
      this.paddle.y = this.canvas.height - this.paddle.height;
    }

    // Solo mover la pelota si el retraso de turno terminó
    if (this.turn && this._turnDelayIsOver()) {
      this.ball.moveX = this.turn === this.player ? DIRECTION.LEFT : DIRECTION.RIGHT;
      this.ball.moveY = [DIRECTION.UP, DIRECTION.DOWN][Math.floor(Math.random() * 2)];
      this.turn = null;
    }

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
      beep1.play(); // Sonido de rebote en paddle
    }

    // (Aquí agregaremos colisiones con el paddle derecho luego)

    // Detectar cuando la pelota pasa los bordes (puntaje)
    if (this.ball.x <= 0) {
      // Punto para paddle derecho
      this.paddle.score++;
      this._resetTurn(this.paddle, this.player);
    } else if (this.ball.x >= this.canvas.width - this.ball.width) {
      // Punto para jugador
      this.player.score++;
      this._resetTurn(this.player, this.paddle);
    }
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

  // Oponente (paddle derecho)
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

  // Mostrar puntajes (a la izquierda y derecha)
  this.context.font = '60px Courier New';
  this.context.fillStyle = '#ffffff';
  this.context.textAlign = 'center';

  this.context.fillText(this.player.score, this.canvas.width / 4, 100);
  this.context.fillText(this.paddle.score, this.canvas.width * 3 / 4, 100);

  // Mostrar mensaje de inicio si el juego no está corriendo
  if (!this.running) {
    this.context.font = '40px Courier New';
    this.context.fillText('Presiona cualquier tecla para comenzar', this.canvas.width / 2, this.canvas.height / 2);
  }
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

// Sonidos
var beep1 = new Audio('sounds/beep1.mp3');
var beep2 = new Audio('sounds/beep2.mp3');
var beep3 = new Audio('sounds/beep3.mp3');

