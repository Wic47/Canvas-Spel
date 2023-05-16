const canvas = document.getElementById("canvas");
const c = canvas.getContext("2d");
const scorediv = document.getElementById("score");
const gameover = document.getElementById("game-over");
const highscore = document.getElementById("high-score");
const tryagain = document.getElementById("try-again");
let score = 0;
window.focus();
const ship = {
  position: {
    x: canvas.width / 2,
    y: canvas.height / 2,
    angle: 0,
  },
  velocity: {
    speed: 0,
    fallof: 0.985,
    rotationSpeed: 0,
  },
  actions: {
    forward: false,
    left: false,
    right: false,
    lives: 1,
    immune: false,
  },
  draw() {
    c.save();
    c.translate(this.position.x, this.position.y);
    c.rotate(ship.position.angle);
    c.translate(-this.position.x, -this.position.y);
    c.font = "50px Work Sans, sans serif";
    c.fillStyle = "white";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("A", this.position.x, this.position.y);
    c.restore();
  },
  update() {
    if (this.actions.forward) {
      this.velocity.speed = 5;
    } else {
      this.velocity.speed *= this.velocity.fallof;
    }
    this.position.x += Math.sin(this.position.angle) * this.velocity.speed;
    this.position.y += -Math.cos(this.position.angle) * this.velocity.speed;
    if (this.position.y > canvas.height) {
      this.position.y = 0;
    } else if (this.position.y < 0) {
      this.position.y = canvas.height;
    } else if (this.position.x < 0) {
      this.position.x = canvas.width;
    } else if (this.position.x > canvas.width) {
      this.position.x = 0;
    }
  },
  collision() {
    asteroids.forEach((a) => {
      const dx = a.asteroid.x - this.position.x;
      const dy = a.asteroid.y - this.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (a.asteroid.width + 20 >= distance) {
        this.actions.lives -= 1;
        a.asteroid.out_of_bounds = true;
        reset();
        this.actions.immune = true;
        score += 20;
        scorediv.innerHTML = score;
        timer = setTimeout(() => {
          this.actions.immune = false;
        }, 2000);
      }
    });
  },
  rotate() {
    if (this.actions.left) {
      this.position.angle -= 0.05;
    }
    if (this.actions.right) {
      this.position.angle += 0.05;
    }
  },
};

function reset() {
  ship.position.x = canvas.width / 2;
  ship.position.y = canvas.height / 2;
  ship.position.angle = 0;
  ship.velocity.speed = 0;
  asteroids = [];
  bullets = [];
}

function game_over() {
  reset();
  c.clearRect(0, 0, canvas.width, canvas.height);
  gameover.style.display = "flex";
  highscore.innerHTML = `High-Score: ${score}`;
  highscore.style.display = "flex";
  score = 0;
  scorediv.style.display = "none";
  tryagain.style.display = "flex";
}

class Bullet {
  constructor() {
    this.bullet = {
      x: ship.position.x,
      y: ship.position.y,
      dy: 8,
      angle: ship.position.angle,
      out_of_bounds: false,
      width: 7.5,
      draw() {
        c.fillStyle = "blue";
        c.beginPath();
        c.arc(
          this.x + Math.sin(this.angle),
          this.y - Math.cos(this.angle),
          this.width,
          0,
          2 * Math.PI
        );
        c.fill();
      },
      update() {
        this.x += Math.sin(this.angle) * this.dy;
        this.y += -Math.cos(this.angle) * this.dy;

        if (this.y > canvas.height) {
          this.out_of_bounds = true;
        } else if (this.y < 0) {
          this.out_of_bounds = true;
        } else if (this.x < 0) {
          this.out_of_bounds = true;
        } else if (this.x > canvas.width) {
          this.out_of_bounds = true;
        }
      },
    };
  }
}

class Asteroid {
  constructor() {
    this.asteroid = {
      x:
        Math.random() <= 0.5
          ? Math.random() * canvas.width - 1200
          : Math.random() * canvas.width - 200,
      y:
        Math.random() <= 0.5
          ? Math.random() * (canvas.height - 150)
          : Math.random() * (canvas.height - 500),
      width: 15,
      velocity: Math.random(),
      out_of_bounds: false,
      draw() {
        c.beginPath();
        c.fillStyle = "black";
        c.arc(this.x, this.y, this.width, 0, 2 * Math.PI);
        c.fill();
      },
      update() {
        // this.x += this.velocity * Math.cos(Math.random()) + 1;
        // this.y += this.velocity * Math.sin(Math.random()) + 1;

        if (this.y > canvas.height) {
          this.out_of_bounds = true;
        } else if (this.y < 0) {
          this.out_of_bounds = true;
        } else if (this.x < 0) {
          this.out_of_bounds = true;
        } else if (this.x > canvas.width) {
          this.out_of_bounds = true;
        }
      },
    };
  }
}

let bullets = [];
let asteroids = [];

window.addEventListener("keydown", (e) => {
  const key = e.key;
  if (key == "w") {
    ship.actions.forward = true;
  }
  if (key == "a") {
    ship.actions.left = true;
  } else if (key == "d") {
    ship.actions.right = true;
  }
});
window.addEventListener("keyup", (e) => {
  const key = e.key;
  if (key == "w") {
    ship.actions.forward = false;
  }
  if (key == "a") {
    ship.actions.left = false;
  } else if (key == "d") {
    ship.actions.right = false;
  }
  if (key == " " && !ship.actions.immune) {
    bullets.push(new Bullet());
  }
});
setInterval(() => {
  if (!ship.actions.immune) {
    asteroids.push(new Asteroid());
  }
}, 750);
function collision() {
  asteroids.forEach((a) => {
    bullets.forEach((b) => {
      const dx = b.bullet.x - a.asteroid.x;
      const dy = b.bullet.y - a.asteroid.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (b.bullet.width + a.asteroid.width >= distance) {
        a.asteroid.out_of_bounds = true;
        b.bullet.out_of_bounds = true;
        score += 20;
        scorediv.innerHTML = score;
      }
    });
  });
}
function animate() {
  if (ship.actions.lives > 0) {
    c.save();
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.restore();
    bullets.forEach((b) => {
      b.bullet.update();
      b.bullet.draw();
    });
    bullets = bullets.filter((b) => {
      return !b.bullet.out_of_bounds;
    });
    asteroids.forEach((a) => {
      a.asteroid.draw();
      a.asteroid.update();
    });
    asteroids = asteroids.filter((a) => {
      return !a.asteroid.out_of_bounds;
    });
    if (!ship.actions.immune) {
      ship.draw();
      ship.rotate();
      ship.update();
      ship.collision();
      collision();
    }
    console.log(ship.actions.lives);
    requestAnimationFrame(animate);
  } else {
    game_over();
  }
}

animate();

tryagain.addEventListener("click", {});
