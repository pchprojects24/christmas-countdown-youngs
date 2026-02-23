// ===== ENEMY BASE =====
class Enemy extends Entity {
  constructor(x, y, w, h, type) {
    super(x, y, w, h);
    this.type = type;
    this.stunned = 0;      // frames stunned (carryable when > 0)
    this.carried = false;
    this.thrown = false;
    this.bounces = 0;
    this.maxBounces = 1;
    this.hp = 1;
    this.scoreValue = SCORE.ENEMY_STOMP;
    this.animTimer = 0;
    this.speed = 1.2;
    this.patrolDir = -1;
  }

  stun(duration = 180) {
    this.stunned = duration;
    this.vx = 0;
    this.vy = -4;
  }

  hitByThrown(game, camX) {
    Audio.enemyDie();
    game.addScore(SCORE.ENEMY_THROW, this.centerX, this.y, camX);
    this.dead = true;
    game.spawnParticles(this.centerX, this.centerY, this._getColor(), 12);
  }

  _getColor() { return '#888'; }

  baseBehavior(level) {
    if (this.carried) return;
    if (this.stunned > 0) {
      this.stunned--;
      this.applyGravity();
      this.moveAndCollide(level);
      return;
    }
    this.animTimer++;
    this.vx = this.patrolDir * this.speed;
    this.applyGravity();
    const prevX = this.x;
    this.moveAndCollide(level);

    // Reverse on wall collision
    if (Math.abs(this.x - prevX) < Math.abs(this.vx) * 0.5) {
      this.patrolDir *= -1;
    }
    // Edge detection - turn at ledges
    if (this.onGround) {
      const aheadX = this.x + (this.patrolDir > 0 ? this.w + 2 : -2);
      const belowY  = this.y + this.h + 2;
      const tX = Math.floor(aheadX / TILE);
      const tY = Math.floor(belowY / TILE);
      if (tY >= 0 && tY < level.height) {
        const tile = level.getTile(tX, tY);
        if (!SOLID_TILES.has(tile)) this.patrolDir *= -1;
      }
    }

    // Out of bounds
    if (this.y > level.heightPx + 200) this.dead = true;
  }

  drawStunStars(ctx, camX) {
    if (this.stunned <= 0) return;
    const sx = this.x - camX + this.w/2;
    const sy = this.y - 8;
    const t = this.animTimer;
    for (let i = 0; i < 3; i++) {
      const angle = t * 0.12 + i * Math.PI * 2 / 3;
      const rx = sx + Math.cos(angle) * 10;
      const ry = sy + Math.sin(angle) * 5;
      ctx.fillStyle = '#ffe04b';
      ctx.font = '10px sans-serif';
      ctx.fillText('★', rx - 4, ry);
    }
  }
}

// ===== SHY GUY =====
class ShyGuy extends Enemy {
  constructor(x, y, color = 'red') {
    super(x, y, 28, 28, ENEMY_TYPES.SHYGUY);
    this.hp = 1;
    this.color = color;
    this.speed = 1.4 + Math.random() * 0.6;
    this.scoreValue = 200;
  }

  _getColor() {
    const map = { red: '#e83a00', blue: '#3a6fff', pink: '#ff60a0', green: '#2a9e00' };
    return map[this.color] || '#e83a00';
  }

  update(level, player, game) {
    if (this.dead) return;
    if (this.thrown && !this.carried) {
      this._thrownUpdate(level, player, game);
      return;
    }
    this.baseBehavior(level);

    // Check stomp by player
    if (!this.stunned && player.isAlive && this.overlaps(player)) {
      if (player.vy > 0 && player.bottom <= this.y + 10) {
        this.stun(200);
        player.vy = -7;
        game.addScore(SCORE.ENEMY_STOMP, this.centerX, this.y, game.camX);
        Audio.enemyDie();
      } else {
        player.takeDamage(game);
      }
    }
  }

