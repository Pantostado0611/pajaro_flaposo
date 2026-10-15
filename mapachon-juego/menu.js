// ─── MENÚ DE PAUSA (Esc) ─────────────────────────────────────────────────────
// Reanudar, Configuraciones y Salir (pide confirmación). Se maneja con flechas,
// Enter/Espacio/Z, Esc para volver, o con el ratón.
let pauseState = null;  // null | 'main' | 'config' | 'confirm'
let pauseSel = 0;

const PAUSE_MENUS = {
  main: {
    title: 'Pausa',
    items: () => ['Reanudar', 'Configuraciones', 'Salir'],
    pick: i => { if (i === 0) closePause(); else if (i === 1) openPause('config'); else openPause('confirm', 1); },
    back: () => closePause(),
  },
  config: {
    title: 'Configuraciones',
    items: () => ['Música: ' + (Music.muted ? 'Apagada' : 'Encendida'), 'Volver'],
    pick: i => { if (i === 0) Music.toggleMute(); else openPause('main', 1); },
    back: () => openPause('main', 1),
  },
  confirm: {
    title: '¿Estás seguro?',
    text: 'Toda la información sin guardar se perderá',
    items: () => ['Sí', 'No'],
    pick: i => { if (i === 0) window.location.href = 'index.html'; else openPause('main', 2); },
    back: () => openPause('main', 2),
  },
};

function openPause(state, sel = 0) {
  pauseState = state; pauseSel = sel;
  for (const k in keys) keys[k] = false; // que el mapache no siga caminando
}
function closePause() { pauseState = null; }

// Teclas del menú. Devuelve true si la tecla era para el menú.
function pauseKey(e) {
  if (!pauseState) {
    if (e.code === 'Escape' && cheatState === 'closed' && chapterTimer <= 0) { openPause('main'); return true; }
    return false;
  }
  const M = PAUSE_MENUS[pauseState], n = M.items().length;
  if (e.code === 'Escape') M.back();
  else if (e.code === 'ArrowUp' || e.code === 'KeyW') pauseSel = (pauseSel + n - 1) % n;
  else if (e.code === 'ArrowDown' || e.code === 'KeyS') pauseSel = (pauseSel + 1) % n;
  else if (['Enter', 'Space', 'KeyZ', 'KeyJ', 'NumpadEnter'].includes(e.code)) M.pick(pauseSel);
  return true; // con el menú abierto, ninguna tecla llega al juego
}

// Dónde está cada botón (para dibujar y para el ratón)
function pauseLayout() {
  const M = PAUSE_MENUS[pauseState], items = M.items();
  const bw = 300, bh = 44, gap = 12, top = M.text ? 116 : 88;
  const ph = top + items.length * (bh + gap) + 24, pw = 380;
  const px = (W - pw) / 2, py = (H - ph) / 2;
  return { M, items, px, py, pw, ph, buttons: items.map((t, i) => ({ t, x: (W - bw) / 2, y: py + top + i * (bh + gap), w: bw, h: bh })) };
}

function drawPauseMenu() {
  if (!pauseState) return;
  const L = pauseLayout();
  ctx.save();
  ctx.fillStyle = 'rgba(2,4,12,0.72)'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(14,18,34,0.96)'; ctx.strokeStyle = '#5a6aa8'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(L.px, L.py, L.pw, L.ph, 12); ctx.fill(); ctx.stroke();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#e8eeff'; ctx.font = 'bold 26px serif';
  ctx.fillText(L.M.title, W / 2, L.py + 42);
  if (L.M.text) { ctx.fillStyle = '#ffb0a0'; ctx.font = '15px serif'; ctx.fillText(L.M.text, W / 2, L.py + 80); }
  L.buttons.forEach((b, i) => {
    const on = i === pauseSel;
    ctx.fillStyle = on ? '#3a4a8a' : '#1c2340';
    ctx.strokeStyle = on ? '#9ab0ff' : '#34406a'; ctx.lineWidth = on ? 2 : 1;
    ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = on ? '#ffffff' : '#b8c4e8'; ctx.font = (on ? 'bold ' : '') + '18px serif';
    ctx.fillText(b.t, W / 2, b.y + b.h / 2 + 1);
  });
  ctx.restore();
}

// Ratón: pasar por encima selecciona, clic elige
function pauseButtonAt(e) {
  const r = canvas.getBoundingClientRect(), sc = W / r.width;
  const mx = (e.clientX - r.left) * sc, my = (e.clientY - r.top) * sc;
  return pauseLayout().buttons.findIndex(b => mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h);
}
canvas.addEventListener('mousemove', e => {
  if (!pauseState) return;
  const i = pauseButtonAt(e); if (i >= 0) pauseSel = i;
});
canvas.addEventListener('click', e => {
  if (!pauseState) return;
  const i = pauseButtonAt(e); if (i >= 0) PAUSE_MENUS[pauseState].pick(i);
});
