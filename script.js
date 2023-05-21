const canvas = document.getElementById("canvas");
const c = canvas.getContext("2d");
const scorediv = document.getElementById("score");
const gameoverdiv = document.getElementById("game-over");
const highscorediv = document.getElementById("high-score");
const tryagain = document.getElementById("try-again");
let lives = document.querySelectorAll(".life");
const livesdiv = document.getElementById("lives");
const finalscorediv = document.getElementById("final-score");
const start = document.getElementById("start");
const difficulty = document.getElementById("difficulty");
const h2 = document.querySelector("h2");
canvas.height = window.innerHeight / 1.5;
canvas.width = window.innerWidth / 2;
const omkrets = 2 * canvas.width + 2 * canvas.height; // omkretsen av canvasen
let score = 0;
let raf = true; // om requestanimationframe ska köras
let spawnAmount = 4; // hur många asteroider som spawnas
let spawning = true;
let bullets = [];
let asteroids = [];
let ufos = [];
let toggle = false;

if (localStorage.getItem("highscore") === null) {
  // kolla om highscore finns i localstorage annars skapa den
  localStorage.setItem("highscore", 0);
}

window.focus();
const asteroid1 = new Image(); // skapa nya bilder
asteroid1.src = "bilder/Asteroid_01.png";
const asteroid2 = new Image();
asteroid2.src = "bilder/Asteroid_02.png";
const asteroid3 = new Image();
asteroid3.src = "bilder/Asteroid_03.png";
const asteroid4 = new Image();
asteroid4.src = "bilder/Asteroid_04.png";
const ufo = new Image();
ufo.src = "bilder/ufo.png";
const bilder = [asteroid1, asteroid2, asteroid3, asteroid4];

