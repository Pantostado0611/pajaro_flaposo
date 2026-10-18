// ─── ROCA DE LAS SALAS DE PASILLOS ───────────────────────────────────────────
// En las salas con `carved` la roca es un montón de bloques pegados (lo que
// queda al excavar los pasillos). Aquí se pintan sin que se noten las uniones:
// todos con el mismo degradado y la misma textura alineada al mundo, y la
// nieve, los carámbanos o el borde de muralla solo donde la roca da al aire.

// Tramos de un lado del bloque que no tocan otra roca: [[desde, hasta], ...]
function rockOpenSides(room, p) {
  const key = brokenWalls.size;
  if (p._open && p._openKey === key) return p._open;
  const RW = room.width || W, top = room.top || 0;
  const sides = {};
  for (const side of ['top', 'bottom', 'left', 'right']) {
    const along = side === 'top' || side === 'bottom';
    let segs = [along ? [p.x, p.x + p.w] : [p.y, p.y + p.h]];
    // los bordes de la sala no se ven
    if ((side === 'top' && p.y <= top) || (side === 'bottom' && p.y + p.h >= H) ||
        (side === 'left' && p.x <= 0) || (side === 'right' && p.x + p.w >= RW)) segs = [];
    for (const q of room.platforms) {
      if (!segs.length) break;
      if (q === p || q.h <= 18 || q.door || q.trapdoor || (q.breakable && brokenWalls.has(q.breakable))) continue;
      let b0, b1;
      if (side === 'top' && q.y + q.h === p.y) { b0 = q.x; b1 = q.x + q.w; }
      else if (side === 'bottom' && q.y === p.y + p.h) { b0 = q.x; b1 = q.x + q.w; }
      else if (side === 'left' && q.x + q.w === p.x) { b0 = q.y; b1 = q.y + q.h; }
      else if (side === 'right' && q.x === p.x + p.w) { b0 = q.y; b1 = q.y + q.h; }
      else continue;
      segs = segs.flatMap(([s0, s1]) => [[s0, Math.min(s1, b0)], [Math.max(s0, b1), s1]]).filter(([u, v]) => v - u > 0.5);
    }
    sides[side] = segs;
  }
  p._open = sides; p._openKey = key;
  return sides;
}

function drawCarvedRock(room, p) {
  // un muro falso que se pinta junto con su pared llega como copia: las uniones se calculan con el original
  const o = rockOpenSides(room, p._src || p);
  const top = room.top || 0;
  ctx.save();
  ctx.beginPath(); ctx.rect(p.x, p.y, p.w, p.h); ctx.clip();
  if (room.style === 'mountain') drawCarvedMountain(room, p, o, top);
  else if (room.style === 'castleRock') drawCarvedCastle(room, p, o, top);
  ctx.restore();
  // lo que sale del bloque (nieve, carámbanos) va sin recorte
  if (room.style === 'mountain') drawCarvedSnow(room, p, o);
  else if (room.style === 'castleRock') drawCarvedCastleTop(room, p, o);
}

function drawCarvedMountain(room, p, o, top) {
  const k = (room.night || 0) * 0.1;
  const g = ctx.createLinearGradient(0, top, 0, H);
  g.addColorStop(0, shadeHex('#4e5670', -k)); g.addColorStop(0.55, shadeHex('#30364c', -k)); g.addColorStop(1, shadeHex('#1a1e2e', -k));
  ctx.fillStyle = g; ctx.fillRect(p.x, p.y, p.w, p.h);
  // vetas y grietas en una cuadrícula fija del mundo (no se cortan entre bloques)
  const S = 64, x0 = Math.floor(p.x / S) * S, y0 = Math.floor(p.y / S) * S;
  for (let gx = x0; gx < p.x + p.w; gx += S) for (let gy = y0; gy < p.y + p.h; gy += S) {
    const h1 = hash(gx * 0.37 + gy * 1.91), h2 = hash(gx * 1.13 - gy * 0.53);
    if (h1 < 0.55) {
      ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1.5;
      const cx = gx + 10 + h2 * 40, cy = gy + 8 + h1 * 30;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + 6, cy + 10); ctx.lineTo(cx + 2, cy + 22); ctx.stroke();
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.035)';
      ctx.beginPath(); ctx.ellipse(gx + 20 + h2 * 24, gy + 30, 16, 7, 0, 0, Math.PI * 2); ctx.fill();
    }
  }
  // sombra y luz en los bordes que dan al pasillo
  for (const [a, b] of o.left)  { ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(p.x, a, 4, b - a); }
  for (const [a, b] of o.right) { ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(p.x + p.w - 5, a, 5, b - a); }
  for (const [a, b] of o.bottom) {
    const sg = ctx.createLinearGradient(0, p.y + p.h - 10, 0, p.y + p.h);
    sg.addColorStop(0, 'rgba(0,0,0,0)'); sg.addColorStop(1, 'rgba(0,0,0,0.35)');
    ctx.fillStyle = sg; ctx.fillRect(a, p.y + p.h - 10, b - a, 10);
  }
}

