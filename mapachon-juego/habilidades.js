// ─── HABILIDADES DE LOS BICHOS ───────────────────────────────────────────────
// Además de hacer daño al tocarlos, en algunas salas los bichos tienen una
// habilidad propia. Antes de usarla se paran y avisan con un "!" (y parpadean).
// No hay habilidades en el inicio (salas 0 y 14) ni en las salas de antes de un
// jefe (20, 21 antes del Rey; 22, 23 antes del Guardián; 36, 37 antes de los
// Guardias), ni en las salas de jefes o el Pasaje de las Púas.
//   shoot: dispara en línea recta hacia ti · lob: lanza algo en arco
//   hop: salta hacia ti · dash: embiste · tongue: lengüetazo de lejos
//   cloud: suelta una nube de esporas · burrow: se entierra y sale bajo tus pies
//   swoop: se lanza en picada (voladores) · blink: se desvanece y aparece a tu lado
// shot: web enreda (te hace lento, no quita vida); gust empuja (no quita vida)
const ROOM_ABILITY = {
  15: { type: 'shoot', shot: 'echo',    range: 420, cd: 160, windup: 30, speed: 3.2 },
  1:  { type: 'lob',   shot: 'crystal', range: 360, cd: 170, windup: 32 },
  16: { type: 'shoot', shot: 'needle',  range: 380, cd: 150, windup: 26, speed: 5 },
  17: { type: 'hop',   range: 260, cd: 110, windup: 22, hopV: 9 },
  2:  { type: 'cloud', range: 120, cd: 210, windup: 30 },
  18: { type: 'burrow', range: 380, cd: 200 },
  19: { type: 'tongue', range: 120, cd: 120, windup: 24 },
  24: { type: 'lob',   shot: 'ember',   range: 400, cd: 150, windup: 30 },
  25: { type: 'hop',   range: 300, cd: 100, windup: 20, hopV: 10 },
  26: { type: 'shoot', shot: 'web',     range: 380, cd: 170, windup: 28, speed: 4 },
  27: { type: 'dash',  range: 300, cd: 130, windup: 24, dashSpd: 7 },
  6:  { type: 'swoop', range: 300, cd: 160, windup: 26 },
  28: { type: 'lob',   shot: 'snow',    range: 400, cd: 150, windup: 30 },
  29: { type: 'dash',  range: 320, cd: 120, windup: 22, dashSpd: 8 },
  30: { type: 'hop',   range: 300, cd: 90,  windup: 16, hopV: 11 },
  31: { type: 'shoot', shot: 'web',     range: 380, cd: 170, windup: 28, speed: 4, frost: true },
  9:  { type: 'blink', range: 360, cd: 220, windup: 30 },
  32: { type: 'shoot', shot: 'gust',    range: 420, cd: 160, windup: 26, speed: 5 },
  33: { type: 'hop',   range: 260, cd: 110, windup: 22, hopV: 9 },
  10: { type: 'shoot', shot: 'shadow',  range: 400, cd: 140, windup: 28, speed: 4 },
  34: { type: 'burrow', range: 380, cd: 200 },
  35: { type: 'tongue', range: 120, cd: 120, windup: 24 },
  11: { type: 'dash',  range: 340, cd: 120, windup: 22, dashSpd: 9 },
  38: { type: 'lob',   shot: 'bone',    range: 400, cd: 140, windup: 26 },
};
const enemyShots = [];   // { x, y, vx, vy, g, r, shot, life, frost, spin }
const sporeClouds = [];  // { x, y, r, t }
const SHOT_HARMLESS = { web: true, gust: true };
const LOB_G = 0.25, LOB_T = 50;

function resetAbilities() {
  enemyShots.length = 0; sporeClouds.length = 0; playerSlow = 0;
  const A = ROOM_ABILITY[currentRoom];
  for (const e of currentEnemies) {
    e.ab = A && !e.bouncy ? { st: 'idle', t: 0, cd: 40 + Math.floor(Math.random() * A.cd) } : null;
    e.busy = false; e.windup = 0; e.hidden = false; e.alpha = 1; e.ghost = false;
  }
}

