// ─── CHEAT MENU ───────────────────────────────────────────────────────────────
const CHEAT_NODES = [
  { id:0, x: 80, y:400, name:'Entrada',  boss:false,   secret:false },
  { id:1, x:280, y:400, name:'Cristales',boss:false,   secret:false },
  { id:2, x:480, y:400, name:'Jardín',   boss:false,   secret:false },
  { id:3, x:280, y:270, name:'La Cima',  boss:true,    secret:false },
  { id:4, x:680, y:400, name:'Rey Final',boss:true,    secret:false },
  { id:5, x:280, y:140, name:'Armería',  boss:false,   secret:false },
  { id:6, x:480, y:270, name:'Castillo', boss:false,   secret:false },
  { id:7, x:480, y:140, name:'Cumbre',   boss:false,   secret:false },
  { id:8, x:575, y:140, name:'Sendero',  boss:false,   secret:false },
  { id:9, x:670, y:140, name:'Ventisca', boss:false,   secret:false },
  { id:10, x:765, y:140, name:'Risco',   boss:false,   secret:false },
  { id:11, x:860, y:140, name:'Pico',    boss:false,   secret:false },
  { id:13, x:860, y:270, name:'Guardia', boss:true,    secret:false },
  { id:38, x:860, y:400, name:'Ruinas M.', boss:false,  secret:false },
];
const CHEAT_EDGES = [[0,1],[1,2],[2,4],[1,3],[3,5],[3,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,13],[13,38]];

function updateCheatUI() {
  const np = document.getElementById('cheat-numpad');
  if (cheatState === 'input') np.classList.add('visible');
  else np.classList.remove('visible');
}

function cheatAppend(digit) {
  if (cheatState !== 'input' || cheatCode.length >= 4) return;
  cheatCode += digit;
  if (cheatCode.length === 4) {
    if      (cheatCode === '0611') { cheatState = 'map'; cheatCode = ''; updateCheatUI(); }
    else if (cheatCode === '0000') { deleteSave(); }
    else if (cheatCode === '1111') { gridMode = !gridMode; cheatState = 'closed'; cheatCode = ''; updateCheatUI(); }
    else if (cheatCode === '9748') { godMode = !godMode; cheatState = 'closed'; cheatCode = ''; updateCheatUI(); }
    else if (cheatCode === '0614') {
      richMode = !richMode;
      godMode = richMode;
      if (richMode) { moneyBeforeRich = money; money = Infinity; }
      else money = moneyBeforeRich;
      cheatState = 'closed'; cheatCode = ''; updateCheatUI();
    }
    else { cheatError = 50; cheatCode = ''; }
  }
}

function cheatTeleport(roomId) {
  cheatState = 'closed'; updateCheatUI();
  if (roomId === 4) bossDefeated  = false;
  if (roomId === 3) boss2Defeated = false;
  if (roomId === 12) boss3Defeated = false;
  if (roomId === 13) guardsDefeated = false;
  startTransition(roomId, 80, 400);
}

