// ─── JEFE SECRETO: EL COLOSO INGRÁVIDO ───────────────────────────────────────
// Triple de vida que el rey, pero apunta mal: sus golpes llevan un error al azar
const BOSS3_FLOOR_Y = 480 - 120;
const BOSS3_GRAV = 0.32; // la sala tiene la gravedad baja
let boss3Defeated = false;
let boss3AttackIdx = 0;
const boss3 = {
  x: 1000, y: BOSS3_FLOOR_Y, w: 110, h: 120,
  vx: 0, vy: 0, hp: 30, maxHp: 30,
  state: 'wait', stateTimer: 120, phase: 1, invFrames: 0, facing: -1,
  dead: false, deathTimer: 0, projectiles: [], roared: false, windNext: null,
};
const rnd = (a, b) => a + Math.random() * (b - a);

function initBoss3() {
  Object.assign(boss3, {
    x: 1000, y: BOSS3_FLOOR_Y, vx: 0, vy: 0, hp: 30,
    state: 'wait', stateTimer: 120, phase: 1, invFrames: 0, facing: -1,
    dead: false, deathTimer: 0, projectiles: [], roared: false, windNext: null,
  });
  boss3AttackIdx = 0;
}

function boss3Hit(dmg, inv) {
  boss3.hp -= dmg; boss3.invFrames = inv;
  if (boss3.hp <= 0) { boss3.hp = 0; boss3.dead = true; boss3.deathTimer = 160; boss3.projectiles = []; shake(30, 6); }
}

function updateBoss3() {
  if (currentRoom !== 12) return;
  const rw = ROOMS[12].width;

  // Proyectiles: rocas lanzadas (gravedad baja), ondas y rocas que caen del techo
  for (const p of boss3.projectiles) {
    if (p.type === 'wave') { p.x += p.vx; p.life--; }
    else if (p.type === 'rain') {
      if (p.delay > 0) { p.delay--; continue; }
      p.vy = Math.min(p.vy + 0.3, 8); p.y += p.vy;
      if (p.y >= 470) p.life = 0;
    } else {
      p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.spin += p.vx * 0.02; p.life--;
      if (p.y >= 470) p.life = 0;
    }
  }
  boss3.projectiles = boss3.projectiles.filter(p => p.life > 0 && p.x > -40 && p.x < rw + 40);

  if (boss3.dead) {
    if (boss3.deathTimer > 0) boss3.deathTimer--;
    else if (!boss3Defeated) {
      boss3Defeated = true;
      addMoney(MONEY_BOSS * 3, boss3.x + boss3.w / 2, boss3.y);
    }
    return;
  }

  if (boss3.invFrames > 0) boss3.invFrames--;
  const newPhase = boss3.hp <= boss3.maxHp / 2 ? 2 : 1;
  if (newPhase === 2 && !boss3.roared && boss3.y >= BOSS3_FLOOR_Y) {
    boss3.roared = true;
    boss3.state = 'roar'; boss3.stateTimer = 80; boss3.vx = 0;
    shake(45, 7);
  }
  boss3.phase = newPhase;

  // Saltos lentos y flotantes
  if (boss3.y < BOSS3_FLOOR_Y) {
    boss3.vy += BOSS3_GRAV; boss3.y += boss3.vy; boss3.x += boss3.vx;
    boss3.x = Math.max(20, Math.min(rw - 20 - boss3.w, boss3.x));
    if (boss3.y >= BOSS3_FLOOR_Y) {
      boss3.y = BOSS3_FLOOR_Y; boss3.vy = 0; boss3.vx = 0;
      if (boss3.state === 'leap') {
        shake(20, 6);
        for (const dir of [-1, 1]) {
          boss3.projectiles.push({ type: 'wave', x: boss3.x + boss3.w / 2 + dir * 40, y: 480 - 12,
            vx: dir * (boss3.phase === 2 ? 4.6 : 3.8), vy: 0, r: 12, life: 170 });
        }
        boss3.state = 'wait'; boss3.stateTimer = 80;
      }
    }
    return;
  }

  boss3.stateTimer--;
  if (boss3.state === 'roar') {
    if (boss3.stateTimer <= 0) { boss3.state = 'wait'; boss3.stateTimer = 40; }
  } else if (boss3.state === 'windup') {
    if (boss3.stateTimer <= 0) startBoss3Attack(boss3.windNext);
  } else if (boss3.state === 'walk') {
    boss3.x += boss3.vx;
    if (boss3.x <= 20 || boss3.x + boss3.w >= rw - 20) boss3.stateTimer = 0;
    boss3.x = Math.max(20, Math.min(rw - 20 - boss3.w, boss3.x));
    if (boss3.stateTimer <= 0) { boss3.state = 'wait'; boss3.vx = 0; boss3.stateTimer = 50; }
  } else if (boss3.state === 'throw' || boss3.state === 'meteor') {
    if (boss3.stateTimer <= 0) { boss3.state = 'wait'; boss3.stateTimer = boss3.phase === 2 ? 60 : 85; }
  } else if (boss3.state === 'wait') {
    if (boss3.stateTimer <= 0) {
      const pattern = boss3.phase === 2
        ? ['leap', 'throw', 'meteor', 'walk', 'leap', 'throw', 'meteor']
        : ['walk', 'leap', 'throw', 'walk', 'leap'];
      const next = pattern[boss3AttackIdx++ % pattern.length];
      boss3.facing = (player.x + player.w / 2) > (boss3.x + boss3.w / 2) ? 1 : -1;
      boss3.state = 'windup'; boss3.windNext = next;
      boss3.stateTimer = next === 'walk' ? 20 : (boss3.phase === 2 ? 34 : 44);
    }
  }
}

