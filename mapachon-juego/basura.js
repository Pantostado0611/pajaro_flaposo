// ─── BASURA: CURARSE COMIENDO (como el alma de Hollow Knight) ────────────────
// Ya no te curas solo. Cada golpe a un enemigo o jefe suelta basura que el
// mapache guarda en su bote (hasta 99). Con 33 de basura puedes curarte un
// corazón: mantén F (o V, o el botón 🗑) quieto en el suelo y el mapache se la
// come. Si te pegan mientras comes, se interrumpe y no gastas nada.
// Al morir se pierde la basura del bote. Los bancos siguen curando todo.
const TRASH_MAX = 99, TRASH_HEAL = 33, TRASH_HIT = 11, HEAL_TIME = 70;
let trash = 0;
let healing = false, healCharge = 0, healLastHp = 0;
const trashPops = [];   // basurita que salta del enemigo al pegarle
const healFx = [];      // migajas y "¡ñam!" al curarse
let trashFlash = 0;     // brillo del bote al ganar basura
let healPop = 0;        // saltito de gusto al tragar (cuadros)
let healJunk = 'lata';  // lo que se está comiendo

const TRASH_KINDS = ['lata', 'cascara', 'espina', 'bolsa', 'manzana'];
function healHeld() { return held('heal') || touch.heal; }

function gainTrash(x, y, amount = TRASH_HIT) {
  trash = Math.min(TRASH_MAX, trash + amount);
  trashFlash = 14;
  for (let i = 0; i < 2; i++) trashPops.push({
    room: currentRoom, x, y, vx: (Math.random() - 0.5) * 4, vy: -3 - Math.random() * 2.5,
    rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, kind: TRASH_KINDS[Math.floor(Math.random() * TRASH_KINDS.length)], t: 50,
  });
}

function updateHeal() {
  if (trashFlash > 0) trashFlash--;
  if (healPop > 0) healPop--;
  const can = healHeld() && player.onGround && trash >= TRASH_HEAL && player.hp < player.maxHp &&
    player.attackActive === 0 && player.knockbackTimer === 0;
  // si te pegan mientras comes, se corta
  if (healing && player.hp < healLastHp) { healing = false; healCharge = 0; }
  healLastHp = player.hp;
  if (!can) { healing = false; healCharge = 0; return; }
  if (!healing) healJunk = TRASH_KINDS[Math.floor(Math.random() * TRASH_KINDS.length)];
  healing = true;
  player.vx = 0; player.jumpBuffered = false;
  if (++healCharge % 9 === 0) healFx.push({ x: player.x + player.w / 2 + player.facing * 10 + (Math.random() - 0.5) * 8, y: player.y + 18, vx: (Math.random() - 0.5) * 2, vy: -1.5 - Math.random(), t: 26, crumb: true });
  if (healCharge >= HEAL_TIME) {
    trash -= TRASH_HEAL; player.hp++; healCharge = 0; healLastHp = player.hp; healPop = 22;
    healJunk = TRASH_KINDS[Math.floor(Math.random() * TRASH_KINDS.length)]; // si sigue comiendo, otra cosa
    healFx.push({ x: player.x + player.w / 2, y: player.y - 8, vx: 0, vy: -0.8, t: 50, text: '¡ñam!' });
    for (let i = 0; i < 10; i++) {
      const a = Math.random() * Math.PI * 2;
      healFx.push({ x: player.x + player.w / 2, y: player.y + 18, vx: Math.cos(a) * 2.5, vy: Math.sin(a) * 2.5 - 1, t: 30, spark: true });
    }
  }
}

// Una pieza de basura (centrada en 0,0)
function drawJunk(kind, s = 1) {
  ctx.save(); ctx.scale(s, s);
  if (kind === 'lata') {
    ctx.fillStyle = '#c03030'; ctx.fillRect(-3, -5, 6, 10);
    ctx.fillStyle = '#d8d8e0'; ctx.fillRect(-3, -5, 6, 1.5); ctx.fillRect(-3, 3.5, 6, 1.5);
  } else if (kind === 'cascara') {
    ctx.strokeStyle = '#f0d040'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, -4); ctx.quadraticCurveTo(-5, 0, -4, 5); ctx.moveTo(0, -4); ctx.quadraticCurveTo(5, 0, 4, 5); ctx.stroke();
    ctx.fillStyle = '#6a5020'; ctx.fillRect(-1, -6, 2, 2);
  } else if (kind === 'espina') {
    ctx.strokeStyle = '#e8e4d8'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(5, 0);
    for (let i = -3; i <= 3; i += 2) { ctx.moveTo(i, 0); ctx.lineTo(i - 1, -3); ctx.moveTo(i, 0); ctx.lineTo(i - 1, 3); }
    ctx.stroke();
    ctx.fillStyle = '#e8e4d8'; ctx.beginPath(); ctx.moveTo(5, 0); ctx.lineTo(8, -3); ctx.lineTo(8, 3); ctx.fill();
  } else if (kind === 'bolsa') {
    ctx.fillStyle = '#2a2a30'; ctx.beginPath(); ctx.ellipse(0, 1, 5, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(-1.5, -6, 3, 3);
  } else {
    ctx.fillStyle = '#9a6a30'; ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e8d8b0'; ctx.beginPath(); ctx.arc(1, 0, 2.2, 0, Math.PI * 2); ctx.fill(); // manzana mordida
  }
  ctx.restore();
}

