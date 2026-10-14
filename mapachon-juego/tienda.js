// ─── ARMERÍA (TIENDA) ─────────────────────────────────────────────────────────
// Corta distancia en los escalones, larga distancia en el suelo
const SHOP_ITEMS = [
  { icon:1, type:'melee',  name:'Hacha',      damage:2, price:35, color:'#ff8840', col2:'#cc3300', x:155, y:356 },
  { icon:2, type:'melee',  name:'Lanza',      damage:3, price:45, color:'#44ff88', col2:'#008844', x:480, y:356 },
  { icon:4, type:'melee',  name:'Espada',     damage:5, price:75, color:'#ffe060', col2:'#aa8800', x:805, y:356 },
  { icon:5, type:'ranged', name:'Tirachinas', damage:1, price:30, color:'#d0d0d0', col2:'#7a4a28', x:317, y:446, speed:9,  cooldown:28 },
  { icon:6, type:'ranged', name:'Arco',       damage:2, price:40, color:'#a0ff60', col2:'#7a4a28', x:642, y:446, speed:12, cooldown:24 },
  { icon:3, type:'ranged', name:'Cañón+',     damage:4, price:65, color:'#ff44ff', col2:'#aa00cc', x:900, y:446, speed:8,  cooldown:40 },
];
const ownedItems = new Set();

function shopItemUnderPlayer() {
  if (currentRoom !== 5) return null;
  return SHOP_ITEMS.find(it =>
    collideRect(player.x, player.y, player.w, player.h, it.x - 26, it.y - 30, 52, 60)) || null;
}

function isEquipped(it) {
  return it.type === 'melee' ? weaponName === it.name : (ranged !== null && ranged.name === it.name);
}

function equipItem(it) {
  if (it.type === 'melee') {
    playerDmg = it.damage; weaponName = it.name; weaponColor = it.color;
  } else {
    ranged = { name: it.name, color: it.color, damage: it.damage, speed: it.speed, cooldown: it.cooldown };
  }
}

// Devuelve true si el botón de ataque se usó para comprar/equipar
function tryBuy() {
  const it = shopItemUnderPlayer();
  if (!it) return false;
  if (!ownedItems.has(it.name)) {
    if (money < it.price) {
      moneyPops.push({ x: it.x, y: it.y - 40, text: 'Faltan ' + (it.price - money), t: 60, color: '#ff5566' });
      return true;
    }
    money -= it.price;
    ownedItems.add(it.name);
    moneyPops.push({ x: it.x, y: it.y - 40, text: '-' + it.price, t: 60 });
  }
  equipItem(it);
  return true;
}

function tryAttack() {
  if (tryBuy()) return;
  if (player.attackTimer === 0) {
    player.attackTimer  = 26;
    player.attackActive = 9;
  }
}

function tryShoot() {
  if (!ranged || rangedTimer > 0) return;
  rangedTimer = ranged.cooldown;
  playerShots.push({
    x: player.x + player.w / 2 + player.facing * 16, y: player.y + 16,
    vx: player.facing * ranged.speed, dmg: ranged.damage, color: ranged.color,
    r: ranged.damage >= 4 ? 8 : 5, life: 80,
  });
}