const ship = {
  position: {
    x: canvas.width / 2,
    y: canvas.height / 2,
    angle: 0,
  },
  velocity: {
    speed: 0,
    fallof: 0.985,
  },
  actions: {
    forward: false,
    left: false,
    right: false,
    lives: 3,
    immune: false,
  },
  draw() {
    c.font = "50px Work Sans, sans serif";
    c.fillStyle = "white";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.save(); // spara translationen på canvasen och allt sånt och sedan rotera den och återställ
    c.translate(this.position.x, this.position.y);
    c.rotate(ship.position.angle);
    c.translate(-this.position.x, -this.position.y);
    c.fillText("A", this.position.x, this.position.y);
    c.restore();
  },
  update() {
    if (this.actions.forward) {
      this.velocity.speed = 5;
    } else {
      this.velocity.speed *= this.velocity.fallof;
    }
    this.position.x += Math.sin(this.position.angle) * this.velocity.speed; // matte
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
      if (
        this.position.x < a.asteroid.x + a.asteroid.width &&
        this.position.x + 10 > a.asteroid.x &&
        this.position.y < a.asteroid.y + a.asteroid.height &&
        this.position.y + 10 > a.asteroid.y
      ) {
        this.actions.lives -= 1;
        asteroidSplit(a.asteroid, false);
        a.asteroid.out_of_bounds = true;
        reset();
        this.actions.immune = true;
        lives[this.actions.lives].style.opacity = 0.5;
        scorediv.innerHTML = score;
        setTimeout(() => {
          this.actions.immune = false;
        }, 2000);
      }
    });
    ufos.forEach((u) => {
      if (
        u.ufo.x < ship.position.x + 10 &&
        u.ufo.x + u.ufo.width > ship.position.x &&
        u.ufo.y < ship.position.y + 10 &&
        u.ufo.y + u.ufo.height > ship.position.y
      ) {
        this.actions.lives -= 1;
        reset();
        this.actions.immune = true;
        lives[this.actions.lives].style.opacity = 0.5;
        if (u.ufo.shitty) {
          score += 200;
        } else if (!u.ufo.shity) {
          score += 1000;
        }
        scorediv.innerHTML = score;
        setTimeout(() => {
          this.actions.immune = false;
        }, 2000);
      }
    });
    bullets.forEach((b) => {
      if (
        this.position.x < b.bullet.x + b.bullet.radius && // lägg till 15 som en ungefärlig höjd och bredd på ship objeketet eftersom att det går inte att översätta font size pixlarna till canvas koordinater.
        this.position.x + 15 > b.bullet.x &&
        this.position.y < b.bullet.y + b.bullet.radius &&
        this.position.y + 15 > b.bullet.y &&
        b.bullet.enemy
      ) {
        b.bullet.out_of_bounds = true;
        this.actions.lives -= 1;
        reset();
        this.actions.immune = true;
        lives[this.actions.lives].style.opacity = 0.5;
        scorediv.innerHTML = score;
        setTimeout(() => {
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

class Bullet {
  constructor() {
    this.bullet = {
      x: ship.position.x,
      y: ship.position.y,
      dy: 8,
      angle: ship.position.angle,
      out_of_bounds: false,
      radius: 7.5,
      enemy: false,
      draw() {
        if (this.enemy) {
          c.fillStyle = "orange";
        } else {
          c.fillStyle = "blue";
        }
        c.beginPath();
        c.arc(
          this.x + Math.sin(this.angle),
          this.y - Math.cos(this.angle),
          this.radius,
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
      x: 0,
      y: 0,
      img: Math.floor(Math.random() * bilder.length), // slumpmässig bild från asteroidbilderna
      width: asteroid1.width,
      height: asteroid1.height,
      velocity: 1,
      angle: 0,
      out_of_bounds: false,
      spawned: false,
      position: Math.random() * omkrets, // slumpmässig position på canvasen
      tier: 3,
      draw() {
        c.drawImage(bilder[this.img], this.x, this.y, this.width, this.height);
      },
      update() {
        this.x += Math.cos(this.angle) * this.velocity;
        this.y += Math.sin(this.angle) * this.velocity;

        if (this.y > canvas.height) {
          this.y = 0;
        } else if (this.y < 0) {
          this.y = canvas.height;
        } else if (this.x < 0) {
          this.x = canvas.width;
        } else if (this.x > canvas.width) {
          this.x = 0;
        }
      },
    };
  }
}

class Ufo {
  constructor() {
    this.ufo = {
      x: Math.random() <= 0.5 ? canvas.width : 0,
      y: Math.random() * canvas.height,
      img: ufo,
      width: ufo.width,
      height: ufo.height,
      velocity: 1.25,
      alive: true,
      dx: 0,
      dy: 0,
      cooldown: true,
      random: Math.random(),
      spawned: false,
      shitty: Math.random() > 0.25 ? true : false,
      draw() {
        c.drawImage(ufo, this.x, this.y, this.width, this.height);
      },
      update() {
        if (!this.spawned) {
          if (this.x == 0) {
            this.dx = 1;
          } else if (this.x == canvas.width) {
            this.dx = -1;
          }
          this.spawned = true;
          if (!this.shitty) {
            this.width = this.width / 2;
            this.height = this.height / 2;
          }
        }

        this.x += this.velocity * this.dx;
        this.y += this.velocity * this.dy;
        if (!this.cooldown) {
          setTimeout(() => {
            if (this.random >= 0.5) {
              this.dy = 1;
            } else {
              this.dy = -1;
            }
            this.cooldown = true;
          }, 1000);
        } else {
          setTimeout(() => {
            this.random = Math.random();
            this.cooldown = false;
            this.dy = 0;
          }, 1000);
        }

        if (this.y > canvas.height) {
          this.alive = false;
        } else if (this.y < 0) {
          this.alive = false;
        } else if (this.x < 0) {
          this.alive = false;
        } else if (this.x > canvas.width) {
          this.alive = false;
        }
      },
      collision() {
        asteroids.forEach((a) => {
          if (
            this.x < a.asteroid.x + a.asteroid.width &&
            this.x + this.width > a.asteroid.x &&
            this.y < a.asteroid.y + a.asteroid.height &&
            this.y + this.height > a.asteroid.y
          ) {
            a.asteroid.out_of_bounds = true;
            asteroidSplit(a.asteroid, true);
            this.alive = false;
          }
        });
      },
    };
  }
}

setInterval(() => {
  ufos.forEach((e) => {
    if (spawning) {
      if (e.ufo.shitty) {
        let bullet = new Bullet();
        bullet.bullet.x = e.ufo.x + 50;
        bullet.bullet.y = e.ufo.y + 50;
        bullet.bullet.angle = Math.random() * 2 * Math.PI; // slumpmässig vinkel som bullet objektet ska skjutas i
        bullet.bullet.enemy = true;
        bullets.push(bullet);
      } else if (!e.ufo.shitty) {
        let bullet = new Bullet();
        bullet.bullet.x = e.ufo.x + 50;
        bullet.bullet.y = e.ufo.y + 50;
        dx = e.ufo.x - ship.position.x;
        dy = e.ufo.y - ship.position.y;
        bullet.bullet.angle = -Math.atan2(dx, dy); // ungefärlig vinkel som bullet objektet ska skjutas i för att träffa ship objektet
        bullet.bullet.enemy = true;
        bullets.push(bullet);
      }
    }
  });
}, 1000);

function ufoSpawner() {
  setInterval(() => {
    if (spawning) {
      ufos.push(new Ufo());
    }
  }, 15000);
}

function asteroidInitiator() {
  asteroids.forEach((e) => {
    if (!e.asteroid.spawned) {
      // kolla var på omkretsen asteroiden är och placera den sedan på rätt sida av canvasen
      if (e.asteroid.position < canvas.width) {
        // upp
        e.asteroid.angle = (Math.PI / 2) * Math.random();
        e.asteroid.x = canvas.width * Math.random();
        e.asteroid.y = 0;
      } else if (
        // höger
        e.asteroid.position < canvas.width + canvas.height &&
        e.asteroid.position > canvas.width
      ) {
        e.asteroid.angle = -Math.random() * Math.PI - Math.PI / 2;
        e.asteroid.x = canvas.width;
        e.asteroid.y = canvas.height * Math.random();
      } else if (
        // ner
        e.asteroid.position < 2 * canvas.width + canvas.height &&
        e.asteroid.position > canvas.width + canvas.height
      ) {
        e.asteroid.angle = -Math.PI * Math.random();
        e.asteroid.x = canvas.width * Math.random();
        e.asteroid.y = canvas.height;
      } else if (
        // vänster
        e.asteroid.position < omkrets &&
        e.asteroid.position > omkrets - canvas.height
      ) {
        e.asteroid.angle = Math.random() * Math.PI - Math.PI / 2;
        e.asteroid.x = 0;
        e.asteroid.y = canvas.height * Math.random();
      }
    }
    e.asteroid.spawned = true;
  });
}

function asteroidSpawner() {
  if (spawning) {
    for (let i = 0; i < spawnAmount; i++) {
      asteroids.push(new Asteroid());
    }
    asteroidInitiator();
    if (score <= 40000) {
      spawnAmount += 1;
    }
  }
}

function asteroidSplit(asteroid, enemy) {
  const angle = Math.random() * Math.PI * 2;

  const new1 = new Asteroid();
  new1.asteroid.x = asteroid.x;
  new1.asteroid.y = asteroid.y;
  new1.asteroid.width = asteroid.width / 2;
  new1.asteroid.height = asteroid.height / 2;
  new1.asteroid.velocity = asteroid.velocity * 1.25;
  new1.asteroid.spawned = true;
  new1.asteroid.angle = angle;
  new1.asteroid.tier = asteroid.tier - 1;

  const new2 = new Asteroid();
  new2.asteroid.x = asteroid.x;
  new2.asteroid.y = asteroid.y;
  new2.asteroid.width = asteroid.width / 2;
  new2.asteroid.height = asteroid.height / 2;
  new2.asteroid.velocity = asteroid.velocity * 1.25;
  new2.asteroid.spawned = true;
  new2.asteroid.angle = -angle;
  new2.asteroid.tier = asteroid.tier - 1;
  asteroids.push(new1, new2);

  if (!enemy) {
    if (asteroid.tier == 3) {
      score += 20;
    } else if (asteroid.tier == 2) {
      score += 50;
    } else if (asteroid.tier == 1) {
      score += 100;
    }
    scorediv.innerHTML = score;
  }
}

window.addEventListener("keydown", (e) => {
  const key = e.key;
  if (key == "w" || key == "ArrowUp") {
    ship.actions.forward = true;
  }
  if (key == "a" || key == "ArrowLeft") {
    ship.actions.left = true;
  } else if (key == "d" || key == "ArrowRight") {
    ship.actions.right = true;
  }
});

window.addEventListener("keyup", (e) => {
  const key = e.key;
  if (key == "w" || key == "ArrowUp" || key == "W") {
    ship.actions.forward = false;
  }
  if (key == "a" || key == "ArrowLeft") {
    ship.actions.left = false;
  } else if (key == "d" || key == "ArrowRight") {
    ship.actions.right = false;
  }
  if (key == " " && !ship.actions.immune) {
    bullets.push(new Bullet());
    ship.position.x += -Math.sin(ship.position.angle) * 2;
    ship.position.y += Math.cos(ship.position.angle) * 2;
  }
  if (key == "s" || key == "ArrowDown") {
    ship.position.x = Math.random() * canvas.width;
    ship.position.y = Math.random() * canvas.height;
  }
});

function collision() {
  bullets.forEach((b) => {
    asteroids.forEach((a) => {
      if (
        a.asteroid.x < b.bullet.x + b.bullet.radius &&
        a.asteroid.x + a.asteroid.width > b.bullet.x &&
        a.asteroid.y < b.bullet.y + b.bullet.radius &&
        a.asteroid.height + a.asteroid.y > b.bullet.y
      ) {
        a.asteroid.out_of_bounds = true;
        b.bullet.out_of_bounds = true;
        if (b.bullet.enemy) {
          asteroidSplit(a.asteroid, true);
        } else if (!b.bullet.enemy) {
          asteroidSplit(a.asteroid, false);
        }
      }
    });
    ufos.forEach((u) => {
      if (
        u.ufo.x < b.bullet.x + b.bullet.radius &&
        u.ufo.x + u.ufo.width > b.bullet.x &&
        u.ufo.y < b.bullet.y + b.bullet.radius &&
        u.ufo.height + u.ufo.y > b.bullet.y &&
        !b.bullet.enemy
      ) {
        if (u.ufo.shitty) {
          score += 200;
        } else if (!u.ufo.shitty) {
          score += 1000;
        }
        b.bullet.out_of_bounds = true;
        u.ufo.alive = false;
        scorediv.innerHTML = score;
      }
    });
  });
}

function reset() {
  ship.position.x = canvas.width / 2;
  ship.position.y = canvas.height / 2;
  ship.position.angle = 0;
  ship.velocity.speed = 0;
  bullets = [];
  ufos = [];
}

function game_over() {
  reset();
  c.clearRect(0, 0, canvas.width, canvas.height);
  asteroids = [];
  ufos = [];
  if (score > localStorage.getItem("highscore")) {
    // kolla om score är högre än det som är lagrad i localstorage
    localStorage.setItem("highscore", score);
  }
  gameoverdiv.style.display = "flex";
  highscorediv.innerHTML = `High-Score: ${localStorage.getItem("highscore")}`;
  highscorediv.style.display = "flex";
  finalscorediv.style.display = "flex";
  finalscorediv.innerHTML = `score: ${score}`;
  scorediv.style.display = "none";
  tryagain.style.display = "flex";
  livesdiv.style.display = "none";
  spawning = false;
}

function try_again() {
  gameoverdiv.style.display = "none";
  highscorediv.style.display = "none";
  finalscorediv.style.display = "none";
  scorediv.style.display = "flex";
  tryagain.style.display = "none";
  livesdiv.style.display = "flex";
}

asteroidSpawner();
ufoSpawner();
function animate() {
  if (raf) {
    c.save();
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.restore();
    bullets.forEach((b) => {
      b.bullet.update();
      b.bullet.draw();
    });
    bullets = bullets.filter((b) => {
      // ta bort alla bullet objekt som har out of bounds om true ur bullet arrayen
      return !b.bullet.out_of_bounds;
    });
    asteroids.forEach((a) => {
      a.asteroid.draw();
      a.asteroid.update();
    });
    asteroids = asteroids.filter((a) => {
      return !a.asteroid.out_of_bounds && a.asteroid.tier > 0;
    });
    ufos = ufos.filter((u) => {
      return u.ufo.alive;
    });
    ufos.forEach((u) => {
      u.ufo.draw();
      u.ufo.update();
      u.ufo.collision();
    });
    if (!ship.actions.immune) {
      ship.draw();
      ship.rotate();
      ship.update();
      ship.collision();
      collision();
    }
    if (asteroids == "") {
      asteroidSpawner();
    }
    if (ship.actions.lives > 0) {
      raf = requestAnimationFrame(animate);
    } else {
      raf = cancelAnimationFrame(raf);
      game_over();
    }
  }
}

tryagain.addEventListener("click", () => {
  raf = requestAnimationFrame(animate);
  try_again();
  if (toggle) {
    ship.actions.lives = 5;
  } else {
    ship.actions.lives = 3;
  }
  score = 0;
  scorediv.innerHTML = score;
  lives.forEach((e) => {
    e.style.opacity = 1;
  });
  spawnAmount = 4;
  spawning = true;
});

difficulty.addEventListener("click", () => {
  toggle = !toggle;
  if (toggle) {
    livesdiv.innerHTML = `
    <div class="life">❤</div>
    <div class="life">❤</div>
    <div class="life">❤</div>
    <div class="life">❤</div>
    <div class="life">❤</div>`;
    ship.actions.lives = 5;
    difficulty.innerHTML = "Easy";
  } else {
    livesdiv.innerHTML = `
    <div class="life">❤</div>
    <div class="life">❤</div>
    <div class="life">❤</div>`;
    ship.actions.lives = 3;
    difficulty.innerHTML = "Hard";
  }
  lives = document.querySelectorAll(".life");
});

start.addEventListener("click", () => {
  difficulty.style.display = "none";
  start.style.display = "none";
  scorediv.style.display = "flex";
  livesdiv.style.display = "flex";
  h2.style.display = "none";
  animate();
});

window.addEventListener("focus", () => {
  spawning = true;
});

window.addEventListener("blur", () => {
  spawning = false;
});