function startBoss3Attack(next) {
  boss3.state = next;
  const pcx = player.x + player.w / 2, bcx = boss3.x + boss3.w / 2;
  if (next === 'walk') {
    boss3.vx = boss3.facing * (boss3.phase === 2 ? 2.6 : 2);
    boss3.stateTimer = 110;
  } else if (next === 'leap') {
    // apunta a donde estás… más o menos
    const tx = pcx + rnd(-260, 260);
    const air = 2 * 13 / BOSS3_GRAV;
    boss3.vy = -13; boss3.y -= 1;
    boss3.vx = Math.max(-7, Math.min(7, (tx - bcx) / air));
    boss3.facing = boss3.vx >= 0 ? 1 : -1;
  } else if (next === 'throw') {
    const n = boss3.phase === 2 ? 4 : 3;
    const ox = bcx + boss3.facing * 40, oy = boss3.y + 20;
    for (let i = 0; i < n; i++) {
      // tiro parabólico hacia el jugador con mucho error
      const dx = pcx + rnd(-220, 220) - ox;
      const t = rnd(55, 80);
      boss3.projectiles.push({ type: 'rock', x: ox, y: oy, vx: dx / t,
        vy: ((player.y + 20 - oy) - 0.5 * 0.1 * t * t) / t + rnd(-1.2, 1.2),
        r: 13, life: 260, spin: 0 });
    }
    boss3.stateTimer = 50;
  } else if (next === 'meteor') {
    // rocas del techo en sitios al azar de la pantalla (no te buscan)
    const n = boss3.phase === 2 ? 8 : 6;
    for (let i = 0; i < n; i++) {
      boss3.projectiles.push({ type: 'rain', x: camX + rnd(40, W / camZ - 40), y: camY - 20,
        vx: 0, vy: 0, r: 12, life: 400, delay: 50 + i * 9 });
    }
    shake(20, 3);
    boss3.stateTimer = 70;
  }
}