  _thrownUpdate(level, player, game) {
    this.applyGravity();
    this.x += this.vx;
    this.y += this.vy;
    const vCols = level.getTileCollisions(this);
    for (const col of vCols) {
      if (this.vy > 0 && this.bounces < this.maxBounces) {
        this.y = col.tileY * TILE - this.h;
        this.vy = -this.vy * 0.4;
        this.vx *= 0.7;
        this.bounces++;
      } else {
        this.dead = true;
        game.spawnParticles(this.centerX, this.centerY, this._getColor(), 8);
      }
    }
    if (this.y > level.heightPx + 200) this.dead = true;
  }

  draw(ctx, camX) {
    if (this.dead) return;
    const sx = this.x - camX;
    const sy = this.y;
    const c = this._getColor();

    ctx.save();
    if (this.facingDir === -1) {
      ctx.translate(sx + this.w, 0);
      ctx.scale(-1, 1);
      ctx.translate(-sx, 0);
    }

    // Robe
    ctx.fillStyle = c;
    ctx.fillRect(sx+2, sy+10, this.w-4, this.h-10);
    // Head
    ctx.fillStyle = '#f9d8b0';
    ctx.beginPath();
    ctx.arc(sx+this.w/2, sy+9, 10, 0, Math.PI*2);
    ctx.fill();
    // Mask
    ctx.fillStyle = '#fff';
    ctx.fillRect(sx+4, sy+5, this.w-8, 10);
    ctx.fillStyle = '#000';
    ctx.fillRect(sx+5, sy+7, 5, 4);
    ctx.fillRect(sx+this.w-10, sy+7, 5, 4);
    // Hood
    ctx.fillStyle = c;
    ctx.fillRect(sx, sy+2, this.w, 8);
    ctx.beginPath();
    ctx.moveTo(sx+this.w/2-6, sy+2);
    ctx.lineTo(sx+this.w/2, sy-4);
    ctx.lineTo(sx+this.w/2+6, sy+2);
    ctx.fill();
    // Feet
    ctx.fillStyle = '#3d1c00';
    ctx.fillRect(sx+4, sy+this.h-4, 8, 4);
    ctx.fillRect(sx+this.w-12, sy+this.h-4, 8, 4);

    ctx.restore();
    this.drawStunStars(ctx, camX);
  }
}

// ===== NINJI =====
class Ninji extends Enemy {
  constructor(x, y) {
    super(x, y, 26, 26, ENEMY_TYPES.NINJI);
    this.speed = 0;
    this.jumpTimer = 0;
    this.jumpInterval = 80 + Math.floor(Math.random() * 60);
    this.scoreValue = 300;
  }
  _getColor() { return '#222'; }

  update(level, player, game) {
    if (this.dead) return;
    if (this.thrown && !this.carried) {
      this.applyGravity();
      this.x += this.vx;
      this.y += this.vy;
      const vCols = level.getTileCollisions(this);
      for (const col of vCols) {
        if (this.vy > 0) { this.dead = true; game.spawnParticles(this.centerX, this.centerY, '#222', 10); }
      }
      if (this.y > level.heightPx+200) this.dead = true;
      return;
    }
    if (this.stunned > 0) { this.stunned--; this.applyGravity(); this.moveAndCollide(level); return; }

    this.animTimer++;
    this.jumpTimer++;

    this.applyGravity();
    this.moveAndCollide(level);

    if (this.onGround && this.jumpTimer >= this.jumpInterval) {
      // Jump towards player
      const dx = player.centerX - this.centerX;
      this.vx = Math.sign(dx) * 2.5;
      this.vy = -10;
      this.facingDir = Math.sign(dx);
      this.jumpTimer = 0;
      this.jumpInterval = 80 + Math.floor(Math.random() * 60);
    }

    if (player.isAlive && this.overlaps(player)) {
      if (player.vy > 0 && player.bottom <= this.y + 10) {
        this.stun(200);
        player.vy = -7;
        game.addScore(this.scoreValue, this.centerX, this.y, game.camX);
        Audio.enemyDie();
      } else {
        player.takeDamage(game);
      }
    }
    if (this.y > level.heightPx+200) this.dead = true;
  }

