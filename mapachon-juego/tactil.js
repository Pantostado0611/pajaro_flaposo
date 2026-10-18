// ─── BOTONES TÁCTILES A TU GUSTO ─────────────────────────────────────────────
// Pausa → Configuraciones → Botones táctiles: los botones del celular se
// arrastran a donde quieras y se hacen más grandes o más chicos. Se guarda la
// posición (como parte de la pantalla, así sirve al girar el celular) y el tamaño.
const TOUCH_IDS = ['btn-left', 'btn-right', 'btn-jump', 'btn-attack', 'btn-shoot', 'btn-heal', 'btn-inv', 'btn-pause', 'btn-music', 'btn-cheat'];
let touchLayout = {};
try { touchLayout = JSON.parse(localStorage.getItem('mapachon-tactil')) || {}; } catch (e) {}
let touchEdit = null; // { sel: id del botón elegido, drag: {id, dx, dy} }

function applyTouchLayout() {
  for (const id of TOUCH_IDS) {
    const el = document.getElementById(id), L = touchLayout[id];
    if (!el || !el.style) continue;
    if (!L) { for (const k of ['left', 'top', 'right', 'bottom', 'width', 'height', 'fontSize']) el.style[k] = ''; continue; }
    el.style.width = el.style.height = L.s + 'px';
    el.style.fontSize = Math.round(L.s * 0.38) + 'px';
    el.style.left = Math.round(L.x * window.innerWidth - L.s / 2) + 'px';
    el.style.top = Math.round(L.y * window.innerHeight - L.s / 2) + 'px';
    el.style.right = el.style.bottom = 'auto';
  }
}
function saveTouchLayout() {
  try { localStorage.setItem('mapachon-tactil', JSON.stringify(touchLayout)); } catch (e) {}
}
window.addEventListener('resize', applyTouchLayout);
applyTouchLayout();

function touchBtnRect(id) { return document.getElementById(id).getBoundingClientRect(); }
// guarda donde quedó un botón (centro como fracción de la pantalla)
function rememberTouchBtn(id) {
  const r = touchBtnRect(id);
  touchLayout[id] = { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight, s: Math.round(r.width) };
}

// ── modo de edición ──────────────────────────────────────────────────────────
let touchEditBar = null;
function startTouchEdit() {
  pauseState = 'touchedit';
  menuHidesTouch(false);
  touchEdit = { sel: null, drag: null };
  const tc = document.getElementById('touch-controls');
  if (tc) tc.style.display = 'block'; // también en compu, para poder acomodarlos con el ratón
  if (!touchEditBar) {
    touchEditBar = document.createElement('div');
    touchEditBar.id = 'touch-edit-bar';
    touchEditBar.innerHTML = `<div class="te-msg">Arrastra los botones a donde quieras · toca uno y cambia su tamaño</div>
      <div class="te-row"><button data-te="menos">− Más chico</button><button data-te="mas">+ Más grande</button>
      <button data-te="reset">Restablecer</button><button data-te="listo">Listo</button></div>`;
    touchEditBar.addEventListener('click', e => {
      const what = e.target.dataset && e.target.dataset.te;
      if (!what) return;
      if (what === 'listo') endTouchEdit();
      else if (what === 'reset') { touchLayout = {}; saveTouchLayout(); applyTouchLayout(); markTouchSel(null); }
      else if (touchEdit.sel) {
        rememberTouchBtn(touchEdit.sel);
        const L = touchLayout[touchEdit.sel];
        L.s = Math.max(36, Math.min(130, L.s + (what === 'mas' ? 8 : -8)));
        applyTouchLayout(); saveTouchLayout();
      }
    });
    document.body.appendChild(touchEditBar);
  }
  touchEditBar.style.display = 'flex';
}
function endTouchEdit() {
  touchEdit = null;
  markTouchSel(null);
  if (touchEditBar) touchEditBar.style.display = 'none';
  const tc = document.getElementById('touch-controls');
  if (tc) tc.style.display = '';
  saveTouchLayout();
  openPause('config', 2);
}
function markTouchSel(id) {
  for (const b of TOUCH_IDS) { const el = document.getElementById(b); if (el && el.classList) el.classList.toggle('te-sel', b === id); }
  if (touchEdit) touchEdit.sel = id;
}

// arrastrar (con dedo o ratón); mientras se edita, los botones no hacen su acción
document.addEventListener('pointerdown', e => {
  if (!touchEdit) return;
  const btn = e.target.closest && e.target.closest('.t-btn');
  if (!btn || !TOUCH_IDS.includes(btn.id)) return;
  const r = btn.getBoundingClientRect();
  touchEdit.drag = { id: btn.id, dx: e.clientX - (r.left + r.width / 2), dy: e.clientY - (r.top + r.height / 2), pid: e.pointerId };
  markTouchSel(btn.id);
  rememberTouchBtn(btn.id);
  e.preventDefault(); e.stopPropagation();
}, true);
document.addEventListener('pointermove', e => {
  if (!touchEdit || !touchEdit.drag || e.pointerId !== touchEdit.drag.pid) return;
  const D = touchEdit.drag, L = touchLayout[D.id];
  L.x = Math.max(0, Math.min(1, (e.clientX - D.dx) / window.innerWidth));
  L.y = Math.max(0, Math.min(1, (e.clientY - D.dy) / window.innerHeight));
  applyTouchLayout();
  e.preventDefault();
}, true);
document.addEventListener('pointerup', e => {
  if (!touchEdit || !touchEdit.drag) return;
  touchEdit.drag = null; saveTouchLayout();
}, true);
for (const type of ['touchstart', 'touchend', 'touchmove']) {
  document.addEventListener(type, e => {
    if (!touchEdit) return;
    const btn = e.target.closest && e.target.closest('.t-btn');
    if (btn) { e.stopPropagation(); if (e.cancelable) e.preventDefault(); }
  }, { capture: true, passive: false });
}
