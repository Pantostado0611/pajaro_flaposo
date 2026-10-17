// ─── LOOP PRINCIPAL ───────────────────────────────────────────────────────────
const STEP_MS = 1000 / 60;
let lastTime = 0, stepAcc = 0;
function frame(ts) {
  requestAnimationFrame(frame);
  if (!lastTime) lastTime = ts;
  stepAcc = Math.min(stepAcc + (ts - lastTime), 100);
  lastTime = ts;
  // margen de 2 ms para no saltarse fotogramas en pantallas de 60 Hz
  for (let n = 0; n < 3 && stepAcc >= STEP_MS - 2; n++) {
    stepAcc -= STEP_MS;
    step();
  }
}

function step() {
  Music.update();
  ctx.setTransform(renderScale, 0, 0, renderScale, 0, 0);
  ctx.imageSmoothingQuality = 'high';
  if (shakeTimer > 0) {
    shakeTimer--;
    const m = shakeMag * Math.min(1, shakeTimer / 10);
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    ctx.translate((Math.random() - 0.5) * 2 * m, (Math.random() - 0.5) * 2 * m);
    if (!shakeTimer) shakeMag = 0;
  }
  if (titleState) { drawTitle(); return; } // pantalla de inicio: elegir partida
  if (!transitioning && cheatState === 'closed' && chapterTimer <= 0 && !pauseState) {
    playFrames++;
    updatePlayer();
    updateEnemies();
    checkEnemyCollisions();
    updateBoss();
    checkBossCollisions();
    updateBoss2();
    checkBoss2Collisions();
    updateBoss3();
    checkBoss3Collisions();
    updateGuards();
    checkGuardCollisions();
    updateGuardKeys();
    updateBreakables();
    updateChest();
    updateBench();
    updateKey();
    updatePlayerShots();
    updateShade();
    checkExits();
  }
  updateTransition();
  updateParticles(currentRoom);

  if (roomLabelTimer > 0 && chapterTimer <= 0) {
    roomLabelTimer--;
    if (roomLabelTimer < 60) roomLabelAlpha = roomLabelTimer / 60;
  }

  const room = ROOMS[currentRoom];
  camZ = room.zoom || 1;
  if (room.width) {
    const vw = W / camZ, vh = H / camZ; // lo que se ve, en medidas de la sala
    const tx = Math.max(0, Math.min(room.width - vw, player.x + player.w / 2 - vw / 2));
    const ty = Math.max(room.top || 0, Math.min(H - vh, player.y + player.h / 2 - vh * 0.55));
    if (camRoom !== currentRoom) { camX = tx; camY = ty; }
    else { camX += (tx - camX) * 0.14; camY += (ty - camY) * 0.1; }
  } else { camX = 0; camY = 0; }
  camRoom = currentRoom;
  drawBackground(room);
  drawParticles();
  ctx.save();
  ctx.scale(camZ, camZ);
  ctx.translate(-Math.round(camX), -Math.round(camY));
  drawDecorations(room);
  drawPlatforms(room);
  drawExitGlow(room);
  drawEnemies();
  drawBoss();
  drawBoss2();
  drawBoss3();
  drawChest();
  drawBench();
  drawNpc();
  drawKids();
  drawCastleDoor();
  drawGuards();
  drawGuardKeys();
  drawKey();
  drawShop();
  drawPlayerShots();
  drawShade();
  drawPlayer();
  drawTrashFx();
  ctx.restore();
  drawNightDark(room);
  if (currentRoom === 13) { ctx.save(); ctx.translate(-Math.round(camX), -Math.round(camY)); drawCastleDoorHint(); ctx.restore(); }
  drawNpcTalk();
  if (room.hatch) { ctx.save(); ctx.translate(-Math.round(camX), -Math.round(camY)); drawHatchHint(room.hatch); ctx.restore(); }
  drawVignette(room);
  drawCoordGrid(room);
  ctx.setTransform(renderScale, 0, 0, renderScale, 0, 0);
  drawRoomLabel();
  drawBossUI();
  drawBoss2UI();
  drawBoss3UI();
  drawGuardsUI();
  drawKeyGate();
  drawHUD();
  drawKeyHUD();
  drawInventory();
  drawCheat();
  drawTransition();
  drawChapter();
  drawPauseMenu();
}

// ─── RESPONSIVE ───────────────────────────────────────────────────────────────
let renderScale = 1; // píxeles reales por unidad del juego
function resize() {
  const scale = Math.min(window.innerWidth / W, window.innerHeight / H);
  const wrap = document.getElementById('game-wrap');
  wrap.style.transform = `scale(${scale})`;
  wrap.style.left = Math.round((window.innerWidth  - W * scale) / 2) + 'px';
  wrap.style.top  = Math.round((window.innerHeight - H * scale) / 2) + 'px';
  // El lienzo se dibuja a la resolución de la pantalla (nítido, sin pixelado)
  renderScale = Math.min(3, Math.max(1, scale * (window.devicePixelRatio || 1)));
  canvas.width  = Math.round(W * renderScale);
  canvas.height = Math.round(H * renderScale);
}
window.addEventListener('resize', resize);
resize();

// ─── INICIO ───────────────────────────────────────────────────────────────────
resetParticles(currentRoom);
initEnemies(currentRoom);
initBoss();
initBoss2();
roomLabelAlpha = 1;
roomLabelTimer = 200;
// primero se elige la partida (titulo.js): una vacía empieza de cero y una
// guardada sigue desde su último banco
refreshTitleSlots();
setTouchControls(false);
requestAnimationFrame(frame);
