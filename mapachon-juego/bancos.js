// ─── BANCOS (PUNTOS DE GUARDADO) ─────────────────────────────────────────────
// Sentarse (↓ junto al banco) cura, guarda la partida en el navegador y hace que
// al morir reaparezcas en ese banco. Los dañados funcionan igual, solo se ven rotos.
// El de La Cima cae del cielo cuando vences al Guardián.
const BENCHES = {
  1:  { x: 1300 },
  21: { x: 600 },
  3:  { x: 130, fromSky: true },
  5:  { x: 60 },
  7:  { x: 150 },
  9:  { x: 120 },
  11: { x: 120, damaged: true },
  38: { x: 120, damaged: true },
};
const BENCH_FLOOR = 480;
const SAVE_KEY = 'mapachon-save';
let lastBench = null;                // { room, x } donde reapareces al morir
let benchNear = false, benchDownHeld = false, benchRest = 0;
const skyBench = { y: null, vy: 0, landed: false };

// Banco de la sala actual (el del cielo solo existe tras vencer al Guardián)
function roomBench() {
  const b = BENCHES[currentRoom];
  if (!b || (b.fromSky && !boss2Defeated)) return null;
  return b;
}

function updateBench() {
  if (boss2Defeated && currentRoom !== 3) skyBench.landed = true; // si saliste mientras caía
  const b = roomBench();
  benchNear = false;
  if (benchRest > 0) benchRest--;
  if (!b) return;
  if (b.fromSky && !skyBench.landed) {
    if (skyBench.y === null) { skyBench.y = -160; skyBench.vy = 0; }
    skyBench.vy = Math.min(skyBench.vy + 0.45, 16);
    skyBench.y += skyBench.vy;
    if (skyBench.y >= BENCH_FLOOR) {
      skyBench.y = BENCH_FLOOR; skyBench.landed = true; shake(16, 5);
    }
    return;
  }
  benchNear = player.onGround && Math.abs(player.x + player.w / 2 - b.x) < 44;
  const d = down();
  if (benchNear && d && !benchDownHeld) sitOnBench(b);
  benchDownHeld = d;
}

function sitOnBench(b) {
  player.hp = player.maxHp;
  player.x = b.x - player.w / 2; player.vx = 0;
  lastBench = { room: currentRoom, x: b.x };
  benchRest = 100;
  saveGame();
  moneyPops.push({ x: b.x, y: BENCH_FLOOR - 70, text: 'Partida guardada', t: 100, color: '#9ad8ff' });
}

// Al morir: al último banco donde te sentaste (o a la Entrada si no hay)
function respawnAtBench() {
  if (lastBench) startTransition(lastBench.room, lastBench.x - player.w / 2, 400);
  else startTransition(0, 80, 400);
}

