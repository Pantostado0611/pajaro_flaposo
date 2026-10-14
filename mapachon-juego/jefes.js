// ─── FUNCIONES DE JEFE ────────────────────────────────────────────────────────
function initBoss() {
  Object.assign(boss, {
    x: 440, y: BOSS_FLOOR_Y,
    vx: 0, vy: 0,
    hp: 10, state: 'wait', stateTimer: 90,
    phase: 1, invFrames: 0, facing: -1,
    dead: false, deathTimer: 0, projectiles: [],
    roared: false, windNext: null,
  });
  bossAttackIdx = 0;
}

function fireBossOrbs() {
  const cx = boss.x + boss.w / 2, cy = boss.y + boss.h / 2;
  const dx = (player.x + player.w / 2) - cx;
  const dy = (player.y + player.h / 2) - cy;
  const len = Math.hypot(dx, dy) || 1;
  const nx = dx / len, ny = dy / len;
  for (const a of [-0.4, 0, 0.4]) {
    const cos = Math.cos(a), sin = Math.sin(a);
    boss.projectiles.push({
      x: cx, y: cy,
      vx: (nx * cos - ny * sin) * 4.5,
      vy: (nx * sin + ny * cos) * 4.5,
      r: 9, life: 220,
    });
  }
}

function updateBoss() {
  if (currentRoom !== 4) return;

  // Proyectiles: orbes con gravedad, ondas por el suelo y lluvia del cetro
  for (const p of boss.projectiles) {
    if (p.type === 'wave') {
      p.x += p.vx; p.life--;
    } else if (p.type === 'rain') {
      if (p.delay > 0) { p.delay--; continue; }
      p.vy = Math.min(p.vy + 0.5, 12);
      p.y += p.vy;
      if (p.y >= BOSS_FLOOR_Y + boss.h - 8) p.life = 0;
    } else {
      p.x += p.vx; p.y += p.vy;
      p.vy += 0.12;
      p.life--;
    }
  }
  boss.projectiles = boss.projectiles.filter(
    p => p.life > 0 && p.x > -30 && p.x < W + 30 && p.y < H + 30
  );

  if (boss.dead) {
    if (boss.deathTimer > 0) { boss.deathTimer--; }
    else if (!bossDefeated)  {
      bossDefeated = true;
      addMoney(MONEY_BOSS, boss.x + boss.w / 2, boss.y);
      keyItem.x = boss.x + boss.w / 2 - 12;
      keyItem.y = BOSS_FLOOR_Y - 28;
      keyItem.active = true;
      keyItem.bobTimer = 0;
    }
    return;
  }

  if (boss.invFrames > 0) boss.invFrames--;
  const newPhase = boss.hp <= Math.floor(boss.maxHp / 2) ? 2 : 1;
  // Rugido de furia al pasar a la fase 2
  if (newPhase === 2 && !boss.roared && boss.y >= BOSS_FLOOR_Y) {
    boss.roared = true;
    boss.state = 'roar'; boss.stateTimer = 70;
    boss.vx = 0; boss.projectiles = [];
    shake(40, 7);
  }
  boss.phase = newPhase;

  // Gravedad (al saltar); al aterrizar golpea el suelo y lanza ondas
  if (boss.y < BOSS_FLOOR_Y) {
    boss.vy += 0.65;
    boss.y  += boss.vy;
    if (boss.y >= BOSS_FLOOR_Y) {
      boss.y = BOSS_FLOOR_Y; boss.vy = 0;
      if (boss.state === 'jump') {
        bossSlam();
        boss.state = 'wait'; boss.vx = 0; boss.stateTimer = 55;
      }
    }
  }

  boss.stateTimer--;

  if (boss.state === 'roar') {
    if (boss.stateTimer <= 0) { boss.state = 'wait'; boss.stateTimer = 30; }

  } else if (boss.state === 'windup') {
    if (boss.stateTimer <= 0) startBossAttack(boss.windNext);

  } else if (boss.state === 'charge') {
    boss.x += boss.vx;
    if (boss.x <= 20)              { boss.x = 20;              boss.vx =  Math.abs(boss.vx) * 0.92; boss.facing =  1; }
    if (boss.x + boss.w >= W - 20) { boss.x = W - 20 - boss.w; boss.vx = -Math.abs(boss.vx) * 0.92; boss.facing = -1; }
    if (boss.stateTimer <= 0)      { boss.state = 'wait'; boss.vx = 0; boss.stateTimer = boss.phase === 2 ? 40 : 55; }

  } else if (boss.state === 'jump') {
    boss.x += boss.vx;
    if (boss.x <= 20)              { boss.x = 20;              boss.vx =  Math.abs(boss.vx); boss.facing =  1; }
    if (boss.x + boss.w >= W - 20) { boss.x = W - 20 - boss.w; boss.vx = -Math.abs(boss.vx); boss.facing = -1; }
    if (boss.stateTimer <= 0)      { boss.y = BOSS_FLOOR_Y; boss.vy = 0; boss.state = 'wait'; boss.vx = 0; boss.stateTimer = 50; }

  } else if (boss.state === 'rain') {
    if (boss.stateTimer <= 0) { boss.state = 'wait'; boss.stateTimer = 40; }

  } else if (boss.state === 'wait') {
    if (boss.stateTimer <= 0) {
      const pattern = boss.phase === 2
        ? ['charge','jump','shoot','rain','charge','jump','shoot','charge']
        : ['charge','jump','charge','jump'];
      const next = pattern[bossAttackIdx % pattern.length];
      bossAttackIdx++;
      const pdx = (player.x + player.w / 2) - (boss.x + boss.w / 2);
      boss.facing = pdx > 0 ? 1 : -1;

      if (next === 'shoot') {
        fireBossOrbs();
        boss.stateTimer = boss.phase === 2 ? 35 : 50;
      } else {
        // aviso antes de atacar
        boss.state = 'windup';
        boss.windNext = next;
        boss.stateTimer = boss.phase === 2 ? 18 : 26;
      }
    }
  }
}

