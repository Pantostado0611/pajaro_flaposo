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
  if (e.code === 'Tab' || e.code === 'KeyI') { showInventory = !showInventory; e.preventDefault(); return; }
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
    if (['Space','ArrowUp','KeyW'].includes(e.code)) player.jumpBuffered = true;
    if (['KeyZ','KeyJ','KeyX'].includes(e.code)) tryAttack();
    if (['KeyC','KeyK'].includes(e.code)) tryShoot();
  }
  keys[e.code] = true;
  e.preventDefault();
});
document.addEventListener('keyup', e => { keys[e.code] = false; });

// (mientras come basura para curarse, el mapache no se mueve)
function left()     { return !healing && (keys['ArrowLeft']  || keys['KeyA'] || touch.left); }
function right()    { return !healing && (keys['ArrowRight'] || keys['KeyD'] || touch.right); }
const zoneOf = r => ROOMS[r].zone ?? r; // sala principal de la zona
function down()     { return keys['ArrowDown'] || keys['KeyS']; }
function jumpHeld() { return keys['Space'] || keys['ArrowUp'] || keys['KeyW'] || touch.jump; }

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
