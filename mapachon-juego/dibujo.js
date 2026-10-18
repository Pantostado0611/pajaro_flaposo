// ─── DIBUJAR ──────────────────────────────────────────────────────────────────
function drawBackground(room) {
  const [c1, c2] = room.bg;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, c1);
  g.addColorStop(1, c2);
  ctx.fillStyle = g;
  if (room.style) { ctx.fillRect(0, 0, W, H); return; } // las salas con estilo propio dibujan su fondo
  // degradado + luz ambiental: no cambian, se dibujan una vez y se reutilizan
  ctx.drawImage(cachedLayer('bg|' + currentRoom, c => {
    const cg = c.createLinearGradient(0, 0, 0, H);
    cg.addColorStop(0, c1); cg.addColorStop(1, c2);
    c.fillStyle = cg; c.fillRect(0, 0, W, H);
    const amb = c.createRadialGradient(W / 2, H * 0.35, 20, W / 2, H * 0.35, 560);
    amb.addColorStop(0, hexAlpha(room.particleColor, 0.13));
    amb.addColorStop(1, hexAlpha(room.particleColor, 0));
    c.fillStyle = amb; c.fillRect(0, 0, W, H);
  }), 0, 0, W, H);
  // bruma baja que se mueve despacio
  const tt = Date.now() * 0.00015;
  for (let i = 0; i < 3; i++) {
    const fx = ((i * 380 + tt * 900 * (i % 2 ? 1 : -1)) % (W + 400) + W + 400) % (W + 400) - 200;
    const fg = ctx.createRadialGradient(fx, H - 70, 0, fx, H - 70, 260);
    fg.addColorStop(0, hexAlpha(room.particleColor, 0.07));
    fg.addColorStop(1, hexAlpha(room.particleColor, 0));
    ctx.fillStyle = fg; ctx.fillRect(fx - 260, H - 330, 520, 330);
  }
}

// Viñeta: oscurece un poco los bordes para dar profundidad
function drawVignette(room) {
  if (room.style) return;
  ctx.drawImage(cachedLayer('vignette', c => {
    const v = c.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, W * 0.72);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,0,0,0.42)');
    c.fillStyle = v; c.fillRect(0, 0, W, H);
  }), 0, 0, W, H);
}

// Capas que no cambian (fondo, viñeta, losas): se dibujan una vez por sala y
// tamaño de pantalla, y luego solo se copian en cada fotograma
const layerCache = new Map();
function cachedLayer(key, draw) {
  const k = key + '|' + renderScale;
  let layer = layerCache.get(k);
  if (!layer) {
    layer = document.createElement('canvas');
    layer.width  = Math.round(W * renderScale);
    layer.height = Math.round(H * renderScale);
    const c = layer.getContext('2d');
    c.setTransform(renderScale, 0, 0, renderScale, 0, 0);
    draw(c);
    if (layerCache.size > 24) layerCache.clear();
    layerCache.set(k, layer);
  }
  return layer;
}

function drawDecorations(room) {
  for (const d of (room.decorations || [])) {
    if (d.type === 'nightRanges') {
      ctx.save(); ctx.translate(Math.round(camX), Math.round(camY));
      drawDecoration(room, d);
      ctx.restore();
    } else drawDecoration(room, d);
  }
}

