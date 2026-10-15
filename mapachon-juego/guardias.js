// ─── JEFES: LOS DOS GUARDIAS DEL CASTILLO ────────────────────────────────────
// Guardia del Escudo: embiste, se cubre con el escudo (de frente no le haces daño)
// y salta aplastando el suelo. Guardia de la Alabarda: estocada larga, giro y
// lanza la hoja como un bumerán. Si cae uno, el otro se enfurece.
const GUARD_FLOOR = 480;
let guardsDefeated = false;
const guards = [
  { kind: 'shield',  name: 'Guardia del Escudo' },
  { kind: 'halberd', name: 'Guardia de la Alabarda' },
];
const guardProjectiles = [];

function initGuards() {
  guards.forEach((g, i) => Object.assign(g, {
    x: i === 0 ? 170 : 740, y: GUARD_FLOOR - 70, w: 46, h: 70, vx: 0, vy: 0,
    hp: 12, maxHp: 12, state: 'intro', stateTimer: 90 + i * 40, facing: i === 0 ? 1 : -1,
    invFrames: 0, dead: false, deathTimer: 0, paid: false, windNext: null, atkIdx: 0,
    blockFlash: 0, headOut: false, spin: 0,
  }));
  guardProjectiles.length = 0;
}

const GUARD_ACTIVE = ['bash', 'jump', 'thrust', 'spin', 'block', 'windup'];
function guardHit(g, dmg, inv) {
  g.hp -= dmg; g.invFrames = inv;
  if (g.hp <= 0) { g.hp = 0; g.dead = true; g.deathTimer = 120; shake(18, 4); }
}

function updateGuards() {
  if (currentRoom !== 13) return;
  const pcx = player.x + player.w / 2;

  // Proyectiles: ondas del aplastamiento y la hoja-bumerán
  for (const p of guardProjectiles) {
    p.life--;
    if (p.type === 'wave') p.x += p.vx;
    else if (p.type === 'blade') {
      // sale en línea recta hacia donde estabas, frena y vuelve a la mano
      const o = p.owner, hx = o.x + o.w / 2, hy = o.y + 26;
      p.s -= p.dec; p.spin += 0.35;
      if (p.s > 0) { p.x += p.dx * p.s; p.y += p.dy * p.s; }
      else {
        const len = Math.hypot(hx - p.x, hy - p.y) || 1, sp = Math.min(10, 2 - p.s);
        p.x += (hx - p.x) / len * sp; p.y += (hy - p.y) / len * sp;
        if (len < 24) { p.life = 0; o.headOut = false; }
      }
      if (o.dead) { p.life = 0; o.headOut = false; }
    }
  }
  for (let i = guardProjectiles.length - 1; i >= 0; i--) {
    const p = guardProjectiles[i];
    if (p.life <= 0 || p.x < -40 || p.x > W + 40) {
      if (p.type === 'blade') p.owner.headOut = false;
      guardProjectiles.splice(i, 1);
    }
  }

  for (const g of guards) {
    const other = guards[0] === g ? guards[1] : guards[0];
    if (g.dead) {
      if (g.deathTimer > 0) g.deathTimer--;
      else if (!g.paid) { g.paid = true; addMoney(MONEY_BOSS, g.x + g.w / 2, g.y); dropGuardKey(g); }
      continue;
    }
    if (g.invFrames > 0) g.invFrames--;
    if (g.blockFlash > 0) g.blockFlash--;
    const angry = other.dead;
    const gcx = g.x + g.w / 2;

    // gravedad
    g.vy += 0.6; g.y += g.vy;
    if (g.y + g.h >= GUARD_FLOOR) {
      g.y = GUARD_FLOOR - g.h;
      if (g.vy > 2 && g.state === 'jump') {
        shake(14, 4);
        for (const dir of [-1, 1]) guardProjectiles.push({ type: 'wave', x: gcx + dir * 26, y: GUARD_FLOOR - 12, vx: dir * (angry ? 5.5 : 4.5), r: 12, life: 130 });
        g.state = 'recover'; g.stateTimer = 40; g.vx = 0;
      }
      g.vy = 0;
    }

    g.stateTimer--;
    switch (g.state) {
      case 'intro':
        g.facing = pcx > gcx ? 1 : -1;
        if (g.stateTimer <= 0) { g.state = 'walk'; g.stateTimer = 40; }
        break;
      case 'walk': {
        g.facing = pcx > gcx ? 1 : -1;
        const dist = Math.abs(pcx - gcx), keep = g.kind === 'halberd' ? 150 : 40;
        const sp = angry ? 1.9 : 1.3;
        g.vx = dist > keep + 20 ? g.facing * sp : dist < keep - 20 ? -g.facing * sp * 0.7 : 0;
        if (g.stateTimer <= 0) {
          // no atacan los dos a la vez
          if (GUARD_ACTIVE.includes(other.state) && !other.dead) { g.stateTimer = 20; break; }
          const list = g.kind === 'shield' ? ['bash', 'block', 'jump'] : ['thrust', 'throw', 'spin'];
          g.windNext = list[g.atkIdx++ % list.length];
          if (g.windNext === 'throw' && g.headOut) g.windNext = 'thrust';
          g.state = 'windup'; g.stateTimer = angry ? 20 : 30; g.vx = 0;
        }
        break;
      }
      case 'windup':
        g.vx = 0; g.facing = pcx > gcx ? 1 : -1;
        if (g.stateTimer <= 0) startGuardAttack(g, angry);
        break;
      case 'bash':
      case 'thrust':
        if (g.stateTimer <= 0) { g.stateTimer = g.state === 'thrust' ? 45 : 40; g.state = 'recover'; g.vx = 0; }
        break;
      case 'block':
        g.vx = 0; g.facing = pcx > gcx ? 1 : -1;
        if (g.stateTimer <= 0) { g.state = 'recover'; g.stateTimer = 20; }
        break;
      case 'spin':
        g.spin += 0.45;
        g.vx = (pcx > gcx ? 1 : -1) * (angry ? 2.2 : 1.5);
        if (g.stateTimer <= 0) { g.state = 'recover'; g.stateTimer = 55; g.vx = 0; }
        break;
      case 'jump':
        break; // aterriza arriba
      case 'recover':
        g.vx *= 0.85;
        if (g.stateTimer <= 0) { g.state = 'walk'; g.stateTimer = angry ? 35 : 65; }
        break;
    }
    g.x += g.vx;
    if (g.x < 20) { g.x = 20; if (g.state === 'bash') g.stateTimer = 0; }
    if (g.x + g.w > W - 20) { g.x = W - 20 - g.w; if (g.state === 'bash') g.stateTimer = 0; }
  }

  if (!guardsDefeated && guards.every(g => g.dead && g.deathTimer <= 0)) guardsDefeated = true;
}