// Rejilla de coordenadas (código 1111): 8 cuadros por pantalla (120 px),
// (0,0) en la esquina inferior izquierda de la sala; y crece hacia arriba.
const GRID_CELL = W / 8;
function drawCoordGrid(room) {
  if (!gridMode) return;
  const cx = Math.round(camX), cy = Math.round(camY);
  const sx = wx => (wx - cx) * camZ, sy = wy => (wy - cy) * camZ;
  const RW = room.width || W, top = room.top || 0;
  const half = GRID_CELL / 2;
  ctx.save();
  ctx.lineWidth = 1;
  // Medios cuadros (tenues, punteados)
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.setLineDash([4, 6]);
  ctx.beginPath();
  for (let x = half; x < RW; x += GRID_CELL) { ctx.moveTo(sx(x), sy(top)); ctx.lineTo(sx(x), sy(H)); }
  for (let y = H - half; y > top; y -= GRID_CELL) { ctx.moveTo(sx(0), sy(y)); ctx.lineTo(sx(RW), sy(y)); }
  ctx.stroke();
  // Cuadros enteros
  ctx.setLineDash([]);
  ctx.strokeStyle = 'rgba(255,230,80,0.55)';
  ctx.beginPath();
  for (let x = 0; x <= RW + 0.5; x += GRID_CELL) { ctx.moveTo(sx(x), sy(top)); ctx.lineTo(sx(x), sy(H)); }
  for (let y = H; y >= top - 0.5; y -= GRID_CELL) { ctx.moveTo(sx(0), sy(y)); ctx.lineTo(sx(RW), sy(y)); }
  ctx.stroke();
  // Números en los bordes de la pantalla (siempre visibles al mover la cámara)
  ctx.font = 'bold 13px monospace';
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(0,0,0,0.85)';
  ctx.fillStyle = '#ffe650';
  const label = (t, x, y) => { ctx.strokeText(t, x, y); ctx.fillText(t, x, y); };
  ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
  for (let i = 0, x = 0; x <= RW + 0.5; i++, x += GRID_CELL) {
    const px = sx(x);
    if (px >= -2 && px <= W + 2) label(String(i), Math.min(W - 8, Math.max(8, px)), H - 4);
  }
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  for (let j = 0, y = H; y >= top - 0.5; j++, y -= GRID_CELL) {
    const py = sy(y);
    if (j > 0 && py >= -2 && py <= H + 2) label(String(j), 4, Math.min(H - 10, Math.max(10, py)));
  }
  // Selección hecha arrastrando el ratón (se guarda en medidas de la sala)
  if (gridSel) {
    const x0 = sx(Math.min(gridSel.x0, gridSel.x1)), x1 = sx(Math.max(gridSel.x0, gridSel.x1));
    const y0 = sy(Math.min(gridSel.y0, gridSel.y1)), y1 = sy(Math.max(gridSel.y0, gridSel.y1));
    ctx.fillStyle = 'rgba(80,200,255,0.18)'; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    ctx.strokeStyle = '#50c8ff'; ctx.lineWidth = 2; ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,0.85)'; ctx.fillStyle = '#ffe650';
  }
  if (gridCopiedT > 0) {
    gridCopiedT--;
    ctx.globalAlpha = Math.min(1, gridCopiedT / 30);
    ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillStyle = '#50c8ff';
    label('📋 Copiado: ' + gridCopiedText, W / 2, 28);
    ctx.globalAlpha = 1; ctx.fillStyle = '#ffe650';
  }
  // Posición del ratón, en cuadros (con una crucecita donde apunta)
  if (gridMouse) {
    const { x: mx, y: my } = gridMouse;
    const gx = (mx / camZ + cx) / GRID_CELL, gy = (H - (my / camZ + cy)) / GRID_CELL;
    ctx.strokeStyle = 'rgba(0,0,0,0.85)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(mx - 8, my); ctx.lineTo(mx + 8, my); ctx.moveTo(mx, my - 8); ctx.lineTo(mx, my + 8); ctx.stroke();
    ctx.strokeStyle = '#ffe650'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(mx - 8, my); ctx.lineTo(mx + 8, my); ctx.moveTo(mx, my - 8); ctx.lineTo(mx, my + 8); ctx.stroke();
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,0.85)';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    label(`ratón (${gx.toFixed(1)}, ${gy.toFixed(1)})`, W / 2, 8);
  }
  ctx.restore();
}

function drawCheat() {
  if (cheatState === 'closed') return;
  if (cheatState === 'input') drawCheatInput();
  else if (cheatState === 'zone') drawCheatZone();
  else drawCheatMap();
}

// Salas de una zona en el orden del recorrido (la principal incluida)
function zoneRooms(zone) {
  return ROOM_ORDER.filter(r => zoneOf(r) === zone);
}

