// ─── PERSONAJES QUE DAN PISTAS ───────────────────────────────────────────────
// Viajeros encapuchados con farol. Al acercarte te dicen qué hacer; lo que
// dicen cambia según lo que ya hiciste (por eso cada texto es una función).
const NPCS = {
  21: { x: 1250, y: 480, say: () =>
    keyUsed ? 'La reja de los Cristales ya está abierta. Sigue tu camino.' :
    hasKey ? 'Con la llave del Rey abre la reja del techo en la Sala de los Cristales. Queda de regreso, por donde viniste.' :
    bossDefeated ? 'El Rey cayó... pero su llave dorada sigue en la sala del trono. ¡Ve por ella!' :
    'Más adelante está el Último Rey. Guarda la llave dorada que abre la reja de los Cristales.' },
  1: { x: 1620, y: 480, say: () =>
    keyUsed ? 'La reja ya está abierta. Arriba sigue el camino a la Cima.' :
    hasKey ? '¡Traes la llave del Rey! Sube por los escalones hasta la reja y presiona ↑.' :
    'Esa reja del techo tiene candado. La llave la tiene el Rey, más adelante.' },
  37: { x: 110, y: 480, say: () =>
    castleDoorOpen ? 'La puerta del castillo ya está abierta.' :
    guardsDefeated ? 'Recoge las llaves que soltaron los guardias y toca la puerta de la derecha.' :
    'Abajo hay dos guardias. Uno lleva la llave azul y el otro la roja: con las dos se abre la puerta del castillo.' },
  11: { x: 470, y: 420, say: () => 'En la cima hay una trampilla. Párate encima y presiona ↓ para bajar.' },
};
const npcFade = {}; // qué tan visible está el globo de cada uno

function npcNear(n) {
  return Math.abs(player.x + player.w / 2 - n.x) < 150 && Math.abs(player.y + player.h - n.y) < 140;
}

// El viajero, parado en el suelo (se dibuja con la cámara)
function drawNpc() {
  const n = NPCS[currentRoom];
  if (!n) return;
  const t = Date.now() * 0.002, bob = Math.sin(t) * 1.5;
  const face = player.x + player.w / 2 < n.x ? -1 : 1;
  ctx.save();
  ctx.translate(n.x, n.y);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(0, 1, 16, 3.5, 0, 0, Math.PI * 2); ctx.fill();
  // luz del farol
  const lx = face * 17, ly = -22 + bob;
  const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, 60);
  g.addColorStop(0, 'rgba(255,190,90,0.35)'); g.addColorStop(1, 'rgba(255,190,90,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(lx, ly, 60, 0, Math.PI * 2); ctx.fill();
  ctx.scale(face, 1);
  // capa
  const cloak = ctx.createLinearGradient(0, -46, 0, 0);
  cloak.addColorStop(0, '#5a4a6e'); cloak.addColorStop(1, '#2e2640');
  ctx.fillStyle = cloak;
  ctx.beginPath();
  ctx.moveTo(-5, -44 + bob);
  ctx.quadraticCurveTo(-15, -30, -15, 0);
  ctx.lineTo(13, 0);
  ctx.quadraticCurveTo(13, -30, 6, -44 + bob);
  ctx.closePath(); ctx.fill();
  // borde rasgado de la capa
  ctx.fillStyle = '#2e2640';
  for (let i = -14; i < 12; i += 6) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + 3, 3); ctx.lineTo(i + 6, 0); ctx.fill(); }
  // capucha
  ctx.fillStyle = '#6a5a80';
  ctx.beginPath(); ctx.ellipse(1, -40 + bob, 11, 12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-6, -50 + bob); ctx.quadraticCurveTo(-12, -60 + bob, -16, -56 + bob); ctx.quadraticCurveTo(-10, -50 + bob, -9, -44 + bob); ctx.fill();
  // cara en sombra con ojos que brillan
  ctx.fillStyle = '#120e1a';
  ctx.beginPath(); ctx.ellipse(4, -38 + bob, 7, 8, 0, 0, Math.PI * 2); ctx.fill();
  const blink = (Math.floor(Date.now() / 130) % 30) === 0;
  ctx.fillStyle = '#ffe6a0';
  if (blink) { ctx.fillRect(1, -38 + bob, 3, 1); ctx.fillRect(6, -38 + bob, 3, 1); }
  else {
    ctx.beginPath(); ctx.arc(2.5, -38 + bob, 1.6, 0, Math.PI * 2); ctx.arc(7.5, -38 + bob, 1.6, 0, Math.PI * 2); ctx.fill();
  }
  // brazo con el farol
  ctx.strokeStyle = '#3a3050'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(6, -28); ctx.lineTo(15, -30 + bob); ctx.stroke();
  ctx.strokeStyle = '#8a7a60'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(17, -30 + bob); ctx.lineTo(17, -27 + bob); ctx.stroke();
  ctx.fillStyle = '#4a3a28'; ctx.fillRect(13, -27 + bob, 8, 2); ctx.fillRect(13, -17 + bob, 8, 2);
  ctx.fillStyle = `rgba(255,${200 + Math.round(Math.sin(t * 3) * 20)},110,0.95)`;
  ctx.fillRect(14, -25 + bob, 6, 8);
  // bastón
  ctx.strokeStyle = '#6a4a2a'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(-8, -50 + bob); ctx.stroke();
  ctx.restore();
}

// Globo con lo que dice, encima de todo (también de la oscuridad del pico)
function drawNpcTalk() {
  const n = NPCS[currentRoom];
  if (!n) return;
  const f = npcFade[currentRoom] = Math.max(0, Math.min(1, (npcFade[currentRoom] || 0) + (npcNear(n) ? 0.08 : -0.08)));
  if (f <= 0) return;
  ctx.save();
  ctx.scale(camZ, camZ); ctx.translate(-Math.round(camX), -Math.round(camY));
  ctx.globalAlpha = f;
  ctx.font = '13px monospace';
  // partir el texto en renglones
  const words = n.say().split(' '), lines = [];
  let line = '';
  for (const w of words) {
    const tryLine = line ? line + ' ' + w : w;
    if (line && ctx.measureText(tryLine).width > 250) { lines.push(line); line = w; } else line = tryLine;
  }
  lines.push(line);
  const bw = Math.max(...lines.map(l => ctx.measureText(l).width)) + 24, bh = lines.length * 17 + 14;
  const RW = ROOMS[currentRoom].width || W;
  const bx = Math.max(camX + 8, Math.min(Math.min(RW, camX + W / camZ) - bw - 8, n.x - bw / 2));
  const by = n.y - 72 - bh;
  ctx.fillStyle = 'rgba(14,10,24,0.88)';
  ctx.strokeStyle = 'rgba(255,214,140,0.7)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 8); ctx.fill(); ctx.stroke();
  // piquito hacia el viajero
  ctx.beginPath(); ctx.moveTo(n.x - 7, by + bh); ctx.lineTo(n.x, by + bh + 9); ctx.lineTo(n.x + 7, by + bh); ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(14,10,24,0.88)'; ctx.fillRect(n.x - 6, by + bh - 2, 12, 3);
  ctx.fillStyle = '#ffe6c0'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  lines.forEach((l, i) => ctx.fillText(l, bx + 12, by + 8 + i * 17));
  ctx.restore();
}