// Basurita que salta, migajas y destellos (se dibuja con la cámara)
function drawTrashFx() {
  for (let i = trashPops.length - 1; i >= 0; i--) {
    const p = trashPops[i];
    if (p.room !== currentRoom || --p.t <= 0) { trashPops.splice(i, 1); continue; }
    p.x += p.vx; p.y += p.vy; p.vy += 0.25; p.rot += p.vr;
    ctx.save(); ctx.globalAlpha = Math.min(1, p.t / 15);
    ctx.translate(p.x, p.y); ctx.rotate(p.rot); drawJunk(p.kind, 1.2);
    ctx.restore();
  }
  // mientras come: un círculo que se llena (la basura la sostiene el mapache, ver drawPlayer)
  if (healing) {
    const cx = player.x + player.w / 2, k = healCharge / HEAL_TIME;
    ctx.save();
    ctx.strokeStyle = 'rgba(160,230,120,0.25)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(cx, player.y + player.h / 2, 30, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(190,255,140,0.85)';
    ctx.beginPath(); ctx.arc(cx, player.y + player.h / 2, 30, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  // al tragar: un anillo verde que se abre
  if (healPop > 0) {
    const k = 1 - healPop / 22;
    ctx.save();
    ctx.strokeStyle = `rgba(190,255,140,${(1 - k).toFixed(2)})`; ctx.lineWidth = 3 * (1 - k) + 1;
    ctx.beginPath(); ctx.arc(player.x + player.w / 2, player.y + player.h / 2, 30 + k * 30, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  for (let i = healFx.length - 1; i >= 0; i--) {
    const f = healFx[i];
    if (--f.t <= 0) { healFx.splice(i, 1); continue; }
    f.x += f.vx; f.y += f.vy; if (f.crumb) f.vy += 0.15;
    ctx.save(); ctx.globalAlpha = Math.min(1, f.t / 15);
    if (f.text) {
      ctx.fillStyle = '#c8ff90'; ctx.font = 'bold 13px monospace'; ctx.textAlign = 'center';
      ctx.fillText(f.text, f.x, f.y);
    } else if (f.spark) {
      ctx.fillStyle = '#d8ffb0'; ctx.beginPath(); ctx.arc(f.x, f.y, 2, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = '#8a6a3a'; ctx.fillRect(f.x, f.y, 2, 2);
    }
    ctx.restore();
  }
}

// El bote de basura del HUD, junto a los corazones: se llena de basura;
// cada raya es una curación. Late cuando ya alcanza para curarte.
function drawTrashHUD() {
  const x = 20 + player.maxHp * 28 + 4, y = 34, w = 22, h = 28;
  const ready = trash >= TRASH_HEAL && player.hp < player.maxHp;
  ctx.save();
  if (ready || trashFlash > 0) {
    const a = trashFlash > 0 ? trashFlash / 14 * 0.5 : 0.18 + 0.12 * Math.sin(Date.now() * 0.006);
    const g = ctx.createRadialGradient(x + w / 2, y + h / 2, 0, x + w / 2, y + h / 2, 26);
    g.addColorStop(0, `rgba(170,255,120,${a.toFixed(2)})`); g.addColorStop(1, 'rgba(170,255,120,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, 26, 0, Math.PI * 2); ctx.fill();
  }
  // bote (un poco más ancho arriba)
  const body = () => { ctx.beginPath(); ctx.moveTo(x, y + 4); ctx.lineTo(x + w, y + 4); ctx.lineTo(x + w - 3, y + h); ctx.lineTo(x + 3, y + h); ctx.closePath(); };
  body(); ctx.fillStyle = '#1a1e24'; ctx.fill();
  // basura adentro
  const lvl = trash / TRASH_MAX, fh = (h - 5) * lvl;
  if (fh > 0) {
    ctx.save(); body(); ctx.clip();
    const g = ctx.createLinearGradient(0, y + h - fh, 0, y + h);
    g.addColorStop(0, '#9acc50'); g.addColorStop(1, '#4a6a28');
    ctx.fillStyle = g; ctx.fillRect(x, y + h - fh, w, fh);
    // pedacitos de colores en la basura
    const bits = ['#c03030', '#f0d040', '#e8e4d8', '#9a6a30'];
    for (let i = 0; i < Math.floor(trash / 9); i++) {
      ctx.fillStyle = bits[i % 4];
      ctx.fillRect(x + 3 + (i * 7) % (w - 7), y + h - 3 - ((i * 5) % Math.max(1, fh - 3)), 3, 2);
    }
    ctx.restore();
  }
  // rayas del bote y marcas de cada curación
  ctx.strokeStyle = '#5a6470'; ctx.lineWidth = 1.5;
  body(); ctx.stroke();
  ctx.strokeStyle = 'rgba(90,100,112,0.6)'; ctx.lineWidth = 1;
  for (let i = 1; i < 3; i++) {
    const ly = y + h - (h - 5) * (i * TRASH_HEAL / TRASH_MAX);
    ctx.beginPath(); ctx.moveTo(x + 1, ly); ctx.lineTo(x + w - 1, ly); ctx.stroke();
  }
  // tapa (se levanta cuando ya alcanza)
  ctx.save(); ctx.translate(x + w / 2, y + 3);
  if (ready) ctx.rotate(-0.25 + Math.sin(Date.now() * 0.006) * 0.08);
  ctx.fillStyle = '#6a7480'; ctx.fillRect(-w / 2 - 2, -3, w + 4, 4);
  ctx.fillRect(-3, -6, 6, 3);
  ctx.restore();
  ctx.restore();
}