// Menú con las salas de la zona elegida en el mapa secreto
const ZONE_MENU = { w: 420, rowH: 46 };
function zoneMenuRect() {
  const n = zoneRooms(cheatZone).length, h = 96 + (n + 1) * ZONE_MENU.rowH;
  return { x: (W - ZONE_MENU.w) / 2, y: (H - h) / 2, w: ZONE_MENU.w, h };
}
function drawCheatZone() {
  drawCheatMap();
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, 0, W, H);
  const list = zoneRooms(cheatZone), R = zoneMenuRect();
  ctx.fillStyle = 'rgba(8,6,24,0.98)'; ctx.fillRect(R.x, R.y, R.w, R.h);
  ctx.strokeStyle = '#9a6aff'; ctx.lineWidth = 3; ctx.strokeRect(R.x, R.y, R.w, R.h);
  ctx.fillStyle = '#c8a0ff'; ctx.font = 'bold 15px monospace'; ctx.textAlign = 'center';
  ctx.fillText('🗺  ' + ROOMS[cheatZone].name, W / 2, R.y + 32);
  ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '11px monospace';
  ctx.fillText('Elige una sala (o pulsa su número)', W / 2, R.y + 52);
  list.forEach((id, i) => {
    const ry = R.y + 70 + i * ZONE_MENU.rowH, here = id === currentRoom;
    ctx.fillStyle = here ? 'rgba(64,255,144,0.12)' : 'rgba(154,106,255,0.10)';
    ctx.fillRect(R.x + 18, ry, R.w - 36, ZONE_MENU.rowH - 8);
    ctx.strokeStyle = here ? '#40ff90' : 'rgba(154,106,255,0.5)'; ctx.lineWidth = 1.5;
    ctx.strokeRect(R.x + 18, ry, R.w - 36, ZONE_MENU.rowH - 8);
    ctx.textAlign = 'left'; ctx.font = 'bold 14px monospace';
    ctx.fillStyle = '#ffffff'; ctx.fillText((i + 1) + '.', R.x + 32, ry + 24);
    ctx.fillStyle = id === cheatZone ? '#ffd060' : '#e0d0ff';
    ctx.fillText(ROOMS[id].name, R.x + 60, ry + 24);
    ctx.textAlign = 'right'; ctx.font = '10px monospace';
    ctx.fillStyle = here ? '#40ff90' : 'rgba(255,255,255,0.4)';
    ctx.fillText(here ? 'ESTÁS AQUÍ' : id === cheatZone ? 'principal' : '', R.x + R.w - 30, ry + 23);
  });
  const by = R.y + 70 + list.length * ZONE_MENU.rowH;
  ctx.textAlign = 'center'; ctx.font = '12px monospace'; ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText('← Volver al mapa  (ESC)', W / 2, by + 24);
}

// Clic o toque en el mapa secreto o en el menú de la zona
function cheatClick(mx, my) {
  if (cheatState === 'map') {
    const r = worldMapRoomAt(mx, my);
    if (r !== null) cheatTeleport(r);
  } else if (cheatState === 'zone') {
    const list = zoneRooms(cheatZone), R = zoneMenuRect();
    const i = Math.floor((my - (R.y + 70)) / ZONE_MENU.rowH);
    if (mx < R.x || mx > R.x + R.w || my < R.y || my > R.y + R.h) { cheatState = 'map'; return; }
    if (i >= 0 && i < list.length) cheatTeleport(list[i]);
    else if (i === list.length) cheatState = 'map';
  }
}

function drawCheatInput() {
  if (cheatError > 0) cheatError--;
  const pw = 340, ph = 196;
  const px = (W - pw) / 2, py = (H - ph) / 2 - 30;
  const shake = cheatError > 0 ? Math.sin(cheatError * 1.1) * 7 : 0;

  ctx.save(); ctx.translate(shake, 0);
  ctx.fillStyle = 'rgba(4,4,18,0.96)';
  ctx.fillRect(px, py, pw, ph);
  const bc = cheatError > 0 ? '#ff3344' : '#9a6aff';
  ctx.strokeStyle = bc; ctx.lineWidth = 3; ctx.strokeRect(px, py, pw, ph);
  ctx.strokeStyle = cheatError > 0 ? '#661122' : '#3a1a6a';
  ctx.lineWidth = 1; ctx.strokeRect(px+5, py+5, pw-10, ph-10);

  ctx.fillStyle = cheatError > 0 ? '#ff5566' : '#c8a0ff';
  ctx.font = 'bold 13px monospace'; ctx.textAlign = 'center';
  ctx.fillText(cheatError > 0 ? '✕  CÓDIGO INCORRECTO' : '🔒  CÓDIGO DE ACCESO', W/2, py+30);
  ctx.strokeStyle = bc; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(px+18, py+42); ctx.lineTo(px+pw-18, py+42); ctx.stroke();

  const slotW=54, slotH=68, gap=12, total=4*slotW+3*gap;
  const sx0 = (W-total)/2, sy = py+58;
  for (let i=0; i<4; i++) {
    const sx = sx0+i*(slotW+gap), filled = i < cheatCode.length;
    ctx.fillStyle = filled ? 'rgba(154,106,255,0.18)' : 'rgba(255,255,255,0.04)';
    ctx.fillRect(sx, sy, slotW, slotH);
    ctx.strokeStyle = i===cheatCode.length ? '#c8a0ff' : (filled ? '#9a6aff' : '#2a2240');
    ctx.lineWidth = 2; ctx.strokeRect(sx, sy, slotW, slotH);
    if (filled) {
      ctx.fillStyle='#fff'; ctx.font='bold 34px monospace'; ctx.textAlign='center';
      ctx.fillText('●', sx+slotW/2, sy+slotH-12);
    }
    if (i===cheatCode.length && Math.floor(Date.now()/500)%2===0) {
      ctx.fillStyle='#c8a0ff';
      ctx.fillRect(sx+slotW/2-1, sy+14, 2, slotH-28);
    }
  }

  ctx.fillStyle='rgba(255,255,255,0.28)'; ctx.font='10px monospace'; ctx.textAlign='center';
  ctx.fillText('L / ESC  ·  ✕  para cerrar', W/2, py+ph-12);
  ctx.restore();
}