function updatePlayerShots() {
  if (rangedTimer > 0) rangedTimer--;
  for (let i = playerShots.length - 1; i >= 0; i--) {
    const s = playerShots[i];
    s.x += s.vx; s.life--;
    const sx = s.x - s.r, sy = s.y - s.r, sd = s.r * 2;
    let hit = false;

    for (const e of currentEnemies) {
      if (e.dead || !collideRect(sx, sy, sd, sd, e.x, e.y, e.w, e.h)) continue;
      e.dead = true; e.deathTimer = 22;
      addMoney(MONEY_ENEMY, e.x + e.w / 2, e.y);
      hit = true; break;
    }
    if (!hit && currentRoom === 3) {
      const bi = boss2.projectiles.findIndex(b => b.type === 'bat' &&
        collideRect(sx, sy, sd, sd, b.x - b.r, b.y - b.r, b.r * 2, b.r * 2));
      if (bi >= 0) { boss2.projectiles.splice(bi, 1); hit = true; }
    }
    if (!hit && currentRoom === 4 && !boss.dead &&
        collideRect(sx, sy, sd, sd, boss.x, boss.y, boss.w, boss.h)) {
      hit = true;
      if (boss.invFrames === 0 && boss.state !== 'roar') {
        boss.hp -= s.dmg; boss.invFrames = 12;
        if (boss.hp <= 0) { boss.hp = 0; boss.dead = true; boss.deathTimer = 130; boss.projectiles = []; }
      }
    }
    if (!hit && currentRoom === 3 && !boss2.dead &&
        collideRect(sx, sy, sd, sd, boss2.x, boss2.y, boss2.w, boss2.h)) {
      hit = true;
      if (boss2.invFrames === 0 && boss2.state !== 'shriek' && boss2.alpha > 0.5) {
        boss2.hp -= s.dmg; boss2.invFrames = 12;
        if (boss2.hp <= 0) { boss2.hp = 0; boss2.dead = true; boss2.deathTimer = 150; boss2.projectiles = []; }
      }
    }
    if (!hit && currentRoom === 12 && !boss3.dead &&
        collideRect(sx, sy, sd, sd, boss3.x, boss3.y, boss3.w, boss3.h)) {
      hit = true;
      if (boss3.invFrames === 0 && boss3.state !== 'roar') boss3Hit(s.dmg, 12);
    }
    if (!hit && currentRoom === 13) hit = guardShot(sx, sy, sd, s);
    if (!hit) for (const p of ROOMS[currentRoom].platforms)
      if (p.breakable && !brokenWalls.has(p.breakable) && collideRect(sx, sy, sd, sd, p.x, p.y, p.w, p.h)) { hitWall(p); hit = true; break; }
    if (hit || s.life <= 0 || s.x < -20 || s.x > (ROOMS[currentRoom].width || W) + 20) playerShots.splice(i, 1);
  }
}