function startGuardAttack(g, angry) {
  const pcx = player.x + player.w / 2, gcx = g.x + g.w / 2;
  g.state = g.windNext;
  if (g.state === 'bash')   { g.vx = g.facing * (angry ? 9 : 7.5); g.stateTimer = 45; }
  if (g.state === 'block')  { g.stateTimer = angry ? 70 : 100; }
  if (g.state === 'jump')   { g.vy = -12 - Math.min(4, Math.max(0, (g.y - player.y) / 60)); g.y -= 1; g.vx = Math.max(-5, Math.min(5, (pcx - gcx) / 40)); }
  if (g.state === 'thrust') { g.vx = g.facing * (angry ? 9 : 8); g.stateTimer = 18; }
  if (g.state === 'spin')   { g.stateTimer = angry ? 90 : 70; }
  if (g.state === 'throw') {
    g.headOut = true;
    const bx = gcx + g.facing * 30, by = g.y + 26;
    const ddx = pcx - bx, ddy = (player.y + player.h / 2) - by, dl = Math.hypot(ddx, ddy) || 1;
    const s0 = angry ? 9 : 8;
    // frena justo un poco más allá de donde estabas
    guardProjectiles.push({ type: 'blade', x: bx, y: by, dx: ddx / dl, dy: ddy / dl, s: s0,
      dec: Math.max(0.09, s0 * s0 / (2 * (dl + 70))),
      r: 14, life: 260, spin: 0, owner: g });
    g.state = 'recover'; g.stateTimer = 50;
  }
}

// Zona de daño del arma durante la estocada y el giro
function guardWeaponHit(g) {
  const pcx = player.x + player.w / 2, pcy = player.y + player.h / 2;
  if (g.state === 'thrust') {
    const hx = g.facing > 0 ? g.x + g.w : g.x - 60;
    return collideRect(player.x, player.y, player.w, player.h, hx, g.y + 24, 60, 16);
  }
  if (g.state === 'spin') return Math.hypot(pcx - (g.x + g.w / 2), pcy - (g.y + g.h / 2)) < 64;
  return false;
}