function drawCheatMap() {
  const px=40, py=40, pw=W-80, ph=H-80;
  ctx.fillStyle='rgba(4,4,18,0.97)';
  ctx.fillRect(px,py,pw,ph);
  ctx.strokeStyle='#9a6aff'; ctx.lineWidth=3; ctx.strokeRect(px,py,pw,ph);
  ctx.strokeStyle='#3a1a6a'; ctx.lineWidth=1; ctx.strokeRect(px+5,py+5,pw-10,ph-10);

  ctx.fillStyle='#c8a0ff'; ctx.font='bold 14px monospace'; ctx.textAlign='center';
  ctx.fillText('🗺  MAPA SECRETO  —  Toca una sala', W/2, py+30);
  ctx.strokeStyle='#3a1a6a'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(px+18,py+42); ctx.lineTo(px+pw-18,py+42); ctx.stroke();

  drawCheatWorldMap();

  ctx.fillStyle='rgba(255,255,255,0.25)'; ctx.font='10px monospace'; ctx.textAlign='center';
  ctx.fillText('L / ESC para cerrar', W/2, py+ph-14);
}

// Dibuja las salas y conexiones. showSecret: incluir salas secretas.
// hereId: sala a resaltar como "estás aquí" (-1 = ninguna).
function drawRoomGraph(showSecret, hereId) {
  const nodes = CHEAT_NODES.filter(n => showSecret || !n.secret);

  // Conexiones
  ctx.strokeStyle='rgba(154,106,255,0.35)'; ctx.lineWidth=2;
  for (const [a,b] of CHEAT_EDGES) {
    const na=CHEAT_NODES.find(n => n.id === a), nb=CHEAT_NODES.find(n => n.id === b);
    ctx.setLineDash([8,6]);
    ctx.beginPath(); ctx.moveTo(na.x,na.y); ctx.lineTo(nb.x,nb.y); ctx.stroke();
  }
  ctx.setLineDash([]);

  // Nodos
  for (const n of nodes) {
    const pulse = 0.65+0.35*Math.sin(Date.now()*0.003+n.id*1.2);
    const gc = n.boss ? `255,60,60` : `154,106,255`;
    const glow = ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,50);
    glow.addColorStop(0,`rgba(${gc},${(pulse*0.3).toFixed(2)})`);
    glow.addColorStop(1,'transparent');
    ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(n.x,n.y,50,0,Math.PI*2); ctx.fill();

    const nc = n.secret ? `255,210,0` : (n.boss ? `255,60,60` : `154,106,255`);
    ctx.fillStyle=n.secret?'#2a1e00':(n.boss?'#3a0808':'#160828');
    ctx.beginPath(); ctx.arc(n.x,n.y,34,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle=`rgba(${nc},${pulse.toFixed(2)})`;
    ctx.lineWidth=n.secret?3:2.5; ctx.beginPath(); ctx.arc(n.x,n.y,34,0,Math.PI*2); ctx.stroke();

    ctx.fillStyle='#fff'; ctx.font='bold 16px monospace'; ctx.textAlign='center';
    ctx.fillText(n.secret?'★':(n.id+1), n.x, n.y+6);

    ctx.fillStyle=n.secret?'#ffd060':(n.boss?'#ff8888':'#d0b0ff');
    ctx.font='10px monospace';
    ctx.fillText(n.name, n.x, n.y+54);
    if (n.boss)   { ctx.fillStyle='rgba(255,80,80,0.7)';   ctx.font='8px monospace'; ctx.fillText('[ JEFE ]',   n.x, n.y+67); }
    if (n.secret) { ctx.fillStyle='rgba(255,210,0,0.75)';  ctx.font='8px monospace'; ctx.fillText('[ SECRETO ]',n.x, n.y+67); }

    if (n.id === hereId) {
      const bob = Math.sin(Date.now()*0.006)*4;
      ctx.strokeStyle='#40ff90'; ctx.lineWidth=3;
      ctx.beginPath(); ctx.arc(n.x,n.y,40,0,Math.PI*2); ctx.stroke();
      ctx.fillStyle='#40ff90';
      ctx.beginPath(); ctx.moveTo(n.x,n.y-44+bob); ctx.lineTo(n.x-9,n.y-58+bob); ctx.lineTo(n.x+9,n.y-58+bob); ctx.closePath(); ctx.fill();
      ctx.font='bold 9px monospace'; ctx.fillText('ESTÁS AQUÍ', n.x, n.y-64+bob);
    }
  }
}