function drawCarvedSnow(room, p, o) {
  const k = (room.night || 0) * 0.1;
  // nieve encima de los pisos
  for (const [a, b] of o.top) {
    if (b - a < 6) continue;
    const sg = ctx.createLinearGradient(0, p.y - 4, 0, p.y + 10);
    sg.addColorStop(0, shadeHex('#eef2ff', -k)); sg.addColorStop(1, shadeHex('#b8c2dc', -k));
    ctx.fillStyle = sg;
    ctx.beginPath(); ctx.moveTo(a - 1, p.y + 5);
    ctx.quadraticCurveTo(a - 1, p.y - 3, a + 5, p.y - 3);
    ctx.lineTo(b - 5, p.y - 3);
    ctx.quadraticCurveTo(b + 1, p.y - 3, b + 1, p.y + 5);
    for (let x = b; x > a; x -= 14) {
      const d = 3 + hash(x * 0.71) * 6;
      ctx.quadraticCurveTo(x - 7, p.y + d + 3, Math.max(a - 1, x - 14), p.y + 4);
    }
    ctx.closePath(); ctx.fill();
  }
  // carámbanos colgando de los techos
  const t = Date.now() * 0.002;
  for (const [a, b] of o.bottom) {
    for (let x = Math.ceil(a / 22) * 22 + 6; x < b - 6; x += 22) {
      const hh = hash(x * 0.917 + p.y);
      if (hh < 0.35) continue;
      const len = 6 + hh * 18, y = p.y + p.h;
      const ig = ctx.createLinearGradient(0, y, 0, y + len);
      ig.addColorStop(0, shadeHex('#d8e8ff', -k)); ig.addColorStop(1, 'rgba(200,225,255,0.15)');
      ctx.fillStyle = ig;
      ctx.beginPath(); ctx.moveTo(x - 4, y); ctx.lineTo(x + 4, y); ctx.lineTo(x, y + len); ctx.closePath(); ctx.fill();
      if (hh > 0.85) { // gota que brilla
        ctx.fillStyle = `rgba(220,240,255,${(0.4 + 0.4 * Math.sin(t + x)).toFixed(2)})`;
        ctx.beginPath(); ctx.arc(x, y + len + 2, 1.4, 0, Math.PI * 2); ctx.fill();
      }
    }
  }
}

function drawCarvedCastle(room, p, o, top) {
  // mortero oscuro y sillares alineados al mundo
  ctx.fillStyle = '#2e2828'; ctx.fillRect(p.x, p.y, p.w, p.h);
  const RH = 30, BW = 72;
  for (let y = Math.floor((p.y - top) / RH) * RH + top; y < p.y + p.h; y += RH) {
    const row = Math.round((y - top) / RH), off = (row % 2) * (BW / 2);
    for (let x = Math.floor((p.x - off) / BW) * BW + off; x < p.x + p.w; x += BW) {
      const v = hash(x * 0.13 + row * 7.7) * 0.1;
      const g = ctx.createLinearGradient(0, y, 0, y + RH);
      g.addColorStop(0, shadeHex('#7a7472', -v)); g.addColorStop(0.5, shadeHex('#625c5c', -v)); g.addColorStop(1, shadeHex('#464042', -v));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.roundRect(x + 2, y + 2, BW - 4, RH - 4, 5); ctx.fill();
      ctx.fillStyle = 'rgba(255,245,235,0.07)';
      ctx.beginPath(); ctx.roundRect(x + 6, y + 4, BW - 12, 3, 2); ctx.fill();
    }
  }
  for (const [a, b] of o.bottom) {
    const sg = ctx.createLinearGradient(0, p.y + p.h - 12, 0, p.y + p.h);
    sg.addColorStop(0, 'rgba(0,0,0,0)'); sg.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.fillStyle = sg; ctx.fillRect(a, p.y + p.h - 12, b - a, 12);
  }
  for (const [a, b] of o.right) { ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(p.x + p.w - 5, a, 5, b - a); }
}

function drawCarvedCastleTop(room, p, o) {
  // camino de ronda: losa clara con un poco de nieve encima
  for (const [a, b] of o.top) {
    if (b - a < 6) continue;
    const tg = ctx.createLinearGradient(0, p.y, 0, p.y + 12);
    tg.addColorStop(0, '#8a8480'); tg.addColorStop(1, '#625c5a');
    ctx.fillStyle = tg; ctx.beginPath(); ctx.roundRect(a, p.y, b - a, 12, 4); ctx.fill();
    ctx.fillStyle = 'rgba(240,244,255,0.75)';
    for (let x = a + 4; x < b - 10; x += 26) {
      const w = 8 + hash(x * 0.3) * 14;
      ctx.beginPath(); ctx.ellipse(x + w / 2, p.y + 1, w / 2, 2.2, 0, 0, Math.PI * 2); ctx.fill();
    }
  }
}
