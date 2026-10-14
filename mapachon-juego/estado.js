// ─── ESTADO DE JUEGO ─────────────────────────────────────────────────────────
let currentRoom = 0;
let transitioning = false;
let transAlpha = 0;           // 0 = transparente, 1 = negro total
let transPhase = 'none';      // 'fade-out' | 'black' | 'fade-in'
let transBlackFrames = 0;
let pendingRoom = null;
let pendingPos  = null;
let roomLabelAlpha = 0;
let roomLabelTimer = 0;
let isDeath = false;
let showInventory = false;
let cheatState = 'closed'; // 'closed' | 'input' | 'map' | 'zone' (lista de salas de una zona)
let cheatZone = 0;
let cheatCode  = '';
let cheatError = 0;
let godMode    = false;
let gridMode   = false; // código 1111: rejilla de coordenadas sobre la sala
let money      = 0;
let richMode   = false; // código 0614: invencible + mapesos infinitos
let moneyBeforeRich = 0;
const fmtMoney = m => m === Infinity ? '∞' : m;
const moneyPops = []; // textos flotantes "+N"

const MONEY_ENEMY = 3, MONEY_BOSS = 20;
// Alma (como la sombra de Hollow Knight): guarda tus mapesos al morir
let shade = null;      // { room, x, y, money, bob }
let lastGround = null; // última posición pisando suelo { room, x, y }
function addMoney(amount, x, y) {
  money += amount;
  moneyPops.push({ x, y, text: '+' + amount, t: 60 });
}
let currentEnemies = [];
const jumpPuffs = []; // nubecitas del doble salto
let camX = 0, camY = 0, camZ = 1; // cámara (solo en salas grandes): posición y zoom
let camRoom = -1;
// Temblor de pantalla (golpes fuertes de los jefes)
let shakeTimer = 0, shakeMag = 0;
function shake(frames, mag) { shakeTimer = Math.max(shakeTimer, frames); shakeMag = Math.max(shakeMag, mag); }
// Pantalla de capítulo (al empezar y al llegar por primera vez a La Cumbre)
const CHAPTER_DUR = 330;
const CHAPTER_INTRO = 150; // "Nuevo capítulo" antes del título (capítulo II en adelante)
let chapterDur = CHAPTER_DUR;
let visitedRooms = new Set([0]);
let chapterShown = false; // capítulo de La Cumbre ya visto
let chapterTimer = 0;
let chapterText  = { label: '', title: '' };
function toRoman(n) {
  const R = [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],
             [50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
  let out = '';
  for (const [v, r] of R) while (n >= v) { out += r; n -= v; }
  return out;
}
function showChapter(num, title) {
  const intro  = num > 1;
  chapterText  = { label: 'C A P Í T U L O   ' + toRoman(num), title, intro };
  chapterDur   = CHAPTER_DUR + (intro ? CHAPTER_INTRO : 0);
  chapterTimer = chapterDur;
}

// ─── JEFE ─────────────────────────────────────────────────────────────────────
let bossDefeated  = false;
let bossAttackIdx = 0;
const BOSS_FLOOR_Y = 424; // 480 - 56

const boss = {
  x: 440, y: BOSS_FLOOR_Y,
  w: 72,  h: 56,
  vx: 0,  vy: 0,
  hp: 10, maxHp: 10,
  state: 'wait', stateTimer: 90,
  phase: 1,
  invFrames: 0,
  facing: -1,
  dead: false, deathTimer: 0,
  projectiles: [],
};

// ─── LLAVE ────────────────────────────────────────────────────────────────────
let hasKey  = false;
let keyUsed = false;
const keyItem = { x: 0, y: 0, active: false, bobTimer: 0 };

// ─── JEFE 2 ───────────────────────────────────────────────────────────────────
let boss2Defeated  = false;
let boss2AttackIdx = 0;
const BOSS2_HOVER_Y = 105;

const boss2 = {
  x: 440, y: BOSS2_HOVER_Y,
  w: 78,  h: 62,
  vx: 0,  vy: 0,
  hp: 12, maxHp: 12,
  state: 'hover', stateTimer: 90,
  swoopPhase: 'down',
  phase: 1,
  invFrames: 0,
  facing: 1,
  dead: false, deathTimer: 0,
  projectiles: [],
};

function startTransition(roomId, px, py) {
  if (transitioning) return;
  transitioning = true;
  transPhase = 'fade-out';
  transAlpha = 0;
  pendingRoom = roomId;
  pendingPos  = { x: px, y: py };
}

// ─── COLISIÓN ─────────────────────────────────────────────────────────────────
function collideRect(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function resolveCollisions() {
  const plats = ROOMS[currentRoom].platforms;
  player.onGround = false;

  // Escalones (plataformas finas): se atraviesan desde abajo y los lados
  const oneWay = p => p.h <= 18;

  // X primero
  player.x += player.vx;
  for (const p of plats) {
    if (p.trapdoor && boss2Defeated) continue;
    if (p.door && castleDoorOpen) continue;
    if (p.breakable && brokenWalls.has(p.breakable)) continue;
    if (oneWay(p)) continue;
    if (collideRect(player.x, player.y, player.w, player.h, p.x, p.y, p.w, p.h)) {
      if (player.vx > 0) player.x = p.x - player.w;
      if (player.vx < 0) player.x = p.x + p.w;
      player.vx = 0;
    }
  }

  // Y después
  const prevBottom = player.y + player.h;
  player.y += player.vy;
  for (const p of plats) {
    if (p.trapdoor && boss2Defeated) continue;
    if (p.door && castleDoorOpen) continue;
    if (p.breakable && brokenWalls.has(p.breakable)) continue;
    if (p.secretStair && !bossDefeated) continue;
    // Escalón: solo se apoya si caes y venías desde encima
    if (oneWay(p) && (player.vy < 0 || prevBottom > p.y)) continue;
    if (collideRect(player.x, player.y, player.w, player.h, p.x, p.y, p.w, p.h)) {
      if (player.vy > 0) {
        player.y = p.y - player.h;
        player.onGround = true;
        lastGround = { room: currentRoom, x: player.x, y: player.y };
      } else {
        player.y = p.y + p.h;
      }
      player.vy = 0;
    }
  }
}
