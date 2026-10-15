// ─── DECORACIÓN TEMÁTICA DE CADA SALA ────────────────────────────────────────
// Cosas que encajan con el nombre de la sala (se añaden a sus decoraciones).
const ROOM_THEME = {
  0:  [{ type:'brokenColumn', x:300, h:110 }, { type:'rubble', x:560 }, { type:'rubble', x:1450 },
       { type:'brokenColumn', x:2050, h:90, fy:-180 }, { type:'rubble', x:2250, fy:-180 }],
  14: [{ type:'rubble', x:250 }, { type:'rubble', x:520 }, { type:'rubble', x:1000 }, { type:'rubble', x:1400 },
       { type:'brokenColumn', x:380, h:70 }, { type:'brokenColumn', x:1100, h:130 }, { type:'rubble', x:900, fy:120 },
       { type:'brokenColumn', x:1650, h:80, fy:120 }, { type:'fallingDust' }],
  15: [{ type:'statue', x:620 }, { type:'statue', x:2250 }, { type:'statue', x:300, fy:-180 }, { type:'statue', x:1100, fy:-180 },
       { type:'echoRings', x:1200, y:150 }, { type:'echoRings', x:600, y:-300 }],
  1:  [{ type:'crystalCluster', x:660, y:480, s:1 }, { type:'crystalCluster', x:1180, y:480, s:1.3 },
       { type:'crystalCluster', x:1700, y:480, s:0.9 }, { type:'crystalCluster', x:2250, y:480, s:1.1 },
       { type:'crystalCluster', x:200, y:-60, s:0.8 }, { type:'crystalCluster', x:450, y:-60, s:1 }],
  16: [{ type:'quartzCrack', x:1000, y:-230, h:400 }, { type:'crystalCluster', x:900, y:480, s:1.2 }, { type:'crystalCluster', x:1500, y:480, s:1 },
       { type:'crystalCluster', x:700, y:180, s:0.9 }, { type:'crystalCluster', x:1900, y:-60, s:1 }],
  17: [{ type:'glowWorms', x0:440, x1:2140, y:-300 }, { type:'stalactites', x0:260, x1:1880, y:60, color:'#1e4a3c' },
       { type:'glowShroom', x:500 }, { type:'glowShroom', x:1100 }, { type:'glowShroom', x:1700 }],
  2:  [{ type:'vines', x:150, y:0, len:150 }, { type:'vines', x:420, y:0, len:110 }, { type:'vines', x:780, y:0, len:170 }, { type:'bogFog', color:'110,90,40' }],
  18: [{ type:'roots', x:1300, y:-270, len:120 }, { type:'roots', x:2050, y:-270, len:140 }, { type:'roots', x:2600, y:-270, len:110 },
       { type:'roots', x:650, y:-500, len:100 }, { type:'roots', x:1750, y:-500, len:110 },
       { type:'roots', x:400, y:0, len:180 }, { type:'roots', x:1400, y:0, len:200 }, { type:'roots', x:1750, y:0, len:150 }],
  19: [{ type:'bogFog', color:'90,140,60' }, { type:'spores' }, { type:'puddle', x:300 }, { type:'puddle', x:1100 }],
  20: [{ type:'curtain', x:110, w:140 }, { type:'curtain', x:1190, w:140 }, { type:'candelabra', x:320 }, { type:'candelabra', x:1100 }],
  21: [{ type:'carpet', x0:60, x1:1380 }, { type:'candelabra', x:260 }, { type:'candelabra', x:720 }, { type:'candelabra', x:1180 }],
  4:  [{ type:'carpet', x0:180, x1:780 }, { type:'candelabra', x:140 }, { type:'candelabra', x:820 }],
  22: [{ type:'constellation', x:200, y:120 }, { type:'constellation', x:740, y:170 }, { type:'shootingStar' }],
  23: [{ type:'skyCracks', x:240, y:150 }, { type:'skyCracks', x:730, y:90 }],
  3:  [{ type:'constellation', x:720, y:70 }],
  24: [{ type:'anvil', x:200 }, { type:'forge', x:770 }, { type:'hammers', x:480, y:80 }],
  25: [{ type:'weaponRack', x:130 }, { type:'weaponRack', x:820 }, { type:'shieldWall', x:480, y:70 }],
  5:  [{ type:'shieldWall', x:170, y:110 }, { type:'shieldWall', x:480, y:90 }, { type:'shieldWall', x:790, y:110 }],
  26: [{ type:'chains', x:300, y:-270, len:330 }, { type:'chains', x:1140, y:-270, len:330 }, { type:'portcullis', x:640, y:-250, w:160, h:150 }],
  27: [{ type:'dummy', x:300 }, { type:'dummy', x:1120 }, { type:'target', x:1250, y:200 }, { type:'target', x:200, y:120 }],
  28: [{ type:'brazier', x:300 }, { type:'brazier', x:1150 }, { type:'snowfall' }],
  29: [{ type:'brazier', x:1200 }, { type:'lantern', x:300, y:-150 }, { type:'lantern', x:1140, y:-150 }, { type:'snowfall' }],
  8:  [{ type:'icicles', x0:200, x1:310, y:368 }, { type:'icicles', x0:560, x1:680, y:328 }, { type:'icicles', x0:770, x1:900, y:258 }, { type:'snowfall' }],
  30: [{ type:'pine', x:220, h:150 }, { type:'pine', x:1240, h:190 }, { type:'pine', x:1110, h:120 }, { type:'snowDrift', x:500, w:160 }, { type:'snowfall' }],
  31: [{ type:'icicles', x0:140, x1:280, y:-2 }, { type:'icicles', x0:1160, x1:1300, y:-2 }, { type:'icicles', x0:380, x1:520, y:-102 },
       { type:'icicles', x0:920, x1:1060, y:-102 }, { type:'icicles', x0:600, x1:840, y:198 }, { type:'snowfall' }],
  9:  [{ type:'blizzard' }],
  32: [{ type:'windLines' }, { type:'snowfall' }],
  33: [{ type:'iceSheen', x:600, y:180, w:240 }, { type:'iceSheen', x:280, y:80, w:220 }, { type:'iceSheen', x:940, y:80, w:220 },
       { type:'icicles', x0:600, x1:840, y:198 }, { type:'snowfall' }],
  10: [{ type:'snowfall' }],
  34: [{ type:'blackWall' }],
  35: [{ type:'campfire', x:320 }, { type:'tent', x:1120 }, { type:'snowfall' }],
  11: [{ type:'snowfall' }],
  36: [{ type:'cellBars', x:60, w:220 }, { type:'cellBars', x:690, w:220 }, { type:'shackles', x:480, y:80 }],
  37: [{ type:'weaponRack', x:130 }, { type:'shieldWall', x:820, y:120 }, { type:'chains', x:480, y:0, len:90 }],
  38: [{ type:'bones', x:200 }, { type:'bones', x:760 }, { type:'bones', x:1300 }],
  40: [{ type:'crystalCluster', x:120, y:480, s:1.3 }, { type:'crystalCluster', x:640, y:480, s:1 }],
  41: [{ type:'barrels', x:330 }, { type:'barrels', x:700 }],
  42: [{ type:'campfire', x:520 }, { type:'bedroll', x:720 }, { type:'stalactites', x0:60, x1:900, y:0, color:'#2a2e3a' }],
  43: [{ type:'cobwebs' }, { type:'bones', x:300 }],
};
for (const [id, decos] of Object.entries(ROOM_THEME)) (ROOMS[id].decorations ||= []).push(...decos);