  draw(ctx, camX) {
    if (this.dead) return;
    const sx = this.x - camX;
    const sy = this.y;
    // Body
    ctx.fillStyle = '#111';
    ctx.fillRect(sx+2, sy+8, this.w-4, this.h-8);
    // Head
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(sx+this.w/2, sy+8, 10, 0, Math.PI*2);
    ctx.fill();
    // Eyes (white gleam)
    ctx.fillStyle = '#fff';
    ctx.fillRect(sx+5, sy+5, 4, 4);
    ctx.fillRect(sx+this.w-9, sy+5, 4, 4);
    ctx.fillStyle = '#ff0';
    ctx.fillRect(sx+6, sy+6, 2, 2);
    ctx.fillRect(sx+this.w-8, sy+6, 2, 2);
    // Belt
    ctx.fillStyle = '#c84800';
    ctx.fillRect(sx+2, sy+16, this.w-4, 3);
    this.drawStunStars(ctx, camX);
  }
}

// ===== SNIFIT =====
class Snifit extends Enemy {
  constructor(x, y) {
    super(x, y, 28, 28, ENEMY_TYPES.SNIFIT);
    this.color = '#666';
    this.speed = 1.0;
    this.fireTimer = 0;
    this.fireInterval = 120 + Math.floor(Math.random() * 80);
    this.scoreValue = 400;
    this.projectiles = [];
  }
  _getColor() { return '#666'; }

  update(level, player, game) {
    if (this.dead) return;
    if (this.thrown && !this.carried) {
      this.applyGravity();
      this.x += this.vx;
      this.y += this.vy;
      const vCols = level.getTileCollisions(this);
      for (const col of vCols) {
        if (this.vy > 0) { this.dead = true; game.spawnParticles(this.centerX, this.centerY, '#666', 10); }
      }
      if (this.y > level.heightPx+200) this.dead = true;
      return;
    }
    if (this.stunned > 0) { this.stunned--; this.applyGravity(); this.moveAndCollide(level); return; }

    this.baseBehavior(level);
    this.fireTimer++;
    if (this.fireTimer >= this.fireInterval) {
      this.fireTimer = 0;
      this.fireInterval = 120 + Math.floor(Math.random() * 80);
      // Shoot at player
      const dx = player.centerX - this.centerX;
      const dy = player.centerY - this.centerY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < TILE * 12) {
        const speed = 4;
        this.projectiles.push({
          x: this.centerX, y: this.centerY,
          vx: (dx/dist) * speed, vy: (dy/dist) * speed,
          dead: false, w: 10, h: 10
        });
      }
    }
    // Update projectiles
    for (const p of this.projectiles) {
      if (p.dead) continue;
      p.x += p.vx; p.y += p.vy;
      if (p.y > level.heightPx+200 || p.x < 0 || p.x > level.widthPx) { p.dead = true; continue; }
      // Hit wall
      const t = level.getTile(Math.floor(p.x/TILE), Math.floor(p.y/TILE));
      if (SOLID_TILES.has(t)) { p.dead = true; continue; }
      // Hit player
      if (player.isAlive && !player.dead &&
          p.x < player.right && p.x+p.w > player.left &&
          p.y < player.bottom && p.y+p.h > player.top) {
        p.dead = true;
        player.takeDamage(game);
      }
    }
    this.projectiles = this.projectiles.filter(p => !p.dead);

