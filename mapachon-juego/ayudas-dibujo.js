// ─── AYUDAS DE DIBUJO ─────────────────────────────────────────────────────────
// Degradado radial con la luz arriba a la izquierda (da volumen)
function vol(x, y, r, light, dark) {
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r * 1.15);
  g.addColorStop(0, light); g.addColorStop(1, dark);
  return g;
}
// Parpadeo breve cada ~3.5 s (cada personaje con su propio ritmo)
function blinkNow(seed) {
  return ((Date.now() + seed * 977) % 3500) < 130;
}

function drawJumpPuffs() {
  for (let i = jumpPuffs.length - 1; i >= 0; i--) {
    const f = jumpPuffs[i];
    if (--f.t <= 0) { jumpPuffs.splice(i, 1); continue; }
    const k = 1 - f.t / 22;
    ctx.save();
    ctx.globalAlpha = 0.7 * (1 - k);
    ctx.strokeStyle = '#bfe4ff'; ctx.lineWidth = 2.5 * (1 - k) + 0.5;
    ctx.beginPath(); ctx.ellipse(f.x, f.y + k * 6, 10 + k * 18, 3 + k * 4, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#e8f4ff';
    for (const dx of [-1, 1]) {
      ctx.beginPath(); ctx.arc(f.x + dx * (8 + k * 16), f.y + 2 + k * 8, 3 * (1 - k) + 1, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
}

function drawPlayer() {
  drawJumpPuffs();
  const px = Math.round(player.x);
  const py = Math.round(player.y);
  const f  = player.facing;
  const t  = Date.now() * 0.001;
  const air    = !player.onGround;
  const moving = player.onGround && Math.abs(player.vx) > 0.5;
  const bob = player.onGround ? Math.sin(player.bobTimer) * 1.5 : 0;
  // estirar en el aire, sin cambiar el volumen
  const sy = air ? 1 + Math.min(0.1, Math.abs(player.vy) * 0.008) : 1;
  const sx = 1 / sy;
  const hw = player.w / 2;   // 13
  const hh = player.h / 2;   // 19
  const fs = player.vx * f;  // velocidad hacia delante

  ctx.save();

  // sombra en el suelo
  if (player.onGround) {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(px + hw, py + player.h + 3, hw * 0.85, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.translate(px + hw, py + hh + bob);
  ctx.rotate(Math.max(-0.12, Math.min(0.12, player.vx * 0.02)));
  ctx.scale(f * sx, sy);

  // Aura de invencibilidad
  if (godMode) {
    const gp = 0.35 + 0.2 * Math.sin(Date.now() * 0.007);
    const ag = ctx.createRadialGradient(0, 0, 6, 0, 0, 34);
    ag.addColorStop(0, `rgba(255,210,0,${gp + 0.15})`);
    ag.addColorStop(1, 'rgba(255,180,0,0)');
    ctx.fillStyle = ag;
    ctx.beginPath(); ctx.arc(0, 0, 34, 0, Math.PI * 2); ctx.fill();
  }

  // ── COLA de mapache: gruesa, peluda, anillos gris/negro y punta negra ────
  const RINGS = 8;
  const tx0 = -hw + 3, ty0 = hh - 7;
  const tcx = -hw - 18 - fs * 1.2, tcy = hh - 22 + Math.sin(t * 3) * 2;
  const tx1 = -hw - 4 - fs * 2.2 + Math.sin(t * 2.4) * 3, ty1 = hh - 40 + Math.abs(fs) * 1.5;
  // silueta peluda por detrás
  for (let i = RINGS - 1; i >= 0; i--) {
    const k = i / (RINGS - 1), pt = bezierPt(k, tx0, ty0, tcx, tcy, tx1, ty1);
    ctx.fillStyle = '#141210';
    ctx.beginPath(); ctx.arc(pt.x, pt.y, 10.5 - k * 3.5, 0, Math.PI * 2); ctx.fill();
  }
  for (let i = RINGS - 1; i >= 0; i--) {
    const k  = i / (RINGS - 1);
    const pt = bezierPt(k, tx0, ty0, tcx, tcy, tx1, ty1);
    const r  = 9.5 - k * 3.5;
    const dark = i % 2 === 1 || i === RINGS - 1;   // la punta es negra
    ctx.fillStyle = dark ? vol(pt.x, pt.y, r, '#3a3532', '#0e0c0b') : vol(pt.x, pt.y, r, '#d2ccc2', '#7e7870');
    ctx.beginPath(); ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2); ctx.fill();
  }

  // ── PATITAS: pasos alternos al correr ─────────────────────────────────────
  const cyc = moving ? Math.sin(player.bobTimer) : 0;
  const feet = [
    { x: -5 + cyc * 3 - (air ? 2 : 0), y: hh + 1 - Math.max(0, -cyc) * 2.5 - (air ? 2 : 0), r: -0.3 },
    { x:  5 - cyc * 3 + (air ? 2 : 0), y: hh + 1 - Math.max(0,  cyc) * 2.5 - (air ? 2 : 0), r:  0.3 },
  ];

  // ── CUERPO: pelaje gris de mapache, con mechones ──────────────────────────
  ctx.fillStyle = vol(0, hh * 0.25, hw, '#aaa49a', '#4e4944');
  ctx.beginPath(); ctx.ellipse(0, hh * 0.25, hw * 0.95, hh * 0.75, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(20,18,16,0.45)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = '#6a655e';
  for (const [mx, my, d] of [[-hw * 0.95, 2, -1], [-hw * 0.9, 9, -1], [hw * 0.92, 6, 1]]) {
    ctx.beginPath(); ctx.moveTo(mx, my - 3); ctx.lineTo(mx + d * 3.5, my); ctx.lineTo(mx, my + 3); ctx.closePath(); ctx.fill();
  }
  // barriga clara
  ctx.fillStyle = vol(1, hh * 0.35, hw * 0.6, '#ece6da', '#b4ad9f');
  ctx.beginPath(); ctx.ellipse(1, hh * 0.35, hw * 0.52, hh * 0.5, 0, 0, Math.PI * 2); ctx.fill();

  // ── CHALECO TÁCTICO ───────────────────────────────────────────────────────
  ctx.fillStyle = vol(0, hh * 0.1, hw, '#33507a', '#121c30');
  ctx.beginPath(); ctx.ellipse(0, hh * 0.1, hw * 0.88, hh * 0.68, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 1; ctx.stroke();
  // panel central y costuras
  ctx.fillStyle = vol(0, 0, hw * 0.5, '#3a5a86', '#1c2c48');
  ctx.beginPath(); ctx.ellipse(0, 0, hw * 0.38, hh * 0.52, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(140,180,230,0.25)'; ctx.lineWidth = 0.8;
  ctx.setLineDash([2, 2]);
  ctx.beginPath(); ctx.ellipse(0, 0, hw * 0.3, hh * 0.44, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]);
  // correa al hombro
  ctx.strokeStyle = '#0e1626'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(-hw * 0.6, -hh * 0.45); ctx.lineTo(hw * 0.55, hh * 0.45); ctx.stroke();
  // hebillas metálicas con brillo
  const buckle = ctx.createLinearGradient(0, hh * 0.05 - 2, 0, hh * 0.18 + 1);
  buckle.addColorStop(0, '#d8f0ff'); buckle.addColorStop(1, '#4a7aa0');
  ctx.fillStyle = buckle;
  ctx.beginPath(); ctx.roundRect(-3, hh * 0.18 - 2, 6, 3, 1); ctx.fill();
  ctx.beginPath(); ctx.roundRect(-5, hh * 0.05 - 1, 4, 2, 1); ctx.fill();
  ctx.beginPath(); ctx.roundRect( 2, hh * 0.05 - 1, 4, 2, 1); ctx.fill();

  // ── IMPLANTES en la espalda (brillan suavemente) ─────────────────────────
  const ip = 0.45 + 0.25 * Math.sin(t * 4);
  ctx.strokeStyle = `rgba(80,170,255,${ip.toFixed(2)})`;
  ctx.lineWidth = 1.3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-9, -6); ctx.lineTo(-7, 7);  ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-12, -4); ctx.lineTo(-10, 5); ctx.stroke();
  ctx.fillStyle = `rgba(120,220,255,${(ip + 0.2).toFixed(2)})`;
  ctx.beginPath(); ctx.arc(-8, -6, 1.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(-8,  2, 1.3, 0, Math.PI * 2); ctx.fill();

  // patas oscuras con deditos (las "manitas" de mapache)
  for (const ft of feet) {
    ctx.fillStyle = vol(ft.x, ft.y, 6, '#4a4440', '#141210');
    ctx.beginPath(); ctx.ellipse(ft.x, ft.y, 6, 4, ft.r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2a2624';
    for (let ci = -1.5; ci <= 1.5; ci++) {
      ctx.beginPath(); ctx.ellipse(ft.x + ci * 2.4, ft.y + 3.4, 1.2, 1.9, 0, 0, Math.PI * 2); ctx.fill();
    }
  }

  // ── CABEZA DE MAPACHE ─────────────────────────────────────────────────────
  const hy = -hh + 4;

  // orejas algo puntiagudas con borde blanco
  for (const s of [-1, 1]) {
    ctx.fillStyle = '#f2eee6';
    ctx.beginPath();
    ctx.moveTo(s * 3.5, hy - 9); ctx.quadraticCurveTo(s * 7, hy - 21, s * 12, hy - 19);
    ctx.quadraticCurveTo(s * 15, hy - 13, s * 12.5, hy - 6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = vol(s * 9, hy - 13, 5, '#5a5550', '#262220');
    ctx.beginPath();
    ctx.moveTo(s * 5.5, hy - 9.5); ctx.quadraticCurveTo(s * 8, hy - 18.5, s * 11.3, hy - 17);
    ctx.quadraticCurveTo(s * 13, hy - 12.5, s * 11.5, hy - 7.5); ctx.closePath(); ctx.fill();
  }

  // cabeza gris
  ctx.fillStyle = vol(0, hy, 13, '#b8b2a8', '#5e5953');
  ctx.beginPath(); ctx.arc(0, hy, 13, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(20,18,16,0.45)'; ctx.lineWidth = 1; ctx.stroke();

  // mejillas peludas y blancas que sobresalen
  for (const s of [-1, 1]) {
    ctx.fillStyle = '#ece8e0';
    ctx.beginPath();
    ctx.moveTo(s * 8, hy - 1);
    ctx.lineTo(s * 17, hy + 2); ctx.lineTo(s * 13, hy + 4.5);
    ctx.lineTo(s * 16.5, hy + 8); ctx.lineTo(s * 11, hy + 8.5);
    ctx.lineTo(s * 12, hy + 11); ctx.lineTo(s * 5, hy + 8);
    ctx.closePath(); ctx.fill();
  }

  // cejas blancas sobre el antifaz (le dan cara de decidido)
  ctx.fillStyle = '#f4f0e8';
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(s * 1.5, hy - 5.5); ctx.quadraticCurveTo(s * 6, hy - 9.5, s * 11, hy - 7);
    ctx.lineTo(s * 10.5, hy - 4.5); ctx.quadraticCurveTo(s * 6, hy - 6, s * 1.5, hy - 3.5);
    ctx.closePath(); ctx.fill();
  }

  // ANTIFAZ negro de bandido: una banda que cruza los dos ojos y baja por las mejillas
  ctx.fillStyle = '#141110';
  ctx.beginPath();
  ctx.moveTo(-14, hy + 4);
  ctx.quadraticCurveTo(-14, hy - 5, -6, hy - 4.5);
  ctx.quadraticCurveTo(0, hy - 2.5, 6, hy - 4.5);
  ctx.quadraticCurveTo(14, hy - 5, 14, hy + 4);
  ctx.quadraticCurveTo(10, hy + 3, 7, hy + 3.2);
  ctx.quadraticCurveTo(3, hy + 2, 0, hy + 2.5);
  ctx.quadraticCurveTo(-3, hy + 2, -7, hy + 3.2);
  ctx.quadraticCurveTo(-10, hy + 3, -14, hy + 4);
  ctx.closePath(); ctx.fill();
  // raya oscura que baja de la frente al hocico
  ctx.fillStyle = '#4a4540';
  ctx.beginPath(); ctx.moveTo(-1.6, hy - 12); ctx.lineTo(1.6, hy - 12); ctx.lineTo(1.2, hy - 3); ctx.lineTo(-1.2, hy - 3); ctx.closePath(); ctx.fill();

  // ojos negros brillantes (parpadean de vez en cuando)
  if (blinkNow(1)) {
    ctx.strokeStyle = '#5a5550'; ctx.lineWidth = 1.3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-8, hy - 0.5); ctx.quadraticCurveTo(-5, hy + 1, -2, hy - 0.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo( 2, hy - 0.5); ctx.quadraticCurveTo( 5, hy + 1,  8, hy - 0.5); ctx.stroke();
  } else {
    for (const s of [-1, 1]) {
      const ex = s * 5;
      ctx.fillStyle = vol(ex, hy - 0.8, 3.2, '#6a4a30', '#0a0706');
      ctx.beginPath(); ctx.arc(ex, hy - 0.8, 3.1, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.arc(ex + 0.3, hy - 0.6, 1.9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(ex - 0.9, hy - 1.9, 1, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.beginPath(); ctx.arc(ex + 1.1, hy + 0.5, 0.5, 0, Math.PI * 2); ctx.fill();
    }
  }

  // hocico blanco, nariz negra y boca
  ctx.fillStyle = vol(0, hy + 6, 6.5, '#ffffff', '#cfc9be');
  ctx.beginPath(); ctx.ellipse(0, hy + 6.2, 6, 4.8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = vol(0, hy + 3.6, 3.2, '#4a4444', '#050404');
  ctx.beginPath(); ctx.ellipse(0, hy + 3.6, 3.2, 2.2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath(); ctx.arc(-1.1, hy + 2.9, 0.8, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#3a3532'; ctx.lineWidth = 0.9;
  ctx.beginPath(); ctx.moveTo(0, hy + 5.6); ctx.lineTo(0, hy + 7);
  ctx.quadraticCurveTo(2, hy + 8.6, 3.6, hy + 7.2); ctx.stroke();

  // bigotes
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 0.8; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(4,  hy + 6); ctx.lineTo(15, hy + 3.5); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(4,  hy + 7); ctx.lineTo(15, hy + 9); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-4, hy + 6); ctx.lineTo(-15, hy + 3.5); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-4, hy + 7); ctx.lineTo(-15, hy + 9); ctx.stroke();

  // bracito gris con manita oscura
  ctx.fillStyle = vol(hw - 1, -hh + 22, 6, '#9a948a', '#4e4944');
  ctx.beginPath(); ctx.ellipse(hw - 1, -hh + 22, 4, 7, 0.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1e1a18';
  ctx.beginPath(); ctx.ellipse(hw + 2.5, -hh + 17, 3.2, 3, 0, 0, Math.PI * 2); ctx.fill();

  // ── BLASTER ───────────────────────────────────────────────────────────────
  const metal = ctx.createLinearGradient(0, -hh + 8, 0, -hh + 22);
  metal.addColorStop(0, '#5a5a6e'); metal.addColorStop(0.45, '#2a2a36'); metal.addColorStop(1, '#121218');
  ctx.fillStyle = metal;
  ctx.beginPath();
  ctx.moveTo(hw + 2,  -hh + 8);  ctx.lineTo(hw + 30, -hh + 10);
  ctx.lineTo(hw + 30, -hh + 20); ctx.lineTo(hw + 2,  -hh + 22);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 1; ctx.stroke();
  const barrel = ctx.createLinearGradient(0, -hh + 12, 0, -hh + 19);
  barrel.addColorStop(0, '#4a4a58'); barrel.addColorStop(1, '#0e0e14');
  ctx.fillStyle = barrel;
  ctx.beginPath();
  ctx.moveTo(hw + 20, -hh + 12); ctx.lineTo(hw + 42, -hh + 13);
  ctx.lineTo(hw + 42, -hh + 18); ctx.lineTo(hw + 20, -hh + 19);
  ctx.closePath(); ctx.fill();
  // brillo superior
  ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(hw + 3, -hh + 9); ctx.lineTo(hw + 29, -hh + 11); ctx.stroke();
  // paneles
  ctx.fillStyle = '#4e6478';
  ctx.beginPath(); ctx.roundRect(hw + 4, -hh + 10, 9, 10, 2); ctx.fill();
  ctx.fillStyle = '#34485a';
  ctx.beginPath(); ctx.roundRect(hw + 15, -hh + 11, 5, 8, 1.5); ctx.fill();
  // línea de energía que pulsa
  const ep = 0.6 + 0.4 * Math.sin(t * 6);
  ctx.strokeStyle = `rgba(60,170,255,${ep.toFixed(2)})`; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(hw + 5, -hh + 15); ctx.lineTo(hw + 19, -hh + 15); ctx.stroke();
  // boca del cañón
  const mr = 5.5 + Math.sin(t * 8) * 0.8;
  const muzzleGlow = ctx.createRadialGradient(hw + 41, -hh + 15.5, 0, hw + 41, -hh + 15.5, mr + 1);
  muzzleGlow.addColorStop(0, 'rgba(0,255,255,0.9)');
  muzzleGlow.addColorStop(1, 'rgba(0,180,255,0)');
  ctx.fillStyle = muzzleGlow;
  ctx.beginPath(); ctx.arc(hw + 41, -hh + 15.5, mr + 1, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(220,255,255,0.95)';
  ctx.beginPath(); ctx.arc(hw + 41, -hh + 15.5, 2, 0, Math.PI * 2); ctx.fill();

  // ── TAJO DE ATAQUE con estela (del color del arma) ────────────────────────
  if (player.attackActive > 0) {
    const progress = 1 - player.attackActive / 9;
    const startA   = -0.5;
    const sweepA   = progress * 1.5;
    const ax = hw + 10, ay = -hh + 15;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.shadowColor = weaponColor; ctx.shadowBlur = 16;
    for (let k = 3; k >= 0; k--) {
      const a1 = startA + sweepA - k * 0.18;
      if (a1 <= startA) continue;
      ctx.globalAlpha = (player.attackActive / 9) * (1 - k * 0.22);
      ctx.strokeStyle = k ? hexAlpha(weaponColor, 0.7) : '#ffffff';
      ctx.lineWidth = k ? 7 - k : 3;
      ctx.beginPath(); ctx.arc(ax, ay, 34 - k * 2, Math.max(startA, a1 - 0.5), a1); ctx.stroke();
    }
    const tipX = ax + Math.cos(startA + sweepA) * 34;
    const tipY = ay + Math.sin(startA + sweepA) * 34;
    ctx.globalAlpha = player.attackActive / 9;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(tipX, tipY, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // Parpadeo de invencibilidad
  if (player.invFrames > 0 && Math.floor(player.invFrames / 6) % 2 === 0) {
    ctx.fillStyle = 'rgba(255,200,200,0.35)';
    ctx.beginPath(); ctx.ellipse(0, 0, hw + 4, hh + 4, 0, 0, Math.PI * 2); ctx.fill();
  }

  ctx.restore();
}

function drawRoomLabel() {
  if (roomLabelAlpha <= 0) return;
  const name = ROOMS[currentRoom].name;

  ctx.save();
  ctx.globalAlpha = roomLabelAlpha;

  // línea decorativa
  const tw = ctx.measureText(name).width;
  ctx.strokeStyle = 'rgba(200,180,255,0.5)';
  ctx.lineWidth = 1;
  const lx = W / 2;
  const ly = 90;

  ctx.font = '600 22px Georgia, serif';
  const fullW = ctx.measureText(name).width + 60;

  ctx.beginPath();
  ctx.moveTo(lx - fullW / 2, ly - 18);
  ctx.lineTo(lx + fullW / 2, ly - 18);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(lx - fullW / 2, ly + 8);
  ctx.lineTo(lx + fullW / 2, ly + 8);
  ctx.stroke();

  ctx.fillStyle = '#e8d8ff';
  ctx.textAlign = 'center';
  ctx.fillText(name, W / 2, ly);

  ctx.restore();
}

function drawHeart(x, y, filled) {
  ctx.save();
  ctx.translate(x, y);
  // el último corazón late
  if (filled && player.hp === 1) {
    const b = 1 + Math.max(0, Math.sin(Date.now() * 0.012)) * 0.18;
    ctx.translate(0, 5); ctx.scale(b, b); ctx.translate(0, -5);
  }
  const heart = () => {
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.bezierCurveTo(-9, -5, -12, 3, 0, 10);
    ctx.bezierCurveTo(12, 3, 9, -5, 0, 2);
  };
  // sombra
  ctx.save(); ctx.translate(1, 1.5); heart();
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill(); ctx.restore();
  heart();
  if (filled) {
    const g = ctx.createRadialGradient(-3, 1, 0, 0, 4, 10);
    g.addColorStop(0, '#ff8aa0'); g.addColorStop(0.5, '#ff4466'); g.addColorStop(1, '#b01838');
    ctx.fillStyle = g;
  } else {
    ctx.fillStyle = '#3a1c2a';
  }
  ctx.fill();
  ctx.strokeStyle = filled ? '#ffb0c0' : '#663344';
  ctx.lineWidth = 1;
  ctx.stroke();
  if (filled) {
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath(); ctx.ellipse(-4, 1.5, 2, 1.2, -0.6, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawHUD() {
  const total = ROOM_ORDER.length; // la sala secreta no cuenta
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.font = '13px monospace';
  ctx.textAlign = 'left';
  const num = ROOM_ORDER.indexOf(currentRoom) + 1;
  ctx.fillText(ROOMS[currentRoom].secret ? 'Sala ★ secreta' : `Sala ${num} / ${total}`, 16, 26);

  // Corazones de vida
  for (let i = 0; i < player.maxHp; i++) {
    drawHeart(20 + i * 28, 50, i < player.hp);
  }

  drawTrashHUD(); // bote de basura para curarse

  // Dinero
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffd040';
  ctx.fillText('💰 ' + fmtMoney(money) + ' mapesos', 16, 90);
  drawKeysHUD();
  if (shade) {
    ctx.font = '11px monospace';
    ctx.fillStyle = 'rgba(200,170,255,0.8)';
    ctx.fillText('👻 Tu alma te espera en ' + ROOMS[shade.room].name, 16, 108);
  }

  // Textos flotantes de dinero
  for (let i = moneyPops.length - 1; i >= 0; i--) {
    const m = moneyPops[i];
    m.t--; m.y -= 0.8;
    if (m.t <= 0) { moneyPops.splice(i, 1); continue; }
    ctx.globalAlpha = Math.min(1, m.t / 30);
    ctx.fillStyle = m.color || '#ffd040';
    ctx.font = 'bold 15px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(m.text + ' 💰', (m.x - camX) * camZ, (m.y - camY) * camZ);
    ctx.globalAlpha = 1;
  }

  // God mode indicator
  if (godMode) {
    const p = 0.7 + 0.3 * Math.sin(Date.now() * 0.006);
    ctx.save();
    ctx.globalAlpha = p;
    ctx.fillStyle = '#ffd060';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#ffd060'; ctx.shadowBlur = 14;
    ctx.fillText('★  INVENCIBLE  ★', W / 2, 26);
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // Armas actuales
  ctx.font = '11px monospace'; ctx.textAlign = 'right';
  ctx.fillStyle = ranged ? ranged.color : 'rgba(255,255,255,0.3)';
  ctx.fillText(ranged ? '🏹 ' + ranged.name + '  x' + ranged.damage : '🏹 —', W - 16, H - 44);
  ctx.fillStyle = weaponColor;
  ctx.fillText('⚔ ' + weaponName + '  x' + playerDmg, W - 16, H - 28);
  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  ctx.font = '10px monospace';
  ctx.fillText('Z / J: corta  |  C / K: larga  |  F: comer basura (curar)  |  pisotón: caer encima', W - 16, H - 14);
  ctx.textAlign = 'left';
  ctx.fillText((Music.muted ? '🔇' : '🔊') + ' M: música', 16, H - 14);
}

function drawInventory() {
  if (!showInventory) return;

  const pw = 280, ph = 300, mw = 560, gap = 12;
  const px = (W - (pw + gap + mw)) / 2, py = (H - ph) / 2;

  // Fondo
  ctx.fillStyle = 'rgba(4, 4, 16, 0.45)';
  ctx.fillRect(px, py, pw, ph);
  ctx.strokeStyle = '#5a3a8a';
  ctx.lineWidth = 3;
  ctx.strokeRect(px, py, pw, ph);
  ctx.strokeStyle = '#2a1a4a';
  ctx.lineWidth = 1;
  ctx.strokeRect(px + 5, py + 5, pw - 10, ph - 10);

  // Título
  ctx.fillStyle = '#d0a8ff';
  ctx.font = 'bold 15px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('⚙  ESTADÍSTICAS', px + pw / 2, py + 33);

  // Separador
  ctx.strokeStyle = '#3a2a5a';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(px + 18, py + 44); ctx.lineTo(px + pw - 18, py + 44);
  ctx.stroke();

  // Fila: Vida máxima
  ctx.textAlign = 'left';
  ctx.font = '13px monospace';
  ctx.fillStyle = '#ff6688';
  ctx.fillText('❤  Vida máxima', px + 26, py + 78);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'right';
  ctx.fillText(player.maxHp, px + pw - 26, py + 78);

  // Filas: corta distancia, larga distancia y mapesos
  const rows = [
    ['⚔  ' + weaponName, weaponColor, 'x' + playerDmg],
    ['🏹  ' + (ranged ? ranged.name : 'Sin arma'), ranged ? ranged.color : '#777', ranged ? 'x' + ranged.damage : '—'],
    ['💰  Mapesos', '#ffd040', fmtMoney(money)],
  ];
  if (boss3Defeated || richMode) rows.push(['🪶  Doble salto', '#bfe4ff', '✓']);
  rows.forEach(([label, color, value], i) => {
    const ry = py + 106 + i * 28;
    ctx.textAlign = 'left';
    ctx.fillStyle = color;
    ctx.fillText(label, px + 26, ry);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'right';
    ctx.fillText(value, px + pw - 26, ry);
  });

  // Hint cierre
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.font = '10px monospace';
  ctx.fillText('TAB / I  ·  📦  para cerrar', px + pw / 2, py + ph - 14);

  // Minimapa a la derecha
  drawMiniMap(px + pw + gap, py, mw, ph);
}

// Minimapa de solo lectura con la sala actual resaltada
function drawMiniMap(px, py, pw, ph) {
  ctx.fillStyle = 'rgba(4, 4, 16, 0.45)';
  ctx.fillRect(px, py, pw, ph);
  ctx.strokeStyle = '#5a3a8a';
  ctx.lineWidth = 3;
  ctx.strokeRect(px, py, pw, ph);
  ctx.strokeStyle = '#2a1a4a';
  ctx.lineWidth = 1;
  ctx.strokeRect(px + 5, py + 5, pw - 10, ph - 10);

  ctx.fillStyle = '#d0a8ff';
  ctx.font = 'bold 15px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('🗺  MAPA', px + pw / 2, py + 33);
  ctx.strokeStyle = '#3a2a5a';
  ctx.beginPath();
  ctx.moveTo(px + 18, py + 44); ctx.lineTo(px + pw - 18, py + 44);
  ctx.stroke();

  // Solo se ven las salas que ya has visitado; el mapa se ajusta a lo descubierto
  const G = mapGeo();
  const vis = Object.keys(G.pos).map(Number).filter(r => visitedRooms.has(r) || r === currentRoom);
  if (vis.length) drawWorldMap(fitMap(vis, px + 16, py + 50, pw - 32, ph - 76, 0.9), false, false);

  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.font = '10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(G.pos[currentRoom] ? '▼ ' + ROOMS[currentRoom].name + '  ·  los números siguen el recorrido' : '¿?  ubicación desconocida', px + pw / 2, py + ph - 14);
}
