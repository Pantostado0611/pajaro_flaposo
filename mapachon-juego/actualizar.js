// ─── ACTUALIZAR ───────────────────────────────────────────────────────────────
function updatePlayer() {
  // Movimiento horizontal
  if (left()) {
    player.vx = -MOVE_SPD;
    player.facing = -1;
  } else if (right()) {
    player.vx = MOVE_SPD;
    player.facing = 1;
  } else {
    player.vx *= FRICTION;
    if (Math.abs(player.vx) < 0.2) player.vx = 0;
  }

  // Coyote time
  if (player.onGround) {
    player.coyoteTime = COYOTE_MAX;
  } else if (player.coyoteTime > 0) {
    player.coyoteTime--;
  }

  // Saltar (y doble salto en el aire si ya venciste al Coloso)
  if (player.onGround) player.usedDouble = false;
  if (player.jumpBuffered && player.coyoteTime > 0) {
    player.vy = JUMP_V;
    player.coyoteTime = 0;
    player.jumpBuffered = false;
  } else if (player.jumpBuffered && (boss3Defeated || richMode) && !player.usedDouble) {
    player.vy = JUMP_V * 0.92;
    player.usedDouble = true;
    jumpPuffs.push({ x: player.x + player.w / 2, y: player.y + player.h, t: 22 });
  }
  player.jumpBuffered = false;

  // Gravedad variable (soltar el botón = caída más rápida)
  const grav = GRAVITY * (ROOMS[currentRoom].gravity || 1);
  if (player.vy < 0 && !jumpHeld()) {
    player.vy += grav * 1.6;
  } else {
    player.vy += grav;
  }
  const maxFall = MAX_FALL * (ROOMS[currentRoom].gravity || 1);
  if (player.vy > maxFall) player.vy = maxFall;

  if (player.attackTimer  > 0) player.attackTimer--;
  if (player.attackActive > 0) player.attackActive--;
  if (player.invFrames    > 0) player.invFrames--;
  if (player.knockbackTimer > 0) { player.knockbackTimer--; }

  // Ya no hay regeneración: te curas comiendo basura (basura.js)
  updateHeal();

  resolveCollisions();
  {
    const ex = ROOMS[currentRoom].exits || {}, rw = ROOMS[currentRoom].width || W;
    if (!ex.left && player.x < 0) { player.x = 0; player.vx = 0; }
    if (!ex.right && player.x + player.w > rw) { player.x = rw - player.w; player.vx = 0; }
  }
  const top = ROOMS[currentRoom].top;
  if (top !== undefined && player.y < top) { player.y = top; if (player.vy < 0) player.vy = 0; }

  // Bob (animación de caminar)
  if (player.onGround && Math.abs(player.vx) > 0.5) {
    player.bobTimer += 0.25;
  } else {
    player.bobTimer *= 0.8;
  }
}

