// ===== PLAYER =====
class Player extends Entity {
  constructor(x, y, charKey) {
    super(x, y, 28, 40);
    this.charKey = charKey;
    this.cfg = CHARACTERS[charKey];

    this.hp = 3;
    this.maxHp = 3;
    this.lives = 3;
    this.score = 0;
    this.invincible = 0;   // frames of invincibility
    this.dead = false;
    this.deathAnim = 0;

    // Movement
    this.speed = this.cfg.speed;
    this.jumpPower = this.cfg.jumpPower;
    this.jumpHeld = 0;
    this.isJumping = false;
    this.wasOnGround = false;

    // Peach float
    this.floating = false;
    this.floatTimer = 0;

    // Carry system
    this.carrying = null;  // Vegetable or Enemy
    this.pulling = null;
    this.pullTimer = 0;
    this.throwCooldown = 0;

    // Animation
    this.animFrame = 0;
    this.animTimer = 0;
    this.walkCycle = 0;
    this.crouching = false;

    // Duck (SMB2 style - hold down to crouch)
    this.ducking = false;
  }

  get isAlive() { return !this.dead; }

  takeDamage(game) {
    if (this.invincible > 0) return;
    this.hp--;
    Audio.hit();
    if (this.hp <= 0) {
      this.startDeath(game);
    } else {
      this.invincible = 120; // 2 seconds
    }
    game.updateHUD();
  }

  startDeath(game) {
    this.dead = true;
    this.deathAnim = 0;
    this.vx = 0;
    this.vy = -10;
    this.carrying = null;
    Audio.die();
    game.onPlayerDeath();
  }

  pickupAttempt(vegetables, enemies) {
    if (this.carrying || this.pulling || this.throwCooldown > 0) return;

    // Check for carryable enemies first
    for (const e of enemies) {
      if (e.dead || e.stunned <= 0) continue;
      if (this.overlaps(e)) {
        this.carrying = e;
        e.carried = true;
        Audio.pick();
        return;
      }
    }

    // Check for vegetables in ground directly below/on player
    for (const v of vegetables) {
      if (v.dead || v.carried || v.thrown) continue;
      if (v.inGround) {
        // Must be standing within range
        if (Math.abs(this.centerX - v.centerX) < TILE * 0.8 &&
            v.y >= this.bottom - 8 && v.y < this.bottom + TILE) {
          this.pulling = v;
          v.startPull();
          Audio.pick();
          return;
        }
      } else {
        // Pick up a lying veggie
        if (this.overlaps(v)) {
          this.carrying = v;
          v.inGround = false;
          v.carried = true;
          Audio.pick();
          return;
        }
      }
    }
  }

  throw(direction) {
    if (!this.carrying) return;
    const item = this.carrying;
    this.carrying = null;
    item.carried = false;
    item.thrown = true;
    item.thrownBy = this;
    item.bounces = 0;

    const throwSpeedX = 9 * (direction !== 0 ? direction : this.facingDir);
    const throwSpeedY = -3;

    if (item instanceof Vegetable) {
      item.vx = throwSpeedX;
      item.vy = throwSpeedY;
      item.x = this.x + (direction > 0 ? this.w : -item.w);
      item.y = this.y + 4;
    } else {
      // Enemy throw
      item.vx = throwSpeedX;
      item.vy = throwSpeedY;
      item.x = this.x + (direction > 0 ? this.w : -item.w);
      item.y = this.y;
      item.carried = false;
    }

    Audio.throw();
    this.throwCooldown = 12;
  }