    if (player.isAlive && this.overlaps(player) && !this.stunned) {
      if (player.vy > 0 && player.bottom <= this.y + 10) {
        this.stun(200);
        player.vy = -7;
        game.addScore(this.scoreValue, this.centerX, this.y, game.camX);
        Audio.enemyDie();
      } else {
        player.takeDamage(game);
      }
    }
    if (this.y > level.heightPx+200) this.dead = true;
  }

  draw(ctx, camX) {
    if (this.dead) return;
    const sx = this.x - camX;
    const sy = this.y;
    // Mask body
    ctx.fillStyle = '#555';
    ctx.beginPath();
    ctx.arc(sx+this.w/2, sy+this.h/2, this.w/2-2, 0, Math.PI*2);
    ctx.fill();
    // Face plate
    ctx.fillStyle = '#888';
    ctx.beginPath();
    ctx.arc(sx+this.w/2, sy+this.h/2-2, 9, 0, Math.PI*2);
    ctx.fill();
    // Snout hole
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(sx+this.w/2, sy+this.h/2+2, 5, 0, Math.PI*2);
    ctx.fill();
    // Eyes
    ctx.fillStyle = '#ff4';
    ctx.fillRect(sx+5, sy+6, 4, 4);
    ctx.fillRect(sx+this.w-9, sy+6, 4, 4);
    // Projectiles
    for (const p of this.projectiles) {
      ctx.fillStyle = '#f84';
      ctx.beginPath();
      ctx.arc(p.x - camX + p.w/2, p.y + p.h/2, 5, 0, Math.PI*2);
      ctx.fill();
    }
    this.drawStunStars(ctx, camX);
  }
}

// ===== BIRDO (Boss) =====
class Birdo extends Enemy {
  constructor(x, y) {
    super(x, y, 48, 52, ENEMY_TYPES.BIRDO);
    this.hp = 9;
    this.maxHp = 9;
    this.speed = 0.8;
    this.scoreValue = 5000;
    this.fireTimer = 0;
    this.fireInterval = 90;
    this.eggs = [];
    this.phase = 1;
    this.angryTimer = 0;
  }
  _getColor() { return '#e84060'; }

  takeBossHit(game) {
    this.hp--;
    Audio.bossHit();
    this.angryTimer = 30;
    if (this.hp <= 3 && this.phase === 1) {
      this.phase = 2;
      this.speed = 1.4;
      this.fireInterval = 60;
    }
    if (this.hp <= 0) {
      this.dead = true;
      Audio.bossDefeat();
      game.addScore(this.scoreValue * (4 - game.currentLevel), this.centerX, this.y, game.camX);
      game.spawnParticles(this.centerX, this.centerY, '#e84060', 30);
      game.onBossDefeated();
    }
  }

  update(level, player, game) {
    if (this.dead) return;
    this.animTimer++;
    this.angryTimer = Math.max(0, this.angryTimer - 1);

    // Patrol
    this.vx = this.patrolDir * this.speed;
    this.applyGravity();
    const prevX = this.x;
    this.moveAndCollide(level);
    if (Math.abs(this.x - prevX) < Math.abs(this.vx) * 0.5) this.patrolDir *= -1;
    this.facingDir = this.patrolDir;

    // Fire eggs
    this.fireTimer++;
    if (this.fireTimer >= this.fireInterval) {
      this.fireTimer = 0;
      const dx = player.centerX - this.centerX;
      const dir = Math.sign(dx);
      this.eggs.push({
        x: this.centerX + dir * this.w/2, y: this.centerY,
        vx: dir * (this.phase === 2 ? 5 : 3.5), vy: -3,
        dead: false, w: 18, h: 18, canCarry: true
      });
    }

    // Update eggs
    for (const egg of this.eggs) {
      if (egg.dead) continue;
      egg.vy += GRAVITY * 0.5;
      egg.x += egg.vx; egg.y += egg.vy;
      const t = level.getTile(Math.floor(egg.x/TILE), Math.floor((egg.y+egg.h)/TILE));
      if (SOLID_TILES.has(t)) {
        egg.y = Math.floor((egg.y+egg.h)/TILE)*TILE - egg.h;
        egg.vy *= -0.3;
        egg.vx *= 0.6;
        egg.canCarry = true;
      }
      if (egg.y > level.heightPx+200 || egg.x < 0 || egg.x > level.widthPx) { egg.dead = true; continue; }
      // Player hit
      if (player.isAlive && !player.dead &&
          egg.x < player.right && egg.x+egg.w > player.left &&
          egg.y < player.bottom && egg.y+egg.h > player.top) {
        if (!player.carrying) {
          egg.dead = true;
          player.takeDamage(game);
        }
      }
      // Player throws veggie/egg back at Birdo
      if (player.carrying && player.carrying === egg && !egg.dead) {
        // Carried egg - check if thrown at Birdo
        if (egg.thrown && egg.thrownBy === player) {
          if (egg.x < this.right && egg.x+egg.w > this.left &&
              egg.y < this.bottom && egg.y+egg.h > this.top) {
            egg.dead = true;
            this.takeBossHit(game);
          }
        }
      }
    }
    this.eggs = this.eggs.filter(e => !e.dead);

    // Check if thrown egg from player hits Birdo
    if (player.carrying && player.carrying.thrown && player.carrying.thrownBy === player) {
      const item = player.carrying;
      if (item.x < this.right && item.x+item.w > this.left &&
          item.y < this.bottom && item.y+item.h > this.top) {
        item.dead = true;
        player.carrying = null;
        this.takeBossHit(game);
      }
    }

    // Body contact
    if (player.isAlive && this.overlaps(player)) {
      player.takeDamage(game);
    }

    if (this.y > level.heightPx+200) this.dead = true;
  }

