// ─── MAPA DETALLADO ──────────────────────────────────────────────────────────
// Cada sala es una casilla de una cuadrícula: si sales por arriba, la siguiente
// está encima; por la izquierda, a la izquierda… Así el mapa enseña el camino real.
// Las salas llevan el número del recorrido y el color de su zona.
const MAP_CELL = 40;
let mapGeoCache = null;
function mapGeo() {
  if (mapGeoCache) return mapGeoCache;
  const DIR = { right: [1, 0], left: [-1, 0], up: [0, -1], down: [0, 1] };
  const edges = [];
  for (const [id, R] of Object.entries(ROOMS)) {
    if (R.secret) continue;
    for (const [d, e] of Object.entries(R.exits || {})) if (!ROOMS[e.room].secret) edges.push([+id, d, e.room]);
    if (R.hatch) edges.push([+id, 'down', R.hatch.room]);
  }
  const cell = { 0: [0, 0] }, used = new Set(['0,0']), q = [0];
  while (q.length) {
    const a = q.shift();
    for (const [x, d, y] of edges) {
      let b = null, v = null;
      if (x === a) { b = y; v = DIR[d]; } else if (y === a) { b = x; v = DIR[d].map(c => -c); }
      if (b === null || cell[b]) continue;
      const c = [cell[a][0] + v[0], cell[a][1] + v[1]];
      if (used.has(c + '')) continue;            // atajos (trampillas, etc.): no mueven salas
      cell[b] = c; used.add(c + ''); q.push(b);
      for (const [dx, dy] of ROOMS[b].mapCells || []) used.add([c[0] + dx, c[1] + dy] + '');
    }
  }
  const pos = {}, cells = {};
  for (const [r, c] of Object.entries(cell)) {
    pos[r] = { x: c[0] * MAP_CELL, y: c[1] * MAP_CELL };
    cells[r] = (ROOMS[r].mapCells || [[0, 0]]).map(([dx, dy]) => ({ x: (c[0] + dx) * MAP_CELL, y: (c[1] + dy) * MAP_CELL }));
  }
  // unión entre salas vecinas (las que se tocan en el mapa) o atajos (discontinuas)
  const links = [], seen = new Set();
  for (const [a, , b] of edges) {
    if (!pos[a] || !pos[b]) continue;
    const k = Math.min(a, b) + '-' + Math.max(a, b);
    if (seen.has(k)) continue;
    seen.add(k);
    const adj = Math.abs(cell[a][0] - cell[b][0]) + Math.abs(cell[a][1] - cell[b][1]) === 1;
    links.push([a, b, adj]);
  }
  return (mapGeoCache = { pos, links, cells });
}

// Sala de varias casillas: se rellena entera y solo se dibuja su borde exterior
function drawMapShape(r, T) {
  const G = mapGeo(), C = G.cells[r], s = MAP_CELL * T.s, h = s / 2, pad = s * 0.1;
  const key = c => Math.round(c.x / MAP_CELL) + ',' + Math.round(c.y / MAP_CELL), set = new Set(C.map(key));
  const has = (c, dx, dy) => set.has((Math.round(c.x / MAP_CELL) + dx) + ',' + (Math.round(c.y / MAP_CELL) + dy));
  ctx.fillStyle = '#0a0818';
  for (const c of C) {
    const x = T.x(c.x), y = T.y(c.y);
    const x0 = x - h + (has(c, -1, 0) ? 0 : pad), x1 = x + h - (has(c, 1, 0) ? 0 : pad);
    const y0 = y - h + (has(c, 0, -1) ? 0 : pad), y1 = y + h - (has(c, 0, 1) ? 0 : pad);
    ctx.fillStyle = '#0a0818'; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    ctx.fillStyle = hexAlpha(ROOMS[r].particleColor || '#9a6aff', 0.3); ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
  }
  ctx.strokeStyle = r === currentRoom ? '#40ff90' : 'rgba(200,180,255,0.75)';
  ctx.lineWidth = r === currentRoom ? 2.5 : 1.3;
  ctx.beginPath();
  for (const c of C) {
    const x = T.x(c.x), y = T.y(c.y);
    const x0 = x - h + pad, x1 = x + h - pad, y0 = y - h + pad, y1 = y + h - pad;
    if (!has(c, 0, -1)) { ctx.moveTo(has(c, -1, 0) ? x - h : x0, y0); ctx.lineTo(has(c, 1, 0) ? x + h : x1, y0); }
    if (!has(c, 0, 1))  { ctx.moveTo(has(c, -1, 0) ? x - h : x0, y1); ctx.lineTo(has(c, 1, 0) ? x + h : x1, y1); }
    if (!has(c, -1, 0)) { ctx.moveTo(x0, has(c, 0, -1) ? y - h : y0); ctx.lineTo(x0, has(c, 0, 1) ? y + h : y1); }
    if (!has(c, 1, 0))  { ctx.moveTo(x1, has(c, 0, -1) ? y - h : y0); ctx.lineTo(x1, has(c, 0, 1) ? y + h : y1); }
  }
  ctx.stroke();
  const P = G.pos[r];
  ctx.fillStyle = r === currentRoom ? '#40ff90' : '#ffffff';
  ctx.font = `bold ${Math.max(7, Math.round(s * 0.32))}px monospace`; ctx.textAlign = 'center';
  ctx.fillText(ROOM_ORDER.indexOf(r) + 1, T.x(P.x), T.y(P.y) + s * 0.12);
}