function startBossAttack(next) {
  boss.state = next;
  if (next === 'charge') {
    boss.vx = boss.facing * (boss.phase === 2 ? 7.8 : 6.2);
    boss.stateTimer = 130;
  } else if (next === 'jump') {
    boss.vx = boss.facing * 4.5;
    boss.vy = -14;
    boss.y -= 1;               // despega del suelo para que actúe la gravedad
    boss.stateTimer = 160;
  } else if (next === 'rain') {
    spawnBossRain();
    boss.stateTimer = 80;
  }
}

// Al aterrizar: temblor y dos ondas de choque por el suelo (hay que saltarlas)
function bossSlam() {
  shake(16, 5);
  const fy = BOSS_FLOOR_Y + boss.h - 12;
  for (const dir of [-1, 1]) {
    boss.projectiles.push({
      type: 'wave', x: boss.x + boss.w / 2 + dir * 30, y: fy,
      vx: dir * (boss.phase === 2 ? 6.5 : 5), vy: 0, r: 12, life: 140,
    });
  }
}

// Lluvia del cetro: orbes que caen del cielo; antes se marca dónde caerán
function spawnBossRain() {
  const n = boss.phase === 2 ? 7 : 5;
  const px = player.x + player.w / 2;
  for (let i = 0; i < n; i++) {
    const off = i - (n - 1) / 2;
    boss.projectiles.push({
      type: 'rain', x: Math.max(30, Math.min(W - 30, px + off * 95)), y: -20,
      vx: 0, vy: 0, r: 10, life: 400, delay: 34 + Math.abs(off) * 10,
    });
  }
}