  draw(ctx, camX) {
    if (this.dead) return;
    const sx = this.x - camX;
    const sy = this.y;
    const angry = this.angryTimer > 0;

    ctx.save();
    if (this.facingDir === -1) {
      ctx.translate(sx + this.w, 0);
      ctx.scale(-1, 1);
      ctx.translate(-sx, 0);
    }

    // Body
    ctx.fillStyle = angry ? '#ff1050' : '#e84060';
    ctx.beginPath();
    ctx.ellipse(sx+this.w/2, sy+this.h*0.6, this.w/2-2, this.h*0.4, 0, 0, Math.PI*2);
    ctx.fill();
    // Head
    ctx.fillStyle = angry ? '#ff2060' : '#f05070';
    ctx.beginPath();
    ctx.ellipse(sx+this.w/2, sy+this.h*0.28, 18, 16, 0, 0, Math.PI*2);
    ctx.fill();
    // Bow
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(sx+this.w/2, sy+4, 8, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#ffb0c0';
    ctx.fillRect(sx+this.w/2-3, sy+1, 6, 6);
    // Eyes
    ctx.fillStyle = '#fff';
    ctx.fillRect(sx+this.w/2-12, sy+this.h*0.18, 8, 8);
    ctx.fillRect(sx+this.w/2+4, sy+this.h*0.18, 8, 8);
    ctx.fillStyle = '#222';
    ctx.fillRect(sx+this.w/2-10, sy+this.h*0.2, 4, 4);
    ctx.fillRect(sx+this.w/2+6, sy+this.h*0.2, 4, 4);
    // Snout
    ctx.fillStyle = '#f9d8b0';
    ctx.beginPath();
    ctx.ellipse(sx+this.w/2, sy+this.h*0.35, 14, 10, 0, 0, Math.PI*2);
    ctx.fill();
    // Nostrils
    ctx.fillStyle = '#e84060';
    ctx.beginPath();
    ctx.arc(sx+this.w/2-5, sy+this.h*0.32, 3, 0, Math.PI*2);
    ctx.arc(sx+this.w/2+5, sy+this.h*0.32, 3, 0, Math.PI*2);
    ctx.fill();
    // Feet
    ctx.fillStyle = '#c03050';
    ctx.fillRect(sx+4, sy+this.h-8, 14, 8);
    ctx.fillRect(sx+this.w-18, sy+this.h-8, 14, 8);

    ctx.restore();

    // HP bar
    const bw = 60, bh = 7;
    const bx = this.x - camX + this.w/2 - bw/2;
    const by = this.y - 16;
    ctx.fillStyle = '#400';
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = '#f44';
    ctx.fillRect(bx, by, bw * (this.hp / this.maxHp), bh);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, bw, bh);
    ctx.fillStyle = '#fff';
    ctx.font = '8px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('BIRDO', this.x - camX + this.w/2, by - 2);

    // Draw eggs
    for (const egg of this.eggs) {
      ctx.fillStyle = '#f9a0c0';
      ctx.beginPath();
      ctx.ellipse(egg.x - camX + egg.w/2, egg.y + egg.h/2, egg.w/2, egg.h/2, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = '#e84060';
      ctx.beginPath();
      ctx.arc(egg.x - camX + egg.w/2, egg.y + egg.h/2, 3, 0, Math.PI*2);
      ctx.fill();
    }
  }
}

// ===== WART (Final Boss) =====
class Wart extends Enemy {
  constructor(x, y) {
    super(x, y, 64, 60, 'wart');
    this.hp = 16;
    this.maxHp = 16;
    this.speed = 0.6;
    this.scoreValue = 20000;
    this.fireTimer = 0;
    this.fireInterval = 80;
    this.bubbles = [];
    this.phase = 1;
    this.angryTimer = 0;
    this.mouthOpen = false;
    this.mouthTimer = 0;
  }

