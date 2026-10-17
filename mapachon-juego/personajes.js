// ─── PERSONAJES DEL PUEBLO ───────────────────────────────────────────────────
// Gente común con capa y farol. No lo saben todo: cuentan lo que han oído.
// Al acercarte dicen sus frases una tras otra; lo que dicen cambia según lo que
// ya hiciste (por eso cada texto es una función que devuelve las frases).
const NPCS = {
  21: { name: 'Anselmo, el carbonero', cloak: ['#5a4a3a', '#2e2620'], x: 1250, y: 480, say: () =>
    keyUsed ? ['Dicen que alguien abrió la reja de los Cristales. ¿Fuiste tú?',
               'Pues ten cuidado allá arriba. Nadie sabe qué hay.'] :
    hasKey ? ['¡Esa llave dorada! Igualita a la de los cuentos de mi abuelo.',
              'Él decía que abría la reja del techo, allá en la Sala de los Cristales.',
              'Queda de regreso, por donde viniste. Yo no me atrevo a ir.'] :
    bossDefeated ? ['¿Saliste de la sala del trono? ¡Eres el primero que vuelve!',
                    'Mi abuelo decía que el rey traía una llave dorada colgada. ¿No viste nada brillante allá adentro?'] :
    ['¡Ay, me espantaste! Pensé que eras otro de esos que bajan buscando tesoros.',
     'Mi abuelo contaba que aquí abajo hubo un reino entero, con rey y todo.',
     'Más adelante está la sala del trono. Yo no paso de aquí.',
     'Los que han entrado no han vuelto. Ni uno.'] },
  1: { name: 'Doña Tula', cloak: ['#4a5a5a', '#24302e'], x: 1620, y: 480, say: () =>
    keyUsed ? ['¡Abriste la reja! Ni mi abuela la vio abierta.',
               'Mi compadre dice que arriba está la Cima, pero él nunca ha subido.'] :
    hasKey ? ['¿Esa es la llave del rey? ¡Ándale!',
              'Sube por los escalones hasta la reja y presiona ↑. A ver si es cierto.'] :
    ['Vengo a juntar cristales para venderlos en el pueblo. Brillan bonito, pero cortan.',
     '¿Ves esa reja en el techo? Desde que me acuerdo ha estado cerrada con candado.',
     'La gente dice que la llave se la quedó el rey de allá abajo. Yo nomás repito lo que oigo.',
     'Varios han ido a buscarla. Ninguno ha regresado.'] },
  37: { name: 'Rosendo, el viejo mozo', cloak: ['#5a3a3a', '#2e1e20'], x: 110, y: 480, say: () =>
    castleDoorOpen ? ['¿Abriste la gran puerta? Del otro lado estaba el viejo castillo...',
                      'No sé qué quede ahí ahora. Yo me quedo aquí, gracias.'] :
    guardsDefeated ? ['Ya no se oye nada allá abajo... ¿Qué pasó con los guardias?',
                      'Si traen sus llaves, la azul y la roja, junta las dos y toca la gran puerta.'] :
    ['Yo era mozo en este castillo, hace muchos años. Me escondí aquí cuando todo se vino abajo.',
     'Abajo está el salón de la guardia. De ahí salen ruidos de metal, día y noche.',
     'La gran puerta se abría con dos llaves: una azul y una roja. Quién sabe quién las tenga ahora.',
     'Varios han bajado por esa escalera. Ninguno ha vuelto a subir.'] },
  11: { name: 'Fermín, el pastor', cloak: ['#4a4a6a', '#24243a'], x: 470, y: 420, say: () =>
    ['Brrr... Se me perdió una cabra y llegué hasta acá. Aquí nunca amanece.',
     'Allá en la cima hay una trampilla. Dicen que baja a un castillo.',
     'Los que han bajado por ahí no han vuelto a salir. Yo ni me acerco.',
     'Si te animas, párate encima y presiona ↓. Yo te espero aquí... un ratito.'] },
};
const npcFade = {}; // qué tan visible está el globo de cada uno
const npcLine = {}; // { i: frase que va diciendo, t: cuadros que lleva en ella }

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
  cloak.addColorStop(0, n.cloak[0]); cloak.addColorStop(1, n.cloak[1]);
  ctx.fillStyle = cloak;
  ctx.beginPath();
  ctx.moveTo(-5, -44 + bob);
  ctx.quadraticCurveTo(-15, -30, -15, 0);
  ctx.lineTo(13, 0);
  ctx.quadraticCurveTo(13, -30, 6, -44 + bob);
  ctx.closePath(); ctx.fill();
  // borde rasgado de la capa
  ctx.fillStyle = n.cloak[1];
  for (let i = -14; i < 12; i += 6) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + 3, 3); ctx.lineTo(i + 6, 0); ctx.fill(); }
  // capucha
  ctx.fillStyle = n.cloak[0];
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
  const lines0 = n.say(), L = npcLine[currentRoom] || (npcLine[currentRoom] = { i: 0, t: 0, of: '' });
  if (f <= 0 || L.of !== lines0.join()) { L.i = 0; L.t = 0; L.of = lines0.join(); } // al irte o si cambia lo que sabe, vuelve a empezar
  if (f <= 0) return;
  // cada frase dura según lo larga que sea; al terminar empieza otra vez
  if (++L.t > 120 + lines0[L.i].length * 3) { L.t = 0; L.i = (L.i + 1) % lines0.length; }
  ctx.save();
  ctx.scale(camZ, camZ); ctx.translate(-Math.round(camX), -Math.round(camY));
  ctx.globalAlpha = f;
  ctx.font = '13px monospace';
  // partir el texto en renglones
  const words = lines0[L.i].split(' '), lines = [];
  let line = '';
  for (const w of words) {
    const tryLine = line ? line + ' ' + w : w;
    if (line && ctx.measureText(tryLine).width > 250) { lines.push(line); line = w; } else line = tryLine;
  }
  lines.push(line);
  ctx.font = 'bold 11px monospace';
  const nameW = ctx.measureText(n.name).width;
  ctx.font = '13px monospace';
  const bw = Math.max(nameW, ...lines.map(l => ctx.measureText(l).width)) + 24, bh = lines.length * 17 + 32;
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
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillStyle = '#ffc870'; ctx.font = 'bold 11px monospace';
  ctx.fillText(n.name, bx + 12, by + 7);
  ctx.fillStyle = '#ffe6c0'; ctx.font = '13px monospace';
  lines.forEach((l, i) => ctx.fillText(l, bx + 12, by + 24 + i * 17));
  // puntitos: cuántas frases tiene y en cuál va
  for (let i = 0; i < lines0.length && lines0.length > 1; i++) {
    ctx.fillStyle = i === L.i ? '#ffc870' : 'rgba(255,200,112,0.3)';
    ctx.beginPath(); ctx.arc(bx + bw - 12 - (lines0.length - 1 - i) * 8, by + 12, 2.2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