function drawPlayerShots() {
  for (const s of playerShots) {
    // estela
    const tail = s.x - s.vx * 4;
    const tg = ctx.createLinearGradient(tail, 0, s.x, 0);
    tg.addColorStop(0, hexAlpha(s.color, 0)); tg.addColorStop(1, hexAlpha(s.color, 0.6));
    ctx.strokeStyle = tg; ctx.lineWidth = s.r * 1.4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(tail, s.y); ctx.lineTo(s.x, s.y); ctx.stroke();
    // halo y núcleo
    const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 2.5);
    g.addColorStop(0, hexAlpha(s.color, 0.55));
    g.addColorStop(1, hexAlpha(s.color, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = vol(s.x, s.y, s.r, '#ffffff', s.color);
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
  }
}

function drawWeaponIcon(id, c1, c2) {
  // metal con brillo arriba y el color oscuro abajo
  const metal = ctx.createLinearGradient(0, -26, 0, 24);
  metal.addColorStop(0, '#ffffff'); metal.addColorStop(0.3, c1); metal.addColorStop(1, c2);
  ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 4; ctx.shadowOffsetY = 2;
  if (id === 1) {
    ctx.fillStyle='#7a4a28'; ctx.fillRect(-3,4,6,20);
    ctx.fillStyle=metal;
    ctx.beginPath(); ctx.moveTo(-20,-8); ctx.lineTo(2,-16); ctx.lineTo(2,6); ctx.lineTo(-16,6); ctx.closePath(); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.4)';
    ctx.beginPath(); ctx.moveTo(-14,-4); ctx.lineTo(-4,-10); ctx.lineTo(-4,0); ctx.closePath(); ctx.fill();
  } else if (id === 2) {
    ctx.strokeStyle='#7a4a28'; ctx.lineWidth=4; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(0,22); ctx.lineTo(0,-12); ctx.stroke();
    ctx.fillStyle=metal;
    ctx.beginPath(); ctx.moveTo(0,-26); ctx.lineTo(-10,-8); ctx.lineTo(10,-8); ctx.closePath(); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.45)';
    ctx.beginPath(); ctx.moveTo(0,-26); ctx.lineTo(-4,-12); ctx.lineTo(0,-12); ctx.closePath(); ctx.fill();
  } else if (id === 3) {
    ctx.fillStyle=c2;
    ctx.beginPath(); ctx.ellipse(0,4,18,12,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=metal;
    ctx.beginPath(); ctx.ellipse(0,2,18,12,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=c2; ctx.fillRect(12,-4,14,8);
    ctx.fillStyle='rgba(255,255,255,0.28)'; ctx.fillRect(13,-3,12,3);
    const now=Date.now()*0.003;
    for (let i=0;i<5;i++) {
      const a=now+i*Math.PI*0.4, r=21+Math.sin(now*1.3+i)*3;
      ctx.globalAlpha=0.75;
      ctx.fillStyle=i%2===0?c1:'#fff';
      ctx.beginPath(); ctx.arc(Math.cos(a)*r,Math.sin(a)*r,2,0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha=1;
  } else if (id === 4) { // espada
    ctx.fillStyle='#7a4a28'; ctx.fillRect(-3,10,6,14);
    ctx.fillStyle=c2; ctx.fillRect(-11,6,22,5);
    ctx.fillStyle=metal;
    ctx.beginPath(); ctx.moveTo(-4,6); ctx.lineTo(-4,-18); ctx.lineTo(0,-26); ctx.lineTo(4,-18); ctx.lineTo(4,6); ctx.closePath(); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.fillRect(-1,-18,2,22);
  } else if (id === 5) { // tirachinas
    ctx.strokeStyle=c2; ctx.lineWidth=4; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(0,22); ctx.lineTo(0,2); ctx.lineTo(-10,-14); ctx.moveTo(0,2); ctx.lineTo(10,-14); ctx.stroke();
    ctx.strokeStyle=c1; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(-10,-14); ctx.lineTo(0,-4); ctx.lineTo(10,-14); ctx.stroke();
    ctx.fillStyle=metal; ctx.beginPath(); ctx.arc(0,-5,3,0,Math.PI*2); ctx.fill();
  } else if (id === 6) { // arco
    ctx.strokeStyle=c2; ctx.lineWidth=4; ctx.lineCap='round';
    ctx.beginPath(); ctx.arc(-6,0,22,-Math.PI*0.4,Math.PI*0.4); ctx.stroke();
    const ex=-6+22*Math.cos(Math.PI*0.4), ey=22*Math.sin(Math.PI*0.4);
    ctx.strokeStyle='rgba(255,255,255,0.7)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(ex,-ey); ctx.lineTo(ex,ey); ctx.stroke();
    ctx.strokeStyle=c1; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(ex-4,0); ctx.lineTo(22,0); ctx.stroke();
    ctx.fillStyle=metal; ctx.beginPath(); ctx.moveTo(26,0); ctx.lineTo(19,-4); ctx.lineTo(19,4); ctx.closePath(); ctx.fill();
  }
  ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
}

function drawShop() {
  if (currentRoom !== 5) return;
  const under = shopItemUnderPlayer();
  for (const it of SHOP_ITEMS) {
    const iy = it.y + Math.sin(Date.now() * 0.003 + it.x) * 6;
    const owned = ownedItems.has(it.name), equipped = isEquipped(it);

    const g = ctx.createRadialGradient(it.x,iy,0,it.x,iy,36);
    g.addColorStop(0, hexAlpha(it.color, equipped ? 0.5 : 0.3));
    g.addColorStop(1, 'transparent');
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(it.x,iy,36,0,Math.PI*2); ctx.fill();

    ctx.save();
    ctx.translate(it.x, iy);
    if (!owned) ctx.globalAlpha = 0.75;
    drawWeaponIcon(it.icon, it.color, it.col2);
    ctx.restore();

    ctx.textAlign='center';
    ctx.fillStyle='rgba(255,255,255,0.7)'; ctx.font='9px monospace';
    ctx.fillText((it.type === 'melee' ? '⚔ ' : '🏹 ') + it.name + '  x' + it.damage, it.x, iy - 34);
    ctx.font='bold 11px monospace';
    if (equipped)   { ctx.fillStyle='#40ff90'; ctx.fillText('EQUIPADO', it.x, iy + 42); }
    else if (owned) { ctx.fillStyle='#d0b0ff'; ctx.fillText('COMPRADO', it.x, iy + 42); }
    else            { ctx.fillStyle = money >= it.price ? '#ffd040' : '#aa6666'; ctx.fillText('💰 ' + it.price, it.x, iy + 42); }

    if (it === under && !equipped) {
      ctx.fillStyle='#fff'; ctx.font='bold 10px monospace';
      ctx.fillText(owned ? 'Z / ⚔  equipar' : 'Z / ⚔  comprar', it.x, iy - 48);
    }
  }
}