function drawDecoration(room, d) {
  {
    if (d.type === 'bricks') {
      // muro de piedra del castillo
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      for (let row = 0, y = room.top || 0; y < H - 60; row++, y += 30) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(room.width || W, y); ctx.stroke();
        for (let x = (row % 2) * 30; x < (room.width || W); x += 60) {
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 30); ctx.stroke();
        }
      }
    }
    if (d.type === 'window') {
      ctx.fillStyle = '#05040a';
      ctx.beginPath();
      ctx.moveTo(d.x - 22, d.y + 90); ctx.lineTo(d.x - 22, d.y + 22);
      ctx.arc(d.x, d.y + 22, 22, Math.PI, 0); ctx.lineTo(d.x + 22, d.y + 90);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(160,170,255,0.10)';
      ctx.fill();
      ctx.strokeStyle = room.edgeColor; ctx.lineWidth = 4; ctx.stroke();
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x, d.y + 90); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(d.x - 22, d.y + 50); ctx.lineTo(d.x + 22, d.y + 50); ctx.stroke();
    }
    if (d.type === 'banner') {
      const sway = Math.sin(Date.now() * 0.0015 + d.x) * 3;
      ctx.fillStyle = '#5a3a20'; ctx.fillRect(d.x - 30, d.y - 4, 60, 6);
      ctx.fillStyle = '#7a1424';
      ctx.beginPath();
      ctx.moveTo(d.x - 24, d.y); ctx.lineTo(d.x + 24, d.y);
      ctx.lineTo(d.x + 24 + sway, d.y + 110); ctx.lineTo(d.x + sway, d.y + 92);
      ctx.lineTo(d.x - 24 + sway, d.y + 110); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#d0a040';
      ctx.beginPath(); ctx.arc(d.x + sway * 0.5, d.y + 44, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#7a1424';
      ctx.beginPath(); ctx.arc(d.x + sway * 0.5, d.y + 44, 5, 0, Math.PI * 2); ctx.fill();
    }
    if (d.type === 'torch') {
      const f = 0.8 + 0.2 * Math.sin(Date.now() * 0.02 + d.x);
      const g = ctx.createRadialGradient(d.x, d.y - 12, 0, d.x, d.y - 12, 70 * f);
      g.addColorStop(0, 'rgba(255,160,60,0.30)');
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(d.x, d.y - 12, 70 * f, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#4a3a2a'; ctx.fillRect(d.x - 3, d.y - 4, 6, 18);
      ctx.fillStyle = '#ffb040';
      ctx.beginPath(); ctx.ellipse(d.x, d.y - 12, 6 * f, 11 * f, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff0b0';
      ctx.beginPath(); ctx.ellipse(d.x, d.y - 9, 2.5, 5, 0, 0, Math.PI * 2); ctx.fill();
    }
    if (d.type === 'floatStones') drawFloatStones(room);
    if (d.type === 'ruinedWalls') drawRuinedWalls(room);
    if (THEME_DECO[d.type]) {
      if (d.onY !== undefined) { ctx.save(); ctx.translate(0, d.onY - 480); } // adorno de suelo puesto en un piso más alto
      THEME_DECO[d.type](d, room);
      if (d.onY !== undefined) ctx.restore();
    }
    if (d.type === 'jokeText') {
      const wob = Math.sin(Date.now() * 0.004) * 0.04;
      ctx.save();
      ctx.translate(W / 2, H / 2 - 30); ctx.rotate(wob);
      ctx.font = 'bold 72px Georgia, serif'; ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillText(d.text, 4, 6);
      ctx.fillStyle = '#ffe060'; ctx.fillText(d.text, 0, 0);
      ctx.restore();
    }
    if (d.type === 'nightRanges') {
      // level 0 = La Cumbre; cada nivel más es más de noche y estás más alto
      const L = d.level || 0, dk = hex => L ? shadeHex(hex, -L * 0.17) : hex;
      const dy = L * 38;
      // cielo nocturno
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, dk('#010208')); g.addColorStop(0.55, dk('#060a1c')); g.addColorStop(1, dk('#0e1430'));
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // estrellas
      for (let k = 0; k < 70; k++) {
        const sx = (k * 137.5) % W, sy = (k * 53.3) % 260;
        const tw = 0.45 + 0.55 * Math.abs(Math.sin(Date.now() * 0.0015 + k));
        ctx.fillStyle = `rgba(255,255,255,${(tw * (k % 3 ? 0.55 : 0.9)).toFixed(2)})`;
        ctx.beginPath(); ctx.arc(sx, sy, k % 5 ? 1 : 1.7, 0, Math.PI * 2); ctx.fill();
      }
      // luna (se va poniendo detrás de las montañas hasta desaparecer)
      if (L < 4) {
      if (L) { ctx.save(); ctx.globalAlpha = 1 - L * 0.22; ctx.translate(L * 40, L * 70); }
      const mg = ctx.createRadialGradient(170, 90, 0, 170, 90, 120);
      mg.addColorStop(0, 'rgba(220,230,255,0.18)'); mg.addColorStop(1, 'rgba(220,230,255,0)');
      ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(170, 90, 120, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#eef2ff'; ctx.beginPath(); ctx.arc(170, 90, 30, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(170,180,215,0.35)';
      ctx.beginPath(); ctx.arc(160, 82, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(181, 100, 4, 0, Math.PI * 2); ctx.fill();
      if (L) ctx.restore();
      }

      // cordilleras: de la más lejana a la más cercana, con nieve en los picos
      const range = (pts, top, bottom, snow) => {
        if (dy) pts = pts.map(([x, y]) => [x, y + dy]);
        const lg = ctx.createLinearGradient(0, Math.min(...pts.map(q => q[1])), 0, H);
        lg.addColorStop(0, top); lg.addColorStop(1, bottom);
        ctx.fillStyle = lg;
        ctx.beginPath(); ctx.moveTo(0, H);
        for (const [x, y] of pts) ctx.lineTo(x, y);
        ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
        ctx.fillStyle = snow;
        for (let k = 1; k < pts.length - 1; k++) {
          const [x, y] = pts[k], [x0, y0] = pts[k - 1], [x1, y1] = pts[k + 1];
          if (y >= y0 || y >= y1) continue; // solo picos
          const f = 0.32;
          const lx = x + (x0 - x) * f, ly = y + (y0 - y) * f;
          const rx = x + (x1 - x) * f, ry = y + (y1 - y) * f;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(rx, ry);
          ctx.lineTo(x + (rx - x) * 0.5, y + (ry - y) * 0.75);
          ctx.lineTo(x, y + Math.max(ly - y, ry - y) * 0.6);
          ctx.lineTo(x + (lx - x) * 0.5, y + (ly - y) * 0.75);
          ctx.lineTo(lx, ly); ctx.closePath(); ctx.fill();
        }
      };
      const sn = a => `rgba(200,212,240,${(a * (1 - L * 0.15)).toFixed(2)})`;
      range([[0,250],[70,190],[140,230],[220,150],[300,215],[370,170],[450,230],[530,140],[610,205],[690,160],[770,220],[850,150],[920,200],[960,180]],
            dk('#1c2442'), dk('#121830'), L ? sn(0.35) : 'rgba(200,212,240,0.35)');
      range([[0,300],[90,240],[170,290],[260,215],[350,280],[440,230],[520,295],[620,220],[710,285],[800,235],[890,290],[960,250]],
            dk('#121a34'), dk('#0b1024'), L ? sn(0.45) : 'rgba(210,220,245,0.45)');
      range([[0,360],[110,300],[210,350],[330,290],[430,345],[560,300],[680,350],[790,305],[900,350],[960,320]],
            dk('#0a0f22'), dk('#05081a'), L ? sn(0.55) : 'rgba(220,228,250,0.55)');
      // bruma nocturna al pie
      const hz = ctx.createLinearGradient(0, 330, 0, H);
      hz.addColorStop(0, 'rgba(80,100,160,0)'); hz.addColorStop(1, L ? `rgba(80,100,160,${(0.10 * (1 - L * 0.2)).toFixed(3)})` : 'rgba(80,100,160,0.10)');
      ctx.fillStyle = hz; ctx.fillRect(0, 330, W, H - 330);
    }
    if (d.type === 'pillar') {
      ctx.fillStyle = room.edgeColor;
      ctx.fillRect(d.x - 12, d.y - d.h, 24, d.h);
      ctx.fillStyle = room.platColor;
      ctx.fillRect(d.x - 14, d.y - d.h, 28, 10);
      ctx.fillRect(d.x - 14, d.y - 10,  28, 10);
    }
    if (d.type === 'arch') {
      ctx.strokeStyle = room.edgeColor;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(d.x, H - 60);
      ctx.lineTo(d.x, d.y + 60);
      ctx.arcTo(d.x + 40, d.y, d.x + 80, d.y + 60, 40);
      ctx.lineTo(d.x + 80, H - 60);
      ctx.stroke();
    }
    if (d.type === 'crystal') {
      // columna de cristal semitransparente
      ctx.fillStyle = hexAlpha(room.particleColor, 0.08);
      ctx.fillRect(d.x, d.y, 4, d.h);
      ctx.fillStyle = hexAlpha(room.particleColor, 0.15);
      ctx.fillRect(d.x + 1, d.y, 2, d.h);
    }
    if (d.type === 'mushroom') {
      // sombrero
      ctx.fillStyle = '#5a3010';
      ctx.beginPath();
      ctx.ellipse(d.x, d.y - 26, 22, 14, 0, Math.PI, 0);
      ctx.fill();
      // tallo
      ctx.fillStyle = '#8a6040';
      ctx.fillRect(d.x - 6, d.y - 26, 12, 26);
      // manchas
      ctx.fillStyle = '#c09060';
      ctx.beginPath();
      ctx.ellipse(d.x - 8, d.y - 32, 5, 4, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(d.x + 6, d.y - 28, 4, 3, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
    if (d.type === 'star') {
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.6 + 0.4 * Math.sin(Date.now() * 0.002 + d.x);
      ctx.beginPath();
      ctx.arc(d.x, d.y, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    if (d.type === 'throne') {
      ctx.fillStyle = '#3a1010';
      // asiento
      ctx.fillRect(d.x, d.y + 60, 100, 20);
      // respaldo
      ctx.fillRect(d.x + 10, d.y, 80, 65);
      // puntas
      ctx.fillStyle = '#601818';
      ctx.fillRect(d.x + 10, d.y - 20, 16, 25);
      ctx.fillRect(d.x + 42, d.y - 30, 16, 35);
      ctx.fillRect(d.x + 74, d.y - 20, 16, 25);
    }
  }
}

function hexAlpha(hex, a) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}

function drawParticles() {
  if (ROOMS[currentRoom].noParticles) return;
  for (const p of particles) {
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.col;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// Pared que tiene justo debajo un muro falso (mismo ancho): se dibujan juntos,
// como una sola pieza, para que no se note la unión
const fakeWallUnder = (q, b) => q !== b && !q.breakable && q.x === b.x && q.w === b.w && q.y + q.h === b.y;

function drawPlatforms(room) {
  if (!room.style && !room.width) ctx.drawImage(slabLayer(room), 0, 0, W, H);
  if (room.width) {
    // sala grande: la roca quieta sale de los pedazos guardados; lo que cambia se pinta cada cuadro
    drawPlatformChunks(room);
    const live = livePlatforms(room);
    for (const p of live) {
      if (p.x + p.w < camX - 10 || p.x > camX + W / camZ + 10 || p.y > camY + H / camZ + 10 || p.y + p.h < camY - 10) continue;
      drawOnePlatform(room, p);
    }
  } else for (const p of room.platforms) drawOnePlatform(room, p);
  if (room.spikes) drawSpikePits(room);
}

// Bloques que pueden cambiar (muros falsos y su pared, trampillas, puertas, escaleras secretas)
function livePlatforms(room) {
  if (!room._live) room._live = room.platforms.filter(p => p.trapdoor || p.door || p.secretStair || p.breakable ||
    room.platforms.some(b => b.breakable && fakeWallUnder(p, b)));
  return room._live;
}

// ── Salas grandes: la roca se pinta una sola vez, en pedazos, y se guarda ──
// Pintar cada bloque (ladrillos, nieve, carámbanos...) 60 veces por segundo
// trababa el juego; ahora cada pedazo se pinta al verse por primera vez y
// después solo se pega. Se vuelve a pintar si cambia la escala o se rompe un muro.
const CHUNK_W = 480, CHUNK_H = 270, CHUNK_PAD = 1;
let chunkCache = { key: null, map: new Map(), room: null };
function drawPlatformChunks(room) {
  const S = Math.min(2, renderScale * camZ); // (más de 2 casi no se nota y gasta mucha memoria)
  const key = currentRoom + '|' + S.toFixed(3) + '|' + [...brokenWalls].join();
  if (chunkCache.key !== key) chunkCache = { key, map: new Map(), room };
  const live = livePlatforms(room);
  const statics = room._statics || (room._statics = room.platforms.filter(p => !live.includes(p)));
  const top = room.top || 0, RW = room.width;
  const i0 = Math.max(0, Math.floor(camX / CHUNK_W)), i1 = Math.floor((camX + W / camZ) / CHUNK_W);
  const j0 = Math.max(0, Math.floor((camY - top) / CHUNK_H)), j1 = Math.floor((camY + H / camZ - top) / CHUNK_H);
  for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
    const x0 = i * CHUNK_W, y0 = top + j * CHUNK_H;
    if (x0 >= RW || y0 >= H) continue;
    let c = chunkCache.map.get(i + ',' + j);
    if (!c) { c = renderChunk(room, statics, x0, y0, S); chunkCache.map.set(i + ',' + j, c); }
    ctx.drawImage(c, x0 - CHUNK_PAD, y0 - CHUNK_PAD, CHUNK_W + 2 * CHUNK_PAD, CHUNK_H + 2 * CHUNK_PAD);
  }
  // de a poco, deja listos los pedazos que todavía no se ven (así no se traba al avanzar)
  const cols = Math.ceil(RW / CHUNK_W), rows = Math.ceil((H - top) / CHUNK_H);
  if (chunkCache.map.size < cols * rows) {
    for (let k = 0; k < cols * rows; k++) {
      const i = k % cols, j = Math.floor(k / cols);
      if (chunkCache.map.has(i + ',' + j)) continue;
      chunkCache.map.set(i + ',' + j, renderChunk(room, statics, i * CHUNK_W, top + j * CHUNK_H, S));
      break;
    }
  }
}
function renderChunk(room, statics, x0, y0, S) {
  const w = CHUNK_W + 2 * CHUNK_PAD, h = CHUNK_H + 2 * CHUNK_PAD;
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(w * S)); c.height = Math.max(1, Math.ceil(h * S));
  const sx = c.width / w, sy = c.height / h, M = 40; // M: lo que sobresale (nieve, carámbanos, raíces)
  const g = c.getContext('2d');
  g.setTransform(sx, 0, 0, sy, -(x0 - CHUNK_PAD) * sx, -(y0 - CHUNK_PAD) * sy);
  const prev = ctx; ctx = g;
  try {
    for (const p of statics) {
      if (p.x > x0 + CHUNK_W + M || p.x + p.w < x0 - M || p.y > y0 + CHUNK_H + M || p.y + p.h < y0 - M) continue;
      drawOnePlatform(room, p);
    }
  } finally { ctx = prev; }
  return c;
}

function drawOnePlatform(room, p) {
  if (p.breakable && brokenWalls.has(p.breakable)) return;
  if (p.breakable && room.platforms.some(q => fakeWallUnder(q, p))) return; // lo pinta su pared
  const fake = room.platforms.find(b => b.breakable && !brokenWalls.has(b.breakable) && fakeWallUnder(p, b));
  if (fake) p = { ...p, h: p.h + fake.h, _src: p };
  if (p.trapdoor && boss2Defeated) {
    // Portal abierto: vacío oscuro con bordes que brillan en púrpura
    const pulse = 0.45 + 0.25 * Math.sin(Date.now() * 0.004);
    ctx.fillStyle = '#000000';
    ctx.fillRect(p.x, p.y, p.w, p.h);
    // borde superior
    const gTop = ctx.createLinearGradient(0, p.y, 0, p.y + 18);
    gTop.addColorStop(0, `rgba(192,100,255,${pulse + 0.15})`);
    gTop.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gTop; ctx.fillRect(p.x, p.y, p.w, 18);
    // borde izquierdo
    const gL = ctx.createLinearGradient(p.x, 0, p.x + 30, 0);
    gL.addColorStop(0, `rgba(192,100,255,${pulse})`);
    gL.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gL; ctx.fillRect(p.x, p.y, 30, p.h);
    // borde derecho
    const gR = ctx.createLinearGradient(p.x + p.w, 0, p.x + p.w - 30, 0);
    gR.addColorStop(0, `rgba(192,100,255,${pulse})`);
    gR.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gR; ctx.fillRect(p.x + p.w - 30, p.y, 30, p.h);
    // línea superior brillante
    ctx.fillStyle = `rgba(220,160,255,${pulse + 0.2})`;
    ctx.fillRect(p.x, p.y, p.w, 2);
    return;
  }
  if (p.secretStair) { if (bossDefeated) drawSecretStair(p); return; }
  if (p.breakable && !room.style && !room.width) { drawSlab(ctx, p, room); return; }
  if (room.width) {
    if (!room.style) { drawSlab(ctx, p, room); return; }
    if (room.carved && p.h > 18) { drawCarvedRock(room, p); return; } // sala de pasillos (roca.js)
  }
  if (room.style === 'castleRock') { drawCastleRockStone(p); return; }
  if (room.style === 'mountain') { drawMountainRock(p, room.night); return; }
  if (room.style === 'organic') { drawOrganicEarth(p, room.smooth, room); return; }
  // las losas normales se dibujan una vez y se guardan (ver slabLayer)
}

// Foso con púas (solo lo que se ve)
function drawSpikePits(room) {
  const v = viewBox();
  for (const [a, b] of room.spikes) {
    const x0 = Math.max(a, v.x0), x1 = Math.min(b, v.x1);
    if (x0 >= x1) continue;
    ctx.fillStyle = '#04060c'; ctx.fillRect(x0, 482, x1 - x0, H - 482);
    for (let x = a + Math.floor((x0 - a) / 16) * 16; x < x1; x += 16) {
      const g = ctx.createLinearGradient(0, 462, 0, 486);
      g.addColorStop(0, '#c8d0e8'); g.addColorStop(1, '#3a4260');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(x, 486); ctx.lineTo(x + 8, 462); ctx.lineTo(x + 16, 486); ctx.closePath(); ctx.fill();
    }
  }
}

function slabLayer(room) {
  return cachedLayer('slabs|' + currentRoom + '|' + boss2Defeated + '|' + [...brokenWalls].join(), c => {
    for (const p of room.platforms) {
      if ((p.trapdoor && boss2Defeated) || p.secretStair || p.door || p.breakable) continue;
      const fake = room.platforms.find(b => b.breakable && !brokenWalls.has(b.breakable) && fakeWallUnder(p, b));
      drawSlab(c, fake ? { ...p, h: p.h + fake.h } : p, room);
    }
  });
}

// Mezcla un color #rrggbb con blanco (amt > 0) o negro (amt < 0)
function shadeHex(hex, amt) {
  const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
  const tgt = amt > 0 ? 255 : 0, k = Math.abs(amt);
  return `rgb(${c.map(v => Math.round(v + (tgt - v) * k)).join(',')})`;
}

function drawSlab(c, p, room) {
  const ground = p.h >= 40;
  // sombra suave
  c.fillStyle = 'rgba(0,0,0,0.32)';
  c.beginPath(); c.roundRect(p.x + 3, p.y + 5, p.w, p.h, 4); c.fill();
  // cuerpo con degradado
  const g = c.createLinearGradient(0, p.y, 0, p.y + p.h);
  g.addColorStop(0, shadeHex(room.floorColor, 0.12));
  g.addColorStop(1, shadeHex(room.floorColor, -0.4));
  c.fillStyle = g;
  c.beginPath(); c.roundRect(p.x, p.y, p.w, p.h, ground ? 2 : 4); c.fill();

  c.save();
  c.beginPath(); c.roundRect(p.x, p.y, p.w, p.h, ground ? 2 : 4); c.clip();
  // juntas entre losas (filas desplazadas en el suelo)
  const rowH = ground ? 28 : p.h;
  for (let row = 0, y = p.y + 4; y < p.y + p.h; row++, y += rowH) {
    if (row > 0) {
      c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(p.x, y - 1, p.w, 1.5);
      c.fillStyle = 'rgba(255,255,255,0.05)'; c.fillRect(p.x, y + 0.5, p.w, 1);
    }
    const off = row % 2 ? 26 : 0;
    for (let x = p.x + 52 - off; x < p.x + p.w - 6; x += 52) {
      c.fillStyle = 'rgba(0,0,0,0.38)'; c.fillRect(x, y, 1.5, rowH - 1);
      c.fillStyle = 'rgba(255,255,255,0.06)'; c.fillRect(x + 1.5, y, 1, rowH - 1);
    }
  }
  // desgaste: grietas y desconchones fijos según la posición
  const hash = n => { const v = Math.sin(n * 127.1 + p.x * 3.7 + p.y * 1.3) * 43758.5; return v - Math.floor(v); };
  for (let i = 0; i < Math.max(1, Math.floor(p.w / 70)); i++) {
    const cx = p.x + 10 + hash(i) * (p.w - 20), cy = p.y + 6 + hash(i + 9) * (p.h - 10);
    c.strokeStyle = 'rgba(0,0,0,0.3)'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(cx, cy);
    c.lineTo(cx + 4 + hash(i + 3) * 4, cy + 3); c.lineTo(cx + 7, cy + 6 + hash(i + 5) * 3); c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.05)';
    c.beginPath(); c.arc(p.x + 8 + hash(i + 20) * (p.w - 16), p.y + 8 + hash(i + 30) * (p.h - 12), 1.5 + hash(i + 40) * 2, 0, Math.PI * 2); c.fill();
  }
  // sombra interior en la parte de abajo
  const ig = c.createLinearGradient(0, p.y + p.h - 8, 0, p.y + p.h);
  ig.addColorStop(0, 'rgba(0,0,0,0)'); ig.addColorStop(1, 'rgba(0,0,0,0.3)');
  c.fillStyle = ig; c.fillRect(p.x, p.y + p.h - 8, p.w, 8);
  c.restore();

  // borde superior con relieve
  const eg = c.createLinearGradient(0, p.y, 0, p.y + 5);
  eg.addColorStop(0, shadeHex(room.edgeColor, 0.25));
  eg.addColorStop(1, room.edgeColor);
  c.fillStyle = eg;
  c.beginPath(); c.roundRect(p.x, p.y, p.w, 5, [ground ? 2 : 4, ground ? 2 : 4, 0, 0]); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.22)';
  c.fillRect(p.x + 2, p.y, p.w - 4, 1);
  c.fillStyle = 'rgba(0,0,0,0.25)';
  c.fillRect(p.x, p.y + 5, p.w, 2);
}

// Piedra de muralla: bloques grises grandes y redondeados (estilo Castle Rock)
function drawCastleRockStone(p) {
  const ground = p.h >= 40;
  const block = (x, y, w, h) => {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#7a7472'); g.addColorStop(0.5, '#625c5c'); g.addColorStop(1, '#464042');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.roundRect(x, y, w, h, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,245,235,0.07)';
    ctx.beginPath(); ctx.roundRect(x + 4, y + 3, w - 8, 3, 2); ctx.fill();
  };
  ctx.save();
  const bot = p.y + p.h;
  ctx.beginPath(); ctx.rect(p.x, p.y - 4, p.w, (ground ? bot : p.y + p.h + 30) - p.y + 4); ctx.clip();
  if (ground) {
    // camino de ronda
    ctx.fillStyle = '#2e2828'; ctx.fillRect(p.x, p.y, p.w, bot - p.y);
    const tg = ctx.createLinearGradient(0, p.y, 0, p.y + 12);
    tg.addColorStop(0, '#8a8480'); tg.addColorStop(1, '#625c5a');
    ctx.fillStyle = tg; ctx.beginPath(); ctx.roundRect(p.x, p.y, p.w, 12, 4); ctx.fill();
    // fila de bloques grandes
    for (let x = p.x - 10; x < p.x + p.w; x += 72) block(x + 2, p.y + 14, 68, 28);
    // arcos oscuros debajo
    for (let x = p.x + 10; x < p.x + p.w; x += 48) {
      ctx.fillStyle = '#2a2224';
      if (bot - p.y < 80) continue;
      ctx.beginPath(); ctx.moveTo(x, bot); ctx.lineTo(x, p.y + 56); ctx.arc(x + 14, p.y + 56, 14, Math.PI, 0); ctx.lineTo(x + 28, bot); ctx.closePath(); ctx.fill();
    }
  } else {
    // repisa de piedra con ménsulas
    ctx.fillStyle = '#2e2828';
    for (const cx of [p.x + 16, p.x + p.w - 16]) {
      ctx.beginPath(); ctx.roundRect(cx - 11, p.y + p.h - 2, 22, 10, [0, 0, 6, 6]); ctx.fill();
      ctx.beginPath(); ctx.roundRect(cx - 7,  p.y + p.h + 6, 14, 9,  [0, 0, 7, 7]); ctx.fill();
    }
    ctx.fillStyle = '#2e2828'; ctx.beginPath(); ctx.roundRect(p.x, p.y, p.w, p.h, 6); ctx.fill();
    const n = Math.max(1, Math.round(p.w / 56)), bw = p.w / n;
    for (let k = 0; k < n; k++) block(p.x + k * bw + 1, p.y, bw - 2, p.h);
  }
  ctx.restore();
}

// Roca de montaña con nieve encima (más oscura cuanto más de noche)
// Tierra amorfa: bordes ondulados, musgo arriba y raicillas colgando
function drawOrganicEarth(p, smooth, room) {
  // Columna que cuelga del techo: se dibuja metida en él, sin musgo, para que no se vea la costura
  if (p.joinTop && !smooth) p = { x: p.x, y: p.y - 18, w: p.w, h: p.h + 18, joinTop: true };
  const thin = p.h < 40, wave = (x, y) => (Math.sin(x * 0.11 + y * 0.07) + Math.sin(x * 0.043 - y * 0.13)) * (thin ? 2.5 : 5);
  const wob = smooth ? () => 0 : wave; // sala lisa: bordes rectos
  const step = 14, pts = [];
  for (let x = p.x; x <= p.x + p.w; x += step) pts.push([x, p.y + wob(x, p.y) - (thin ? 2 : 0)]);
  for (let y = p.y; y <= p.y + p.h; y += step) pts.push([p.x + p.w + wob(p.x + p.w, y) * 0.8, y]);
  for (let x = p.x + p.w; x >= p.x; x -= step) pts.push([x, p.y + p.h + wob(x, p.y + p.h) * (thin ? 1.6 : 1) + (thin ? 6 : 0)]);
  for (let y = p.y + p.h; y >= p.y; y -= step) pts.push([p.x + wob(p.x, y) * 0.8, y]);
  // ¿hay otra roca pegada justo encima/debajo en esa x? (la sala es roca con pasillos: no se pinta musgo ni raíces por dentro)
  const solid = q => q !== p && q.h > 18 && !q.breakable;
  const coveredAt = (x, above) => room && room.platforms.some(q => solid(q) && x >= q.x && x <= q.x + q.w &&
    (above ? q.y + q.h === p.y : q.y === p.y + p.h));
  const g = smooth && room && room.top !== undefined && p.h > 18
    ? ctx.createLinearGradient(0, room.top, 0, H) : ctx.createLinearGradient(0, p.y, 0, p.y + p.h + 8); // sala lisa: un solo degradado para toda la roca
  if (p.joinTop) { g.addColorStop(0, '#1c1407'); g.addColorStop(0.35, '#3a2c18'); g.addColorStop(1, '#1a1206'); }
  else { g.addColorStop(0, '#4a3820'); g.addColorStop(1, '#1a1206'); }
  ctx.fillStyle = g;
  ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fill();
  // grumos de tierra
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  for (let x = p.x + 18; x < p.x + p.w - 10; x += 34) for (let y = p.y + 14; y < p.y + p.h - 6; y += 30) {
    ctx.beginPath(); ctx.ellipse(x + wave(y, x) * 2, y, 6, 4, 0.3, 0, Math.PI * 2); ctx.fill();
  }
  if (p.joinTop) return;
  // musgo por encima
  ctx.strokeStyle = '#5a7a2a'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath();
  let pen = false;
  for (let x = p.x; x <= p.x + p.w; x += step) {
    if (coveredAt(x, true)) { pen = false; continue; }
    const y = p.y + wob(x, p.y) - (thin ? 2 : 0); pen ? ctx.lineTo(x, y) : ctx.moveTo(x, y); pen = true;
  }
  ctx.stroke();
  // raicillas colgando por debajo
  ctx.strokeStyle = 'rgba(90,60,30,0.8)'; ctx.lineWidth = 1.4;
  for (let x = p.x + 12; x < p.x + p.w - 6; x += 26) {
    if (coveredAt(x, false)) continue;
    const y0 = p.y + p.h + (thin ? 5 : 2), len = 6 + Math.abs(wave(x * 3, y0)) * 2.5;
    ctx.beginPath(); ctx.moveTo(x, y0); ctx.quadraticCurveTo(x + 3, y0 + len * 0.6, x - 1, y0 + len); ctx.stroke();
  }
}

function drawMountainRock(p, night) {
  const ground = p.h >= 40, k = night * 0.1;
  const bottom = p.y + p.h;
  const g = ctx.createLinearGradient(0, p.y, 0, bottom);
  g.addColorStop(0, shadeHex('#4a5068', -k)); g.addColorStop(1, shadeHex('#1a1e2e', -k));
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.roundRect(p.x, p.y, p.w, bottom - p.y, ground ? 3 : 6); ctx.fill();
  ctx.save();
  ctx.beginPath(); ctx.roundRect(p.x, p.y, p.w, bottom - p.y, ground ? 3 : 6); ctx.clip();
  // grietas de la roca
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1.5;
  for (let x = p.x + 30, i = 0; x < p.x + p.w - 10; x += 64, i++) {
    const y0 = p.y + 8 + (i % 3) * 4;
    ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x + 6, y0 + 10); ctx.lineTo(x + 2, y0 + 22); ctx.stroke();
  }
  if (ground) {
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    for (let x = p.x + 12, i = 0; x < p.x + p.w; x += 52, i++) {
      ctx.beginPath(); ctx.ellipse(x, p.y + 50 + (i % 2) * 30, 18, 8, 0, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
  if (p.breakable) return; // un muro falso no lleva nieve encima: sería una pista
  // capa de nieve con borde ondulado
  const sg = ctx.createLinearGradient(0, p.y - 3, 0, p.y + 10);
  sg.addColorStop(0, shadeHex('#eef2ff', -k)); sg.addColorStop(1, shadeHex('#b8c2dc', -k));
  ctx.fillStyle = sg;
  ctx.beginPath(); ctx.moveTo(p.x - 2, p.y + 4);
  ctx.quadraticCurveTo(p.x - 2, p.y - 3, p.x + 6, p.y - 3);
  ctx.lineTo(p.x + p.w - 6, p.y - 3);
  ctx.quadraticCurveTo(p.x + p.w + 2, p.y - 3, p.x + p.w + 2, p.y + 4);
  for (let x = p.x + p.w; x > p.x; x -= 14) {
    const d = 3 + ((x * 7) % 5);
    ctx.quadraticCurveTo(x - 7, p.y + d + 3, Math.max(p.x - 2, x - 14), p.y + 4);
  }
  ctx.closePath(); ctx.fill();
}

// Oscuridad alrededor del mapache en lo alto de la montaña
function drawNightDark(room) {
  if (!room.night) return;
  const cx = player.x + player.w / 2 - camX, cy = player.y + player.h / 2 - camY;
  const g = ctx.createRadialGradient(cx, cy, 70, cx, cy, 460 - room.night * 50);
  g.addColorStop(0, 'rgba(0,0,6,0)');
  g.addColorStop(1, `rgba(0,0,6,${(room.night * 0.16).toFixed(2)})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

function drawExitGlow(room) {
  for (const p of room.platforms) if (p.breakable && !brokenWalls.has(p.breakable)) drawWallCracks(p);
  drawWallDebris();
  if (room.hatch) drawHatch(room.hatch);
  const exits = room.exits || {};
  const pc = room.particleColor;
  const pulse = 0.2 + 0.1 * Math.sin(Date.now() * 0.003);

  if (exits.right && !exits.right.hidden && !(currentRoom === 3 && !boss2Defeated) && !(currentRoom === 13 && !castleDoorOpen)) {
    const RW = room.width || W;
    const g = ctx.createLinearGradient(RW - 60, 0, RW, 0);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, hexAlpha(pc, pulse));
    ctx.fillStyle = g;
    const [b0, b1] = exits.right.band || [100, H - 100];
    ctx.fillRect(RW - 60, b0, 60, b1 - b0);
  }
  if (exits.left && !exits.left.hidden) {
    const [b0, b1] = exits.left.band || [100, H - 100];
    const g = ctx.createLinearGradient(0, 0, 60, 0);
    g.addColorStop(0, hexAlpha(pc, pulse));
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, b0, 60, b1 - b0);
  }
  if (exits.up && !(currentRoom === 3 && !boss2Defeated) && currentRoom !== 4 && !(currentRoom === 13 && !guardsDefeated)) {
    const top = room.top || 0, [ux0, ux1] = exits.up.bandX || [360, 600];
    const g = ctx.createLinearGradient(0, top, 0, top + 60);
    g.addColorStop(0, hexAlpha(pc, pulse));
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(ux0, top, ux1 - ux0, 60);
  }
  if (exits.down && !(currentRoom === 3 && !boss2Defeated)) {
    const [dx0, dx1] = exits.down.bandX || [360, 600];
    const g = ctx.createLinearGradient(0, H - 60, 0, H);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, hexAlpha(pc, pulse));
    ctx.fillStyle = g;
    ctx.fillRect(dx0, H - 60, dx1 - dx0, 60);
  }
}

function bezierPt(t, x0, y0, cx, cy, x1, y1) {
  const m = 1 - t;
  return { x: m*m*x0 + 2*m*t*cx + t*t*x1, y: m*m*y0 + 2*m*t*cy + t*t*y1 };
}