  takeBossHit(game) {
    if (!this.mouthOpen) return; // Can only be hit when mouth is open
    this.hp--;
    Audio.bossHit();
    this.angryTimer = 40;
    if (this.hp <= 8 && this.phase === 1) {
      this.phase = 2;
      this.speed = 1.2;
      this.fireInterval = 55;
    }
    if (this.hp <= 0) {
      this.dead = true;
      Audio.bossDefeat();
      game.addScore(this.scoreValue, this.centerX, this.y, game.camX);
      game.spawnParticles(this.centerX, this.centerY, '#2a8a2a', 40);
      game.onFinalBossDefeated();
    }
  }

  update(level, player, game) {
    if (this.dead) return;
    this.animTimer++;
    this.angryTimer = Math.max(0, this.angryTimer - 1);

    this.vx = this.patrolDir * this.speed;
    this.applyGravity();
    const prevX = this.x;
    this.moveAndCollide(level);
    if (Math.abs(this.x - prevX) < Math.abs(this.vx) * 0.5) this.patrolDir *= -1;

    // Mouth cycle
    this.mouthTimer++;
    const cycle = this.phase === 2 ? 60 : 90;
    this.mouthOpen = (this.mouthTimer % cycle) < cycle * 0.4;

    // Fire bubbles
    this.fireTimer++;
    if (this.mouthOpen && this.fireTimer >= this.fireInterval) {
      this.fireTimer = 0;
      const dx = player.centerX - this.centerX;
      const dir = Math.sign(dx);
      for (let i = 0; i < this.phase; i++) {
        this.bubbles.push({
          x: this.centerX + dir * this.w/2, y: this.centerY,
          vx: dir * (3 + i * 0.5), vy: -2 - i * 0.3,
          dead: false, w: 16, h: 16
        });
      }
    }

    for (const b of this.bubbles) {
      if (b.dead) continue;
      b.vy += GRAVITY * 0.3;
      b.x += b.vx; b.y += b.vy;
      const t = level.getTile(Math.floor(b.x/TILE), Math.floor((b.y+b.h)/TILE));
      if (SOLID_TILES.has(t) || b.y > level.heightPx+200) { b.dead = true; continue; }
      if (player.isAlive && !player.dead &&
          b.x < player.right && b.x+b.w > player.left &&
          b.y < player.bottom && b.y+b.h > player.top) {
        b.dead = true;
        player.takeDamage(game);
      }
    }
    this.bubbles = this.bubbles.filter(b => !b.dead);

    // Check veggie thrown into open mouth
    for (const v of game.vegetables) {
      if (!v.thrown || !v.thrownBy || v.dead) continue;
      if (v.x < this.right && v.x+v.w > this.left &&
          v.y < this.bottom && v.y+v.h > this.top) {
        v.dead = true;
        this.takeBossHit(game);
      }
    }

    if (player.isAlive && this.overlaps(player)) player.takeDamage(game);
    if (this.y > level.heightPx+200) this.dead = true;
  }

