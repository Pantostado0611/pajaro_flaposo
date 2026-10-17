// ─── PANTALLA DE INICIO: PARTIDAS GUARDADAS ──────────────────────────────────
// Al entrar se elige una de 4 partidas (como en Hollow Knight). Una partida
// vacía empieza un juego nuevo; una guardada sigue desde su último banco.
// Cada partida guardada tiene su botón "Borrar" (pide confirmación).
// Teclado: ↑ ↓ elegir, → / ← ir a "Borrar" y volver, Enter / Espacio / Z
// aceptar, Supr también borra, Esc cancela. También con ratón o tocando.
const SLOTS = 4;
let titleState = 'slots';   // 'slots' | 'confirm' | null (jugando)
let titleSel = 0, titleCol = 0, titleConfirmSel = 1, titleSlotToDelete = 0;
let titleSlots = [];         // resumen de cada partida (o null si está vacía)

function refreshTitleSlots() {
  titleSlots = [];
  for (let n = 1; n <= SLOTS; n++) titleSlots.push(readSlot(n));
}

// Empieza a jugar en la partida n
function startSlot(n) {
  saveSlot = n;
  titleState = null;
  setTouchControls(true);
  if (loadGame(n)) {
    resetParticles(currentRoom); initEnemies(currentRoom); initBoss(); initBoss2();
    roomLabelAlpha = 1; roomLabelTimer = 200;
  } else showChapter(1, 'Las Profundidades');
}

function setTouchControls(on) {
  const el = document.getElementById('touch-controls');
  if (el) el.style.visibility = on ? '' : 'hidden';
}

// Dónde está cada cosa (para dibujar y para el ratón)
function titleLayout() {
  const cx = 230, cw = 430, ch = 58, gap = 10, top = 150;
  const cards = [];
  for (let i = 0; i < SLOTS; i++) {
    const y = top + i * (ch + gap);
    cards.push({ x: cx, y, w: cw, h: ch, del: { x: cx + cw + 10, y: y + 9, w: 90, h: ch - 18 } });
  }
  const quit = { x: W / 2 - 80, y: top + SLOTS * (ch + gap) + 14, w: 160, h: 38 };
  const conf = { x: W / 2 - 200, y: H / 2 - 90, w: 400, h: 180,
    buttons: [{ t: 'Sí, borrar', x: W / 2 - 150, y: H / 2 + 20, w: 130, h: 42 }, { t: 'No', x: W / 2 + 20, y: H / 2 + 20, w: 130, h: 42 }] };
  return { cards, quit, conf };
}

function titleAct() {
  if (titleSel === SLOTS) { window.location.href = 'index.html'; return; }
  const s = titleSlots[titleSel];
  if (titleCol === 1 && s) { titleSlotToDelete = titleSel + 1; titleConfirmSel = 1; titleState = 'confirm'; return; }
  startSlot(titleSel + 1);
}
function titleConfirm(yes) {
  if (yes) { deleteSlot(titleSlotToDelete); refreshTitleSlots(); titleCol = 0; }
  titleState = 'slots';
}

// Teclas de la pantalla de inicio (siempre se las queda)
function titleKey(e) {
  const c = e.code, ok = ['Enter', 'Space', 'KeyZ', 'KeyJ', 'NumpadEnter'].includes(c);
  if (titleState === 'confirm') {
    if (c === 'ArrowLeft' || c === 'ArrowRight' || c === 'KeyA' || c === 'KeyD') titleConfirmSel = 1 - titleConfirmSel;
    else if (c === 'Escape') titleConfirm(false);
    else if (ok) titleConfirm(titleConfirmSel === 0);
    return true;
  }
  if (c === 'ArrowUp' || c === 'KeyW') { titleSel = (titleSel + SLOTS) % (SLOTS + 1); titleCol = 0; }
  else if (c === 'ArrowDown' || c === 'KeyS') { titleSel = (titleSel + 1) % (SLOTS + 1); titleCol = 0; }
  else if ((c === 'ArrowRight' || c === 'KeyD') && titleSlots[titleSel]) titleCol = 1;
  else if (c === 'ArrowLeft' || c === 'KeyA') titleCol = 0;
  else if ((c === 'Delete' || c === 'Backspace') && titleSlots[titleSel]) { titleCol = 1; titleAct(); }
  else if (ok) titleAct();
  return true;
}

