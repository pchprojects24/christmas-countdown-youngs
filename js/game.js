// ===== MAIN GAME ENGINE =====

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.state = STATE.SELECT;
    this.selectedChar = null;

    this.player = null;
    this.level = null;
    this.enemies = [];
    this.vegetables = [];
    this.coins = [];
    this.scorePopups = [];
    this.particles = new ParticleSystem();

    this.camX = 0;
    this.currentLevel = 0;
    this.totalScore = 0;

    this.animFrame = null;
    this.lastTime = 0;

    this._setupCanvas();
    this._preventIOSBounce();
    this._setupInput();
    this._setupUI();
    this._renderCharPreviews();
    this._loop = this._loop.bind(this);
    requestAnimationFrame(this._loop);
  }

  // ===== SETUP =====
  _setupCanvas() {
    this.canvas.width  = CANVAS_W;
    this.canvas.height = CANVAS_H;
    this._resizeTimeout = null;
    window.addEventListener('resize', () => {
      if (this._resizeTimeout) clearTimeout(this._resizeTimeout);
      this._resizeTimeout = setTimeout(() => this._resizeCanvas(), 60);
    });
    this._resizeCanvas();
  }

  _resizeCanvas() {
    const container = document.getElementById('game-container');
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const hud = document.getElementById('hud');
    const mob = document.getElementById('mobile-controls');
    const hudH = hud ? hud.offsetHeight : 0;
    const mobH = (mob && mob.offsetHeight > 0 && mob.style.display !== 'none') ? mob.offsetHeight : 0;
    const safeBottom = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sab') || '0');
    const avH  = ch - hudH - mobH - safeBottom;
    const scale = Math.min(cw / CANVAS_W, avH / CANVAS_H);
    this.canvas.style.width  = Math.floor(CANVAS_W * scale) + 'px';
    this.canvas.style.height = Math.floor(CANVAS_H * scale) + 'px';
  }

  _preventIOSBounce() {
    document.addEventListener('touchmove', e => {
      if (this.state === STATE.PLAYING) e.preventDefault();
    }, { passive: false });
    document.addEventListener('gesturestart', e => e.preventDefault());
  }

  _setupInput() {
    const keyMap = {
      'ArrowLeft':  'left',  'a': 'left',
      'ArrowRight': 'right', 'd': 'right',
      'ArrowUp':    'up',    'w': 'up',
      'ArrowDown':  'down',  's': 'down',
      ' ':          'jump',  'ArrowUp': 'jump',
      'x': 'jump', 'z': 'run', 'Shift': 'run',
      'b': 'run',  'X': 'jump', 'Z': 'run'
    };

    window.addEventListener('keydown', e => {
      const action = keyMap[e.key];
      if (action) {
        if (!KEYS[action]) KEYS_DOWN[action] = true;
        KEYS[action] = true;
        e.preventDefault();
      }
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') this._togglePause();
      // Number keys for char select
      if (this.state === STATE.SELECT) {
        const chars = ['marice','beatrice','alice','olive'];
        const idx = parseInt(e.key) - 1;
        if (idx >= 0 && idx < 4) this._startGame(chars[idx]);
      }
    });

    window.addEventListener('keyup', e => {
      const action = keyMap[e.key];
      if (action) { KEYS[action] = false; delete KEYS_DOWN[action]; }
    });

    // Mobile controls
    const btnMap = {
      'btn-left':  'left', 'btn-right': 'right',
      'btn-jump':  'jump', 'btn-run':   'run'
    };
    for (const [id, action] of Object.entries(btnMap)) {
      const btn = document.getElementById(id);
      if (!btn) continue;
      btn.addEventListener('pointerdown', e => {
        e.preventDefault();
        KEYS[action] = true;
        KEYS_DOWN[action] = true;
        // Resume audio context on first touch
        Audio._resume();
      });
      btn.addEventListener('pointerup', e => {
        e.preventDefault();
        KEYS[action] = false;
        delete KEYS_DOWN[action];
      });
      btn.addEventListener('pointercancel', e => {
        KEYS[action] = false;
        delete KEYS_DOWN[action];
      });
      btn.addEventListener('pointerleave', e => {
        KEYS[action] = false;
        delete KEYS_DOWN[action];
      });
    }
  }

  _setupUI() {
    // Character select
    document.querySelectorAll('.char-card').forEach(card => {
      card.addEventListener('click', () => {
        this._startGame(card.dataset.char);
      });
    });
    // Pause
    document.getElementById('btn-resume').addEventListener('click', () => this._togglePause());
    document.getElementById('btn-quit').addEventListener('click', () => this._goToSelect());
    // Game over
    document.getElementById('btn-retry').addEventListener('click', () => this._retry());
    document.getElementById('btn-select').addEventListener('click', () => this._goToSelect());
    // Win
    document.getElementById('btn-play-again').addEventListener('click', () => this._retry());
    document.getElementById('btn-select-win').addEventListener('click', () => this._goToSelect());
  }

  _renderCharPreviews() {
    document.querySelectorAll('.char-preview').forEach(canvas => {
      renderCharPreview(canvas.dataset.char, canvas);
    });
  }

  // ===== SCREENS =====
  _showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }

  _togglePause() {
    if (this.state === STATE.PLAYING) {
      this.state = STATE.PAUSED;
      this._showScreen('screen-pause');
    } else if (this.state === STATE.PAUSED) {
      this.state = STATE.PLAYING;
      this._showScreen('screen-game');
    }
  }

  _goToSelect() {
    this.state = STATE.SELECT;
    this._showScreen('screen-select');
    this.player = null;
    this.level = null;
    this.enemies = [];
    this.vegetables = [];
    this.particles.clear();
    Object.keys(KEYS).forEach(k => delete KEYS[k]);
    Object.keys(KEYS_DOWN).forEach(k => delete KEYS_DOWN[k]);
  }

  _retry() {
    this._startGame(this.selectedChar);
  }

  // ===== GAME START / LOAD =====
  _startGame(charKey) {
    Audio._resume();
    this.selectedChar = charKey;
    this.currentLevel = 0;
    this.totalScore = 0;
    this._loadLevel(0);
    this.player = new Player(
      this.level.spawnX,
      this.level.spawnY,
      charKey
    );
    this.player.score = 0;
    this.state = STATE.PLAYING;
    this._showScreen('screen-game');
    this.updateHUD();
  }

  _loadLevel(idx) {
    const data = LEVEL_BUILDERS[idx]();
    this.level = new Level(data);
    this.enemies = [];
    this.vegetables = [];
    this.coins = [];
    this.scorePopups = [];
    this.particles.clear();
    this.camX = 0;

    // Spawn enemies
    for (const ed of data.enemies) {
      const ex = ed.tx * TILE;
      const ey = ed.ty * TILE;
      switch (ed.type) {
        case ENEMY_TYPES.SHYGUY:  this.enemies.push(new ShyGuy(ex, ey, ed.color)); break;
        case ENEMY_TYPES.NINJI:   this.enemies.push(new Ninji(ex, ey)); break;
        case ENEMY_TYPES.SNIFIT:  this.enemies.push(new Snifit(ex, ey)); break;
        case ENEMY_TYPES.BIRDO:   this.enemies.push(new Birdo(ex, ey)); break;
        case ENEMY_TYPES.WART:    this.enemies.push(new Wart(ex, ey)); break;
      }
    }

    // Spawn vegetables
    for (const vd of data.vegetables) {
      const v = new Vegetable(vd.tx * TILE + TILE/2 - 10, vd.ty * TILE, vd.type);
      this.vegetables.push(v);
    }

    // Spawn coins
    for (const cd of data.coins) {
      this.coins.push(new Coin(cd.tx * TILE, cd.ty * TILE));
    }
  }

  // ===== HUD =====
  updateHUD() {
    if (!this.player) return;
    document.getElementById('hud-player').textContent = CHARACTERS[this.selectedChar].name;
    document.getElementById('hud-score').textContent = String(this.player.score + this.totalScore).padStart(6, '0');
    document.getElementById('hud-world').textContent = this.level ? this.level.name : '';
    const hearts = '♥'.repeat(this.player.lives) + '♡'.repeat(Math.max(0, 3 - this.player.lives));
    document.getElementById('hud-lives').textContent = hearts;
    const hp = '●'.repeat(this.player.hp) + '○'.repeat(Math.max(0, this.player.maxHp - this.player.hp));
    document.getElementById('hud-hp').textContent = hp;
  }

  // ===== SCORE =====
  addScore(value, x, y, camX) {
    this.player.score += value;
    this.scorePopups.push(new ScorePopup(x, y, value));
    this.updateHUD();
  }

  // ===== PARTICLES =====
  spawnParticles(x, y, color, count) {
    this.particles.spawn(x, y, color, count);
  }

  // ===== CAMERA =====
  _updateCamera() {
    if (!this.player || !this.level) return;

    // Lookahead in movement direction
    if (this._camLookahead === undefined) this._camLookahead = 0;
    const targetLookahead = this.player.facingDir * CAM_LOOKAHEAD * (Math.abs(this.player.vx) / (this.player.speed * 1.35));
    this._camLookahead += (targetLookahead - this._camLookahead) * CAM_LOOKAHEAD_SPEED;

    const targetX = this.player.centerX - CANVAS_W / 2 + this._camLookahead;

    // Smoother camera with faster catch-up when far away
    const dist = Math.abs(targetX - this.camX);
    const lerpSpeed = dist > 150 ? 0.18 : 0.10;
    this.camX += (targetX - this.camX) * lerpSpeed;
    this.camX = Math.max(0, Math.min(this.camX, this.level.widthPx - CANVAS_W));
  }

  // ===== GAME EVENTS =====
  onPlayerDeath() {
    // Death handled by player.startDeath -> respawnOrGameOver
  }

  respawnOrGameOver() {
    if (this.player.lives > 1) {
      this.player.lives--;
      this.player.hp = this.player.maxHp;
      this.player.dead = false;
      this.player.vy = 0;
      this.player.vx = 0;
      this.player.x = this.level.spawnX;
      this.player.y = this.level.spawnY;
      this.player.invincible = 180;
      this.player.carrying = null;
      this.updateHUD();
    } else {
      this.state = STATE.GAMEOVER;
      this.totalScore += this.player.score;
      document.getElementById('go-score-text').textContent = 'TREATS: ' + String(this.totalScore).padStart(6, '0');
      this._showScreen('screen-gameover');
    }
  }

  onBossDefeated() {
    // Big Dog defeated - backyard cleared
    setTimeout(() => this._nextLevel(), 1500);
  }

  onFinalBossDefeated() {
    setTimeout(() => {
      this.state = STATE.WIN;
      this.totalScore += this.player.score;
      document.getElementById('win-score-text').textContent = 'TOTAL TREATS: ' + String(this.totalScore).padStart(6, '0');
      this._showScreen('screen-win');
      Audio.levelClear();
    }, 2000);
  }

  _nextLevel() {
    this.currentLevel++;
    if (this.currentLevel >= LEVEL_BUILDERS.length) {
      this.state = STATE.WIN;
      this.totalScore += this.player.score;
      document.getElementById('win-score-text').textContent = 'TOTAL TREATS: ' + String(this.totalScore).padStart(6, '0');
      this._showScreen('screen-win');
      return;
    }

    this.totalScore += this.player.score;
    const savedLives = this.player.lives;
    const savedScore = 0;
    const savedChar  = this.selectedChar;

    this._loadLevel(this.currentLevel);
    this.player = new Player(this.level.spawnX, this.level.spawnY, savedChar);
    this.player.lives = savedLives;
    this.player.score = savedScore;
    this.state = STATE.PLAYING;
    this._showScreen('screen-game');
    this.updateHUD();
    Audio.levelClear();
  }

  _checkLevelExit() {
    if (!this.player || this.player.dead) return;
    const px = Math.floor(this.player.centerX / TILE);
    const py = Math.floor(this.player.bottom / TILE);
    const tile = this.level.getTile(px, py);
    const tileAbove = this.level.getTile(px, py - 1);

    // The backyard boss level transitions via boss defeat, not the door tile
    if (this.currentLevel === 2) return;

    if (tile === T.DOOR || tileAbove === T.DOOR) {
      // Is it the final boss level?
      if (this.currentLevel === LEVEL_BUILDERS.length - 1) return; // handled by boss defeat
      Audio.doorOpen();
      this.addScore(SCORE.LEVEL_CLEAR, this.player.centerX, this.player.y, this.camX);
      setTimeout(() => this._nextLevel(), 800);
      this.state = STATE.DEAD; // Prevent re-trigger
    }
  }

  // ===== COIN COLLECTION =====
  _checkCoins() {
    if (!this.player || this.player.dead) return;
    for (const coin of this.coins) {
      if (coin.collected) continue;
      if (this.player.overlaps(coin)) {
        coin.collected = true;
        this.addScore(SCORE.COIN, coin.x + coin.w/2, coin.y, this.camX);
        Audio.coin();
      }
    }
  }

  // ===== CHECK THROWN VEGGIE vs ENEMIES =====
  _checkThrownItems() {
    for (const v of this.vegetables) {
      if (!v.thrown || v.dead) continue;
      for (const e of this.enemies) {
        if (e.dead) continue;
        if (!(e instanceof Birdo) && !(e instanceof Wart) &&
            v.x < e.right && v.x+v.w > e.left &&
            v.y < e.bottom && v.y+v.h > e.top) {
          v.dead = true;
          e.hitByThrown(this, this.camX);
          break;
        }
      }
    }

    // Thrown stunned enemies also hurt other enemies
    for (const e of this.enemies) {
      if (!e.thrown || e.dead) continue;
      for (const other of this.enemies) {
        if (other === e || other.dead) continue;
        if (!(other instanceof Birdo) && !(other instanceof Wart) &&
            e.x < other.right && e.x+e.w > other.left &&
            e.y < other.bottom && e.y+e.h > other.top) {
          other.hitByThrown(this, this.camX);
        }
      }
    }
  }

  // ===== MAIN LOOP =====
  _loop(timestamp) {
    const elapsed = timestamp - this.lastTime;
    const dt = this.lastTime === 0 ? 1 : Math.min(elapsed / 16.67, 3);
    this.lastTime = timestamp;

    if (this.state === STATE.PLAYING) {
      this._update(dt);
      this._draw();
    } else if (this.state === STATE.SELECT) {
      this._drawSelectAnim(timestamp);
    }

    // Clear one-frame key events
    Object.keys(KEYS_DOWN).forEach(k => delete KEYS_DOWN[k]);

    requestAnimationFrame(this._loop);
  }

  // ===== UPDATE =====
  _update(dt) {
    const input = {
      left:  KEYS['left'],
      right: KEYS['right'],
      up:    KEYS['up'],
      down:  KEYS['down'],
      jump:  KEYS['jump'] || KEYS[' '] || KEYS['x'],
      run:   KEYS['run'] || KEYS['z'] || KEYS['b'] || KEYS['Shift']
    };

    this.player.update(input, this.level, this.vegetables, this.enemies, this);

    // Enemies
    for (const e of this.enemies) {
      e.update(this.level, this.player, this);
    }
    this.enemies = this.enemies.filter(e => !e.dead);

    // Vegetables
    for (const v of this.vegetables) {
      v.update(this.level);
    }
    this.vegetables = this.vegetables.filter(v => !v.dead);

    // Coins
    for (const c of this.coins) c.update();

    // Score popups
    for (const p of this.scorePopups) p.update();
    this.scorePopups = this.scorePopups.filter(p => !p.dead);

    // Particles
    this.particles.update();

    // Camera
    this._updateCamera();

    // Checks
    this._checkCoins();
    this._checkThrownItems();
    this._checkLevelExit();
  }

  // ===== DRAW =====
  _draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    this.level.drawBackground(ctx, this.camX);
    this.level.drawTiles(ctx, this.camX);

    // Coins
    for (const c of this.coins) c.draw(ctx, this.camX);

    // Vegetables
    for (const v of this.vegetables) {
      if (!v.carried) v.draw(ctx, this.camX);
    }

    // Enemies
    for (const e of this.enemies) e.draw(ctx, this.camX);

    // Player
    this.player.draw(ctx, this.camX);

    // Particles
    this.particles.draw(ctx, this.camX);

    // Score popups
    for (const p of this.scorePopups) p.draw(ctx, this.camX);

    // Controls hint (first 300 frames)
    if (this._frameCount === undefined) this._frameCount = 0;
    this._frameCount++;
    if (this._frameCount < 300) {
      this._drawControls(ctx);
    }

    // Debug: Pause hint
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '9px Courier New';
    ctx.textAlign = 'right';
    ctx.fillText('ESC = pause', CANVAS_W - 6, CANVAS_H - 6);
  }

  _drawControls(ctx) {
    const alpha = Math.min(1, Math.max(0, (300 - this._frameCount) / 80));
    ctx.save();
    ctx.globalAlpha = alpha * 0.75;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(6, 6, 230, 82);
    ctx.fillStyle = '#ffe04b';
    ctx.font = '10px Courier New';
    ctx.textAlign = 'left';
    ctx.fillText('CONTROLS:', 12, 22);
    ctx.fillStyle = '#fff';
    ctx.fillText('← → : Move   Space/X : Jump', 12, 36);
    ctx.fillText('Shift/Z/B : Grab item / Throw at enemy', 12, 48);
    ctx.fillText('↓ : Crouch   Stomp enemy to stun first!', 12, 60);
    ctx.fillStyle = '#ffcc66';
    ctx.fillText('Grab toys from ground → throw at enemies!', 12, 74);
    ctx.restore();
  }

  // ===== SELECT SCREEN ANIMATION =====
  _drawSelectAnim(timestamp) {
    // Select screen uses CSS animations - no canvas work needed
  }
}

// ===== BOOT =====
window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});