const FLOOR = 480;
const FLOOR_Y = FLOOR; // los adornos de suelo usan su propio piso (fy) si lo tienen
const hash = n => { const v = Math.sin(n * 127.1) * 43758.5453; return v - Math.floor(v); };
// zona visible (para efectos que llenan la pantalla)
const viewBox = () => ({ x0: camX - 20, x1: camX + W / camZ + 20, y0: camY - 20, y1: camY + H / camZ + 20 });

const THEME_DECO = {
  brokenColumn(d) {
    const FLOOR = d.fy ?? FLOOR_Y;
    const top = FLOOR - d.h;
    ctx.fillStyle = '#2c3450'; ctx.fillRect(d.x - 16, top, 32, d.h);
    ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(d.x - 12, top, 6, d.h);
    ctx.fillStyle = '#3a4466'; ctx.fillRect(d.x - 22, FLOOR - 12, 44, 12);
    ctx.fillStyle = '#2c3450';
    ctx.beginPath(); ctx.moveTo(d.x - 16, top); ctx.lineTo(d.x - 6, top - 16); ctx.lineTo(d.x + 3, top - 5); ctx.lineTo(d.x + 16, top - 12); ctx.lineTo(d.x + 16, top); ctx.closePath(); ctx.fill();
  },
  rubble(d) {
    const FLOOR = d.fy ?? FLOOR_Y;
    for (let i = 0; i < 6; i++) {
      const r = 5 + hash(d.x + i) * 9;
      ctx.fillStyle = vol(d.x - 30 + i * 12, FLOOR - r, r, '#4a5470', '#1e2438');
      ctx.beginPath(); ctx.ellipse(d.x - 30 + i * 12, FLOOR - r * 0.7, r, r * 0.75, 0, 0, Math.PI * 2); ctx.fill();
    }
  },
  fallingDust() {
    const v = viewBox(), t = Date.now() * 0.001;
    ctx.fillStyle = 'rgba(180,190,220,0.35)';
    for (let i = 0; i < 30; i++) {
      const x = v.x0 + hash(i) * (v.x1 - v.x0), y = v.y0 + ((t * (20 + hash(i + 9) * 30) + hash(i + 3) * 900) % (v.y1 - v.y0));
      ctx.fillRect(x, y, 1.5, 1.5);
    }
  },
  statue(d) {
    const FLOOR = d.fy ?? FLOOR_Y;
    ctx.fillStyle = '#3a4466'; ctx.fillRect(d.x - 22, FLOOR - 40, 44, 40);
    ctx.fillStyle = '#4a5476'; ctx.fillRect(d.x - 26, FLOOR - 46, 52, 8);
    ctx.fillStyle = vol(d.x - 4, FLOOR - 90, 26, '#7a84a6', '#2c3450');
    ctx.beginPath(); ctx.moveTo(d.x - 20, FLOOR - 46); ctx.quadraticCurveTo(d.x - 22, FLOOR - 80, d.x, FLOOR - 82); ctx.quadraticCurveTo(d.x + 22, FLOOR - 80, d.x + 20, FLOOR - 46); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(d.x, FLOOR - 96, 15, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(d.x - 7, FLOOR - 99, 4, 3); ctx.fillRect(d.x + 3, FLOOR - 99, 4, 3);
  },
  echoRings(d) {
    const t = Date.now() * 0.0006;
    for (let i = 0; i < 3; i++) {
      const k = (t + i / 3) % 1;
      ctx.strokeStyle = `rgba(150,170,255,${(0.25 * (1 - k)).toFixed(2)})`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(d.x, d.y, 20 + k * 140, 0, Math.PI * 2); ctx.stroke();
    }
  },
  crystalCluster(d) {
    const s = d.s || 1, t = Date.now() * 0.002;
    const g = ctx.createRadialGradient(d.x, d.y - 20 * s, 0, d.x, d.y - 20 * s, 50 * s);
    g.addColorStop(0, `rgba(80,255,200,${(0.18 + 0.06 * Math.sin(t + d.x)).toFixed(2)})`); g.addColorStop(1, 'rgba(80,255,200,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(d.x, d.y - 20 * s, 50 * s, 0, Math.PI * 2); ctx.fill();
    for (const [ox, h, a] of [[-12, 26, -0.35], [0, 42, 0], [11, 30, 0.3], [-5, 18, -0.1], [18, 16, 0.5]]) {
      ctx.save(); ctx.translate(d.x + ox * s, d.y); ctx.rotate(a);
      const cg = ctx.createLinearGradient(0, -h * s, 0, 0);
      cg.addColorStop(0, '#e0fff6'); cg.addColorStop(1, '#2a9a8a');
      ctx.fillStyle = cg;
      ctx.beginPath(); ctx.moveTo(-5 * s, 0); ctx.lineTo(-4 * s, -h * s * 0.8); ctx.lineTo(0, -h * s); ctx.lineTo(4 * s, -h * s * 0.8); ctx.lineTo(5 * s, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(-2 * s, -h * s * 0.75, 1.5 * s, h * s * 0.6);
      ctx.restore();
    }
  },
  quartzCrack(d) {
    const t = Date.now() * 0.002, a = 0.5 + 0.2 * Math.sin(t);
    ctx.save();
    ctx.strokeStyle = `rgba(160,255,230,${a.toFixed(2)})`; ctx.lineWidth = 4; ctx.shadowColor = '#80ffe0'; ctx.shadowBlur = 16;
    ctx.beginPath(); ctx.moveTo(d.x, d.y);
    for (let i = 1; i <= 10; i++) ctx.lineTo(d.x + (hash(i + d.x) - 0.5) * 70, d.y + i * d.h / 10);
    ctx.stroke();
    ctx.lineWidth = 1.5; ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.stroke();
    ctx.restore();
  },
  glowWorms(d) {
    const t = Date.now() * 0.002;
    for (let x = d.x0; x < d.x1; x += 38) {
      const len = 30 + hash(x) * 90, y = d.y + len;
      ctx.strokeStyle = 'rgba(160,255,200,0.18)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, d.y); ctx.lineTo(x, y); ctx.stroke();
      const a = 0.5 + 0.4 * Math.sin(t + x);
      ctx.fillStyle = `rgba(150,255,190,${a.toFixed(2)})`;
      ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.fill();
    }
  },
  stalactites(d) {
    ctx.fillStyle = d.color;
    for (let x = d.x0; x < d.x1; x += 46) {
      const h = 20 + hash(x * 3) * 50;
      ctx.beginPath(); ctx.moveTo(x - 10, d.y); ctx.lineTo(x, d.y + h); ctx.lineTo(x + 10, d.y); ctx.closePath(); ctx.fill();
    }
  },
  glowShroom(d) {
    const t = Date.now() * 0.002, a = 0.6 + 0.3 * Math.sin(t + d.x);
    const g = ctx.createRadialGradient(d.x, FLOOR - 20, 0, d.x, FLOOR - 20, 40);
    g.addColorStop(0, `rgba(120,255,200,${(a * 0.35).toFixed(2)})`); g.addColorStop(1, 'rgba(120,255,200,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(d.x, FLOOR - 20, 40, 0, Math.PI * 2); ctx.fill();
    for (const [ox, h, r] of [[-10, 16, 9], [6, 24, 12], [16, 12, 7]]) {
      ctx.fillStyle = '#c8e8d8'; ctx.fillRect(d.x + ox - 2, FLOOR - h, 4, h);
      ctx.fillStyle = `rgba(120,255,200,${a.toFixed(2)})`;
      ctx.beginPath(); ctx.ellipse(d.x + ox, FLOOR - h, r, r * 0.6, 0, Math.PI, 0); ctx.closePath(); ctx.fill();
    }
  },
  vines(d) {
    const t = Date.now() * 0.001;
    ctx.strokeStyle = '#3a5a20'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(d.x, d.y);
    for (let i = 1; i <= 8; i++) ctx.lineTo(d.x + Math.sin(i + t + d.x) * 6, d.y + i * d.len / 8);
    ctx.stroke();
    ctx.fillStyle = '#5a7a2a';
    for (let i = 1; i <= 7; i++) { ctx.beginPath(); ctx.ellipse(d.x + Math.sin(i + t + d.x) * 6 + (i % 2 ? 6 : -6), d.y + i * d.len / 8, 5, 2.5, i % 2 ? 0.6 : -0.6, 0, Math.PI * 2); ctx.fill(); }
  },
  roots(d) {
    ctx.strokeStyle = '#4a3018'; ctx.lineCap = 'round';
    for (let k = 0; k < 3; k++) {
      ctx.lineWidth = 6 - k * 1.5;
      ctx.beginPath(); ctx.moveTo(d.x + k * 10, d.y);
      for (let i = 1; i <= 6; i++) ctx.lineTo(d.x + k * 10 + (hash(i + k * 7 + d.x) - 0.5) * 30, d.y + i * (d.len - k * 30) / 6);
      ctx.stroke();
    }
  },
  bogFog(d) {
    const v = viewBox(), t = Date.now() * 0.0003;
    const g = ctx.createLinearGradient(0, FLOOR - 120, 0, FLOOR);
    g.addColorStop(0, `rgba(${d.color},0)`); g.addColorStop(1, `rgba(${d.color},0.28)`);
    ctx.fillStyle = g; ctx.fillRect(v.x0, FLOOR - 120, v.x1 - v.x0, 120);
    for (let i = 0; i < 5; i++) {
      const x = v.x0 + ((i * 300 + t * 400 * (i % 2 ? 1 : -1)) % (v.x1 - v.x0 + 300) + (v.x1 - v.x0 + 300)) % (v.x1 - v.x0 + 300) - 150;
      const fg = ctx.createRadialGradient(x, FLOOR - 30, 0, x, FLOOR - 30, 160);
      fg.addColorStop(0, `rgba(${d.color},0.12)`); fg.addColorStop(1, `rgba(${d.color},0)`);
      ctx.fillStyle = fg; ctx.fillRect(x - 160, FLOOR - 190, 320, 190);
    }
  },
  spores() {
    const v = viewBox(), t = Date.now() * 0.001;
    for (let i = 0; i < 40; i++) {
      const x = v.x0 + ((hash(i) * 2000 + Math.sin(t + i) * 30) % (v.x1 - v.x0));
      const y = v.y1 - ((t * (10 + hash(i + 2) * 15) + hash(i + 5) * 900) % (v.y1 - v.y0));
      ctx.fillStyle = `rgba(190,240,120,${(0.3 + hash(i + 7) * 0.4).toFixed(2)})`;
      ctx.beginPath(); ctx.arc(x, y, 1.2 + hash(i + 1) * 1.8, 0, Math.PI * 2); ctx.fill();
    }
  },
  puddle(d) {
    ctx.fillStyle = 'rgba(70,110,40,0.7)'; ctx.beginPath(); ctx.ellipse(d.x, FLOOR - 1, 60, 5, 0, 0, Math.PI * 2); ctx.fill();
    const k = (Date.now() * 0.0015 + d.x) % 1;
    ctx.strokeStyle = `rgba(180,230,120,${(0.6 * (1 - k)).toFixed(2)})`; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(d.x - 15, FLOOR - 2, 6 + k * 14, 1.5 + k * 2, 0, 0, Math.PI * 2); ctx.stroke();
  },
  curtain(d) {
    const top = -270, h = FLOOR - top, t = Date.now() * 0.001;
    const g = ctx.createLinearGradient(d.x, 0, d.x + d.w, 0);
    g.addColorStop(0, '#5a0a14'); g.addColorStop(0.5, '#a0202c'); g.addColorStop(1, '#4a0810');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(d.x, top);
    ctx.lineTo(d.x + d.w, top);
    ctx.quadraticCurveTo(d.x + d.w * 0.7 + Math.sin(t) * 4, top + h * 0.5, d.x + d.w * 0.8, FLOOR);
    ctx.lineTo(d.x + d.w * 0.2, FLOOR);
    ctx.quadraticCurveTo(d.x + d.w * 0.3 + Math.sin(t) * 4, top + h * 0.5, d.x, top); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 2;
    for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(d.x + d.w * i / 4, top); ctx.lineTo(d.x + d.w * (0.2 + i * 0.15), FLOOR); ctx.stroke(); }
    ctx.fillStyle = '#d0a040'; ctx.fillRect(d.x - 4, top, d.w + 8, 8);
  },
  candelabra(d) {
    const t = Date.now() * 0.01;
    ctx.fillStyle = '#b08a30'; ctx.fillRect(d.x - 2, FLOOR - 70, 4, 70); ctx.fillRect(d.x - 12, FLOOR - 4, 24, 4);
    ctx.strokeStyle = '#b08a30'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(d.x - 16, FLOOR - 82); ctx.quadraticCurveTo(d.x, FLOOR - 62, d.x + 16, FLOOR - 82); ctx.stroke();
    for (const ox of [-16, 0, 16]) {
      const cy = ox ? FLOOR - 84 : FLOOR - 74;
      ctx.fillStyle = '#f0e8d8'; ctx.fillRect(d.x + ox - 2, cy - 12, 4, 12);
      const f = 1 + Math.sin(t + ox) * 0.2;
      const g = ctx.createRadialGradient(d.x + ox, cy - 16, 0, d.x + ox, cy - 16, 22);
      g.addColorStop(0, 'rgba(255,190,90,0.35)'); g.addColorStop(1, 'rgba(255,190,90,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(d.x + ox, cy - 16, 22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffc860'; ctx.beginPath(); ctx.ellipse(d.x + ox, cy - 16, 2.6 * f, 5 * f, 0, 0, Math.PI * 2); ctx.fill();
    }
  },
  carpet(d) {
    ctx.fillStyle = '#8a1424'; ctx.fillRect(d.x0, FLOOR - 5, d.x1 - d.x0, 5);
    ctx.fillStyle = '#d0a040'; ctx.fillRect(d.x0, FLOOR - 5, d.x1 - d.x0, 1.5);
    for (let x = d.x0 + 20; x < d.x1; x += 60) ctx.fillRect(x, FLOOR - 3.5, 8, 1.5);
  },
  constellation(d) {
    const pts = [[0, 0], [40, -20], [80, -6], [110, 26], [60, 40]].map(([x, y]) => [d.x + x, d.y + y]);
    ctx.strokeStyle = 'rgba(200,180,255,0.35)'; ctx.lineWidth = 1;
    ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
    const t = Date.now() * 0.003;
    pts.forEach(([x, y], i) => {
      ctx.fillStyle = `rgba(255,255,255,${(0.6 + 0.4 * Math.sin(t + i)).toFixed(2)})`;
      ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.fill();
    });
  },
  shootingStar() {
    const t = (Date.now() * 0.00025) % 1, v = viewBox();
    if (t > 0.3) return;
    const k = t / 0.3, x = v.x0 + 100 + k * 600, y = v.y0 + 60 + k * 200;
    const g = ctx.createLinearGradient(x - 80, y - 27, x, y);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, `rgba(255,255,255,${(1 - k).toFixed(2)})`);
    ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 80, y - 27); ctx.lineTo(x, y); ctx.stroke();
  },
  skyCracks(d) {
    const t = Date.now() * 0.002, a = 0.45 + 0.2 * Math.sin(t + d.x);
    ctx.save();
    ctx.strokeStyle = `rgba(220,120,255,${a.toFixed(2)})`; ctx.lineWidth = 3; ctx.shadowColor = '#c060ff'; ctx.shadowBlur = 12;
    for (let k = 0; k < 4; k++) {
      ctx.beginPath(); ctx.moveTo(d.x, d.y);
      let x = d.x, y = d.y;
      for (let i = 0; i < 4; i++) { x += Math.cos(k * 1.6 + i * 0.5) * 22; y += Math.sin(k * 1.6 + i * 0.5) * 22; ctx.lineTo(x, y); }
      ctx.stroke();
    }
    ctx.restore();
  },
  anvil(d) {
    ctx.fillStyle = '#3a3c44'; ctx.fillRect(d.x - 10, FLOOR - 26, 20, 26);
    ctx.fillStyle = vol(d.x, FLOOR - 34, 24, '#7a7e8a', '#2a2c34');
    ctx.beginPath(); ctx.moveTo(d.x - 26, FLOOR - 40); ctx.lineTo(d.x + 30, FLOOR - 40); ctx.quadraticCurveTo(d.x + 18, FLOOR - 30, d.x + 12, FLOOR - 26);
    ctx.lineTo(d.x - 14, FLOOR - 26); ctx.lineTo(d.x - 26, FLOOR - 34); ctx.closePath(); ctx.fill();
  },
  forge(d) {
    const t = Date.now() * 0.01, f = 0.85 + 0.15 * Math.sin(t);
    ctx.fillStyle = '#3a3036'; ctx.fillRect(d.x - 50, FLOOR - 70, 100, 70);
    ctx.fillStyle = '#1a0a06'; ctx.beginPath(); ctx.roundRect(d.x - 32, FLOOR - 50, 64, 40, [20, 20, 0, 0]); ctx.fill();
    const g = ctx.createRadialGradient(d.x, FLOOR - 25, 0, d.x, FLOOR - 25, 110 * f);
    g.addColorStop(0, 'rgba(255,130,40,0.4)'); g.addColorStop(1, 'rgba(255,130,40,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(d.x, FLOOR - 25, 110 * f, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ff8a30'; ctx.beginPath(); ctx.ellipse(d.x, FLOOR - 14, 22 * f, 8, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#ffe080'; ctx.beginPath(); ctx.ellipse(d.x, FLOOR - 13, 10 * f, 4, 0, Math.PI, 0); ctx.fill();
  },
  hammers(d) {
    for (const [ox, a] of [[-30, -0.4], [0, 0], [30, 0.4]]) {
      ctx.save(); ctx.translate(d.x + ox, d.y); ctx.rotate(a);
      ctx.fillStyle = '#6a4424'; ctx.fillRect(-2, 0, 4, 36);
      ctx.fillStyle = '#5a5e6a'; ctx.fillRect(-9, -6, 18, 9);
      ctx.restore();
    }
  },
  weaponRack(d) {
    ctx.fillStyle = '#4a2e18'; ctx.fillRect(d.x - 40, FLOOR - 70, 80, 6); ctx.fillRect(d.x - 40, FLOOR - 20, 80, 6);
    ctx.fillRect(d.x - 42, FLOOR - 74, 5, 74); ctx.fillRect(d.x + 37, FLOOR - 74, 5, 74);
    for (let i = 0; i < 4; i++) {
      const x = d.x - 26 + i * 17;
      ctx.fillStyle = '#c8ccd8'; ctx.fillRect(x - 1.5, FLOOR - 100, 3, 80);
      ctx.fillStyle = i % 2 ? '#c8ccd8' : '#6a4424';
      if (i % 2) { ctx.beginPath(); ctx.moveTo(x - 4, FLOOR - 100); ctx.lineTo(x, FLOOR - 112); ctx.lineTo(x + 4, FLOOR - 100); ctx.closePath(); ctx.fill(); }
      else { ctx.fillRect(x - 6, FLOOR - 80, 12, 3); }
    }
  },
  shieldWall(d) {
    const g = ctx.createRadialGradient(d.x - 6, d.y - 6, 2, d.x, d.y, 24);
    g.addColorStop(0, '#a8aec0'); g.addColorStop(1, '#4a5060');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(d.x, d.y, 22, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#d0a040'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#7a2030'; ctx.beginPath(); ctx.arc(d.x, d.y, 8, 0, Math.PI * 2); ctx.fill();
  },
  chains(d) {
    ctx.strokeStyle = '#6a6e7a'; ctx.lineWidth = 2;
    for (let y = d.y; y < d.y + d.len; y += 10) { ctx.beginPath(); ctx.ellipse(d.x, y + 5, 3, 5, 0, 0, Math.PI * 2); ctx.stroke(); }
  },
  portcullis(d) {
    ctx.fillStyle = 'rgba(10,8,14,0.8)'; ctx.fillRect(d.x, d.y, d.w, d.h);
    ctx.strokeStyle = '#5a5664'; ctx.lineWidth = 4;
    for (let x = d.x + 10; x < d.x + d.w; x += 20) { ctx.beginPath(); ctx.moveTo(x, d.y); ctx.lineTo(x, d.y + d.h); ctx.stroke(); }
    for (let y = d.y + 20; y < d.y + d.h; y += 30) { ctx.beginPath(); ctx.moveTo(d.x, y); ctx.lineTo(d.x + d.w, y); ctx.stroke(); }
  },
  dummy(d) {
    ctx.fillStyle = '#6a4424'; ctx.fillRect(d.x - 3, FLOOR - 70, 6, 70); ctx.fillRect(d.x - 26, FLOOR - 56, 52, 5);
    ctx.fillStyle = '#c8a870'; ctx.beginPath(); ctx.ellipse(d.x, FLOOR - 50, 14, 20, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(d.x, FLOOR - 80, 11, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#8a6a40'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(d.x - 14, FLOOR - 50); ctx.lineTo(d.x + 14, FLOOR - 50); ctx.moveTo(d.x - 5, FLOOR - 84); ctx.lineTo(d.x + 5, FLOOR - 76); ctx.stroke();
  },
  target(d) {
    for (const [r, c] of [[24, '#e8e0d0'], [18, '#c03030'], [12, '#e8e0d0'], [6, '#c03030']]) {
      ctx.fillStyle = c; ctx.beginPath(); ctx.arc(d.x, d.y, r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = '#6a4424'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(d.x + 4, d.y - 2); ctx.lineTo(d.x + 26, d.y - 14); ctx.stroke();
  },
  snowfall() {
    const v = viewBox(), t = Date.now() * 0.001;
    ctx.fillStyle = 'rgba(240,245,255,0.75)';
    for (let i = 0; i < 70; i++) {
      const sp = 25 + hash(i) * 40, span = v.y1 - v.y0;
      const y = v.y0 + ((t * sp + hash(i + 3) * span) % span);
      const x = v.x0 + ((hash(i + 7) * (v.x1 - v.x0) + Math.sin(t + i) * 20) % (v.x1 - v.x0));
      ctx.beginPath(); ctx.arc(x, y, 1 + hash(i + 1) * 1.6, 0, Math.PI * 2); ctx.fill();
    }
  },
  blizzard() {
    const v = viewBox(), t = Date.now() * 0.001;
    ctx.strokeStyle = 'rgba(230,240,255,0.5)'; ctx.lineWidth = 1.4;
    for (let i = 0; i < 90; i++) {
      const span = v.x1 - v.x0 + 200;
      const x = v.x1 + 100 - ((t * (400 + hash(i) * 300) + hash(i + 2) * span) % span);
      const y = v.y0 + hash(i + 5) * (v.y1 - v.y0) + ((t * 120) % 60);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 22, y + 7); ctx.stroke();
    }
  },
  windLines() {
    const v = viewBox(), t = Date.now() * 0.001;
    ctx.strokeStyle = 'rgba(220,230,255,0.22)'; ctx.lineWidth = 2;
    for (let i = 0; i < 14; i++) {
      const span = v.x1 - v.x0 + 300;
      const x = v.x0 - 150 + ((t * (250 + hash(i) * 150) + hash(i + 4) * span) % span);
      const y = v.y0 + hash(i + 9) * (v.y1 - v.y0);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 40, y - 6, x + 90, y); ctx.stroke();
    }
  },
  icicles(d) {
    ctx.fillStyle = 'rgba(200,225,255,0.85)';
    for (let x = d.x0 + 6; x < d.x1 - 4; x += 14) {
      const h = 8 + hash(x) * 16;
      ctx.beginPath(); ctx.moveTo(x - 3, d.y); ctx.lineTo(x, d.y + h); ctx.lineTo(x + 3, d.y); ctx.closePath(); ctx.fill();
    }
  },
  pine(d) {
    ctx.fillStyle = '#3a2a1a'; ctx.fillRect(d.x - 4, FLOOR - 20, 8, 20);
    for (let i = 0; i < 4; i++) {
      const w = d.h * (0.42 - i * 0.08), y = FLOOR - 20 - i * d.h * 0.22;
      ctx.fillStyle = '#1a3a2e';
      ctx.beginPath(); ctx.moveTo(d.x - w, y); ctx.lineTo(d.x, y - d.h * 0.35); ctx.lineTo(d.x + w, y); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(235,242,255,0.85)';
      ctx.beginPath(); ctx.moveTo(d.x - w * 0.5, y - d.h * 0.17); ctx.lineTo(d.x, y - d.h * 0.35); ctx.lineTo(d.x + w * 0.5, y - d.h * 0.17); ctx.closePath(); ctx.fill();
    }
  },
  snowDrift(d) {
    ctx.fillStyle = '#e4eaf8'; ctx.beginPath(); ctx.ellipse(d.x, FLOOR, d.w / 2, 16, 0, Math.PI, 0); ctx.fill();
  },
  iceSheen(d) {
    const k = (Date.now() * 0.0005 + d.x * 0.001) % 1;
    const g = ctx.createLinearGradient(d.x, 0, d.x + d.w, 0);
    g.addColorStop(Math.max(0, k - 0.15), 'rgba(200,235,255,0)'); g.addColorStop(k, 'rgba(220,245,255,0.7)'); g.addColorStop(Math.min(1, k + 0.15), 'rgba(200,235,255,0)');
    ctx.fillStyle = 'rgba(160,210,255,0.35)'; ctx.fillRect(d.x, d.y - 4, d.w, 4);
    ctx.fillStyle = g; ctx.fillRect(d.x, d.y - 4, d.w, 4);
  },
  blackWall(d, room) {
    const RW = room.width || W, top = room.top || 0;
    ctx.fillStyle = 'rgba(4,4,8,0.75)';
    ctx.beginPath(); ctx.moveTo(0, FLOOR);
    for (let x = 0; x <= RW; x += 60) ctx.lineTo(x, top + 60 + hash(x) * 120);
    ctx.lineTo(RW, FLOOR); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(80,90,120,0.25)'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 12; i++) {
      const x = hash(i) * RW, y = top + 200 + hash(i + 3) * 400;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 12, y + 30); ctx.lineTo(x + 4, y + 60); ctx.stroke();
    }
  },
  campfire(d) {
    const t = Date.now() * 0.012, f = 0.85 + 0.15 * Math.sin(t);
    const g = ctx.createRadialGradient(d.x, FLOOR - 16, 0, d.x, FLOOR - 16, 150 * f);
    g.addColorStop(0, 'rgba(255,150,60,0.35)'); g.addColorStop(1, 'rgba(255,150,60,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(d.x, FLOOR - 16, 150 * f, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#5a3a1e'; ctx.save(); ctx.translate(d.x, FLOOR - 4);
    ctx.rotate(0.3); ctx.fillRect(-18, -3, 36, 6); ctx.rotate(-0.6); ctx.fillRect(-18, -3, 36, 6); ctx.restore();
    for (let i = 0; i < 3; i++) {
      const h = (22 + i * 6) * (0.85 + 0.2 * Math.sin(t + i * 2));
      const fg = ctx.createLinearGradient(0, FLOOR - 4, 0, FLOOR - 4 - h);
      fg.addColorStop(0, '#ffe080'); fg.addColorStop(0.5, '#ff8a30'); fg.addColorStop(1, 'rgba(255,60,20,0)');
      ctx.fillStyle = fg;
      ctx.beginPath(); ctx.moveTo(d.x - 10 + i * 6, FLOOR - 4); ctx.quadraticCurveTo(d.x - 6 + i * 6, FLOOR - 4 - h * 0.6, d.x - 4 + i * 6 + Math.sin(t + i) * 3, FLOOR - 4 - h);
      ctx.quadraticCurveTo(d.x + 2 + i * 6, FLOOR - 4 - h * 0.5, d.x + 4 + i * 6, FLOOR - 4); ctx.closePath(); ctx.fill();
    }
  },
  tent(d) {
    ctx.fillStyle = '#6a4a2a';
    ctx.beginPath(); ctx.moveTo(d.x - 60, FLOOR); ctx.lineTo(d.x, FLOOR - 70); ctx.lineTo(d.x + 60, FLOOR); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#2a1a0c';
    ctx.beginPath(); ctx.moveTo(d.x - 16, FLOOR); ctx.lineTo(d.x, FLOOR - 40); ctx.lineTo(d.x + 16, FLOOR); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(235,242,255,0.85)';
    ctx.beginPath(); ctx.moveTo(d.x - 26, FLOOR - 40); ctx.lineTo(d.x, FLOOR - 70); ctx.lineTo(d.x + 26, FLOOR - 40); ctx.quadraticCurveTo(d.x, FLOOR - 50, d.x - 26, FLOOR - 40); ctx.fill();
  },
  cellBars(d) {
    ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(d.x, FLOOR - 120, d.w, 120);
    ctx.strokeStyle = '#4a4652'; ctx.lineWidth = 4;
    for (let x = d.x + 12; x < d.x + d.w; x += 24) { ctx.beginPath(); ctx.moveTo(x, FLOOR - 120); ctx.lineTo(x, FLOOR); ctx.stroke(); }
    ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(d.x, FLOOR - 120); ctx.lineTo(d.x + d.w, FLOOR - 120); ctx.stroke();
  },
  shackles(d) {
    THEME_DECO.chains({ x: d.x - 20, y: d.y, len: 50 }); THEME_DECO.chains({ x: d.x + 20, y: d.y, len: 50 });
    ctx.strokeStyle = '#7a7e8a'; ctx.lineWidth = 3;
    for (const ox of [-20, 20]) { ctx.beginPath(); ctx.arc(d.x + ox, d.y + 58, 7, 0, Math.PI * 2); ctx.stroke(); }
  },
  bones(d) {
    ctx.fillStyle = '#d8ccb0';
    ctx.beginPath(); ctx.arc(d.x, FLOOR - 9, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(d.x - 6, FLOOR - 5, 12, 5);
    ctx.fillStyle = '#1a1410'; ctx.beginPath(); ctx.arc(d.x - 3.5, FLOOR - 10, 2.4, 0, Math.PI * 2); ctx.arc(d.x + 3.5, FLOOR - 10, 2.4, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.translate(d.x + 24, FLOOR - 4); ctx.rotate(0.3);
    ctx.fillStyle = '#d8ccb0'; ctx.fillRect(-14, -2, 28, 4);
    for (const ox of [-14, 14]) { ctx.beginPath(); ctx.arc(ox, -2, 3, 0, Math.PI * 2); ctx.arc(ox, 2, 3, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  },
  barrels(d) {
    for (const [ox, oy] of [[-34, 0], [0, 0], [-17, -46]]) {
      const x = d.x + ox, y = FLOOR + oy;
      ctx.fillStyle = vol(x, y - 22, 22, '#9a6a3a', '#4a2a10');
      ctx.beginPath(); ctx.ellipse(x, y - 23, 17, 23, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#3a3a40'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(x - 16, y - 34); ctx.lineTo(x + 16, y - 34); ctx.moveTo(x - 16, y - 12); ctx.lineTo(x + 16, y - 12); ctx.stroke();
    }
  },
  bedroll(d) {
    ctx.fillStyle = '#6a2a2a'; ctx.beginPath(); ctx.roundRect(d.x - 40, FLOOR - 10, 80, 10, 4); ctx.fill();
    ctx.fillStyle = '#d8ccb0'; ctx.beginPath(); ctx.ellipse(d.x - 30, FLOOR - 12, 12, 6, 0, 0, Math.PI * 2); ctx.fill();
  },
  cobwebs(d, room) {
    const RW = room.width || W;
    ctx.strokeStyle = 'rgba(220,220,235,0.3)'; ctx.lineWidth = 1;
    for (const [cx, cy, sx] of [[0, 0, 1], [RW, 0, -1]]) {
      for (let a = 0; a <= 4; a++) { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + sx * 90 * Math.cos(a * 0.39), cy + 90 * Math.sin(a * 0.39)); ctx.stroke(); }
      for (let r = 25; r <= 85; r += 20) { ctx.beginPath(); ctx.arc(cx, cy, r, sx > 0 ? 0 : Math.PI / 2, sx > 0 ? Math.PI / 2 : Math.PI); ctx.stroke(); }
    }
  },
  brazier(d) {
    const t = Date.now() * 0.012, f = 0.85 + 0.15 * Math.sin(t + d.x);
    ctx.fillStyle = '#3a3a44'; ctx.fillRect(d.x - 3, FLOOR - 50, 6, 50); ctx.fillRect(d.x - 14, FLOOR - 4, 28, 4);
    const g = ctx.createRadialGradient(d.x, FLOOR - 62, 0, d.x, FLOOR - 62, 110 * f);
    g.addColorStop(0, 'rgba(255,150,60,0.35)'); g.addColorStop(1, 'rgba(255,150,60,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(d.x, FLOOR - 62, 110 * f, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4a4a56'; ctx.beginPath(); ctx.moveTo(d.x - 18, FLOOR - 58); ctx.lineTo(d.x + 18, FLOOR - 58); ctx.lineTo(d.x + 10, FLOOR - 48); ctx.lineTo(d.x - 10, FLOOR - 48); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ff8a30'; ctx.beginPath(); ctx.ellipse(d.x, FLOOR - 64, 12 * f, 12 * f, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#ffe080'; ctx.beginPath(); ctx.ellipse(d.x, FLOOR - 62, 6 * f, 7 * f, 0, Math.PI, 0); ctx.fill();
  },
  lantern(d) {
    const t = Date.now() * 0.006, f = 0.85 + 0.15 * Math.sin(t + d.x);
    THEME_DECO.chains({ x: d.x, y: d.y - 50, len: 40 });
    const g = ctx.createRadialGradient(d.x, d.y + 10, 0, d.x, d.y + 10, 80 * f);
    g.addColorStop(0, 'rgba(255,200,100,0.3)'); g.addColorStop(1, 'rgba(255,200,100,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(d.x, d.y + 10, 80 * f, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2a2a30'; ctx.fillRect(d.x - 10, d.y - 10, 20, 4); ctx.fillRect(d.x - 10, d.y + 22, 20, 4);
    ctx.fillStyle = `rgba(255,210,120,${(0.8 * f).toFixed(2)})`; ctx.fillRect(d.x - 8, d.y - 6, 16, 28);
    ctx.strokeStyle = '#2a2a30'; ctx.lineWidth = 2; ctx.strokeRect(d.x - 8, d.y - 6, 16, 28);
  },

};

WIDE_ROOMS.forEach(widenRoom);
