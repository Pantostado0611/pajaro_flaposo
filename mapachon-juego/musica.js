// ─── MÚSICA ───────────────────────────────────────────────────────────────────
// Banda sonora original generada con Web Audio (sin archivos): piano y cuerdas
// melancólicos para explorar, y temas rápidos con melodía "chiptune" y batería
// para los jefes. M = silenciar / activar.
const Music = (() => {
  const NOTE = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11, Bb: 10, Eb: 3 };
  const freq = n => {
    const m = n.match(/^([A-G][#b]?)(\d)$/);
    return 440 * Math.pow(2, (NOTE[m[1]] + (+m[2] + 1) * 12 - 69) / 12);
  };
  const shift = (n, semis) => freq(n) * Math.pow(2, semis / 12);

  let ac = null, master = null, reverbIn = null, noiseBuf = null;
  let muted = false;
  try { muted = localStorage.getItem('mapachon-muted') === '1'; } catch (e) {}
  let bus = null, track = null, trackName = null, step = 0, nextTime = 0;

  function unlock() {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ac = new AC();
      master = ac.createGain();
      master.gain.value = muted ? 0 : 0.42;
      master.connect(ac.destination);
      // reverberación: respuesta de impulso generada con ruido que se apaga
      const conv = ac.createConvolver();
      const len = ac.sampleRate * 2.8, imp = ac.createBuffer(2, len, ac.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const d = imp.getChannelData(ch);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
      }
      conv.buffer = imp;
      reverbIn = ac.createGain(); reverbIn.gain.value = 0.38;
      reverbIn.connect(conv); conv.connect(master);
      noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
      const nd = noiseBuf.getChannelData(0);
      for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
      setInterval(schedule, 25);
    }
    if (ac.state === 'suspended') ac.resume();
  }

  function toggleMute() {
    muted = !muted;
    try { localStorage.setItem('mapachon-muted', muted ? '1' : '0'); } catch (e) {}
    if (master) master.gain.setTargetAtTime(muted ? 0 : 0.42, ac.currentTime, 0.05);
  }

  // ── Instrumentos ────────────────────────────────────────────────────────────
  const newGain = () => ac.createGain();
  function out(node, wet) {
    node.connect(bus);
    if (wet) { const s = ac.createGain(); s.gain.value = wet; node.connect(s); s.connect(reverbIn); }
  }
  function env(g, t, a, peak, d, sustainEnd) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, sustainEnd + d);
  }
  const INST = {
    piano(t, f, dur, v) {
      const g = ac.createGain();
      for (const [type, mul, lvl] of [['triangle', 1, 1], ['sine', 2, 0.25], ['sine', 3, 0.08]]) {
        const o = ac.createOscillator(); o.type = type; o.frequency.value = f * mul;
        const og = ac.createGain(); og.gain.value = lvl;
        o.connect(og); og.connect(g); o.start(t); o.stop(t + dur + 2.2);
      }
      env(g, t, 0.006, 0.22 * v, Math.max(1.2, dur * 1.5), t);
      out(g, 0.9);
    },
    pad(t, f, dur, v) {
      const g = ac.createGain(), lp = ac.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 900;
      for (const det of [-7, 7]) {
        const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = det;
        o.connect(lp); o.start(t); o.stop(t + dur + 1.2);
      }
      lp.connect(g);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.045 * v, t + Math.min(0.5, dur * 0.4));
      g.gain.setValueAtTime(0.045 * v, t + dur);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 1);
      out(g, 1);
    },
    bell(t, f, dur, v) {
      const g = ac.createGain();
      for (const [mul, lvl] of [[1, 1], [2.76, 0.3], [5.4, 0.1]]) {
        const o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = f * mul;
        const og = ac.createGain(); og.gain.value = lvl;
        o.connect(og); og.connect(g); o.start(t); o.stop(t + 2.6);
      }
      env(g, t, 0.004, 0.16 * v, 2.2, t);
      out(g, 1);
    },
    strings(t, f, dur, v) {
      // cuerdas en staccato (ostinato rápido)
      const g = newGain(), lp = ac.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 2400;
      for (const det of [-6, 6]) {
        const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = det;
        o.connect(lp); o.start(t); o.stop(t + 0.3);
      }
      lp.connect(g);
      env(g, t, 0.01, 0.045 * v, 0.14, t + Math.min(dur, 0.08));
      out(g, 0.5);
    },
    brass(t, f, dur, v) {
      // metales: el filtro se abre al soplar
      const g = newGain(), lp = ac.createBiquadFilter();
      lp.type = 'lowpass'; lp.Q.value = 2;
      lp.frequency.setValueAtTime(500, t);
      lp.frequency.linearRampToValueAtTime(2600, t + 0.12);
      lp.frequency.linearRampToValueAtTime(1500, t + Math.max(0.2, dur));
      for (const [mul, det] of [[1, -5], [1, 5], [0.5, 0]]) {
        const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f * mul; o.detune.value = det;
        o.connect(lp); o.start(t); o.stop(t + dur + 0.4);
      }
      lp.connect(g);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.06 * v, t + 0.05);
      g.gain.setValueAtTime(0.055 * v, t + Math.max(0.06, dur - 0.05));
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.3);
      out(g, 0.7);
    },
    choir(t, f, dur, v) {
      // coro "aah": sierra con vibrato filtrada por dos formantes
      const g = newGain(), mix = ac.createGain();
      const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f;
      const lfo = ac.createOscillator(), lg = ac.createGain();
      lfo.frequency.value = 5; lg.gain.value = 6; lfo.connect(lg); lg.connect(o.detune);
      for (const [fr, q, lvl] of [[750, 6, 1], [1180, 7, 0.6]]) {
        const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = fr; bp.Q.value = q;
        const bg = ac.createGain(); bg.gain.value = lvl;
        o.connect(bp); bp.connect(bg); bg.connect(mix);
      }
      mix.connect(g);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.11 * v, t + Math.min(0.6, dur * 0.4));
      g.gain.setValueAtTime(0.11 * v, t + dur);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.9);
      o.start(t); o.stop(t + dur + 1); lfo.start(t); lfo.stop(t + dur + 1);
      out(g, 1);
    },
    harp(t, f, dur, v) {
      const o = ac.createOscillator(), g = newGain(), lp = ac.createBiquadFilter();
      o.type = 'triangle'; o.frequency.value = f;
      lp.type = 'lowpass'; lp.frequency.setValueAtTime(4000, t); lp.frequency.exponentialRampToValueAtTime(700, t + 0.6);
      o.connect(lp); lp.connect(g);
      env(g, t, 0.003, 0.12 * v, 0.9, t);
      o.start(t); o.stop(t + 1.1);
      out(g, 0.9);
    },
    celesta(t, f, dur, v) {
      const g = newGain();
      for (const [mul, lvl] of [[1, 1], [4, 0.25], [6.8, 0.06]]) {
        const o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = f * mul;
        const og = ac.createGain(); og.gain.value = lvl;
        o.connect(og); og.connect(g); o.start(t); o.stop(t + 1.8);
      }
      env(g, t, 0.003, 0.14 * v, 1.4, t);
      out(g, 1);
    },
    bass(t, f, dur, v) {
      const o = ac.createOscillator(), g = ac.createGain(), lp = ac.createBiquadFilter();
      o.type = 'triangle'; o.frequency.value = f;
      lp.type = 'lowpass'; lp.frequency.value = 600;
      o.connect(lp); lp.connect(g);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.18 * v, t + 0.02);
      g.gain.setValueAtTime(0.15 * v, t + Math.max(0.03, dur - 0.05));
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.08);
      o.start(t); o.stop(t + dur + 0.1);
      out(g, 0.1);
    },
    kick(t, f, dur, v) {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
      o.connect(g); env(g, t, 0.002, 0.5 * v, 0.25, t);
      o.start(t); o.stop(t + 0.3);
      out(g, 0);
    },
    taiko(t, f, dur, v) {
      // tambor grande: golpe grave + parche
      const o = ac.createOscillator(), g = newGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(f || 110, t); o.frequency.exponentialRampToValueAtTime((f || 110) * 0.45, t + 0.25);
      o.connect(g); env(g, t, 0.003, 0.55 * v, 0.55, t);
      o.start(t); o.stop(t + 0.7);
      const n = ac.createBufferSource(), lp = ac.createBiquadFilter(), ng = newGain();
      n.buffer = noiseBuf; lp.type = 'lowpass'; lp.frequency.value = 900;
      n.connect(lp); lp.connect(ng); env(ng, t, 0.002, 0.18 * v, 0.12, t);
      n.start(t); n.stop(t + 0.2);
      out(g, 0.35); out(ng, 0.35);
    },
    crash(t, f, dur, v) {
      const n = ac.createBufferSource(), hp = ac.createBiquadFilter(), g = newGain();
      n.buffer = noiseBuf; hp.type = 'highpass'; hp.frequency.value = 4500;
      n.connect(hp); hp.connect(g); env(g, t, 0.003, 0.09 * v, 1.3, t);
      n.start(t); n.stop(t + 1);
      out(g, 0.6);
    },
    hat(t, f, dur, v) {
      const n = ac.createBufferSource(), hp = ac.createBiquadFilter(), g = ac.createGain();
      n.buffer = noiseBuf; hp.type = 'highpass'; hp.frequency.value = 7000;
      n.connect(hp); hp.connect(g); env(g, t, 0.001, 0.05 * v, 0.04, t);
      n.start(t); n.stop(t + 0.08);
      out(g, 0);
    },
  };

  // ── Composiciones (originales) ──────────────────────────────────────────────
  // Cada compás tiene 8 pasos (corcheas). Las melodías son [nota, duración en pasos].
  const MINOR = [0, 7, 12, 15, 19, 15, 12, 7], MAJOR = [0, 7, 12, 16, 19, 16, 12, 7];
  const chordTones = (root, minor) => [0, minor ? 3 : 4, 7].map(s => shift(root, s));

  function build(def) {
    const bars = def.chords.length, steps = bars * 8, ev = Array.from({ length: steps }, () => []);
    def.chords.forEach(([root, minor], b) => {
      const base = b * 8;
      if (def.arp) for (let i = 0; i < 8; i++) {
        if (def.arpEvery && i % def.arpEvery) continue;
        ev[base + i].push(['arp', shift(root, (minor ? MINOR : MAJOR)[i] + def.arpOct * 12), 1, i === 0 ? 1 : 0.75]);
      }
      if (def.pad) for (const f of chordTones(root, minor)) ev[base].push(['pad', f * Math.pow(2, def.padOct), 8, 1]);
      if (def.choir) for (const f of chordTones(root, minor)) ev[base].push(['choir', f * Math.pow(2, def.choirOct), 8, 0.8]);
      if (def.ost) def.ost.forEach((st, i) =>
        ev[base + i].push(['ost', shift(root, st + def.ostOct * 12), 1, i % 4 === 0 ? 1 : 0.7]));
      if (def.bass === 'whole') ev[base].push(['bass', freq(root) / Math.pow(2, def.bassDown), 8, 1]);
      if (def.bass === 'drive') [0, 0, 12, 0, 0, 12, 0, 7].forEach((s, i) =>
        ev[base + i].push(['bass', shift(root, s) / Math.pow(2, def.bassDown), 1, i % 4 === 0 ? 1 : 0.8]));
      if (def.drums) for (const [inst, pos, every = 1, f = 0, v = 1] of def.drums) {
        if (b % every) continue;
        for (const p of pos) ev[base + p].push([inst, f, 1, v]);
      }
    });
    let pos = 0;
    for (const [n, len] of def.melody) {
      if (n) ev[pos % steps].push(['mel', freq(n), len, 1]);
      pos += len;
    }
    return { ...def, steps, ev, stepDur: 60 / def.bpm / 2 };
  }

  const TRACKS = {
    // Exploración: piano melancólico sobre cuerdas (Re menor)
    ruinas: build({
      bpm: 76, arp: true, arpOct: -1, inst: { arp: 'piano', mel: 'piano', pad: 'pad', bass: 'bass' },
      pad: true, padOct: -1, bass: 'whole', bassDown: 2,
      chords: [['D4', 1], ['A#3', 0], ['F4', 0], ['C4', 0], ['D4', 1], ['G3', 1], ['A#3', 0], ['A3', 0]],
      melody: [['A4', 2], ['D5', 2], ['F5', 4], ['E5', 2], ['D5', 2], ['C5', 2], ['D5', 2],
               ['C5', 4], ['A4', 4], ['G4', 2], ['A4', 2], ['C5', 4],
               ['D5', 2], ['F5', 2], ['A5', 4], ['G5', 2], ['F5', 2], ['D5', 4],
               ['F5', 2], ['E5', 2], ['D5', 2], ['C5', 2], ['C#5', 4], ['E5', 4]],
    }),
    // Capítulo II: campanas y cuerdas, nostálgico (Si menor)
    cumbre: build({
      bpm: 66, arp: true, arpOct: -1, arpEvery: 2, inst: { arp: 'piano', mel: 'bell', pad: 'pad', bass: 'bass' },
      pad: true, padOct: -1, bass: 'whole', bassDown: 2,
      chords: [['B3', 1], ['G3', 0], ['D4', 0], ['A3', 0], ['B3', 1], ['G3', 0], ['E4', 1], ['F#3', 0]],
      melody: [['F#5', 4], ['D5', 2], ['B4', 2], ['G5', 4], ['F#5', 2], ['D5', 2],
               ['A5', 4], ['F#5', 4], ['E5', 4], ['C#5', 4],
               ['B5', 2], ['A5', 2], ['F#5', 4], ['G5', 2], ['F#5', 2], ['D5', 4],
               ['E5', 2], ['G5', 2], ['B5', 4], ['A#5', 4], ['C#6', 4]],
    }),
    // Jefe: El Último Rey — épica orquestal: cuerdas en ostinato, metales,
    // coro y tambores taiko (Re menor)
    rey: build({
      bpm: 152, inst: { ost: 'strings', mel: 'brass', bass: 'bass' },
      ost: [0, 0, 12, 0, 7, 0, 12, 7], ostOct: -1,
      choir: true, choirOct: -1, bass: 'whole', bassDown: 2,
      drums: [['taiko', [0, 3, 6], 1, 110], ['taiko', [4], 1, 70, 1.2], ['crash', [0], 4]],
      chords: [['D4', 1], ['D4', 1], ['A#3', 0], ['C4', 0], ['D4', 1], ['G3', 1], ['A3', 0], ['A3', 0]],
      melody: [['D5', 3], ['A4', 1], ['D5', 2], ['F5', 2], ['E5', 2], ['D5', 2], ['A4', 4],
               ['F5', 3], ['E5', 1], ['D5', 2], ['C5', 2], ['E5', 4], ['G5', 4],
               ['A5', 3], ['G5', 1], ['F5', 2], ['E5', 2], ['D5', 2], ['F5', 2], ['A#5', 4],
               ['A5', 2], ['G5', 2], ['F5', 2], ['E5', 2], ['C#5', 4], ['A4', 4]],
    }),
    // Jefe: El Guardián de la Cima — etéreo y fantasmal: arpa, celesta y coro,
    // con un pulso de tambor suave (Mi frigio)
    guardian: build({
      bpm: 126, arp: true, arpOct: -1, inst: { arp: 'harp', mel: 'celesta', bass: 'bass' },
      choir: true, choirOct: -1, bass: 'whole', bassDown: 2,
      drums: [['taiko', [0, 4], 1, 90, 0.7], ['hat', [2, 6], 1, 0, 0.6], ['crash', [0], 8, 0, 0.6]],
      chords: [['E4', 1], ['F4', 0], ['E4', 1], ['D4', 0], ['C4', 0], ['A3', 1], ['B3', 0], ['B3', 0]],
      melody: [['B5', 4], ['G5', 2], ['E5', 2], ['F5', 4], ['A5', 2], ['C6', 2],
               ['B5', 2], ['A5', 2], ['G5', 2], ['F#5', 2], ['F#5', 4], ['D5', 4],
               ['E5', 2], ['G5', 2], ['C6', 4], ['B5', 2], ['A5', 2], ['E5', 4],
               ['D#5', 4], ['F#5', 4], ['B5', 8]],
    }),
    // Jefe secreto: El Coloso Ingrávido — pesado y flotante a la vez: metales
    // graves y tambores lentos con una celesta que flota por encima (Do menor)
    coloso: build({
      bpm: 92, arp: true, arpOct: 0, inst: { arp: 'celesta', mel: 'brass', bass: 'bass' },
      choir: true, choirOct: -1, bass: 'whole', bassDown: 2,
      drums: [['taiko', [0], 1, 62, 1.4], ['taiko', [3, 5], 1, 95, 0.8], ['crash', [0], 4, 0, 0.8]],
      chords: [['C4', 1], ['G#3', 0], ['F3', 1], ['G3', 0], ['C4', 1], ['A#3', 0], ['G#3', 0], ['G3', 0]],
      melody: [['G4', 4], ['C5', 4], ['D#5', 3], ['D5', 1], ['C5', 4],
               ['G#4', 4], ['C5', 2], ['F5', 2], ['D5', 6], ['B4', 2],
               ['C5', 2], ['D#5', 2], ['G5', 4], ['F5', 3], ['D#5', 1], ['D5', 4],
               ['D#5', 2], ['C5', 2], ['G#4', 4], ['B4', 4], ['D5', 4]],
    }),
    // Jefes: Los Guardias del Castillo — marcha marcial: cuerdas a paso de
    // desfile, fanfarria de metales y tambores de marcha (Sol menor)
    guardias: build({
      bpm: 132, inst: { ost: 'strings', mel: 'brass', bass: 'bass' },
      ost: [0, 0, 7, 0, 0, 7, 12, 7], ostOct: -1,
      choir: true, choirOct: -1, bass: 'drive', bassDown: 2,
      drums: [['taiko', [0, 4], 1, 100, 1.1], ['taiko', [2, 6], 1, 140, 0.6],
              ['hat', [1, 3, 5, 7], 1, 0, 0.5], ['crash', [0], 4, 0, 0.8]],
      chords: [['G3', 1], ['G3', 1], ['D#4', 0], ['F3', 0], ['G3', 1], ['C4', 1], ['D4', 0], ['D4', 0]],
      melody: [['G4', 2], ['G4', 1], ['G4', 1], ['D5', 4],
               ['C5', 2], ['A#4', 2], ['A4', 2], ['G4', 2],
               ['A#4', 3], ['C5', 1], ['D#5', 4],
               ['D5', 2], ['C5', 2], ['F5', 4],
               ['G5', 3], ['F5', 1], ['D5', 2], ['A#4', 2],
               ['C5', 2], ['D#5', 2], ['G5', 2], ['F5', 2],
               ['F#5', 4], ['D5', 2], ['A4', 2],
               ['F#4', 2], ['A4', 2], ['D5', 4]],
    }),
  };

  function play(name) {
    if (!ac || name === trackName) return;
    trackName = name;
    // fundido de salida del tema anterior
    if (bus) {
      const old = bus;
      old.gain.cancelScheduledValues(ac.currentTime);
      old.gain.setValueAtTime(old.gain.value, ac.currentTime);
      old.gain.linearRampToValueAtTime(0, ac.currentTime + 0.8);
      setTimeout(() => old.disconnect(), 3500);
    }
    bus = ac.createGain();
    bus.gain.setValueAtTime(0, ac.currentTime);
    bus.gain.linearRampToValueAtTime(1, ac.currentTime + 1.2);
    bus.connect(master);
    track = TRACKS[name]; step = 0; nextTime = ac.currentTime + 0.15;
  }

  function schedule() {
    if (!ac || !track || ac.state !== 'running') return;
    while (nextTime < ac.currentTime + 0.12) {
      for (const [role, f, len, v] of track.ev[step]) {
        const inst = INST[(track.inst && track.inst[role]) || role];
        if (inst) inst(nextTime, f, len * track.stepDur, v);
      }
      nextTime += track.stepDur;
      step = (step + 1) % track.steps;
    }
  }

  // Elige el tema según la sala y si el jefe sigue vivo
  function update() {
    if (!ac) return;
    let name = 'ruinas';
    if (currentRoom === 4 && !bossDefeated && !boss.dead) name = 'rey';
    else if (currentRoom === 3 && !boss2Defeated && !boss2.dead) name = 'guardian';
    else if (currentRoom === 13) name = !guardsDefeated ? 'guardias' : 'cumbre';
    else if (currentRoom === 12) name = !boss3Defeated && !boss3.dead ? 'coloso' : 'ruinas';
    else if (zoneOf(currentRoom) === 38) name = 'ruinas';
    else if (zoneOf(currentRoom) >= 6) name = 'cumbre';
    play(name);
  }

  return { unlock, toggleMute, update, get muted() { return muted; } };
})();

// botón táctil de música
(function () {
  const el = document.getElementById('btn-music');
  if (!el) return;
  const sync = () => { el.textContent = Music.muted ? '🔇' : '🔊'; };
  sync();
  el.addEventListener('touchstart', e => { e.preventDefault(); Music.unlock(); Music.toggleMute(); sync(); }, { passive: false });
})();

// el navegador solo deja sonar audio tras una interacción del jugador
for (const ev of ['keydown', 'pointerdown', 'touchstart']) {
  document.addEventListener(ev, () => Music.unlock(), { passive: true });
}
