Point = function(x, y) {
  this.x = x;
  this.y = y;
};

Point.prototype.draw = function(ctx) {
  ctx.beginPath();
  ctx.arc(this.x, this.y, 0.1, 0, 2 * Math.PI, false);
  ctx.fill();
};

Circle = function(c, r) {
  this.c = c;
  this.r = r;
};

Circle.prototype.draw = function(ctx) {
  ctx.beginPath();
  ctx.arc(this.c.x, this.c.y, this.r, 0, 2 * Math.PI, false);
  ctx.fill();
};

Line = function(p1, p2) {
  this.p1 = p1;
  this.p2 = p2;
};

Line.prototype.intersect = function(other) {
  var BAx, BAy;
  var CDx, CDy;
  var BDx, BDy;
  var det, det1, det2;

  var Ax = this.p1.x;
  var Bx = this.p2.x;
  var Cx = other.p1.x;
  var Dx = other.p2.x;
  BAx = Ax - Bx;
  CDx = Dx - Cx;

  if (BAx < 0) {
    if (CDx < 0) {
      if (Dx > Bx || Ax > Cx) { return false; }
    } else {
      if (Cx > Bx || Ax > Dx) { return false; }
    }
  } else {
    if (CDx < 0) {
      if (Dx > Ax || Bx > Cx) { return false; }
    } else {
      if (Bx > Dx || Cx > Ax) { return false; }
    }
  }

  var Ay = this.p1.y;
  var By = this.p2.y;
  var Cy = other.p1.y;
  var Dy = other.p2.y;
  BAy = Ay - By;
  CDy = Dy - Cy;

  if (BAy < 0) {
    if (CDy < 0) {
      if (Dy > By || Ay > Cy) { return false; }
    } else {
      if (Cy > By || Ay > Dy) { return false; }
    }
  } else {
    if (CDy < 0) {
      if (Dy > Ay || By > Cy) { return false; }
    } else {
      if (By > Dy || Cy > Ay) { return false; }
    }
  }

  BDx = Dx - Bx;
  BDy = Dy - By;

  det = BAx * CDy - CDx * BAy;
  det1 = BDx * CDy - CDx * BDy;

  if (det < 0) {
    if (det1 > 0 || det1 < det) { return false; }
  } else {
    if (det1 < 0 || det1 > det) { return false; }
  }

  det2 = BAx * BDy - BAy * BDx;
  if (det < 0) {
    if (det2 > 0 || det2 < det) { return false; }
  } else {
    if (det2 < 0 || det2 > det) { return false; }
  }
  if (det == 0)  {
    var s = 0;
    if (BDx < 0) {
      if (BAx < 0) { s += BAx; }
      if (CDx < 0) { s += CDx; }
      if (s > BDx) { return false; }
    } else {
      if (BAx > 0) { s += BAx; }
      if (CDx > 0) { s += CDx; }
      if (s < BDx) { return false; }
    }
  }
  return true;
}

Line.prototype.draw = function(ctx) {
  ctx.beginPath();
  ctx.moveTo(this.p1.x, this.p1.y);
  ctx.lineTo(this.p2.x, this.p2.y);
  ctx.stroke();
};

Polygon = function(points, closed) {
  if (points === undefined)
    this.points = [];
  else
    this.points = points;
  this.closed = (closed !== undefined) ? closed : true;
};

Polygon.prototype.intersect = function(other) {
  var l1 = new Line();
  var l2 = new Line();
  var i, ni, ci, j, nj, cj;

  if (this.closed) { ci = this.points.length; }
  else { ci = this.points.length - 1; }
  if (other.closed) { cj = other.points.length; }
  else { cj = other.points.length - 1; }

  for(i = 0; i < ci; i++) {
    ni = i + 1;
    if (ni == this.points.length) { ni = 0; }
    l1.p1 = this.points[i];
    l1.p2 = this.points[ni];

    for(j = 0; j < cj; j++) {
      nj = j + 1;
      if (nj == other.points.length) { nj = 0; }
      l2.p1 = other.points[j];
      l2.p2 = other.points[nj];
      if (l1.intersect(l2)) { return true; }
    }
  }
  return false;
}

Polygon.prototype.draw = function(ctx) {
  var i;
  if (this.points.length == 0) return;
  ctx.beginPath();
  ctx.moveTo(this.points[0].x, this.points[0].y);
  for(i = 1; i < this.points.length; i++) {
    ctx.lineTo(this.points[i].x, this.points[i].y);
  }
  if (this.closed) ctx.closePath();
  ctx.stroke();
};

Shape = function(components, color) {
  this.components = components;
  this.color = color;
};

Shape.prototype.draw = function(ctx) {
  var i;
  ctx.save();
  if (this.color !== undefined) {
    ctx.strokeStyle = this.color;
    ctx.fillStyle = this.color;
  }
  for(i = 0; i < this.components.length; i++) {
    this.components[i].draw(ctx);
  }
  ctx.restore();
};

Animation = function(shapes, repeat) {
  this.shapes = shapes;
  this.repeat = repeat;
  this.index = 0;
};

Animation.prototype.reset = function(newindex) {
  if (newindex === undefined)
    this.index = 0;
  else
    this.index = newindex;
};

Animation.prototype.hasFinished = function() {
  return (this.index >= this.shapes.length);
};

Animation.prototype.draw = function(ctx) {
  if (this.index < this.shapes.length) {
    if (this.index >= 0)
      this.shapes[this.index].draw(ctx);
    this.index++;
  }
  if (this.index >= this.shapes.length && this.repeat) {
    this.index = 0;
  }
};

