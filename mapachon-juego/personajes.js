// ─── PERSONAJES DEL PUEBLO ───────────────────────────────────────────────────
// Gente común del pueblo, cada uno con su oficio (ver NPC_LOOKS). No lo saben todo: cuentan lo que han oído.
// Al acercarte dicen sus frases una tras otra; lo que dicen cambia según lo que
// ya hiciste (por eso cada texto es una función que devuelve las frases).
const NPCS = {
  21: { name: 'Anselmo, el carbonero', look: 'miner', cloak: ['#5a4a3a', '#2e2620'], x: 1950, y: 480, say: () =>
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
  1: { name: 'Doña Tula', look: 'granny', cloak: ['#4a5a5a', '#24302e'], x: 1620, y: 480, say: () =>
    keyUsed ? ['¡Abriste la reja! Ni mi abuela la vio abierta.',
               'Mi compadre dice que arriba está la Cima, pero él nunca ha subido.'] :
    hasKey ? ['¿Esa es la llave del rey? ¡Ándale!',
              'Sube por los escalones hasta la reja y presiona ↑. A ver si es cierto.'] :
    ['Vengo a juntar cristales para venderlos en el pueblo. Brillan bonito, pero cortan.',
     '¿Ves esa reja en el techo? Desde que me acuerdo ha estado cerrada con candado.',
     'La gente dice que la llave se la quedó el rey de allá abajo. Yo nomás repito lo que oigo.',
     'Varios han ido a buscarla. Ninguno ha regresado.'] },
  37: { name: 'Rosendo, el viejo mozo', look: 'servant', cloak: ['#5a3a3a', '#2e1e20'], x: 2120, y: 476, say: () =>
    castleDoorOpen ? ['¿Abriste la gran puerta? Del otro lado estaba el viejo castillo...',
                      'No sé qué quede ahí ahora. Yo me quedo aquí, gracias.'] :
    guardsDefeated ? ['Ya no se oye nada allá abajo... ¿Qué pasó con los guardias?',
                      'Si traen sus llaves, la azul y la roja, junta las dos y toca la gran puerta.'] :
    ['Yo era mozo en este castillo, hace muchos años. Me escondí aquí cuando todo se vino abajo.',
     'Abajo está el salón de la guardia. De ahí salen ruidos de metal, día y noche.',
     'La gran puerta se abría con dos llaves: una azul y una roja. Quién sabe quién las tenga ahora.',
     'Varios han bajado por esa escalera. Ninguno ha vuelto a subir.'] },
  // en la entrada: lleva tanto tiempo atrapado que perdió la cordura; rasca la pared para salir
  0: { name: 'Eusebio... ¿o era Ezequiel?', mad: true, cloak: ['#4e4a44', '#26241f'], x: 44, y: 480, say: () =>
    ['¡La salida estaba aquí! ¡AQUÍ! Yo la vi... yo entré por aquí...',
     '¿Cuánto llevo aquí? ¿Tres días? ¿Tres años? Las paredes se mueven cuando no las miras.',
     'Los que bajaron no volvieron, ¿sabes? Yo sí volví. Creo. ¿Volví?',
     '¿Oyes el goteo? Gotea al revés... hacia arriba. Je, je.',
     'No vayas a la derecha. Ni a la izquierda. ¡NO VAYAS!',
     'Si rasco lo suficiente, sale el sol. Eso me dijo la piedra.',
     'Shhh... no les digas que me estoy escapando.'] },
  11: { name: 'Fermín, el pastor', look: 'shepherd', cloak: ['#4a4a6a', '#24243a'], x: 1900, y: -200, say: () =>
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

// ─── DIBUJO DE LOS PERSONAJES ────────────────────────────────────────────────
// Cada uno tiene su propio dibujo (look): parado en el suelo con los pies en
// (0, 0), mirando a la derecha (se voltea hacia el mapache).
const NPC_INK = 'rgba(16,10,8,0.85)';
function npcShape(fill, path, ink = true) {
  ctx.beginPath(); path(); ctx.fillStyle = fill; ctx.fill();
  if (ink) { ctx.strokeStyle = NPC_INK; ctx.lineWidth = 1.1; ctx.stroke(); }
}
function npcGrad(y0, y1, c0, c1) {
  const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, c0); g.addColorStop(1, c1); return g;
}
function npcGlow(x, y, r, rgb, a) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
}
// ojos: abiertos (puntitos con brillo) o cerrados al parpadear
function npcEyes(xs, y, seed, r = 1.3) {
  if (blinkNow(seed)) {
    ctx.strokeStyle = '#2a1a14'; ctx.lineWidth = 1;
    for (const x of xs) { ctx.beginPath(); ctx.moveTo(x - 1.6, y); ctx.lineTo(x + 1.6, y); ctx.stroke(); }
    return;
  }
  for (const x of xs) {
    ctx.fillStyle = '#1a1210'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.arc(x + 0.4, y - 0.5, r * 0.4, 0, Math.PI * 2); ctx.fill();
  }
}
const SKIN = '#d6a682', SKIN_DK = '#b07c5c';

// Anselmo, el carbonero: casco con lámpara, barba, hollín, costal de carbón y pico al hombro
function drawNpcMiner(n, t, br) {
  npcGlow(14, -54 + br, 80, '255,214,130', 0.3);                       // luz de la lámpara del casco
  // costal de carbón a la espalda
  npcShape(npcGrad(-46, -18, '#7a6446', '#4a3a24'), () => ctx.roundRect(-19, -46 + br, 14, 28, 5));
  ctx.fillStyle = '#141210';
  for (const [x, y, r] of [[-16, -46, 3], [-11, -47, 3.4], [-7, -45, 2.6]]) { ctx.beginPath(); ctx.arc(x, y + br, r, 0, Math.PI * 2); ctx.fill(); }
  ctx.strokeStyle = '#3a2a18'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-18, -40 + br); ctx.lineTo(-6, -40 + br); ctx.stroke();
  // piernas y botas
  npcShape('#34302c', () => { ctx.rect(-7, -16, 5, 13); ctx.rect(2, -16, 5, 13); });
  npcShape('#3e2818', () => { ctx.roundRect(-9, -5, 8, 5, 2); ctx.roundRect(1, -5, 10, 5, 2); });
  // abrigo de trabajo
  npcShape(npcGrad(-42, -12, n.cloak[0], n.cloak[1]), () => {
    ctx.moveTo(-9, -41 + br); ctx.lineTo(8, -41 + br); ctx.quadraticCurveTo(12, -28, 11, -13);
    ctx.lineTo(-11, -13); ctx.quadraticCurveTo(-12, -28, -9, -41 + br); ctx.closePath();
  });
  ctx.fillStyle = '#24160c'; ctx.fillRect(-11, -22, 22, 3);                // cinturón
  ctx.fillStyle = '#c8a040'; ctx.fillRect(-1, -22.5, 4, 4);
  ctx.fillStyle = 'rgba(0,0,0,0.28)';                                     // manchas de hollín
  for (const [x, y, w, h] of [[-5, -33, 4, 2.5], [5, -27, 3, 2], [-7, -17, 3, 2]]) { ctx.beginPath(); ctx.ellipse(x, y + br, w, h, 0.4, 0, Math.PI * 2); ctx.fill(); }
  // cabeza
  npcShape(SKIN, () => ctx.arc(3, -49 + br, 8, 0, Math.PI * 2));
  ctx.fillStyle = 'rgba(30,20,16,0.35)'; ctx.beginPath(); ctx.ellipse(0, -47 + br, 2.5, 1.5, 0, 0, Math.PI * 2); ctx.fill(); // hollín en el cachete
  // barba tupida
  npcShape('#6a5446', () => {
    ctx.moveTo(-4, -49 + br); ctx.quadraticCurveTo(-5, -38 + br, 2, -36 + br);
    ctx.quadraticCurveTo(9, -37 + br, 11, -47 + br); ctx.quadraticCurveTo(6, -44 + br, 3, -45 + br);
    ctx.quadraticCurveTo(0, -44 + br, -4, -49 + br); ctx.closePath();
  });
  npcShape('#c48466', () => ctx.ellipse(9.5, -48.5 + br, 3, 2.6, 0, 0, Math.PI * 2));   // nariz
  npcEyes([5, 9], -51.5 + br, 3);
  ctx.strokeStyle = '#4a382c'; ctx.lineWidth = 1.6;                       // cejas pobladas
  ctx.beginPath(); ctx.moveTo(3, -54 + br); ctx.lineTo(6.5, -54.5 + br); ctx.moveTo(8, -54.5 + br); ctx.lineTo(11, -54 + br); ctx.stroke();
  // casco de minero con lámpara
  npcShape(npcGrad(-62, -52, '#6a5440', '#3a2c20'), () => { ctx.ellipse(3, -55 + br, 9.5, 6, 0, Math.PI, 0); ctx.closePath(); });
  npcShape('#3a2c20', () => ctx.roundRect(-7, -56 + br, 21, 3, 1.5));
  npcShape('#e8d080', () => ctx.arc(11, -58 + br, 2.6, 0, Math.PI * 2));
  npcGlow(11, -58 + br, 9, '255,240,180', 0.8);
  // pico al hombro
  ctx.save(); ctx.translate(10, -26 + br); ctx.rotate(-0.95);
  ctx.strokeStyle = '#5a3a1e'; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -34); ctx.stroke();
  npcShape('#8a8e98', () => { ctx.moveTo(-12, -30); ctx.quadraticCurveTo(0, -38, 12, -30); ctx.lineTo(10, -33); ctx.quadraticCurveTo(0, -40, -10, -33); ctx.closePath(); });
  ctx.restore();
  // brazo
  ctx.strokeStyle = n.cloak[0]; ctx.lineWidth = 4.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(5, -37 + br); ctx.lineTo(10, -27 + br); ctx.stroke();
  npcShape(SKIN, () => ctx.arc(10.5, -26 + br, 2.4, 0, Math.PI * 2));
}

