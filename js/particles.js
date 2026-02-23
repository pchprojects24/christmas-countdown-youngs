// ===== PARTICLE SYSTEM =====
class Particle {
  constructor(x, y, color, vx, vy, size, life) {
    this.x = x; this.y = y;
    this.vx = vx; this.vy = vy;
    this.color = color;
    this.size = size;
    this.maxLife = life;
    this.life = life;
    this.dead = false;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.25;
    this.vx *= 0.96;
    this.life--;
    if (this.life <= 0) this.dead = true;
  }

  draw(ctx, camX) {
    const alpha = this.life / this.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x - camX, this.y, this.size * alpha, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  spawn(x, y, color, count = 8) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
      const speed = 2 + Math.random() * 4;
      const size  = 2 + Math.random() * 4;
      const life  = 20 + Math.floor(Math.random() * 25);
      this.particles.push(new Particle(
        x, y, color,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed - 2,
        size, life
      ));
    }
  }

  spawnText(x, y, text, color = '#ffe04b') {
    // Text popups handled by ScorePopup in entities.js
  }

  update() {
    for (const p of this.particles) p.update();
    this.particles = this.particles.filter(p => !p.dead);
  }

  draw(ctx, camX) {
    for (const p of this.particles) p.draw(ctx, camX);
  }

  clear() { this.particles = []; }
}
