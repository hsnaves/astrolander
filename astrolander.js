Spaceship = function(props) {
  var x;
  for(x in props) {
    this[x] = props[x];
  }
  this.initialFuel = this.fuel;
};

Spaceship.prototype.shape =
  new Shape([new Polygon([new Point(-1, -1), new Point(-1, +1),
    new Point(+3, 0)])], "blue");

Spaceship.prototype.animation =
  new Animation([new Shape([new Polygon([new Point (-1, -0.8),
      new Point (-3, 0), new Point (-1, +0.8)], false)], "red"),
    new Shape([new Polygon([new Point (-1, -0.8),
      new Point (-3.2, 0),  new Point (-1, +0.8)], false)], "red")], true);

Spaceship.prototype.explosion =
  new Animation([new Shape([new Circle(new Point(0.0, 0.0), 0.1)], "red"),
                 new Shape([new Circle(new Point(0.0, 0.0), 0.2)], "white"),
                 new Shape([new Circle(new Point(0.0, 0.0), 0.3)], "red"),
                 new Shape([new Circle(new Point(0.0, 0.0), 0.4)], "white"),
                 new Shape([new Circle(new Point(0.0, 0.0), 0.5)], "red"),
                 new Shape([new Circle(new Point(0.0, 0.0), 0.6)], "white"),
                 new Shape([new Circle(new Point(0.0, 0.0), 0.7)], "red"),
                 new Shape([new Circle(new Point(0.0, 0.0), 1.2)], "white"),
                 new Shape([new Circle(new Point(0.0, 0.0), 1.7)], "red"),
                 new Shape([new Circle(new Point(0.0, 0.0), 2.1)], "white"),
                 new Shape([new Circle(new Point(0.0, 0.0), 2.5)], "red"),
                 new Shape([new Circle(new Point(0.0, 0.0), 3.1)], "white"), 
                 new Shape([new Circle(new Point(0.0, 0.0), 3.2)], "red"), 
                 new Shape([new Circle(new Point(0.0, 0.0), 3.3)], "white"), 
                 new Shape([new Circle(new Point(0.0, 0.0), 3.4)], "red"), 
                 new Shape([new Circle(new Point(0.0, 0.0), 3.5)], "white"),
                 new Shape([new Circle(new Point(0.0, 0.0), 3.6)], "red"),
                 new Shape([new Circle(new Point(0.0, 0.0), 3.7)], "white")], false);

Spaceship.prototype.accelerate = function() {
  if (this.fuel > 0) {
    var incx, incy;
    incx = this.power * Math.cos(this.angle);
    incy = this.power * Math.sin(this.angle);
    this.velx += incx;
    this.vely += incy;
    this.fuel--;
    this.accelerating = true;
  }
};

Spaceship.prototype.turnLeft = function() {
  this.angle += this.angleChange;
};

Spaceship.prototype.turnRight = function() {
  this.angle -= this.angleChange;
};

Spaceship.prototype.update = function() {
  this.vely += this.gravity;
  this.x += this.velx;
  this.y += this.vely;
};

Spaceship.prototype.draw = function(ctx, crashed) {
  ctx.save();
  ctx.translate(this.x, this.y);
  ctx.rotate(this.angle);
  this.shape.draw(ctx);
  if (!this.accelerating)
    this.animation.reset();
  else
    this.animation.draw(ctx);
  if (crashed) {
    this.explosion.draw(ctx);
  }

  ctx.restore();
  this.accelerating = false;
};



World = function(numLives, props) {
  this.numLives = numLives;
  this.score = 0;
  this.frame = 0;
  this.replay = [];
  this.load(props);
};

World.prototype.lineWidth = 0.03;
World.prototype.zoomFactor1 = 14.0;
World.prototype.zoomFactor2 = 10.0;
World.prototype.maxAngle = 0.3;
World.prototype.angleBonusFactor = 100.0;
World.prototype.maxVelx = 0.4;
World.prototype.maxVely = 0.4;
World.prototype.velBonusFactor = 1000.0;
World.prototype.fuelBonusFactor = 50.0;
World.prototype.timeBonusFactor = 1.0;
World.prototype.maxFrame = 3000;