// Daño al jugador por una habilidad (igual que al chocar con un bicho)
function hurtPlayer(fromX) {
  if (player.invFrames > 0) return;
  if (!godMode) {
    player.hp--;
    if (player.hp <= 0) { player.hp = 0; isDeath = true; respawnAtBench(); return; }
  }
  player.invFrames = 90;
  player.knockbackTimer = 14;
  player.vx = (player.x + player.w / 2 < fromX ? -1 : 1) * 6;
  player.vy = -7;
}

// ¿hay roca en (x, y)? (thin: también cuentan las plataformas finas)
function inSolid(x, y, thin) {
  return ROOMS[currentRoom].platforms.some(p => (thin || p.h > 18) &&
    !(p.trapdoor && boss2Defeated) && !(p.door && castleDoorOpen) && !(p.breakable && brokenWalls.has(p.breakable)) &&
    x > p.x && x < p.x + p.w && y > p.y && y < p.y + p.h);
}
const clampPatrol = (e, x) => Math.max(e.patrolMin, Math.min(e.patrolMax - e.w, x));
const flyOff = e => (e.spec && e.spec.fly ? 14 : 0);

function updateEnemyAbilities() {
  if (playerSlow > 0) playerSlow--;
  const A = ROOM_ABILITY[currentRoom];
  const pcx = player.x + player.w / 2, pcy = player.y + player.h / 2;
  if (A) for (const e of currentEnemies) {
    const ab = e.ab;
    if (!ab) continue;
    if (e.dead) { e.busy = false; e.windup = 0; e.hidden = false; e.alpha = 1; e.ghost = false; continue; }
    if (!e.awake || e.wake > 0) continue;
    const ex = e.x + e.w / 2, ey = e.y + e.h / 2 - flyOff(e);
    const dx = pcx - ex, dy = pcy - ey;
    if (ab.st === 'idle') {
      if (ab.cd > 0) { ab.cd--; continue; }
      const sameFloor = Math.abs(dy) < 60;
      const near = Math.abs(dx) < A.range && Math.abs(dy) < (['hop', 'dash', 'tongue', 'burrow'].includes(A.type) ? 60 : 220);
      if (!near || (A.type === 'tongue' && !sameFloor)) continue;
      e.dir = dx < 0 ? -1 : 1;
      e.busy = true;
      if (A.type === 'burrow') { ab.st = 'down'; ab.t = 20; }
      else { ab.st = 'windup'; ab.t = A.windup; e.windup = A.windup; }
      continue;
    }
    if (ab.st === 'windup') {
      e.windup = --ab.t;
      if (ab.t > 0) continue;
      startAbility(e, ab, A, ex, ey, dx, dy);
      continue;
    }
    runAbility(e, ab, A, pcx, pcy);
  }
  updateShots();
  updateClouds();
}

function finish(e, ab, A) { ab.st = 'idle'; ab.cd = A.cd; e.busy = false; e.windup = 0; }

function startAbility(e, ab, A, ex, ey, dx, dy) {
  if (A.type === 'shoot') {
    const d = Math.hypot(dx, dy) || 1;
    enemyShots.push({ x: ex + e.dir * 10, y: ey, vx: dx / d * A.speed, vy: dy / d * A.speed, g: 0, r: A.shot === 'echo' ? 12 : 7,
      shot: A.shot, life: 200, frost: A.frost, spin: 0 });
    finish(e, ab, A);
  } else if (A.type === 'lob') {
    const vx = Math.max(-6, Math.min(6, dx / LOB_T));
    const vy = Math.max(-10, (dy - 0.5 * LOB_G * LOB_T * LOB_T) / LOB_T);
    enemyShots.push({ x: ex, y: ey - 8, vx, vy, g: LOB_G, r: 7, shot: A.shot, life: 240, spin: 0 });
    finish(e, ab, A);
  } else if (A.type === 'hop') {
    ab.st = 'act'; ab.baseY = e.y; ab.vy = -A.hopV; ab.vx = Math.sign(dx) * 3;
  } else if (A.type === 'dash') {
    ab.st = 'act'; ab.t = 40;
  } else if (A.type === 'tongue') {
    ab.st = 'act'; ab.t = 26;
  } else if (A.type === 'cloud') {
    sporeClouds.push({ x: ex, y: ey - 6, r: 56, t: 170 });
    finish(e, ab, A);
  } else if (A.type === 'swoop') {
    // en picada hasta donde estás y de regreso; si hay roca en medio, no lo intenta
    const tx = player.x + player.w / 2 - e.w / 2, ty = player.y + player.h / 2 - e.h / 2 + flyOff(e);
    for (let k = 0.1; k <= 1; k += 0.1) {
      if (inSolid(e.x + e.w / 2 + (tx - e.x) * k, e.y + e.h / 2 + (ty - e.y) * k - flyOff(e))) { finish(e, ab, A); return; }
    }
    ab.st = 'act'; ab.t = 0; ab.x0 = e.x; ab.y0 = e.y; ab.tx = tx; ab.ty = ty;
  } else if (A.type === 'blink') {
    ab.st = 'act'; ab.t = 0;
  }
}

