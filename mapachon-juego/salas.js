const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const W = 960, H = 540;

// ─── SALAS ───────────────────────────────────────────────────────────────────
// Descansos de piedra del Pasaje de las Púas (sala secreta 44): [desde, hasta]
const SPIKE_LEDGES = [[0, 360], [2200, 2440], [4280, 4520], [6360, 6600], [8440, 8680], [10520, 11520]]; // tramos de púas iguales (1840)
const ROOMS = {
  0: {
    name: 'Entrada a las Ruinas',
    width: 2400, top: -540, // sala grande: abajo la entrada, un tiro para subir y un pasillo alto que sale a la derecha
    bg: ['#050810', '#0a1020'],
    floorColor: '#1a2238',
    platColor:  '#243050',
    edgeColor:  '#314068',
    particleColor: '#4060b0',
    platforms: [
      { x:    0, y: -540, w: 2400, h: 120 }, // techo
      { x:    0, y: -420, w: 1560, h: 450 }, // roca sobre la entrada
      { x:  420, y:   30, w: 1140, h: 150 }, // techo de la sala de abajo
      { x:    0, y:  150, w:   20, h: 330 }, // muro: arriba hay un hueco al que solo se llega con doble salto
      { x:    0, y:  480, w: 2400, h:  60 }, // suelo
      { x: 1800, y: -180, w:  600, h: 660 }, // roca bajo el pasillo de arriba
      { x:  180, y: 370, w: 130, h: 18 },
      { x:  400, y: 300, w: 110, h: 18 },
      { x:  620, y: 370, w: 130, h: 18 },
      { x:  820, y: 290, w: 100, h: 18 },
      { x: 1050, y: 370, w: 130, h: 18 },
      { x: 1280, y: 290, w: 110, h: 18 },
      // tiro para subir al pasillo de arriba
      { x: 1570, y: 370, w: 100, h: 18 },
      { x: 1690, y: 260, w: 100, h: 18 },
      { x: 1570, y: 150, w: 100, h: 18 },
      { x: 1690, y:  40, w: 100, h: 18 },
      { x: 1570, y: -70, w: 100, h: 18 },
    ],
    exits: {
      left:  { room: 39, spawnX: 890, spawnY: 400, band: [30, 150] }, // sala de la broma
    }, // la de la derecha la pone el recorrido (ROUTE)
    spawns: { right: { spawnX: 2330, spawnY: -260 } }, // se llega por el pasillo de arriba
    exitBands: { right: [-420, -180] },
    decorations: [
      { type:'pillar', x:100,  y:420, h:60 },
      { type:'pillar', x:830,  y:420, h:60 },
      { type:'arch',   x:860,  y:200 },
    ],
  },
  1: {
    name: 'Sala de los Cristales',
    width: 2400, top: -540, // caverna de cristal: se entra por abajo a la derecha, se sale arriba a la izquierda
    keyGate: { x: 1080, w: 240 }, // reja con candado en el hueco del techo
    bg: ['#05100a', '#0a1f14'],
    floorColor: '#1a3028', platColor: '#224038', edgeColor: '#2e5448',
    particleColor: '#30c090',
    platforms: [
      { x: 0, y: -540, w: 1080, h: 60 },     // techo, con el hueco de la reja
      { x: 1320, y: -540, w: 1080, h: 60 },
      { x: 0, y: -480, w: 600, h: 180 },     // roca sobre el pasillo de la izquierda
      { x: 0, y: -60, w: 600, h: 540 },      // roca bajo el pasillo de la izquierda
      { x: 1800, y: -480, w: 600, h: 660 },  // roca sobre el pasillo de la derecha
      { x: 0, y: 480, w: 2400, h: 60 },      // suelo
      // escalones de la caverna: al pasillo de la izquierda y luego hasta la reja
      { x: 700, y: 370, w: 140, h: 18 },
      { x: 950, y: 270, w: 140, h: 18 },
      { x: 700, y: 170, w: 140, h: 18 },
      { x: 950, y: 70, w: 140, h: 18 },
      { x: 700, y: -30, w: 120, h: 18 },
      { x: 950, y: -130, w: 140, h: 18 },
      { x: 1150, y: -230, w: 140, h: 18 },
      { x: 1350, y: -330, w: 140, h: 18 },
      { x: 1150, y: -420, w: 140, h: 18 },
      // lado derecho de la caverna
      { x: 1450, y: 370, w: 160, h: 18 },
      { x: 1600, y: 260, w: 140, h: 18 },
    ],
    exits: {
      up: { room: 22, spawnX: 470, spawnY: 400 },
    }, // izquierda y derecha las pone el recorrido (ROUTE)
    spawns: { left: { spawnX: 30, spawnY: -140 } }, // se llega por el pasillo alto
    exitBands: { left: [-300, -60], right: [200, 460], up: [1080, 1320] },
    decorations: [
      { type:'crystal', x:880,  y:-480, h:960 },
      { type:'crystal', x:1520, y:-480, h:960 },
      { type:'crystal', x:1240, y:-120, h:600 },
      { type:'arch',    x:1950, y:220 },
      { type:'arch',    x:2200, y:220 },
    ],
  },
  2: {
    name: 'Jardín Putrefacto',
    width: 2400, top: -540, // jardín en tres pisos: se entra abajo a la derecha y se sale arriba a la izquierda
    bg: ['#0a0805', '#1a1205'],
    floorColor: '#2a2010', platColor: '#3a2e18', edgeColor: '#4a3e28',
    particleColor: '#c08030',
    platforms: [
      { x: 0, y: -540, w: 2400, h: 60 },     // techo
      { x: 2100, y: -480, w: 300, h: 680 },  // roca de la derecha (abajo queda la entrada)
      { x: 0, y: -240, w: 1900, h: 60 },     // piso de arriba
      { x: 300, y: 120, w: 1800, h: 60 },    // piso de en medio
      { x: 0, y: 480, w: 2400, h: 60 },      // suelo
      { x: 1100, y: 420, w: 260, h: 60 },    // loma
      // tiro de la izquierda: del suelo al piso de en medio
      { x: 40, y: 380, w: 110, h: 18 },
      { x: 170, y: 280, w: 110, h: 18 },
      { x: 40, y: 180, w: 110, h: 18 },
      // tiro de la derecha: del piso de en medio al de arriba
      { x: 1930, y: 20, w: 100, h: 18 },
      { x: 1990, y: -80, w: 100, h: 18 },
      { x: 1920, y: -180, w: 100, h: 18 },
      // plataformas sueltas
      { x: 600, y: 370, w: 140, h: 18 },
      { x: 1650, y: 370, w: 140, h: 18 },
      { x: 900, y: 20, w: 140, h: 18 },
      { x: 1400, y: 20, w: 140, h: 18 },
      { x: 700, y: -350, w: 160, h: 18 },
      { x: 1300, y: -350, w: 160, h: 18 },
    ],
    exits: {}, // las pone el recorrido (ROUTE)
    spawns: { left: { spawnX: 30, spawnY: -320 } }, // se llega por el piso de arriba
    exitBands: { left: [-480, -240], right: [200, 460] },
    decorations: [
      { type:'mushroom', x:450, y:480 },
      { type:'mushroom', x:1500, y:480 },
      { type:'mushroom', x:2250, y:480 },
      { type:'mushroom', x:600, y:120 },
      { type:'mushroom', x:1700, y:120 },
      { type:'mushroom', x:400, y:-240 },
      { type:'mushroom', x:1100, y:-240 },
    ],
  },
  3: {
    name: 'La Cima — Cielo Fracturado',
    bg: ['#100818', '#1a0e28'],
    floorColor: '#2a1848',
    platColor:  '#3a2060',
    edgeColor:  '#503080',
    particleColor: '#c080ff',
    platforms: [
      { x:   0, y: 480, w: 370, h: 60 }, // suelo izquierdo
      { x: 590, y: 480, w: 370, h: 60 }, // suelo derecho
      { x: 370, y: 480, w: 220, h: 60, trapdoor: true }, // puerta al cielo fracturado
      { x: 200, y: 370, w: 160, h: 18 },
      { x: 420, y: 270, w: 120, h: 18 },
      { x: 640, y: 370, w: 160, h: 18 },
      { x: 360, y: 160, w: 240, h: 18 },
    ],
    exits: {
      down:  { room: 1, spawnX: 1207, spawnY: -470 }, // cae junto a la reja
      up:    { room: 24, spawnX: 320, spawnY: 400 }, // armería (tras vencer al guardián)
      right: { room: 26, spawnX:  30, spawnY: 400 }, // castillo (tras vencer al guardián)
    },
    decorations: [
      { type:'star', x:100, y: 80 },
      { type:'star', x:300, y:140 },
      { type:'star', x:600, y: 60 },
      { type:'star', x:800, y:120 },
    ],
  },
  4: {
    name: 'Sala del Último Rey',
    bg: ['#100505', '#200808'],
    floorColor: '#301010',
    platColor:  '#481818',
    edgeColor:  '#602020',
    particleColor: '#ff4040',
    platforms: [
      { x:   0, y: 480, w: 960, h: 60 },
      { x:  80, y: 400, w: 120, h: 18 },
      { x: 280, y: 320, w: 160, h: 18 },
      { x: 500, y: 240, w: 160, h: 18 },
      { x: 720, y: 320, w: 160, h: 18 },
      { x: 850, y: 400, w: 110, h: 18 },
      // escalera secreta camuflada junto a la pared derecha
      { x: 890, y: 330, w: 70, h: 12, secretStair: true },
      { x: 890, y: 255, w: 70, h: 12, secretStair: true },
      { x: 890, y: 180, w: 70, h: 12, secretStair: true },
      { x: 890, y: 105, w: 70, h: 12, secretStair: true },
    ],
    exits: {
      left: { room: 21, spawnX: 1390, spawnY: 400 },
      up:   { room: 12, spawnX: 80, spawnY: 400 }, // sala secreta
    },
    decorations: [
      { type:'throne', x:430, y:180 },
      { type:'pillar', x:100, y:420, h:60 },
      { type:'pillar', x:830, y:420, h:60 },
    ],
  },
  5: {
    name: 'Armería Olvidada',
    bg: ['#060412', '#0e0820'],
    floorColor: '#1c1430',
    platColor:  '#2c2048',
    edgeColor:  '#4a3870',
    particleColor: '#9944ff',
    platforms: [
      { x:   0, y: 480, w: 960, h: 60 },
      { x:  80, y: 390, w: 150, h: 18 },
      { x: 405, y: 390, w: 150, h: 18 },
      { x: 730, y: 390, w: 150, h: 18 },
    ],
    exits: { left: { room: 3, spawnX: 460, spawnY: 110 } },
    decorations: [
      { type:'pillar', x: 40, y:420, h:60 },
      { type:'pillar', x:920, y:420, h:60 },
      { type:'pillar', x:250, y:420, h:60 },
      { type:'pillar', x:480, y:420, h:60 },
      { type:'pillar', x:710, y:420, h:60 },
    ],
  },
  6: {
    name: 'Castillo del Umbral',
    width: 2400, top: -540, // salón del castillo en tres pisos: se entra abajo a la izquierda y se sube por el techo
    upSpawnX: 1220,         // al bajar de La Cumbre
    bg: ['#0c0a10', '#18141e'],
    floorColor: '#2a2630', platColor: '#3a3542', edgeColor: '#55505e',
    particleColor: '#ff9a40',
    platforms: [
      { x: 0, y: -540, w: 1100, h: 60 },
      // techo, con el hueco a La Cumbre
      { x: 1300, y: -540, w: 1100, h: 60 },
      { x: 0, y: 480, w: 2400, h: 60 },
      // suelo
      { x: 0, y: 120, w: 2000, h: 40 },
      // primer piso
      { x: 400, y: -240, w: 2000, h: 40 },
      // segundo piso
      // a la derecha: del suelo al primer piso
      { x: 2100, y: 380, w: 110, h: 18 },
      { x: 2250, y: 280, w: 110, h: 18 },
      { x: 2100, y: 190, w: 110, h: 18 },
      // a la izquierda: del primer piso al segundo
      { x: 150, y: 30, w: 110, h: 18 },
      { x: 280, y: -70, w: 110, h: 18 },
      { x: 150, y: -160, w: 110, h: 18 },
      // hasta el hueco del techo
      { x: 1050, y: -340, w: 110, h: 18 },
      { x: 1180, y: -430, w: 110, h: 18 },
    ],
    // Solo sube a La Cumbre Quebrantada (y vuelve al Patio de Armas)
    exits: {
      up:   { room: 7, spawnX: 280, spawnY: 420 },
    }, // la de la izquierda la pone el recorrido (ROUTE)
    spawns: { left: { spawnX: 30, spawnY: 400 } },
    exitBands: { left: [180, 480], up: [1100, 1300] },
    decorations: [
      { type:'bricks' },
      { type:'window', x:500, y:300 }, { type:'window', x:1500, y:300 },
      { type:'window', x:800, y:-60 }, { type:'window', x:1700, y:-60 },
      { type:'window', x:700, y:-400 }, { type:'window', x:1800, y:-400 },
      { type:'torch',  x: 60, y:300 }, { type:'torch', x:1200, y:300 }, { type:'torch', x:2340, y:300 },
      { type:'torch',  x:1000, y:-60 }, { type:'torch', x:600, y:-420 }, { type:'torch', x:2000, y:-420 },
      { type:'pillar', x: 30, y:480, h:120 }, { type:'pillar', x:1000, y:480, h:120 }, { type:'pillar', x:1900, y:480, h:120 },
    ],
  },
  7: {
    name: 'La Cumbre Quebrantada',
    // Sobre la muralla del castillo, estilo "Castle Rock" de Rayman Legends
    style: 'castleRock',
    bg: ['#6e5560', '#c08070'],
    floorColor: '#8a807e',
    platColor:  '#9a908c',
    edgeColor:  '#b4aaa4',
    particleColor: '#ffffff',
    noParticles: true,
    platforms: [
      { x:   0, y: 480, w: 360, h: 60 }, // suelo izquierdo
      { x: 600, y: 480, w: 360, h: 60 }, // suelo derecho (hueco = bajada al castillo)
      { x: 120, y: 370, w: 110, h: 18 },
      { x: 330, y: 290, w: 100, h: 18 },
      { x: 540, y: 220, w: 120, h: 18 },
      { x: 760, y: 330, w: 110, h: 18 },
    ],
    exits: {
      down:  { room: 6, spawnX: 1220, spawnY: -500 },
      right: { room: 28, spawnX:  30, spawnY: 400 }, // subida a la montaña
    },
    decorations: [
      { type:'nightRanges' },
    ],
  },
  // ── Subida a la montaña: cada sala está más alta y es más de noche (night 1-4)
  8: {
    name: 'Sendero Helado',
    style: 'mountain', night: 1,
    bg: ['#010208', '#0e1430'],
    floorColor: '#4a5068', platColor: '#4a5068', edgeColor: '#8a90a8',
    particleColor: '#ffffff',
    noParticles: true,
    platforms: [
      { x:   0, y: 480, w: 420, h: 60 },
      { x: 420, y: 420, w: 540, h: 120 }, // escalón de roca
      { x: 200, y: 350, w: 110, h: 18 },
      { x: 560, y: 310, w: 120, h: 18 },
      { x: 770, y: 240, w: 130, h: 18 },
    ],
    exits: {
      left:  { room: 29, spawnX: 1390, spawnY: 400 },
      right: { room: 30, spawnX:  30, spawnY: 400 },
    },
    decorations: [ { type:'nightRanges', level: 1 } ],
  },
  9: {
    name: 'Paso de la Ventisca',
    style: 'mountain', night: 2,
    bg: ['#010208', '#0e1430'],
    floorColor: '#4a5068', platColor: '#4a5068', edgeColor: '#8a90a8',
    particleColor: '#ffffff',
    noParticles: true,
    platforms: [
      { x:   0, y: 480, w: 330, h: 60 },
      { x: 450, y: 430, w: 510, h: 110 }, // al otro lado de la grieta
      { x: 340, y: 380, w:  90, h: 18 },  // puente sobre la grieta
      { x: 570, y: 330, w: 110, h: 18 },
      { x: 760, y: 260, w: 110, h: 18 },
      { x: 590, y: 180, w: 120, h: 18 },
    ],
    exits: {
      left:  { room: 31, spawnX: 1390, spawnY: 400 },
      right: { room: 32, spawnX: 30, spawnY: 400 },
    },
    decorations: [ { type:'nightRanges', level: 2 } ],
  },
  10: {
    name: 'Risco sin Luna',
    style: 'mountain', night: 3,
    bg: ['#010208', '#0e1430'],
    floorColor: '#4a5068', platColor: '#4a5068', edgeColor: '#8a90a8',
    particleColor: '#ffffff',
    noParticles: true,
    platforms: [
      { x:   0, y: 480, w: 260, h: 60 },
      { x: 700, y: 380, w: 260, h: 160 }, // risco
      { x: 300, y: 400, w: 100, h: 18 },
      { x: 460, y: 330, w: 110, h: 18 },
      { x: 300, y: 240, w: 100, h: 18 },
      { x: 560, y: 190, w: 100, h: 18 },
    ],
    exits: {
      left:  { room: 33, spawnX: 1390, spawnY: 400 },
      right: { room: 34, spawnX: 30, spawnY: 400 },
    },
    decorations: [ { type:'nightRanges', level: 3 } ],
  },
  11: {
    name: 'Pico de la Noche Eterna',
    style: 'mountain', night: 4,
    bg: ['#010208', '#0e1430'],
    floorColor: '#4a5068', platColor: '#4a5068', edgeColor: '#8a90a8',
    particleColor: '#ffffff',
    noParticles: true,
    platforms: [
      { x:   0, y: 480, w: 340, h: 60 },
      { x: 340, y: 420, w: 280, h: 120 },
      { x: 620, y: 360, w: 340, h: 180 }, // la cima
    ],
    exits: {
      left: { room: 35, spawnX: 1390, spawnY: 400 },
    },
    hatch: { x: 690, y: 360, w: 56, room: 36 }, // trampilla al interior del castillo
    decorations: [ { type:'nightRanges', level: 4 } ],
  },
  12: {
    name: 'Cámara Ingrávida',
    secret: true,
    width: 1440,   // 1,5 pantallas de ancho…
    top: -270,     // …y 1,5 de alto
    zoom: 960 / 1440, // la cámara se aleja para que quepa la sala entera
    gravity: 0.55, // gravedad más baja: se salta mucho más alto
    bg: ['#04060e', '#0c1428'],
    floorColor: '#22304c',
    platColor:  '#2a3a58',
    edgeColor:  '#4a6a9a',
    particleColor: '#80c0ff',
    platforms: [
      { x:    0, y: 480, w: 1440, h: 60 },
      { x: 1420, y: -270, w: 20, h: 750 }, // pared del fondo
      { x:  160, y:  370, w: 160, h: 18 },
      { x:  620, y:  370, w: 160, h: 18 },
      { x: 1100, y:  370, w: 160, h: 18 },
      { x:  380, y:  240, w: 160, h: 18 },
      { x:  860, y:  240, w: 160, h: 18 },
      { x:  140, y:  110, w: 160, h: 18 },
      { x:  620, y:  110, w: 160, h: 18 },
      { x: 1120, y:  110, w: 160, h: 18 },
      { x:  380, y:  -20, w: 160, h: 18 },
      { x:  860, y:  -20, w: 160, h: 18 },
      { x:  580, y: -150, w: 240, h: 18 },
    ],
    exits: {
      left: { room: 4, spawnX: 900, spawnY: 340 },
    },
    decorations: [ { type:'floatStones' } ],
  },
  13: {
    name: 'Salón de la Guardia',
    bg: ['#0c0a10', '#18141e'],
    floorColor: '#2a2630',
    platColor:  '#3a3542',
    edgeColor:  '#55505e',
    particleColor: '#ff9a40',
    platforms: [
      { x:   0, y: 480, w: 960, h: 60 },
      { x: 936, y:   0, w: 24, h: 360 },             // muro sobre la puerta
      { x: 936, y: 360, w: 24, h: 120, door: true },  // puerta de las dos llaves
      { x:  90, y: 380, w: 150, h: 18 },
      { x: 720, y: 380, w: 150, h: 18 },
      { x: 290, y: 280, w: 130, h: 18 },
      { x: 540, y: 280, w: 130, h: 18 },
      { x: 400, y: 170, w: 160, h: 18 }, // rellano bajo la salida
    ],
    // Se entra cayendo por la trampilla del pico; se sale por arriba al vencer a los guardias
    exits: {
      up:    { room: 11, spawnX: 780, spawnY: 300 },
      right: { room: 38, spawnX: 30, spawnY: 400 }, // capítulo III (con las dos llaves)
    },
    decorations: [
      { type:'bricks' },
      { type:'window', x:180, y:110 },
      { type:'window', x:780, y:110 },
      { type:'torch',  x: 60, y:300 },
      { type:'torch',  x:900, y:300 },
      { type:'torch',  x:330, y:200 },
      { type:'torch',  x:630, y:200 },
      { type:'pillar', x: 30, y:480, h:120 },
      { type:'pillar', x:930, y:480, h:120 },
    ],
  },
  // ── Salas añadidas: cada zona tiene ahora 3 salas (zone = sala principal)
  14: {
    name: 'Pasillo Derrumbado',
    width: 2400, top: -540, // pasillo bajo con escombros, un tiro a la derecha y otro pasillo de vuelta que sube por el techo
    upSpawnX: 317,          // al bajar desde arriba caes por el tiro de la izquierda
    zone: 0,
    bg: ['#050810', '#0a1020'],
    floorColor: '#1a2238', platColor: '#243050', edgeColor: '#314068',
    particleColor: '#4060b0',
    platforms: [
      { x: 0, y: -540, w: 240, h: 60 },      // techo, con el hueco de subida
      { x: 420, y: -540, w: 1980, h: 60 },
      { x: 0, y: -480, w: 240, h: 360 },     // roca a los lados del tiro de subida
      { x: 420, y: -480, w: 1980, h: 360 },
      { x: 0, y: -120, w: 20, h: 360 },      // pared izquierda del pasillo de en medio
      { x: 0, y: 120, w: 1800, h: 120 },     // suelo del pasillo de en medio = techo del de abajo
      { x: 2040, y: -120, w: 360, h: 360 },  // roca a la derecha del tiro
      { x: 0, y: 480, w: 2400, h: 60 },      // suelo
      { x: 600, y: 400, w: 120, h: 80 },     // escombros del derrumbe
      { x: 1150, y: 380, w: 160, h: 100 },
      { x: 600, y: 80, w: 100, h: 40 },      // escombros del pasillo de en medio
      { x: 1300, y: 60, w: 140, h: 60 },
      // tiro de la derecha (sube al pasillo de en medio)
      { x: 1910, y: 380, w: 120, h: 18 },
      { x: 1810, y: 280, w: 110, h: 18 },
      { x: 1920, y: 180, w: 110, h: 18 },
      // tiro de la izquierda (sube hasta el techo)
      { x: 250, y: 10, w: 100, h: 18 },
      { x: 320, y: -100, w: 90, h: 18 },
      { x: 250, y: -210, w: 100, h: 18 },
      { x: 320, y: -320, w: 90, h: 18 },
      { x: 250, y: -430, w: 100, h: 18 },
      { x: 2370, y: 240, w: 30, h: 240 },    // pared
    ],
    exits: {}, // las pone el recorrido (ROUTE)
    exitBands: { left: [260, 460], up: [240, 420] },
    decorations: [ { type:'pillar', x:60, y:420, h:60 }, { type:'arch', x:440, y:260 }, { type:'pillar', x:900, y:420, h:60 } ],
  },
  15: {
    name: 'Galería de los Ecos',
    width: 2400, top: -540, // se llega por abajo a una galería enorme; arriba un pasillo largo sale a la izquierda
    zone: 0,
    bg: ['#050810', '#0a1020'],
    floorColor: '#1a2238', platColor: '#243050', edgeColor: '#314068',
    particleColor: '#4060b0',
    platforms: [
      { x: 0, y: -540, w: 2400, h: 120 },    // techo
      { x: 0, y: -180, w: 1700, h: 120 },    // suelo del pasillo de arriba = techo de la galería
      { x: 0, y: -60, w: 20, h: 540 },       // pared izquierda de la galería
      { x: 2370, y: -420, w: 30, h: 800 },   // pared derecha
      { x: 2370, y: 380, w: 30, h: 100, breakable: 'w15' }, // parece pared: se rompe a golpes
      { x: 0, y: 480, w: 240, h: 60 },       // suelo, con el hueco de bajada
      { x: 420, y: 480, w: 1980, h: 60 },
      // balcones de la galería, subiendo hacia la derecha
      { x: 700, y: 370, w: 200, h: 18 },
      { x: 1000, y: 270, w: 160, h: 18 },
      { x: 1300, y: 170, w: 200, h: 18 },
      { x: 1620, y: 80, w: 140, h: 18 },
      { x: 1880, y: -20, w: 140, h: 18 },
      { x: 1740, y: -110, w: 120, h: 18 },
      // pasillo de arriba
      { x: 800, y: -260, w: 140, h: 80 },
      { x: 1500, y: -240, w: 120, h: 60 },
    ],
    exits: { right: { room: 43, spawnX: 30, spawnY: 400, hidden: true } }, // el resto las pone el recorrido (ROUTE)
    spawns: { left: { spawnX: 30, spawnY: -260 }, down: { spawnX: 470, spawnY: 400 } },
    exitBands: { left: [-420, -180], down: [240, 420] },
    decorations: [ { type:'pillar', x:60, y:420, h:60 }, { type:'arch', x:440, y:200 }, { type:'pillar', x:900, y:420, h:60 } ],
  },
  16: {
    name: 'Grieta de Cuarzo',
    width: 2400, top: -540, // grieta que baja en terrazas, de arriba a la derecha al hueco de abajo a la izquierda
    zone: 1,
    bg: ['#05100a', '#0a1f14'],
    floorColor: '#1a3028', platColor: '#224038', edgeColor: '#2e5448',
    particleColor: '#30c090',
    platforms: [
      { x: 0, y: -540, w: 2400, h: 60 },     // techo
      { x: 0, y: -480, w: 240, h: 560 },     // roca de la izquierda
      { x: 0, y: 80, w: 240, h: 100, breakable: 'w16' }, // parece roca: se rompe a golpes
      { x: 0, y: 180, w: 240, h: 300 },
      { x: 240, y: -480, w: 1320, h: 240 },  // techo de la grieta
      { x: 1560, y: -480, w: 840, h: 180 },  // roca sobre el pasillo de arriba
      { x: 1560, y: -60, w: 840, h: 540 },   // roca bajo el pasillo de arriba
      { x: 600, y: -60, w: 960, h: 60 },     // terraza de arriba
      { x: 240, y: 180, w: 960, h: 60 },     // terraza de en medio
      { x: 0, y: 480, w: 240, h: 60 },       // suelo, con el hueco de bajada
      { x: 420, y: 480, w: 1980, h: 60 },
      // escalones para volver a subir
      { x: 1300, y: 380, w: 120, h: 18 },
      { x: 1220, y: 280, w: 120, h: 18 },
      { x: 470, y: 80, w: 110, h: 18 },
      { x: 480, y: -30, w: 100, h: 18 },
    ],
    exits: { left: { room: 40, spawnX: 890, spawnY: 400, hidden: true } }, // el resto las pone el recorrido (ROUTE)
    spawns: { right: { spawnX: 2330, spawnY: -140 }, down: { spawnX: 470, spawnY: 400 } },
    exitBands: { right: [-300, -60], down: [240, 420] },
    decorations: [ { type:'crystal', x:700, y:-240, h:720 }, { type:'crystal', x:1400, y:-240, h:720 }, { type:'crystal', x:400, y:-240, h:720 } ],
  },
  17: {
    name: 'Cueva Luminosa',
    width: 2400, top: -540, // se cae por un tiro a una galería luminosa y por un hueco a la cueva grande
    upSpawnX: 317,          // al bajar desde arriba caes por el tiro
    zone: 1,
    bg: ['#05100a', '#0a1f14'],
    floorColor: '#1a3028', platColor: '#224038', edgeColor: '#2e5448',
    particleColor: '#30c090',
    platforms: [
      { x: 0, y: -540, w: 240, h: 60 },      // techo, con el hueco del tiro
      { x: 420, y: -540, w: 1980, h: 60 },
      { x: 0, y: -480, w: 240, h: 720 },     // roca de la izquierda (hasta el pasillo de salida)
      { x: 420, y: -480, w: 1980, h: 180 },  // roca sobre la galería
      { x: 2160, y: -300, w: 240, h: 360 },  // roca a la derecha de la galería
      { x: 240, y: -60, w: 1660, h: 120 },   // suelo de la galería = techo de la cueva
      { x: 0, y: 480, w: 2400, h: 60 },      // suelo
      // tiro de arriba
      { x: 250, y: -170, w: 100, h: 18 },
      { x: 320, y: -280, w: 90, h: 18 },
      { x: 250, y: -390, w: 100, h: 18 },
      // hueco entre la galería y la cueva
      { x: 1950, y: 380, w: 120, h: 18 },
      { x: 2060, y: 280, w: 100, h: 18 },
      { x: 1950, y: 180, w: 120, h: 18 },
      { x: 2060, y: 80, w: 100, h: 18 },
      { x: 1950, y: -20, w: 100, h: 18 },
      // cueva
      { x: 600, y: 380, w: 140, h: 18 },
      { x: 900, y: 300, w: 140, h: 18 },
      { x: 1300, y: 380, w: 160, h: 18 },
      { x: 2370, y: 60, w: 30, h: 420 },     // pared
    ],
    exits: {}, // las pone el recorrido (ROUTE)
    exitBands: { left: [260, 460], up: [240, 420] },
    decorations: [ { type:'crystal', x:800, y:60, h:420 }, { type:'crystal', x:1500, y:60, h:420 }, { type:'crystal', x:1100, y:-300, h:240 } ],
  },
  18: {
    name: 'Raíces Podridas',
    width: 2880, top: -540, // cueva grande en forma de L, con pasillos
    upSpawnX: 2380,         // al bajar desde arriba caes por el hueco del techo
    mapCells: [[0, 0], [-1, 0], [-2, 0], [-1, 1], [-2, 1]], // forma en el mapa
    zone: 2,
    style: 'organic', // sala amorfa: todo es tierra con raíces, sin losas rectas
    smooth: true,     // paredes, pisos y techos lisos (sin ondulaciones)
    bg: ['#0a0805', '#1a1205'],
    floorColor: '#2a2010', platColor: '#3a2e18', edgeColor: '#4a3e28',
    particleColor: '#c08030',
    platforms: [
      { x: 0, y: -540, w: 2300, h: 40 },
      { x: 2500, y: -540, w: 380, h: 40 },
      { x: 300, y: -330, w: 2580, h: 60 },
      { x: 2840, y: -500, w: 40, h: 170 },
      { x: 900, y: -270, w: 100, h: 210, joinTop: true }, // columna pegada al techo
      { x: 0, y: -60, w: 100, h: 60 },
      { x: 240, y: -60, w: 860, h: 60 },
      { x: 1240, y: -60, w: 680, h: 60 },
      { x: 1920, y: -60, w: 960, h: 600 },
      { x: 0, y: 480, w: 1920, h: 60 },
      { x: 500, y: 420, w: 200, h: 60 },
      { x: 1500, y: 400, w: 250, h: 80 },
      { x: 600, y: 0, w: 120, h: 50 },
      { x: 300, y: 380, w: 120, h: 18 },
      { x: 120, y: 280, w: 120, h: 18 },
      { x: 300, y: 180, w: 120, h: 18 },
      { x: 105, y: 60, w: 130, h: 18 },
      { x: 1000, y: 380, w: 120, h: 18 },
      { x: 1260, y: 280, w: 120, h: 18 },
      { x: 1000, y: 180, w: 120, h: 18 },
      { x: 1105, y: 60, w: 130, h: 18 },
      { x: 40, y: -150, w: 120, h: 18 },
      { x: 170, y: -240, w: 120, h: 18 },
      { x: 60, y: -330, w: 240, h: 18 },
      { x: 2320, y: -420, w: 160, h: 18 },
    ],
    exits: {}, // las pone el recorrido (ROUTE)
    decorations: [ { type:'mushroom', x:90, y:480 }, { type:'mushroom', x:520, y:480 }, { type:'mushroom', x:880, y:480 } ],
  },
  19: {
    name: 'Pantano de Esporas',
    width: 2400, top: -540, // pantano hondo: se sube por islas de lodo del hueco del suelo al del techo
    upSpawnX: 1060,         // al bajar desde arriba caes por el hueco del techo
    zone: 2,
    bg: ['#0a0805', '#1a1205'],
    floorColor: '#2a2010', platColor: '#3a2e18', edgeColor: '#4a3e28',
    particleColor: '#c08030',
    platforms: [
      { x: 0, y: -540, w: 1000, h: 60 },     // techo, con el hueco de salida
      { x: 1200, y: -540, w: 1200, h: 60 },
      { x: 0, y: -480, w: 200, h: 560 },     // roca de la izquierda
      { x: 2200, y: -480, w: 200, h: 700 },  // roca de la derecha
      { x: 0, y: 480, w: 1900, h: 60 },      // suelo, con el hueco de bajada
      { x: 2100, y: 480, w: 300, h: 60 },
      // islas de lodo que suben en espiral
      { x: 1500, y: 370, w: 200, h: 40 },
      { x: 1180, y: 270, w: 200, h: 40 },
      { x: 860, y: 170, w: 200, h: 40 },
      { x: 540, y: 70, w: 200, h: 40 },
      { x: 250, y: -30, w: 180, h: 40 },
      { x: 560, y: -130, w: 200, h: 40 },
      { x: 880, y: -230, w: 200, h: 40 },
      { x: 1180, y: -330, w: 140, h: 18 },
      { x: 1020, y: -430, w: 120, h: 18 },
      // islas de la derecha
      { x: 1850, y: 230, w: 220, h: 40 },
      { x: 1600, y: 100, w: 160, h: 18 },
      { x: 1850, y: -60, w: 200, h: 40 },
    ],
    exits: {}, // las pone el recorrido (ROUTE)
    spawns: { down: { spawnX: 2250, spawnY: 400 } }, // se sube por el hueco del suelo
    exitBands: { down: [1900, 2100], up: [1000, 1200] },
    decorations: [ { type:'mushroom', x:500, y:480 }, { type:'mushroom', x:1300, y:480 }, { type:'mushroom', x:2300, y:480 } ],
  },
  20: {
    name: 'Antesala Carmesí',
    width: 2400, top: -540, // salón alto con balcones: se sube del hueco del suelo al pasillo de arriba a la derecha
    zone: 4,
    bg: ['#100505', '#200808'],
    floorColor: '#301010', platColor: '#481818', edgeColor: '#602020',
    particleColor: '#ff4040',
    platforms: [
      { x: 0, y: -540, w: 2400, h: 60 },
      // techo
      { x: 1900, y: -480, w: 500, h: 180 },
      // roca sobre el pasillo de salida
      { x: 1900, y: -60, w: 500, h: 540 },
      // roca bajo el pasillo de salida
      { x: 0, y: 480, w: 200, h: 60 },
      // suelo, con el hueco de bajada
      { x: 400, y: 480, w: 2000, h: 60 },
      // balcones que suben en zigzag
      { x: 600, y: 380, w: 200, h: 24 },
      { x: 950, y: 280, w: 300, h: 30 },
      { x: 1400, y: 180, w: 300, h: 30 },
      { x: 1000, y: 70, w: 250, h: 30 },
      { x: 600, y: -40, w: 250, h: 30 },
      { x: 200, y: -150, w: 250, h: 30 },
      { x: 550, y: -250, w: 1350, h: 30 },
      // galería de arriba, hasta el pasillo
    ],
    exits: {}, // las pone el recorrido (ROUTE)
    spawns: { right: { spawnX: 2330, spawnY: -140 }, down: { spawnX: 470, spawnY: 400 } },
    exitBands: { right: [-300, -60], down: [200, 400] },
    decorations: [ { type:'pillar', x:800, y:420, h:60 }, { type:'pillar', x:1300, y:420, h:60 }, { type:'pillar', x:1750, y:420, h:60 } ],
  },
  21: {
    name: 'Corredor del Trono',
    width: 2400, top: -540, // se entra arriba a la izquierda y se baja por terrazas al pasillo del trono
    zone: 4,
    bg: ['#100505', '#200808'],
    floorColor: '#301010', platColor: '#481818', edgeColor: '#602020',
    particleColor: '#ff4040',
    platforms: [
      { x: 0, y: -540, w: 2400, h: 60 },
      // techo
      { x: 0, y: -480, w: 700, h: 180 },
      // roca sobre el pasillo de entrada
      { x: 0, y: -60, w: 700, h: 140 },
      // piso del pasillo de entrada (abajo queda el rincón del banco)
      { x: 700, y: 120, w: 500, h: 60 },
      // terrazas que bajan
      { x: 1350, y: 300, w: 400, h: 40 },
      { x: 2100, y: -480, w: 300, h: 640 },
      // roca sobre la puerta del trono
      { x: 0, y: 480, w: 2400, h: 60 },
      // suelo
      // escalones para volver a subir
      { x: 1800, y: 390, w: 110, h: 18 },
      { x: 1230, y: 210, w: 100, h: 18 },
      { x: 800, y: 30, w: 110, h: 18 },
    ],
    exits: {}, // las pone el recorrido (ROUTE)
    spawns: { left: { spawnX: 30, spawnY: -140 } }, // se llega por el pasillo de arriba
    exitBands: { left: [-300, -60], right: [160, 480] },
    decorations: [ { type:'pillar', x:100, y:420, h:60 }, { type:'pillar', x:1300, y:420, h:60 }, { type:'pillar', x:2050, y:420, h:60 } ],
  },
  22: {
    name: 'Pozo de las Estrellas',
    width: 2400, top: -540, // pozo grande lleno de estrellas: se sube por piedras flotantes del hueco del suelo al del techo
    upSpawnX: 2100,         // al bajar desde arriba caes en la última piedra
    zone: 3,
    bg: ['#100818', '#1a0e28'],
    floorColor: '#2a1848', platColor: '#3a2060', edgeColor: '#503080',
    particleColor: '#c080ff',
    platforms: [
      { x: 0, y: -540, w: 2000, h: 60 },
      // techo, con el hueco de salida
      { x: 2200, y: -540, w: 200, h: 60 },
      { x: 0, y: -480, w: 150, h: 700 },
      // roca de la izquierda
      { x: 1950, y: 160, w: 450, h: 320 },
      // roca de abajo a la derecha
      { x: 0, y: 480, w: 200, h: 60 },
      // suelo, con el hueco de bajada a la reja
      { x: 400, y: 480, w: 2000, h: 60 },
      // subida: escalones, una isla, vuelta a la izquierda y piedras flotantes hacia el hueco
      { x: 700, y: 380, w: 140, h: 18 },
      { x: 1000, y: 290, w: 140, h: 18 },
      { x: 1300, y: 200, w: 140, h: 18 },
      { x: 1500, y: 100, w: 400, h: 40 },
      { x: 1250, y: 0, w: 140, h: 18 },
      { x: 980, y: -100, w: 140, h: 18 },
      { x: 700, y: -200, w: 140, h: 18 },
      { x: 300, y: -300, w: 300, h: 40 },
      { x: 710, y: -320, w: 130, h: 18 },
      { x: 950, y: -320, w: 130, h: 18 },
      { x: 1190, y: -320, w: 130, h: 18 },
      { x: 1430, y: -330, w: 130, h: 18 },
      { x: 1670, y: -340, w: 130, h: 18 },
      { x: 1910, y: -350, w: 130, h: 18 },
      { x: 2050, y: -410, w: 130, h: 18 },
    ],
    exits: {
      up: { room: 23, spawnX: 2250, spawnY: 400 },
      down: { room: 1, spawnX: 1207, spawnY: -470 }, // cae junto a la reja
    },
    spawns: { down: { spawnX: 470, spawnY: 400 } },
    exitBands: { down: [200, 400], up: [2000, 2200] },
    decorations: [ { type:'star', x:300, y:-200 }, { type:'star', x:900, y:-420 }, { type:'star', x:1700, y:-200 }, { type:'star', x:600, y:200 },
      { type:'star', x:1200, y:350 }, { type:'star', x:2200, y:-100 }, { type:'star', x:1800, y:-450 } ],
  },
  23: {
    name: 'Ascenso Fracturado',
    width: 2400, top: -540, // cielo roto en tres pisos: se entra abajo a la derecha y se sale por el techo a la izquierda
    upSpawnX: 290,
    zone: 3,
    bg: ['#100818', '#1a0e28'],
    floorColor: '#2a1848', platColor: '#3a2060', edgeColor: '#503080',
    particleColor: '#c080ff',
    platforms: [
      { x: 0, y: -540, w: 200, h: 60 },
      // techo, con el hueco de salida
      { x: 400, y: -540, w: 2000, h: 60 },
      { x: 0, y: 480, w: 2000, h: 60 },
      // suelo, con el hueco por donde se llega
      { x: 2200, y: 480, w: 200, h: 60 },
      { x: 300, y: 120, w: 2100, h: 40 },
      // piso de en medio
      { x: 0, y: -240, w: 1900, h: 40 },
      // piso de arriba
      // a la izquierda: del suelo al piso de en medio
      { x: 40, y: 380, w: 110, h: 18 },
      { x: 170, y: 280, w: 110, h: 18 },
      { x: 40, y: 180, w: 110, h: 18 },
      // a la derecha: del piso de en medio al de arriba
      { x: 2000, y: 20, w: 110, h: 18 },
      { x: 2200, y: -80, w: 110, h: 18 },
      { x: 2000, y: -170, w: 110, h: 18 },
      // hasta el hueco del techo
      { x: 380, y: -330, w: 110, h: 18 },
      { x: 230, y: -430, w: 110, h: 18 },
      // pedazos de cielo roto
      { x: 800, y: 360, w: 140, h: 18 },
      { x: 1500, y: 360, w: 140, h: 18 },
      { x: 1100, y: 0, w: 160, h: 18 },
      { x: 700, y: -380, w: 140, h: 18 },
      { x: 1400, y: -380, w: 140, h: 18 },
    ],
    exits: {
      up: { room: 3, spawnX: 180, spawnY: 450 },
      down: { room: 22, spawnX: 2100, spawnY: -500 },
    },
    spawns: { down: { spawnX: 2250, spawnY: 400 } },
    exitBands: { up: [200, 400], down: [2000, 2200] },
    decorations: [ { type:'star', x:300, y:-420 }, { type:'star', x:1000, y:-420 }, { type:'star', x:1800, y:-400 }, { type:'star', x:600, y:-60 },
      { type:'star', x:1600, y:-80 }, { type:'star', x:900, y:280 }, { type:'star', x:1900, y:300 } ],
  },
  24: {
    name: 'Escalera del Herrero',
    width: 2400, top: -540, // una gran escalera de piedra que sube en diagonal hasta el hueco del techo
    upSpawnX: 2290,         // al bajar desde arriba caes en el último escalón
    zone: 5,
    bg: ['#060412', '#0e0820'],
    floorColor: '#1c1430', platColor: '#2c2048', edgeColor: '#4a3870',
    particleColor: '#9944ff',
    platforms: [
      { x: 0, y: -540, w: 2220, h: 60 },
      // techo, con el hueco de salida a la derecha
      { x: 0, y: -480, w: 840, h: 480 },
      // techo bajo sobre el principio de la escalera
      { x: 840, y: -480, w: 700, h: 200 },
      { x: 0, y: 480, w: 100, h: 60 },
      // suelo, con el hueco de bajada a la Cima
      { x: 300, y: 480, w: 100, h: 60 },
      // escalones
      { x: 400, y: 410, w: 110, h: 130 },
      { x: 510, y: 340, w: 110, h: 200 },
      { x: 620, y: 270, w: 110, h: 270 },
      { x: 730, y: 200, w: 110, h: 340 },
      { x: 840, y: 200, w: 260, h: 340 },
      // descanso 1
      { x: 1100, y: 130, w: 110, h: 410 },
      { x: 1210, y: 60, w: 110, h: 480 },
      { x: 1320, y: -10, w: 110, h: 550 },
      { x: 1430, y: -80, w: 110, h: 620 },
      { x: 1540, y: -80, w: 260, h: 620 },
      // descanso 2
      { x: 1800, y: -150, w: 110, h: 690 },
      { x: 1910, y: -220, w: 110, h: 760 },
      { x: 2020, y: -290, w: 110, h: 830 },
      { x: 2130, y: -360, w: 110, h: 900 },
      { x: 2240, y: -430, w: 160, h: 970 },
      // último escalón, bajo el hueco del techo
    ],
    exits: {
      up: { room: 25, spawnX: 2150, spawnY: 400 },
      down: { room: 3, spawnX: 460, spawnY: 110 },
    },
    exitBands: { down: [100, 300], up: [2220, 2400] },
    decorations: [ { type:'pillar', x:1000, y:200, h:60 }, { type:'pillar', x:1700, y:-80, h:60 } ],
  },
  25: {
    name: 'Depósito de Armas',
    width: 2400, top: -540, // almacén con estantes: se trepa por los estantes y una pasarela hasta el hueco del techo
    zone: 5,
    bg: ['#060412', '#0e0820'],
    floorColor: '#1c1430', platColor: '#2c2048', edgeColor: '#4a3870',
    particleColor: '#9944ff',
    platforms: [
      { x: 0, y: -540, w: 100, h: 60 },
      // techo, con el hueco a la armería
      { x: 300, y: -540, w: 2100, h: 60 },
      { x: 0, y: 480, w: 2220, h: 60 },
      // suelo, con el hueco por donde se llega
      // estante de la derecha (dos columnas de repisas)
      { x: 1850, y: 380, w: 140, h: 18 },
      { x: 1850, y: 180, w: 140, h: 18 },
      { x: 1850, y: -20, w: 140, h: 18 },
      { x: 2010, y: 280, w: 140, h: 18 },
      { x: 2010, y: 80, w: 140, h: 18 },
      { x: 2010, y: -120, w: 140, h: 18 },
      // estante del medio
      { x: 900, y: 380, w: 140, h: 18 },
      { x: 900, y: 180, w: 140, h: 18 },
      { x: 900, y: -20, w: 140, h: 18 },
      { x: 1060, y: 280, w: 140, h: 18 },
      { x: 1060, y: 80, w: 140, h: 18 },
      { x: 1060, y: -120, w: 140, h: 18 },
      // pasarela de arriba (con un hueco sobre el estante del medio)
      { x: 500, y: -220, w: 550, h: 24 },
      { x: 1250, y: -220, w: 650, h: 24 },
      // repisas hasta el hueco del techo
      { x: 330, y: -320, w: 140, h: 18 },
      { x: 160, y: -420, w: 140, h: 18 },
      // cajas
      { x: 1400, y: 420, w: 120, h: 60 },
      { x: 1520, y: 440, w: 80, h: 40 },
      { x: 450, y: 420, w: 100, h: 60 },
    ],
    exits: {
      up: { room: 5, spawnX: 60, spawnY: 400 },
      down: { room: 24, spawnX: 2290, spawnY: -500 },
    },
    exitBands: { up: [100, 300], down: [2220, 2400] },
    decorations: [ { type:'pillar', x:40, y:420, h:60 }, { type:'pillar', x:1750, y:420, h:60 } ],
  },
  26: {
    name: 'Puente Levadizo',
    width: 2400, top: -540, // muralla con foso: abajo el foso (se cae al patio) y arriba el adarve que lo cruza
    zone: 6,
    bg: ['#0c0a10', '#18141e'],
    floorColor: '#2a2630', platColor: '#3a3542', edgeColor: '#55505e',
    particleColor: '#ff9a40',
    platforms: [
      { x: 0, y: -540, w: 2400, h: 60 },
      // techo
      { x: 0, y: -480, w: 1000, h: 300 },
      // muralla de arriba (en medio queda el hueco del rastrillo)
      { x: 1400, y: -480, w: 1000, h: 300 },
      { x: 0, y: 480, w: 820, h: 60 },
      // suelo, con el foso que baja al patio
      { x: 1060, y: 480, w: 1340, h: 60 },
      { x: 400, y: 0, w: 1700, h: 40 },
      // adarve que cruza sobre el foso
      // escalones al adarve
      { x: 100, y: 380, w: 110, h: 18 },
      { x: 250, y: 280, w: 110, h: 18 },
      { x: 100, y: 180, w: 110, h: 18 },
      { x: 250, y: 80, w: 110, h: 18 },
      { x: 2130, y: 380, w: 110, h: 18 },
      { x: 2250, y: 280, w: 110, h: 18 },
      { x: 2130, y: 180, w: 110, h: 18 },
      { x: 2250, y: 80, w: 110, h: 18 },
      { x: 2370, y: -180, w: 30, h: 560 },
      // pared
      { x: 2370, y: 380, w: 30, h: 100, breakable: 'w26' },
      // parece pared: se rompe a golpes
    ],
    exits: { right: { room: 41, spawnX: 30, spawnY: 400, hidden: true } }, // el resto las pone el recorrido (ROUTE)
    spawns: { left: { spawnX: 30, spawnY: 400 }, down: { spawnX: 760, spawnY: 400 } },
    exitBands: { left: [180, 480], down: [820, 1060] },
    decorations: [ { type:'bricks' }, { type:'window', x:600, y:-100 }, { type:'window', x:1800, y:-100 }, { type:'torch', x:60, y:300 }, { type:'torch', x:2320, y:300 } ],
  },
  27: {
    name: 'Patio de Armas',
    width: 2400, top: -540, // patio grande con galerías a los lados: se cae del foso y se sale por la derecha
    upSpawnX: 930,          // al caer del foso
    zone: 6,
    bg: ['#0c0a10', '#18141e'],
    floorColor: '#2a2630', platColor: '#3a3542', edgeColor: '#55505e',
    particleColor: '#ff9a40',
    platforms: [
      { x: 0, y: -540, w: 820, h: 60 },
      // techo, con el hueco del foso
      { x: 1060, y: -540, w: 1340, h: 60 },
      { x: 0, y: -480, w: 560, h: 240 },
      // tejado y piso de la galería izquierda
      { x: 0, y: -60, w: 560, h: 40 },
      { x: 1840, y: -480, w: 560, h: 240 },
      // tejado y piso de la galería derecha
      { x: 1840, y: -60, w: 560, h: 40 },
      { x: 0, y: 480, w: 2400, h: 60 },
      // suelo del patio
      // escalones de en medio, hasta el hueco del foso
      { x: 650, y: 380, w: 120, h: 18 },
      { x: 870, y: 290, w: 120, h: 18 },
      { x: 650, y: 200, w: 120, h: 18 },
      { x: 870, y: 110, w: 120, h: 18 },
      { x: 650, y: 20, w: 120, h: 18 },
      { x: 870, y: -70, w: 120, h: 18 },
      { x: 650, y: -160, w: 120, h: 18 },
      { x: 870, y: -250, w: 120, h: 18 },
      { x: 650, y: -340, w: 120, h: 18 },
      { x: 870, y: -430, w: 120, h: 18 },
      // escalones a la galería derecha
      { x: 1700, y: 380, w: 110, h: 18 },
      { x: 1560, y: 290, w: 110, h: 18 },
      { x: 1700, y: 200, w: 110, h: 18 },
      { x: 1560, y: 110, w: 110, h: 18 },
      { x: 1700, y: 20, w: 110, h: 18 },
    ],
    exits: {}, // las pone el recorrido (ROUTE)
    exitBands: { up: [820, 1060], right: [180, 480] },
    decorations: [ { type:'bricks' }, { type:'window', x:1300, y:-250 }, { type:'window', x:1500, y:-250 }, { type:'torch', x:60, y:300 }, { type:'torch', x:2340, y:300 },
      { type:'torch', x:300, y:-130 }, { type:'torch', x:2100, y:-130 } ],
  },
  28: {
    name: 'Adarve Nevado',
    width: 1440, top: -270, // torre: se entra y se sale por cualquier lado
    zone: 7,
    style: 'castleRock',
    bg: ['#6e5560', '#c08070'],
    floorColor: '#8a807e', platColor: '#9a908c', edgeColor: '#b4aaa4',
    particleColor: '#ffffff', noParticles: true,
    platforms: [
      { x: 0, y: 480, w: 1440, h: 60 },
      { x: 150, y: 380, w: 140, h: 18 },
      { x: 1150, y: 380, w: 140, h: 18 },
      { x: 360, y: 280, w: 140, h: 18 },
      { x: 940, y: 280, w: 140, h: 18 },
      { x: 600, y: 180, w: 240, h: 18 },
      { x: 280, y: 80, w: 220, h: 60 },
      { x: 940, y: 80, w: 220, h: 60 },
      { x: 140, y: -20, w: 140, h: 18 },
      { x: 1160, y: -20, w: 140, h: 18 },
      { x: 380, y: -120, w: 140, h: 18 },
      { x: 920, y: -120, w: 140, h: 18 },
      { x: 640, y: -170, w: 160, h: 18 },
      { x: 0, y: -270, w: 90, h: 180 },
      { x: 1350, y: -270, w: 90, h: 150 },
    ],
    exits: {}, // las pone el recorrido (ROUTE)
    decorations: [ { type:'nightRanges' } ],
  },
  29: {
    name: 'Torre del Vigía',
    width: 1440, top: -270, // torre: se entra y se sale por cualquier lado
    zone: 7,
    style: 'castleRock',
    bg: ['#6e5560', '#c08070'],
    floorColor: '#8a807e', platColor: '#9a908c', edgeColor: '#b4aaa4',
    particleColor: '#ffffff', noParticles: true,
    platforms: [
      { x: 0, y: 480, w: 620, h: 60 },
      { x: 820, y: 480, w: 620, h: 60 },
      { x: 150, y: 380, w: 140, h: 18 },
      { x: 1150, y: 380, w: 140, h: 18 },
      { x: 360, y: 280, w: 140, h: 18 },
      { x: 940, y: 280, w: 140, h: 18 },
      { x: 600, y: 180, w: 240, h: 18 },
      { x: 280, y: 80, w: 220, h: 60 },
      { x: 940, y: 80, w: 220, h: 60 },
      { x: 140, y: -20, w: 140, h: 18 },
      { x: 1160, y: -20, w: 140, h: 18 },
      { x: 380, y: -120, w: 140, h: 18 },
      { x: 920, y: -120, w: 140, h: 18 },
      { x: 640, y: -170, w: 160, h: 18 },
      { x: 0, y: -270, w: 90, h: 180 },
      { x: 1350, y: -270, w: 90, h: 150 },
    ],
    exits: {}, // las pone el recorrido (ROUTE)
    decorations: [ { type:'nightRanges' } ],
  },
  30: {
    name: 'Ladera Blanca',
    width: 1440, top: -270, // torre: se entra y se sale por cualquier lado
    zone: 8,
    style: 'mountain', night: 1.33,
    bg: ['#010208', '#0e1430'],
    floorColor: '#4a5068', platColor: '#4a5068', edgeColor: '#8a90a8',
    particleColor: '#ffffff', noParticles: true,
    platforms: [
      { x: 0, y: 480, w: 1440, h: 60 },
      { x: 150, y: 380, w: 140, h: 18 },
      { x: 1150, y: 380, w: 140, h: 18 },
      { x: 360, y: 280, w: 140, h: 18 },
      { x: 940, y: 280, w: 140, h: 18 },
      { x: 600, y: 180, w: 240, h: 18 },
      { x: 280, y: 80, w: 220, h: 60 },
      { x: 940, y: 80, w: 220, h: 60 },
      { x: 140, y: -20, w: 140, h: 18 },
      { x: 1160, y: -20, w: 140, h: 18 },
      { x: 380, y: -120, w: 140, h: 18 },
      { x: 920, y: -120, w: 140, h: 18 },
      { x: 640, y: -170, w: 160, h: 18 },
      { x: 0, y: -270, w: 90, h: 180 },
      { x: 1350, y: -270, w: 90, h: 150 },
      { x: 0, y: -270, w: 30, h: 750 },   // pared
    ],
    exits: {}, // las pone el recorrido (ROUTE)
    decorations: [ { type:'nightRanges', level: 1.33 } ],
  },
  31: {
    name: 'Cornisa Helada',
    width: 1440, top: -270, // torre: se entra y se sale por cualquier lado
    zone: 8,
    style: 'mountain', night: 1.67,
    bg: ['#010208', '#0e1430'],
    floorColor: '#4a5068', platColor: '#4a5068', edgeColor: '#8a90a8',
    particleColor: '#ffffff', noParticles: true,
    platforms: [
      { x: 0, y: 480, w: 620, h: 60 },
      { x: 820, y: 480, w: 620, h: 60 },
      { x: 150, y: 380, w: 140, h: 18 },
      { x: 1150, y: 380, w: 140, h: 18 },
      { x: 360, y: 280, w: 140, h: 18 },
      { x: 940, y: 280, w: 140, h: 18 },
      { x: 600, y: 180, w: 240, h: 18 },
      { x: 280, y: 80, w: 220, h: 60 },
      { x: 940, y: 80, w: 220, h: 60 },
      { x: 140, y: -20, w: 140, h: 18 },
      { x: 1160, y: -20, w: 140, h: 18 },
      { x: 380, y: -120, w: 140, h: 18 },
      { x: 920, y: -120, w: 140, h: 18 },
      { x: 640, y: -170, w: 160, h: 18 },
      { x: 0, y: -270, w: 90, h: 180 },
      { x: 1350, y: -270, w: 90, h: 150 },
      { x: 0, y: -270, w: 30, h: 650 },   // pared
      { x: 0, y: 380, w: 30, h: 100, breakable: 'w31' }, // parece pared: se rompe a golpes
    ],
    exits: { left: { room: 42, spawnX: 890, spawnY: 400, hidden: true } }, // el resto las pone el recorrido (ROUTE)
    decorations: [ { type:'nightRanges', level: 1.67 } ],
  },
  32: {
    name: 'Collado del Viento',
    width: 1440, top: -270, // torre: se entra y se sale por cualquier lado
    zone: 9,
    style: 'mountain', night: 2.33,
    bg: ['#010208', '#0e1430'],
    floorColor: '#4a5068', platColor: '#4a5068', edgeColor: '#8a90a8',
    particleColor: '#ffffff', noParticles: true,
    platforms: [
      { x: 0, y: 480, w: 1440, h: 60 },
      { x: 150, y: 380, w: 140, h: 18 },
      { x: 1150, y: 380, w: 140, h: 18 },
      { x: 360, y: 280, w: 140, h: 18 },
      { x: 940, y: 280, w: 140, h: 18 },
      { x: 600, y: 180, w: 240, h: 18 },
      { x: 280, y: 80, w: 220, h: 60 },
      { x: 940, y: 80, w: 220, h: 60 },
      { x: 140, y: -20, w: 140, h: 18 },
      { x: 1160, y: -20, w: 140, h: 18 },
      { x: 380, y: -120, w: 140, h: 18 },
      { x: 920, y: -120, w: 140, h: 18 },
      { x: 640, y: -170, w: 160, h: 18 },
      { x: 0, y: -270, w: 90, h: 180 },
      { x: 1350, y: -270, w: 90, h: 150 },
    ],
    exits: {}, // las pone el recorrido (ROUTE)
    decorations: [ { type:'nightRanges', level: 2.33 } ],
  },
  33: {
    name: 'Puente de Hielo',
    width: 1440, top: -270, // torre: se entra y se sale por cualquier lado
    zone: 9,
    style: 'mountain', night: 2.67,
    bg: ['#010208', '#0e1430'],
    floorColor: '#4a5068', platColor: '#4a5068', edgeColor: '#8a90a8',
    particleColor: '#ffffff', noParticles: true,
    platforms: [
      { x: 0, y: 480, w: 620, h: 60 },
      { x: 820, y: 480, w: 620, h: 60 },
      { x: 150, y: 380, w: 140, h: 18 },
      { x: 1150, y: 380, w: 140, h: 18 },
      { x: 360, y: 280, w: 140, h: 18 },
      { x: 940, y: 280, w: 140, h: 18 },
      { x: 600, y: 180, w: 240, h: 18 },
      { x: 280, y: 80, w: 220, h: 60 },
      { x: 940, y: 80, w: 220, h: 60 },
      { x: 140, y: -20, w: 140, h: 18 },
      { x: 1160, y: -20, w: 140, h: 18 },
      { x: 380, y: -120, w: 140, h: 18 },
      { x: 920, y: -120, w: 140, h: 18 },
      { x: 640, y: -170, w: 160, h: 18 },
      { x: 0, y: -270, w: 90, h: 180 },
      { x: 1350, y: -270, w: 90, h: 150 },
    ],
    exits: {}, // las pone el recorrido (ROUTE)
    decorations: [ { type:'nightRanges', level: 2.67 } ],
  },
  34: {
    name: 'Pared Negra',
    width: 1440, top: -270, // torre: se entra y se sale por cualquier lado
    zone: 10,
    style: 'mountain', night: 3.33,
    bg: ['#010208', '#0e1430'],
    floorColor: '#4a5068', platColor: '#4a5068', edgeColor: '#8a90a8',
    particleColor: '#ffffff', noParticles: true,
    platforms: [
      { x: 0, y: 480, w: 1440, h: 60 },
      { x: 150, y: 380, w: 140, h: 18 },
      { x: 1150, y: 380, w: 140, h: 18 },
      { x: 360, y: 280, w: 140, h: 18 },
      { x: 940, y: 280, w: 140, h: 18 },
      { x: 600, y: 180, w: 240, h: 18 },
      { x: 280, y: 80, w: 220, h: 60 },
      { x: 940, y: 80, w: 220, h: 60 },
      { x: 140, y: -20, w: 140, h: 18 },
      { x: 1160, y: -20, w: 140, h: 18 },
      { x: 380, y: -120, w: 140, h: 18 },
      { x: 920, y: -120, w: 140, h: 18 },
      { x: 640, y: -170, w: 160, h: 18 },
      { x: 0, y: -270, w: 90, h: 180 },
      { x: 1350, y: -270, w: 90, h: 150 },
    ],
    exits: {}, // las pone el recorrido (ROUTE)
    decorations: [ { type:'nightRanges', level: 3.33 } ],
  },
  35: {
    name: 'Último Refugio',
    width: 1440, top: -270, // torre: se entra y se sale por cualquier lado
    zone: 10,
    style: 'mountain', night: 3.67,
    bg: ['#010208', '#0e1430'],
    floorColor: '#4a5068', platColor: '#4a5068', edgeColor: '#8a90a8',
    particleColor: '#ffffff', noParticles: true,
    platforms: [
      { x: 0, y: 480, w: 620, h: 60 },
      { x: 820, y: 480, w: 620, h: 60 },
      { x: 150, y: 380, w: 140, h: 18 },
      { x: 1150, y: 380, w: 140, h: 18 },
      { x: 360, y: 280, w: 140, h: 18 },
      { x: 940, y: 280, w: 140, h: 18 },
      { x: 600, y: 180, w: 240, h: 18 },
      { x: 280, y: 80, w: 220, h: 60 },
      { x: 940, y: 80, w: 220, h: 60 },
      { x: 140, y: -20, w: 140, h: 18 },
      { x: 1160, y: -20, w: 140, h: 18 },
      { x: 380, y: -120, w: 140, h: 18 },
      { x: 920, y: -120, w: 140, h: 18 },
      { x: 640, y: -170, w: 160, h: 18 },
      { x: 0, y: -270, w: 90, h: 180 },
      { x: 1350, y: -270, w: 90, h: 150 },
    ],
    exits: {}, // las pone el recorrido (ROUTE)
    decorations: [ { type:'nightRanges', level: 3.67 } ],
  },
  36: {
    name: 'Mazmorra Alta',
    zone: 13,
    bg: ['#0c0a10', '#18141e'],
    floorColor: '#2a2630', platColor: '#3a3542', edgeColor: '#55505e',
    particleColor: '#ff9a40',
    platforms: [
      { x: 0, y: 480, w: 380, h: 60 },
      { x: 580, y: 480, w: 380, h: 60 },
      { x: 120, y: 380, w: 140, h: 18 },
      { x: 700, y: 380, w: 140, h: 18 },
      { x: 300, y: 290, w: 120, h: 18 },
      { x: 540, y: 290, w: 120, h: 18 },
      { x: 140, y: 200, w: 120, h: 18 },
      { x: 700, y: 200, w: 120, h: 18 },
      { x: 400, y: 150, w: 160, h: 18 },
    ],
    exits: {
      up: { room: 11, spawnX: 780, spawnY: 300 },
      down: { room: 37, spawnX: 460, spawnY: 40 },
    },
    decorations: [ { type:'bricks' }, { type:'torch', x:60, y:300 }, { type:'torch', x:900, y:300 }, { type:'window', x:180, y:110 } ],
  },
  37: {
    name: 'Escalera de la Guardia',
    zone: 13,
    bg: ['#0c0a10', '#18141e'],
    floorColor: '#2a2630', platColor: '#3a3542', edgeColor: '#55505e',
    particleColor: '#ff9a40',
    platforms: [
      { x: 0, y: 480, w: 380, h: 60 },
      { x: 580, y: 480, w: 380, h: 60 },
      { x: 160, y: 390, w: 120, h: 18 },
      { x: 680, y: 390, w: 120, h: 18 },
      { x: 420, y: 310, w: 120, h: 18 },
      { x: 200, y: 230, w: 120, h: 18 },
      { x: 640, y: 230, w: 120, h: 18 },
      { x: 400, y: 150, w: 160, h: 18 },
    ],
    exits: {
      up: { room: 36, spawnX: 180, spawnY: 400 },
      down: { room: 13, spawnX: 460, spawnY: 40 },
    },
    decorations: [ { type:'bricks' }, { type:'torch', x:60, y:300 }, { type:'torch', x:900, y:300 }, { type:'window', x:180, y:110 } ],
  },
  // ── Capítulo III: El Castillo de las Ruinas
  38: {
    name: 'Ruinas Mortales',
    width: 1440,
    bg: ['#05060c', '#121420'],
    floorColor: '#34303c',
    platColor:  '#3e3a48',
    edgeColor:  '#5a5666',
    particleColor: '#a0a8c0',
    platforms: [
      { x:    0, y: 480, w: 520, h: 60 },
      { x:  620, y: 480, w: 820, h: 60 },
      { x:  540, y: 410, w:  60, h: 18 },  // puente sobre el derrumbe
      { x:  300, y: 420, w: 120, h: 60 },  // bloque caído
      { x:  900, y: 400, w: 160, h: 80 },  // muro derrumbado
      { x:  120, y: 360, w: 120, h: 18 },
      { x:  440, y: 300, w: 110, h: 18 },
      { x:  700, y: 330, w: 130, h: 18 },
      { x:  960, y: 280, w: 120, h: 18 },
      { x: 1200, y: 350, w: 140, h: 18 },
      { x: 1100, y: 200, w: 120, h: 18 },
    ],
    exits: {
      left: { room: 13, spawnX: 860, spawnY: 400 },
    },
    decorations: [ { type:'ruinedWalls' } ],
  },
  // Sala de la broma: a la izquierda de la Entrada, solo con doble salto. Está vacía.
  39: {
    name: '¿?',
    secret: true, zone: 0,
    bg: ['#050810', '#0a1020'],
    floorColor: '#1a2238',
    platColor:  '#243050',
    edgeColor:  '#314068',
    particleColor: '#4060b0',
    noParticles: true,
    platforms: [
      { x: 0, y: 480, w: 960, h: 60 },
    ],
    exits: {
      right: { room: 0, spawnX: 40, spawnY: 80 },
    },
    decorations: [ { type:'jokeText', text: 'JAJA Q PNDJ' } ],
  },
  // ── Salas secretas tras muros que se rompen (sin brillo en la entrada)
  40: {
    name: 'Gruta de Cuarzo Oculta', secret: true, zone: 1,
    bg: ['#05100a', '#0a1f14'], floorColor: '#1a3028', platColor: '#224038', edgeColor: '#2e5448', particleColor: '#30c090',
    platforms: [ { x: 0, y: 480, w: 960, h: 60 }, { x: 300, y: 380, w: 140, h: 18 }, { x: 560, y: 300, w: 140, h: 18 } ],
    exits: { right: { room: 16, spawnX: 250, spawnY: 100, hidden: true } },
    chest: { id: 'c40', x: 120, y: 480, money: 50 },
    decorations: [ { type:'crystal', x:200, y:0, h:H }, { type:'crystal', x:480, y:60, h:420 }, { type:'crystal', x:900, y:0, h:H } ],
  },
  41: {
    name: 'Bodega del Castillo', secret: true, zone: 6,
    bg: ['#0c0a10', '#18141e'], floorColor: '#2a2630', platColor: '#3a3542', edgeColor: '#55505e', particleColor: '#ff9a40',
    platforms: [ { x: 0, y: 480, w: 960, h: 60 }, { x: 500, y: 380, w: 140, h: 18 }, { x: 260, y: 300, w: 140, h: 18 } ],
    exits: { left: { room: 26, spawnX: 2330, spawnY: 400, hidden: true } },
    chest: { id: 'c41', x: 820, y: 480, heart: 1 },
    decorations: [ { type:'bricks' }, { type:'torch', x:60, y:300 }, { type:'torch', x:900, y:300 } ],
  },
  42: {
    name: 'Cueva del Ermitaño', secret: true, zone: 8,
    bg: ['#04050a', '#0c0e16'], floorColor: '#3a3e4c', platColor: '#3a3e4c', edgeColor: '#6a7088', particleColor: '#c8d0e8',
    platforms: [ { x: 0, y: 480, w: 960, h: 60 }, { x: 420, y: 380, w: 140, h: 18 }, { x: 650, y: 300, w: 140, h: 18 } ],
    exits: { right: { room: 31, spawnX: 50, spawnY: 400, hidden: true } },
    chest: { id: 'c42', x: 120, y: 480, money: 80 },
    decorations: [ { type:'pillar', x:300, y:480, h:90 }, { type:'pillar', x:880, y:480, h:140 } ],
  },
  43: {
    name: 'Rincón Olvidado', secret: true, zone: 0,
    bg: ['#050810', '#0a1020'], floorColor: '#1a2238', platColor: '#243050', edgeColor: '#314068', particleColor: '#4060b0',
    platforms: [ { x: 0, y: 480, w: 960, h: 60 }, { x: 380, y: 380, w: 140, h: 18 },
      { x: 930, y: 0, w: 30, h: 380 },     // pared
      { x: 930, y: 380, w: 30, h: 100, breakable: 'w43' } ], // parece pared: se rompe a golpes
    exits: { left: { room: 15, spawnX: 2330, spawnY: 400, hidden: true },
             right: { room: 44, spawnX: 30, spawnY: 400, hidden: true } },
    chest: { id: 'c43', x: 760, y: 480, money: 30 },
    decorations: [ { type:'pillar', x:120, y:420, h:60 }, { type:'arch', x:600, y:200 } ],
  },
  // Pasillo larguísimo sobre un foso de púas: se cruza rebotando en murciélagos quietos (con doble salto)
  44: {
    name: 'Pasaje de las Púas', secret: true, zone: 0,
    width: 11520,
    bg: ['#050810', '#0a1020'], floorColor: '#1a2238', platColor: '#243050', edgeColor: '#314068', particleColor: '#4060b0',
    platforms: SPIKE_LEDGES.map(([a, b]) => ({ x: a, y: 480, w: b - a, h: 60 })), // descansos de piedra
    spikes: SPIKE_LEDGES.slice(1).map(([a], i) => [SPIKE_LEDGES[i][1], a]),       // entre descanso y descanso, púas
    exits: { left: { room: 43, spawnX: 890, spawnY: 400, hidden: true } },
    chest: { id: 'c44', x: 11320, y: 480, money: 200 },
    decorations: [ ...SPIKE_LEDGES.map(([a, b]) => ({ type:'pillar', x:(a + b) / 2, y:420, h:60 })), { type:'arch', x:11200, y:200 } ],
  },
};

