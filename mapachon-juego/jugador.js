// ─── PARTÍCULAS ───────────────────────────────────────────────────────────────
const MAX_PARTICLES = 35;
let particles = [];

function resetParticles(roomId) {
  particles = [];
  const col = ROOMS[roomId].particleColor;
  for (let i = 0; i < MAX_PARTICLES; i++) {
    particles.push(makeParticle(col, true));
  }
}

function makeParticle(col, randomY = false) {
  return {
    x: Math.random() * W,
    y: randomY ? Math.random() * H : H + 10,
    vy: -(Math.random() * 0.4 + 0.1),
    vx: (Math.random() - 0.5) * 0.15,
    size: Math.random() * 2.5 + 0.5,
    alpha: Math.random() * 0.6 + 0.1,
    col,
  };
}

function updateParticles(roomId) {
  const col = ROOMS[roomId].particleColor;
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.y < -5) {
      Object.assign(p, makeParticle(col));
    }
  }
}

// ─── JUGADOR ─────────────────────────────────────────────────────────────────
const player = {
  x: 80, y: 400,
  w: 26, h: 38,
  vx: 0, vy: 0,
  onGround: false,
  facing: 1,
  coyoteTime: 0,
  jumpBuffered: false,
  bobTimer: 0,
  hp: 5,
  maxHp: 5,
  invFrames: 0,
  knockbackTimer: 0,
  attackTimer: 0,
  attackActive: 0,
  healTimer: 0,
};

const GRAVITY    = 0.55;
const MOVE_SPD   = 4.5;
const JUMP_V     = -13.5;
const MAX_FALL   = 18;
const COYOTE_MAX = 8;
const FRICTION   = 0.82;
// Corta distancia (cuerpo a cuerpo)
let playerDmg   = 1;
let weaponName  = 'Garras';
let weaponColor = '#40c8ff';
// Larga distancia (null = ninguna; se compra en la armería)
let ranged = null; // { name, color, damage, speed, cooldown }
let rangedTimer = 0;
const playerShots = [];
