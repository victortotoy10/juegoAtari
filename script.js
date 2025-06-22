// Dirección de movimiento
var DIRECTION = {
  IDLE: 0,
  UP: 1,
  DOWN: 2,
  LEFT: 3,
  RIGHT: 4
};

// Placeholder para efectos de sonido. Reemplaza estos objetos por archivos reales .mp3 en producción.
var beep1 = {
    play: function() { /* console.log('Playing beep1.mp3'); */ }
};
var beep2 = {
    play: function() { /* console.log('Playing beep2.mp3'); */ }
};
var beep3 = {
    play: function() { /* console.log('Playing beep3.mp3'); */ }
};

// Configuración del juego
var rounds = [5, 5, 3, 3, 2];

// Arreglo de colores para las rondas
var colors = ['#1abc9c', '#2ecc71', '#3498db', '#e74c3c', '#9b59b6'];

// Definición del objeto Paddle (Paleta)
var Paddle = {
  new: function (side) {
    return {
      x: side === 'left' ? 10 : this.canvas.width - 20,
      y: (this.canvas.height / 2) - 50,
      width: 10,
      height: 100,
      score: 0,
      move: DIRECTION.IDLE,
      speed: 8
    };
  }
};

// Definición del objeto Ball (Pelota)
var Ball = {
  new: function (speed) {
    var obj = {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
      width: 10,
      height: 10,
      speed: speed || 4,
      moveX: DIRECTION.RIGHT,
      moveY: DIRECTION.UP
    };

    // Asegurarse de que la pelota no aparezca dentro de la paleta del jugador
    if (obj.x < this.player.x + this.player.width) {
      obj.x = this.player.x + this.player.width;
      obj.moveX = DIRECTION.RIGHT;
    }

    return obj;
  }
};

var Game = {
  initialize: function () {
    // Inicializa el canvas y variables del juego
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
      if (key.code === "ArrowUp" || key.code === "KeyW") Pong.player.move = DIRECTION.UP;
      if (key.code === "ArrowDown" || key.code === "KeyS") Pong.player.move = DIRECTION.DOWN;
    });

    document.addEventListener('keyup', function (key) {
      // Detener el movimiento solo si la tecla soltada era de movimiento
      if (
        key.code === "ArrowUp" ||
        key.code === "KeyW" ||
        key.code === "ArrowDown" ||
        key.code === "KeyS"
      ) {
        Pong.player.move = DIRECTION.IDLE;
      }
    });
  },

  _generateRoundColor: function () {
    // Genera un color de fondo aleatorio distinto al actual
    var newColor = colors[Math.floor(Math.random() * colors.length)];
    if (newColor === this.color) return this._generateRoundColor();
    return newColor;
  },

  _turnDelayIsOver: function() {
    // Verifica si terminó el retraso entre turnos
    return ((new Date()).getTime() - this.timer >= 1000); // 1 segundo de retraso
  },

  _resetTurn: function(victor, loser) {
    // Reinicia la posición de la pelota y alterna el turno
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

Game.endGameMenu = function (text) {
  // Muestra el menú de fin de juego
  this.context.font = '50px Courier New';
  this.context.fillStyle = this.color;

  // Fondo del texto
  this.context.fillRect(
    this.canvas.width / 2 - 350,
    this.canvas.height / 2 - 48,
    700,
    100
  );

  this.context.fillStyle = '#ffffff';
  this.context.fillText(
    text,
    this.canvas.width / 2,
    this.canvas.height / 2 + 15
  );

  // Reiniciar el juego después de 3 segundos
  setTimeout(() => {
    Pong = Object.assign({}, Game);
    Pong.initialize();
  }, 3000);
};

// Actualiza la posición de la pelota y paddles
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

    // Colisiones con la paleta de la IA (derecha)
    if (
      this.ball.x + this.ball.width >= this.paddle.x &&
      this.ball.x <= this.paddle.x + this.paddle.width &&
      this.ball.y + this.ball.height >= this.paddle.y &&
      this.ball.y <= this.paddle.y + this.paddle.height
    ) {
      this.ball.moveX = DIRECTION.LEFT; // Invierte la dirección X
      this.ball.x = this.paddle.x - this.ball.width; // Evita que se pegue
      beep1.play(); // Sonido de rebote en la paleta
    }

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

    // Verificar si el jugador ganó
    if (this.player.score >= rounds[this.round]) {
      if (!rounds[this.round + 1]) {
        this.over = true;
        setTimeout(() => this.endGameMenu('¡Ganaste!'), 500);
        return;
      } else {
        // Siguiente ronda
        this.color = this._generateRoundColor();
        this.round++;
        this.player.score = 0;
        this.paddle.score = 0;
        this.player.speed += 0.5;
        this.paddle.speed += 1;
        this.ball.speed += 1;
        beep3.play();
      }
    }

    // Verificar si la IA ganó
    if (this.paddle.score >= rounds[this.round]) {
      this.over = true;
      setTimeout(() => this.endGameMenu('Perdiste 😢'), 500);
    }
  }
};

// Dibuja los elementos del juego en el canvas
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

  // Dibuja la red punteada en el centro
  this.context.beginPath();
  this.context.setLineDash([7, 15]);
  this.context.moveTo(this.canvas.width / 2, 0);
  this.context.lineTo(this.canvas.width / 2, this.canvas.height);
  this.context.lineWidth = 10;
  this.context.strokeStyle = '#ffffff';
  this.context.stroke();
  this.context.setLineDash([]); // Resetear estilo de línea

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
    requestAnimationFrame(this.loop.bind(this)); // <-- Asegura el contexto correcto de 'this'
  }
};

// Marcador de posición para el objeto global Pong
var Pong;

// Inicializa el juego cuando la ventana carga
window.onload = function() {
    Pong = Object.assign({}, Game);
    Pong.initialize();
};