function runAbility(e, ab, A, pcx, pcy) {
  if (A.type === 'hop') {
    ab.vy += 0.5; e.y += ab.vy;
    e.x = clampPatrol(e, e.x + ab.vx);
    if (e.y >= ab.baseY) { e.y = ab.baseY; finish(e, ab, A); }
  } else if (A.type === 'dash') {
    const nx = clampPatrol(e, e.x + e.dir * A.dashSpd);
    if (nx === e.x || --ab.t <= 0) { finish(e, ab, A); return; }
    e.x = nx;
    if (ab.t % 4 === 0) jumpPuffs.push({ x: e.x + e.w / 2 - e.dir * 12, y: e.y + e.h, t: 12 });
  } else if (A.type === 'tongue') {
    ab.t--;
    const k = ab.t > 13 ? (26 - ab.t) / 13 : ab.t / 13;   // sale y regresa
    ab.len = A.range * k;
    const tx = e.dir > 0 ? e.x + e.w : e.x - ab.len, ty = e.y + 6;
    if (ab.len > 10 && collideRect(player.x + 3, player.y + 3, player.w - 6, player.h - 3, tx, ty, ab.len, 8)) hurtPlayer(e.x + e.w / 2);
    if (ab.t <= 0) { ab.len = 0; finish(e, ab, A); }
  } else if (A.type === 'swoop') {
    ab.t++;
    const k = ab.t <= 28 ? ab.t / 28 : 2 - ab.t / 28, s = k * k * (3 - 2 * k);
    e.x = ab.x0 + (ab.tx - ab.x0) * s; e.y = ab.y0 + (ab.ty - ab.y0) * s;
    if (ab.t >= 56) { e.x = ab.x0; e.y = ab.y0; finish(e, ab, A); }
  } else if (A.type === 'blink') {
    ab.t++;
    if (ab.t <= 20) e.alpha = 1 - ab.t / 20;
    else if (ab.t === 21) e.x = clampPatrol(e, pcx - e.w / 2 + (Math.random() < 0.5 ? -1 : 1) * 90);
    else e.alpha = Math.min(1, (ab.t - 21) / 20);
    e.ghost = e.alpha < 0.6;
    if (ab.t >= 42) { e.alpha = 1; e.ghost = false; finish(e, ab, A); }
  } else if (A.type === 'burrow') {
    ab.t--;
    if (ab.st === 'down') {
      e.hidden = ab.t < 8;
      if (ab.t <= 0) { ab.st = 'under'; ab.t = 50; }
    } else if (ab.st === 'under') {
      // un montoncito de tierra te sigue por debajo
      const goal = clampPatrol(e, pcx - e.w / 2);
      e.x += Math.max(-4, Math.min(4, goal - e.x));
      if (ab.t <= 0) { ab.st = 'up'; ab.t = 18; e.hidden = false; }
    } else if (ab.t <= 0) finish(e, ab, A);
  }
}