// ── Dibujo ────────────────────────────────────────────────────────────────────
const titleDust = Array.from({ length: 60 }, () => ({ x: Math.random() * W, y: Math.random() * H, s: 0.2 + Math.random() * 0.6, r: 0.6 + Math.random() * 1.6 }));

function fmtTime(frames) {
  const m = Math.floor((frames || 0) / 3600), h = Math.floor(m / 60);
  return h ? `${h} h ${m % 60} min` : `${m} min`;
}

function drawTitle() {
  const t = Date.now() * 0.001, L = titleLayout();
  ctx.save();
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#04060e'); bg.addColorStop(1, '#0e1428');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  // polvo que sube despacio
  for (const d of titleDust) {
    d.y -= d.s; d.x += Math.sin(t + d.y * 0.02) * 0.2;
    if (d.y < -4) { d.y = H + 4; d.x = Math.random() * W; }
    ctx.fillStyle = `rgba(150,170,230,${(0.15 + d.s * 0.4).toFixed(2)})`;
    ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill();
  }
  // título
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(120,150,255,0.6)'; ctx.shadowBlur = 24;
  ctx.fillStyle = '#e8eeff'; ctx.font = 'bold 54px serif';
  ctx.fillText('MAPACHÓN', W / 2, 64);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#8a98c8'; ctx.font = 'italic 16px serif';
  ctx.fillText('Explorador de Ruinas', W / 2, 104);
  ctx.strokeStyle = 'rgba(138,152,200,0.5)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(W / 2 - 160, 124); ctx.lineTo(W / 2 + 160, 124); ctx.stroke();
  // partidas
  L.cards.forEach((c, i) => {
    const s = titleSlots[i], on = titleState === 'slots' && titleSel === i;
    const cardOn = on && titleCol === 0;
    ctx.fillStyle = cardOn ? 'rgba(58,74,138,0.9)' : 'rgba(20,26,48,0.85)';
    ctx.strokeStyle = cardOn ? '#9ab0ff' : '#34406a'; ctx.lineWidth = cardOn ? 2 : 1;
    ctx.beginPath(); ctx.roundRect(c.x, c.y, c.w, c.h, 8); ctx.fill(); ctx.stroke();
    ctx.textAlign = 'left';
    ctx.fillStyle = '#6a78a8'; ctx.font = 'bold 22px serif';
    ctx.fillText(i + 1, c.x + 16, c.y + c.h / 2 + 1);
    if (!s) {
      ctx.fillStyle = cardOn ? '#ffffff' : '#b8c4e8'; ctx.font = (cardOn ? 'bold ' : '') + '18px serif';
      ctx.fillText('Nueva partida', c.x + 50, c.y + c.h / 2 + 1);
    } else {
      ctx.fillStyle = cardOn ? '#ffffff' : '#d8e0ff'; ctx.font = 'bold 15px serif';
      ctx.fillText(`Capítulo ${['I', 'II', 'III'][s.chapter - 1]} · ${s.roomName}`, c.x + 50, c.y + 19);
      ctx.font = '13px monospace';
      ctx.fillStyle = '#ff6a7a'; ctx.fillText('♥'.repeat(s.maxHp), c.x + 50, c.y + 40);
      const hx = c.x + 56 + s.maxHp * 9;
      ctx.fillStyle = '#ffd040'; ctx.fillText(`${s.money} mapesos`, hx, c.y + 40);
      ctx.textAlign = 'right'; ctx.fillStyle = '#8a98c8';
      ctx.fillText(fmtTime(s.time), c.x + c.w - 14, c.y + 40);
      // botón borrar
      const d = c.del, dOn = on && titleCol === 1;
      ctx.fillStyle = dOn ? 'rgba(140,40,40,0.9)' : 'rgba(48,20,24,0.85)';
      ctx.strokeStyle = dOn ? '#ff9a8a' : '#6a3438'; ctx.lineWidth = dOn ? 2 : 1;
      ctx.beginPath(); ctx.roundRect(d.x, d.y, d.w, d.h, 6); ctx.fill(); ctx.stroke();
      ctx.textAlign = 'center'; ctx.fillStyle = dOn ? '#ffffff' : '#e0a8a0'; ctx.font = (dOn ? 'bold ' : '') + '14px serif';
      ctx.fillText('Borrar', d.x + d.w / 2, d.y + d.h / 2 + 1);
    }
  });
  // salir
  const q = L.quit, qOn = titleState === 'slots' && titleSel === SLOTS;
  ctx.fillStyle = qOn ? 'rgba(58,74,138,0.9)' : 'rgba(20,26,48,0.85)';
  ctx.strokeStyle = qOn ? '#9ab0ff' : '#34406a'; ctx.lineWidth = qOn ? 2 : 1;
  ctx.beginPath(); ctx.roundRect(q.x, q.y, q.w, q.h, 8); ctx.fill(); ctx.stroke();
  ctx.textAlign = 'center'; ctx.fillStyle = qOn ? '#ffffff' : '#b8c4e8'; ctx.font = (qOn ? 'bold ' : '') + '16px serif';
  ctx.fillText('Salir', W / 2, q.y + q.h / 2 + 1);
  ctx.fillStyle = 'rgba(138,152,200,0.6)'; ctx.font = '12px monospace';
  ctx.fillText('↑ ↓ elegir  ·  → borrar  ·  Enter jugar', W / 2, H - 18);
  // confirmación
  if (titleState === 'confirm') {
    ctx.fillStyle = 'rgba(2,4,12,0.72)'; ctx.fillRect(0, 0, W, H);
    const C = L.conf;
    ctx.fillStyle = 'rgba(14,18,34,0.97)'; ctx.strokeStyle = '#a85a5a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(C.x, C.y, C.w, C.h, 12); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffe0d8'; ctx.font = 'bold 22px serif';
    ctx.fillText(`¿Borrar la partida ${titleSlotToDelete}?`, W / 2, C.y + 42);
    ctx.fillStyle = '#ffb0a0'; ctx.font = '14px serif';
    ctx.fillText('Se perderá todo y no se puede deshacer', W / 2, C.y + 74);
    C.buttons.forEach((b, i) => {
      const on = i === titleConfirmSel;
      ctx.fillStyle = on ? (i === 0 ? '#8a2a2a' : '#3a4a8a') : '#1c2340';
      ctx.strokeStyle = on ? '#ffffff' : '#34406a'; ctx.lineWidth = on ? 2 : 1;
      ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 8); ctx.fill(); ctx.stroke();
      ctx.fillStyle = on ? '#ffffff' : '#b8c4e8'; ctx.font = (on ? 'bold ' : '') + '16px serif';
      ctx.fillText(b.t, b.x + b.w / 2, b.y + b.h / 2 + 1);
    });
  }
  ctx.restore();
}