function checkBoss3Collisions() {
  if (currentRoom !== 12 || boss3.dead) return;
  const atkW = 52, atkH = 30;
  const atkX = player.facing === 1 ? player.x + player.w : player.x - atkW;
  const atkY = player.y + 6;
  const vuln = boss3.invFrames === 0 && boss3.state !== 'roar';

  if (player.attackActive > 0 && vuln &&
      collideRect(atkX, atkY, atkW, atkH, boss3.x, boss3.y, boss3.w, boss3.h)) {
    boss3Hit(playerDmg, 26); if (boss3.dead) return;
  }
  const onBoss  = collideRect(player.x, player.y, player.w, player.h, boss3.x, boss3.y, boss3.w, boss3.h);
  const fromTop = player.vy > 1 && (player.y + player.h) < (boss3.y + boss3.h * 0.4);
  if (onBoss && fromTop && vuln) {
    boss3Hit(playerDmg, 26); player.vy = -10;
    if (boss3.dead) return;
  }
  const hurt = (kx, inv) => {
    if (!godMode) {
      player.hp--;
      if (player.hp <= 0) { player.hp = 0; isDeath = true; respawnAtBench(); return true; }
    }
    player.invFrames = inv;
    player.vx = kx; player.vy = -6;
    return false;
  };
  if (player.invFrames === 0 && !fromTop &&
      collideRect(player.x + 3, player.y + 3, player.w - 6, player.h - 3, boss3.x + 8, boss3.y + 8, boss3.w - 16, boss3.h - 8)) {
    if (hurt((player.x + player.w / 2) < (boss3.x + boss3.w / 2) ? -7 : 7, 90)) return;
  }
  for (let i = boss3.projectiles.length - 1; i >= 0; i--) {
    const p = boss3.projectiles[i];
    if (p.type === 'rain' && p.delay > 0) continue;
    if (player.attackActive > 0 && p.type !== 'wave' &&
        collideRect(atkX, atkY, atkW, atkH, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2)) {
      boss3.projectiles.splice(i, 1); continue;
    }
    const dist = Math.hypot((player.x + player.w / 2) - p.x, (player.y + player.h / 2) - p.y);
    if (dist < p.r + 12 && player.invFrames === 0) {
      boss3.projectiles.splice(i, 1);
      if (hurt(player.x < p.x ? -5 : 5, 70)) return;
    }
  }
}