function updateShots() {
  for (let i = enemyShots.length - 1; i >= 0; i--) {
    const s = enemyShots[i];
    s.x += s.vx; s.y += s.vy; s.vy += s.g; s.spin += 0.25;
    if (s.shot === 'echo') s.r = Math.min(22, s.r + 0.05);
    let gone = --s.life <= 0 || inSolid(s.x, s.y, s.g > 0 && s.vy > 0) || s.y > H + 200;
    // tu ataque los deshace (menos el viento)
    if (!gone && player.attackActive > 0 && s.shot !== 'gust') {
      const ax = player.facing === 1 ? player.x + player.w : player.x - 52;
      if (s.x > ax - s.r && s.x < ax + 52 + s.r && s.y > player.y && s.y < player.y + 40) gone = true;
    }
    if (!gone && player.invFrames === 0 && collideRect(player.x + 3, player.y + 3, player.w - 6, player.h - 3, s.x - s.r * 0.7, s.y - s.r * 0.7, s.r * 1.4, s.r * 1.4)) {
      gone = true;
      if (s.shot === 'web') playerSlow = 150;
      else if (s.shot === 'gust') { player.vx = Math.sign(s.vx || 1) * 9; player.vy = -4; player.knockbackTimer = 12; }
      else hurtPlayer(s.x - s.vx * 5);
    }
    if (gone) enemyShots.splice(i, 1);
  }
}

function updateClouds() {
  for (let i = sporeClouds.length - 1; i >= 0; i--) {
    const c = sporeClouds[i];
    if (--c.t <= 0) { sporeClouds.splice(i, 1); continue; }
    // tarda un poco en ser venenosa (da tiempo de alejarse)
    if (c.t < 145 && player.invFrames === 0) {
      const nx = Math.max(player.x, Math.min(c.x, player.x + player.w)), ny = Math.max(player.y, Math.min(c.y, player.y + player.h));
      if (Math.hypot(nx - c.x, ny - c.y) < c.r * 0.75) hurtPlayer(c.x);
    }
  }
}

// ── Dibujo ────────────────────────────────────────────────────────────────────
function drawEnemyAbilities() {
  const t = Date.now() * 0.001;
  for (const c of sporeClouds) {
    const armed = c.t < 145, a = Math.min(1, c.t / 30) * (armed ? 0.55 : 0.3);
    for (let i = 0; i < 7; i++) {
      const ang = i / 7 * Math.PI * 2 + t * 0.6, d = c.r * 0.45;
      const x = c.x + Math.cos(ang) * d, y = c.y + Math.sin(ang) * d * 0.6 - (170 - c.t) * 0.08;
      ctx.fillStyle = `rgba(${armed ? '150,200,70' : '200,220,150'},${a.toFixed(2)})`;
      ctx.beginPath(); ctx.arc(x, y, c.r * 0.42, 0, Math.PI * 2); ctx.fill();
    }
  }
  for (const s of enemyShots) drawEnemyShot(s, t);
  for (const e of currentEnemies) {
    if (e.dead || !e.ab) continue;
    const ab = e.ab, cx = e.x + e.w / 2, top = e.y - flyOff(e);
    if (e.windup > 0 && Math.floor(e.windup / 4) % 2 === 0) {
      ctx.save();
      ctx.fillStyle = '#ffe040'; ctx.shadowColor = '#ff8000'; ctx.shadowBlur = 8;
      ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText('!', cx, top - 14);
      ctx.restore();
    }
    if (ab.len > 0) { // lengüetazo
      const x0 = e.dir > 0 ? e.x + e.w - 4 : e.x + 4, x1 = x0 + e.dir * ab.len, y = e.y + 10;
      ctx.strokeStyle = '#e05a7a'; ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
      ctx.fillStyle = '#ff8aa8'; ctx.beginPath(); ctx.arc(x1, y, 5, 0, Math.PI * 2); ctx.fill();
    }
    if (ab.st === 'down' || ab.st === 'under' || ab.st === 'up') { // tierra que se mueve
      const gy = e.y + e.h, n = ab.st === 'under' ? 5 : 8;
      for (let i = 0; i < n; i++) {
        const k = (t * 3 + i / n) % 1;
        ctx.fillStyle = i % 2 ? '#6a4a2a' : '#3a2814';
        ctx.beginPath(); ctx.arc(cx + Math.sin(i * 2.3 + t * 9) * 14, gy - k * (ab.st === 'under' ? 8 : 20), 2.2, 0, Math.PI * 2); ctx.fill();
      }
      if (ab.st === 'under') {
        ctx.fillStyle = '#4a3420';
        ctx.beginPath(); ctx.ellipse(cx, gy, 16, 5, 0, Math.PI, 0); ctx.fill();
      }
    }
  }
}

