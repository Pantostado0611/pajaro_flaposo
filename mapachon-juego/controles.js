// ─── CONTROLES CONFIGURABLES ─────────────────────────────────────────────────
// Cada acción tiene sus teclas y sus botones de mando (se cambian en Pausa →
// Configuraciones → Controles y se guardan). El mando manda códigos 'Pad:acción'.
const ACTIONS = [
  ['left', 'Izquierda'], ['right', 'Derecha'], ['down', 'Abajo (descansar)'], ['jump', 'Saltar'],
  ['attack', 'Atacar'], ['shoot', 'Disparar'], ['heal', 'Curarse'], ['inv', 'Inventario'], ['pause', 'Pausa'],
];
const DEFAULT_KEYS = {
  left: ['ArrowLeft', 'KeyA'], right: ['ArrowRight', 'KeyD'], down: ['ArrowDown', 'KeyS'], jump: ['Space', 'ArrowUp', 'KeyW'],
  attack: ['KeyZ', 'KeyJ', 'KeyX'], shoot: ['KeyC', 'KeyK'], heal: ['KeyF', 'KeyV'], inv: ['Tab', 'KeyI'], pause: ['Escape'],
};
// botones del mando (numeración estándar: 0 A, 1 B, 2 X, 3 Y, 4 LB, 5 RB, 6 LT, 7 RT, 8 Back, 9 Start…)
const DEFAULT_PAD = { jump: [0], attack: [2], shoot: [3, 5], heal: [1], inv: [8], pause: [9] };
const PAD_MOVE = ['left', 'right', 'down'];        // con el mando se mueven con la cruceta o el stick
const RESERVED_KEYS = ['KeyM', 'KeyL', 'F11'];     // música, trucos, pantalla completa
let keyBinds, padBinds;
function loadBinds() {
  let d = null;
  try { d = JSON.parse(localStorage.getItem('mapachon-controles')); } catch (e) {}
  keyBinds = JSON.parse(JSON.stringify(DEFAULT_KEYS)); padBinds = JSON.parse(JSON.stringify(DEFAULT_PAD));
  if (d && d.keys) for (const a in keyBinds) if (Array.isArray(d.keys[a]) && d.keys[a].length) keyBinds[a] = d.keys[a];
  if (d && d.pad) for (const a in padBinds) if (Array.isArray(d.pad[a]) && d.pad[a].length) padBinds[a] = d.pad[a];
}
function saveBinds() {
  try { localStorage.setItem('mapachon-controles', JSON.stringify({ keys: keyBinds, pad: padBinds })); } catch (e) {}
}
function resetBinds() { try { localStorage.removeItem('mapachon-controles'); } catch (e) {} loadBinds(); }
// pone `code` a la acción; si otra acción la usaba, esa se queda con la tecla vieja (se intercambian)
function setKeyBind(action, code) {
  const old = keyBinds[action][0];
  for (const a in keyBinds) if (a !== action && keyBinds[a].includes(code)) {
    keyBinds[a] = keyBinds[a].filter(c => c !== code);
    if (!keyBinds[a].length && old) keyBinds[a] = [old];
  }
  keyBinds[action] = [code]; saveBinds();
}
function setPadBind(action, btn) {
  const old = padBinds[action][0];
  for (const a in padBinds) if (a !== action && padBinds[a].includes(btn)) {
    padBinds[a] = padBinds[a].filter(b => b !== btn);
    if (!padBinds[a].length && old !== undefined) padBinds[a] = [old];
  }
  padBinds[action] = [btn]; saveBinds();
}
const act = (code, a) => keyBinds[a].includes(code) || code === 'Pad:' + a;
const held = a => keys['Pad:' + a] || keyBinds[a].some(c => keys[c]);
loadBinds();

// ─── TECLADO ─────────────────────────────────────────────────────────────────
const keys = {};
document.addEventListener('keydown', e => {
  if (e.code === 'KeyM') { Music.toggleMute(); e.preventDefault(); return; }
  if (pauseKey(e)) { e.preventDefault(); return; } // menú de pausa (Esc)
  if (chapterTimer > 0) {
    if (chapterTimer < chapterDur - 90) chapterTimer = Math.min(chapterTimer, 50);
    e.preventDefault(); return;
  }
  // Con el código 0614 la I abre el mapa de teletransporte (Tab sigue abriendo el inventario)
  if (e.code === 'KeyI' && richMode) {
    cheatState = cheatState === 'map' ? 'closed' : 'map'; cheatCode = ''; showInventory = false; updateCheatUI();
    e.preventDefault(); return;
  }
  if (act(e.code, 'inv')) { showInventory = !showInventory; e.preventDefault(); return; }
  if (e.code === 'KeyL') {
    cheatState = cheatState === 'closed' ? 'input' : 'closed';
    cheatCode = ''; cheatError = 0; updateCheatUI();
    e.preventDefault(); return;
  }
  if (cheatState !== 'closed') {
    if (e.code === 'Escape' && cheatState === 'zone') cheatState = 'map';
    else if (e.code === 'Escape') { cheatState = 'closed'; cheatCode = ''; updateCheatUI(); }
    else if (cheatState === 'zone') {
      const k = parseInt(e.key, 10), list = zoneRooms(cheatZone);
      if (k >= 1 && k <= list.length) cheatTeleport(list[k - 1]);
    }
    else if (cheatState === 'input') {
      if (e.key >= '0' && e.key <= '9') cheatAppend(e.key);
      else if (e.code === 'Backspace')  cheatCode = cheatCode.slice(0, -1);
    }
    e.preventDefault(); return;
  }
  if (!keys[e.code]) {
    if (act(e.code, 'jump')) player.jumpBuffered = true;
    if (act(e.code, 'attack')) tryAttack();
    if (act(e.code, 'shoot')) tryShoot();
  }
  keys[e.code] = true;
  e.preventDefault();
});
document.addEventListener('keyup', e => { keys[e.code] = false; });

// (mientras come basura para curarse, el mapache no se mueve)
function left()     { return !healing && (held('left') || touch.left); }
function right()    { return !healing && (held('right') || touch.right); }
const zoneOf = r => ROOMS[r].zone ?? r; // sala principal de la zona
function down()     { return held('down'); }
function jumpHeld() { return held('jump') || touch.jump; }

// ─── TÁCTIL ───────────────────────────────────────────────────────────────────
const touch = { left: false, right: false, jump: false, attack: false, shoot: false, heal: false };

(function () {
  function bind(id, key) {
    const el = document.getElementById(id);
    if (!el) return;
    function down(e) {
      e.preventDefault();
      touch[key] = true;
      if (key === 'jump') player.jumpBuffered = true;
      if (key === 'attack') tryAttack();
      if (key === 'shoot')  tryShoot();
    }
    function up(e) { e.preventDefault(); touch[key] = false; }
    el.addEventListener('touchstart',  down, { passive: false });
    el.addEventListener('touchend',    up,   { passive: false });
    el.addEventListener('touchcancel', up,   { passive: false });
  }
  bind('btn-left',   'left');
  bind('btn-right',  'right');
  bind('btn-jump',   'jump');
  bind('btn-attack', 'attack');
  bind('btn-shoot',  'shoot');
  bind('btn-heal',   'heal');
  const invBtn = document.getElementById('btn-inv');
  if (invBtn) {
    invBtn.addEventListener('touchstart', e => { e.preventDefault(); showInventory = !showInventory; }, { passive: false });
  }
})();
