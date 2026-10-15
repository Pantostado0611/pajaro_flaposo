// ─── ENEMIGOS ─────────────────────────────────────────────────────────────────
// ─── BICHOS DE CADA ZONA ─────────────────────────────────────────────────────
// Ruinas: escarabajo · Cristales: escarabajo de cristal · Jardín: seta andante
// Rey: escarabajo real · Cima: espíritu estelar · Armería: yelmo saltarín
// Castillo: rata · Montaña: piedra nevada · Guardia: metal al rojo · Ruinas M.: escarabajo de hueso
const ZONE_ENEMY = { 1: 'crystal', 2: 'shroom', 4: 'royal', 3: 'wisp', 5: 'armor', 6: 'rat', 38: 'bone' };
const KIND_SPEED = { shroom: 0.7, rat: 1.35, wisp: 0.9 };
const BEETLE_STOPS = {
  crystal: ['#c8fff0', '#60e0c8', '#30a8b8', '#1a6a80', '#0a2a38'],
  royal:   ['#ff8a8a', '#c02030', '#801020', '#500818', '#200408'],
  bone:    ['#f4ecd8', '#d8ccb0', '#b0a488', '#80765e', '#3a3428'],
};

// Detalles sobre el caparazón según la zona
function drawBeetleExtras(e, t) {
  if (e.kind === 'crystal') {
    // púas de cristal que brillan
    for (const [x, h, a] of [[-9, 9, -0.3], [-3, 12, 0], [3, 8, 0.3]]) {
      ctx.save(); ctx.translate(x, -9); ctx.rotate(a);
      const g = ctx.createLinearGradient(0, -h, 0, 0);
      g.addColorStop(0, '#f0fffc'); g.addColorStop(1, '#30b0b8');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(-2.5, 0); ctx.lineTo(0, -h); ctx.lineTo(2.5, 0); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    const sp = (Math.sin(t * 3 + e.x) + 1) / 2;
    ctx.fillStyle = `rgba(255,255,255,${(sp * 0.9).toFixed(2)})`;
    ctx.beginPath(); ctx.arc(-3, -19, 1.4, 0, Math.PI * 2); ctx.fill();
  }
  if (e.kind === 'bone') {
    // costillas
    ctx.strokeStyle = 'rgba(60,50,30,0.55)'; ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath(); ctx.moveTo(-11 + i * 4, 2); ctx.quadraticCurveTo(-9 + i * 4, -6, -6 + i * 4, -9); ctx.stroke();
    }
  }
}
function drawBeetleCrown(e) {
  if (e.kind !== 'royal') return;
  // coronita dorada sobre la cabeza
  ctx.fillStyle = '#ffd040';
  ctx.beginPath(); ctx.moveTo(9.5, -4); ctx.lineTo(9.5, -9); ctx.lineTo(11.5, -6.5); ctx.lineTo(13.5, -10);
  ctx.lineTo(15.5, -6.5); ctx.lineTo(17, -9); ctx.lineTo(17, -4); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ff3050'; ctx.beginPath(); ctx.arc(13.3, -5.5, 1, 0, Math.PI * 2); ctx.fill();
}