function drawEnemyShot(s, t) {
  ctx.save();
  ctx.translate(s.x, s.y);
  switch (s.shot) {
    case 'echo': {
      const a = Math.atan2(s.vy, s.vx);
      ctx.rotate(a);
      for (let k = 0; k < 3; k++) {
        ctx.strokeStyle = `rgba(160,160,255,${(0.8 - k * 0.25).toFixed(2)})`; ctx.lineWidth = 3 - k * 0.7;
        ctx.beginPath(); ctx.arc(-k * 7, 0, s.r - k * 3, -0.9, 0.9); ctx.stroke();
      }
      break;
    }
    case 'crystal': case 'needle': {
      ctx.rotate(s.shot === 'needle' ? Math.atan2(s.vy, s.vx) : s.spin);
      ctx.shadowColor = '#60ffe0'; ctx.shadowBlur = 8;
      ctx.fillStyle = '#c8fff4';
      ctx.beginPath();
      if (s.shot === 'needle') { ctx.moveTo(10, 0); ctx.lineTo(-8, -2.5); ctx.lineTo(-8, 2.5); }
      else { ctx.moveTo(0, -8); ctx.lineTo(5, 0); ctx.lineTo(0, 8); ctx.lineTo(-5, 0); }
      ctx.closePath(); ctx.fill();
      break;
    }
    case 'web': {
      ctx.rotate(s.spin * 0.5);
      ctx.strokeStyle = s.frost ? 'rgba(200,235,255,0.95)' : 'rgba(240,240,240,0.9)'; ctx.lineWidth = 1.2;
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 9, Math.sin(a) * 9); ctx.stroke(); }
      for (const r of [3.5, 7]) { ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke(); }
      break;
    }
    case 'ember': case 'shadow': case 'snow': {
      const C = { ember: ['#fff0a0', '#ff6a10', 'rgba(255,120,20,'], shadow: ['#c8a0ff', '#2a0a4a', 'rgba(120,60,200,'], snow: ['#ffffff', '#a8c8e8', 'rgba(220,240,255,'] }[s.shot];
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 16);
      g.addColorStop(0, C[2] + '0.6)'); g.addColorStop(1, C[2] + '0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = vol(0, 0, 7, C[0], C[1]);
      ctx.beginPath(); ctx.arc(0, 0, 6.5, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'gust': {
      ctx.strokeStyle = 'rgba(230,245,255,0.7)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
      for (let k = 0; k < 3; k++) {
        ctx.beginPath(); ctx.arc(-Math.sign(s.vx) * k * 6, (k - 1) * 6, 8, s.spin + k, s.spin + k + 3.6); ctx.stroke();
      }
      break;
    }
    case 'bone': {
      ctx.rotate(s.spin);
      ctx.fillStyle = '#f0e8d4'; ctx.strokeStyle = '#8a8070'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(-8, -2, 16, 4, 2); ctx.fill(); ctx.stroke();
      for (const x of [-8, 8]) for (const y of [-2.5, 2.5]) { ctx.beginPath(); ctx.arc(x, y, 2.6, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
      break;
    }
  }
  ctx.restore();
}

// Enredado en telaraña: hilos encima del jugador mientras va lento
function drawPlayerWeb() {
  if (playerSlow <= 0) return;
  const cx = player.x + player.w / 2, cy = player.y + player.h / 2;
  ctx.save();
  ctx.globalAlpha = Math.min(1, playerSlow / 30) * 0.85;
  ctx.strokeStyle = ROOM_ABILITY[currentRoom] && ROOM_ABILITY[currentRoom].frost ? '#d8f0ff' : '#f0f0f0';
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    const a = i * 1.3;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * 18, cy + Math.sin(a) * 22);
    ctx.quadraticCurveTo(cx, cy, cx - Math.cos(a + 0.8) * 18, cy - Math.sin(a + 0.8) * 22);
    ctx.stroke();
  }
  ctx.restore();
}
