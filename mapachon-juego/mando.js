// ─── MANDO (control de consola) ──────────────────────────────────────────────
// Xbox, PlayStation, Switch Pro o casi cualquier control. Cada botón se traduce
// a la tecla que ya entiende el juego, así funciona igual en el juego, en la
// pantalla de partidas y en el menú de pausa.
//   Stick izquierdo / cruceta: moverse        A / ✕: saltar
//   X / □: atacar                            Y / △, RB / R1: disparar
//   B / ○: curarse (mantener)                Start: pausa · Back: inventario
//   (los botones se cambian en Pausa → Configuraciones → Controles)
//   En menús: cruceta/stick elegir, A aceptar, B volver.
let gamepadActive = false; // se usó un mando hace poco (para mostrar sus botones en las ayudas)
const padHeld = {};        // "tecla" que el mando tiene apretada
const padRepeat = {};      // flechas en menús: se repiten si se mantienen

function padKey(code, down) {
  document.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { code, key: code, bubbles: true }));
}

let padPrev = [];          // botones apretados en el cuadro anterior
function pollGamepads() {
  const pads = navigator.getGamepads ? navigator.getGamepads() : [];
  const pad = [...pads].find(p => p && p.connected);
  if (!pad) return;
  const b = i => !!(pad.buttons[i] && pad.buttons[i].pressed);
  const pressedNow = pad.buttons.map((x, i) => b(i));
  // poniendo un botón nuevo en Controles: el primer botón que se apriete (no la cruceta)
  if (rebind && pauseState === 'controls') {
    const i = pressedNow.findIndex((p, k) => p && !padPrev[k] && (k < 12 || k > 15));
    padPrev = pressedNow;
    if (i >= 0) {
      gamepadActive = true;
      if (i === 1 && PAD_MOVE.includes(rebind)) rebind = null;          // B cancela si la acción no usa botón
      else if (!PAD_MOVE.includes(rebind)) { setPadBind(rebind, i); rebind = null; }
    }
    return;
  }
  padPrev = pressedNow;
  const ax = pad.axes[0] || 0, ay = pad.axes[1] || 0;
  const up = b(12) || ay < -0.55, dn = b(13) || ay > 0.55, lf = b(14) || ax < -0.55, rt = b(15) || ax > 0.55;
  const inMenu = !!(titleState || pauseState);
  // qué "teclas" están apretadas según el mando: en menús flechas/Enter/Esc fijos; jugando, las acciones
  const want = {};
  if (inMenu) {
    Object.assign(want, { ArrowUp: up, ArrowDown: dn, ArrowLeft: lf, ArrowRight: rt, Enter: b(0), Escape: b(1) });
  } else {
    Object.assign(want, { 'Pad:left': lf, 'Pad:right': rt, 'Pad:down': dn });
    for (const a in padBinds) want['Pad:' + a] = padBinds[a].some(b);
  }
  const now = performance.now();
  for (const code in padHeld) if (padHeld[code] && !want[code]) { padKey(code, false); padHeld[code] = false; }
  for (const code in want) {
    if (want[code] && !padHeld[code]) {
      gamepadActive = true;
      padHeld[code] = true; padKey(code, true);
      padRepeat[code] = now + 380;
    } else if (want[code] && inMenu && code.startsWith('Arrow') && now > padRepeat[code]) {
      // en los menús, mantener una dirección sigue moviendo la selección
      padKey(code, false); padKey(code, true); padRepeat[code] = now + 140;
    }
  }
}
// si se usa el teclado o se toca la pantalla, las ayudas vuelven a mostrar teclas
document.addEventListener('keydown', e => { if (e.isTrusted) gamepadActive = false; });
window.addEventListener('gamepadconnected', () => { gamepadActive = true; });