function checkGuardCollisions() {
  if (currentRoom !== 13) return;
  const atkW = 52, atkH = 30;
  const atkX = player.facing === 1 ? player.x + player.w : player.x - atkW;
  const atkY = player.y + 6;
  const hurt = (kx, inv) => {
    if (!godMode) {
      player.hp--;
      if (player.hp <= 0) { player.hp = 0; isDeath = true; respawnAtBench(); return true; }
    }
    player.invFrames = inv; player.vx = kx; player.vy = -7;
    return false;
  };

  for (const g of guards) {
    if (g.dead || g.state === 'intro') continue;
    const gcx = g.x + g.w / 2, pcx = player.x + player.w / 2;
    const front = Math.sign(pcx - gcx) === g.facing;
    const blocking = g.kind === 'shield' && g.state === 'block';

    if (player.attackActive > 0 && g.invFrames === 0 &&
        collideRect(atkX, atkY, atkW, atkH, g.x, g.y, g.w, g.h)) {
      if (blocking && front) {
        g.blockFlash = 12; g.invFrames = 12;
        player.vx = pcx < gcx ? -6 : 6; // el escudo te rechaza
      } else { guardHit(g, playerDmg, 24); if (g.dead) continue; }
    }
    const onG = collideRect(player.x, player.y, player.w, player.h, g.x, g.y, g.w, g.h);
    const fromTop = player.vy > 1 && (player.y + player.h) < (g.y + g.h * 0.4);
    if (onG && fromTop && g.invFrames === 0) { guardHit(g, playerDmg, 24); player.vy = -11; if (g.dead) continue; }

    if (player.invFrames === 0 && !fromTop &&
        (guardWeaponHit(g) || collideRect(player.x + 3, player.y + 3, player.w - 6, player.h - 3, g.x + 6, g.y + 6, g.w - 12, g.h - 6))) {
      if (hurt(pcx < gcx ? -7 : 7, 90)) return;
    }
  }

  for (let i = guardProjectiles.length - 1; i >= 0; i--) {
    const p = guardProjectiles[i];
    if (p.type === 'blade' && player.attackActive > 0 &&
        collideRect(atkX, atkY, atkW, atkH, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2)) {
      p.s = Math.min(p.s, 0); // de un golpe la mandas de vuelta
      continue;
    }
    const dist = Math.hypot((player.x + player.w / 2) - p.x, (player.y + player.h / 2) - p.y);
    if (dist < p.r + 12 && player.invFrames === 0) {
      if (p.type === 'wave') guardProjectiles.splice(i, 1);
      if (hurt(player.x < p.x ? -5 : 5, 70)) return;
    }
  }
}

// Disparo del jugador contra un guardia; devuelve true si choca
function guardShot(sx, sy, sd, s) {
  for (const g of guards) {
    if (g.dead || g.state === 'intro' || !collideRect(sx, sy, sd, sd, g.x, g.y, g.w, g.h)) continue;
    if (g.kind === 'shield' && g.state === 'block' && Math.sign(s.vx) === -g.facing) { g.blockFlash = 12; return true; }
    if (g.invFrames === 0) guardHit(g, s.dmg, 12);
    return true;
  }
  return false;
}

function drawGuards() {
  if (currentRoom !== 13) return;
  const now = Date.now();
  for (const p of guardProjectiles) {
    if (p.type === 'wave') { drawBossProjectile(p, '255,170,80', '#ff9040'); continue; }
    ctx.save();
    ctx.translate(p.x, p.y); ctx.rotate(p.spin);
    ctx.strokeStyle = 'rgba(255,220,180,0.35)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.stroke();
    drawHalberdHead(0, 0, 1);
    ctx.restore();
  }
  for (const g of guards) drawGuard(g, now);
}

// Hoja de alabarda (hacha + punta), centrada en 0,0
function drawHalberdHead(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = vol(4, 0, 14, '#f0f2f8', '#6a7080');
  ctx.beginPath(); ctx.moveTo(-2, -16); ctx.quadraticCurveTo(16, -12, 14, 0); ctx.quadraticCurveTo(16, 12, -2, 16); ctx.quadraticCurveTo(4, 0, -2, -16); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-6, -4); ctx.lineTo(-14, 0); ctx.lineTo(-6, 4); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(10, -8); ctx.quadraticCurveTo(13, 0, 10, 8); ctx.stroke();
  ctx.restore();
}

