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
    this.facingDir = 1; // 1=right, -1=left
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

// ===== VEGETABLE / PICKUP ITEM =====
class Vegetable extends Entity {
  constructor(x, y, type = 'turnip') {
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
      turnip:  { body: '#f0e0a0', top: '#2a8a00', spot: '#e07000' },
      carrot:  { body: '#ff8c00', top: '#2a8a00', spot: '#e06000' },
      radish:  { body: '#e84060', top: '#2a8a00', spot: '#c02040' },
      mushroom:{ body: '#e83a00', top: '#8b4513', spot: '#fff' },
      bomb:    { body: '#222',    top: '#444',    spot: '#f44' }
    };
    return map[type] || map.turnip;
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
      // Just show top peeking out
      const pullOff = this.pullProgress * this.h * 0.6;
      ctx.fillStyle = c.top;
      ctx.fillRect(sx + 4, sy - 8 + pullOff, 12, 8);
      return;
    }

    // Body
    ctx.fillStyle = c.body;
    ctx.beginPath();
    ctx.ellipse(sx + this.w/2, sy + this.h/2, this.w/2, this.h/2, 0, 0, Math.PI*2);
    ctx.fill();
    // Spots
    ctx.fillStyle = c.spot;
    ctx.beginPath();
    ctx.arc(sx + this.w*0.3, sy + this.h*0.35, 3, 0, Math.PI*2);
    ctx.arc(sx + this.w*0.65, sy + this.h*0.55, 2, 0, Math.PI*2);
    ctx.fill();
    // Leaves
    ctx.fillStyle = c.top;
    ctx.fillRect(sx + 6, sy - 6, 4, 8);
    ctx.fillRect(sx + 10, sy - 8, 4, 8);
    ctx.fillRect(sx + 2, sy - 4, 4, 6);
  }
}

// ===== COIN =====
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
    ctx.fillStyle = '#ffe04b';
    ctx.beginPath();
    ctx.arc(sx + this.w/2, this.y + this.h/2 + pulse, this.w*0.28, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#ffd000';
    ctx.beginPath();
    ctx.arc(sx + this.w/2, this.y + this.h/2 + pulse, this.w*0.18, 0, Math.PI*2);
    ctx.fill();
    // Shine
    ctx.fillStyle = 'rgba(255,255,200,0.7)';
    ctx.beginPath();
    ctx.arc(sx + this.w/2 - 2, this.y + this.h/2 + pulse - 2, 3, 0, Math.PI*2);
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