function drawBoss3() {
  if (currentRoom !== 12) return;
  for (const p of boss3.projectiles) {
    if (p.type === 'wave' || (p.type === 'rain' && p.delay > 0)) { drawBossProjectile(p, '110,200,255', '#60b0ff'); continue; }
    // roca flotante
    ctx.save();
    ctx.translate(p.x, p.y); ctx.rotate(p.spin || p.y * 0.05);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, p.r * 2);
    g.addColorStop(0, 'rgba(110,200,255,0.35)'); g.addColorStop(1, 'rgba(110,200,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, p.r * 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = vol(0, 0, p.r, '#8a8fa0', '#30343e');
    ctx.beginPath();
    for (let k = 0; k < 7; k++) {
      const a = k / 7 * Math.PI * 2, rr = p.r * (0.8 + ((k * 5) % 3) * 0.12);
      k ? ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : ctx.moveTo(rr, 0);
    }
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(140,220,255,0.7)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-4, -5); ctx.lineTo(1, 0); ctx.lineTo(-2, 5); ctx.stroke();
    ctx.restore();
  }

  if (boss3.dead) {
    if (boss3.deathTimer <= 0) return;
    drawBossDeath(boss3.x + boss3.w / 2, boss3.y + boss3.h / 2, boss3.deathTimer / 160,
      ['#60c0ff', '#ffffff', '#a0e0ff', '#8090a0', '#40ffff'], 160);
    return;
  }

  const cx = Math.round(boss3.x + boss3.w / 2), cy = Math.round(boss3.y + boss3.h / 2);
  const hw = boss3.w / 2, hh = boss3.h / 2;
  const t = Date.now() * 0.002, p2 = boss3.phase === 2;
  const rune = p2 ? '255,110,90' : '110,200,255';
  const flicker = boss3.invFrames > 0 && Math.floor(boss3.invFrames / 4) % 2 === 0;
  const walk = boss3.state === 'walk' ? Math.sin(Date.now() * 0.012) : 0;
  const crouch = boss3.state === 'windup' && boss3.windNext === 'leap' ? 10 : 0;

  ctx.save();
  // sombra (se encoge al estar en el aire)
  const air = Math.max(0, BOSS3_FLOOR_Y - boss3.y);
  ctx.fillStyle = `rgba(0,0,0,${(0.45 - Math.min(0.3, air / 600)).toFixed(2)})`;
  ctx.beginPath(); ctx.ellipse(cx, 482, hw * Math.max(0.4, 0.9 - air / 500), 8, 0, 0, Math.PI * 2); ctx.fill();

  // piedras que orbitan (gravedad baja)
  for (let i = 0; i < 5; i++) {
    const a = t * 0.8 + i * 1.257, ox = Math.cos(a) * (hw + 26), oy = Math.sin(a) * 18 - hh * 0.2;
    ctx.fillStyle = vol(cx + ox, cy + oy, 6, '#9aa0b0', '#3a3e48');
    ctx.beginPath(); ctx.arc(cx + ox, cy + oy, 5 + (i % 2) * 2, 0, Math.PI * 2); ctx.fill();
  }

  ctx.translate(cx, cy + crouch);
  ctx.scale(boss3.facing, 1);
  if (flicker) ctx.globalAlpha = 0.45;
  const stone = (x, y, w, h, r) => {
    ctx.fillStyle = vol(x + w / 2, y + h / 2, Math.max(w, h) / 2, '#8a8e9c', '#2e313a');
    ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1.5; ctx.stroke();
  };
  // piernas
  stone(-hw + 14, hh - 34 + walk * 3, 32, 34 - crouch, 8);
  stone(hw - 46, hh - 34 - walk * 3, 32, 34 - crouch, 8);
  // brazo trasero
  ctx.save(); ctx.translate(-hw + 6, -hh + 46); ctx.rotate(-0.15 - walk * 0.2);
  stone(-14, 0, 26, 52, 10); ctx.restore();
  // torso
  stone(-hw + 6, -hh + 30, boss3.w - 12, boss3.h - 62, 18);
  // runas del pecho
  const glow = 0.55 + 0.35 * Math.sin(t * 3);
  ctx.strokeStyle = `rgba(${rune},${glow.toFixed(2)})`; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.shadowColor = `rgba(${rune},1)`; ctx.shadowBlur = 10;
  ctx.beginPath(); ctx.moveTo(-14, -6); ctx.lineTo(0, -18); ctx.lineTo(14, -6); ctx.lineTo(0, 8); ctx.closePath(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, 8); ctx.lineTo(0, 22); ctx.stroke();
  ctx.shadowBlur = 0;
  // cabeza
  stone(-24, -hh + 2, 48, 36, 12);
  // ojo único que brilla
  const eg = ctx.createRadialGradient(10, -hh + 19, 0, 10, -hh + 19, 16);
  eg.addColorStop(0, `rgba(${rune},0.9)`); eg.addColorStop(1, `rgba(${rune},0)`);
  ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(10, -hh + 19, 16, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(10, -hh + 19, 4, 0, Math.PI * 2); ctx.fill();
  // brazo delantero (lo levanta al lanzar)
  const raise = boss3.state === 'throw' || (boss3.state === 'windup' && boss3.windNext === 'throw') ? -2.2 : 0.15 + walk * 0.2;
  ctx.save(); ctx.translate(hw - 10, -hh + 46); ctx.rotate(raise);
  stone(-12, 0, 26, 54, 10);
  ctx.fillStyle = `rgba(${rune},${(glow * 0.8).toFixed(2)})`;
  ctx.fillRect(-2, 18, 6, 16);
  ctx.restore();
  ctx.restore();

  if (boss3.state === 'windup') drawWarning(cx, boss3.y - 30, p2 ? '#ff6a50' : '#70c8ff');
  if (boss3.state === 'roar') drawRoarRings(cx, cy, (Date.now() * 0.0015) % 1, rune);
}