const BOSS_ROOMS = [3, 4, 13];
const MAP_ZONE_NAMES = { 0: 'Ruinas', 1: 'Cristales', 2: 'Jardín', 4: 'Rey', 3: 'La Cima', 5: 'Armería',
  6: 'Castillo', 7: 'Cumbre', 8: 'Sendero', 9: 'Ventisca', 10: 'Risco', 11: 'Pico', 13: 'Guardia', 38: 'Ruinas M.' };
// Dibuja el mapa. T convierte coordenadas del mapa a pantalla; showAll = ver salas no visitadas
function drawWorldMap(T, showAll, labels = true) {
  const G = mapGeo(), seen = r => showAll || visitedRooms.has(r) || r === currentRoom;
  const half = MAP_CELL * 0.4 * T.s;
  // uniones: puertas entre salas vecinas y atajos discontinuos
  for (const [a, b, adj] of G.links) {
    if (!seen(a) || !seen(b)) continue;
    const A = G.pos[a], B = G.pos[b];
    ctx.strokeStyle = adj ? 'rgba(210,190,255,0.85)' : 'rgba(154,106,255,0.4)';
    ctx.lineWidth = adj ? Math.max(2, 5 * T.s) : 1.2;
    ctx.setLineDash(adj ? [] : [4, 4]);
    ctx.beginPath(); ctx.moveTo(T.x(A.x), T.y(A.y)); ctx.lineTo(T.x(B.x), T.y(B.y)); ctx.stroke();
  }
  ctx.setLineDash([]);
  // salas
  for (const [rs, P] of Object.entries(G.pos)) {
    const r = +rs;
    if (!seen(r)) continue;
    const x = T.x(P.x), y = T.y(P.y), boss = BOSS_ROOMS.includes(r), main = zoneOf(r) === r;
    if (ROOMS[r].mapCells) { drawMapShape(r, T); continue; }
    ctx.fillStyle = '#0a0818'; ctx.fillRect(x - half, y - half, half * 2, half * 2);
    ctx.fillStyle = boss ? 'rgba(150,30,30,0.7)' : hexAlpha(ROOMS[r].particleColor || '#9a6aff', main ? 0.5 : 0.28);
    ctx.fillRect(x - half, y - half, half * 2, half * 2);
    ctx.strokeStyle = r === currentRoom ? '#40ff90' : boss ? '#ff5050' : main ? '#f0e0ff' : 'rgba(200,180,255,0.6)';
    ctx.lineWidth = r === currentRoom ? 2.5 : main ? 1.8 : 1;
    ctx.strokeRect(x - half, y - half, half * 2, half * 2);
    if (half >= 5) {
      ctx.fillStyle = r === currentRoom ? '#40ff90' : '#ffffff';
      ctx.font = `bold ${Math.max(7, Math.round(half * 0.8))}px monospace`; ctx.textAlign = 'center';
      ctx.fillText(ROOM_ORDER.indexOf(r) + 1, x, y + half * 0.3);
    }
    if (shade && shade.room === r) { ctx.font = `${Math.max(9, half)}px monospace`; ctx.fillText('👻', x + half, y - half); }
  }
  // nombres de las zonas junto a su sala principal
  if (labels) for (const [z, name] of Object.entries(MAP_ZONE_NAMES)) {
    const P = G.pos[z];
    if (!P || !seen(+z)) continue;
    ctx.font = `bold ${Math.max(8, Math.round(9 * Math.min(1.2, T.s * 1.4)))}px monospace`; ctx.textAlign = 'center';
    const tw = ctx.measureText(name).width, x = T.x(P.x), y = T.y(P.y) + half + 10;
    ctx.fillStyle = 'rgba(4,4,16,0.75)'; ctx.fillRect(x - tw / 2 - 3, y - 9, tw + 6, 12);
    ctx.fillStyle = BOSS_ROOMS.includes(+z) ? '#ff9090' : '#e0d0ff';
    ctx.fillText(name, x, y);
  }
  // flecha sobre la sala actual
  const C = G.pos[currentRoom];
  if (C) {
    const x = T.x(C.x), y = T.y(C.y) - half - 3 + Math.sin(Date.now() * 0.006) * 2;
    ctx.fillStyle = '#40ff90';
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 5, y - 8); ctx.lineTo(x + 5, y - 8); ctx.closePath(); ctx.fill();
  }
}