// Posición del ratón sobre el lienzo (para la rejilla del código 1111)
let gridMouse = null;
canvas.addEventListener('mousemove', e => {
  const r = canvas.getBoundingClientRect(), sc = W / r.width;
  gridMouse = { x: (e.clientX - r.left) * sc, y: (e.clientY - r.top) * sc };
});
canvas.addEventListener('mouseleave', () => { gridMouse = null; });

// Selección de la rejilla: clic y arrastrar copia las coordenadas al portapapeles
let gridSel = null, gridDragging = false, gridCopiedT = 0, gridCopiedText = '';
const gridWorld = (mx, my) => ({ x: mx / camZ + Math.round(camX), y: my / camZ + Math.round(camY) });
const gridFmt = (wx, wy) => `(${(wx / GRID_CELL).toFixed(1)}, ${((H - wy) / GRID_CELL).toFixed(1)})`;
function copyText(t) {
  const fallback = () => {
    const ta = document.createElement('textarea');
    ta.value = t; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (_) {}
    ta.remove();
  };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).catch(fallback);
  else fallback();
}
canvas.addEventListener('mousedown', e => {
  if (!gridMode || cheatState !== 'closed') return;
  const r = canvas.getBoundingClientRect(), sc = W / r.width;
  const p = gridWorld((e.clientX - r.left) * sc, (e.clientY - r.top) * sc);
  gridSel = { x0: p.x, y0: p.y, x1: p.x, y1: p.y }; gridDragging = true;
});
window.addEventListener('mousemove', e => {
  if (!gridDragging) return;
  const r = canvas.getBoundingClientRect(), sc = W / r.width;
  const p = gridWorld((e.clientX - r.left) * sc, (e.clientY - r.top) * sc);
  gridSel.x1 = p.x; gridSel.y1 = p.y;
});
window.addEventListener('mouseup', () => {
  if (!gridDragging) return;
  gridDragging = false;
  const g = gridSel, room = ROOMS[currentRoom].name;
  let text;
  if (Math.abs(g.x1 - g.x0) < 6 && Math.abs(g.y1 - g.y0) < 6) {   // clic sin arrastrar: un punto
    text = `${room}: punto ${gridFmt(g.x0, g.y0)}`;
    gridSel = null;
  } else {   // rectángulo: de la esquina inferior izquierda a la superior derecha
    const xa = Math.min(g.x0, g.x1), xb = Math.max(g.x0, g.x1);
    const ya = Math.max(g.y0, g.y1), yb = Math.min(g.y0, g.y1);
    text = `${room}: de ${gridFmt(xa, ya)} a ${gridFmt(xb, yb)}`;
  }
  copyText(text);
  gridCopiedText = text; gridCopiedT = 180;
});

// Canvas click/touch para el mapa
canvas.addEventListener('click', e => {
  if (cheatState !== 'map' && cheatState !== 'zone') return;
  const r=canvas.getBoundingClientRect(), sc=W/r.width;
  cheatClick((e.clientX-r.left)*sc, (e.clientY-r.top)*sc);
});
canvas.addEventListener('touchend', e => {
  if (chapterTimer > 0 && chapterTimer < chapterDur - 90) { chapterTimer = Math.min(chapterTimer, 50); return; }
  if (cheatState !== 'map' && cheatState !== 'zone') return;
  e.preventDefault();
  const r=canvas.getBoundingClientRect(), sc=W/r.width;
  const t=e.changedTouches[0];
  cheatClick((t.clientX-r.left)*sc, (t.clientY-r.top)*sc);
}, { passive:false });