// Seta andante del jardín podrido
function drawShroom(e, cx, cy, t) {
  const ph = t * 5 + e.x * 0.05, step = Math.sin(ph);
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.beginPath(); ctx.ellipse(cx, cy + 14, 13, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.translate(cx, cy + 12); ctx.scale(e.dir, 1);
  // patitas
  ctx.strokeStyle = '#6a5038'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-4, -6); ctx.lineTo(-5 + step * 3, 0); ctx.moveTo(4, -6); ctx.lineTo(5 - step * 3, 0); ctx.stroke();
  // tallo
  ctx.fillStyle = vol(0, -11, 7, '#e8dcc0', '#9a8a68');
  ctx.beginPath(); ctx.roundRect(-6, -18, 12, 13, 5); ctx.fill();
  // sombrero con manchas
  const bob = Math.abs(step) * 1.5;
  ctx.fillStyle = vol(-3, -24 - bob, 15, '#c87a3a', '#5a2a10');
  ctx.beginPath(); ctx.ellipse(0, -19 - bob, 15, 10, 0, Math.PI, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(240,220,160,0.8)';
  for (const [x, y, r] of [[-7, -23, 2.2], [1, -26, 2.6], [8, -21, 1.8]]) { ctx.beginPath(); ctx.arc(x, y - bob, r, 0, Math.PI * 2); ctx.fill(); }
  // ojos
  ctx.fillStyle = '#1a0a04';
  ctx.beginPath(); ctx.arc(2, -13, 1.6, 0, Math.PI * 2); ctx.arc(-2.5, -13, 1.4, 0, Math.PI * 2); ctx.fill();
  // esporas
  for (let i = 0; i < 3; i++) {
    const k = (t * 0.5 + i / 3 + e.x * 0.01) % 1;
    ctx.fillStyle = `rgba(190,230,120,${(0.6 * (1 - k)).toFixed(2)})`;
    ctx.beginPath(); ctx.arc(-8 + i * 8 + Math.sin(k * 6 + i) * 3, -30 - k * 18, 1.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// Espíritu estelar de la Cima: flota y deja estela
function drawWisp(e, cx, cy, t) {
  const bob = Math.sin(t * 2.5 + e.x * 0.03) * 5, y = cy - 6 + bob;
  ctx.save();
  const g = ctx.createRadialGradient(cx, y, 0, cx, y, 26);
  g.addColorStop(0, 'rgba(210,170,255,0.55)'); g.addColorStop(1, 'rgba(160,100,255,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, y, 26, 0, Math.PI * 2); ctx.fill();
  // estela
  for (let i = 1; i <= 4; i++) {
    ctx.fillStyle = `rgba(200,160,255,${(0.35 - i * 0.07).toFixed(2)})`;
    ctx.beginPath(); ctx.arc(cx - e.dir * i * 6, y + Math.sin(t * 3 - i) * 2, 6 - i, 0, Math.PI * 2); ctx.fill();
  }
  // estrella de cuatro puntas
  ctx.translate(cx, y); ctx.rotate(t * 0.8);
  ctx.fillStyle = '#f4ecff';
  ctx.beginPath();
  for (let k = 0; k < 8; k++) { const r = k % 2 ? 3.5 : 11, a = k / 8 * Math.PI * 2; k ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(r, 0); }
  ctx.closePath(); ctx.fill();
  ctx.rotate(-t * 0.8);
  ctx.fillStyle = '#6a2aaa';
  ctx.beginPath(); ctx.arc(e.dir * 2.5, -1, 1.5, 0, Math.PI * 2); ctx.arc(e.dir * -1.5, -1, 1.3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// Yelmo saltarín de la armería: una armadura vacía que da saltitos
function drawArmor(e, cx, cy, t) {
  const hop = Math.abs(Math.sin(t * 4 + e.x * 0.05)) * 7;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(cx, cy + 14, 12 - hop * 0.4, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.translate(cx, cy + 12 - hop); ctx.scale(e.dir, 1);
  // botas
  ctx.fillStyle = '#3a3e4a';
  ctx.beginPath(); ctx.roundRect(-9, -5, 8, 5, 2); ctx.roundRect(2, -5, 8, 5, 2); ctx.fill();
  // yelmo
  ctx.fillStyle = vol(-2, -16, 13, '#e0e4ee', '#5a6070');
  ctx.beginPath(); ctx.arc(0, -13, 11, Math.PI, 0); ctx.lineTo(11, -4); ctx.lineTo(-11, -4); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, -24); ctx.lineTo(0, -4); ctx.stroke();
  // visera con ojos que brillan
  ctx.fillStyle = '#14161c'; ctx.fillRect(-1, -15, 11, 4);
  ctx.fillStyle = '#c060ff'; ctx.shadowColor = '#c060ff'; ctx.shadowBlur = 6;
  ctx.fillRect(3, -14.5, 2.5, 2.5); ctx.fillRect(7, -14.5, 2, 2.5); ctx.shadowBlur = 0;
  // penacho morado
  ctx.fillStyle = '#7a3ac0';
  ctx.beginPath(); ctx.moveTo(-2, -24); ctx.quadraticCurveTo(-10, -32, -16, -26); ctx.quadraticCurveTo(-9, -28, -3, -22); ctx.closePath(); ctx.fill();
  ctx.restore();
}

// Rata del castillo
function drawRat(e, cx, cy, t) {
  const ph = t * 9 + e.x * 0.05, run = Math.sin(ph);
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.beginPath(); ctx.ellipse(cx, cy + 13, 14, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.translate(cx, cy + 6); ctx.scale(e.dir, 1);
  // cola
  ctx.strokeStyle = '#c89090'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-12, 0); ctx.quadraticCurveTo(-22, -2 + run * 3, -26, -10 + run * 2); ctx.stroke();
  // patas
  ctx.strokeStyle = '#4a3a3a'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-6, 3); ctx.lineTo(-7 + run * 3, 7); ctx.moveTo(6, 3); ctx.lineTo(7 - run * 3, 7); ctx.stroke();
  // cuerpo
  ctx.fillStyle = vol(-2, -3, 13, '#8a7a78', '#3a302e');
  ctx.beginPath(); ctx.ellipse(-1, -1, 13, 7, 0, 0, Math.PI * 2); ctx.fill();
  // cabeza puntiaguda
  ctx.beginPath(); ctx.moveTo(8, -6); ctx.quadraticCurveTo(18, -3, 19, 1); ctx.quadraticCurveTo(14, 4, 8, 3); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ff9aa0'; ctx.beginPath(); ctx.arc(19, 0.5, 1.4, 0, Math.PI * 2); ctx.fill();
  // oreja y ojo
  ctx.fillStyle = '#c89090'; ctx.beginPath(); ctx.ellipse(9, -7, 3, 4, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ff3030'; ctx.beginPath(); ctx.arc(13, -2.5, 1.3, 0, Math.PI * 2); ctx.fill();
  // bigotes
  ctx.strokeStyle = 'rgba(230,220,220,0.6)'; ctx.lineWidth = 0.7;
  ctx.beginPath(); ctx.moveTo(17, 0); ctx.lineTo(23, -2); ctx.moveTo(17, 1); ctx.lineTo(23, 2); ctx.stroke();
  ctx.restore();
}
const THEMED_DRAW = { shroom: drawShroom, wisp: drawWisp, armor: drawArmor, rat: drawRat };

// ─── UN BICHO PROPIO PARA CADA SALA ──────────────────────────────────────────
// body: forma del bicho; c1/c2: colores del cuerpo; c3: detalle; eye: ojos;
// extra: adorno (corona, cristales, nieve, brasas…); fly: flota; speed: multiplicador
const ROOM_CRITTER = {
  0:  { body: 'imp',     c1: '#6a7898', c2: '#2a3248', c3: '#a8b4d0', eye: '#ffd060', name: 'Duende de las ruinas' },
  14: { body: 'golem',   c1: '#5a6480', c2: '#262c40', c3: '#8a94b0', eye: '#80b0ff', name: 'Gólem de escombros' },
  15: { body: 'bat',     c1: '#4a4a8a', c2: '#1a1a3a', c3: '#9a9aff', eye: '#c0c0ff', extra: 'echo', fly: true, name: 'Murciélago del eco' },
  1:  { body: 'snail',   c1: '#7ac0a0', c2: '#2a5a48', c3: '#c8fff0', eye: '#1a3a30', extra: 'crystal', speed: 0.6, name: 'Caracol de cristal' },
  16: { body: 'spider',  c1: '#60d0c0', c2: '#1a5a58', c3: '#e0fff8', eye: '#ffffff', extra: 'crystal', name: 'Araña de cuarzo' },
  17: { body: 'slime',   c1: '#60ff9a', c2: '#1a8a4a', c3: '#e0ffe8', eye: '#0a2a14', extra: 'glow', name: 'Babosa luminosa' },
  2:  { body: 'shroom',  name: 'Seta andante' },
  18: { body: 'crawler', c1: '#7a5430', c2: '#3a2410', c3: '#a07a50', eye: '#ffcc40', name: 'Gusano de raíz' },
  19: { body: 'hopper',  c1: '#5a8a3a', c2: '#2a4a18', c3: '#c8e070', eye: '#ffe040', name: 'Sapo de las esporas' },
  20: { body: 'imp',     c1: '#b02838', c2: '#4a0810', c3: '#ffd040', eye: '#ffe080', extra: 'crown', name: 'Diablillo carmesí' },
  21: { body: 'quad',    c1: '#8a1828', c2: '#3a0610', c3: '#ffd040', eye: '#ffe080', ears: 'pointy', tail: 'thin', extra: 'collar', name: 'Sabueso del trono' },
  22: { body: 'wisp',    fly: true, name: 'Espíritu estelar' },
  23: { body: 'ghost',   c1: '#c8a0ff', c2: '#6a3aaa', c3: '#ffffff', eye: '#2a0a4a', extra: 'shards', fly: true, name: 'Espectro fracturado' },
  3:  { body: 'bat',     c1: '#6a3aaa', c2: '#2a0a4a', c3: '#ffd0ff', eye: '#ffb0ff', extra: 'stars', fly: true, name: 'Murciélago cósmico' },
  24: { body: 'golem',   c1: '#4a4448', c2: '#1a1418', c3: '#ff8a30', eye: '#ffb040', extra: 'embers', name: 'Gólem de la forja' },
  25: { body: 'armor',   name: 'Yelmo saltarín' },
  26: { body: 'spider',  c1: '#2a2228', c2: '#0a0608', c3: '#c03030', eye: '#ff3030', name: 'Araña del puente' },
  27: { body: 'rat',     name: 'Rata del patio' },
  6:  { body: 'bat',     c1: '#5a4038', c2: '#20140e', c3: '#c8a080', eye: '#ffd040', fly: true, name: 'Murciélago del castillo' },
  28: { body: 'golem',   c1: '#c8d0e0', c2: '#6a7488', c3: '#ffffff', eye: '#60a0ff', extra: 'snow', name: 'Gólem de nieve' },
  29: { body: 'quad',    c1: '#e8eef8', c2: '#9aa4b8', c3: '#ff9a40', eye: '#1a1a2a', ears: 'pointy', tail: 'bushy', name: 'Zorro ártico' },
  8:  { body: 'snail',   c1: '#a8c8e8', c2: '#4a6a8a', c3: '#e8f4ff', eye: '#1a2a3a', extra: 'snow', speed: 0.6, name: 'Caracol helado' },
  30: { body: 'quad',    c1: '#f4f6fc', c2: '#b0b8c8', c3: '#ffb0c0', eye: '#2a1a2a', ears: 'long', tail: 'puff', name: 'Liebre de las nieves' },
  31: { body: 'spider',  c1: '#a8d8ff', c2: '#3a6a9a', c3: '#ffffff', eye: '#1a3a6a', extra: 'snow', name: 'Araña de hielo' },
  9:  { body: 'ghost',   c1: '#e8f0ff', c2: '#8a9ab8', c3: '#ffffff', eye: '#3a4a6a', fly: true, name: 'Espectro de la ventisca' },
  32: { body: 'bat',     c1: '#9ab0d0', c2: '#3a4a6a', c3: '#e0f0ff', eye: '#ffffff', extra: 'wind', fly: true, name: 'Murciélago del viento' },
  33: { body: 'slime',   c1: '#a0e8ff', c2: '#3a8ab8', c3: '#ffffff', eye: '#0a2a4a', extra: 'ice', name: 'Babosa de hielo' },
  10: { body: 'imp',     c1: '#1a1a24', c2: '#06060a', c3: '#4a4a5a', eye: '#ffe040', name: 'Diablillo sin luna' },
  34: { body: 'crawler', c1: '#2a2a34', c2: '#0a0a10', c3: '#6a6a80', eye: '#c0c0ff', name: 'Gusano de obsidiana' },
  35: { body: 'hopper',  c1: '#a0b8d0', c2: '#4a5a70', c3: '#e8f0ff', eye: '#ff8040', extra: 'snow', name: 'Sapo escarchado' },
  11: { body: 'quad',    c1: '#8a909c', c2: '#3a3e48', c3: '#d8dce4', eye: '#80d0ff', ears: 'pointy', tail: 'bushy', name: 'Lobo de la cima' },
  36: { body: 'spider',  c1: '#ff8a30', c2: '#7a1a08', c3: '#ffe080', eye: '#ffffff', extra: 'embers', name: 'Araña de metal al rojo' },
  37: { body: 'slime',   c1: '#ff7a20', c2: '#8a1a04', c3: '#ffe090', eye: '#2a0804', extra: 'embers', name: 'Babosa de magma' },
  44: { body: 'bat',     c1: '#5a5a7a', c2: '#22223a', c3: '#c0c0e0', eye: '#ff6060', spikes: true, name: 'Murciélago de púas' },
  38: { body: 'imp',     c1: '#e8e0cc', c2: '#8a8070', c3: '#3a3428', eye: '#60ffb0', extra: 'skull', name: 'Esqueleto de las ruinas' },
};

// Adornos comunes
function critterEyes(x, y, r, color, look = 1) {
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(x + look * r * 0.3, y, r * 0.6, 0, Math.PI * 2); ctx.fill();
}
function glowEyes(pts, color) {
  ctx.save(); ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 6;
  for (const [x, y, r] of pts) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}
function critterExtra(S, x, y, w, t) {
  if (S.extra === 'crown') {
    ctx.fillStyle = '#ffd040';
    ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.lineTo(x - 6, y - 6); ctx.lineTo(x - 3, y - 3); ctx.lineTo(x, y - 8);
    ctx.lineTo(x + 3, y - 3); ctx.lineTo(x + 6, y - 6); ctx.lineTo(x + 6, y); ctx.closePath(); ctx.fill();
  }
  if (S.extra === 'crystal') {
    for (const [ox, h, a] of [[-w * 0.4, 9, -0.4], [0, 13, 0], [w * 0.4, 8, 0.4]]) {
      ctx.save(); ctx.translate(x + ox, y); ctx.rotate(a);
      ctx.fillStyle = S.c3; ctx.beginPath(); ctx.moveTo(-2.5, 0); ctx.lineTo(0, -h); ctx.lineTo(2.5, 0); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
  }
  if (S.extra === 'snow') {
    ctx.fillStyle = '#f2f6ff';
    ctx.beginPath(); ctx.ellipse(x, y + 1, w * 0.55, 3.2, 0, Math.PI, 0); ctx.fill();
  }
  if (S.extra === 'embers') {
    for (let i = 0; i < 3; i++) {
      const k = (t * 0.8 + i / 3) % 1;
      ctx.fillStyle = `rgba(255,${190 - i * 40},60,${(1 - k).toFixed(2)})`;
      ctx.beginPath(); ctx.arc(x - 5 + i * 5 + Math.sin(k * 9 + i) * 3, y - k * 18, 1.3, 0, Math.PI * 2); ctx.fill();
    }
  }
  if (S.extra === 'skull') {
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath(); ctx.moveTo(x - 1, y + 3); ctx.lineTo(x + 1, y + 3); ctx.lineTo(x, y + 6); ctx.closePath(); ctx.fill();
  }
}

// ── Cuerpos (origen en los pies, mirando a la derecha) ───────────────────────
const CRITTER_BODY = {
  imp(S, t, walk) {
    const step = Math.sin(t * 8) * walk;
    ctx.strokeStyle = S.c2; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-3, -8); ctx.lineTo(-4 + step * 3, 0); ctx.moveTo(3, -8); ctx.lineTo(4 - step * 3, 0); ctx.stroke();
    // cola
    ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-6, -10); ctx.quadraticCurveTo(-14, -10, -13, -18 + step * 2); ctx.stroke();
    ctx.fillStyle = S.c2; ctx.beginPath(); ctx.moveTo(-13, -21 + step * 2); ctx.lineTo(-10, -17); ctx.lineTo(-15, -16); ctx.closePath(); ctx.fill();
    ctx.fillStyle = vol(0, -14, 9, S.c1, S.c2);
    ctx.beginPath(); ctx.ellipse(0, -13, 7, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(1, -24, 8, 0, Math.PI * 2); ctx.fill();
    // cuernos
    ctx.fillStyle = S.c3;
    ctx.beginPath(); ctx.moveTo(-5, -29); ctx.quadraticCurveTo(-9, -36, -6, -38); ctx.lineTo(-2, -31); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(5, -30); ctx.quadraticCurveTo(7, -37, 10, -38); ctx.lineTo(8, -29); ctx.closePath(); ctx.fill();
    glowEyes([[4, -25, 1.8], [-0.5, -25, 1.5]], S.eye);
    ctx.strokeStyle = S.c2; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(1, -20.5); ctx.quadraticCurveTo(4, -19, 7, -21); ctx.stroke();
    critterExtra(S, 1, -31, 10, t);
  },
  golem(S, t, walk) {
    const step = Math.sin(t * 5) * walk;
    ctx.fillStyle = S.c2; ctx.fillRect(-9, -7 + step, 7, 7 - step); ctx.fillRect(2, -7 - step, 7, 7 + step);
    ctx.fillStyle = vol(-2, -16, 14, S.c1, S.c2);
    ctx.beginPath(); ctx.roundRect(-12, -26, 24, 20, 5); ctx.fill();
    ctx.beginPath(); ctx.roundRect(-7, -35, 15, 11, 4); ctx.fill();
    ctx.fillStyle = S.c2; ctx.beginPath(); ctx.roundRect(-16, -24 - step, 6, 13, 3); ctx.roundRect(10, -24 + step, 6, 13, 3); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-4, -24); ctx.lineTo(-1, -17); ctx.lineTo(-5, -11); ctx.stroke();
    ctx.save(); ctx.fillStyle = S.c3; ctx.shadowColor = S.c3; ctx.shadowBlur = 8; ctx.globalAlpha = 0.5 + 0.3 * Math.sin(t * 3);
    ctx.beginPath(); ctx.arc(3, -17, 2.5, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    glowEyes([[4, -30, 1.6], [0, -30, 1.4]], S.eye);
    critterExtra(S, 0, -35, 16, t);
  },
  bat(S, t) {
    const fl = Math.sin(t * 9) * 0.7;
    for (const s of [-1, 1]) {
      ctx.save(); ctx.scale(s, 1); ctx.rotate(fl);
      ctx.fillStyle = S.c2;
      ctx.beginPath(); ctx.moveTo(2, -14); ctx.quadraticCurveTo(12, -26, 20, -16); ctx.quadraticCurveTo(15, -14, 16, -9);
      ctx.quadraticCurveTo(10, -12, 8, -7); ctx.quadraticCurveTo(5, -10, 2, -9); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = vol(0, -14, 8, S.c1, S.c2);
    ctx.beginPath(); ctx.ellipse(0, -12, 6, 7.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-5, -17); ctx.lineTo(-4, -25); ctx.lineTo(-1, -18); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(5, -17); ctx.lineTo(4, -25); ctx.lineTo(1, -18); ctx.closePath(); ctx.fill();
    glowEyes([[2.5, -14, 1.4], [-1.5, -14, 1.2]], S.eye);
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(1, -6.5); ctx.lineTo(2, -9); ctx.closePath(); ctx.fill();
    if (S.extra === 'echo' || S.extra === 'wind') {
      const k = (t * 0.6) % 1;
      ctx.strokeStyle = `rgba(${S.extra === 'echo' ? '160,160,255' : '230,240,255'},${(0.5 * (1 - k)).toFixed(2)})`; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(6, -13, 6 + k * 14, -0.6, 0.6); ctx.stroke();
    }
    if (S.extra === 'stars') {
      ctx.fillStyle = `rgba(255,220,255,${(0.5 + 0.5 * Math.sin(t * 4)).toFixed(2)})`;
      for (const [x, y] of [[-12, -20], [13, -21], [-3, -2]]) ctx.fillRect(x, y, 1.6, 1.6);
    }
  },
  spider(S, t, walk) {
    const ph = t * 10 * (walk ? 1 : 0.2);
    ctx.strokeStyle = S.c2; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) for (const s of [-1, 1]) {
      const sw = Math.sin(ph + i * 1.5 + (s > 0 ? Math.PI : 0)) * 2.5;
      const bx = -3 + i * 3;
      ctx.beginPath(); ctx.moveTo(bx, -9);
      ctx.lineTo(bx + s * (6 + i * 1.5) + sw, -15 + i * 0.5); ctx.lineTo(bx + s * (10 + i * 2) + sw, 0); ctx.stroke();
    }
    ctx.fillStyle = vol(-5, -11, 9, S.c1, S.c2);
    ctx.beginPath(); ctx.ellipse(-5, -10, 8, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = vol(5, -9, 5, S.c1, S.c2);
    ctx.beginPath(); ctx.arc(5, -9, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = S.c3; ctx.beginPath(); ctx.ellipse(-6, -13, 3, 2, 0, 0, Math.PI * 2); ctx.fill();
    glowEyes([[7, -11, 1.2], [8.5, -8.5, 1], [5.5, -12, 0.9], [9, -11, 0.8]], S.eye);
    critterExtra(S, -5, -16, 14, t);
  },
  slime(S, t) {
    const hop = Math.abs(Math.sin(t * 4)), sq = 1 + (1 - hop) * 0.25;
    if (S.extra === 'glow' || S.extra === 'embers') {
      const g = ctx.createRadialGradient(0, -10, 0, 0, -10, 28);
      g.addColorStop(0, hexAlpha(S.c1, 0.35)); g.addColorStop(1, hexAlpha(S.c1, 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -10, 28, 0, Math.PI * 2); ctx.fill();
    }
    ctx.save(); ctx.translate(0, -hop * 8); ctx.scale(sq, 1 / sq);
    ctx.fillStyle = vol(-3, -12, 13, S.c1, S.c2);
    ctx.globalAlpha = S.extra === 'ice' ? 0.85 : 0.92;
    ctx.beginPath(); ctx.moveTo(-12, 0); ctx.quadraticCurveTo(-13, -18, 0, -19); ctx.quadraticCurveTo(13, -18, 12, 0); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.ellipse(-5, -13, 3, 2, -0.4, 0, Math.PI * 2); ctx.fill();
    critterEyes(3, -9, 2.6, S.eye); critterEyes(-2.5, -9, 2.2, S.eye);
    ctx.restore();
    critterExtra(S, 0, -20 - hop * 8, 18, t);
  },
  crawler(S, t, walk) {
    const n = 5;
    for (let i = n - 1; i >= 0; i--) {
      const x = -14 + i * 6, y = -6 - Math.abs(Math.sin(t * 6 * (walk || 0.3) - i * 0.8)) * 3;
      ctx.fillStyle = vol(x, y - 2, 6, i === n - 1 ? S.c1 : (i % 2 ? S.c1 : S.c3), S.c2);
      ctx.beginPath(); ctx.arc(x, y, i === n - 1 ? 6.5 : 5.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = S.c2; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(x, y + 4); ctx.lineTo(x + Math.sin(t * 8 + i) * 2, 0); ctx.stroke();
    }
    glowEyes([[13, -9, 1.5], [9.5, -10, 1.3]], S.eye);
    ctx.strokeStyle = S.c2; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(11, -13); ctx.quadraticCurveTo(14, -19, 17, -18); ctx.stroke();
  },
  hopper(S, t) {
    const k = (t * 1.4) % 1, hop = k < 0.4 ? Math.sin(k / 0.4 * Math.PI) * 12 : 0;
    ctx.save(); ctx.translate(0, -hop);
    ctx.fillStyle = S.c2;
    ctx.beginPath(); ctx.ellipse(-8, -2, 6, 3, 0.3, 0, Math.PI * 2); ctx.ellipse(8, -2, 6, 3, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = vol(-2, -10, 13, S.c1, S.c2);
    ctx.beginPath(); ctx.ellipse(0, -9, 12, 8.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = S.c3; ctx.beginPath(); ctx.ellipse(2, -6, 7, 3.5, 0, 0, Math.PI); ctx.fill();
    ctx.fillStyle = vol(0, -17, 4, S.c1, S.c2);
    ctx.beginPath(); ctx.arc(6, -16, 4, 0, Math.PI * 2); ctx.arc(-2, -16, 3.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = S.eye; ctx.beginPath(); ctx.arc(7, -16.5, 2.2, 0, Math.PI * 2); ctx.arc(-1.5, -16.5, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0a0a0a'; ctx.fillRect(6.3, -18, 1.4, 3); ctx.fillRect(-2.2, -18, 1.4, 3);
    ctx.strokeStyle = S.c2; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(4, -9); ctx.quadraticCurveTo(9, -7, 12, -10); ctx.stroke();
    ctx.restore();
    critterExtra(S, 1, -18 - hop, 16, t);
  },
  snail(S, t) {
    const str = Math.sin(t * 3) * 1.5;
    ctx.fillStyle = vol(4, -4, 10, S.c3, S.c1);
    ctx.beginPath(); ctx.moveTo(-12, 0); ctx.quadraticCurveTo(4, -2, 14 + str, -2); ctx.quadraticCurveTo(16 + str, -8, 11 + str, -9);
    ctx.lineTo(-10, -4); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = S.c1; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(11 + str, -8); ctx.lineTo(14 + str, -17); ctx.moveTo(9 + str, -8); ctx.lineTo(10 + str, -16); ctx.stroke();
    ctx.fillStyle = S.eye; ctx.beginPath(); ctx.arc(14 + str, -17.5, 1.6, 0, Math.PI * 2); ctx.arc(10 + str, -16.5, 1.4, 0, Math.PI * 2); ctx.fill();
    // concha en espiral
    ctx.fillStyle = vol(-4, -14, 11, S.c3, S.c2);
    ctx.beginPath(); ctx.arc(-3, -11, 10, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = S.c2; ctx.lineWidth = 1.5;
    ctx.beginPath(); for (let a = 0; a < 10; a += 0.3) { const r = 9 - a * 0.85; const x = -3 + Math.cos(a) * r, y = -11 + Math.sin(a) * r; a ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
    critterExtra(S, -3, -20, 14, t);
  },
  ghost(S, t) {
    ctx.save(); ctx.globalAlpha = 0.85;
    const g = ctx.createLinearGradient(0, -30, 0, 0);
    g.addColorStop(0, S.c1); g.addColorStop(1, hexAlpha(S.c2, 0.2));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(-11, 0); ctx.lineTo(-11, -16); ctx.arc(0, -16, 11, Math.PI, 0); ctx.lineTo(11, 0);
    for (let i = 0; i < 4; i++) ctx.quadraticCurveTo(11 - i * 5.5 - 2.75, -5 + Math.sin(t * 6 + i) * 3, 11 - (i + 1) * 5.5, 0);
    ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.fillStyle = S.eye;
    ctx.beginPath(); ctx.ellipse(4, -18, 2.2, 3.2, 0, 0, Math.PI * 2); ctx.ellipse(-2, -18, 2, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(1, -11, 2.5, 1.8, 0, 0, Math.PI * 2); ctx.fill();
    if (S.extra === 'shards') {
      for (let i = 0; i < 3; i++) {
        const a = t * 1.5 + i * 2.1;
        ctx.fillStyle = S.c3;
        ctx.save(); ctx.translate(Math.cos(a) * 16, -14 + Math.sin(a) * 8); ctx.rotate(a);
        ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(2, 0); ctx.lineTo(0, 4); ctx.lineTo(-2, 0); ctx.closePath(); ctx.fill(); ctx.restore();
      }
    }
  },
  quad(S, t, walk) {
    const ph = t * 10 * (walk ? 1 : 0.15), legs = [[-8, 0], [-4, Math.PI], [5, Math.PI], [9, 0]];
    ctx.strokeStyle = S.c2; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
    for (const [x, o] of legs) { ctx.beginPath(); ctx.moveTo(x, -8); ctx.lineTo(x + Math.sin(ph + o) * 3, 0); ctx.stroke(); }
    // cola
    if (S.tail === 'bushy') { ctx.fillStyle = S.c1; ctx.beginPath(); ctx.ellipse(-15, -13, 7, 4, -0.6, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = S.c3; ctx.beginPath(); ctx.arc(-19, -16, 2.5, 0, Math.PI * 2); ctx.fill(); }
    else if (S.tail === 'puff') { ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(-13, -12, 3.5, 0, Math.PI * 2); ctx.fill(); }
    else { ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-11, -12); ctx.quadraticCurveTo(-18, -14, -19, -20); ctx.stroke(); }
    ctx.fillStyle = vol(0, -13, 12, S.c1, S.c2);
    ctx.beginPath(); ctx.ellipse(0, -11, 12, 5.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(12, -15, 6, 5, -0.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(15, -15); ctx.lineTo(21, -13); ctx.lineTo(15, -11); ctx.closePath(); ctx.fill();
    ctx.fillStyle = S.c2; ctx.beginPath(); ctx.arc(21, -13, 1.2, 0, Math.PI * 2); ctx.fill();
    // orejas
    ctx.fillStyle = S.c1;
    if (S.ears === 'long') {
      ctx.beginPath(); ctx.ellipse(10, -26, 2.2, 7, -0.2, 0, Math.PI * 2); ctx.ellipse(13, -26, 2.2, 7, 0.15, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = S.c3; ctx.beginPath(); ctx.ellipse(13, -26, 1, 5, 0.15, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.beginPath(); ctx.moveTo(9, -19); ctx.lineTo(10, -26); ctx.lineTo(13, -19); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(12, -19); ctx.lineTo(14, -25); ctx.lineTo(16, -18); ctx.closePath(); ctx.fill();
    }
    glowEyes([[15, -16, 1.4]], S.eye);
    if (S.extra === 'collar') { ctx.fillStyle = S.c3; ctx.fillRect(7, -14, 2.5, 6); }
  },
};

// Dibuja el bicho de la sala (con el brillo y la mecha si es de metal al rojo)
function drawCritter(e, cx, cy) {
  const S = e.spec, t = Date.now() * 0.003 + e.x * 0.01;
  if (THEMED_DRAW[S.body]) { THEMED_DRAW[S.body](e, cx, cy, Date.now() * 0.003); return; }
  const walk = (e.hot && e.fuse > 0) ? 0 : 1;
  ctx.save();
  const fy = cy + e.h / 2 - (S.fly ? 14 + Math.sin(t * 2.5) * 4 : 0);
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath(); ctx.ellipse(cx, cy + e.h / 2 + 1, 13, 3, 0, 0, Math.PI * 2); ctx.fill();
  if (e.hot) {
    const f = e.fuse > 0 ? 1 - e.fuse / HOT_FUSE : 0;
    const hg = ctx.createRadialGradient(cx, fy - 10, 0, cx, fy - 10, 30 + f * 20);
    hg.addColorStop(0, `rgba(255,120,30,${(0.3 + f * 0.4).toFixed(2)})`); hg.addColorStop(1, 'rgba(255,80,20,0)');
    ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(cx, fy - 10, 30 + f * 20, 0, Math.PI * 2); ctx.fill();
  }
  ctx.translate(cx, fy);
  let draw = S;
  if (e.hot && e.fuse > 0) {
    const f = 1 - e.fuse / HOT_FUSE;
    ctx.translate(Math.sin(e.fuse * 1.7) * 1.5 * f, 0);
    ctx.scale(1 + f * 0.3, 1 + f * 0.3);
    if (Math.floor(e.fuse / (e.fuse < 15 ? 2 : 5)) % 2 === 0) draw = { ...S, c1: '#ffffff', c2: '#ffb060', c3: '#fff0c0' };
  }
  ctx.scale(e.dir, 1);
  CRITTER_BODY[S.body](draw, t, walk);
  if (S.spikes) { // púas por debajo: solo se le puede caer encima
    ctx.fillStyle = S.c3;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath(); ctx.moveTo(i * 5 - 2.5, -2); ctx.lineTo(i * 5, 7); ctx.lineTo(i * 5 + 2.5, -2); ctx.closePath(); ctx.fill();
    }
  }
  ctx.restore();
}

function initEnemies(roomId) {
  const templates = ENEMY_TEMPLATES[roomId] || [];
  // De La Cumbre al Pico los bichos se esconden como piedras nevadas
  const rock = ROCK_ZONES.includes(zoneOf(roomId));
  // En la zona de los guardias son de metal al rojo y explotan si te acercas mucho
  const hot = HOT_ZONES.includes(zoneOf(roomId));
  const kind = rock ? 'rock' : hot ? 'hot' : (ZONE_ENEMY[zoneOf(roomId)] || 'beetle');
  const spec = ROOM_CRITTER[roomId] || null; // cada sala tiene su propio bicho
  const mult = spec ? (spec.speed || KIND_SPEED[spec.body] || 1) : (KIND_SPEED[kind] || 1);
  currentEnemies = templates.map(t => ({ ...t, w: 28, h: 24, vy: 0, dead: false, deathTimer: 0,
    speed: t.speed * mult, kind, spec,
    rock, awake: !rock, wake: 0, hot, fuse: 0, exploded: false }));
}

const ROCK_ZONES = [7, 8, 9, 10, 11];
const HOT_ZONES = [13];
const HOT_FUSE = 45, HOT_TRIGGER = 64, HOT_BLAST = 88;
function explodeEnemy(e) {
  e.dead = true; e.exploded = true; e.deathTimer = 34;
  shake(12, 4);
  const pcx = player.x + player.w / 2, pcy = player.y + player.h / 2;
  const ex = e.x + e.w / 2, ey = e.y + e.h / 2;
  if (Math.hypot(pcx - ex, pcy - ey) < HOT_BLAST && player.invFrames === 0) {
    if (!godMode) {
      player.hp--;
      if (player.hp <= 0) { player.hp = 0; isDeath = true; startTransition(0, 80, 400); return; }
    }
    player.invFrames = 90; player.knockbackTimer = 14;
    player.vx = (pcx < ex ? -1 : 1) * 8; player.vy = -9;
  }
}
const ROCK_WAKE_DIST = 150;
function updateEnemies() {
  for (const e of currentEnemies) {
    if (e.dead) { if (e.deathTimer > 0) e.deathTimer--; continue; }
    if (!e.awake) {
      // piedra quieta hasta que te acercas: entonces se sacude la nieve
      const d = Math.hypot(player.x + player.w / 2 - (e.x + e.w / 2), player.y + player.h / 2 - (e.y + e.h / 2));
      if (d < ROCK_WAKE_DIST) {
        e.awake = true; e.wake = 30;
        e.dir = player.x + player.w / 2 < e.x + e.w / 2 ? -1 : 1;
      }
      continue;
    }
    if (e.wake > 0) { e.wake--; continue; }
    if (e.hot) {
      // mecha: se para, se hincha y parpadea… y explota
      if (e.fuse > 0) { if (--e.fuse === 0) explodeEnemy(e); continue; }
      const d = Math.hypot(player.x + player.w / 2 - (e.x + e.w / 2), player.y + player.h / 2 - (e.y + e.h / 2));
      if (d < HOT_TRIGGER) { e.fuse = HOT_FUSE; continue; }
    }
    e.x += e.dir * e.speed;
    if (e.x <= e.patrolMin)       { e.x = e.patrolMin; e.dir =  1; }
    if (e.x + e.w >= e.patrolMax) { e.x = e.patrolMax - e.w; e.dir = -1; }
  }
}

function checkEnemyCollisions() {
  // Hitbox de ataque del jugador
  const atkW = 52, atkH = 30;
  const atkX = player.facing === 1 ? player.x + player.w : player.x - atkW;
  const atkY = player.y + 6;

  for (const e of currentEnemies) {
    if (e.dead) continue;

    // Ataque del jugador golpea al enemigo
    if (player.attackActive > 0 && !e.bouncy &&
        collideRect(atkX, atkY, atkW, atkH, e.x, e.y, e.w, e.h)) {
      e.dead = true;
      e.deathTimer = 22;
      addMoney(MONEY_ENEMY, e.x + e.w / 2, e.y);
      // Rebote ligero al golpear
      if (player.knockbackTimer === 0) { player.vy = Math.min(player.vy, -4); }
      continue;
    }

    // Stomp (caer encima mata al enemigo)
    const stompOverlap = collideRect(player.x, player.y, player.w, player.h, e.x, e.y, e.w, e.h);
    const fromAbove    = player.vy > 1 && (player.y + player.h) < (e.y + e.h * 0.6);
    // (al murciélago de púas también se le pisa si en el cuadro anterior venías de arriba)
    const cameFromAbove = player.vy > 1 && player.y + player.h - player.vy <= e.y + e.h * 0.6;
    if (stompOverlap && cameFromAbove && e.bouncy) {
      // murciélago de púas: no se muere, te hace rebotar (más alto si mantienes el salto)
      player.vy = jumpHeld() ? JUMP_V : -9;
      player.y = e.y - player.h; // queda encima: el rebote no pica
      player.usedDouble = false;
      continue;
    }
    if (stompOverlap && fromAbove) {
      e.dead = true;
      e.deathTimer = 22;
      addMoney(MONEY_ENEMY, e.x + e.w / 2, e.y);
      player.vy = -11;
      continue;
    }

    // Contacto lateral/desde abajo → daño al jugador (una piedra dormida no hace daño)
    if (player.invFrames === 0 && e.awake && e.wake === 0 && !e.fuse &&
        collideRect(player.x + 3, player.y + 3, player.w - 6, player.h - 3, e.x, e.y, e.w, e.h)) {
      if (!godMode) {
        player.hp--;
        if (player.hp <= 0) {
          player.hp = 0;
          isDeath = true;
          startTransition(0, 80, 400);
          return;
        }
      }
      player.invFrames = 90;
      player.knockbackTimer = 14;
      const dir = player.x + player.w / 2 < e.x + e.w / 2 ? -1 : 1;
      player.vx = dir * 6;
      player.vy = -7;
    }
  }
}

// Bicho escondido: una piedra con nieve encima; al despertar tiembla y suelta nieve
function drawSnowRock(e, cx, cy) {
  const k = e.wake > 0 ? e.wake / 30 : 0;
  const shakeX = e.wake > 0 ? Math.sin(e.wake * 2.3) * 2.5 : 0;
  const by = cy + e.h / 2;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(cx, by + 1, 16, 3.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.translate(cx + shakeX, by);
  ctx.fillStyle = vol(-3, -10, 15, '#8a90a0', '#3a3e4a');
  ctx.beginPath(); ctx.moveTo(-16, 0); ctx.quadraticCurveTo(-17, -12, -7, -17);
  ctx.quadraticCurveTo(4, -21, 12, -13); ctx.quadraticCurveTo(17, -6, 16, 0); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-4, -16); ctx.lineTo(-1, -9); ctx.lineTo(-5, -4); ctx.stroke();
  // capa de nieve (se va cayendo al despertar)
  ctx.globalAlpha = e.wake > 0 ? k : 1;
  ctx.fillStyle = '#eef2fc';
  ctx.beginPath(); ctx.moveTo(-14, -9); ctx.quadraticCurveTo(-12, -17, -5, -18.5);
  ctx.quadraticCurveTo(5, -21.5, 12, -13); ctx.quadraticCurveTo(6, -12, 1, -13);
  ctx.quadraticCurveTo(-6, -11, -14, -9); ctx.closePath(); ctx.fill();
  ctx.globalAlpha = 1;
  if (e.wake > 0) {
    // copos que salen disparados y ojos que se abren
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI * (0.15 + i * 0.14), d = (1 - k) * 22;
      ctx.globalAlpha = k;
      ctx.beginPath(); ctx.arc(Math.cos(a) * d, -14 + Math.sin(a) * d, 1.6, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1 - k;
    ctx.fillStyle = '#ff4040';
    ctx.beginPath(); ctx.arc(e.dir * 9, -7, 1.6, 0, Math.PI * 2); ctx.arc(e.dir * 5, -8, 1.4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawEnemy(e) {
  const cx = Math.round(e.x + e.w / 2);
  const cy = Math.round(e.y + e.h / 2);

  // Animación de muerte: anillo de humo, nubecitas y chispas
  if (e.dead && e.exploded) {
    if (e.deathTimer <= 0) return;
    const k = e.deathTimer / 34, p = 1 - k;
    ctx.save();
    const r = 18 + p * (HOT_BLAST - 10);
    const fg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    fg.addColorStop(0, `rgba(255,250,210,${k.toFixed(2)})`);
    fg.addColorStop(0.4, `rgba(255,160,40,${(0.85 * k).toFixed(2)})`);
    fg.addColorStop(1, 'rgba(200,40,10,0)');
    ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = `rgba(255,200,120,${(0.7 * k).toFixed(2)})`; ctx.lineWidth = 3 * k + 1;
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.95, 0, Math.PI * 2); ctx.stroke();
    // trozos de metal incandescente
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + 0.3, d = p * 60;
      ctx.fillStyle = i % 2 ? '#ffb040' : '#ff5020';
      ctx.globalAlpha = k;
      ctx.beginPath(); ctx.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d - p * 10 + p * p * 30, 2.6 * k + 0.8, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    return;
  }
  if (e.dead) {
    if (e.deathTimer <= 0) return;
    const k = e.deathTimer / 22, p = 1 - k;
    ctx.save();
    ctx.globalAlpha = k * 0.7;
    ctx.strokeStyle = '#c090ff'; ctx.lineWidth = 3 * k + 0.5;
    ctx.beginPath(); ctx.arc(cx, cy, 6 + p * 26, 0, Math.PI * 2); ctx.stroke();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.4;
      const d = p * 20;
      const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d - p * 6;
      ctx.globalAlpha = k * 0.55;
      ctx.fillStyle = vol(x, y, 7 * k + 2, '#f0e6ff', '#8a70b0');
      ctx.beginPath(); ctx.arc(x, y, 7 * k + 2, 0, Math.PI * 2); ctx.fill();
    }
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const d = p * 32;
      ctx.globalAlpha = k;
      ctx.fillStyle = i % 2 === 0 ? '#d070ff' : '#ff8050';
      ctx.beginPath(); ctx.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 2.4 * k + 0.6, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    return;
  }

  if (e.rock && (!e.awake || e.wake > 0)) { drawSnowRock(e, cx, cy); return; }
  if (e.spec) { drawCritter(e, cx, cy); return; }
  if (THEMED_DRAW[e.kind]) { THEMED_DRAW[e.kind](e, cx, cy, Date.now() * 0.003); return; }

  const t = Date.now() * 0.003;
  const ph = t * 7 + e.x * 0.05;                 // fase del paso
  const bounce = Math.abs(Math.sin(ph)) * 1.2;
  ctx.save();

  // Sombra (se encoge un poco al rebotar)
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath(); ctx.ellipse(cx, cy + e.h / 2 + 2, e.w * 0.45 - bounce, 3, 0, 0, Math.PI * 2); ctx.fill();

  if (e.hot) {
    const f = e.fuse > 0 ? 1 - e.fuse / HOT_FUSE : 0;
    const hg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30 + f * 20);
    hg.addColorStop(0, `rgba(255,120,30,${(0.3 + f * 0.4).toFixed(2)})`); hg.addColorStop(1, 'rgba(255,80,20,0)');
    ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(cx, cy, 30 + f * 20, 0, Math.PI * 2); ctx.fill();
    // chispas que suben
    for (let i = 0; i < 3; i++) {
      const k = (t * 0.8 + i / 3 + e.x * 0.01) % 1;
      ctx.fillStyle = `rgba(255,${180 - i * 40},60,${(1 - k).toFixed(2)})`;
      ctx.beginPath(); ctx.arc(cx - 6 + i * 6 + Math.sin(k * 9 + i) * 3, cy - 8 - k * 22, 1.3, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.translate(cx, cy - bounce);
  if (e.hot && e.fuse > 0) {
    const f = 1 - e.fuse / HOT_FUSE;
    ctx.translate(Math.sin(e.fuse * 1.7) * 1.5 * f, 0);
    ctx.scale(1 + f * 0.3, 1 + f * 0.3);
  }
  ctx.scale(e.dir, 1);

  // Patas: tres por lado, caminan en trípode (como los insectos de verdad)
  const leg = (bx, by, side, phase, far) => {
    const lift = Math.max(0, Math.sin(phase)) * 3;
    const swing = Math.cos(phase) * 3.5;
    const kx = bx + swing * 0.5, ky = by + 4 - lift * 0.5;
    const fx = bx + swing, fy = 12 + bounce - lift;
    ctx.strokeStyle = far ? '#1a0a2a' : '#3a1a58';
    ctx.lineWidth = far ? 1.6 : 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(kx + side * 2, ky); ctx.lineTo(fx + side * 3, fy); ctx.stroke();
    ctx.fillStyle = far ? '#1a0a2a' : '#5a2a80';
    ctx.beginPath(); ctx.arc(fx + side * 3, fy, 1.1, 0, Math.PI * 2); ctx.fill();
  };
  const legX = [-7, -1, 5];
  legX.forEach((lx, i) => leg(lx, 3, i - 1, ph + (i % 2 ? Math.PI : 0) + Math.PI, true)); // lado lejano

  // Abdomen por debajo
  ctx.fillStyle = '#12061e';
  ctx.beginPath(); ctx.ellipse(-2, 4, 12, 4.5, 0, 0, Math.PI * 2); ctx.fill();

  // Élitros (caparazón) con brillo tornasolado
  const shell = ctx.createLinearGradient(-14, -11, 6, 6);
  const blink = e.hot && e.fuse > 0 && Math.floor(e.fuse / (e.fuse < 15 ? 2 : 5)) % 2 === 0;
  const stops = blink ? ['#ffffff', '#fff0c0', '#ffd080', '#ff9040', '#ff5020']   // a punto de explotar
    : e.hot  ? ['#ffe080', '#ff8a30', '#d04010', '#7a1a08', '#2a0804']   // metal al rojo
    : e.rock ? ['#a8aebc', '#767c8c', '#5e6a80', '#4a505e', '#2a2e38']   // caparazón de piedra
    : BEETLE_STOPS[e.kind] || ['#7a3ab0', '#4a1c78', '#2c6a8a', '#3a1460', '#1a0830']; // tornasolado
  [0, 0.35, 0.55, 0.7, 1].forEach((o, i) => shell.addColorStop(o, stops[i]));
  ctx.fillStyle = shell;
  ctx.beginPath();
  ctx.moveTo(-14, 4);
  ctx.bezierCurveTo(-15, -6, -8, -12, 0, -11);
  ctx.bezierCurveTo(5, -10.5, 7, -6, 7, 2);
  ctx.quadraticCurveTo(-3, 6.5, -14, 4);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(10,0,20,0.7)'; ctx.lineWidth = 1; ctx.stroke();
  // línea donde se juntan las dos alas
  ctx.strokeStyle = 'rgba(10,0,25,0.65)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(6.5, -5); ctx.bezierCurveTo(2, -9.5, -8, -9.5, -13.5, 1); ctx.stroke();
  // estrías y manchas
  ctx.strokeStyle = 'rgba(200,150,255,0.18)'; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(4, -2); ctx.bezierCurveTo(0, -6, -7, -6, -11, 2); ctx.stroke();
  ctx.fillStyle = 'rgba(20,0,40,0.45)';
  for (const [sx, sy, sr] of [[-8, -4, 1.6], [-3, -6.5, 1.3], [-10, 0.5, 1.2]]) {
    ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill();
  }
  // brillo especular que se mueve un poco
  const sh = Math.sin(t * 1.3 + e.x) * 1.5;
  ctx.fillStyle = 'rgba(255,255,255,0.32)';
  ctx.beginPath(); ctx.ellipse(-5 + sh, -8.5, 5, 1.6, -0.25, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.beginPath(); ctx.arc(-7 + sh, -8.5, 0.9, 0, Math.PI * 2); ctx.fill();
  if (e.rock) {
    // nieve que le queda encima del caparazón
    ctx.fillStyle = '#eef2fc';
    ctx.beginPath(); ctx.moveTo(-12, -4); ctx.quadraticCurveTo(-9, -12.5, -1, -11.5);
    ctx.quadraticCurveTo(4, -11, 5, -7); ctx.quadraticCurveTo(0, -8, -4, -6.5);
    ctx.quadraticCurveTo(-8, -6, -12, -4); ctx.closePath(); ctx.fill();
  }
  drawBeetleExtras(e, t);

  // Tórax (pronoto)
  ctx.fillStyle = vol(8.5, -2, 5, '#5a2a88', '#160828');
  ctx.beginPath(); ctx.ellipse(8.5, -1.5, 4.5, 5.5, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(10,0,20,0.7)'; ctx.lineWidth = 0.8; ctx.stroke();

  // Cabeza
  ctx.fillStyle = vol(13, 0, 4.5, '#3a1a58', '#0a0414');
  ctx.beginPath(); ctx.ellipse(13, 0.5, 4.2, 4, 0, 0, Math.PI * 2); ctx.fill();

  // Mandíbulas que se abren y se cierran
  const open = (Math.sin(t * 5 + e.x) + 1) * 0.5;
  ctx.fillStyle = '#6a3a3a';
  ctx.save(); ctx.translate(16, -0.5); ctx.rotate(-0.35 - open * 0.5);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(5, -1, 6, 2); ctx.quadraticCurveTo(3.5, 0.8, 0, 1.6); ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.save(); ctx.translate(16, 2); ctx.rotate(0.35 + open * 0.5);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(5, 1, 6, -2); ctx.quadraticCurveTo(3.5, -0.8, 0, -1.6); ctx.closePath(); ctx.fill();
  ctx.restore();

  drawBeetleCrown(e);

  // Ojos compuestos rojos (parpadean)
  const eyes = [[14.2, -1.5, 2.6], [11.6, -2.4, 1.9]];  // cercano y lejano
  for (const [ex, ey, er] of eyes) {
    const glow = ctx.createRadialGradient(ex, ey, 0, ex, ey, er * 2.2);
    glow.addColorStop(0, 'rgba(255,70,70,0.5)'); glow.addColorStop(1, 'rgba(255,40,40,0)');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(ex, ey, er * 2.2, 0, Math.PI * 2); ctx.fill();
  }
  if (blinkNow(e.x * 0.37 + e.y)) {
    ctx.strokeStyle = '#ff3030'; ctx.lineWidth = 1.2;
    for (const [ex, ey, er] of eyes) { ctx.beginPath(); ctx.moveTo(ex - er, ey); ctx.lineTo(ex + er, ey); ctx.stroke(); }
  } else {
    for (const [ex, ey, er] of eyes) {
      ctx.fillStyle = vol(ex, ey, er, '#ff9090', '#a00000');
      ctx.beginPath(); ctx.arc(ex, ey, er, 0, Math.PI * 2); ctx.fill();
      // facetas
      ctx.fillStyle = 'rgba(80,0,0,0.45)';
      for (const [fx, fy] of [[0.8, 0.6], [-0.6, 0.8], [0.4, -0.8]]) {
        ctx.beginPath(); ctx.arc(ex + fx * er * 0.55, ey + fy * er * 0.55, er * 0.22, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#ffe0e0';
      ctx.beginPath(); ctx.arc(ex - er * 0.35, ey - er * 0.4, er * 0.3, 0, Math.PI * 2); ctx.fill();
    }
  }

  // Dos antenas con la punta en maza
  for (const [ax, sway, far] of [[12, 0, true], [14, 0.6, false]]) {
    const tipX = ax + 9, tipY = -12 + Math.sin(t * 4 + e.x + sway) * 1.6;
    ctx.strokeStyle = far ? '#2a1040' : '#4a2068'; ctx.lineWidth = 1.1; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(ax, -3);
    ctx.quadraticCurveTo(ax + 2, -10, tipX, tipY); ctx.stroke();
    ctx.fillStyle = far ? '#3a1858' : '#6a3098';
    ctx.beginPath(); ctx.ellipse(tipX + 0.5, tipY, 2.2, 1.4, -0.4, 0, Math.PI * 2); ctx.fill();
  }

  // Patas del lado cercano (delante del cuerpo)
  legX.forEach((lx, i) => leg(lx, 4, i - 1, ph + (i % 2 ? 0 : Math.PI), false));

  ctx.restore();
}

function drawEnemies() {
  for (const e of currentEnemies) drawEnemy(e);
}