function drawBoss3UI() {
  if (currentRoom !== 12) return;
  if (!boss3.dead) {
    const barW = 460, barH = 18, bx = (W - barW) / 2, by = 40; // arriba: abajo taparía al mapache
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    ctx.fillRect(bx - 6, by - 26, barW + 12, barH + 36);
    ctx.fillStyle = boss3.phase === 2 ? '#ff7a60' : '#70c8ff';
    ctx.font = 'bold 14px serif'; ctx.textAlign = 'center';
    ctx.fillText('✦  COLOSO INGRÁVIDO  ✦', W / 2, by - 8);
    ctx.fillStyle = '#1a1a1a'; ctx.fillRect(bx, by, barW, barH);
    const fill = (boss3.hp / boss3.maxHp) * barW;
    ctx.fillStyle = boss3.phase === 2 ? '#d04a3a' : '#3a8ad0';
    ctx.fillRect(bx, by, fill, barH);
    ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(bx, by, fill, barH / 2);
    ctx.strokeStyle = boss3.phase === 2 ? '#ff8a70' : '#90d8ff';
    ctx.lineWidth = 1.5; ctx.strokeRect(bx, by, barW, barH);
  } else if (boss3Defeated) {
    ctx.save();
    ctx.globalAlpha = 0.9; ctx.textAlign = 'center';
    ctx.fillStyle = '#a0e0ff'; ctx.font = 'bold 34px serif';
    ctx.fillText('¡El Coloso ha caído!', W / 2, 110);
    ctx.fillStyle = '#ffffff'; ctx.font = '18px serif';
    ctx.fillStyle = '#bfe4ff';
    ctx.fillText('Has obtenido el DOBLE SALTO: salta otra vez en el aire', W / 2, 144);
    ctx.fillStyle = '#ffffff'; ctx.font = '15px serif';
    ctx.fillText('La salida está a la izquierda', W / 2, 168);
    ctx.restore();
  }
}

// Escalera secreta de la sala del rey: casi invisible, se nota al acercarte
function drawSecretStair(p) {
  const d = Math.hypot(player.x + player.w / 2 - (p.x + p.w / 2), player.y + player.h - p.y);
  const a = 0.07 + 0.35 * Math.max(0, 1 - d / 140);
  ctx.fillStyle = `rgba(110,40,40,${a.toFixed(2)})`;
  ctx.fillRect(p.x, p.y, p.w, p.h);
  ctx.fillStyle = `rgba(255,170,150,${(a * 0.6).toFixed(2)})`;
  ctx.fillRect(p.x, p.y, p.w, 1.5);
}

// Piedras flotando hacia arriba: la sala no tiene casi gravedad
function drawFloatStones(room) {
  const tt = Date.now() * 0.001;
  for (let i = 0; i < 70; i++) {
    const x = (i * 293) % room.width + Math.sin(tt * 0.6 + i) * 14;
    const span = H - (room.top || 0) + 60;
    const y = H + 30 - ((tt * (12 + (i % 5) * 5) + i * 97) % span);
    const r = 3 + (i % 4) * 2;
    ctx.globalAlpha = 0.35 + (i % 3) * 0.15;
    ctx.fillStyle = vol(x, y, r, '#8aa0c8', '#2a3450');
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  // columnas rotas a lo largo de la sala
  for (let x = 160, k = 0; x < room.width; x += 400, k++) {
    // columnas de distinta altura (unas llegan casi al techo)
    const ct = k % 3 === 0 ? (room.top || 0) + 160 : k % 3 === 1 ? 120 : -180;
    const g = ctx.createLinearGradient(x - 20, 0, x + 20, 0);
    g.addColorStop(0, '#16203a'); g.addColorStop(0.5, '#24304e'); g.addColorStop(1, '#121a30');
    ctx.fillStyle = g;
    ctx.fillRect(x - 20, ct, 40, 480 - ct);
    ctx.fillStyle = '#2c3a5c'; ctx.fillRect(x - 26, 466, 52, 14);
    // trozo roto flotando encima
    const by = ct - 40 + Math.sin(tt + x) * 8;
    ctx.save(); ctx.translate(x, by); ctx.rotate(Math.sin(tt * 0.7 + x) * 0.15);
    ctx.fillStyle = '#24304e'; ctx.fillRect(-20, -18, 40, 30);
    ctx.fillStyle = '#2c3a5c'; ctx.fillRect(-26, -24, 52, 10);
    ctx.restore();
  }
}