// Encaja las salas indicadas dentro de un recuadro
function fitMap(rooms, ax, ay, aw, ah, maxScale) {
  const G = mapGeo(), all = rooms.flatMap(r => G.cells[r]), xs = all.map(c => c.x), ys = all.map(c => c.y);
  const minX = Math.min(...xs) - MAP_CELL * 0.7, maxX = Math.max(...xs) + MAP_CELL * 0.7;
  const minY = Math.min(...ys) - MAP_CELL * 0.7, maxY = Math.max(...ys) + MAP_CELL * 1.1;
  const k = Math.min(maxScale, aw / (maxX - minX), ah / (maxY - minY));
  const ox = ax + (aw - (maxX - minX) * k) / 2, oy = ay + (ah - (maxY - minY) * k) / 2;
  return { x: v => ox + (v - minX) * k, y: v => oy + (v - minY) * k, s: k, inv: (mx, my) => [(mx - ox) / k + minX, (my - oy) / k + minY] };
}

let cheatMapT = null;
function drawCheatWorldMap() {
  const all = Object.keys(mapGeo().pos).map(Number);
  cheatMapT = fitMap(all, 60, 86, W - 120, H - 150, 1);
  drawWorldMap(cheatMapT, true);
}

// Sala del mapa secreto bajo el punto
function worldMapRoomAt(mx, my) {
  if (!cheatMapT) return null;
  const [x, y] = cheatMapT.inv(mx, my), half = MAP_CELL * 0.5;
  for (const [r, C] of Object.entries(mapGeo().cells)) for (const P of C) if (Math.abs(x - P.x) <= half && Math.abs(y - P.y) <= half) return +r;
  return null;
}

// ─── MUROS QUE SE ROMPEN Y SALAS SECRETAS ────────────────────────────────────
// Algunos trozos de pared (breakable) son iguales que el resto, pero se rompen
// con 3 golpes o disparos y dejan pasar a una sala secreta. Esas salidas no brillan.
const brokenWalls = new Set();      // muros rotos (se quedan rotos aunque mueras)
const wallHits = {};                // golpes recibidos por cada muro
const wallInv = {};                 // pausa entre golpes
const wallDebris = [];              // cascotes al romperse
const WALL_HITS = 3;

function hitWall(p) {
  if (brokenWalls.has(p.breakable) || (wallInv[p.breakable] || 0) > 0) return;
  wallHits[p.breakable] = (wallHits[p.breakable] || 0) + 1;
  wallInv[p.breakable] = 18;
  shake(6, 2);
  if (wallHits[p.breakable] >= WALL_HITS) {
    brokenWalls.add(p.breakable);
    shake(14, 4);
    for (let i = 0; i < 16; i++) wallDebris.push({
      x: p.x + Math.random() * p.w, y: p.y + Math.random() * p.h,
      vx: (Math.random() - 0.5) * 6, vy: -Math.random() * 6 - 1, r: 2 + Math.random() * 4, t: 50 + Math.random() * 20,
    });
  }
}

function updateBreakables() {
  for (const k in wallInv) if (wallInv[k] > 0) wallInv[k]--;
  for (let i = wallDebris.length - 1; i >= 0; i--) {
    const d = wallDebris[i];
    d.x += d.vx; d.y += d.vy; d.vy += 0.35;
    if (--d.t <= 0) wallDebris.splice(i, 1);
  }
  if (player.attackActive <= 0) return;
  const atkW = 52, atkH = 30;
  const atkX = player.facing === 1 ? player.x + player.w : player.x - atkW, atkY = player.y + 6;
  for (const p of ROOMS[currentRoom].platforms)
    if (p.breakable && !brokenWalls.has(p.breakable) && collideRect(atkX, atkY, atkW, atkH, p.x, p.y, p.w, p.h)) hitWall(p);
}