let hatchTimer = 0;
const SPIKE_Y = 466;   // a esta altura los pies tocan las púas del foso
let safeSpot = null;  // último sitio firme pisado (para volver tras las púas)
function checkExits() {
  const exits = ROOMS[currentRoom].exits;
  if (!exits) return;

  // Trampilla: ↓ encima, o quedarse quieto encima un momento (táctil)
  const hatch = ROOMS[currentRoom].hatch;
  if (hatch) {
    const on = player.onGround && Math.abs(player.y + player.h - hatch.y) < 4 &&
      Math.abs(player.x + player.w / 2 - (hatch.x + hatch.w / 2)) < hatch.w / 2;
    hatchTimer = on && Math.abs(player.vx) < 0.5 ? hatchTimer + 1 : 0;
    if (on && (down() || hatchTimer >= 45)) { hatchTimer = 0; startTransition(hatch.room, 460, 40); return; }
  }

  if (currentRoom === 13 && !castleDoorOpen && keysHeld.blue && keysHeld.red &&
      player.x + player.w >= CASTLE_DOOR.x + 30) {
    castleDoorOpen = true; shake(14, 3);
    moneyPops.push({ x: CASTLE_DOOR.x, y: CASTLE_DOOR.y - 20, text: '¡Puerta abierta!', t: 90, color: '#c8d4ff' });
  }
  if (exits.right && player.x + player.w >= (ROOMS[currentRoom].width || W)) {
    if (currentRoom === 13 && !castleDoorOpen) return;
    if (currentRoom === 3 && !boss2Defeated) return; // castillo cerrado
    const e = exits.right;
    startTransition(e.room, e.spawnX, e.spawnY);
  }
  if (exits.left && player.x <= 0) {
    if (currentRoom === 4 && !bossDefeated) return; // puerta bloqueada
    const e = exits.left;
    startTransition(e.room, e.spawnX, e.spawnY);
  }
  if (exits.up && player.y <= (ROOMS[currentRoom].top || 0)) {
    if (currentRoom === 1 && !hasKey && !keyUsed) return; // puerta con llave
    if (currentRoom === 1 && hasKey) { hasKey = false; keyUsed = true; }
    if (currentRoom === 3 && !boss2Defeated) return; // armería cerrada
    if (currentRoom === 4 && !bossDefeated) return;  // escalera secreta
    if (currentRoom === 13 && !guardsDefeated) return; // guardias vivos
    const e = exits.up;
    startTransition(e.room, e.spawnX, e.spawnY);
  }
  if (exits.down && player.y + player.h >= H + 30) {
    if (currentRoom === 3 && !boss2Defeated) return; // debes matar al guardián
    const e = exits.down;
    startTransition(e.room, e.spawnX, e.spawnY);
  }

  // Púas del suelo: quitan un corazón y te devuelven al último sitio firme
  const R = ROOMS[currentRoom];
  const overPit = x => R.spikes && R.spikes.some(([a, b]) => x > a && x < b);
  if (player.onGround && !overPit(player.x + player.w / 2)) safeSpot = { room: currentRoom, x: player.x, y: player.y };
  if (R.spikes && !player.onGround && player.y + player.h >= SPIKE_Y &&   // parado en la orilla no pica
      R.spikes.some(([a, b]) => player.x + player.w > a + 4 && player.x < b - 4)) {
    if (!godMode && player.invFrames === 0) player.hp--;
    if (player.hp <= 0) { player.hp = 0; isDeath = true; respawnAtBench(); return; }
    const s = safeSpot && safeSpot.room === currentRoom ? safeSpot : { x: 30, y: 400 };
    player.x = s.x; player.y = s.y; player.vx = 0; player.vy = 0;
    player.invFrames = Math.max(player.invFrames, 60); shake(10, 3);
  }

  // Muerte: caer fuera del mapa
  if (player.y > H + 100) {
    if (godMode) { player.y = 400; player.vy = -5; }
    else { isDeath = true; respawnAtBench(); }
  }
}

