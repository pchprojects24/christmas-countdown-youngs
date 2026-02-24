// ===== ENEMY BASE =====
class Enemy extends Entity {
  constructor(x, y, w, h, type) {
    super(x, y, w, h);
    this.type = type;
    this.stunned = 0;
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

    if (Math.abs(this.x - prevX) < Math.abs(this.vx) * 0.5) {
      this.patrolDir *= -1;
    }
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

// ===== ROOMBA/VACUUM (replaces Shy Guy) =====
// A robotic vacuum cleaner that patrols back and forth - cats hate these!
class ShyGuy extends Enemy {
  constructor(x, y, color = 'red') {
    super(x, y, 28, 28, ENEMY_TYPES.SHYGUY);
    this.hp = 1;
    this.color = color;
    this.speed = 1.4 + Math.random() * 0.6;
    this.scoreValue = 200;
  }

  _getColor() {
    const map = { red: '#444', blue: '#335', pink: '#534', green: '#353' };
    return map[this.color] || '#444';
  }
  _getDarkColor() {
    const map = { red: '#333', blue: '#224', pink: '#423', green: '#242' };
    return map[this.color] || '#333';
  }
  _getLightColor() {
    const map = { red: '#666', blue: '#557', pink: '#756', green: '#575' };
    return map[this.color] || '#666';
  }
  _getAccentColor() {
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

    if (!this.stunned && player.isAlive && this.overlaps(player)) {
      if (player.vy > 0 && player.bottom <= this.y + 12) {
        this.stun(200);
        const jumpHeld = KEYS['jump'] || KEYS[' '] || KEYS['x'];
        player.vy = jumpHeld ? -10 : -6;
        player.isJumping = jumpHeld;
        player.jumpHeld = 0;
        player.squashY = -3;
        game.addScore(SCORE.ENEMY_STOMP, this.centerX, this.y, game.camX);
        game.spawnParticles(this.centerX, this.top, '#ffe04b', 6);
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
    const accent = this._getAccentColor();

    ctx.save();

    // Roomba body (circular robot vacuum)
    ctx.fillStyle = '#444';
    ctx.beginPath();
    ctx.ellipse(sx+this.w/2, sy+this.h*0.6, this.w/2-1, this.h*0.35, 0, 0, Math.PI*2);
    ctx.fill();

    // Top surface (darker)
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.ellipse(sx+this.w/2, sy+this.h*0.5, this.w/2-3, this.h*0.25, 0, 0, Math.PI*2);
    ctx.fill();

    // LED ring accent color
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(sx+this.w/2, sy+this.h*0.5, this.w/2-4, this.h*0.2, 0, 0, Math.PI*2);
    ctx.stroke();

    // Blinking light
    const blink = Math.sin(this.animTimer * 0.15) > 0;
    if (blink) {
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(sx+this.w/2, sy+this.h*0.38, 3, 0, Math.PI*2);
      ctx.fill();
    }

    // Bumper ring
    ctx.fillStyle = '#555';
    ctx.beginPath();
    ctx.ellipse(sx+this.w/2, sy+this.h*0.6, this.w/2, this.h*0.12, 0, Math.PI*0.6, Math.PI*2.4);
    ctx.stroke();

    // "Eyes" (sensor dots - makes it look menacing to cats)
    ctx.fillStyle = '#f44';
    ctx.beginPath();
    ctx.arc(sx+this.w/2-5, sy+this.h*0.42, 2, 0, Math.PI*2);
    ctx.arc(sx+this.w/2+5, sy+this.h*0.42, 2, 0, Math.PI*2);
    ctx.fill();

    // Wheels (small visible on sides)
    ctx.fillStyle = '#222';
    ctx.fillRect(sx+2, sy+this.h-6, 5, 4);
    ctx.fillRect(sx+this.w-7, sy+this.h-6, 5, 4);

    // Dust particles when moving
    if (!this.stunned && this.animTimer % 8 < 4) {
      ctx.fillStyle = 'rgba(150,150,150,0.3)';
      ctx.beginPath();
      const dustX = this.patrolDir > 0 ? sx - 2 : sx + this.w + 2;
      ctx.arc(dustX, sy+this.h-4, 3, 0, Math.PI*2);
      ctx.fill();
    }

    ctx.restore();
    this.drawStunStars(ctx, camX);
  }
}

// ===== CUCUMBER (replaces Ninji) =====
// A menacing cucumber that jumps toward cats - they're terrified of these!
class Ninji extends Enemy {
  constructor(x, y) {
    super(x, y, 26, 26, ENEMY_TYPES.NINJI);
    this.speed = 0;
    this.jumpTimer = 0;
    this.jumpInterval = 80 + Math.floor(Math.random() * 60);
    this.scoreValue = 300;
  }
  _getColor() { return '#3a8a1a'; }

  update(level, player, game) {
    if (this.dead) return;
    if (this.thrown && !this.carried) {
      this.applyGravity();
      this.x += this.vx;
      this.y += this.vy;
      const vCols = level.getTileCollisions(this);
      for (const col of vCols) {
        if (this.vy > 0) { this.dead = true; game.spawnParticles(this.centerX, this.centerY, '#3a8a1a', 10); }
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
      const dx = player.centerX - this.centerX;
      this.vx = Math.sign(dx) * 2.5;
      this.vy = -10;
      this.facingDir = Math.sign(dx);
      this.jumpTimer = 0;
      this.jumpInterval = 80 + Math.floor(Math.random() * 60);
    }

    if (player.isAlive && this.overlaps(player)) {
      if (player.vy > 0 && player.bottom <= this.y + 12) {
        this.stun(200);
        const jumpHeld = KEYS['jump'] || KEYS[' '] || KEYS['x'];
        player.vy = jumpHeld ? -10 : -6;
        player.isJumping = jumpHeld;
        player.jumpHeld = 0;
        player.squashY = -3;
        game.addScore(this.scoreValue, this.centerX, this.y, game.camX);
        game.spawnParticles(this.centerX, this.top, '#ffe04b', 6);
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

    // Cucumber body (green, elongated)
    ctx.fillStyle = '#3a8a1a';
    ctx.beginPath();
    ctx.ellipse(sx+this.w/2, sy+this.h/2, this.w/2-2, this.h/2, 0, 0, Math.PI*2);
    ctx.fill();

    // Lighter inner area
    ctx.fillStyle = '#4aaa2a';
    ctx.beginPath();
    ctx.ellipse(sx+this.w/2, sy+this.h/2, this.w/2-5, this.h/2-3, 0, 0, Math.PI*2);
    ctx.fill();

    // Bumps/texture
    ctx.fillStyle = '#2a6a0a';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(sx + 5 + i*5, sy + 8 + (i%2)*6, 2, 0, Math.PI*2);
      ctx.fill();
    }

    // Menacing eyes (why cats are scared!)
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(sx+this.w/2-4, sy+this.h*0.35, 4, 0, Math.PI*2);
    ctx.arc(sx+this.w/2+4, sy+this.h*0.35, 4, 0, Math.PI*2);
    ctx.fill();
    // Angry pupils
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(sx+this.w/2-3, sy+this.h*0.37, 2, 0, Math.PI*2);
    ctx.arc(sx+this.w/2+5, sy+this.h*0.37, 2, 0, Math.PI*2);
    ctx.fill();
    // Evil eyebrows
    ctx.fillStyle = '#1a4a0a';
    ctx.fillRect(sx+this.w/2-8, sy+this.h*0.25, 6, 2);
    ctx.fillRect(sx+this.w/2+2, sy+this.h*0.25, 6, 2);

    // Stem on top
    ctx.fillStyle = '#2a6a0a';
    ctx.fillRect(sx+this.w/2-2, sy-3, 4, 6);

    this.drawStunStars(ctx, camX);
  }
}

// ===== SPRAY BOTTLE (replaces Snifit) =====
// Shoots water at cats - they hate getting sprayed!
class Snifit extends Enemy {
  constructor(x, y) {
    super(x, y, 28, 28, ENEMY_TYPES.SNIFIT);
    this.speed = 1.0;
    this.fireTimer = 0;
    this.fireInterval = 120 + Math.floor(Math.random() * 80);
    this.scoreValue = 400;
    this.projectiles = [];
  }
  _getColor() { return '#4488cc'; }

  update(level, player, game) {
    if (this.dead) return;
    if (this.thrown && !this.carried) {
      this.applyGravity();
      this.x += this.vx;
      this.y += this.vy;
      const vCols = level.getTileCollisions(this);
      for (const col of vCols) {
        if (this.vy > 0) { this.dead = true; game.spawnParticles(this.centerX, this.centerY, '#4488cc', 10); }
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
    for (const p of this.projectiles) {
      if (p.dead) continue;
      p.x += p.vx; p.y += p.vy;
      if (p.y > level.heightPx+200 || p.x < 0 || p.x > level.widthPx) { p.dead = true; continue; }
      const t = level.getTile(Math.floor(p.x/TILE), Math.floor(p.y/TILE));
      if (SOLID_TILES.has(t)) { p.dead = true; continue; }
      if (player.isAlive && !player.dead &&
          p.x < player.right && p.x+p.w > player.left &&
          p.y < player.bottom && p.y+p.h > player.top) {
        p.dead = true;
        player.takeDamage(game);
      }
    }
    this.projectiles = this.projectiles.filter(p => !p.dead);

    if (player.isAlive && this.overlaps(player) && !this.stunned) {
      if (player.vy > 0 && player.bottom <= this.y + 12) {
        this.stun(200);
        const jumpHeld = KEYS['jump'] || KEYS[' '] || KEYS['x'];
        player.vy = jumpHeld ? -10 : -6;
        player.isJumping = jumpHeld;
        player.jumpHeld = 0;
        player.squashY = -3;
        game.addScore(this.scoreValue, this.centerX, this.y, game.camX);
        game.spawnParticles(this.centerX, this.top, '#ffe04b', 6);
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

    ctx.save();
    if (this.facingDir === -1) {
      ctx.translate(sx + this.w, 0);
      ctx.scale(-1, 1);
      ctx.translate(-sx, 0);
    }

    // Bottle body
    ctx.fillStyle = '#4488cc';
    ctx.fillRect(sx+4, sy+8, this.w-8, this.h-8);
    // Bottle highlight
    ctx.fillStyle = '#66aaee';
    ctx.fillRect(sx+6, sy+10, this.w-14, this.h-14);
    // Bottle cap/neck
    ctx.fillStyle = '#eee';
    ctx.fillRect(sx+8, sy+2, this.w-16, 8);
    // Trigger/nozzle
    ctx.fillStyle = '#ddd';
    ctx.fillRect(sx+this.w-8, sy+4, 8, 4);
    ctx.fillRect(sx+this.w-4, sy+4, 4, 10);
    // Nozzle tip
    ctx.fillStyle = '#aaa';
    ctx.beginPath();
    ctx.arc(sx+this.w, sy+6, 3, 0, Math.PI*2);
    ctx.fill();
    // Label
    ctx.fillStyle = '#fff';
    ctx.fillRect(sx+6, sy+14, this.w-12, 8);
    // "SPRAY" text hint (water drops)
    ctx.fillStyle = '#4488cc';
    ctx.beginPath();
    ctx.arc(sx+10, sy+17, 2, 0, Math.PI*2);
    ctx.arc(sx+15, sy+18, 1.5, 0, Math.PI*2);
    ctx.arc(sx+19, sy+17, 2, 0, Math.PI*2);
    ctx.fill();
    // Evil face on bottle
    ctx.fillStyle = '#224466';
    ctx.fillRect(sx+9, sy+11, 2, 2);
    ctx.fillRect(sx+15, sy+11, 2, 2);
    // Legs (small robotic legs)
    ctx.fillStyle = '#3377aa';
    ctx.fillRect(sx+5, sy+this.h-5, 6, 5);
    ctx.fillRect(sx+this.w-11, sy+this.h-5, 6, 5);

    ctx.restore();

    // Water spray projectiles
    for (const p of this.projectiles) {
      // Water droplet
      ctx.fillStyle = 'rgba(100,180,255,0.6)';
      ctx.beginPath();
      ctx.arc(p.x - camX + p.w/2, p.y + p.h/2, 6, 0, Math.PI*2);
      ctx.fill();
      // Droplet highlight
      ctx.fillStyle = 'rgba(200,230,255,0.8)';
      ctx.beginPath();
      ctx.arc(p.x - camX + p.w/2 - 1, p.y + p.h/2 - 2, 2, 0, Math.PI*2);
      ctx.fill();
      // Splash trail
      ctx.fillStyle = 'rgba(100,180,255,0.3)';
      ctx.beginPath();
      ctx.arc(p.x - camX + p.w/2 - p.vx*2, p.y + p.h/2 - p.vy*2, 3, 0, Math.PI*2);
      ctx.fill();
    }
    this.drawStunStars(ctx, camX);
  }
}

// ===== BIG DOG (replaces Birdo - Level 3 Boss) =====
// A big rowdy dog that chases cats and throws tennis balls
class Birdo extends Enemy {
  constructor(x, y) {
    super(x, y, 48, 52, ENEMY_TYPES.BIRDO);
    this.hp = 9;
    this.maxHp = 9;
    this.speed = 0.8;
    this.scoreValue = 5000;
    this.fireTimer = 0;
    this.fireInterval = 90;
    this.eggs = [];  // tennis balls
    this.phase = 1;
    this.angryTimer = 0;
  }
  _getColor() { return '#b08040'; }

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
      game.spawnParticles(this.centerX, this.centerY, '#b08040', 30);
      game.onBossDefeated();
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
    this.facingDir = this.patrolDir;

    // Throw tennis balls
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
      if (player.isAlive && !player.dead &&
          egg.x < player.right && egg.x+egg.w > player.left &&
          egg.y < player.bottom && egg.y+egg.h > player.top) {
        if (!player.carrying) {
          egg.dead = true;
          player.takeDamage(game);
        }
      }
      if (player.carrying && player.carrying === egg && !egg.dead) {
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

    if (player.carrying && player.carrying.thrown && player.carrying.thrownBy === player) {
      const item = player.carrying;
      if (item.x < this.right && item.x+item.w > this.left &&
          item.y < this.bottom && item.y+item.h > this.top) {
        item.dead = true;
        player.carrying = null;
        this.takeBossHit(game);
      }
    }

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

    // Body (big golden/brown dog)
    const bodyColor = angry ? '#c09050' : '#b08040';
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(sx+this.w/2, sy+this.h*0.6, this.w/2-2, this.h*0.38, 0, 0, Math.PI*2);
    ctx.fill();
    // Body highlight
    ctx.fillStyle = angry ? '#d0a060' : '#c09050';
    ctx.beginPath();
    ctx.ellipse(sx+this.w/2-4, sy+this.h*0.55, this.w/4, this.h*0.25, 0, 0, Math.PI*2);
    ctx.fill();
    // Belly (lighter)
    ctx.fillStyle = '#e0c8a0';
    ctx.beginPath();
    ctx.ellipse(sx+this.w/2, sy+this.h*0.65, this.w/3-2, this.h*0.2, 0, 0, Math.PI*2);
    ctx.fill();

    // Head
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(sx+this.w/2, sy+this.h*0.25, 20, 18, 0, 0, Math.PI*2);
    ctx.fill();
    // Head highlight
    ctx.fillStyle = '#c09050';
    ctx.beginPath();
    ctx.ellipse(sx+this.w/2-3, sy+this.h*0.2, 10, 10, 0, 0, Math.PI*2);
    ctx.fill();

    // Floppy ears
    ctx.fillStyle = '#9a6a30';
    // Left ear (floppy)
    ctx.beginPath();
    ctx.ellipse(sx+6, sy+this.h*0.18, 7, 14, -0.3, 0, Math.PI*2);
    ctx.fill();
    // Right ear
    ctx.beginPath();
    ctx.ellipse(sx+this.w-6, sy+this.h*0.18, 7, 14, 0.3, 0, Math.PI*2);
    ctx.fill();

    // Snout
    ctx.fillStyle = '#d0b080';
    ctx.beginPath();
    ctx.ellipse(sx+this.w/2, sy+this.h*0.32, 12, 10, 0, 0, Math.PI*2);
    ctx.fill();
    // Nose
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.ellipse(sx+this.w/2, sy+this.h*0.28, 5, 4, 0, 0, Math.PI*2);
    ctx.fill();
    // Nose highlight
    ctx.fillStyle = '#555';
    ctx.beginPath();
    ctx.arc(sx+this.w/2-1, sy+this.h*0.27, 2, 0, Math.PI*2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(sx+this.w/2-8, sy+this.h*0.2, 5, 0, Math.PI*2);
    ctx.arc(sx+this.w/2+8, sy+this.h*0.2, 5, 0, Math.PI*2);
    ctx.fill();
    // Pupils
    ctx.fillStyle = angry ? '#e44' : '#332';
    ctx.beginPath();
    ctx.arc(sx+this.w/2-7, sy+this.h*0.21, 3, 0, Math.PI*2);
    ctx.arc(sx+this.w/2+7, sy+this.h*0.21, 3, 0, Math.PI*2);
    ctx.fill();
    // Eye highlights
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(sx+this.w/2-8, sy+this.h*0.18, 1.5, 0, Math.PI*2);
    ctx.arc(sx+this.w/2+8, sy+this.h*0.18, 1.5, 0, Math.PI*2);
    ctx.fill();

    // Mouth/tongue
    if (this.animTimer % 60 < 30) {
      ctx.fillStyle = '#e06060';
      ctx.beginPath();
      ctx.ellipse(sx+this.w/2+3, sy+this.h*0.38, 4, 6, 0.2, 0, Math.PI*2);
      ctx.fill();
    }

    // Collar
    ctx.fillStyle = '#c04040';
    ctx.fillRect(sx+8, sy+this.h*0.4, this.w-16, 4);
    // Collar tag
    ctx.fillStyle = '#ffe04b';
    ctx.beginPath();
    ctx.arc(sx+this.w/2, sy+this.h*0.44, 3, 0, Math.PI*2);
    ctx.fill();

    // Tail (wagging)
    const tailWag = Math.sin(this.animTimer * 0.2) * 8;
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(sx+2, sy+this.h*0.5);
    ctx.quadraticCurveTo(sx-8+tailWag, sy+this.h*0.3, sx-4+tailWag, sy+this.h*0.2);
    ctx.lineWidth = 6;
    ctx.strokeStyle = bodyColor;
    ctx.stroke();

    // Legs
    ctx.fillStyle = bodyColor;
    ctx.fillRect(sx+6, sy+this.h-12, 10, 12);
    ctx.fillRect(sx+this.w-16, sy+this.h-12, 10, 12);
    // Paws
    ctx.fillStyle = '#9a6a30';
    ctx.fillRect(sx+4, sy+this.h-4, 12, 4);
    ctx.fillRect(sx+this.w-16, sy+this.h-4, 12, 4);

    ctx.restore();

    // HP bar
    const bw = 60, bh = 7;
    const bx = this.x - camX + this.w/2 - bw/2;
    const by = this.y - 16;
    ctx.fillStyle = '#400';
    ctx.fillRect(bx, by, bw, bh);
    const hpRatio = this.hp / this.maxHp;
    ctx.fillStyle = hpRatio > 0.5 ? '#f44' : hpRatio > 0.25 ? '#f80' : '#f00';
    ctx.fillRect(bx, by, bw * hpRatio, bh);
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(bx, by, bw * hpRatio, bh/2);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, bw, bh);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 8px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('BIG DOG', this.x - camX + this.w/2, by - 2);

    // Tennis balls
    for (const egg of this.eggs) {
      const ex = egg.x - camX + egg.w/2;
      const ey = egg.y + egg.h/2;
      // Ball shadow
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.ellipse(ex, ey+egg.h/2, egg.w/3, 3, 0, 0, Math.PI*2);
      ctx.fill();
      // Tennis ball body
      ctx.fillStyle = '#c8e020';
      ctx.beginPath();
      ctx.arc(ex, ey, egg.w/2, 0, Math.PI*2);
      ctx.fill();
      // Tennis ball line
      ctx.strokeStyle = '#f0f0e0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(ex, ey, egg.w/2-2, 0.5, 2.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(ex, ey, egg.w/2-2, 3.5, 5.5);
      ctx.stroke();
      // Highlight
      ctx.fillStyle = '#e0f040';
      ctx.beginPath();
      ctx.arc(ex-3, ey-3, 3, 0, Math.PI*2);
      ctx.fill();
    }
  }
}

// ===== THE VET (replaces Wart - Final Boss) =====
// The dreaded veterinarian with a lab coat, stethoscope, and syringes
class Wart extends Enemy {
  constructor(x, y) {
    super(x, y, 64, 60, 'vet');
    this.hp = 16;
    this.maxHp = 16;
    this.speed = 0.6;
    this.scoreValue = 20000;
    this.fireTimer = 0;
    this.fireInterval = 80;
    this.bubbles = []; // syringes
    this.phase = 1;
    this.angryTimer = 0;
    this.mouthOpen = false;
    this.mouthTimer = 0;
  }

  takeBossHit(game) {
    if (!this.mouthOpen) return;
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
      game.spawnParticles(this.centerX, this.centerY, '#88aacc', 40);
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

    // Mouth cycle (vet calling cats)
    this.mouthTimer++;
    const cycle = this.phase === 2 ? 60 : 90;
    this.mouthOpen = (this.mouthTimer % cycle) < cycle * 0.4;

    // Fire syringes
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

    // Check treat thrown into open mouth
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

    // Lab coat body
    ctx.fillStyle = '#eee';
    ctx.fillRect(sx+8, sy+20, this.w-16, this.h-20);
    // Coat shading
    ctx.fillStyle = '#ddd';
    ctx.fillRect(sx+8, sy+20, 6, this.h-20);
    ctx.fillRect(sx+this.w-14, sy+20, 6, this.h-20);
    // Coat highlight
    ctx.fillStyle = '#fff';
    ctx.fillRect(sx+16, sy+22, this.w-32, this.h-26);
    // Coat buttons
    ctx.fillStyle = '#aaa';
    ctx.fillRect(sx+this.w/2-1, sy+26, 3, 3);
    ctx.fillRect(sx+this.w/2-1, sy+34, 3, 3);
    ctx.fillRect(sx+this.w/2-1, sy+42, 3, 3);

    // Shirt/tie under coat
    ctx.fillStyle = '#4488aa';
    ctx.fillRect(sx+this.w/2-4, sy+20, 8, 16);
    // Tie
    ctx.fillStyle = '#cc4444';
    ctx.fillRect(sx+this.w/2-2, sy+20, 4, 14);

    // Head
    ctx.fillStyle = '#f5c8a8';
    ctx.beginPath();
    ctx.ellipse(sx+this.w/2, sy+12, 18, 16, 0, 0, Math.PI*2);
    ctx.fill();

    // Hair (grey/white - distinguished vet)
    ctx.fillStyle = '#888';
    ctx.fillRect(sx+this.w/2-16, sy-2, 32, 8);
    ctx.fillRect(sx+this.w/2-18, sy+2, 4, 10);
    ctx.fillRect(sx+this.w/2+14, sy+2, 4, 10);
    // Hair highlight
    ctx.fillStyle = '#aaa';
    ctx.fillRect(sx+this.w/2-10, sy, 20, 4);

    // Glasses
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(sx+this.w/2-16, sy+6, 12, 10);
    ctx.rect(sx+this.w/2+4, sy+6, 12, 10);
    ctx.stroke();
    // Bridge
    ctx.beginPath();
    ctx.moveTo(sx+this.w/2-4, sy+10);
    ctx.lineTo(sx+this.w/2+4, sy+10);
    ctx.stroke();

    // Eyes behind glasses
    ctx.fillStyle = '#fff';
    ctx.fillRect(sx+this.w/2-14, sy+8, 8, 6);
    ctx.fillRect(sx+this.w/2+6, sy+8, 8, 6);
    // Pupils
    ctx.fillStyle = angry ? '#e44' : '#446';
    ctx.fillRect(sx+this.w/2-11, sy+9, 4, 4);
    ctx.fillRect(sx+this.w/2+9, sy+9, 4, 4);

    // Mouth
    if (this.mouthOpen) {
      ctx.fillStyle = '#a04040';
      ctx.beginPath();
      ctx.arc(sx+this.w/2, sy+22, 8, 0, Math.PI);
      ctx.fill();
      // Teeth
      ctx.fillStyle = '#fff';
      ctx.fillRect(sx+this.w/2-6, sy+18, 4, 4);
      ctx.fillRect(sx+this.w/2+2, sy+18, 4, 4);
    } else {
      ctx.fillStyle = '#c08080';
      ctx.fillRect(sx+this.w/2-6, sy+20, 12, 2);
    }

    // Stethoscope
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx+this.w/2-8, sy+14);
    ctx.quadraticCurveTo(sx+this.w/2-12, sy+24, sx+this.w/2-6, sy+34);
    ctx.stroke();
    // Stethoscope end
    ctx.fillStyle = '#666';
    ctx.beginPath();
    ctx.arc(sx+this.w/2-6, sy+34, 3, 0, Math.PI*2);
    ctx.fill();

    // Arms (holding clipboard or syringe)
    ctx.fillStyle = '#eee';
    ctx.fillRect(sx, sy+24, 10, 20);
    ctx.fillRect(sx+this.w-10, sy+24, 10, 20);
    // Hands
    ctx.fillStyle = '#f5c8a8';
    ctx.fillRect(sx, sy+40, 10, 6);
    ctx.fillRect(sx+this.w-10, sy+40, 10, 6);
    // Syringe in hand
    ctx.fillStyle = '#ccc';
    ctx.fillRect(sx+this.w-6, sy+38, 3, 12);
    ctx.fillStyle = '#88ccee';
    ctx.fillRect(sx+this.w-5, sy+40, 1, 6);

    // Pants
    ctx.fillStyle = '#334466';
    ctx.fillRect(sx+12, sy+this.h-14, 16, 14);
    ctx.fillRect(sx+this.w-28, sy+this.h-14, 16, 14);
    // Shoes
    ctx.fillStyle = '#222';
    ctx.fillRect(sx+10, sy+this.h-4, 18, 4);
    ctx.fillRect(sx+this.w-28, sy+this.h-4, 18, 4);

    ctx.restore();

    // HP bar
    const bw = 80, bh = 8;
    const bx = this.x - camX + this.w/2 - bw/2;
    const by = this.y - 20;
    ctx.fillStyle = '#300';
    ctx.fillRect(bx, by, bw, bh);
    const hpRatio = this.hp / this.maxHp;
    ctx.fillStyle = hpRatio > 0.5 ? '#0f0' : hpRatio > 0.25 ? '#ff0' : '#f00';
    ctx.fillRect(bx, by, bw * hpRatio, bh);
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(bx, by, bw * hpRatio, bh/2);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, bw, bh);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 9px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('THE VET', this.x - camX + this.w/2, by - 2);

    // Mouth hint
    if (!this.mouthOpen && this.mouthTimer % 90 < 60) {
      ctx.fillStyle = 'rgba(255,255,0,0.6)';
      ctx.font = '8px Courier New';
      ctx.fillText('THROW TREATS!', this.x - camX + this.w/2, by - 12);
    }

    // Syringe projectiles
    for (const b of this.bubbles) {
      const bCx = b.x - camX + b.w/2;
      const bCy = b.y + b.h/2;
      // Syringe body
      ctx.fillStyle = '#ccc';
      ctx.fillRect(bCx-2, bCy-6, 4, 12);
      // Syringe plunger
      ctx.fillStyle = '#888';
      ctx.fillRect(bCx-3, bCy-7, 6, 3);
      // Syringe needle
      ctx.fillStyle = '#aaa';
      ctx.fillRect(bCx-0.5, bCy+6, 1, 4);
      // Liquid color
      ctx.fillStyle = 'rgba(100,200,255,0.6)';
      ctx.fillRect(bCx-1, bCy-3, 2, 6);
      // Glow
      ctx.fillStyle = 'rgba(100,200,255,0.2)';
      ctx.beginPath();
      ctx.arc(bCx, bCy, b.w/2+2, 0, Math.PI*2);
      ctx.fill();
    }
  }
}