// Doña Tula: viejita encorvada con chal, chongo, lentes, canasta de cristales y bastón
function drawNpcGranny(n, t, br) {
  const glow = 0.25 + 0.12 * Math.sin(t * 2.2);
  npcGlow(12, -22, 60, '80,230,190', glow);                               // brillo de los cristales
  // bastón
  ctx.strokeStyle = '#6a4a2a'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-13, 0); ctx.lineTo(-11, -30 + br); ctx.stroke();
  ctx.beginPath(); ctx.arc(-9, -31 + br, 2.5, Math.PI, 0); ctx.stroke();
  // falda larga y mandil
  npcShape(npcGrad(-34, 0, n.cloak[0], n.cloak[1]), () => {
    ctx.moveTo(-8, -32 + br); ctx.lineTo(7, -32 + br); ctx.quadraticCurveTo(13, -14, 13, 0);
    ctx.lineTo(-12, 0); ctx.quadraticCurveTo(-12, -14, -8, -32 + br); ctx.closePath();
  });
  npcShape('#d8cdb4', () => { ctx.moveTo(0, -26 + br); ctx.lineTo(9, -26 + br); ctx.lineTo(11, -2); ctx.lineTo(1, -2); ctx.closePath(); });
  ctx.strokeStyle = 'rgba(120,90,60,0.6)'; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(2, -12); ctx.lineTo(10, -12); ctx.stroke();
  npcShape('#2a1e18', () => { ctx.roundRect(-8, -2, 7, 3, 1.5); ctx.roundRect(2, -2, 8, 3, 1.5); });   // zapatos
  // chal tejido con flecos
  npcShape('#9a4a36', () => {
    ctx.moveTo(-10, -38 + br); ctx.quadraticCurveTo(2, -42 + br, 10, -37 + br); ctx.lineTo(4, -24 + br); ctx.lineTo(-11, -26 + br); ctx.closePath();
  });
  ctx.strokeStyle = '#c87a5a'; ctx.lineWidth = 0.8;
  for (let i = 0; i < 6; i++) { const x = -10 + i * 2.6; ctx.beginPath(); ctx.moveTo(x, -26 + br + i * 0.3); ctx.lineTo(x - 0.5, -22 + br + i * 0.3); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(255,200,170,0.35)';
  for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(-8 + k * 3, -36 + br); ctx.lineTo(-2 + k * 3, -28 + br); ctx.stroke(); }
  // cabeza (agachadita) con chongo de pelo blanco
  npcShape('#e8e4dc', () => ctx.arc(-2, -48 + br, 5, 0, Math.PI * 2));
  npcShape(SKIN, () => ctx.arc(4, -42 + br, 7.5, 0, Math.PI * 2));
  npcShape('#ece8e0', () => { ctx.moveTo(-3, -41 + br); ctx.quadraticCurveTo(-3, -51 + br, 5, -50.5 + br); ctx.quadraticCurveTo(11, -50 + br, 11.5, -45 + br); ctx.quadraticCurveTo(6, -47 + br, -3, -41 + br); ctx.closePath(); });
  ctx.fillStyle = 'rgba(230,120,110,0.45)'; ctx.beginPath(); ctx.arc(9, -39.5 + br, 2, 0, Math.PI * 2); ctx.fill(); // cachete
  npcEyes([6, 9.8], -43 + br, 5, 1);
  ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = 0.9;                       // lentes redondos
  ctx.beginPath(); ctx.arc(6, -43 + br, 2.3, 0, Math.PI * 2); ctx.moveTo(12.1, -43 + br); ctx.arc(9.8, -43 + br, 2.3, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#7a4a3a'; ctx.lineWidth = 1;                         // sonrisa
  ctx.beginPath(); ctx.arc(8.5, -39 + br, 2, 0.2, Math.PI - 0.6); ctx.stroke();
  // canasta con cristales al brazo
  ctx.strokeStyle = '#7a5a30'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.arc(14, -20, 6, Math.PI, 0); ctx.stroke();
  for (const [x, h, c] of [[11, 8, '#60e8c0'], [14, 11, '#90fff0'], [17, 7, '#40c8a0']]) {
    npcShape(c, () => { ctx.moveTo(x - 2, -19); ctx.lineTo(x, -19 - h); ctx.lineTo(x + 2, -19); ctx.closePath(); }, false);
  }
  npcShape('#9a7040', () => { ctx.moveTo(7, -20); ctx.lineTo(21, -20); ctx.lineTo(19, -12); ctx.lineTo(9, -12); ctx.closePath(); });
  ctx.strokeStyle = 'rgba(60,40,20,0.6)'; ctx.lineWidth = 0.8;
  for (let x = 10; x < 20; x += 3) { ctx.beginPath(); ctx.moveTo(x, -19.5); ctx.lineTo(x, -12.5); ctx.stroke(); }
  if (Math.sin(t * 3) > 0.92) { ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(14, -30, 1.3, 0, Math.PI * 2); ctx.fill(); } // destello
  ctx.strokeStyle = n.cloak[0]; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(4, -30 + br); ctx.lineTo(10, -22); ctx.stroke();
}

