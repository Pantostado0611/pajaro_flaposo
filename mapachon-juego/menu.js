// ─── MENÚ DE PAUSA (Esc) ─────────────────────────────────────────────────────
// Reanudar, Configuraciones y Salir (pide confirmación). Se maneja con flechas,
// Enter/Espacio/Z, Esc para volver, o con el ratón.
let pauseState = null;  // null | 'main' | 'config' | 'controls' | 'confirm' | 'touchedit'
let rebind = null;      // acción a la que se le está poniendo tecla o botón
let pauseSel = 0;

const PAUSE_MENUS = {
  main: {
    title: 'Pausa',
    items: () => ['Reanudar', 'Configuraciones', 'Salir al menú'],
    pick: i => { if (i === 0) closePause(); else if (i === 1) openPause('config'); else openPause('confirm', 1); },
    back: () => closePause(),
  },
  config: {
    title: 'Configuraciones',
    items: () => ['Música: ' + (Music.muted ? 'Apagada' : 'Encendida'), 'Controles', 'Botones táctiles (celular)', 'Volver'],
    pick: i => {
      if (i === 0) Music.toggleMute();
      else if (i === 1) openPause('controls');
      else if (i === 2) startTouchEdit();
      else openPause('main', 1);
    },
    back: () => openPause('main', 1),
  },
  controls: {
    title: 'Controles',
    compact: true,
    text: () => rebind ? `Presiona la tecla o el botón del mando para «${actionName(rebind)}»  (Esc: cancelar)`
                       : 'Elige una acción y presiona la tecla o el botón que quieras',
    items: () => [...ACTIONS.map(([a, name]) => `${name}:   ${keyLabel(keyBinds[a][0])}   ·   ${PAD_MOVE.includes(a) ? 'cruceta / stick' : padLabel(padBinds[a][0])}`),
                  'Restablecer', 'Volver'],
    pick: i => {
      if (i < ACTIONS.length) rebind = ACTIONS[i][0];
      else if (i === ACTIONS.length) resetBinds();
      else openPause('config', 1);
    },
    back: () => { if (rebind) rebind = null; else openPause('config', 1); },
  },
  confirm: {
    title: '¿Estás seguro?',
    text: 'Toda la información sin guardar se perderá',
    items: () => ['Sí', 'No'],
    pick: i => { if (i === 0) location.reload(); else openPause('main', 2); }, // vuelve a la pantalla de partidas
    back: () => openPause('main', 2),
  },
};

function openPause(state, sel = 0) {
  pauseState = state; pauseSel = sel;
  for (const k in keys) keys[k] = false; // que el mapache no siga caminando
  for (const k in touch) if (typeof touch[k] === 'boolean') touch[k] = false;
  menuHidesTouch(true);
}
function closePause() { pauseState = null; rebind = null; menuHidesTouch(false); }
// con el menú abierto se esconden los botones táctiles (menos ⏸), para que uno
// que se movió al centro no tape las opciones
function menuHidesTouch(on) {
  const tc = document.getElementById('touch-controls');
  if (tc && tc.classList && typeof tc.classList.toggle === 'function') tc.classList.toggle('menu-open', on);
}

// Nombres para mostrar
const actionName = a => ACTIONS.find(x => x[0] === a)[1];
function keyLabel(code) {
  if (!code) return '—';
  const names = { Space: 'Espacio', ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', Escape: 'Esc', Enter: 'Enter',
    ShiftLeft: 'Shift', ShiftRight: 'Shift der.', ControlLeft: 'Ctrl', ControlRight: 'Ctrl der.', AltLeft: 'Alt', AltRight: 'Alt der.',
    Tab: 'Tab', Backspace: 'Borrar', CapsLock: 'Bloq Mayús' };
  if (names[code]) return names[code];
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  if (code.startsWith('Numpad')) return 'Num ' + code.slice(6);
  return code;
}
function padLabel(b) {
  const names = ['A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT', 'Back', 'Start', 'L3', 'R3', '↑', '↓', '←', '→', 'Home'];
  return b === undefined ? '—' : 'mando ' + (names[b] || 'botón ' + b);
}

