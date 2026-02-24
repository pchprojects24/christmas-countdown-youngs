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

    // Coyote time & jump buffering
    this.coyoteTimer = 0;    // frames since leaving ground
    this.jumpBuffer = 0;     // frames since jump was pressed

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

    // Visual juice
    this.squashY = 0;      // squash/stretch offset (positive = squashed)
    this.landingImpact = 0; // frames of landing impact effect
    this.prevVy = 0;        // previous frame vy for landing detection

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

    // Decay visual juice
    this.squashY *= 0.8;
    if (Math.abs(this.squashY) < 0.5) this.squashY = 0;
    if (this.landingImpact > 0) this.landingImpact--;

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

    // --- Coyote time tracking ---
    if (this.onGround) {
      this.coyoteTimer = COYOTE_FRAMES;
    } else {
      if (this.coyoteTimer > 0) this.coyoteTimer--;
    }

    // --- Jump buffer tracking ---
    const jumpJustPressed = KEYS_DOWN['jump'] || KEYS_DOWN[' '];
    if (jumpJustPressed) {
      this.jumpBuffer = JUMP_BUFFER_FRAMES;
    } else {
      if (this.jumpBuffer > 0) this.jumpBuffer--;
    }

    // --- Horizontal movement with acceleration ---
    const targetSpeed = this.speed * (run ? 1.35 : 1.0);
    if (!this.pulling) {
      const accel = this.onGround ? GROUND_ACCEL : AIR_ACCEL;
      const decel = this.onGround ? GROUND_DECEL : AIR_DECEL;

      if (left) {
        this.vx = Math.max(this.vx - accel * targetSpeed, -targetSpeed);
        this.facingDir = -1;
      } else if (right) {
        this.vx = Math.min(this.vx + accel * targetSpeed, targetSpeed);
        this.facingDir = 1;
      } else {
        // Deceleration
        this.vx *= decel;
        if (Math.abs(this.vx) < 0.15) this.vx = 0;
      }
    }

    // --- Jump with coyote time and jump buffering ---
    const canJump = this.onGround || this.coyoteTimer > 0;
    const wantsJump = this.jumpBuffer > 0;

    if (canJump && wantsJump && !this.isJumping) {
      this.vy = this.jumpPower;
      this.isJumping = true;
      this.jumpHeld = 0;
      this.floating = false;
      this.floatTimer = 0;
      this.coyoteTimer = 0;  // consume coyote time
      this.jumpBuffer = 0;   // consume jump buffer
      this.squashY = -4;     // stretch on jump
      Audio.jump();
      // Jump dust particles
      game.spawnParticles(this.centerX, this.bottom, '#c8b898', 4);
    }

    // --- Jump hold (sustained lift) with improved curve ---
    if (jump && this.isJumping && this.vy < 0) {
      this.jumpHeld++;
      if (this.jumpHeld < 20) {  // Increased from 18 for more control
        // Stronger at start, fading out for natural feel
        const holdStrength = 1.0 - (this.jumpHeld / 20);
        this.vy -= 0.38 * this.cfg.jumpHold * holdStrength;  // Slightly increased
      }
    }

    // --- Jump cut: Release jump button early for shorter jumps ---
    if (!jump && this.isJumping && this.vy < 0) {
      this.vy *= JUMP_CUT_MULT;  // Cut upward velocity for responsive control
      this.isJumping = false;
    }

    if (!jump) { this.isJumping = false; }

    // --- Apex hang (reduced gravity near jump peak) ---
    const atApex = !this.onGround && Math.abs(this.vy) < APEX_THRESHOLD && !this.floating;

    // Peach float (Olive's special ability)
    if (this.cfg.floatAbility && jump && !this.onGround && this.vy > 0) {
      if (!this.floating && KEYS_DOWN['jump']) {
        this.floating = true;
        this.floatTimer = 0;
      }
      if (this.floating) {
        this.floatTimer++;
        this.vy = Math.min(this.vy, 1.0);  // Increased from 0.8 for slightly faster descent
        if (this.floatTimer >= this.cfg.floatDuration) {
          this.floating = false;
        }
      }
    }
    if (this.onGround) { this.floating = false; this.floatTimer = 0; }

    // --- Gravity with apex hang ---
    if (atApex) {
      this.vy += GRAVITY * APEX_GRAVITY_MULT;
    } else {
      this.applyGravity();
    }

    // Store previous vy for landing detection
    this.prevVy = this.vy;

    // Move and collide
    const wasOnGround = this.onGround;
    this.moveAndCollide(level);

    // --- Landing detection with impact feedback ---
    if (!wasOnGround && this.onGround) {
      Audio.land();
      const impactSpeed = Math.abs(this.prevVy);
      if (impactSpeed > 3) {
        // Squash on landing proportional to fall speed
        this.squashY = Math.min(impactSpeed * 0.7, 6);
        this.landingImpact = 8;
        // Landing dust particles
        const dustCount = Math.min(Math.floor(impactSpeed * 0.8), 8);
        game.spawnParticles(this.centerX, this.bottom, '#c8b898', dustCount);
      }
    }

    // If we just left the ground without jumping, don't reset coyote (it's already tracking)
    // But if we jumped, coyote was already consumed above

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

    // --- Running dust particles ---
    if (this.onGround && run && Math.abs(this.vx) > targetSpeed * 0.8) {
      if (this.animTimer % 6 === 0) {
        game.spawnParticles(this.centerX - this.facingDir * 8, this.bottom, '#c8b898', 2);
      }
    }

    // Animation
    this.animTimer++;
    const walkSpeed = Math.abs(this.vx);
    if (walkSpeed > 0.5) {
      // Faster animation when running faster
      const animRate = walkSpeed > targetSpeed * 0.9 ? 5 : 8;
      if (this.animTimer % animRate === 0) this.walkCycle = (this.walkCycle + 1) % 4;
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

    // Squash/stretch transform
    const squash = this.squashY;
    const scaleY = 1 - squash * 0.02;
    const scaleX = 1 + squash * 0.015;
    const yOffset = squash > 0 ? squash * 0.5 : squash * 0.3;

    if (this.facingDir === -1) {
      ctx.translate(sx + this.w, sy + yOffset);
      ctx.scale(-scaleX, scaleY);
      ctx.translate(-this.w/2 + 2, 0);
    } else {
      ctx.translate(sx - 2, sy + yOffset);
      ctx.scale(scaleX, scaleY);
    }

    const frame = (this.walkCycle === 1 || this.walkCycle === 3) ? 1 : 0;
    const scale = 2;

    switch (this.charKey) {
      case 'marice':   drawMariceSprite(ctx, frame, 1, scale); break;
      case 'beatrice': drawBeatriceSprite(ctx, frame, 1, scale); break;
      case 'alice':    drawAliceSprite(ctx, frame, 1, scale);  break;
      case 'olive':    drawOliveSprite(ctx, frame, 1, scale); break;
    }

    // Ducking overlay
    if (this.ducking) {
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, this.h * 0.5, this.w + 4, this.h * 0.5);
      ctx.globalAlpha = 1;
    }

    // Floating sparkles for Olive (fluffy cat drifting)
    if (this.floating) {
      ctx.fillStyle = 'rgba(200, 180, 150, 0.7)';
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