// Rosendo, el viejo mozo: librea gastada con botones, calvo con bigote, vela y llavero
function drawNpcServant(n, t, br) {
  const fl = 0.85 + 0.15 * Math.sin(t * 9) * Math.sin(t * 5.3);
  npcGlow(15, -40, 70 * fl, '255,190,110', 0.3);                          // luz de la vela
  ctx.save(); ctx.rotate(0.06);                                           // encorvado
  // piernas flacas con medias y zapatos de hebilla
  npcShape('#8a8a90', () => { ctx.rect(-5, -18, 3.5, 16); ctx.rect(2, -18, 3.5, 16); });
  npcShape('#1e1a18', () => { ctx.roundRect(-7, -3, 7, 3.5, 1.5); ctx.roundRect(1, -3, 8, 3.5, 1.5); });
  ctx.fillStyle = '#c8a850'; ctx.fillRect(-4.5, -2.5, 2, 2); ctx.fillRect(4, -2.5, 2, 2);
  // librea con faldones
  npcShape(npcGrad(-44, -10, n.cloak[0], n.cloak[1]), () => {
    ctx.moveTo(-7, -44 + br); ctx.lineTo(7, -44 + br); ctx.lineTo(9, -20); ctx.lineTo(4, -10); ctx.lineTo(1, -20);
    ctx.lineTo(-1, -20); ctx.lineTo(-6, -9); ctx.lineTo(-9, -20); ctx.closePath();
  });
  npcShape('#e8e0d0', () => { ctx.moveTo(-2, -44 + br); ctx.lineTo(4, -44 + br); ctx.lineTo(1, -36 + br); ctx.closePath(); });   // cuello de camisa
  ctx.fillStyle = '#b89a50';                                              // botones gastados
  for (const y of [-38, -33, -28, -23]) { ctx.beginPath(); ctx.arc(3, y + br * (y < -30 ? 1 : 0), 1.1, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(-6, -30, 3, 4);         // remiendo
  ctx.strokeStyle = 'rgba(230,210,180,0.5)'; ctx.lineWidth = 0.6; ctx.strokeRect(-6, -30, 3, 4);
  // llavero colgando del cinturón
  ctx.strokeStyle = '#a89060'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(-6, -18, 2.5, 0, Math.PI * 2); ctx.stroke();
  for (const a of [-0.4, 0.3]) { ctx.save(); ctx.translate(-6, -15.5); ctx.rotate(a + Math.sin(t * 2) * 0.1); ctx.fillStyle = '#a89060'; ctx.fillRect(-0.6, 0, 1.2, 6); ctx.fillRect(-0.6, 5, 2.5, 1.2); ctx.restore(); }
  // cabeza calva con mechones blancos y bigote largo
  npcShape(SKIN, () => ctx.ellipse(3, -51 + br, 7, 8, 0, 0, Math.PI * 2));
  ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.ellipse(1, -56 + br, 3, 1.6, -0.3, 0, Math.PI * 2); ctx.fill();
  npcShape('#eeeae4', () => { ctx.ellipse(-3.5, -50 + br, 2.5, 4, 0.2, 0, Math.PI * 2); });
  npcShape(SKIN_DK, () => ctx.ellipse(10, -50 + br, 2.6, 3.2, 0.3, 0, Math.PI * 2));       // narizota
  npcShape('#f2eee8', () => {                                             // bigote caído
    ctx.moveTo(5, -47 + br); ctx.quadraticCurveTo(10, -48 + br, 12, -46 + br); ctx.quadraticCurveTo(13, -41 + br, 10.5, -40 + br);
    ctx.quadraticCurveTo(10, -44 + br, 7, -45 + br); ctx.quadraticCurveTo(5, -44 + br, 5, -47 + br); ctx.closePath();
  });
  // ojos cansados (párpados caídos)
  npcEyes([5, 8.5], -52.5 + br, 7, 1.1);
  ctx.strokeStyle = SKIN_DK; ctx.lineWidth = 1.3;
  ctx.beginPath(); ctx.moveTo(3.5, -53.6 + br); ctx.lineTo(6.5, -53.6 + br); ctx.moveTo(7, -53.6 + br); ctx.lineTo(10, -53.6 + br); ctx.stroke();
  // vela en un platito
  ctx.strokeStyle = n.cloak[0]; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(4, -40 + br); ctx.lineTo(13, -32); ctx.stroke();
  npcShape('#b8a070', () => ctx.ellipse(15, -32, 5, 1.5, 0, 0, Math.PI * 2));
  npcShape('#efe6d0', () => ctx.rect(13.5, -40, 3, 8));
  npcShape(`rgba(255,${200 + Math.round(Math.sin(t * 7) * 30)},90,0.95)`, () => ctx.ellipse(15, -43 - fl, 1.6, 3 * fl, 0, 0, Math.PI * 2), false);
  ctx.restore();
}

// Fermín, el pastor: zamarra de lana, gorro con orejeras, bufanda, cayado con farol; tirita y echa vaho
function drawNpcShepherd(n, t, br) {
  const shiver = Math.sin(t * 22) * 0.5;
  npcGlow(17, -48, 70, '255,190,90', 0.32);                               // farol colgado del cayado
  // cayado
  ctx.strokeStyle = '#6a4a26'; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(13, 0); ctx.lineTo(13, -62); ctx.arc(18, -62, 5, Math.PI, 0); ctx.stroke();
  ctx.strokeStyle = '#3a3030'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(23, -62); ctx.lineTo(23, -55); ctx.stroke();
  npcShape('#3a2c20', () => { ctx.rect(20, -55, 6, 2); ctx.rect(20, -47, 6, 2); });
  npcShape(`rgba(255,${205 + Math.round(Math.sin(t * 3) * 20)},110,0.95)`, () => ctx.rect(20.5, -53, 5, 6), false);
  ctx.save(); ctx.translate(shiver, 0);
  // piernas y botas
  npcShape(n.cloak[1], () => { ctx.rect(-6, -15, 5, 12); ctx.rect(1, -15, 5, 12); });
  npcShape('#4a3424', () => { ctx.roundRect(-8, -5, 8, 5, 2); ctx.roundRect(0, -5, 9, 5, 2); });
  // zamarra de lana (borreguitos)
  npcShape(npcGrad(-42, -12, '#e8e0cc', '#b8ae96'), () => {
    ctx.moveTo(-10, -40 + br); ctx.lineTo(9, -40 + br); ctx.quadraticCurveTo(13, -26, 12, -12);
    ctx.lineTo(-12, -12); ctx.quadraticCurveTo(-13, -26, -10, -40 + br); ctx.closePath();
  });
  ctx.fillStyle = 'rgba(150,140,120,0.45)';
  for (const [x, y] of [[-6, -34], [0, -30], [6, -34], [-7, -24], [-1, -19], [6, -23], [3, -15], [-9, -16]]) { ctx.beginPath(); ctx.arc(x, y + br * 0.5, 2, 0, Math.PI * 2); ctx.fill(); }
  ctx.strokeStyle = '#5a4030'; ctx.lineWidth = 1.2;                       // costura del frente
  ctx.beginPath(); ctx.moveTo(1, -40 + br); ctx.lineTo(1, -12); ctx.stroke();
  // morral de lado
  npcShape('#7a5a3a', () => ctx.roundRect(-14, -24, 8, 9, 2));
  ctx.strokeStyle = '#5a4028'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-10, -24); ctx.lineTo(6, -40 + br); ctx.stroke();
  // cabeza: gorro de piel con orejeras, nariz roja de frío
  npcShape(SKIN, () => ctx.arc(3, -48 + br, 7.5, 0, Math.PI * 2));
  ctx.fillStyle = 'rgba(80,60,50,0.3)'; ctx.beginPath(); ctx.ellipse(6, -43.5 + br, 4.5, 2.2, 0, 0, Math.PI * 2); ctx.fill(); // barba de días
  npcShape('#e07060', () => ctx.arc(10.2, -47.5 + br, 2.1, 0, Math.PI * 2));          // nariz roja
  npcEyes([5.5, 9], -50 + br, 9, 1.1);
  ctx.strokeStyle = '#4a3020'; ctx.lineWidth = 1.2;                       // cejas preocupadas
  ctx.beginPath(); ctx.moveTo(4, -52.5 + br); ctx.lineTo(7, -53.8 + br); ctx.moveTo(8, -53.8 + br); ctx.lineTo(11, -52.5 + br); ctx.stroke();
  npcShape('#7a5636', () => { ctx.moveTo(-5, -50 + br); ctx.quadraticCurveTo(-5, -60 + br, 4, -60 + br); ctx.quadraticCurveTo(12, -60 + br, 11.5, -52 + br); ctx.lineTo(-5, -50 + br); ctx.closePath(); });
  npcShape('#9a7652', () => ctx.roundRect(-6, -53 + br, 18, 3.5, 1.5));
  npcShape('#7a5636', () => ctx.roundRect(-5, -51 + br, 4, 9, 2));         // orejera
  ctx.fillStyle = '#d8c8a8'; ctx.beginPath(); ctx.arc(4, -61 + br, 2.2, 0, Math.PI * 2); ctx.fill();       // borla
  // bufanda a rayas que ondea
  const wave = Math.sin(t * 4) * 2;
  npcShape('#b03030', () => { ctx.roundRect(-5, -42 + br, 14, 4, 2); });
  npcShape('#b03030', () => { ctx.moveTo(-4, -41 + br); ctx.lineTo(-13, -38 + wave); ctx.lineTo(-14, -34 + wave); ctx.lineTo(-4, -38 + br); ctx.closePath(); });
  ctx.strokeStyle = '#f0e0c0'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-8, -40 + wave * 0.5); ctx.lineTo(-8, -36 + wave * 0.5); ctx.moveTo(-11, -38 + wave); ctx.lineTo(-11, -35 + wave); ctx.stroke();
  // brazo agarrando el cayado
  ctx.strokeStyle = '#d8d0bc'; ctx.lineWidth = 4.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(5, -36 + br); ctx.lineTo(12, -30); ctx.stroke();
  npcShape('#6a4a30', () => ctx.arc(13, -30, 2.6, 0, Math.PI * 2));         // guante
  ctx.restore();
  // vaho del frío
  const ph = (t * 0.5) % 1;
  if (ph < 0.6) {
    const k = ph / 0.6;
    ctx.fillStyle = `rgba(230,240,255,${(0.45 * (1 - k)).toFixed(2)})`;
    ctx.beginPath(); ctx.arc(15 + k * 10, -46 - k * 6, 2 + k * 4, 0, Math.PI * 2); ctx.arc(19 + k * 12, -48 - k * 7, 1.5 + k * 3, 0, Math.PI * 2); ctx.fill();
  }
}

