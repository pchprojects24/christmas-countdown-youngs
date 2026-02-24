// ===== BASE ENTITY =====
class Entity {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.dead = false;
    this.facingDir = 1;
  }

  get left()   { return this.x; }
  get right()  { return this.x + this.w; }
  get top()    { return this.y; }
  get bottom() { return this.y + this.h; }
  get centerX(){ return this.x + this.w / 2; }
  get centerY(){ return this.y + this.h / 2; }

  overlaps(other) {
    return this.left < other.right  &&
           this.right > other.left  &&
           this.top < other.bottom  &&
           this.bottom > other.top;
  }

  applyGravity() {
    this.vy += GRAVITY;
    if (this.vy > TERMINAL_VEL) this.vy = TERMINAL_VEL;
  }

  moveAndCollide(level) {
    this.onGround = false;

    // Horizontal
    this.x += this.vx;
    const hCols = level.getTileCollisions(this);
    for (const col of hCols) {
      if (this.vx > 0) { this.x = col.tileX * TILE - this.w; this.vx = 0; }
      else if (this.vx < 0) { this.x = (col.tileX + 1) * TILE; this.vx = 0; }
    }

    // Vertical
    this.y += this.vy;
    const vCols = level.getTileCollisions(this);
    for (const col of vCols) {
      if (this.vy > 0) {
        this.y = col.tileY * TILE - this.h;
        this.vy = 0;
        this.onGround = true;
      } else if (this.vy < 0) {
        this.y = (col.tileY + 1) * TILE;
        this.vy = 0;
      }
    }
  }
}

// ===== CAT TREAT / TOY (replaces Vegetable) =====
class Vegetable extends Entity {
  constructor(x, y, type = 'yarn') {
    super(x, y, 20, 20);
    this.type = type;
    this.inGround = true;
    this.pullProgress = 0;
    this.carried = false;
    this.thrown = false;
    this.thrownBy = null;
    this.bounces = 0;
    this.maxBounces = 2;
    this.age = 0;
    this.scoreValue = SCORE.VEGGIE;
    this.colors = this._pickColors(type);
  }

  _pickColors(type) {
    const map = {
      yarn:     { body: '#e04060', top: '#c03050', spot: '#ff6080' },  // red yarn ball
      mouse:    { body: '#888', top: '#666', spot: '#aaa' },            // toy mouse
      feather:  { body: '#4080c0', top: '#3060a0', spot: '#60a0e0' },  // feather wand
      catnip:   { body: '#4a9e2a', top: '#2a6a00', spot: '#6abe3a' },  // catnip pouch
      fish:     { body: '#f0a860', top: '#e09040', spot: '#ffc080' }   // fish toy
    };
    return map[type] || map.yarn;
  }

  startPull() { this.pullProgress = 0; }

  updatePull(dt) {
    this.pullProgress += 0.04;
    return this.pullProgress >= 1;
  }

  update(level) {
    this.age++;
    if (this.inGround || this.carried) return;

    this.applyGravity();
    this.x += this.vx;
    this.y += this.vy;

    // Bounce off ground tiles
    const vCols = level.getTileCollisions(this);
    for (const col of vCols) {
      if (this.vy > 0 && this.bounces < this.maxBounces) {
        this.y = col.tileY * TILE - this.h;
        this.vy = -this.vy * 0.45;
        this.vx *= 0.7;
        this.bounces++;
        if (Math.abs(this.vy) < 1) this.vy = 0;
      } else if (this.vy > 0) {
        this.y = col.tileY * TILE - this.h;
        this.vy = 0;
        this.vx = 0;
        this.thrown = false;
      }
    }

    // Wall bounce
    const hCols = level.getTileCollisions(this);
    for (const col of hCols) {
      if (this.vx > 0) { this.x = col.tileX * TILE - this.w; this.vx = -this.vx * 0.6; }
      else { this.x = (col.tileX + 1) * TILE; this.vx = -this.vx * 0.6; }
    }

    // Fall off bottom
    if (this.y > level.height * TILE + 200) this.dead = true;
  }