  draw(ctx, camX) {
    if (this.dead) return;
    const sx = this.x - camX;
    const sy = this.y;
    const angry = this.angryTimer > 0;

    ctx.save();
    if (this.facingDir === -1) {
      ctx.translate(sx + this.w, 0);
      ctx.scale(-1, 1);
      ctx.translate(-sx, 0);
    }

    // Body
    ctx.fillStyle = angry ? '#3adf3a' : '#2a9e2a';
    ctx.fillRect(sx+4, sy+24, this.w-8, this.h-24);
    // Head
    ctx.fillStyle = angry ? '#3adf3a' : '#2abe2a';
    ctx.beginPath();
    ctx.ellipse(sx+this.w/2, sy+20, 28, 24, 0, 0, Math.PI*2);
    ctx.fill();
    // Crown
    ctx.fillStyle = '#ffe04b';
    for (let i = 0; i < 5; i++) {
      const cx2 = sx + 8 + i * 12;
      ctx.fillRect(cx2, sy-8, 8, 10);
      ctx.fillRect(cx2+2, sy-12, 4, 6);
    }
    ctx.fillRect(sx+4, sy-4, this.w-8, 6);
    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(sx+this.w/2-14, sy+10, 9, 0, Math.PI*2);
    ctx.arc(sx+this.w/2+14, sy+10, 9, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = angry ? '#f44' : '#1a1a8a';
    ctx.beginPath();
    ctx.arc(sx+this.w/2-14, sy+10, 5, 0, Math.PI*2);
    ctx.arc(sx+this.w/2+14, sy+10, 5, 0, Math.PI*2);
    ctx.fill();
    // Mouth
    ctx.fillStyle = '#1a4a1a';
    if (this.mouthOpen) {
      ctx.beginPath();
      ctx.arc(sx+this.w/2, sy+28, 18, 0, Math.PI);
      ctx.fill();
      ctx.fillStyle = '#ff2020';
      ctx.fillRect(sx+this.w/2-14, sy+28, 28, 4);
      // Teeth
      ctx.fillStyle = '#fff';
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(sx+this.w/2-12+i*7, sy+22, 5, 6);
      }
    } else {
      ctx.beginPath();
      ctx.moveTo(sx+this.w/2-14, sy+28);
      ctx.quadraticCurveTo(sx+this.w/2, sy+22, sx+this.w/2+14, sy+28);
      ctx.strokeStyle = '#1a4a1a';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    // Arms
    ctx.fillStyle = '#2a9e2a';
    ctx.fillRect(sx-8, sy+26, 12, 20);
    ctx.fillRect(sx+this.w-4, sy+26, 12, 20);
    // Feet
    ctx.fillStyle = '#1a6a1a';
    ctx.fillRect(sx+6, sy+this.h-8, 18, 8);
    ctx.fillRect(sx+this.w-24, sy+this.h-8, 18, 8);

    ctx.restore();

    // HP bar
    const bw = 80, bh = 8;
    const bx = this.x - camX + this.w/2 - bw/2;
    const by = this.y - 20;
    ctx.fillStyle = '#300';
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = '#0f0';
    ctx.fillRect(bx, by, bw * (this.hp / this.maxHp), bh);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, bw, bh);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 9px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('WART', this.x - camX + this.w/2, by - 2);

    // Mouth hint
    if (!this.mouthOpen && this.mouthTimer % 90 < 60) {
      ctx.fillStyle = 'rgba(255,255,0,0.6)';
      ctx.font = '8px Courier New';
      ctx.fillText('↑ THROW VEGGIES!', this.x - camX + this.w/2, by - 12);
    }

    // Bubbles
    for (const b of this.bubbles) {
      ctx.fillStyle = 'rgba(80, 180, 255, 0.7)';
      ctx.beginPath();
      ctx.arc(b.x - camX + b.w/2, b.y + b.h/2, b.w/2, 0, Math.PI*2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(180,220,255,0.9)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }
}
