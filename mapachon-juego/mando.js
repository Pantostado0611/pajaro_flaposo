// ─── MANDO (control de consola) ──────────────────────────────────────────────
// Xbox, PlayStation, Switch Pro o casi cualquier control. Cada botón se traduce
// a la tecla que ya entiende el juego, así funciona igual en el juego, en la
// pantalla de partidas y en el menú de pausa.
//   Stick izquierdo / cruceta: flechas       A / ✕: saltar (Espacio)
//   X / □: atacar (Z)                        Y / △, RB / R1: disparar (C)
//   B / ○: curarse (F, mantener) · en menús: volver (Esc)
//   Start / Options: pausa (Esc)             Back / Share: inventario (Tab)
let gamepadActive = false; // se usó un mando hace poco (para mostrar sus botones en las ayudas)
const padHeld = {};        // botón → tecla que se mandó al apretarlo
const padRepeat = {};      // flechas en menús: se repiten si se mantienen

function padKey(code, down) {
  document.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { code, key: code, bubbles: true }));
}

function pollGamepads() {
  const pads = navigator.getGamepads ? navigator.getGamepads() : [];
  const pad = [...pads].find(p => p && p.connected);
  if (!pad) return;
  const b = i => !!(pad.buttons[i] && pad.buttons[i].pressed);
  const ax = pad.axes[0] || 0, ay = pad.axes[1] || 0;
  const inMenu = !!(titleState || pauseState);
  const want = {
    up: b(12) || ay < -0.55, down: b(13) || ay > 0.55, left: b(14) || ax < -0.55, right: b(15) || ax > 0.55,
    a: b(0), x: b(2), y: b(3) || b(5), b: b(1), start: b(9), back: b(8),
  };
  const map = {
    up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight',
    a: 'Space', x: 'KeyZ', y: 'KeyC', b: inMenu ? 'Escape' : 'KeyF', start: 'Escape', back: 'Tab',
  };
  const now = performance.now();
  for (const k in want) {
    if (want[k] && !padHeld[k]) {
      gamepadActive = true;
      padHeld[k] = map[k]; padKey(map[k], true);
      padRepeat[k] = now + 380;
    } else if (!want[k] && padHeld[k]) {
      padKey(padHeld[k], false); padHeld[k] = null;
    } else if (want[k] && inMenu && ['up', 'down', 'left', 'right'].includes(k) && now > padRepeat[k]) {
      // en los menús, mantener una dirección sigue moviendo la selección
      padKey(padHeld[k], false); padKey(padHeld[k], true); padRepeat[k] = now + 140;
    }
  }
}
// si se usa el teclado o se toca la pantalla, las ayudas vuelven a mostrar teclas
document.addEventListener('keydown', e => { if (e.isTrusted) gamepadActive = false; });
window.addEventListener('gamepadconnected', () => { gamepadActive = true; });