function drawGuard(g, now) {
  if (g.dead) {
    if (g.deathTimer > 0) drawBossDeath(g.x + g.w / 2, g.y + g.h / 2, g.deathTimer / 120,
      g.kind === 'shield' ? ['#5080ff', '#ffffff', '#c0c8d8', '#ffd060'] : ['#ff5050', '#ffffff', '#c0c8d8', '#ffd060'], 90);
    return;
  }
  const shieldK = g.kind === 'shield';
  const tab = shieldK ? '#2a4aa0' : '#a02a2a', tabD = shieldK ? '#16285a' : '#5a1414';
  const angry = guards.some(o => o !== g && o.dead);
  const walking = Math.abs(g.vx) > 0.3 && g.state !== 'spin';
  const step = walking ? Math.sin(now * (g.state === 'bash' ? 0.03 : 0.012)) : 0;
  const cx = Math.round(g.x + g.w / 2), fy = Math.round(g.y + g.h);
  const flicker = g.invFrames > 0 && Math.floor(g.invFrames / 4) % 2 === 0 && g.blockFlash === 0;

  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath(); ctx.ellipse(cx, GUARD_FLOOR + 2, 26, 6, 0, 0, Math.PI * 2); ctx.fill();
  if (angry) {
    const ag = ctx.createRadialGradient(cx, fy - 35, 0, cx, fy - 35, 70);
    ag.addColorStop(0, 'rgba(255,80,40,0.25)'); ag.addColorStop(1, 'rgba(255,80,40,0)');
    ctx.fillStyle = ag; ctx.beginPath(); ctx.arc(cx, fy - 35, 70, 0, Math.PI * 2); ctx.fill();
  }
  ctx.translate(cx, fy);
  ctx.scale(g.facing, 1);
  if (g.state === 'bash' || g.state === 'thrust') ctx.rotate(0.12);
  if (g.state === 'windup' && (g.windNext === 'jump' || g.windNext === 'bash')) ctx.scale(1, 0.92);
  if (flicker) ctx.globalAlpha = 0.45;
  const steel = (x, y, r) => vol(x, y, r, '#e4e8f0', '#4a505e');

  // capa
  ctx.fillStyle = tabD;
  ctx.beginPath(); ctx.moveTo(-12, -60); ctx.quadraticCurveTo(-24, -30, -22 - step * 2, -6); ctx.lineTo(-6, -10); ctx.closePath(); ctx.fill();
  // alabarda detrás (en reposo)
  const holdPole = !shieldK && g.state !== 'thrust' && g.state !== 'spin';
  if (holdPole) {
    const tilt = g.state === 'windup' && g.windNext === 'thrust' ? -1.25 : g.state === 'windup' && g.windNext === 'throw' ? -0.6 : 0.12;
    ctx.save(); ctx.translate(16, -40); ctx.rotate(tilt);
    ctx.strokeStyle = '#5a3a1e'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 44); ctx.lineTo(0, -58); ctx.stroke();
    if (!g.headOut) { ctx.save(); ctx.translate(2, -60); ctx.rotate(-Math.PI / 2); drawHalberdHead(0, 0, 0.9); ctx.restore(); }
    ctx.restore();
  }
  // piernas
  for (const [lx, ph] of [[-8, step], [8, -step]]) {
    ctx.fillStyle = steel(lx, -14, 10);
    ctx.beginPath(); ctx.roundRect(lx - 6 + ph * 3, -30, 12, 26, 4); ctx.fill();
    ctx.fillStyle = '#2a2e38';
    ctx.beginPath(); ctx.roundRect(lx - 7 + ph * 3, -6, 16, 6, [3, 5, 1, 1]); ctx.fill();
  }
  // torso con peto
  ctx.fillStyle = steel(-2, -46, 20);
  ctx.beginPath(); ctx.roundRect(-16, -62, 32, 36, 8); ctx.fill();
  // sobreveste con emblema
  ctx.fillStyle = tab;
  ctx.beginPath(); ctx.moveTo(-12, -50); ctx.lineTo(12, -50); ctx.lineTo(14, -18); ctx.lineTo(4, -22); ctx.lineTo(0, -16); ctx.lineTo(-4, -22); ctx.lineTo(-14, -18); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#e0b040';
  ctx.beginPath(); ctx.moveTo(0, -46); ctx.lineTo(5, -38); ctx.lineTo(0, -30); ctx.lineTo(-5, -38); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#2a1a10'; ctx.fillRect(-14, -28, 28, 4);
  // hombreras
  for (const sx of [-14, 14]) {
    ctx.fillStyle = steel(sx, -60, 9);
    ctx.beginPath(); ctx.ellipse(sx, -58, 9, 6, 0, 0, Math.PI * 2); ctx.fill();
  }
  // casco con visera y penacho
  const plume = shieldK ? '#4a7aff' : '#ff4a4a';
  ctx.fillStyle = plume;
  ctx.beginPath(); ctx.moveTo(0, -86);
  ctx.quadraticCurveTo(-14, -96, -26 - step * 2, -84 + Math.sin(now * 0.006) * 2);
  ctx.quadraticCurveTo(-14, -88, -2, -80); ctx.closePath(); ctx.fill();
  ctx.fillStyle = steel(0, -74, 13);
  ctx.beginPath(); ctx.arc(0, -72, 12, Math.PI, 0); ctx.lineTo(12, -62); ctx.quadraticCurveTo(0, -58, -12, -62); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#14161c'; ctx.fillRect(-2, -73, 14, 4);
  ctx.fillStyle = angry ? '#ff3020' : (shieldK ? '#80b0ff' : '#ff9060');
  ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 8;
  ctx.fillRect(4, -72.5, 5, 2.5);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, -84); ctx.lineTo(0, -60); ctx.stroke();

  if (shieldK) {
    // escudo en punta (arriba al cubrirse)
    const up = g.state === 'block' ? -14 : g.state === 'bash' ? -6 : 0;
    const sxp = g.state === 'block' || g.state === 'bash' ? 22 : 16;
    ctx.save(); ctx.translate(sxp, -44 + up);
    ctx.fillStyle = tabD;
    ctx.beginPath(); ctx.moveTo(-12, -20); ctx.lineTo(12, -20); ctx.lineTo(12, 4); ctx.quadraticCurveTo(10, 18, 0, 26); ctx.quadraticCurveTo(-10, 18, -12, 4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = tab;
    ctx.beginPath(); ctx.moveTo(-9, -17); ctx.lineTo(9, -17); ctx.lineTo(9, 3); ctx.quadraticCurveTo(7, 15, 0, 22); ctx.quadraticCurveTo(-7, 15, -9, 3); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#c8ccd8'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(-12, -20); ctx.lineTo(12, -20); ctx.lineTo(12, 4); ctx.quadraticCurveTo(10, 18, 0, 26); ctx.quadraticCurveTo(-10, 18, -12, 4); ctx.closePath(); ctx.stroke();
    ctx.fillStyle = '#e0b040';
    ctx.fillRect(-1.5, -14, 3, 30); ctx.fillRect(-7, -6, 14, 3);
    if (g.blockFlash > 0) {
      ctx.fillStyle = `rgba(255,255,220,${(g.blockFlash / 12).toFixed(2)})`;
      ctx.beginPath(); ctx.arc(10, -4, 6 + (12 - g.blockFlash) * 2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  } else if (g.state === 'thrust' || g.state === 'spin') {
    // alabarda en horizontal (estocada) o girando
    ctx.save(); ctx.translate(0, -42);
    if (g.state === 'spin') ctx.rotate(g.spin);
    ctx.strokeStyle = '#5a3a1e'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(56, 0); ctx.stroke();
    if (!g.headOut) drawHalberdHead(62, 0, 1);
    if (g.state === 'spin') {
      ctx.strokeStyle = 'rgba(255,230,200,0.35)'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(0, 0, 62, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  }
  // brazo delantero
  ctx.fillStyle = steel(12, -50, 8);
  ctx.beginPath(); ctx.roundRect(8, -56, 10, 20, 4); ctx.fill();
  ctx.restore();

  if (g.state === 'windup') drawWarning(cx, g.y - 34, angry ? '#ff5533' : '#ffd040');
}

function drawGuardsUI() {
  if (currentRoom !== 13) return;
  if (!guardsDefeated) {
    guards.forEach((g, i) => {
      const barW = 300, barH = 14, bx = i === 0 ? W / 2 - barW - 14 : W / 2 + 14, by = H - 40;
      ctx.fillStyle = 'rgba(0,0,0,0.72)';
      ctx.fillRect(bx - 6, by - 24, barW + 12, barH + 32);
      ctx.fillStyle = g.kind === 'shield' ? '#80a8ff' : '#ff8a80';
      ctx.font = 'bold 13px serif'; ctx.textAlign = 'center';
      ctx.fillText((g.dead ? '✝  ' : '✦  ') + g.name, bx + barW / 2, by - 8);
      ctx.fillStyle = '#1a1a1a'; ctx.fillRect(bx, by, barW, barH);
      ctx.fillStyle = g.kind === 'shield' ? '#3a6ad0' : '#c03a3a';
      ctx.fillRect(bx, by, (g.hp / g.maxHp) * barW, barH);
      ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(bx, by, (g.hp / g.maxHp) * barW, barH / 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1.2; ctx.strokeRect(bx, by, barW, barH);
    });
  } else {
    ctx.save();
    ctx.globalAlpha = 0.9; ctx.textAlign = 'center';
    ctx.fillStyle = '#ffe060'; ctx.font = 'bold 32px serif';
    ctx.fillText('¡Los guardias han caído!', W / 2, 110);
    ctx.fillStyle = '#ffffff'; ctx.font = '18px serif';
    ctx.fillText(guardKeys.length ? 'Recoge las llaves que han soltado' :
      castleDoorOpen ? 'La puerta de la derecha está abierta' : 'Abre la puerta de la derecha con las dos llaves', W / 2, 144);
    ctx.restore();
  }
}

// Trampilla en el suelo del pico
function drawHatch(h) {
  const t = Date.now() * 0.001;
  ctx.save();
  // marco de piedra
  ctx.fillStyle = '#1a1c24'; ctx.fillRect(h.x - 4, h.y - 2, h.w + 8, 10);
  // tablas
  const g = ctx.createLinearGradient(0, h.y - 4, 0, h.y + 6);
  g.addColorStop(0, '#6a4a2a'); g.addColorStop(1, '#3a2614');
  ctx.fillStyle = g; ctx.fillRect(h.x, h.y - 4, h.w, 9);
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  for (let x = h.x + 14; x < h.x + h.w; x += 14) ctx.fillRect(x, h.y - 4, 1.2, 9);
  // bandas de hierro y argolla
  ctx.fillStyle = '#2a2e38'; ctx.fillRect(h.x + 6, h.y - 4, 5, 9); ctx.fillRect(h.x + h.w - 11, h.y - 4, 5, 9);
  ctx.strokeStyle = '#8a8e98'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(h.x + h.w / 2, h.y - 4, 6, 3.5, 0, Math.PI, 0); ctx.stroke();
  // luz de antorchas que se escapa por las rendijas
  const a = 0.35 + 0.15 * Math.sin(t * 6);
  ctx.fillStyle = `rgba(255,160,70,${a.toFixed(2)})`;
  for (let x = h.x + 14; x < h.x + h.w; x += 14) ctx.fillRect(x - 0.5, h.y + 3, 2, 3);
  ctx.restore();
}

function drawHatchHint(h) {
  const d = Math.abs(player.x + player.w / 2 - (h.x + h.w / 2));
  if (d > 80 || Math.abs(player.y + player.h - h.y) > 60) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, (80 - d) / 30);
  ctx.fillStyle = '#ffe0b0'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
  ctx.fillText('↓ bajar', h.x + h.w / 2, h.y - 50);
  ctx.restore();
}

// ─── LLAVES DE LOS GUARDIAS Y PUERTA AL CAPÍTULO III ─────────────────────────
// Cada guardia suelta una llave (azul el del escudo, roja el de la alabarda);
// con las dos se abre la puerta de la derecha del Salón de la Guardia.
const guardKeys = [];          // { color, x, y, bob } tiradas en el suelo
const keysHeld = { blue: false, red: false };
let castleDoorOpen = false;
let chapter3Shown = false;
const KEY_COLORS = {
  blue: { light: '#d0e4ff', mid: '#4a8aff', dark: '#1a3a90', glow: '80,140,255' },
  red:  { light: '#ffd8d0', mid: '#ff4a3a', dark: '#901a14', glow: '255,90,70' },
};

function dropGuardKey(g) {
  guardKeys.push({ color: g.kind === 'shield' ? 'blue' : 'red', x: g.x + g.w / 2, y: GUARD_FLOOR - 34, bob: 0 });
}

function updateGuardKeys() {
  if (currentRoom !== 13) return;
  for (let i = guardKeys.length - 1; i >= 0; i--) {
    const k = guardKeys[i];
    k.bob += 0.055;
    if (collideRect(player.x, player.y, player.w, player.h, k.x - 16, k.y - 14, 32, 28)) {
      keysHeld[k.color] = true;
      moneyPops.push({ x: k.x, y: k.y - 20, text: k.color === 'blue' ? 'Llave azul' : 'Llave roja', t: 80,
        color: KEY_COLORS[k.color].mid });
      guardKeys.splice(i, 1);
    }
  }
}

// Llave de color (en el suelo, en la puerta o en el HUD)
function drawColorKey(x, y, color, scale = 1, rot = 0) {
  const c = KEY_COLORS[color];
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(scale, scale);
  const g = ctx.createLinearGradient(0, -10, 0, 10);
  g.addColorStop(0, c.light); g.addColorStop(0.45, c.mid); g.addColorStop(1, c.dark);
  ctx.strokeStyle = g; ctx.lineWidth = 4.5;
  ctx.beginPath(); ctx.arc(-8, 0, 8.5, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.roundRect(-1, -3, 22, 6, 2); ctx.fill();
  ctx.beginPath(); ctx.roundRect(12, 2, 4, 8, 1); ctx.fill();
  ctx.beginPath(); ctx.roundRect(18, 2, 3, 6, 1); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(1, -2.4, 18, 1.2);
  ctx.fillStyle = c.light; ctx.beginPath(); ctx.arc(-8, 0, 3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawGuardKeys() {
  if (currentRoom !== 13) return;
  for (const k of guardKeys) {
    const y = k.y + Math.sin(k.bob) * 6, c = KEY_COLORS[k.color];
    const g = ctx.createRadialGradient(k.x, y, 0, k.x, y, 32);
    g.addColorStop(0, `rgba(${c.glow},0.55)`); g.addColorStop(1, `rgba(${c.glow},0)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(k.x, y, 32, 0, Math.PI * 2); ctx.fill();
    drawColorKey(k.x, y, k.color, 1, Math.sin(k.bob * 0.7) * 0.15);
  }
}

// Puerta doble de hierro con dos cerraduras (azul y roja)
const CASTLE_DOOR = { x: 900, y: 360, w: 60, h: 120 };
function drawCastleDoor() {
  if (currentRoom !== 13) return;
  const d = CASTLE_DOOR, t = Date.now() * 0.003;
  ctx.save();
  // arco de piedra
  ctx.fillStyle = '#4a4552';
  ctx.beginPath(); ctx.moveTo(d.x - 10, d.y + d.h); ctx.lineTo(d.x - 10, d.y + 10);
  ctx.quadraticCurveTo(d.x + d.w / 2, d.y - 34, d.x + d.w + 10, d.y + 10); ctx.lineTo(d.x + d.w + 10, d.y + d.h); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#05040a';
  ctx.beginPath(); ctx.moveTo(d.x, d.y + d.h); ctx.lineTo(d.x, d.y + 12);
  ctx.quadraticCurveTo(d.x + d.w / 2, d.y - 20, d.x + d.w, d.y + 12); ctx.lineTo(d.x + d.w, d.y + d.h); ctx.closePath(); ctx.fill();
  if (castleDoorOpen) {
    // puerta abierta: luz de luna del otro lado
    const lg = ctx.createLinearGradient(d.x, 0, d.x + d.w, 0);
    lg.addColorStop(0, 'rgba(170,190,255,0.08)'); lg.addColorStop(1, `rgba(170,190,255,${(0.35 + 0.1 * Math.sin(t)).toFixed(2)})`);
    ctx.fillStyle = lg;
    ctx.beginPath(); ctx.moveTo(d.x, d.y + d.h); ctx.lineTo(d.x, d.y + 12);
    ctx.quadraticCurveTo(d.x + d.w / 2, d.y - 20, d.x + d.w, d.y + 12); ctx.lineTo(d.x + d.w, d.y + d.h); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#2a2030'; ctx.fillRect(d.x - 2, d.y + 14, 8, d.h - 14); // hoja abierta
  } else {
    const ig = ctx.createLinearGradient(d.x, 0, d.x + d.w, 0);
    ig.addColorStop(0, '#2e2a36'); ig.addColorStop(0.5, '#4a4656'); ig.addColorStop(1, '#2a2632');
    ctx.fillStyle = ig;
    ctx.beginPath(); ctx.moveTo(d.x + 3, d.y + d.h); ctx.lineTo(d.x + 3, d.y + 14);
    ctx.quadraticCurveTo(d.x + d.w / 2, d.y - 16, d.x + d.w - 3, d.y + 14); ctx.lineTo(d.x + d.w - 3, d.y + d.h); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(d.x + d.w / 2, d.y + 2); ctx.lineTo(d.x + d.w / 2, d.y + d.h); ctx.stroke();
    // remaches
    ctx.fillStyle = '#7a7686';
    for (let y = d.y + 26; y < d.y + d.h; y += 22) for (const x of [d.x + 9, d.x + d.w - 9]) {
      ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
    }
    // cerraduras: brillan si ya tienes esa llave
    for (const [col, cx] of [['blue', d.x + d.w / 2 - 12], ['red', d.x + d.w / 2 + 12]]) {
      const c = KEY_COLORS[col], cy = d.y + 64, on = keysHeld[col];
      if (on) {
        const gl = ctx.createRadialGradient(cx, cy, 0, cx, cy, 18);
        gl.addColorStop(0, `rgba(${c.glow},${(0.5 + 0.3 * Math.sin(t * 2)).toFixed(2)})`); gl.addColorStop(1, `rgba(${c.glow},0)`);
        ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = c.mid; ctx.beginPath(); ctx.roundRect(cx - 7, cy - 9, 14, 18, 4); ctx.fill();
      ctx.fillStyle = '#0a0a10'; ctx.beginPath(); ctx.arc(cx, cy - 2, 2.6, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(cx - 1.2, cy - 1, 2.4, 6);
    }
  }
  ctx.restore();
}

// Mensaje junto a la puerta
function drawCastleDoorHint() {
  if (currentRoom !== 13 || castleDoorOpen || !guardsDefeated) return;
  const d = CASTLE_DOOR;
  if (player.x + player.w < d.x - 120) return;
  const both = keysHeld.blue && keysHeld.red;
  ctx.save();
  ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
  ctx.fillStyle = both ? '#ffe0b0' : '#ff9a8a';
  ctx.fillText(both ? 'Toca la puerta para abrirla' : 'Necesitas la llave azul y la roja', W - 170, d.y - 44);
  ctx.restore();
}

// Llaves que llevas, junto a los mapesos
function drawKeysHUD() {
  let x = 210;
  for (const col of ['blue', 'red']) if (keysHeld[col] && !castleDoorOpen) { drawColorKey(x, 85, col, 0.7); x += 30; }
}

// Ruinas del castillo: muros rotos, ventanas sin cristal y luz de luna
function drawRuinedWalls(room) {
  const RW = room.width || W, t = Date.now() * 0.001;
  // luna (fija en pantalla)
  ctx.save(); ctx.translate(Math.round(camX), Math.round(camY));
  const mg = ctx.createRadialGradient(780, 80, 0, 780, 80, 140);
  mg.addColorStop(0, 'rgba(210,220,255,0.22)'); mg.addColorStop(1, 'rgba(210,220,255,0)');
  ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(780, 80, 140, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e8ecff'; ctx.beginPath(); ctx.arc(780, 80, 26, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(160,170,210,0.35)'; ctx.beginPath(); ctx.arc(772, 74, 5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // muro del fondo con el borde superior roto
  ctx.fillStyle = '#1c1a22';
  ctx.beginPath(); ctx.moveTo(0, 480);
  for (let x = 0; x <= RW; x += 40) {
    const top = 90 + ((x * 37) % 70) + (Math.floor(x / 280) % 2) * 50;
    ctx.lineTo(x, top);
  }
  ctx.lineTo(RW, 480); ctx.closePath(); ctx.fill();
  // ladrillos del muro
  ctx.strokeStyle = 'rgba(255,255,255,0.035)'; ctx.lineWidth = 1;
  for (let row = 0, y = 200; y < 480; row++, y += 28) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(RW, y); ctx.stroke();
    for (let x = (row % 2) * 32; x < RW; x += 64) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 28); ctx.stroke(); }
  }
  // ventanas rotas con rayos de luna
  for (let x = 180; x < RW; x += 360) {
    ctx.fillStyle = '#06070e';
    ctx.beginPath(); ctx.moveTo(x - 26, 330); ctx.lineTo(x - 26, 230); ctx.arc(x, 230, 26, Math.PI, 0); ctx.lineTo(x + 26, 330); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    for (let k = 0; k < 4; k++) ctx.fillRect(x - 18 + ((k * 13) % 34), 220 + ((k * 29) % 90), 1.4, 1.4);
    const a = 0.10 + 0.03 * Math.sin(t + x);
    const lg = ctx.createLinearGradient(x, 230, x + 90, 480);
    lg.addColorStop(0, `rgba(190,205,255,${a.toFixed(3)})`); lg.addColorStop(1, 'rgba(190,205,255,0)');
    ctx.fillStyle = lg;
    ctx.beginPath(); ctx.moveTo(x - 26, 240); ctx.lineTo(x + 26, 240); ctx.lineTo(x + 140, 480); ctx.lineTo(x + 40, 480); ctx.closePath(); ctx.fill();
  }
  // columnas partidas y escombros
  for (let x = 90, k = 0; x < RW; x += 300, k++) {
    const h = 70 + (k % 3) * 45;
    ctx.fillStyle = '#2c2934';
    ctx.fillRect(x - 14, 480 - h, 28, h);
    ctx.fillStyle = '#3a3644'; ctx.fillRect(x - 18, 470, 36, 10);
    ctx.beginPath(); ctx.moveTo(x - 14, 480 - h); ctx.lineTo(x - 4, 480 - h - 14); ctx.lineTo(x + 6, 480 - h - 4); ctx.lineTo(x + 14, 480 - h - 10); ctx.lineTo(x + 14, 480 - h); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#34303e';
    for (let r = 0; r < 4; r++) { ctx.beginPath(); ctx.ellipse(x + 30 + r * 12, 478 - (r % 2) * 4, 9 - r, 5, 0, 0, Math.PI * 2); ctx.fill(); }
  }
}