World.prototype.load = function(props) {
  var x;

  for(x in props)
    this[x] = props[x];
  this.spaceship = new Spaceship(props.spaceshipProps);
  this.frame = 0;
  this.replay = [];
  this.crashed = false;
  this.stopped = false;
  this.replayMode = false;
  this.currentAnimation = undefined;
};

World.prototype.draw = function(ctx) {
  ctx.save();
  this.drawStatus(ctx);
  this.calculateZoom(ctx);
  this.shape.draw(ctx);
  this.finish.draw(ctx);
  this.spaceship.draw(ctx, this.crashed);
  if (this.currentAnimation !== undefined)
    this.currentAnimation.draw(ctx);
  ctx.restore();
};

World.prototype.drawStatus = function(ctx) {
  this.drawFuelBar(ctx);
  this.drawLives(ctx);
  this.drawScore(ctx);
  this.clipRectangle(ctx);
};

World.prototype.drawFuelBar = function(ctx) {
  var x = -9.0, y = 9.2;
  var width = 7.0, height = 0.5;
  ctx.fillStyle = "yellow";
  ctx.strokeStyle = "yellow";
  ctx.lineWidth = this.lineWidth;
  ctx.strokeRect(x, y, width, height);
  var fuel = width * this.spaceship.fuel / this.spaceship.initialFuel;
  ctx.fillRect(x, y, fuel, height);
};

World.prototype.drawScore = function(ctx) {
  var left = 400.0, top = 15.0;
  var score = "" + Math.floor(this.score);
  ctx.save();
  ctx.setTransform(1.0, 0.0, 0.0, 1.0, 0.0, 0.0);
  ctx.fillStyle = "white";
  while(score.length <= 8)
    score = "0" + score;
  ctx.fillText(score, left, top);
  ctx.restore();
};

World.prototype.drawLives = function(ctx) {
  var x = 5.0, y = 9.4, factor = 0.15, dx = 7.0;
  var lives;
  var shape = this.spaceship.shape;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(factor, factor);
  ctx.lineWidth = this.lineWidth / factor;
  for(lives = 0; lives < this.numLives; lives++) {
    shape.draw(ctx);
    ctx.translate(dx, 0.0);
  }
  ctx.restore();
};

World.prototype.clipRectangle = function(ctx) {
  ctx.strokeStyle = "white";
  var left = -9.0, bottom = -9.0;
  var right = 9.0, top = 9.0;
  ctx.strokeRect(left, bottom, right-left, top-bottom);
  ctx.beginPath();
  ctx.moveTo(left, bottom);
  ctx.lineTo(right, bottom);
  ctx.lineTo(right, top);
  ctx.lineTo(left, top);
  ctx.closePath();
  ctx.clip();
};

World.prototype.calculateZoom = function(ctx) {
  var lx = Math.abs(this.spaceship.x - this.centerx);
  var ly = Math.abs(this.spaceship.y - this.centery);
  var l = (lx > ly) ? lx : ly;
  var factor = this.zoomFactor1/(this.zoomFactor2 + l);
  ctx.lineWidth = this.lineWidth / factor;
  ctx.scale(factor, factor);
  ctx.translate(-(this.centerx + this.spaceship.x) / 2,
                -(this.centery + this.spaceship.y) / 2);
};

World.prototype.displayMessage = function(msg) {
  this.currentAnimation = {
    index: 0,
    draw: function(ctx) {
      var left = 350.0, top = 280.0;
      var width = 80.0, height = 50.0;
      ctx.save();
      ctx.setTransform(1.0, 0.0, 0.0, 1.0, 0.0, 0.0);
      ctx.lineWidth = 2.0;
      ctx.fillStyle = "black";
      ctx.fillRect(left, top, width, height);
      ctx.strokeStyle = "green";
      ctx.strokeRect(left, top, width, height);
      if (this.index & 2)
        ctx.fillStyle = "white";
      else
        ctx.fillStyle = "red";
      ctx.fillText(msg, left + 10.0, top + 30.0);
      ctx.restore();
      this.index++;
    }
  };
};