function drawBench() {
  const b = roomBench();
  if (!b) return;
  const y = b.fromSky && !skyBench.landed ? (skyBench.y ?? -160) : BENCH_FLOOR;
  const x = b.x, dmg = b.damaged;
  ctx.save();
  // brillo al descansar / en el banco donde reapareces
  if (benchRest > 0 || (lastBench && lastBench.room === currentRoom)) {
    const a = benchRest > 0 ? 0.35 * benchRest / 100 + 0.12 : 0.12;
    const g = ctx.createRadialGradient(x, y - 30, 0, x, y - 30, 90);
    g.addColorStop(0, `rgba(150,210,255,${a.toFixed(2)})`); g.addColorStop(1, 'rgba(150,210,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y - 30, 90, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(x, y + 1, 40, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.translate(x, y);
  if (dmg) ctx.rotate(0.035); // se ladea: tiene una pata rota
  const iron = '#3a3a48', ironHi = '#5a5a6c', wood = '#7a5638', woodDk = '#4a3220';
  // patas de hierro (la dañada, más corta y chueca)
  ctx.strokeStyle = iron; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-28, -22); ctx.quadraticCurveTo(-32, -10, -30, 0);
  if (dmg) { ctx.moveTo(28, -22); ctx.lineTo(31, -12); }
  else { ctx.moveTo(28, -22); ctx.quadraticCurveTo(32, -10, 30, 0); }
  ctx.moveTo(-28, -22); ctx.lineTo(-30, -48);
  ctx.moveTo(28, -22); ctx.lineTo(30, -48);
  ctx.stroke();
  if (dmg) { ctx.fillStyle = '#4a4a56'; ctx.fillRect(30, -5, 7, 5); } // trozo de pata en el suelo
  // asiento de tablas
  for (let i = 0; i < 2; i++) {
    const py = -24 + i * 5;
    ctx.fillStyle = wood; ctx.fillRect(-36, py, 72, 4);
    ctx.fillStyle = woodDk; ctx.fillRect(-36, py + 3, 72, 1);
  }
  // respaldo
  for (let i = 0; i < 3; i++) {
    const py = -46 + i * 7;
    if (dmg && i === 1) { // tabla rota: solo media, astillada
      ctx.fillStyle = wood; ctx.fillRect(-34, py, 30, 4);
      ctx.beginPath(); ctx.moveTo(-4, py); ctx.lineTo(2, py + 1); ctx.lineTo(-2, py + 2); ctx.lineTo(3, py + 4); ctx.lineTo(-4, py + 4); ctx.fill();
      continue;
    }
    ctx.fillStyle = wood; ctx.fillRect(-34, py, 68, 4);
    ctx.fillStyle = woodDk; ctx.fillRect(-34, py + 3, 68, 1);
  }
  // remates de hierro
  ctx.fillStyle = ironHi;
  ctx.beginPath(); ctx.arc(-30, -49, 3, 0, Math.PI * 2); ctx.arc(30, -49, 3, 0, Math.PI * 2); ctx.fill();
  if (dmg) {
    // grietas, óxido y musgo
    ctx.strokeStyle = 'rgba(20,10,0,0.7)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-10, -24); ctx.lineTo(-6, -21); ctx.lineTo(-9, -19);
    ctx.moveTo(12, -46); ctx.lineTo(16, -43); ctx.stroke();
    ctx.fillStyle = 'rgba(150,80,40,0.55)';
    ctx.beginPath(); ctx.arc(-29, -30, 2.5, 0, Math.PI * 2); ctx.arc(29, -40, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(90,130,60,0.75)';
    ctx.beginPath(); ctx.ellipse(-20, -25, 7, 2.2, 0, 0, Math.PI * 2); ctx.ellipse(22, -47, 5, 1.8, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  // aviso para sentarse
  if (benchNear && benchRest === 0) {
    ctx.save();
    ctx.globalAlpha = 0.6 + 0.3 * Math.sin(Date.now() * 0.006);
    ctx.fillStyle = '#e8f0ff'; ctx.font = 'bold 13px monospace'; ctx.textAlign = 'center';
    ctx.fillText('↓ descansar', x, y - 66);
    ctx.restore();
  }
}

// ─── GUARDAR / CARGAR ────────────────────────────────────────────────────────
function saveGame() {
  const data = {
    v: 1, bench: lastBench,
    money: richMode ? moneyBeforeRich : money, maxHp: player.maxHp,
    bossDefeated, boss2Defeated, boss3Defeated, guardsDefeated,
    hasKey, keyUsed, keyItem: { active: keyItem.active, x: keyItem.x, y: keyItem.y },
    keysHeld: { ...keysHeld }, guardKeys: guardKeys.map(k => ({ ...k })), castleDoorOpen,
    chapterShown, chapter3Shown,
    playerDmg, weaponName, weaponColor, ranged,
    owned: [...ownedItems], chests: [...openedChests], walls: [...brokenWalls], visited: [...visitedRooms],
    shade,
  };
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); } catch (e) {}
}

function loadGame() {
  let d = null;
  try { d = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) {}
  if (!d || d.v !== 1 || !d.bench || !ROOMS[d.bench.room]) return false;
  lastBench = d.bench;
  money = d.money || 0; player.maxHp = d.maxHp || player.maxHp; player.hp = player.maxHp;
  bossDefeated = !!d.bossDefeated; boss2Defeated = !!d.boss2Defeated;
  boss3Defeated = !!d.boss3Defeated; guardsDefeated = !!d.guardsDefeated;
  hasKey = !!d.hasKey; keyUsed = !!d.keyUsed; Object.assign(keyItem, d.keyItem || {});
  Object.assign(keysHeld, d.keysHeld || {}); guardKeys.length = 0; guardKeys.push(...(d.guardKeys || []));
  castleDoorOpen = !!d.castleDoorOpen; chapterShown = !!d.chapterShown; chapter3Shown = !!d.chapter3Shown;
  if (d.weaponName) { playerDmg = d.playerDmg; weaponName = d.weaponName; weaponColor = d.weaponColor; }
  ranged = d.ranged || null;
  for (const n of d.owned || []) ownedItems.add(n);
  for (const c of d.chests || []) { openedChests.add(c); chestAnim[c] = 999; }
  for (const w of d.walls || []) brokenWalls.add(w);
  for (const r of d.visited || []) visitedRooms.add(r);
  shade = d.shade || null;
  if (boss2Defeated) skyBench.landed = true;
  currentRoom = lastBench.room;
  player.x = lastBench.x - player.w / 2; player.y = 400;
  return true;
}

// Código 0000: borrar la partida guardada y empezar de cero
function deleteSave() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
  location.reload();
}
