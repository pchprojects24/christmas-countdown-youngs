// ===== WEB AUDIO ENGINE =====
class AudioEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this._init();
  }

  _init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio not supported');
    }
  }

  _resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  _beep(freq, type, duration, vol = 0.18, delay = 0) {
    if (this.muted || !this.ctx) return;
    this._resume();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);
    gain.gain.setValueAtTime(vol, this.ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + duration);
    osc.start(this.ctx.currentTime + delay);
    osc.stop(this.ctx.currentTime + delay + duration + 0.01);
  }

  jump() {
    this._beep(320, 'square', 0.08, 0.14);
    this._beep(480, 'square', 0.06, 0.10, 0.06);
  }

  land() {
    this._beep(120, 'square', 0.05, 0.1);
  }

  pick() {
    this._beep(550, 'sine', 0.06, 0.12);
    this._beep(700, 'sine', 0.06, 0.10, 0.05);
  }

  throw() {
    this._beep(300, 'sawtooth', 0.07, 0.12);
    this._beep(200, 'sawtooth', 0.07, 0.10, 0.06);
  }

  hit() {
    this._beep(180, 'sawtooth', 0.06, 0.15);
    this._beep(140, 'sawtooth', 0.06, 0.13, 0.04);
  }

  enemyDie() {
    this._beep(600, 'square', 0.04, 0.12);
    this._beep(480, 'square', 0.04, 0.12, 0.04);
    this._beep(360, 'square', 0.04, 0.12, 0.08);
    this._beep(240, 'square', 0.08, 0.10, 0.12);
  }

  coin() {
    this._beep(880, 'sine', 0.05, 0.14);
    this._beep(1200, 'sine', 0.07, 0.12, 0.04);
  }

  powerup() {
    [392, 494, 587, 740, 880].forEach((f, i) => this._beep(f, 'square', 0.1, 0.13, i * 0.07));
  }

  die() {
    if (this.muted || !this.ctx) return;
    this._resume();
    const notes = [480, 440, 400, 360, 320, 280, 240];
    notes.forEach((f, i) => this._beep(f, 'square', 0.12, 0.15, i * 0.1));
  }

  levelClear() {
    const notes = [523, 659, 784, 1047, 784, 1047];
    notes.forEach((f, i) => this._beep(f, 'sine', 0.18, 0.18, i * 0.15));
  }

  doorOpen() {
    [330, 440, 550, 660].forEach((f, i) => this._beep(f, 'sine', 0.1, 0.14, i * 0.08));
  }

  bossHit() {
    this._beep(200, 'sawtooth', 0.1, 0.2);
    this._beep(150, 'sawtooth', 0.1, 0.18, 0.08);
  }

  bossDefeat() {
    const notes = [220, 165, 110, 82, 55];
    notes.forEach((f, i) => this._beep(f, 'square', 0.2, 0.2, i * 0.15));
    [523, 659, 784].forEach((f, i) => this._beep(f, 'sine', 0.2, 0.2, 0.8 + i * 0.18));
  }
}

const Audio = new AudioEngine();