World.prototype.displayBonusMessage = function(angleBonus, velBonus, fuelBonus, timeBonus) {
  angleBonus = Math.floor(angleBonus);
  velBonus = Math.floor(velBonus);
  fuelBonus = Math.floor(fuelBonus);
  timeBonus = Math.floor(timeBonus);
  var totalBonus = angleBonus + velBonus + fuelBonus + timeBonus;
  this.currentAnimation = {
    index: 0,
    draw: function(ctx) {
      var left = 320.0, top = 250.0;
      var width = 160.0, height = 120.0;
      var snd;
      ctx.save();
      ctx.setTransform(1.0, 0.0, 0.0, 1.0, 0.0, 0.0);
      ctx.lineWidth = 2.0;
      ctx.fillStyle = "black";
      ctx.fillRect(left, top, width, height);
      ctx.strokeStyle = "green";
      ctx.strokeRect(left, top, width, height);
      ctx.fillStyle = "white";

      if ((this.index % 10) == 5 && this.index > 0 && this.index < 40) {
        snd = new Audio("sounds/beep.mp3");
        snd.play();
      }

      if (this.index >= 10) {
        ctx.fillText("Angle Bonus           " + angleBonus, left + 17.0, top + 30.0);
      }
      if (this.index >= 20) {
        ctx.fillText("Velocity Bonus       " + velBonus,   left + 17.0, top + 40.0);
      }
      if (this.index >= 30) {
        ctx.fillText("Fuel Bonus              " + fuelBonus,  left + 17.0, top + 50.0);
      }
      if (this.index >= 40) {
        ctx.fillText("Time Bonus            " + timeBonus,  left + 17.0, top + 60.0);
      }
      if (this.index >= 50) {
        if (this.index == 50) {
          snd = new Audio("sounds/win.mp3");
          snd.play();
        }
        ctx.fillText("Total Bonus             " + totalBonus,  left + 17.0, top + 80.0);
        if (this.index & 2) ctx.fillStyle = "red";
        ctx.fillText("OK!",  left + 70.0, top + 100.0);        
      }
      ctx.restore();
      this.index++;
    }
  };
};


World.prototype.update = function(up, left, right) {
  var action = 0;
  var snd;

  if (this.replayMode) {
    if (this.frame >= this.replay.length) { return; }
    action = this.replay[this.frame++];
    up = left = right = false;
    if (action & 1) up = true;
    if (action & 2) left = true;
    if (action & 4) right = true;
    this.updateSpaceship(up, left, right);
  } else {
    if (this.stopped) { return; }
    if (up) action += 1;
    if (left) action += 2;
    if (right) action += 4;
    this.replay[this.frame++] = action;
    this.updateSpaceship(up, left, right);
    this.checkIfCrashed();
    if (this.crashed) {
      this.numLives--;
      snd = new Audio("sounds/crash.mp3");
      snd.play();
      this.spaceship.explosion.reset(0);
      this.displayMessage("   Crashed !");
    }
  }
};

World.prototype.updateSpaceship = function(up, left, right) {
  if (up)    { this.spaceship.accelerate(); }
  if (left)  { this.spaceship.turnLeft();   }
  if (right) { this.spaceship.turnRight();  }
  this.spaceship.update();
};

World.prototype.checkIfCrashed = function() {
  var c = Math.cos(this.spaceship.angle);
  var s = Math.sin(this.spaceship.angle);
  var i, points, npoints = [];
  points = this.spaceship.shape.components[0].points;
  for(i = 0; i < points.length; i++) {
    npoints[i] = new Point(points[i].x * c - points[i].y * s + this.spaceship.x,
                           points[i].x * s + points[i].y * c + this.spaceship.y);
  }
  var poly = new Polygon(npoints, this.spaceship.shape.components[0].closed);
  for(i = 0; i < this.shape.components.length; i++) {
    if (poly.intersect(this.shape.components[i])) {
      this.crashed = true;
      this.stopped = true;
      return;
    }
  }
  for(i = 0; i < this.finish.components.length; i++) {
    if (poly.intersect(this.finish.components[i])) {
      this.stopped = true;
      this.checkBonus();
      return;
    }
  }
};

