// ─── SKINS ───────────────────────────────────────────────────────────────────
// El mapache puede verse como perro o gato (botón escondido en la esquina de la
// pantalla de inicio). Se guarda aparte de las partidas: vale para todas.
// Colores de cada parte en [claro, oscuro]; drawPlayer (ayudas-dibujo.js) dibuja
// la cola, orejas y cara según `skin`.
const SKINS = {
  mapache: { name: 'Mapache', body: ['#aaa49a', '#4e4944'], tuft: '#6a655e', belly: ['#ece6da', '#b4ad9f'],
    head: ['#b8b2a8', '#5e5953'], foot: ['#4a4440', '#141210'], toe: '#2a2624', arm: ['#9a948a', '#4e4944'], hand: '#1e1a18' },
  perro: { name: 'Perro', body: ['#c8925a', '#6a4220'], tuft: '#8a5a30', belly: ['#f4e4c8', '#c8a878'],
    head: ['#d6a068', '#7a4a24'], foot: ['#f0e0c4', '#a88a64'], toe: '#8a6a48', arm: ['#c8925a', '#6a4220'], hand: '#f0e0c4' },
  // gato tuxedo: negro con pechera, patitas y hocico blancos; lleva espada
  gato: { name: 'Gato', body: ['#44444c', '#0e0e12'], tuft: '#1c1c22', belly: ['#ffffff', '#c4c4cc'],
    head: ['#46464e', '#101014'], foot: ['#ffffff', '#b8b8c0'], toe: '#f0a0b0', arm: ['#3c3c44', '#0e0e12'], hand: '#f4f4f8' },
};
const SKIN_ORDER = ['mapache', 'perro', 'gato'];
let skin = 'mapache';
try { const s = localStorage.getItem('mapachon-skin'); if (SKINS[s]) skin = s; } catch (e) {}
function setSkin(s) { skin = s; try { localStorage.setItem('mapachon-skin', s); } catch (e) {} }

// Dibuja al personaje con una skin en (x, y) de la pantalla, quieto y mirando a
// la derecha (para elegir skin en la pantalla de inicio)
function drawSkinPreview(name, x, y, sc) {
  const keep = { x: player.x, y: player.y, vx: player.vx, vy: player.vy, facing: player.facing,
    onGround: player.onGround, attackActive: player.attackActive, invFrames: player.invFrames };
  const was = [skin, godMode, healing, healPop];
  skin = name; godMode = false; healing = false; healPop = 0;
  Object.assign(player, { x: 0, y: 0, vx: 0, vy: 0, facing: 1, onGround: true, attackActive: 0, invFrames: 0 });
  ctx.save();
  ctx.translate(x, y); ctx.scale(sc, sc); ctx.translate(-player.w / 2, -player.h / 2);
  drawPlayer();
  ctx.restore();
  Object.assign(player, keep);
  [skin, godMode, healing, healPop] = was;
}