  draw(ctx, camX) {
    if (this.dead) return;
    const sx = this.x - camX;
    const sy = this.y;
    const c = this.colors;

    if (this.inGround) {
      // Show item peeking out of treat bowl
      const pullOff = this.pullProgress * this.h * 0.6;
      ctx.fillStyle = c.body;
      ctx.beginPath();
      ctx.arc(sx + this.w/2, sy - 2 + pullOff, 6, 0, Math.PI*2);
      ctx.fill();
      // Sparkle hint
      ctx.fillStyle = c.spot;
      ctx.beginPath();
      ctx.arc(sx + this.w/2 + 2, sy - 4 + pullOff, 2, 0, Math.PI*2);
      ctx.fill();
      return;
    }

    // Draw based on type
    if (this.type === 'yarn') {
      // Yarn ball
      ctx.fillStyle = c.body;
      ctx.beginPath();
      ctx.arc(sx + this.w/2, sy + this.h/2, this.w/2, 0, Math.PI*2);
      ctx.fill();
      // Yarn lines
      ctx.strokeStyle = c.spot;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(sx + this.w/2, sy + this.h/2, this.w/3, 0.5, 3);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(sx + this.w/2 + 2, sy + this.h/2 - 2, this.w/4, 1, 4);
      ctx.stroke();
    } else if (this.type === 'mouse') {
      // Toy mouse
      ctx.fillStyle = c.body;
      ctx.beginPath();
      ctx.ellipse(sx + this.w/2, sy + this.h/2, this.w/2, this.h/3, 0, 0, Math.PI*2);
      ctx.fill();
      // Ears
      ctx.fillStyle = c.spot;
      ctx.beginPath();
      ctx.arc(sx + 5, sy + 4, 3, 0, Math.PI*2);
      ctx.arc(sx + this.w - 5, sy + 4, 3, 0, Math.PI*2);
      ctx.fill();
      // Tail
      ctx.strokeStyle = c.top;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sx + this.w, sy + this.h/2);
      ctx.quadraticCurveTo(sx + this.w + 6, sy + 2, sx + this.w + 4, sy);
      ctx.stroke();
      // Eyes
      ctx.fillStyle = '#000';
      ctx.fillRect(sx + 6, sy + 8, 2, 2);
    } else if (this.type === 'feather') {
      // Feather toy
      ctx.fillStyle = c.body;
      ctx.beginPath();
      ctx.ellipse(sx + this.w/2, sy + this.h/2, this.w/3, this.h/2, 0.3, 0, Math.PI*2);
      ctx.fill();
      // Feather barbs
      ctx.fillStyle = c.spot;
      ctx.fillRect(sx + 3, sy + 2, 2, this.h - 4);
      ctx.fillRect(sx + 8, sy + 4, 2, this.h - 6);
      // Shaft
      ctx.strokeStyle = c.top;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sx + this.w/2, sy);
      ctx.lineTo(sx + this.w/2, sy + this.h);
      ctx.stroke();
    } else {
      // Default: round treat/toy
      ctx.fillStyle = c.body;
      ctx.beginPath();
      ctx.ellipse(sx + this.w/2, sy + this.h/2, this.w/2, this.h/2, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = c.spot;
      ctx.beginPath();
      ctx.arc(sx + this.w*0.3, sy + this.h*0.35, 3, 0, Math.PI*2);
      ctx.fill();
      // Leaf/top
      ctx.fillStyle = c.top;
      ctx.fillRect(sx + 6, sy - 4, 4, 6);
      ctx.fillRect(sx + 10, sy - 6, 4, 6);
    }
  }
}

// ===== TREAT TOKEN (replaces Coin - now fish-shaped treats) =====
class Coin extends Entity {
  constructor(x, y) {
    super(x, y, TILE, TILE);
    this.collected = false;
    this.animFrame = 0;
  }

  update() {
    this.animFrame++;
  }

  draw(ctx, camX) {
    if (this.collected) return;
    const sx = this.x - camX;
    const pulse = Math.sin(this.animFrame * 0.12) * 2;
    const cy = this.y + this.h/2 + pulse;

    // Fish-shaped treat
    ctx.fillStyle = '#f0a860';
    ctx.beginPath();
    ctx.ellipse(sx + this.w/2, cy, this.w*0.25, this.w*0.16, 0, 0, Math.PI*2);
    ctx.fill();
    // Fish tail
    ctx.beginPath();
    ctx.moveTo(sx + this.w/2 + this.w*0.22, cy);
    ctx.lineTo(sx + this.w/2 + this.w*0.38, cy - 4);
    ctx.lineTo(sx + this.w/2 + this.w*0.38, cy + 4);
    ctx.closePath();
    ctx.fill();
    // Fish eye
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(sx + this.w/2 - 3, cy - 1, 1.5, 0, Math.PI*2);
    ctx.fill();
    // Shine
    ctx.fillStyle = 'rgba(255,255,200,0.7)';
    ctx.beginPath();
    ctx.arc(sx + this.w/2 - 2, cy - 3, 2, 0, Math.PI*2);
    ctx.fill();
  }
}

// ===== SCORE POPUP =====
class ScorePopup {
  constructor(x, y, value) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.life = 60;
    this.maxLife = 60;
  }

  update() { this.life--; this.y -= 0.5; }
  get dead() { return this.life <= 0; }

  draw(ctx, camX) {
    const alpha = this.life / this.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#ffe04b';
    ctx.font = 'bold 14px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('+' + this.value, this.x - camX, this.y);
    ctx.restore();
  }
}