// Eusebio: harapos, pelo y barba revueltos, descalzo; rasca la pared llena de rayitas
function drawNpcMad(n, t, br, face, hop) {
  // farol tirado, parpadeando
  const on = Math.random() > 0.08;
  if (on) npcGlow(26, -6, 60, '255,170,70', 0.3);
  ctx.save(); ctx.translate(26, -4); ctx.rotate(1.35);
  npcShape('#4a3a28', () => { ctx.rect(-4, -6, 8, 2); ctx.rect(-4, 5, 8, 2); });
  npcShape(on ? 'rgba(255,190,100,0.9)' : 'rgba(90,70,40,0.9)', () => ctx.rect(-3, -4, 6, 9));
  ctx.restore();
  // la pared: rayitas de días contados y rasguños
  ctx.strokeStyle = 'rgba(220,210,190,0.5)'; ctx.lineWidth = 1;
  for (let g = 0; g < 4; g++) {
    const gx = -21, gy = -96 + g * 13;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) { ctx.moveTo(gx + (i % 2) * 0.5, gy + i * 2.4); ctx.lineTo(gx + 0.5, gy + i * 2.4 + 6); }
    ctx.moveTo(gx - 2, gy + 1); ctx.lineTo(gx + 3, gy + 9);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(200,190,170,0.35)';
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-22, -70 + i * 9); ctx.lineTo(-19, -58 + i * 9); ctx.stroke(); }
  ctx.translate((Math.random() - 0.5) * 1.2, hop);                        // tiembla y brinca
  ctx.scale(face, 1);
  const b = br * 2;
  // piernas flacas y pies descalzos
  npcShape(SKIN_DK, () => { ctx.rect(-5, -14, 3, 12); ctx.rect(2, -14, 3, 12); });
  npcShape(SKIN_DK, () => { ctx.ellipse(-4, -1.5, 4, 1.8, 0, 0, Math.PI * 2); ctx.ellipse(4.5, -1.5, 4, 1.8, 0, 0, Math.PI * 2); });
  // harapos
  npcShape(npcGrad(-40, -10, n.cloak[0], n.cloak[1]), () => {
    ctx.moveTo(-8, -38 + b); ctx.lineTo(8, -38 + b); ctx.lineTo(10, -14); ctx.lineTo(7, -9); ctx.lineTo(4, -14);
    ctx.lineTo(1, -8); ctx.lineTo(-2, -13); ctx.lineTo(-6, -9); ctx.lineTo(-10, -15); ctx.closePath();
  });
  ctx.fillStyle = 'rgba(0,0,0,0.4)';                                      // agujeros
  ctx.beginPath(); ctx.ellipse(-3, -28 + b, 2, 1.5, 0.3, 0, Math.PI * 2); ctx.ellipse(4, -20, 1.5, 2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(-6, -34 + b); ctx.lineTo(-2, -24); ctx.moveTo(5, -36 + b); ctx.lineTo(7, -26); ctx.stroke();
  // brazos flacos arriba, rascando la pared
  const sc = Math.sin(t * 14) * 4;
  ctx.strokeStyle = SKIN_DK; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-5, -34 + b); ctx.lineTo(-12, -47 + sc); ctx.lineTo(-16, -56 + sc);
  ctx.moveTo(4, -35 + b); ctx.lineTo(-6, -52 - sc); ctx.lineTo(-13, -62 - sc); ctx.stroke();
  // cabeza: pelo y barba revueltos
  ctx.fillStyle = '#9a9286';
  for (let i = 0; i < 9; i++) {
    const a = -2.9 + i * 0.36 + Math.sin(t * 4 + i) * 0.12, r = 13 + (i % 3) * 2;
    ctx.beginPath(); ctx.moveTo(1, -46 + b); ctx.lineTo(1 + Math.cos(a) * r, -46 + b + Math.sin(a) * r);
    ctx.lineTo(1 + Math.cos(a + 0.25) * 8, -46 + b + Math.sin(a + 0.25) * 8); ctx.fill();
  }
  npcShape(SKIN, () => ctx.ellipse(3, -45 + b, 7, 8, 0, 0, Math.PI * 2));
  npcShape('#a8a094', () => {
    ctx.moveTo(-3, -43 + b); ctx.quadraticCurveTo(-4, -32 + b, 1, -30 + b); ctx.lineTo(4, -34 + b); ctx.lineTo(7, -29 + b);
    ctx.quadraticCurveTo(11, -34 + b, 10, -42 + b); ctx.quadraticCurveTo(6, -38 + b, 3, -39 + b); ctx.quadraticCurveTo(0, -39 + b, -3, -43 + b); ctx.closePath();
  });
  // ojos desparejos y saltones
  npcShape('#ffffff', () => { ctx.arc(4, -47 + b, 3, 0, Math.PI * 2); ctx.moveTo(10.5, -46 + b); ctx.arc(8.5, -46 + b, 2, 0, Math.PI * 2); });
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(4.5 + Math.sin(t * 5), -47 + b, 1.1, 0, Math.PI * 2); ctx.arc(8.8, -46 + b, 0.8, 0, Math.PI * 2); ctx.fill();
  // sonrisa torcida con un diente de menos
  npcShape('#3a1a14', () => { ctx.moveTo(3, -40 + b); ctx.quadraticCurveTo(6, -37 + b + Math.sin(t * 7), 10, -41 + b); ctx.quadraticCurveTo(6, -39 + b, 3, -40 + b); ctx.closePath(); }, false);
  ctx.fillStyle = '#f0e8d0'; ctx.fillRect(5, -40 + b, 1.4, 1.4); ctx.fillRect(8, -40.5 + b, 1.4, 1.4);
}

const NPC_LOOKS = { miner: drawNpcMiner, granny: drawNpcGranny, servant: drawNpcServant, shepherd: drawNpcShepherd };

// El personaje, parado en el suelo (se dibuja con la cámara)
function drawNpc() {
  const n = NPCS[currentRoom];
  if (!n) return;
  const t = Date.now() * 0.002, br = Math.sin(t * 1.3) * 0.7;
  const toPlayer = player.x + player.w / 2 < n.x ? -1 : 1;
  // el que perdió la cordura mira a la pared y a ratos voltea a verte
  const face = n.mad ? (npcNear(n) && Math.sin(Date.now() * 0.0011) > 0.4 ? toPlayer : -1) : toPlayer;
  const f = Math.floor(Date.now() / 16) % 100, hop = n.mad && f < 22 ? -Math.sin(f / 22 * Math.PI) * 14 : 0;
  ctx.save();
  ctx.translate(n.x, n.y);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(0, 1, 15 + hop * 0.4, 3.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.lineJoin = 'round';
  if (n.mad) drawNpcMad(n, t, br, face, hop);
  else { ctx.scale(face, 1); NPC_LOOKS[n.look](n, t, br); }
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