// ─── ENEMIGOS — plantillas por sala ──────────────────────────────────────────
// y = superficie de plataforma - 24 (altura enemigo)
// Orden de las salas al recorrer el juego (para el contador "Sala X / N")
const ROOM_ORDER = [0,  14,  15,  1,  16,  17,  2,  18,  19,  20,  21,  4,  22,  23,  3,  24,  25,  5,  26,  27,  6,  7,  28,  29,  8,  30,  31,  9,  32,  33,  10,  34,  35,  11,  36,  37,  13,  38];

const ENEMY_TEMPLATES = {
  44: SPIKE_LEDGES.slice(1).flatMap(([b], i) => {
    const out = [], a = SPIKE_LEDGES[i][1];
    // repartidos parejo a ~300 px: sin doble salto no se alcanza el siguiente (cada rebote lo recarga)
    const n = Math.floor((b - a) / 300) - 1;
    for (let k = 0; k < n; k++) {
      const x = Math.round(a + (b - a) * (k + 1) / (n + 1)) - 14;
      const y = k === 0 ? 350 : 330 - Math.round(40 * Math.sin(k * 1.3 + i)); // el primero, bajito: se sale del suelo
      out.push({ x, y, dir: 1, patrolMin: x, patrolMax: x + 28, speed: 0, bouncy: true });
    }
    return out;
  }),
  0: [
    { x: 250, y: 456, dir:  1, patrolMin:  80, patrolMax: 400, speed: 1.2 },
    { x: 700, y: 456, dir: -1, patrolMin: 500, patrolMax: 880, speed: 1.2 },
    { x: 1200, y: 456, dir: 1, patrolMin: 1000, patrolMax: 1500, speed: 1.2 },
    { x: 2100, y: -204, dir: -1, patrolMin: 1830, patrolMax: 2340, speed: 1.2 },
  ],
  1: [
    { x: 800, y: 456, dir: 1, patrolMin: 620, patrolMax: 1780, speed: 1.3 },
    { x: 2000, y: 456, dir: -1, patrolMin: 1820, patrolMax: 2350, speed: 1.3 },
    { x: 1000, y: 246, dir: 1, patrolMin: 955, patrolMax: 1070, speed: 1.1 },
    { x: 300, y: -84, dir: 1, patrolMin: 40, patrolMax: 560, speed: 1.2 },
  ],
  2: [
    { x: 800, y: 456, dir: 1, patrolMin: 320, patrolMax: 1080, speed: 1.4 },
    { x: 1700, y: 456, dir: -1, patrolMin: 1380, patrolMax: 2350, speed: 1.4 },
    { x: 700, y: 96, dir: 1, patrolMin: 320, patrolMax: 1300, speed: 1.2 },
    { x: 1600, y: 96, dir: -1, patrolMin: 1200, patrolMax: 2080, speed: 1.2 },
    { x: 900, y: -264, dir: 1, patrolMin: 200, patrolMax: 1880, speed: 1.3 },
  ],
  3: [
    { x: 220, y: 346, dir:  1, patrolMin: 200, patrolMax: 355, speed: 1.4 },
    { x: 660, y: 346, dir: -1, patrolMin: 640, patrolMax: 795, speed: 1.4 },
  ],
  4: [], // sala del jefe — sin enemigos normales
  5: [], // armería
  6: [
    { x: 800, y: 300, dir: 1, patrolMin: 100, patrolMax: 1900, speed: 1.2 },
    { x: 1200, y: -60, dir: -1, patrolMin: 300, patrolMax: 2200, speed: 1.1 },
    { x: 900, y: -380, dir: 1, patrolMin: 500, patrolMax: 2000, speed: 1.0 },
  ],
  7: [],
  8: [
    { x: 650, y: 396, dir: -1, patrolMin: 440, patrolMax: 930, speed: 1.5 },
  ],
  9: [
    { x: 100, y: 456, dir:  1, patrolMin:  10, patrolMax: 300, speed: 1.5 },
    { x: 700, y: 406, dir: -1, patrolMin: 460, patrolMax: 930, speed: 1.6 },
  ],
  10: [
    { x: 120, y: 456, dir:  1, patrolMin:  10, patrolMax: 230, speed: 1.6 },
    { x: 800, y: 356, dir: -1, patrolMin: 710, patrolMax: 930, speed: 1.7 },
  ],
  11: [
    { x: 450, y: 396, dir:  1, patrolMin: 350, patrolMax: 590, speed: 1.7 },
    { x: 800, y: 336, dir: -1, patrolMin: 630, patrolMax: 930, speed: 1.8 },
  ],
  14: [
    { x: 300, y: 456, dir: 1, patrolMin: 20, patrolMax: 580, speed: 1.4 },
    { x: 900, y: 456, dir: -1, patrolMin: 730, patrolMax: 1130, speed: 1.4 },
    { x: 1500, y: 456, dir: 1, patrolMin: 1320, patrolMax: 2300, speed: 1.4 },
    { x: 1000, y: 96, dir: -1, patrolMin: 720, patrolMax: 1280, speed: 1.1 },
    { x: 1600, y: 96, dir: 1, patrolMin: 1450, patrolMax: 1770, speed: 1.1 },
  ],
  15: [
    { x: 800, y: 456, dir: 1, patrolMin: 560, patrolMax: 1300, speed: 1.3 },
    { x: 1800, y: 456, dir: -1, patrolMin: 1400, patrolMax: 2350, speed: 1.3 },
    { x: 1350, y: 146, dir: 1, patrolMin: 1305, patrolMax: 1475, speed: 1.1 },
    { x: 400, y: -204, dir: 1, patrolMin: 40, patrolMax: 780, speed: 1.2 },
    { x: 1200, y: -204, dir: -1, patrolMin: 960, patrolMax: 1480, speed: 1.2 },
  ],
  16: [
    { x: 1000, y: -84, dir: -1, patrolMin: 620, patrolMax: 1540, speed: 1.2 },
    { x: 700, y: 156, dir: 1, patrolMin: 260, patrolMax: 1180, speed: 1.2 },
    { x: 900, y: 456, dir: 1, patrolMin: 440, patrolMax: 1500, speed: 1.3 },
    { x: 2000, y: -84, dir: -1, patrolMin: 1580, patrolMax: 2350, speed: 1.3 },
  ],
  17: [
    { x: 1000, y: -84, dir: 1, patrolMin: 440, patrolMax: 1880, speed: 1.2 },
    { x: 600, y: 456, dir: 1, patrolMin: 20, patrolMax: 1200, speed: 1.4 },
    { x: 1700, y: 456, dir: -1, patrolMin: 1300, patrolMax: 2330, speed: 1.4 },
    { x: 950, y: 276, dir: 1, patrolMin: 905, patrolMax: 1020, speed: 1.0 },
  ],
  18: [
    { x: 1500, y: -84, dir: -1, patrolMin: 1250, patrolMax: 2800, speed: 1.3 },
    { x: 500, y: -84, dir: 1, patrolMin: 310, patrolMax: 880, speed: 1.1 },
    { x: 200, y: 456, dir: 1, patrolMin: 20, patrolMax: 480, speed: 1.3 },
    { x: 1000, y: 456, dir: -1, patrolMin: 720, patrolMax: 1480, speed: 1.3 },
    { x: 1600, y: 376, dir: 1, patrolMin: 1505, patrolMax: 1720, speed: 1.0 },
    { x: 700, y: -354, dir: 1, patrolMin: 320, patrolMax: 1180, speed: 1.2 },
    { x: 1800, y: -354, dir: -1, patrolMin: 1400, patrolMax: 2280, speed: 1.2 },
  ],
  19: [
    { x: 800, y: 456, dir: 1, patrolMin: 220, patrolMax: 1880, speed: 1.3 },
    { x: 1200, y: 246, dir: 1, patrolMin: 1185, patrolMax: 1370, speed: 1.0 },
    { x: 560, y: 46, dir: 1, patrolMin: 545, patrolMax: 730, speed: 1.0 },
    { x: 900, y: -254, dir: 1, patrolMin: 885, patrolMax: 1070, speed: 1.0 },
    { x: 1900, y: 206, dir: -1, patrolMin: 1855, patrolMax: 2060, speed: 1.1 },
  ],
  20: [
    { x: 900, y: 456, dir: 1, patrolMin: 420, patrolMax: 1880, speed: 1.3 },
    { x: 1000, y: 256, dir: -1, patrolMin: 955, patrolMax: 1220, speed: 1.1 },
    { x: 1450, y: 156, dir: 1, patrolMin: 1405, patrolMax: 1670, speed: 1.1 },
    { x: 1000, y: -274, dir: 1, patrolMin: 560, patrolMax: 1880, speed: 1.3 },
    { x: 2100, y: -84, dir: -1, patrolMin: 1920, patrolMax: 2350, speed: 1.2 },
  ],
  21: [
    { x: 1200, y: 456, dir: 1, patrolMin: 760, patrolMax: 1750, speed: 1.3 },
    { x: 2200, y: 456, dir: -1, patrolMin: 2000, patrolMax: 2350, speed: 1.2 },
    { x: 900, y: 96, dir: 1, patrolMin: 705, patrolMax: 1180, speed: 1.1 },
    { x: 400, y: -84, dir: 1, patrolMin: 40, patrolMax: 680, speed: 1.2 },
  ],
  22: [
    { x: 800, y: 300, dir: 1, patrolMin: 420, patrolMax: 1880, speed: 1.2 },
    { x: 1200, y: -150, dir: -1, patrolMin: 700, patrolMax: 1700, speed: 1.1 },
    { x: 1700, y: 0, dir: 1, patrolMin: 1500, patrolMax: 1900, speed: 1.0 },
  ],
  23: [
    { x: 1000, y: 300, dir: 1, patrolMin: 320, patrolMax: 1900, speed: 1.2 },
    { x: 1200, y: -60, dir: -1, patrolMin: 400, patrolMax: 1950, speed: 1.1 },
    { x: 900, y: -400, dir: 1, patrolMin: 520, patrolMax: 1800, speed: 1.0 },
  ],
  24: [
    { x: 900, y: 176, dir: 1, patrolMin: 845, patrolMax: 1090, speed: 1.0 },
    { x: 1600, y: -104, dir: -1, patrolMin: 1545, patrolMax: 1790, speed: 1.0 },
  ],
  25: [
    { x: 800, y: 456, dir: 1, patrolMin: 120, patrolMax: 1380, speed: 1.3 },
    { x: 700, y: -244, dir: 1, patrolMin: 505, patrolMax: 1040, speed: 1.1 },
    { x: 1500, y: -244, dir: -1, patrolMin: 1255, patrolMax: 1890, speed: 1.1 },
  ],
  26: [
    { x: 400, y: 456, dir: 1, patrolMin: 20, patrolMax: 800, speed: 1.3 },
    { x: 1600, y: 456, dir: -1, patrolMin: 1080, patrolMax: 2340, speed: 1.3 },
    { x: 1200, y: -24, dir: 1, patrolMin: 410, patrolMax: 2090, speed: 1.2 },
  ],
  27: [
    { x: 700, y: 456, dir: 1, patrolMin: 40, patrolMax: 1300, speed: 1.3 },
    { x: 1700, y: 456, dir: -1, patrolMin: 1300, patrolMax: 2340, speed: 1.3 },
    { x: 300, y: -84, dir: 1, patrolMin: 20, patrolMax: 540, speed: 1.1 },
    { x: 2100, y: -84, dir: -1, patrolMin: 1850, patrolMax: 2380, speed: 1.1 },
  ],
  28: [
    { x: 500, y: 456, dir: 1, patrolMin: 20, patrolMax: 1410, speed: 1.4 },
    { x: 300, y: 56, dir: 1, patrolMin: 285, patrolMax: 470, speed: 1.1 },
    { x: 1000, y: 56, dir: -1, patrolMin: 945, patrolMax: 1130, speed: 1.1 },
    { x: 660, y: 156, dir: 1, patrolMin: 605, patrolMax: 810, speed: 1.2 },
    { x: 650, y: -194, dir: 1, patrolMin: 645, patrolMax: 770, speed: 1.0 },
  ],
  29: [
    { x: 200, y: 456, dir: 1, patrolMin: 20, patrolMax: 590, speed: 1.3 },
    { x: 1000, y: 456, dir: -1, patrolMin: 850, patrolMax: 1410, speed: 1.3 },
    { x: 300, y: 56, dir: 1, patrolMin: 285, patrolMax: 470, speed: 1.1 },
    { x: 1000, y: 56, dir: -1, patrolMin: 945, patrolMax: 1130, speed: 1.1 },
    { x: 660, y: 156, dir: 1, patrolMin: 605, patrolMax: 810, speed: 1.2 },
    { x: 650, y: -194, dir: 1, patrolMin: 645, patrolMax: 770, speed: 1.0 },
  ],
  30: [
    { x: 500, y: 456, dir: 1, patrolMin: 20, patrolMax: 1410, speed: 1.4 },
    { x: 300, y: 56, dir: 1, patrolMin: 285, patrolMax: 470, speed: 1.1 },
    { x: 1000, y: 56, dir: -1, patrolMin: 945, patrolMax: 1130, speed: 1.1 },
    { x: 660, y: 156, dir: 1, patrolMin: 605, patrolMax: 810, speed: 1.2 },
    { x: 650, y: -194, dir: 1, patrolMin: 645, patrolMax: 770, speed: 1.0 },
  ],
  31: [
    { x: 200, y: 456, dir: 1, patrolMin: 40, patrolMax: 590, speed: 1.3 },
    { x: 1000, y: 456, dir: -1, patrolMin: 850, patrolMax: 1410, speed: 1.3 },
    { x: 300, y: 56, dir: 1, patrolMin: 285, patrolMax: 470, speed: 1.1 },
    { x: 1000, y: 56, dir: -1, patrolMin: 945, patrolMax: 1130, speed: 1.1 },
    { x: 660, y: 156, dir: 1, patrolMin: 605, patrolMax: 810, speed: 1.2 },
    { x: 650, y: -194, dir: 1, patrolMin: 645, patrolMax: 770, speed: 1.0 },
  ],
  32: [
    { x: 500, y: 456, dir: 1, patrolMin: 20, patrolMax: 1410, speed: 1.4 },
    { x: 300, y: 56, dir: 1, patrolMin: 285, patrolMax: 470, speed: 1.1 },
    { x: 1000, y: 56, dir: -1, patrolMin: 945, patrolMax: 1130, speed: 1.1 },
    { x: 660, y: 156, dir: 1, patrolMin: 605, patrolMax: 810, speed: 1.2 },
    { x: 650, y: -194, dir: 1, patrolMin: 645, patrolMax: 770, speed: 1.0 },
  ],
  33: [
    { x: 200, y: 456, dir: 1, patrolMin: 20, patrolMax: 590, speed: 1.3 },
    { x: 1000, y: 456, dir: -1, patrolMin: 850, patrolMax: 1410, speed: 1.3 },
    { x: 300, y: 56, dir: 1, patrolMin: 285, patrolMax: 470, speed: 1.1 },
    { x: 1000, y: 56, dir: -1, patrolMin: 945, patrolMax: 1130, speed: 1.1 },
    { x: 660, y: 156, dir: 1, patrolMin: 605, patrolMax: 810, speed: 1.2 },
    { x: 650, y: -194, dir: 1, patrolMin: 645, patrolMax: 770, speed: 1.0 },
  ],
  34: [
    { x: 500, y: 456, dir: 1, patrolMin: 20, patrolMax: 1410, speed: 1.4 },
    { x: 300, y: 56, dir: 1, patrolMin: 285, patrolMax: 470, speed: 1.1 },
    { x: 1000, y: 56, dir: -1, patrolMin: 945, patrolMax: 1130, speed: 1.1 },
    { x: 660, y: 156, dir: 1, patrolMin: 605, patrolMax: 810, speed: 1.2 },
    { x: 650, y: -194, dir: 1, patrolMin: 645, patrolMax: 770, speed: 1.0 },
  ],
  35: [
    { x: 200, y: 456, dir: 1, patrolMin: 20, patrolMax: 590, speed: 1.3 },
    { x: 1000, y: 456, dir: -1, patrolMin: 850, patrolMax: 1410, speed: 1.3 },
    { x: 300, y: 56, dir: 1, patrolMin: 285, patrolMax: 470, speed: 1.1 },
    { x: 1000, y: 56, dir: -1, patrolMin: 945, patrolMax: 1130, speed: 1.1 },
    { x: 660, y: 156, dir: 1, patrolMin: 605, patrolMax: 810, speed: 1.2 },
    { x: 650, y: -194, dir: 1, patrolMin: 645, patrolMax: 770, speed: 1.0 },
  ],
  36: [
    { x: 100, y: 456, dir: 1, patrolMin: 20, patrolMax: 350, speed: 1.3 },
    { x: 800, y: 456, dir: -1, patrolMin: 600, patrolMax: 930, speed: 1.3 },
  ],
  37: [
    { x: 120, y: 456, dir: 1, patrolMin: 20, patrolMax: 350, speed: 1.4 },
    { x: 780, y: 456, dir: -1, patrolMin: 600, patrolMax: 930, speed: 1.4 },
    { x: 440, y: 286, dir: 1, patrolMin: 425, patrolMax: 515, speed: 1.0 },
  ],
  38: [
    { x:  100, y: 456, dir:  1, patrolMin:  20, patrolMax: 480, speed: 1.8 },
    { x:  320, y: 396, dir:  1, patrolMin: 305, patrolMax: 390, speed: 1.2 },
    { x:  800, y: 456, dir: -1, patrolMin: 640, patrolMax: 880, speed: 1.9 },
    { x: 1200, y: 456, dir: -1, patrolMin: 1070, patrolMax: 1400, speed: 2.0 },
  ],
};