  update(input, level, vegetables, enemies, game) {
    if (this.dead) {
      // Death animation - arc up then fall
      this.vy += GRAVITY;
      this.y += this.vy;
      this.x += this.vx;
      this.deathAnim++;
      if (this.deathAnim > 120 || this.y > level.height * TILE + 100) {
        game.respawnOrGameOver();
      }
      return;
    }

    if (this.invincible > 0) this.invincible--;
    if (this.throwCooldown > 0) this.throwCooldown--;

    // Handle pulling
    if (this.pulling) {
      const done = this.pulling.updatePull();
      if (done) {
        this.carrying = this.pulling;
        this.carrying.inGround = false;
        this.carrying.carried = true;
        this.carrying.x = this.x + this.w/2 - this.carrying.w/2;
        this.carrying.y = this.y - this.carrying.h;
        this.pulling = null;
      }
      // Restrict movement while pulling
      this.vx *= 0.5;
    }

    // Input
    const left  = input.left;
    const right = input.right;
    const jump  = input.jump;
    const run   = input.run;
    const down  = input.down;

    this.ducking = down && this.onGround && !this.carrying;

    // Horizontal movement
    const spd = this.speed * (run ? 1.35 : 1.0);
    if (!this.pulling) {
      if (left)  { this.vx = -spd; this.facingDir = -1; }
      else if (right) { this.vx = spd; this.facingDir = 1; }
      else { this.vx *= 0.75; }
    }

    // Jump
    const jumpJustPressed = KEYS_DOWN['jump'] || KEYS_DOWN[' '];
    if (this.onGround && jumpJustPressed) {
      this.vy = this.jumpPower;
      this.isJumping = true;
      this.jumpHeld = 0;
      this.floating = false;
      this.floatTimer = 0;
      Audio.jump();
    }

    // Jump hold (sustained lift)
    if (jump && this.isJumping && this.vy < 0) {
      this.jumpHeld++;
      if (this.jumpHeld < 14) {
        this.vy -= 0.3 * this.cfg.jumpHold;
      }
    }
    if (!jump) { this.isJumping = false; }

    // Peach float
    if (this.cfg.floatAbility && jump && !this.onGround && this.vy > 0) {
      if (!this.floating && KEYS_DOWN['jump']) {
        this.floating = true;
        this.floatTimer = 0;
      }
      if (this.floating) {
        this.floatTimer++;
        this.vy = Math.min(this.vy, 0.8);
        if (this.floatTimer >= this.cfg.floatDuration) {
          this.floating = false;
        }
      }
    }
    if (this.onGround) { this.floating = false; this.floatTimer = 0; }

    // Gravity
    this.applyGravity();

    // Move and collide
    const wasOnGround = this.onGround;
    this.moveAndCollide(level);
    if (!wasOnGround && this.onGround) Audio.land();

    // Clamp to level bounds
    if (this.x < 0) { this.x = 0; this.vx = 0; }
    if (this.x + this.w > level.widthPx) { this.x = level.widthPx - this.w; this.vx = 0; }

    // Fall out of world
    if (this.y > level.heightPx + 60) {
      this.startDeath(game);
      return;
    }

    // Update carried item position
    if (this.carrying) {
      this.carrying.x = this.centerX - this.carrying.w / 2;
      this.carrying.y = this.y - this.carrying.h + 4;
    }

    // Run / pick / throw binding: 'B' = run, pickup, throw
    if (KEYS_DOWN['run'] || KEYS_DOWN['b'] || KEYS_DOWN['z'] || KEYS_DOWN['x']) {
      if (this.carrying) {
        this.throw(this.facingDir);
      } else {
        this.pickupAttempt(vegetables, enemies);
      }
    }

    // Animation
    this.animTimer++;
    if (Math.abs(this.vx) > 0.5) {
      if (this.animTimer % 8 === 0) this.walkCycle = (this.walkCycle + 1) % 4;
    } else {
      this.walkCycle = 0;
    }
  }

  draw(ctx, camX) {
    const sx = Math.round(this.x - camX);
    const sy = Math.round(this.y);

    // Invincibility flicker
    if (this.invincible > 0 && Math.floor(this.invincible / 5) % 2 === 0) return;

    ctx.save();
    ctx.imageSmoothingEnabled = false;

    if (this.facingDir === -1) {
      ctx.translate(sx + this.w, sy);
      ctx.scale(-1, 1);
      ctx.translate(-this.w/2 + 2, 0);
    } else {
      ctx.translate(sx - 2, sy);
    }

    const frame = (this.walkCycle === 1 || this.walkCycle === 3) ? 1 : 0;
    const scale = 2;

    switch (this.charKey) {
      case 'mario': drawMarioSprite(ctx, frame, 1, scale); break;
      case 'luigi': drawLuigiSprite(ctx, frame, 1, scale); break;
      case 'toad':  drawToadSprite(ctx, frame, 1, scale);  break;
      case 'peach': drawPeachSprite(ctx, frame, 1, scale); break;
    }

    // Ducking overlay
    if (this.ducking) {
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, this.h * 0.5, this.w + 4, this.h * 0.5);
      ctx.globalAlpha = 1;
    }

    // Floating sparkles for Peach
    if (this.floating) {
      ctx.fillStyle = 'rgba(255, 180, 255, 0.7)';
      for (let i = 0; i < 4; i++) {
        const angle = (this.animTimer * 0.1 + i * Math.PI / 2);
        ctx.beginPath();
        ctx.arc(14 + Math.cos(angle) * 16, 20 + Math.sin(angle) * 8, 3, 0, Math.PI*2);
        ctx.fill();
      }
    }

    ctx.restore();

    // Draw carried item above head
    if (this.carrying) {
      this.carrying.draw(ctx, camX);
    }
  }
}
