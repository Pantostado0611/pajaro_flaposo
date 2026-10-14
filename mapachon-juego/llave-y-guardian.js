// ─── LLAVE ────────────────────────────────────────────────────────────────────
function updateKey() {
  if (!keyItem.active || hasKey) return;
  keyItem.bobTimer += 0.055;
  if (currentRoom !== 4) return;
  if (collideRect(player.x, player.y, player.w, player.h,
      keyItem.x - 4, keyItem.y - 12, 40, 28)) {
    hasKey = true;
    keyItem.active = false;
  }
}

function drawKey() {
  if (currentRoom !== 4 || !keyItem.active || hasKey) return;
  const kx = keyItem.x;
  const ky = keyItem.y + Math.sin(keyItem.bobTimer) * 6;
  const t  = Date.now() * 0.003;
  ctx.save();
  ctx.translate(kx, ky);
  // Halo dorado
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 30);
  g.addColorStop(0, 'rgba(255,200,40,0.55)'); g.addColorStop(1, 'rgba(255,200,40,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.fill();
  ctx.rotate(Math.sin(t) * 0.12);
  const gold = ctx.createLinearGradient(0, -10, 0, 10);
  gold.addColorStop(0, '#fff6c0'); gold.addColorStop(0.45, '#ffd040'); gold.addColorStop(1, '#a87800');
  // Cabeza de la llave
  ctx.strokeStyle = gold; ctx.lineWidth = 4.5;
  ctx.beginPath(); ctx.arc(-8, 0, 9, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = 'rgba(120,80,0,0.6)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(-8, 0, 11.3, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = 'rgba(255,220,80,0.25)';
  ctx.beginPath(); ctx.arc(-8, 0, 6.5, 0, Math.PI * 2); ctx.fill();
  // Mango y dientes
  ctx.fillStyle = gold;
  ctx.beginPath(); ctx.roundRect(-1, -3, 23, 6, 2); ctx.fill();
  ctx.beginPath(); ctx.roundRect(13, 2, 4, 8, 1); ctx.fill();
  ctx.beginPath(); ctx.roundRect(19, 2, 3, 6, 1); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillRect(1, -2.4, 19, 1.2);
  // Destellos
  for (const [sx, sy, ph] of [[-14, -9, 0], [18, -6, 2.1]]) {
    const s = Math.max(0, Math.sin(t * 2 + ph)) * 5;
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.moveTo(sx, sy - s); ctx.lineTo(sx + 1, sy - 1); ctx.lineTo(sx + s, sy); ctx.lineTo(sx + 1, sy + 1);
    ctx.lineTo(sx, sy + s); ctx.lineTo(sx - 1, sy + 1); ctx.lineTo(sx - s, sy); ctx.lineTo(sx - 1, sy - 1);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

function drawKeyHUD() {
  if (!hasKey && !keyUsed) return;
  // Icono de llave en HUD (junto a los corazones)
  const kx = 22 + player.maxHp * 28 + 16;
  const ky = 44;
  ctx.save();
  ctx.translate(kx, ky);
  ctx.globalAlpha = hasKey ? 1 : 0.35;
  ctx.strokeStyle = hasKey ? '#ffd040' : '#888'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(-5, 0, 6, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = hasKey ? '#ffd040' : '#888';
  ctx.fillRect(-1, -2, 13, 4);
  ctx.fillRect( 7,  2, 3, 5);
  ctx.fillRect(10,  2, 2, 4);
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawKeyGate() {
  // Reja dorada en la salida superior de sala 1
  if (currentRoom !== 1 || keyUsed) return;
  const gx = 370, gw = 220;
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(gx, 0, gw, 22);
  const barCol  = hasKey ? '#c8a000' : '#4a4858';
  const shinCol = hasKey ? 'rgba(255,220,80,0.3)' : 'rgba(255,255,255,0.06)';
  for (let bx = gx + 8; bx < gx + gw - 8; bx += 26) {
    ctx.fillStyle = barCol;
    ctx.fillRect(bx, 0, 14, 22);
    ctx.fillStyle = shinCol;
    ctx.fillRect(bx + 2, 0, 5, 22);
  }
  // Ícono de candado en el centro
  if (!hasKey) {
    const lx = gx + gw / 2, ly = 10;
    ctx.fillStyle = '#6a6a88';
    ctx.fillRect(lx - 6, ly - 4, 12, 9);
    ctx.strokeStyle = '#6a6a88'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(lx, ly - 4, 5, Math.PI, 0); ctx.stroke();
  }
  // Texto de pista si el jefe del trono está muerto
  if (bossDefeated && !hasKey) {
    const pulse = 0.6 + 0.4 * Math.sin(Date.now() * 0.004);
    ctx.globalAlpha = pulse;
    ctx.fillStyle = '#ffd040'; ctx.font = '13px serif'; ctx.textAlign = 'center';
    ctx.fillText('¡Recoge la llave del rey!', W / 2, 44);
    ctx.globalAlpha = 1;
  }
  if (hasKey) {
    const pulse = 0.6 + 0.4 * Math.sin(Date.now() * 0.005);
    ctx.globalAlpha = pulse;
    ctx.fillStyle = '#ffd040'; ctx.font = '13px serif'; ctx.textAlign = 'center';
    ctx.fillText('Presiona ↑ para abrir con la llave', W / 2, 44);
    ctx.globalAlpha = 1;
  }
}

// ─── JEFE 2 ───────────────────────────────────────────────────────────────────
function initBoss2() {
  Object.assign(boss2, {
    x: 440, y: BOSS2_HOVER_Y,
    vx: 0, vy: 0,
    hp: 12, state: 'hover', stateTimer: 90,
    swoopPhase: 'down', phase: 1, invFrames: 0, facing: 1,
    dead: false, deathTimer: 0, projectiles: [],
    alpha: 1, shrieked: false, spiralA: 0, blinkPhase: 'out',
  });
  boss2AttackIdx = 0;
}

function fireBoss2Burst() {
  const cx = boss2.x + boss2.w / 2, cy = boss2.y + boss2.h / 2;
  const count = boss2.phase === 2 ? 8 : 6;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    boss2.projectiles.push({ x: cx, y: cy, vx: Math.cos(a) * 4, vy: Math.sin(a) * 4, r: 8, life: 240 });
  }
}

// Murcielaguitos que persiguen al jugador (un golpe o un disparo los destruye)
function summonBats() {
  const n = boss2.phase === 2 ? 3 : 2;
  const cx = boss2.x + boss2.w / 2, cy = boss2.y + boss2.h / 2;
  for (let i = 0; i < n; i++) {
    const a = Math.PI * 0.25 + (i / Math.max(1, n - 1)) * Math.PI * 0.5;
    boss2.projectiles.push({ type: 'bat', x: cx, y: cy, vx: Math.cos(a) * 3 * (i % 2 ? 1 : -1), vy: Math.sin(a) * 2, r: 8, life: 420, flap: i });
  }
}

function updateBoss2() {
  if (currentRoom !== 3) return;

  for (const p of boss2.projectiles) {
    if (p.type === 'bat') {
      const dx = player.x + player.w / 2 - p.x, dy = player.y + player.h / 2 - p.y;
      const d = Math.hypot(dx, dy) || 1;
      p.vx += dx / d * 0.12; p.vy += dy / d * 0.12;
      const sp = Math.hypot(p.vx, p.vy), max = 2.6;
      if (sp > max) { p.vx *= max / sp; p.vy *= max / sp; }
      p.x += p.vx; p.y += p.vy; p.flap += 0.3; p.life--;
    } else if (p.type === 'spiral') {
      p.x += p.vx; p.y += p.vy; p.life--;
    } else {
      p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life--;
    }
  }
  boss2.projectiles = boss2.projectiles.filter(
    p => p.life > 0 && p.x > -30 && p.x < W + 30 && p.y < H + 30 && p.y > -60
  );

  if (boss2.dead) {
    if (boss2.deathTimer > 0) { boss2.deathTimer--; }
    else if (!boss2Defeated)  {
      boss2Defeated = true;
      addMoney(MONEY_BOSS, boss2.x + boss2.w / 2, boss2.y);
    }
    return;
  }

  if (boss2.invFrames > 0) boss2.invFrames--;
  const newPhase = boss2.hp <= 6 ? 2 : 1;
  // Chillido al pasar a la fase 2
  if (newPhase === 2 && !boss2.shrieked) {
    boss2.shrieked = true;
    boss2.state = 'shriek'; boss2.stateTimer = 60;
    boss2.vx = 0; boss2.vy = 0; boss2.alpha = 1; boss2.projectiles = [];
    shake(36, 6);
  }
  boss2.phase = newPhase;
  boss2.stateTimer--;

  const hoverDrift = () => {
    const targetX = W / 2 + Math.sin(Date.now() * 0.0009) * 220;
    boss2.vx += (targetX - (boss2.x + boss2.w / 2)) * 0.004;
    boss2.vx  = Math.max(-3.5, Math.min(3.5, boss2.vx));
    boss2.x  += boss2.vx;
    boss2.y   = BOSS2_HOVER_Y + Math.sin(Date.now() * 0.003) * 14;
    boss2.facing = boss2.vx > 0 ? 1 : -1;
  };
  const toHover = (timer) => { boss2.state = 'hover'; boss2.stateTimer = timer; };

  if (boss2.state === 'shriek') {
    boss2.y = BOSS2_HOVER_Y + Math.sin(Date.now() * 0.05) * 3;
    if (boss2.stateTimer <= 0) {
      const cx = boss2.x + boss2.w / 2, cy = boss2.y + boss2.h / 2;
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        boss2.projectiles.push({ type: 'spiral', x: cx, y: cy, vx: Math.cos(a) * 3.4, vy: Math.sin(a) * 3.4, r: 8, life: 220 });
      }
      toHover(45);
    }

  } else if (boss2.state === 'hover') {
    hoverDrift();
    if (boss2.stateTimer <= 0) {
      const pattern = boss2.phase === 2
        ? ['swoop','spiral','blink','swoop','summon','burst','blink','swoop']
        : ['swoop','burst','summon','swoop','burst'];
      const next = pattern[boss2AttackIdx % pattern.length];
      boss2AttackIdx++;

      if (next === 'burst') {
        fireBoss2Burst();
        boss2.stateTimer = boss2.phase === 2 ? 40 : 55;
      } else if (next === 'summon') {
        summonBats();
        boss2.stateTimer = 60;
      } else if (next === 'spiral') {
        boss2.state = 'spiral'; boss2.stateTimer = 75; boss2.vx = 0;
      } else if (next === 'blink') {
        boss2.state = 'blink'; boss2.blinkPhase = 'out'; boss2.stateTimer = 20;
      } else {
        // aviso antes de lanzarse en picado
        boss2.state = 'swoopPrep';
        boss2.stateTimer = boss2.phase === 2 ? 14 : 22;
      }
    }

  } else if (boss2.state === 'swoopPrep') {
    boss2.vx *= 0.8; boss2.x += boss2.vx;
    const pdx = (player.x + player.w / 2) - (boss2.x + boss2.w / 2);
    boss2.facing = pdx > 0 ? 1 : -1;
    if (boss2.stateTimer <= 0) {
      boss2.state = 'swoop';
      boss2.swoopPhase = 'down';
      boss2.stateTimer = 200;
    }

  } else if (boss2.state === 'spiral') {
    boss2.y = BOSS2_HOVER_Y + Math.sin(Date.now() * 0.003) * 6;
    if (boss2.stateTimer % 5 === 0) {
      const cx = boss2.x + boss2.w / 2, cy = boss2.y + boss2.h / 2;
      for (const off of [0, Math.PI]) {
        const a = boss2.spiralA + off;
        boss2.projectiles.push({ type: 'spiral', x: cx, y: cy, vx: Math.cos(a) * 3, vy: Math.sin(a) * 3, r: 7, life: 220 });
      }
      boss2.spiralA += 0.35;
    }
    if (boss2.stateTimer <= 0) toHover(45);

  } else if (boss2.state === 'blink') {
    if (boss2.blinkPhase === 'out') {
      boss2.alpha = Math.max(0, boss2.stateTimer / 20);
      if (boss2.stateTimer <= 0) {
        // reaparece encima del jugador, a un lado
        const side = Math.random() < 0.5 ? -1 : 1;
        boss2.x = Math.max(40, Math.min(W - 40 - boss2.w, player.x + side * 170));
        boss2.y = BOSS2_HOVER_Y;
        boss2.blinkPhase = 'in'; boss2.stateTimer = 20;
      }
    } else {
      boss2.alpha = Math.min(1, 1 - boss2.stateTimer / 20);
      if (boss2.stateTimer <= 0) {
        boss2.alpha = 1;
        fireBoss2Burst();
        toHover(40);
      }
    }

  } else if (boss2.state === 'swoop') {
    const spd = boss2.phase === 2 ? 1.1 : 0.8;
    if (boss2.swoopPhase === 'down') {
      const pdx = (player.x + player.w / 2) - (boss2.x + boss2.w / 2);
      boss2.vx += Math.sign(pdx) * spd;
      boss2.vx  = Math.max(-10, Math.min(10, boss2.vx));
      boss2.vy += spd * 0.9;
      boss2.vy  = Math.min(11, boss2.vy);
      boss2.x  += boss2.vx;
      boss2.y  += boss2.vy;
      boss2.facing = boss2.vx > 0 ? 1 : -1;
      if (boss2.y > 370 || boss2.stateTimer <= 80) {
        boss2.swoopPhase = 'up';
        boss2.vy = -14;
      }
    } else {
      boss2.vx *= 0.92;
      boss2.vy *= 0.92;
      boss2.x  += boss2.vx;
      boss2.y  += boss2.vy;
      if (boss2.y <= BOSS2_HOVER_Y) {
        boss2.y = BOSS2_HOVER_Y; boss2.vy = 0; boss2.vx = 0;
        toHover(boss2.phase === 2 ? 35 : 55);
      }
    }
    if (boss2.stateTimer <= 0) {
      boss2.y = BOSS2_HOVER_Y; boss2.vy = 0; boss2.vx = 0;
      toHover(45);
    }
  }
}

function checkBoss2Collisions() {
  if (currentRoom !== 3 || boss2.dead) return;

  const atkW = 52, atkH = 30;
  const atkX = player.facing === 1 ? player.x + player.w : player.x - atkW;
  const atkY = player.y + 6;

  const b2solid = boss2.state !== 'shriek' && boss2.alpha > 0.5;
  if (player.attackActive > 0 && boss2.invFrames === 0 && b2solid &&
      collideRect(atkX, atkY, atkW, atkH, boss2.x, boss2.y, boss2.w, boss2.h)) {
    boss2.hp -= playerDmg;
    boss2.invFrames = 26;
    if (boss2.hp <= 0) { boss2.hp = 0; boss2.dead = true; boss2.deathTimer = 150; boss2.projectiles = []; return; }
  }

  const onBoss2  = collideRect(player.x, player.y, player.w, player.h, boss2.x, boss2.y, boss2.w, boss2.h);
  const fromTop2 = player.vy > 1 && (player.y + player.h) < (boss2.y + boss2.h * 0.5);
  if (onBoss2 && fromTop2 && boss2.invFrames === 0 && b2solid) {
    boss2.hp -= playerDmg;
    boss2.invFrames = 26;
    player.vy = -13;
    if (boss2.hp <= 0) { boss2.hp = 0; boss2.dead = true; boss2.deathTimer = 150; boss2.projectiles = []; return; }
  }

  if (player.invFrames === 0 && !fromTop2 && boss2.alpha > 0.5 &&
      collideRect(player.x + 3, player.y + 3, player.w - 6, player.h - 3, boss2.x, boss2.y, boss2.w, boss2.h)) {
    if (!godMode) {
      player.hp--;
      if (player.hp <= 0) { player.hp = 0; isDeath = true; startTransition(0, 80, 400); return; }
    }
    player.invFrames = 90;
    const dir = (player.x + player.w / 2) < (boss2.x + boss2.w / 2) ? -1 : 1;
    player.vx = dir * 7; player.vy = -8;
  }

  for (let i = boss2.projectiles.length - 1; i >= 0; i--) {
    const p = boss2.projectiles[i];
    if (player.attackActive > 0 &&
        collideRect(atkX, atkY, atkW, atkH, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2)) {
      boss2.projectiles.splice(i, 1); continue;
    }
    const dist = Math.hypot((player.x + player.w / 2) - p.x, (player.y + player.h / 2) - p.y);
    if (dist < p.r + 12 && player.invFrames === 0) {
      if (!godMode) {
        player.hp--;
        if (player.hp <= 0) { player.hp = 0; isDeath = true; startTransition(0, 80, 400); return; }
      }
      boss2.projectiles.splice(i, 1);
      player.invFrames = 70;
      const dir = player.x < p.x ? -1 : 1;
      player.vx = dir * 5; player.vy = -6;
    }
  }
}

function drawBoss2() {
  if (currentRoom !== 3) return;

  for (const p of boss2.projectiles) drawBossProjectile(p, '220,130,255', '#c070ff');

  if (boss2.dead) {
    if (boss2.deathTimer <= 0) return;
    drawBossDeath(boss2.x + boss2.w / 2, boss2.y + boss2.h / 2, boss2.deathTimer / 150,
      ['#ff80ff','#ffffff','#8080ff','#ffff80','#80ffff','#ff80a0'], 130);
    return;
  }

  const cx = Math.round(boss2.x + boss2.w / 2), cy = Math.round(boss2.y + boss2.h / 2);
  const hw = boss2.w / 2, hh = boss2.h / 2;
  const hy = -hh + 4;
  const t  = Date.now() * 0.002;
  const p2 = boss2.phase === 2;
  const base = (boss2.invFrames > 0 && Math.floor(boss2.invFrames / 4) % 2 === 0 ? 0.35 : 1) * (boss2.alpha ?? 1);
  const main = p2 ? '255,32,96' : '96,32,192';   // color del aura

  ctx.save();
  ctx.translate(cx, cy);

  // Aura fantasmal
  const aura = ctx.createRadialGradient(0, 0, 10, 0, 0, hw * 1.8);
  aura.addColorStop(0, `rgba(${main},${(0.3 * base).toFixed(2)})`);
  aura.addColorStop(1, `rgba(${main},0)`);
  ctx.fillStyle = aura; ctx.beginPath(); ctx.arc(0, 0, hw * 1.8, 0, Math.PI * 2); ctx.fill();

  // Chispas que giran alrededor
  for (let i = 0; i < 6; i++) {
    const a = t * 1.5 + i * Math.PI / 3, r = hw + 18 + Math.sin(t * 3 + i) * 6;
    ctx.globalAlpha = base * (0.5 + 0.5 * Math.sin(t * 4 + i));
    ctx.fillStyle = p2 ? '#ffb0c8' : '#d8b0ff';
    ctx.beginPath(); ctx.arc(Math.cos(a) * r, Math.sin(a) * r * 0.6, 1.8, 0, Math.PI * 2); ctx.fill();
  }

  ctx.scale(boss2.facing, 1);

  // Estela fantasmal
  ctx.globalAlpha = base * 0.16;
  ctx.fillStyle = p2 ? '#ff2060' : '#6020c0';
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath();
    ctx.ellipse(-boss2.vx * i * 2.5, -boss2.vy * i * 1.5, hw * 0.75, hh * 0.75, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = base;

  // Alas de murciélago con membrana y huesos
  const wf = Math.sin(t * 5) * 0.28;
  const tip = -18 + Math.sin(t * 4) * 10;
  const wingG = ctx.createLinearGradient(0, -20, 0, 24);
  wingG.addColorStop(0, p2 ? '#4a1028' : '#2a1458');
  wingG.addColorStop(1, p2 ? '#14040c' : '#0a0420');
  for (const s of [-1, 1]) {
    ctx.save();
    ctx.rotate(s * -wf);
    ctx.scale(s, 1);
    ctx.fillStyle = wingG;
    ctx.beginPath();
    ctx.moveTo(-hw, 4);
    ctx.quadraticCurveTo(-hw - 30, tip - 14, -hw - 58, tip);
    ctx.quadraticCurveTo(-hw - 50, 4, -hw - 46, 16);
    ctx.quadraticCurveTo(-hw - 38, 8, -hw - 30, 20);
    ctx.quadraticCurveTo(-hw - 22, 12, -hw - 14, 22);
    ctx.quadraticCurveTo(-hw - 8, 14, -hw, 18);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = p2 ? 'rgba(255,120,170,0.5)' : 'rgba(170,120,255,0.5)'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-hw, 6); ctx.lineTo(-hw - 58, tip);
    ctx.moveTo(-hw - 20, tip * 0.5 - 4); ctx.lineTo(-hw - 46, 16);
    ctx.moveTo(-hw - 14, tip * 0.4 - 2); ctx.lineTo(-hw - 30, 20);
    ctx.stroke();
    ctx.restore();
  }

  // Cola fantasmal en tres jirones
  for (let k = 0; k < 3; k++) {
    ctx.globalAlpha = base * (0.45 - k * 0.1);
    ctx.fillStyle = p2 ? '#4a0a2a' : '#26104e';
    const off = (k - 1) * 10, sw = Math.sin(t * 3 + k) * 10;
    ctx.beginPath();
    ctx.moveTo(-hw * 0.6 + off, hh - 4);
    ctx.quadraticCurveTo(-hw * 0.4 + off + sw, hh + 22, off + sw * 1.4, hh + 40 + k * 4);
    ctx.quadraticCurveTo(hw * 0.4 + off + sw, hh + 22, hw * 0.6 + off, hh - 4);
    ctx.closePath(); ctx.fill();
  }

  // Cuerpo fantasmal con brillo interior
  ctx.globalAlpha = base * 0.92;
  ctx.fillStyle = vol(0, hh * 0.1, hw * 0.9, p2 ? '#5a1a34' : '#2e1660', p2 ? '#14040c' : '#08031a');
  ctx.beginPath(); ctx.ellipse(0, hh * 0.1, hw * 0.88, hh * 0.85, 0, 0, Math.PI * 2); ctx.fill();
  const core = ctx.createRadialGradient(2, hh * 0.28, 0, 2, hh * 0.28, hw * 0.55);
  core.addColorStop(0, p2 ? 'rgba(255,90,140,0.55)' : 'rgba(170,110,255,0.55)');
  core.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = core;
  ctx.beginPath(); ctx.ellipse(2, hh * 0.28, hw * 0.5, hh * 0.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = base;

  // Orejas
  for (const s of [-1, 1]) {
    ctx.fillStyle = vol(s * 17, hy - 18, 10, p2 ? '#4a1428' : '#2a1450', p2 ? '#14040c' : '#08031a');
    ctx.beginPath(); ctx.arc(s * 17, hy - 18, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = vol(s * 17, hy - 17, 5, p2 ? '#c05a8a' : '#9a70d0', p2 ? '#5a1a3a' : '#40206a');
    ctx.beginPath(); ctx.arc(s * 17, hy - 17, 4.5, 0, Math.PI * 2); ctx.fill();
  }

  // Cabeza
  ctx.fillStyle = vol(0, hy, 22, p2 ? '#4a1428' : '#2a1450', p2 ? '#12040a' : '#070214');
  ctx.beginPath(); ctx.arc(0, hy, 22, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = p2 ? 'rgba(255,100,150,0.35)' : 'rgba(160,110,255,0.35)'; ctx.lineWidth = 1.5; ctx.stroke();

  // Corona espectral que brilla
  const cc2 = p2 ? '#cc2040' : '#9030e0';
  ctx.save();
  ctx.shadowColor = cc2; ctx.shadowBlur = 14;
  const crownG = ctx.createLinearGradient(0, hy - 40, 0, hy - 17);
  crownG.addColorStop(0, p2 ? '#ffb0c0' : '#e0c0ff'); crownG.addColorStop(1, cc2);
  ctx.fillStyle = crownG;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath(); ctx.moveTo(i * 11 - 5, hy - 17); ctx.lineTo(i * 11, hy - (i === 0 ? 40 : 34)); ctx.lineTo(i * 11 + 5, hy - 17); ctx.closePath(); ctx.fill();
  }
  ctx.strokeStyle = cc2; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(0, hy - 17, 16, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
  ctx.restore();

  // Máscara (dos ojos)
  ctx.fillStyle = '#060010';
  ctx.beginPath(); ctx.ellipse(8, hy - 1, 13, 9, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-9, hy - 1.5, 10, 8, -0.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(-2, hy - 6, 3, 8);

  // Segundo ojo (un poco más pequeño, por la perspectiva)
  const ecB = p2 ? '#ff1850' : '#a030ff';
  const epB = 1 + 0.3 * Math.sin(t * 4.5 + 0.6);
  ctx.save();
  const egB = ctx.createRadialGradient(-9, hy - 1.5, 0, -9, hy - 1.5, 11 * epB);
  egB.addColorStop(0, p2 ? 'rgba(255,170,192,0.85)' : 'rgba(208,160,255,0.85)'); egB.addColorStop(1, 'rgba(160,80,255,0)');
  ctx.fillStyle = egB;
  ctx.beginPath(); ctx.arc(-9, hy - 1.5, 11 * epB, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = vol(-9, hy - 1.5, 5, '#ffffff', ecB);
  ctx.beginPath(); ctx.arc(-9, hy - 1.5, 5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#10001a';
  ctx.beginPath(); ctx.ellipse(-8.4, hy - 1.5, 1.3, 3.4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(-10.4, hy - 3.2, 1.5, 0, Math.PI * 2); ctx.fill();

  // Ojo grande que late
  const ec2 = p2 ? '#ff1850' : '#a030ff';
  const ep2v = 1 + 0.3 * Math.sin(t * 4.5);
  ctx.save();
  ctx.shadowColor = ec2; ctx.shadowBlur = 16;
  const eg2 = ctx.createRadialGradient(8, hy - 1, 0, 8, hy - 1, 14 * ep2v);
  eg2.addColorStop(0, p2 ? 'rgba(255,170,192,0.9)' : 'rgba(208,160,255,0.9)'); eg2.addColorStop(1, 'rgba(160,80,255,0)');
  ctx.fillStyle = eg2;
  ctx.beginPath(); ctx.arc(8, hy - 1, 14 * ep2v, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = vol(8, hy - 1, 6.5, '#ffffff', ec2);
  ctx.beginPath(); ctx.arc(8, hy - 1, 6.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#10001a';
  ctx.beginPath(); ctx.ellipse(8.8, hy - 1, 1.6, 4.4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(6, hy - 3, 2, 0, Math.PI * 2); ctx.fill();

  // Hocico y bigotes
  ctx.fillStyle = vol(-2, hy + 9, 10, p2 ? '#6a2a44' : '#3e2266', p2 ? '#2a0a18' : '#160830');
  ctx.beginPath(); ctx.ellipse(-2, hy + 9, 10, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#050010';
  ctx.beginPath(); ctx.ellipse(-2, hy + 6, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 0.9; ctx.lineCap = 'round';
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(s * 4, hy + 9);  ctx.lineTo(s * 22, hy + 7);  ctx.stroke();
    ctx.beginPath(); ctx.moveTo(s * 4, hy + 11); ctx.lineTo(s * 22, hy + 13); ctx.stroke();
  }

  ctx.restore();

  if (boss2.state === 'swoopPrep') drawWarning(cx, cy - hh - 50, p2 ? '#ff4070' : '#c080ff');
  if (boss2.state === 'shriek') drawRoarRings(cx, cy, (Date.now() * 0.0018) % 1, p2 ? '255,60,120' : '180,90,255');
  if (boss2.state === 'spiral') {
    // círculo mágico que gira
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(Date.now() * 0.003);
    ctx.strokeStyle = 'rgba(255,120,180,0.5)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, hw + 22, 0, Math.PI * 2); ctx.stroke();
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3;
      ctx.beginPath(); ctx.moveTo(Math.cos(a) * (hw + 22), Math.sin(a) * (hw + 22));
      ctx.lineTo(Math.cos(a + Math.PI / 1.5) * (hw + 22), Math.sin(a + Math.PI / 1.5) * (hw + 22)); ctx.stroke();
    }
    ctx.restore();
  }
}

function drawBoss2UI() {
  if (currentRoom !== 3) return;

  // Reja bloqueando la bajada mientras el guardián vive
  if (!boss2Defeated) {
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    ctx.fillRect(370, H - 24, 220, 24);
    for (let bx = 378; bx < 582; bx += 26) {
      ctx.fillStyle = '#3a2850';
      ctx.fillRect(bx, H - 24, 14, 24);
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fillRect(bx + 2, H - 24, 4, 24);
    }
  } else {
    // Hueco abierto — brillo indicando salida
    const pulse = 0.15 + 0.08 * Math.sin(Date.now() * 0.003);
    ctx.fillStyle = `rgba(180,100,255,${pulse})`;
    ctx.fillRect(370, H - 18, 220, 18);
  }

  // Barra de vida
  if (!boss2.dead) {
    const barW = 420, barH = 18, bx = (W - barW) / 2, by = H - 44;
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    ctx.fillRect(bx - 6, by - 26, barW + 12, barH + 36);
    ctx.fillStyle = boss2.phase === 2 ? '#dd2255' : '#8822ee';
    ctx.font = 'bold 14px serif'; ctx.textAlign = 'center';
    ctx.fillText('✦  EL GUARDIÁN DE LA CIMA  ✦', W / 2, by - 8);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(bx, by, barW, barH);
    const fill = (boss2.hp / boss2.maxHp) * barW;
    ctx.fillStyle = boss2.phase === 2 ? '#dd2255' : '#8822ee';
    ctx.fillRect(bx, by, fill, barH);
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(bx, by, fill, barH / 2);
    ctx.strokeStyle = boss2.phase === 2 ? '#ff5577' : '#bb66ff';
    ctx.lineWidth = 1.5; ctx.strokeRect(bx, by, barW, barH);
  }

  // Victoria
  if (boss2Defeated && boss2.deathTimer === 0) {
    ctx.save();
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = '#e0c0ff'; ctx.font = 'bold 34px serif'; ctx.textAlign = 'center';
    ctx.fillText('¡El Guardián ha caído!', W / 2, 110);
    ctx.font = '18px serif'; ctx.fillStyle = '#ffffff';
    ctx.fillText('¡Has conquistado la Cima!  Puedes bajar.', W / 2, 145);
    const pulse = 0.3 + 0.2 * Math.sin(Date.now() * 0.004);
    const g = ctx.createLinearGradient(0, H - 70, 0, H);
    g.addColorStop(0, 'rgba(180,100,255,0)'); g.addColorStop(1, `rgba(180,100,255,${pulse})`);
    ctx.fillStyle = g; ctx.globalAlpha = 1;
    ctx.fillRect(360, H - 70, 240, 70);
    ctx.restore();
  }
}