function checkBossCollisions() {
  if (currentRoom !== 4 || boss.dead) return;

  const atkW = 52, atkH = 30;
  const atkX = player.facing === 1 ? player.x + player.w : player.x - atkW;
  const atkY = player.y + 6;

  // Ataque del jugador golpea al jefe
  if (player.attackActive > 0 && boss.invFrames === 0 && boss.state !== 'roar' &&
      collideRect(atkX, atkY, atkW, atkH, boss.x, boss.y, boss.w, boss.h)) {
    boss.hp -= playerDmg;
    boss.invFrames = 28;
    if (boss.hp <= 0) { boss.hp = 0; boss.dead = true; boss.deathTimer = 130; boss.projectiles = []; return; }
  }

  // Pisotón al jefe
  const onBoss   = collideRect(player.x, player.y, player.w, player.h, boss.x, boss.y, boss.w, boss.h);
  const fromTop  = player.vy > 1 && (player.y + player.h) < (boss.y + boss.h * 0.5);
  if (onBoss && fromTop && boss.invFrames === 0 && boss.state !== 'roar') {
    boss.hp -= playerDmg;
    boss.invFrames = 28;
    player.vy = -12;
    if (boss.hp <= 0) { boss.hp = 0; boss.dead = true; boss.deathTimer = 130; boss.projectiles = []; return; }
  }

  // Cuerpo del jefe daña al jugador
  if (player.invFrames === 0 && !fromTop &&
      collideRect(player.x + 3, player.y + 3, player.w - 6, player.h - 3, boss.x, boss.y, boss.w, boss.h)) {
    if (!godMode) {
      player.hp--;
      if (player.hp <= 0) { player.hp = 0; isDeath = true; startTransition(0, 80, 400); return; }
    }
    player.invFrames = 90;
    const dir = (player.x + player.w / 2) < (boss.x + boss.w / 2) ? -1 : 1;
    player.vx = dir * 7; player.vy = -8;
  }

  // Proyectiles dañan al jugador
  for (let i = boss.projectiles.length - 1; i >= 0; i--) {
    const p = boss.projectiles[i];
    if (player.attackActive > 0 &&
        collideRect(atkX, atkY, atkW, atkH, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2)) {
      boss.projectiles.splice(i, 1); continue;
    }
    const dist = Math.hypot((player.x + player.w / 2) - p.x, (player.y + player.h / 2) - p.y);
    if (dist < p.r + 12 && player.invFrames === 0) {
      if (!godMode) {
        player.hp--;
        if (player.hp <= 0) { player.hp = 0; isDeath = true; startTransition(0, 80, 400); return; }
      }
      boss.projectiles.splice(i, 1);
      player.invFrames = 70;
      const dir = player.x < p.x ? -1 : 1;
      player.vx = dir * 5; player.vy = -6;
    }
  }
}