// Teclas del menú. Devuelve true si la tecla era para el menú.
function pauseKey(e) {
  if (titleState) return titleKey(e); // pantalla de inicio
  if (!pauseState) {
    if ((e.code === 'Escape' || act(e.code, 'pause')) && cheatState === 'closed' && chapterTimer <= 0) { openPause('main'); return true; }
    return false;
  }
  if (pauseState === 'touchedit') { if (e.code === 'Escape') endTouchEdit(); return true; }
  // poniendo una tecla nueva: la siguiente tecla de verdad es la elegida
  if (rebind) {
    if (e.code === 'Escape') rebind = null;
    else if (e.isTrusted !== false && !e.code.startsWith('Pad:') && !RESERVED_KEYS.includes(e.code)) { setKeyBind(rebind, e.code); rebind = null; }
    return true;
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
  const M = PAUSE_MENUS[pauseState], items = M.items(), text = typeof M.text === 'function' ? M.text() : M.text;
  const c = M.compact, bw = c ? 520 : 300, bh = c ? 30 : 44, gap = c ? 5 : 12, top = text ? (c ? 98 : 116) : 88;
  const ph = top + items.length * (bh + gap) + (c ? 14 : 24), pw = c ? 600 : 380;
  const px = (W - pw) / 2, py = (H - ph) / 2;
  return { M, items, text, px, py, pw, ph, buttons: items.map((t, i) => ({ t, x: (W - bw) / 2, y: py + top + i * (bh + gap), w: bw, h: bh })) };
}

function drawPauseMenu() {
  if (!pauseState || !PAUSE_MENUS[pauseState]) return;
  const L = pauseLayout();
  ctx.save();
  ctx.fillStyle = 'rgba(2,4,12,0.72)'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(14,18,34,0.96)'; ctx.strokeStyle = '#5a6aa8'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(L.px, L.py, L.pw, L.ph, 12); ctx.fill(); ctx.stroke();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#e8eeff'; ctx.font = 'bold 26px serif';
  ctx.fillText(L.M.title, W / 2, L.py + (L.M.compact ? 34 : 42));
  if (L.text) { ctx.fillStyle = rebind ? '#ffe080' : '#ffb0a0'; ctx.font = (L.M.compact ? '14px' : '15px') + ' serif'; ctx.fillText(L.text, W / 2, L.py + (L.M.compact ? 66 : 80)); }
  L.buttons.forEach((b, i) => {
    const on = i === pauseSel;
    ctx.fillStyle = on ? '#3a4a8a' : '#1c2340';
    ctx.strokeStyle = on ? '#9ab0ff' : '#34406a'; ctx.lineWidth = on ? 2 : 1;
    ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = on ? '#ffffff' : '#b8c4e8'; ctx.font = (on ? 'bold ' : '') + (L.M.compact ? '15px' : '18px') + ' serif';
    if (on && rebind) { ctx.fillStyle = '#ffe080'; ctx.fillText(actionName(rebind) + ':   …', W / 2, b.y + b.h / 2 + 1); return; }
    ctx.fillText(b.t, W / 2, b.y + b.h / 2 + 1);
  });
  ctx.restore();
}

// Ratón: pasar por encima selecciona, clic elige
function pauseButtonAt(e) {
  if (!PAUSE_MENUS[pauseState] || rebind) return -1;
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

// Botón táctil ⏸ (en celular no hay Esc): abre o cierra el menú
(function() {
  const el = document.getElementById('btn-pause');
  if (!el) return;
  el.addEventListener('touchstart', e => {
    e.preventDefault();
    if (titleState || pauseState === 'touchedit') return;
    if (pauseState) closePause();
    else if (cheatState === 'closed' && chapterTimer <= 0) openPause('main');
  }, { passive: false });
})();