// Grietas que aparecen al golpear (el muro, por lo demás, es igual que la pared)
function drawWallCracks(p) {
  const n = wallHits[p.breakable] || 0;
  if (!n) return; // sin golpes no se nota nada: igual que la pared
  ctx.save();
  ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 1.5;
  const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
  for (let i = 0; i < n * 2; i++) {
    const a = i * 2.1;
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * 9, cy + Math.sin(a) * 18);
    ctx.lineTo(cx + Math.cos(a + 0.5) * 14, cy + Math.sin(a + 0.4) * 36);
    ctx.stroke();
  }
  ctx.restore();
}

function drawWallDebris() {
  for (const d of wallDebris) {
    ctx.globalAlpha = Math.min(1, d.t / 20);
    ctx.fillStyle = vol(d.x, d.y, d.r, '#8a8a98', '#2a2a34');
    ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ─── COFRES DE LAS SALAS SECRETAS ───────────────────────────────────────────
const openedChests = new Set();
let chestAnim = {};                 // id → frames desde que se abrió
function updateChest() {
  const c = ROOMS[currentRoom].chest;
  if (!c) return;
  if (chestAnim[c.id] !== undefined) chestAnim[c.id]++;
  if (openedChests.has(c.id)) return;
  if (collideRect(player.x, player.y, player.w, player.h, c.x - 22, c.y - 30, 44, 30)) {
    openedChests.add(c.id); chestAnim[c.id] = 0;
    if (c.money) addMoney(c.money, c.x, c.y - 30);
    if (c.heart) {
      player.maxHp += c.heart; player.hp = player.maxHp;
      moneyPops.push({ x: c.x, y: c.y - 50, text: '+1 ❤ vida máxima', t: 120, color: '#ff6688' });
    }
  }
}

function drawChest() {
  const c = ROOMS[currentRoom].chest;
  if (!c) return;
  const open = openedChests.has(c.id), t = Date.now() * 0.003;
  ctx.save();
  ctx.translate(c.x, c.y);
  if (!open) {
    const g = ctx.createRadialGradient(0, -14, 0, 0, -14, 50);
    g.addColorStop(0, `rgba(255,210,90,${(0.25 + 0.1 * Math.sin(t)).toFixed(2)})`); g.addColorStop(1, 'rgba(255,210,90,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -14, 50, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(0, 1, 24, 4, 0, 0, Math.PI * 2); ctx.fill();
  // caja
  const wood = ctx.createLinearGradient(0, -22, 0, 0);
  wood.addColorStop(0, '#8a5a2a'); wood.addColorStop(1, '#4a2a10');
  ctx.fillStyle = wood; ctx.fillRect(-20, -20, 40, 20);
  ctx.fillStyle = '#d0a040'; ctx.fillRect(-20, -20, 40, 3); ctx.fillRect(-20, -3, 40, 3);
  ctx.fillRect(-20, -20, 3, 20); ctx.fillRect(17, -20, 3, 20);
  // tapa (abierta hacia atrás si ya lo abriste)
  ctx.save();
  ctx.translate(0, -20);
  if (open) ctx.rotate(-1.9 * Math.min(1, (chestAnim[c.id] ?? 30) / 12));
  ctx.fillStyle = wood; ctx.beginPath(); ctx.roundRect(-20, -12, 40, 12, [8, 8, 0, 0]); ctx.fill();
  ctx.fillStyle = '#d0a040'; ctx.fillRect(-20, -3, 40, 3); ctx.fillRect(-3, -12, 6, 12);
  ctx.restore();
  if (!open) { ctx.fillStyle = '#ffe080'; ctx.fillRect(-3, -16, 6, 7); ctx.fillStyle = '#2a1a08'; ctx.fillRect(-1, -13, 2, 3); }
  else {
    // brillo que sale del cofre abierto
    const k = Math.min(1, (chestAnim[c.id] ?? 60) / 40);
    ctx.fillStyle = `rgba(255,230,140,${(0.5 * (1 - k) + 0.1).toFixed(2)})`;
    ctx.beginPath(); ctx.moveTo(-16, -20); ctx.lineTo(16, -20); ctx.lineTo(28, -70); ctx.lineTo(-28, -70); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