function updateTransition() {
  if (!transitioning) return;

  if (transPhase === 'fade-out') {
    transAlpha += 0.055;
    if (transAlpha >= 1) {
      transAlpha = 1;
      transPhase = 'black';
      transBlackFrames = 18;
      if (isDeath) spawnShade();
      // Cambiar sala ahora
      currentRoom = pendingRoom;
      visitedRooms.add(currentRoom); visitedRooms.add(zoneOf(currentRoom));
      player.x = pendingPos.x;
      player.y = pendingPos.y;
      player.vx = 0;
      player.vy = 0;
      resetParticles(currentRoom);
      initEnemies(currentRoom);
      if (pendingRoom === 4 && !bossDefeated) initBoss();
      if (pendingRoom === 3 && !boss2Defeated) initBoss2();
      if (pendingRoom === 12 && !boss3Defeated) initBoss3();
      if (pendingRoom === 13 && !guardsDefeated) initGuards();
      playerShots.length = 0;
      if (pendingRoom === 7 && !chapterShown) { chapterShown = true; showChapter(2, 'La Ruptura'); }
      if (pendingRoom === 38 && !chapter3Shown) { chapter3Shown = true; showChapter(3, 'El Castillo de las Ruinas'); }
      if (isDeath) {
        // Se conserva el progreso: jefes vencidos, llave, puerta abierta y armas compradas.
        // Los jefes no vencidos se reinician al volver a entrar en su sala.
        player.hp = player.maxHp; player.invFrames = 0;
        trash = 0; // la basura del bote se pierde al morir
      }
      roomLabelAlpha = 1;
      roomLabelTimer = 200;
    }
  } else if (transPhase === 'black') {
    transBlackFrames--;
    if (transBlackFrames <= 0) transPhase = 'fade-in';
  } else if (transPhase === 'fade-in') {
    transAlpha -= 0.04;
    if (transAlpha <= 0) {
      transAlpha = 0;
      transPhase = 'none';
      transitioning = false;
      isDeath = false;
    }
  }
}

// ─── ALMA ─────────────────────────────────────────────────────────────────────
function spawnShade() {
  if (money <= 0 || richMode) { shade = null; return; }
  // Si caíste al vacío, el alma aparece en el último suelo que pisaste
  let x = player.x, y = player.y - 10;
  if (player.y > H - 40 && lastGround && lastGround.room === currentRoom) {
    x = lastGround.x; y = lastGround.y - 10;
  }
  shade = {
    room: currentRoom, x, y, money, bob: 0,
  };
  money = 0; // la alma anterior (si había) se pierde
}

function updateShade() {
  if (!shade || shade.room !== currentRoom) return;
  shade.bob += 0.05;
  const sx = shade.x - 4, sy = shade.y + Math.sin(shade.bob) * 6, sw = 36, sh = 44;
  const atkW = 52, atkH = 30;
  const atkX = player.facing === 1 ? player.x + player.w : player.x - atkW;
  const hit = (player.attackActive > 0 && collideRect(atkX, player.y + 6, atkW, atkH, sx, sy, sw, sh)) ||
              collideRect(player.x, player.y, player.w, player.h, sx, sy, sw, sh);
  if (!hit) return;
  addMoney(shade.money, sx + sw / 2, sy);
  shade = null;
}

function drawShade() {
  if (!shade || shade.room !== currentRoom) return;
  const t = Date.now() * 0.004;
  const cx = shade.x + 14, cy = shade.y + 20 + Math.sin(shade.bob) * 6;

  // Aura
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 46);
  g.addColorStop(0, 'rgba(120,80,200,0.35)');
  g.addColorStop(1, 'transparent');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, 46, 0, Math.PI * 2); ctx.fill();

  // Cuerpo con cola ondulante
  ctx.fillStyle = 'rgba(10,6,20,0.92)';
  ctx.beginPath();
  ctx.arc(cx, cy - 4, 16, Math.PI, 0);
  ctx.lineTo(cx + 16, cy + 14);
  for (let i = 0; i <= 4; i++) {
    const wx = cx + 16 - i * 8;
    ctx.lineTo(wx, cy + 14 + (i % 2 ? 6 : 0) + Math.sin(t * 2 + i) * 3);
  }
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(180,140,255,0.5)'; ctx.lineWidth = 1.5; ctx.stroke();

  // Orejas de mapache
  ctx.fillStyle = 'rgba(10,6,20,0.92)';
  ctx.beginPath(); ctx.arc(cx - 11, cy - 17, 6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + 11, cy - 17, 6, 0, Math.PI * 2); ctx.fill();

  // Ojos
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.ellipse(cx - 6, cy - 4, 4, 5.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + 6, cy - 4, 4, 5.5, 0, 0, Math.PI * 2); ctx.fill();

  // Lo que guarda
  ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd040';
  ctx.fillText('💰 ' + shade.money, cx, cy - 30);
}