// Orbe mágico con núcleo, halo y pequeña estela
// Proyectiles de jefe según su tipo
function drawBossProjectile(p, rgb, core) {
  if (p.type === 'wave') {
    // onda de choque que avanza por el suelo
    const a = Math.min(1, p.life / 20);
    ctx.save();
    ctx.globalAlpha = a;
    const g = ctx.createRadialGradient(p.x, p.y + 12, 0, p.x, p.y + 12, 28);
    g.addColorStop(0, `rgba(${rgb},0.9)`); g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(p.x, p.y + 12, 16, 26, 0, Math.PI, 0); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(p.x, p.y + 12, 10, 18, 0, Math.PI, 0); ctx.stroke();
    // polvo que levanta
    ctx.fillStyle = 'rgba(200,180,160,0.5)';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.arc(p.x - Math.sign(p.vx) * (8 + i * 7), p.y + 10 - i * 2, 3 - i * 0.7, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    return;
  }
  if (p.type === 'rain' && p.delay > 0) {
    // aviso en el suelo de dónde caerá
    const floorY = BOSS_FLOOR_Y + boss.h;
    const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.02);
    ctx.save();
    ctx.strokeStyle = `rgba(${rgb},${(0.45 + 0.4 * pulse).toFixed(2)})`; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(p.x, floorY - 2, 16 + pulse * 3, 5, 0, 0, Math.PI * 2); ctx.stroke();
    const beam = ctx.createLinearGradient(0, 0, 0, floorY);
    beam.addColorStop(0, `rgba(${rgb},0)`); beam.addColorStop(1, `rgba(${rgb},0.18)`);
    ctx.fillStyle = beam; ctx.fillRect(p.x - 8, 0, 16, floorY);
    ctx.restore();
    return;
  }
  if (p.type === 'bat') {
    // murcielaguito
    const fl = Math.sin(p.flap) * 0.6;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(p.vx >= 0 ? 1 : -1, 1);
    ctx.fillStyle = '#1a0830';
    for (const s of [-1, 1]) {
      ctx.save(); ctx.scale(s, 1); ctx.rotate(fl);
      ctx.beginPath(); ctx.moveTo(2, 0); ctx.quadraticCurveTo(9, -9, 15, -3);
      ctx.quadraticCurveTo(11, -1, 12, 3); ctx.quadraticCurveTo(7, 1, 2, 4); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = vol(0, 0, 6, '#4a2470', '#12051e');
    ctx.beginPath(); ctx.ellipse(0, 1, 5, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-4, -3); ctx.lineTo(-3, -9); ctx.lineTo(-1, -4); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(4, -3); ctx.lineTo(3, -9); ctx.lineTo(1, -4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ff5070';
    ctx.beginPath(); ctx.arc(-1.8, 0, 1.2, 0, Math.PI * 2); ctx.arc(1.8, 0, 1.2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    return;
  }
  drawOrb(p, rgb, core);
}

// Aviso "¡!" sobre un jefe que va a atacar
function drawWarning(x, y, color) {
  const pulse = 1 + Math.sin(Date.now() * 0.03) * 0.12;
  ctx.save();
  ctx.translate(x, y); ctx.scale(pulse, pulse);
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.fillStyle = color;
  ctx.font = 'bold 18px Georgia, serif'; ctx.textAlign = 'center';
  ctx.fillText('!', 0, 6.5);
  ctx.restore();
}

// Anillos que salen al rugir / chillar
function drawRoarRings(x, y, t, rgb) {
  ctx.save();
  for (let i = 0; i < 3; i++) {
    const k = ((t + i / 3) % 1);
    ctx.strokeStyle = `rgba(${rgb},${(0.6 * (1 - k)).toFixed(2)})`;
    ctx.lineWidth = 4 * (1 - k) + 1;
    ctx.beginPath(); ctx.arc(x, y, 20 + k * 110, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}

function drawOrb(p, glowRGB, core) {
  const sp = Math.hypot(p.vx, p.vy) || 1;
  const tx = p.x - (p.vx / sp) * p.r * 2.4, ty = p.y - (p.vy / sp) * p.r * 2.4;
  const tg = ctx.createLinearGradient(tx, ty, p.x, p.y);
  tg.addColorStop(0, `rgba(${glowRGB},0)`); tg.addColorStop(1, `rgba(${glowRGB},0.55)`);
  ctx.strokeStyle = tg; ctx.lineWidth = p.r * 1.3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(p.x, p.y); ctx.stroke();
  const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2.4);
  g.addColorStop(0, `rgba(${glowRGB},0.85)`); g.addColorStop(1, `rgba(${glowRGB},0)`);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 2.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = vol(p.x, p.y, p.r, '#ffffff', core);
  ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
}

// Explosión final de un jefe: destello, onda y chispas de colores
function drawBossDeath(cx, cy, t, cols, maxDist) {
  const p = 1 - t;
  ctx.save();
  if (p < 0.25) {
    const fl = ctx.createRadialGradient(cx, cy, 0, cx, cy, 120);
    fl.addColorStop(0, `rgba(255,255,255,${(0.8 * (1 - p / 0.25)).toFixed(2)})`);
    fl.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = fl; ctx.beginPath(); ctx.arc(cx, cy, 120, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = t * 0.8;
  ctx.strokeStyle = cols[0]; ctx.lineWidth = 4 * t + 1;
  ctx.beginPath(); ctx.arc(cx, cy, p * maxDist * 1.1, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < 14; i++) {
    const angle = (i / 14) * Math.PI * 2 + p * 6;
    const dist  = p * maxDist;
    const x = cx + Math.cos(angle) * dist, y = cy + Math.sin(angle) * dist;
    const r = 9 * t + 2;
    ctx.globalAlpha = t;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 2);
    g.addColorStop(0, cols[i % cols.length]); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawBoss() {
  if (currentRoom !== 4) return;

  for (const p of boss.projectiles) drawBossProjectile(p, '180,60,255', '#a040e0');

  if (boss.dead) {
    if (boss.deathTimer <= 0) return;
    drawBossDeath(boss.x + boss.w / 2, boss.y + boss.h / 2, boss.deathTimer / 130,
      ['#ff4040','#ffaa00','#ff80ff','#ffffff','#40ffff','#ffff00'], 110);
    return;
  }

  const cx = Math.round(boss.x + boss.w / 2), cy = Math.round(boss.y + boss.h / 2);
  const hw = boss.w / 2, hh = boss.h / 2;
  const hy = -hh + 2;
  const t  = Date.now() * 0.002;
  const p2 = boss.phase === 2;
  const flicker = boss.invFrames > 0 && Math.floor(boss.invFrames / 4) % 2 === 0;

  ctx.save();
  // Sombra
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath(); ctx.ellipse(cx, cy + hh + 5, hw * 0.85, 7, 0, 0, Math.PI * 2); ctx.fill();

  ctx.translate(cx, cy);
  ctx.scale(boss.facing, 1);
  if (flicker) ctx.globalAlpha = 0.45;

  // Líneas de velocidad al embestir
  if (boss.state === 'charge') {
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      const y = -hh + 14 + i * 13, off = (Date.now() * 0.3 + i * 37) % 30;
      ctx.beginPath(); ctx.moveTo(-hw - 20 - off, y); ctx.lineTo(-hw - 50 - off, y); ctx.stroke();
    }
  }

  // Aura de llamas cuando está furioso (fase 2)
  if (p2) {
    for (let i = 0; i < 7; i++) {
      const fx = -hw + (i / 6) * boss.w, fl = Math.sin(t * 6 + i * 1.7);
      const fh = 26 + fl * 8 + (i % 2) * 8;
      const fg = ctx.createLinearGradient(0, hh, 0, hh - fh - 30);
      fg.addColorStop(0, 'rgba(255,90,30,0.55)'); fg.addColorStop(1, 'rgba(255,200,60,0)');
      ctx.fillStyle = fg;
      ctx.beginPath(); ctx.moveTo(fx - 10, hh);
      ctx.quadraticCurveTo(fx - 6 + fl * 4, hh - fh, fx + fl * 3, hh - fh - 30);
      ctx.quadraticCurveTo(fx + 6 + fl * 4, hh - fh, fx + 10, hh); ctx.closePath(); ctx.fill();
    }
  }

  // Respiración: se hincha un poco desde los pies
  let br = 1 + Math.sin(t * 2) * 0.025;
  if (boss.state === 'windup' && boss.windNext === 'jump') br = 0.86;
  ctx.translate(0, hh);
  if (boss.state === 'windup' && boss.windNext === 'charge') ctx.rotate(-0.12);
  ctx.scale(1, br); ctx.translate(0, -hh);

  // Capa real con pliegues y borde ondulante
  const capeG = ctx.createLinearGradient(0, -hh + 18, 0, hh + 12);
  capeG.addColorStop(0, p2 ? '#5a1414' : '#3a1c60');
  capeG.addColorStop(1, p2 ? '#1a0404' : '#10061e');
  ctx.fillStyle = capeG;
  const wave = Math.sin(t * 3) * 3;
  ctx.beginPath();
  ctx.moveTo(-hw - 10, -hh + 18);
  ctx.quadraticCurveTo(-hw - 18, 0, -hw - 16 - wave, hh + 10);
  ctx.quadraticCurveTo(-hw / 2, hh + 16 + wave, 0, hh + 10);
  ctx.quadraticCurveTo(hw / 2, hh + 16 - wave, hw + 16 + wave, hh + 10);
  ctx.quadraticCurveTo(hw + 18, 0, hw + 10, -hh + 18);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = p2 ? '#cc3311' : '#c8a000'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-hw - 16 - wave, hh + 10);
  ctx.quadraticCurveTo(-hw / 2, hh + 16 + wave, 0, hh + 10);
  ctx.quadraticCurveTo(hw / 2, hh + 16 - wave, hw + 16 + wave, hh + 10);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2;
  for (const fx of [-hw - 4, hw + 4]) {
    ctx.beginPath(); ctx.moveTo(fx, -hh + 24); ctx.quadraticCurveTo(fx * 1.1, 0, fx * 1.05, hh + 8); ctx.stroke();
  }

  // Cuerpo con volumen y pelaje
  ctx.fillStyle = vol(0, hh * 0.2, hw, p2 ? '#7a2c2c' : '#6e6e6e', p2 ? '#2e0c0c' : '#262626');
  ctx.beginPath(); ctx.ellipse(0, hh * 0.2, hw * 0.92, hh * 0.82, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = vol(2, hh * 0.35, hw * 0.55, p2 ? '#9a4a4a' : '#b4b4b4', p2 ? '#5a2020' : '#6a6a6a');
  ctx.beginPath(); ctx.ellipse(2, hh * 0.35, hw * 0.52, hh * 0.52, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const fy = hh * 0.1 + i * 6;
    ctx.beginPath(); ctx.moveTo(-6, fy); ctx.quadraticCurveTo(2, fy + 3, 10, fy); ctx.stroke();
  }

  // Cuello de armiño
  ctx.fillStyle = vol(0, hy + 20, 20, '#ffffff', '#cfc8b8');
  ctx.beginPath(); ctx.ellipse(0, hy + 20, 22, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1a1a1a';
  for (const sx of [-14, -5, 5, 14]) { ctx.beginPath(); ctx.ellipse(sx, hy + 20 + (sx % 2 ? 1 : -1), 1.4, 2.4, 0, 0, Math.PI * 2); ctx.fill(); }

  // Orejas
  for (const s of [-1, 1]) {
    ctx.fillStyle = vol(s * 17, hy - 18, 10, p2 ? '#5a1c1c' : '#5e5e5e', p2 ? '#240808' : '#2a2a2a');
    ctx.beginPath(); ctx.arc(s * 17, hy - 18, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = vol(s * 17, hy - 17, 5, '#e0a0a0', '#8a4a4a');
    ctx.beginPath(); ctx.arc(s * 17, hy - 17, 4.5, 0, Math.PI * 2); ctx.fill();
  }

  // Cabeza
  ctx.fillStyle = vol(0, hy, 21, p2 ? '#6a2a2a' : '#727272', p2 ? '#2a0a0a' : '#2e2e2e');
  ctx.beginPath(); ctx.arc(0, hy, 21, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 1.5; ctx.stroke();

  // Corona dorada con joyas
  const cc = p2 ? '#cc3311' : '#c8a000';
  const crownG = ctx.createLinearGradient(0, hy - 38, 0, hy - 12);
  crownG.addColorStop(0, p2 ? '#ff8a60' : '#fff0a0');
  crownG.addColorStop(0.5, cc);
  crownG.addColorStop(1, p2 ? '#6a1404' : '#7a5a00');
  ctx.fillStyle = crownG;
  ctx.beginPath();
  ctx.moveTo(-19, hy - 14); ctx.lineTo(-14, hy - 32); ctx.lineTo(-8,  hy - 17);
  ctx.lineTo(  0, hy - 38); ctx.lineTo( 8,  hy - 17); ctx.lineTo(14, hy - 32);
  ctx.lineTo( 19, hy - 14); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = p2 ? '#4a0a00' : '#5a4000'; ctx.lineWidth = 1.2; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.fillStyle = crownG;
  ctx.beginPath(); ctx.roundRect(-20, hy - 17, 40, 6, 2); ctx.fill(); ctx.stroke();
  const gem = p2 ? '#ff5533' : '#44ccff';
  for (const [gx, gy, gr] of [[-14, hy - 30, 3.5], [0, hy - 36, 4.5], [14, hy - 30, 3.5]]) {
    ctx.fillStyle = vol(gx, gy, gr, '#ffffff', gem);
    ctx.beginPath(); ctx.arc(gx, gy, gr, 0, Math.PI * 2); ctx.fill();
  }
  // destello que gira sobre la joya central
  const tw = (Math.sin(t * 3) + 1) / 2;
  ctx.save();
  ctx.translate(0, hy - 36); ctx.rotate(t);
  ctx.fillStyle = `rgba(255,255,255,${(0.9 * tw).toFixed(2)})`;
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2;
    ctx.lineTo(Math.cos(a) * 9 * tw, Math.sin(a) * 9 * tw);
    ctx.lineTo(Math.cos(a + Math.PI / 4) * 1.5, Math.sin(a + Math.PI / 4) * 1.5);
  }
  ctx.closePath(); ctx.fill();
  ctx.restore();

  // Máscara de mapache
  ctx.fillStyle = '#111111';
  ctx.beginPath(); ctx.ellipse(8, hy - 1, 13, 9, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(-2, hy - 6, 3, 8);

  // Parche de cuero en el otro ojo, con su cinta
  ctx.strokeStyle = '#2a1a10'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-13, hy - 3); ctx.quadraticCurveTo(-19, hy - 5, -21, hy - 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-4, hy - 6); ctx.quadraticCurveTo(0, hy - 12, 4, hy - 17); ctx.stroke();
  ctx.fillStyle = vol(-8, hy - 2, 7, '#5a4030', '#120a06');
  ctx.beginPath(); ctx.ellipse(-8, hy - 2, 6.5, 5.5, -0.2, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#0a0604'; ctx.lineWidth = 1; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,220,180,0.25)'; ctx.lineWidth = 0.8;
  ctx.setLineDash([1.5, 1.5]);
  ctx.beginPath(); ctx.ellipse(-8, hy - 2, 4.6, 3.8, -0.2, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]);

  // Ojo que brilla y late
  const ec = p2 ? '#ff2020' : '#ffcc00';
  const ep = 1 + 0.25 * Math.sin(t * 5);
  const eg = ctx.createRadialGradient(8, hy - 1, 0, 8, hy - 1, 12 * ep);
  eg.addColorStop(0, p2 ? 'rgba(255,144,144,0.9)' : 'rgba(255,238,136,0.9)');
  eg.addColorStop(1, 'rgba(255,200,100,0)');
  ctx.fillStyle = eg;
  ctx.beginPath(); ctx.arc(8, hy - 1, 12 * ep, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = vol(8, hy - 1, 5.5, '#ffffff', ec);
  ctx.beginPath(); ctx.arc(8, hy - 1, 5.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1a0a00';
  ctx.beginPath(); ctx.ellipse(8.6, hy - 1, 1.4, 3.8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(6.5, hy - 2.8, 1.6, 0, Math.PI * 2); ctx.fill();
  // ceja enfadada
  ctx.strokeStyle = '#0a0a0a'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(1, hy - 10); ctx.lineTo(17, hy - 6); ctx.stroke();

  // Hocico, nariz, colmillo y bigotes
  ctx.fillStyle = vol(-2, hy + 9, 10, p2 ? '#9a6060' : '#c8b8b8', p2 ? '#4a2020' : '#7a6a6a');
  ctx.beginPath(); ctx.ellipse(-2, hy + 9, 10, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = vol(-2, hy + 6, 4, '#555', '#000');
  ctx.beginPath(); ctx.ellipse(-2, hy + 6, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath(); ctx.arc(-3.4, hy + 5, 1, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#2a1a1a'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(-8, hy + 13); ctx.quadraticCurveTo(-2, hy + 11, 5, hy + 13); ctx.stroke();
  ctx.fillStyle = '#fffaf0';
  ctx.beginPath(); ctx.moveTo(1, hy + 12.4); ctx.lineTo(3, hy + 16); ctx.lineTo(4.4, hy + 12.6); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 1; ctx.lineCap = 'round';
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(s * 4, hy + 9);  ctx.lineTo(s * 23, hy + 7);  ctx.stroke();
    ctx.beginPath(); ctx.moveTo(s * 4, hy + 11); ctx.lineTo(s * 23, hy + 13); ctx.stroke();
  }

  // Cetro real con orbe que brilla
  const shaft = ctx.createLinearGradient(hw + 5, 0, hw + 22, 0);
  shaft.addColorStop(0, p2 ? '#ff7a50' : '#fff0a0'); shaft.addColorStop(1, p2 ? '#6a1404' : '#7a5a00');
  ctx.strokeStyle = shaft; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(hw + 5, -hh + 26); ctx.lineTo(hw + 22, -hh - 12); ctx.stroke();
  ctx.strokeStyle = p2 ? '#4a0a00' : '#5a4000'; ctx.lineWidth = 2;
  for (const k of [0.3, 0.7]) {
    const rx = hw + 5 + 17 * k, ry = -hh + 26 - 38 * k;
    ctx.beginPath(); ctx.moveTo(rx - 4, ry - 1.5); ctx.lineTo(rx + 4, ry + 1.5); ctx.stroke();
  }
  const orbC = p2 ? '#ff4040' : '#44ccff';
  const op = 0.6 + 0.4 * Math.sin(t * 4);
  const og = ctx.createRadialGradient(hw + 22, -hh - 12, 0, hw + 22, -hh - 12, 18);
  og.addColorStop(0, hexAlpha(orbC, 0.6 * op)); og.addColorStop(1, hexAlpha(orbC, 0));
  ctx.fillStyle = og; ctx.beginPath(); ctx.arc(hw + 22, -hh - 12, 18, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = vol(hw + 22, -hh - 12, 7, '#ffffff', orbC);
  ctx.beginPath(); ctx.arc(hw + 22, -hh - 12, 7, 0, Math.PI * 2); ctx.fill();

  ctx.restore();

  // Aviso, rugido y cetro alzado para la lluvia
  if (boss.state === 'windup') drawWarning(cx, cy - hh - 52, p2 ? '#ff5533' : '#ffd040');
  if (boss.state === 'roar') drawRoarRings(cx, cy + hy, (Date.now() * 0.0015) % 1, '255,90,40');
  if (boss.state === 'rain' || (boss.state === 'windup' && boss.windNext === 'rain')) {
    const ox = cx + boss.facing * (hw + 22), oy = cy - hh - 12;
    const rg = ctx.createRadialGradient(ox, oy, 0, ox, oy, 46);
    rg.addColorStop(0, 'rgba(255,120,120,0.7)'); rg.addColorStop(1, 'rgba(255,60,60,0)');
    ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(ox, oy, 46, 0, Math.PI * 2); ctx.fill();
    const bm = ctx.createLinearGradient(0, 0, 0, oy);
    bm.addColorStop(0, 'rgba(255,90,90,0)'); bm.addColorStop(1, 'rgba(255,90,90,0.35)');
    ctx.fillStyle = bm; ctx.fillRect(ox - 5, 0, 10, oy);
  }
}

function drawBossUI() {
  if (currentRoom !== 4) return;

  // Puerta de hierro (bloqueada mientras vive el jefe)
  if (!bossDefeated) {
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(0, 100, 20, H - 200);
    for (let yg = 108; yg < H - 108; yg += 44) {
      ctx.fillStyle = '#3a3a48';
      ctx.fillRect(0, yg, 20, 28);
      ctx.fillStyle = '#545464';
      ctx.fillRect(2, yg + 2, 5, 24);
    }
    ctx.strokeStyle = '#2a2a38'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(0, H / 2 - 10); ctx.lineTo(26, H / 2 - 10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, H / 2 + 10); ctx.lineTo(26, H / 2 + 10); ctx.stroke();
  }

  // Barra de vida del jefe
  if (!boss.dead) {
    const barW = 400, barH = 18;
    const bx = (W - barW) / 2, by = H - 44;
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    ctx.fillRect(bx - 6, by - 26, barW + 12, barH + 36);
    ctx.fillStyle = boss.phase === 2 ? '#cc2222' : '#9922cc';
    ctx.font = 'bold 14px serif';
    ctx.textAlign = 'center';
    ctx.fillText('✦  ÚLTIMO REY  ✦', W / 2, by - 8);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(bx, by, barW, barH);
    const fill = (boss.hp / boss.maxHp) * barW;
    ctx.fillStyle = boss.phase === 2 ? '#cc2233' : '#9922dd';
    ctx.fillRect(bx, by, fill, barH);
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(bx, by, fill, barH / 2);
    ctx.strokeStyle = boss.phase === 2 ? '#ff5544' : '#cc55ff';
    ctx.lineWidth = 1.5; ctx.strokeRect(bx, by, barW, barH);
  }

  // Mensaje de victoria
  if (bossDefeated && boss.deathTimer === 0) {
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = '#ffe060';
    ctx.font = 'bold 34px serif';
    ctx.textAlign = 'center';
    ctx.fillText('¡Victoria!  El rey ha caído.', W / 2, 110);
    ctx.font = '18px serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('La salida está abierta →← …regresa a la izquierda', W / 2, 144);
    // Brillo dorado en la salida
    const pulse = 0.3 + 0.2 * Math.sin(Date.now() * 0.004);
    const g = ctx.createLinearGradient(0, 0, 70, 0);
    g.addColorStop(0, `rgba(255,220,80,${pulse})`); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.globalAlpha = 1;
    ctx.fillRect(0, 100, 70, H - 200);
    ctx.restore();
  }
}