// ─── SALAS ANCHAS ────────────────────────────────────────────────────────────
// Estas salas miden pantalla y media: se abre un tramo nuevo en medio (donde el
// suelo es continuo) y la cámara sigue al mapache hacia los lados. Las salas de
// jefe, la tienda y las que se recorren hacia arriba o abajo se quedan igual.
const WIDE_ROOMS = [8, 9, 10, 11];
const WIDE_EXTRA = 480;
function widenRoom(id) {
  const R = ROOMS[id], X = WIDE_EXTRA;
  const grounds = R.platforms.filter(p => p.h >= 40 && p.y >= 300);
  // punto de corte: con suelo debajo y sin cortar ninguna plataforma fina
  const split = [480, 420, 540, 360, 600, 300, 660, 240, 720, 820, 140, 320, 800, 860, 180].find(c =>
    grounds.some(g => g.x < c - 40 && g.x + g.w > c + 40) &&
    !R.platforms.some(p => p.h < 40 && p.x < c + 20 && p.x + p.w > c - 20));
  if (split === undefined) return;
  const ground = grounds.find(g => g.x < split && g.x + g.w > split);
  for (const p of R.platforms) {
    if (p.x >= split) p.x += X;
    else if (p.x + p.w > split) p.w += X;
  }
  // tramo nuevo: escalones para subir y un bicho patrullando
  const gy = ground.y, S = split;
  R.platforms.push(
    { x: S + 60,  y: gy - 110, w: 130, h: 18 },
    { x: S + 280, y: gy - 180, w: 130, h: 18 },
    { x: S + 140, y: gy - 270, w: 120, h: 18 },
  );
  for (const d of R.decorations || []) {
    if (d.x !== undefined && d.x >= split) d.x += X;
    if (d.x0 !== undefined && d.x0 >= split) { d.x0 += X; d.x1 += X; }
    else if (d.x1 !== undefined && d.x1 > split) d.x1 += X;
  }
  if (R.hatch && R.hatch.x >= split) R.hatch.x += X;
  const ens = ENEMY_TEMPLATES[id] || (ENEMY_TEMPLATES[id] = []);
  for (const e of ens) {
    if (e.patrolMin >= split) { e.x += X; e.patrolMin += X; e.patrolMax += X; }
    else if (e.patrolMax > split) { e.patrolMax += X; if (e.x >= split) e.x += X; }
  }
  const sp = ens.length ? ens[0].speed : 1.3;
  ens.push({ x: S + 200, y: gy - 24, dir: 1, patrolMin: S + 20, patrolMax: S + X - 40, speed: sp });
  R.width = W + X;
  // quien entra por la derecha aparece en el nuevo borde
  for (const r of Object.values(ROOMS)) for (const e of Object.values(r.exits || {}))
    if (e.room === id && e.spawnX >= split) e.spawnX += X;
}
// ─── RECORRIDO ───────────────────────────────────────────────────────────────
// El camino cambia de dirección: sube, baja, va a la izquierda o a la derecha.
// Cada tramo [a, dir, b] pone la salida dir en a y la contraria en b.
const ROUTE = [
  [0, 'right', 14],
  [14, 'up', 15],
  [15, 'left', 1],
  [1, 'left', 16],
  [16, 'down', 17],
  [17, 'left', 2],
  [2, 'left', 18],
  [18, 'up', 19],
  [19, 'up', 20],
  [20, 'right', 21],
  [21, 'right', 4],
  [3, 'right', 26],
  [26, 'down', 27],
  [27, 'right', 6],
  [7, 'right', 28],
  [28, 'up', 29],
  [29, 'left', 8],
  [8, 'left', 30],
  [30, 'up', 31],
  [31, 'right', 9],
  [9, 'right', 32],
  [32, 'up', 33],
  [33, 'right', 10],
  [10, 'right', 34],
  [34, 'up', 35],
  [35, 'right', 11],
];
const OPPOSITE = { left: 'right', right: 'left', up: 'down', down: 'up' };
// Dónde aparece el mapache al llegar a una sala por un lado
function sideSpawn(id, side) {
  const R = ROOMS[id], RW = R.width || W;
  if (R.spawns && R.spawns[side]) return { ...R.spawns[side] }; // la sala dice dónde se aparece
  if (side === 'up')   return { spawnX: R.upSpawnX ?? RW / 2 - 20, spawnY: (R.top || 0) + 40 };   // cae desde arriba
  if (side === 'down') return { spawnX: 300, spawnY: 400 };                         // sube desde abajo
  const x = side === 'left' ? 30 : RW - 70;
  const ground = R.platforms.filter(p => p.h >= 40 && p.x <= x + 13 && p.x + p.w >= x + 13)
    .reduce((m, p) => Math.max(m, p.y), -Infinity);
  return { spawnX: x, spawnY: (ground > -Infinity ? ground : 480) - 80 };
}
for (const [a, dir, b] of ROUTE) {
  const back = OPPOSITE[dir];
  ROOMS[a].exits[dir]  = { room: b, ...sideSpawn(b, back) };
  ROOMS[b].exits[back] = { room: a, ...sideSpawn(a, dir) };
  for (const [id, d] of [[a, dir], [b, back]]) if (ROOMS[id].top !== undefined) {
    if (d === 'up')   ROOMS[id].exits.up.bandX   = [560, 880];
    if (d === 'down') ROOMS[id].exits.down.bandX = [620, 820];
  }
}
// Brillo de cada salida donde de verdad está el hueco (salas que lo indican)
for (const R of Object.values(ROOMS)) for (const [d, b] of Object.entries(R.exitBands || {}))
  if (R.exits[d]) R.exits[d][d === 'up' || d === 'down' ? 'bandX' : 'band'] = b;