// Numpad bindings
document.querySelectorAll('#cheat-numpad .np-btn[data-d]').forEach(btn => {
  function act(e) { e.preventDefault(); cheatAppend(btn.dataset.d); }
  btn.addEventListener('click', act);
  btn.addEventListener('touchend', act, { passive:false });
});
(function() {
  function bindNp(id, fn) {
    const el=document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', fn);
    el.addEventListener('touchend', e => { e.preventDefault(); fn(e); }, { passive:false });
  }
  bindNp('np-del', () => { cheatCode=cheatCode.slice(0,-1); });
  bindNp('np-esc', () => { cheatState='closed'; cheatCode=''; updateCheatUI(); });
})();

// Botón táctil 🔑
(function() {
  const el=document.getElementById('btn-cheat');
  if (!el) return;
  el.addEventListener('touchstart', e => {
    e.preventDefault();
    cheatState = cheatState==='closed' ? 'input' : 'closed';
    cheatCode=''; cheatError=0; updateCheatUI();
  }, { passive:false });
})();

function drawChapter() {
  if (chapterTimer <= 0) return;
  chapterTimer--;
  const t  = chapterDur - chapterTimer;              // frames transcurridos
  const tt = t - (chapterText.intro ? CHAPTER_INTRO : 0); // frames desde que sale el título
  const bgA   = Math.min(1, chapterTimer / 50);  // el fondo se va al final
  const textA = Math.min(1, Math.max(0, (tt - 30) / 50)) * bgA;

  ctx.save();
  ctx.fillStyle = `rgba(0,0,0,${bgA})`;
  ctx.fillRect(0, 0, W, H);

  // grieta que parte la pantalla
  const prog = Math.min(1, t / 70);
  ctx.strokeStyle = `rgba(255,80,128,${(0.7 * bgA).toFixed(2)})`;
  ctx.shadowColor = '#ff5080'; ctx.shadowBlur = 16; ctx.lineWidth = 2;
  ctx.beginPath();
  const pts = [[0,300],[180,286],[300,310],[420,280],[540,302],[660,276],[780,298],[W,284]];
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    if (pts[i][0] > W * prog) {
      const [ax, ay] = pts[i - 1], [bx, by] = pts[i], k = (W * prog - ax) / (bx - ax);
      ctx.lineTo(ax + (bx - ax) * k, ay + (by - ay) * k);
      break;
    }
    ctx.lineTo(pts[i][0], pts[i][1]);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // "Nuevo capítulo": aparece, se quita y luego sale el título
  if (chapterText.intro && tt < 0) {
    ctx.globalAlpha = Math.max(0, Math.min(1, (t - 20) / 30, (CHAPTER_INTRO - t) / 30));
    ctx.textAlign = 'center';
    ctx.fillStyle = '#e0d0ff';
    ctx.font = 'italic 600 34px Georgia, serif';
    ctx.fillText('Nuevo capítulo', W / 2, 252);
  }

  ctx.globalAlpha = textA;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#c8a0ff';
  ctx.font = '13px monospace';
  ctx.fillText(chapterText.label, W / 2, 200);
  ctx.fillStyle = '#ffffff';
  ctx.font = '600 52px Georgia, serif';
  ctx.fillText(chapterText.title, W / 2, 262);
  ctx.strokeStyle = 'rgba(200,160,255,0.5)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(W / 2 - 170, 218); ctx.lineTo(W / 2 + 170, 218); ctx.stroke();

  if (t > 120) {
    ctx.globalAlpha = textA * (0.4 + 0.3 * Math.sin(Date.now() * 0.005));
    ctx.fillStyle = '#ffffff'; ctx.font = '10px monospace';
    ctx.fillText('pulsa cualquier tecla', W / 2, H - 40);
  }
  ctx.restore();
}

function drawTransition() {
  if (transAlpha <= 0) return;
  const color = (isDeath && transPhase !== 'fade-in')
    ? `rgba(60,0,0,${transAlpha})`
    : `rgba(0,0,0,${transAlpha})`;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, W, H);
}
