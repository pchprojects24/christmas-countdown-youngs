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
    this._frameCount = 0;
    this._pendingKeyDown = {};
    this._isTouchDevice = false;

    this._setupCanvas();
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
    this.ctx.imageSmoothingEnabled = false;
    // Re-assert after any resize (browser may reset it)
    window.addEventListener('resize', () => {
      this.ctx.imageSmoothingEnabled = false;
    });
  }

  _setupInput() {
    const keyMap = {
      'ArrowLeft':  'left',  'a': 'left',
      'ArrowRight': 'right', 'd': 'right',
      'ArrowUp':    'jump',  'w': 'up',
      'ArrowDown':  'down',  's': 'down',
      ' ':          'jump',
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
      if (this.state === STATE.SELECT) {
        const chars = ['mario','luigi','toad','peach'];
        const idx = parseInt(e.key) - 1;
        if (idx >= 0 && idx < 4) this._startGame(chars[idx]);
      }
    });

    window.addEventListener('keyup', e => {
      const action = keyMap[e.key];
      if (action) { KEYS[action] = false; delete KEYS_DOWN[action]; }
    });

    this._setupTouchControls();
  }

  // ===== ZONE-BASED MULTI-TOUCH (iPhone-optimised) =====
  _setupTouchControls() {
    const overlay = document.getElementById('touch-overlay');
    if (!overlay) return;

    // touchIdentifier → zone name
    const activeTouches = new Map();

    const elDpadLeft  = document.getElementById('dpad-left');
    const elDpadRight = document.getElementById('dpad-right');
    const elBtnA      = document.getElementById('btn-a');
    const elBtnB      = document.getElementById('btn-b');

    // Classify a single touch point into a control zone
    const getZone = touch => {
      const rect = overlay.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      const w = rect.width;
      const h = rect.height;

      // Pause: top-right corner 15% × 20%
      if (x > w * 0.82 && y < h * 0.22) return 'pause';

      // D-pad: left 42% of width, bottom 52% of height
      if (x < w * 0.42 && y > h * 0.48) {
        return x < w * 0.21 ? 'left' : 'right';
      }

      // Action: right 38% of width, bottom 52% of height
      // Left half of action zone → B (run/throw), right half → A (jump)
      if (x > w * 0.62 && y > h * 0.48) {
        return x < w * 0.81 ? 'run' : 'jump';
      }

      return null;
    };

    // Rebuild KEYS[] from the current active-touch map and update visuals
    const syncKeys = () => {
      const zones = new Set(activeTouches.values());
      KEYS['left']  = zones.has('left');
      KEYS['right'] = zones.has('right');
      KEYS['jump']  = zones.has('jump');
      KEYS['run']   = zones.has('run');

      if (elDpadLeft)  elDpadLeft.classList.toggle('active',  KEYS['left']);
      if (elDpadRight) elDpadRight.classList.toggle('active', KEYS['right']);
      if (elBtnA)      elBtnA.classList.toggle('active',      KEYS['jump']);
      if (elBtnB)      elBtnB.classList.toggle('active',      KEYS['run']);
    };

    const onTouchStart = e => {
      e.preventDefault();
      this._isTouchDevice = true;
      Audio._resume();

      for (const touch of e.changedTouches) {
        const zone = getZone(touch);
        if (zone === 'pause') {
          this._togglePause();
          continue;
        }
        if (zone) {
          const prev = activeTouches.get(touch.identifier);
          activeTouches.set(touch.identifier, zone);
          // KEYS_DOWN fires only when first entering a zone
          if (prev !== zone) {
            if (zone === 'jump') { KEYS_DOWN['jump'] = true; this._pendingKeyDown['jump'] = true; }
            if (zone === 'run')  { KEYS_DOWN['run']  = true; this._pendingKeyDown['run']  = true; }
          }
        }
      }
      syncKeys();
    };

    // touchmove: supports sliding thumb between left/right, and into action buttons
    const onTouchMove = e => {
      e.preventDefault();
      for (const touch of e.changedTouches) {
        const zone = getZone(touch);
        const prev = activeTouches.get(touch.identifier);
        if (zone && zone !== 'pause') {
          if (prev !== zone) {
            activeTouches.set(touch.identifier, zone);
            if (zone === 'jump') { KEYS_DOWN['jump'] = true; this._pendingKeyDown['jump'] = true; }
            if (zone === 'run')  { KEYS_DOWN['run']  = true; this._pendingKeyDown['run']  = true; }
          }
        } else {
          activeTouches.delete(touch.identifier);
        }
      }
      syncKeys();
    };

    const onTouchEnd = e => {
      e.preventDefault();
      for (const touch of e.changedTouches) {
        activeTouches.delete(touch.identifier);
      }
      syncKeys();
    };

    overlay.addEventListener('touchstart',  onTouchStart, { passive: false });
    overlay.addEventListener('touchmove',   onTouchMove,  { passive: false });
    overlay.addEventListener('touchend',    onTouchEnd,   { passive: false });
    overlay.addEventListener('touchcancel', onTouchEnd,   { passive: false });

    // Pause button (sits outside dpad/action zones)
    const pauseBtn = document.getElementById('btn-pause-touch');
    if (pauseBtn) {
      pauseBtn.addEventListener('touchstart', e => {
        e.preventDefault();
        e.stopPropagation();
        this._togglePause();
      }, { passive: false });
    }
  }

  _setupUI() {
    // Character select — support both click and touchend
    document.querySelectorAll('.char-card').forEach(card => {
      card.addEventListener('click', () => this._startGame(card.dataset.char));
      card.addEventListener('touchend', e => {
        e.preventDefault();
        this._startGame(card.dataset.char);
      });
    });
    document.getElementById('btn-resume').addEventListener('click', () => this._togglePause());
    document.getElementById('btn-quit').addEventListener('click', () => this._goToSelect());
    document.getElementById('btn-retry').addEventListener('click', () => this._retry());
    document.getElementById('btn-select').addEventListener('click', () => this._goToSelect());
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

  _retry() { this._startGame(this.selectedChar); }

  // ===== GAME START / LOAD =====
  _startGame(charKey) {
    Audio._resume();
    this.selectedChar = charKey;
    this.currentLevel = 0;
    this.totalScore = 0;
    this._frameCount = 0;
    this._loadLevel(0);
    this.player = new Player(this.level.spawnX, this.level.spawnY, charKey);
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

    for (const ed of data.enemies) {
      const ex = ed.tx * TILE, ey = ed.ty * TILE;
      switch (ed.type) {
        case ENEMY_TYPES.SHYGUY: this.enemies.push(new ShyGuy(ex, ey, ed.color)); break;
        case ENEMY_TYPES.NINJI:  this.enemies.push(new Ninji(ex, ey));            break;
        case ENEMY_TYPES.SNIFIT: this.enemies.push(new Snifit(ex, ey));           break;
        case ENEMY_TYPES.BIRDO:  this.enemies.push(new Birdo(ex, ey));            break;
        case ENEMY_TYPES.WART:   this.enemies.push(new Wart(ex, ey));             break;
      }
    }
    for (const vd of data.vegetables) {
      this.vegetables.push(new Vegetable(vd.tx * TILE + TILE/2 - 10, vd.ty * TILE, vd.type));
    }
    for (const cd of data.coins) {
      this.coins.push(new Coin(cd.tx * TILE, cd.ty * TILE));
    }
  }

  // ===== HUD =====
  updateHUD() {
    if (!this.player) return;
    document.getElementById('hud-player').textContent = CHARACTERS[this.selectedChar].name;
    document.getElementById('hud-score').textContent  = String(this.player.score + this.totalScore).padStart(6, '0');
    document.getElementById('hud-world').textContent  = this.level ? this.level.name : '';
    document.getElementById('hud-lives').textContent  = '♥'.repeat(this.player.lives) + '♡'.repeat(Math.max(0, 3 - this.player.lives));
    document.getElementById('hud-hp').textContent     = '●'.repeat(this.player.hp) + '○'.repeat(Math.max(0, this.player.maxHp - this.player.hp));
  }

  addScore(value, x, y, camX) {
    this.player.score += value;
    this.scorePopups.push(new ScorePopup(x, y, value));
    this.updateHUD();
  }

  spawnParticles(x, y, color, count) { this.particles.spawn(x, y, color, count); }

  // ===== CAMERA =====
  _updateCamera() {
    if (!this.player || !this.level) return;
    const targetX = this.player.centerX - CANVAS_W / 2;
    this.camX += (targetX - this.camX) * 0.12;
    this.camX = Math.max(0, Math.min(this.camX, this.level.widthPx - CANVAS_W));
  }

  // ===== GAME EVENTS =====
  onPlayerDeath() {}

  respawnOrGameOver() {
    if (this.player.lives > 1) {
      this.player.lives--;
      this.player.hp = this.player.maxHp;
      this.player.dead = false;
      this.player.vy = 0; this.player.vx = 0;
      this.player.x = this.level.spawnX;
      this.player.y = this.level.spawnY;
      this.player.invincible = 180;
      this.player.carrying = null;
      this.updateHUD();
    } else {
      this.state = STATE.GAMEOVER;
      this.totalScore += this.player.score;
      document.getElementById('go-score-text').textContent = 'SCORE: ' + String(this.totalScore).padStart(6, '0');
      this._showScreen('screen-gameover');
    }
  }

  onBossDefeated()      { setTimeout(() => this._nextLevel(), 1500); }

  onFinalBossDefeated() {
    setTimeout(() => {
      this.state = STATE.WIN;
      this.totalScore += this.player.score;
      document.getElementById('win-score-text').textContent = 'FINAL SCORE: ' + String(this.totalScore).padStart(6, '0');
      this._showScreen('screen-win');
      Audio.levelClear();
    }, 2000);
  }

  _nextLevel() {
    this.currentLevel++;
    if (this.currentLevel >= LEVEL_BUILDERS.length) {
      this.state = STATE.WIN;
      this.totalScore += this.player.score;
      document.getElementById('win-score-text').textContent = 'FINAL SCORE: ' + String(this.totalScore).padStart(6, '0');
      this._showScreen('screen-win');
      return;
    }
    this.totalScore += this.player.score;
    const savedLives = this.player.lives;
    const savedChar  = this.selectedChar;
    this._loadLevel(this.currentLevel);
    this.player = new Player(this.level.spawnX, this.level.spawnY, savedChar);
    this.player.lives = savedLives;
    this.state = STATE.PLAYING;
    this._showScreen('screen-game');
    this.updateHUD();
    Audio.levelClear();
  }

  _checkLevelExit() {
    if (!this.player || this.player.dead) return;
    const px = Math.floor(this.player.centerX / TILE);
    const py = Math.floor(this.player.bottom / TILE);
    const tile      = this.level.getTile(px, py);
    const tileAbove = this.level.getTile(px, py - 1);
    if (tile === T.DOOR || tileAbove === T.DOOR) {
      if (this.currentLevel === LEVEL_BUILDERS.length - 1) return;
      Audio.doorOpen();
      this.addScore(SCORE.LEVEL_CLEAR, this.player.centerX, this.player.y, this.camX);
      setTimeout(() => this._nextLevel(), 800);
      this.state = STATE.DEAD;
    }
  }

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

  _checkThrownItems() {
    for (const v of this.vegetables) {
      if (!v.thrown || v.dead) continue;
      for (const e of this.enemies) {
        if (e.dead || e instanceof Birdo || e instanceof Wart) continue;
        if (v.x < e.right && v.x+v.w > e.left && v.y < e.bottom && v.y+v.h > e.top) {
          v.dead = true;
          e.hitByThrown(this, this.camX);
          break;
        }
      }
    }
    for (const e of this.enemies) {
      if (!e.thrown || e.dead) continue;
      for (const other of this.enemies) {
        if (other === e || other.dead || other instanceof Birdo || other instanceof Wart) continue;
        if (e.x < other.right && e.x+e.w > other.left && e.y < other.bottom && e.y+e.h > other.top) {
          other.hitByThrown(this, this.camX);
        }
      }
    }
  }

  // ===== MAIN LOOP =====
  _loop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 16.67, 3);
    this.lastTime = timestamp;

    // Merge pending one-frame touch key-downs into KEYS_DOWN
    for (const k in this._pendingKeyDown) {
      KEYS_DOWN[k] = true;
      delete this._pendingKeyDown[k];
    }

    if (this.state === STATE.PLAYING) {
      this._update(dt);
      this._draw();
    }

    // Clear one-frame key events at end of frame
    for (const k in KEYS_DOWN) delete KEYS_DOWN[k];

    requestAnimationFrame(this._loop);
  }

  // ===== UPDATE =====
  _update(dt) {
    const input = {
      left:  KEYS['left'],
      right: KEYS['right'],
      up:    KEYS['up'],
      down:  KEYS['down'],
      jump:  KEYS['jump'],
      run:   KEYS['run']
    };

    this.player.update(input, this.level, this.vegetables, this.enemies, this);

    for (const e of this.enemies) e.update(this.level, this.player, this);
    this.enemies = this.enemies.filter(e => !e.dead);

    for (const v of this.vegetables) v.update(this.level);
    this.vegetables = this.vegetables.filter(v => !v.dead);

    for (const c of this.coins) c.update();

    for (const p of this.scorePopups) p.update();
    this.scorePopups = this.scorePopups.filter(p => !p.dead);

    this.particles.update();
    this._updateCamera();
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

    for (const c of this.coins) c.draw(ctx, this.camX);
    for (const v of this.vegetables) { if (!v.carried) v.draw(ctx, this.camX); }
    for (const e of this.enemies) e.draw(ctx, this.camX);

    this.player.draw(ctx, this.camX);
    this.particles.draw(ctx, this.camX);
    for (const p of this.scorePopups) p.draw(ctx, this.camX);

    this._frameCount++;

    // Controls hint — keyboard only (touch devices have visible on-screen controls)
    if (!this._isTouchDevice && this._frameCount < 280) {
      this._drawKeyboardHint(ctx);
    }

    // Pause hint (desktop only, bottom-right)
    if (!this._isTouchDevice) {
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.font = '9px Courier New';
      ctx.textAlign = 'right';
      ctx.fillText('ESC = pause', CANVAS_W - 6, CANVAS_H - 6);
    }
  }

  _drawKeyboardHint(ctx) {
    const alpha = Math.min(1, Math.max(0, (280 - this._frameCount) / 80));
    ctx.save();
    ctx.globalAlpha = alpha * 0.8;
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(6, 6, 210, 68);
    ctx.fillStyle = '#ffe04b';
    ctx.font = 'bold 10px Courier New';
    ctx.textAlign = 'left';
    ctx.fillText('CONTROLS', 12, 22);
    ctx.fillStyle = '#fff';
    ctx.font = '10px Courier New';
    ctx.fillText('← → : Move         ↑ / X : Jump', 12, 37);
    ctx.fillText('Z / Shift : Run · Pick up · Throw', 12, 51);
    ctx.fillText('Down + no carry : Duck', 12, 65);
    ctx.restore();
  }
}

// ===== BOOT =====
window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});