World.prototype.checkBonus = function() {
  var velx = Math.abs(this.spaceship.velx);
  var vely = this.spaceship.vely;
  var angle = this.spaceship.angle - Math.floor(this.spaceship.angle / (2 * Math.PI)) * 2 * Math.PI;
  angle = Math.abs(angle - Math.PI / 2);
  if (angle < this.maxAngle && velx < this.maxVelx && vely < 0 && vely >= -this.maxVely) {
    var angleBonus = (this.maxAngle - angle) * this.angleBonusFactor;
    var velBonus = (this.maxVelx+this.maxVely-velx-vely) * this.velBonusFactor;
    var fuelBonus = this.spaceship.fuel * this.fuelBonusFactor;
    var timeBonus = 0;
    if (this.frame < this.maxFrame)
      timeBonus = (this.maxFrame - this.frame) * this.timeBonusFactor;
    this.score += angleBonus + velBonus + fuelBonus + timeBonus;
    this.displayBonusMessage(angleBonus, velBonus, fuelBonus, timeBonus);
    this.viewReplay();
  } else {
    this.crashed = true;
  }
};

World.prototype.viewReplay = function() {
  this.replayMode = true;
  this.frame = 0;
  this.spaceship = new Spaceship(this.spaceshipProps);
};

Game = function(canvasId, levels) {
  this.levels = levels;
  this.currentLevel = 0;
  this.world = new World(3, this.levels[this.currentLevel]);
  this.left = this.right = this.up = this.enter = false;

  this.canvas = document.getElementById(canvasId);
  this.ctx = this.canvas.getContext("2d");
  this.ctx.scale(this.canvas.width / 20, -this.canvas.height / 20);
  this.ctx.strokeStyle = "green";
  this.ctx.translate(10, -10);
};

Game.prototype.start = function() {
  var mythis = this;
  document.onkeydown = function(event) { mythis.keyDown(event); };
  document.onkeyup = function(event) { mythis.keyUp(event); };
  setInterval(function() { mythis.step(); }, 50);
};

Game.prototype.step = function() {
  if (this.enter) {
    var gameover = false;
    if (this.gameover) {
      this.gameover = false;
      this.currentLevel = 0;
      this.world.numLives = 3;
      this.world.score = 0;
      this.world.load(this.levels[this.currentLevel]);
    } else {
      if (this.world.stopped) {
        if (this.world.numLives > 0) {
          if (!this.world.crashed) this.currentLevel++;
          if (this.currentLevel < this.levels.length)
            this.world.load(this.levels[this.currentLevel]);
          else {
            gameover = true;
          }
        } else {
          gameover = true;
        }
        if (gameover) {
          this.enter = false;
          this.world.displayMessage("Game Over");
          this.gameover = true;
        }
      }
    }
  }
  this.world.update(this.up, this.left, this.right);
  this.ctx.fillStyle = "black";
  this.ctx.fillRect(-10, -10, 20, 20);
  this.ctx.clearRect(-10, -10, 20, 20);
  this.world.draw(this.ctx);
};

Game.prototype.keyUp = function(event) {
  if (event.keyCode == 37) {
    this.left = false; event.preventDefault();
  }
  if (event.keyCode == 39) {
    this.right = false; event.preventDefault();
  }
  if (event.keyCode == 38) {
    this.up = false; event.preventDefault();
  }
  if (event.keyCode == 13) {
    this.enter = false; event.preventDefault();
  }
};

Game.prototype.keyDown = function(event) {
  if (event.keyCode == 37) {
    this.left = true; event.preventDefault();
  }
  if (event.keyCode == 39) {
    this.right = true; event.preventDefault();
  }
  if (event.keyCode == 38) {
    this.up = true; event.preventDefault();
  }
  if (event.keyCode == 13) {
    this.enter = true; event.preventDefault();
  }
};