// ── Ratón y toque ────────────────────────────────────────────────────────────
function titlePoint(e) {
  const r = canvas.getBoundingClientRect(), sc = W / r.width;
  return { mx: (e.clientX - r.left) * sc, my: (e.clientY - r.top) * sc };
}
const inBox = (p, b) => p.mx >= b.x && p.mx <= b.x + b.w && p.my >= b.y && p.my <= b.y + b.h;
// qué hay bajo el puntero: { sel, col } en la lista, o { confirm: i }
function titleHit(e) {
  const p = titlePoint(e), L = titleLayout();
  if (titleState === 'confirm') { const i = L.conf.buttons.findIndex(b => inBox(p, b)); return i >= 0 ? { confirm: i } : null; }
  for (let i = 0; i < SLOTS; i++) {
    if (titleSlots[i] && inBox(p, L.cards[i].del)) return { sel: i, col: 1 };
    if (inBox(p, L.cards[i])) return { sel: i, col: 0 };
  }
  return inBox(p, L.quit) ? { sel: SLOTS, col: 0 } : null;
}
canvas.addEventListener('mousemove', e => {
  if (!titleState) return;
  const h = titleHit(e);
  if (!h) return;
  if (h.confirm !== undefined) titleConfirmSel = h.confirm; else { titleSel = h.sel; titleCol = h.col; }
});
canvas.addEventListener('click', e => {
  if (!titleState) return;
  const h = titleHit(e);
  if (!h) return;
  if (h.confirm !== undefined) titleConfirm(h.confirm === 0);
  else { titleSel = h.sel; titleCol = h.col; titleAct(); }
});
