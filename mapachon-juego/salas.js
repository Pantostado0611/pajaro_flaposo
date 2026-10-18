const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const W = 960, H = 540;

// ─── SALAS ───────────────────────────────────────────────────────────────────
// Descansos de piedra del Pasaje de las Púas (sala secreta 44): [desde, hasta]
const SPIKE_LEDGES = [[0, 360], [2200, 2440], [4280, 4520], [6360, 6600], [8440, 8680], [10520, 11520]]; // tramos de púas iguales (1840)
const ROOMS = {
  0: {
    name: 'Entrada a las Ruinas',
    width: 2400, top: -540, // la entrada: pasillos estrechos que suben en zigzag hasta el pasillo alto de la derecha
    bg: ['#050810', '#0a1020'],
    floorColor: '#1a2238', platColor: '#243050', edgeColor: '#314068',
    particleColor: '#4060b0',
    platforms: [
      // roca (lo que no es pasillo)
      { x: 860, y: -420, w: 1540, h: 50 },
      { x: 0, y: -540, w: 700, h: 280 },
      { x: 1620, y: -370, w: 780, h: 340 },
      { x: 0, y: -260, w: 1450, h: 230 },
      { x: 0, y: -30, w: 760, h: 60 },
      { x: 1600, y: -30, w: 800, h: 130 },
      { x: 920, y: 100, w: 180, h: 80 },
      { x: 1350, y: 100, w: 1050, h: 80 },
      { x: 320, y: 30, w: 440, h: 310 },
      { x: 920, y: 180, w: 1480, h: 160 },
      { x: 0, y: 150, w: 20, h: 330 },
      { x: 900, y: 340, w: 1500, h: 140 },
      { x: 0, y: 480, w: 2400, h: 60 },
      { x: 840, y: 390, w: 70, h: 18 },
      { x: 770, y: 300, w: 70, h: 18 },
      { x: 840, y: 210, w: 70, h: 18 },
      { x: 770, y: 120, w: 70, h: 18 },
      { x: 1540, y: 10, w: 70, h: 18 },
      { x: 1460, y: -80, w: 70, h: 18 },
      { x: 1540, y: -170, w: 70, h: 18 },
      { x: 780, y: -320, w: 70, h: 18 },
      { x: 710, y: -400, w: 70, h: 18 },
    ],

    exits: {
      left:  { room: 39, spawnX: 890, spawnY: 400, band: [30, 150] }, // sala de la broma
    }, // la de la derecha la pone el recorrido (ROUTE)
    spawns: { right: { spawnX: 2330, spawnY: -470 } }, // se llega por el pasillo alto
    exitBands: { right: [-540, -420] },
    decorations: [ { type:'pillar', x:300, y:420, h:60 }, { type:'arch', x:1900, y:-520 } ],
  },
  1: {
    name: 'Sala de los Cristales',
    width: 2400, top: -540, // pasillos de cristal: se entra abajo a la derecha; un tiro sube a la reja y otro pasillo sale a la izquierda
    keyGate: { x: 1080, w: 240 }, // reja con candado en el hueco del techo
    bg: ['#05100a', '#0a1f14'],
    floorColor: '#1a3028', platColor: '#224038', edgeColor: '#2e5448',
    particleColor: '#30c090',
    platforms: [
      // roca (lo que no es pasillo)
      { x: 0, y: -540, w: 1080, h: 280 },
      { x: 1320, y: -540, w: 1080, h: 320 },
      { x: 700, y: -260, w: 380, h: 40 },
      { x: 700, y: -220, w: 400, h: 20 },
      { x: 0, y: -140, w: 600, h: 80 },
      { x: 1280, y: -220, w: 1120, h: 370 },
      { x: 1280, y: 150, w: 220, h: 180 },
      { x: 1900, y: 150, w: 500, h: 180 },
      { x: 0, y: -60, w: 1100, h: 540 },
      { x: 0, y: 480, w: 2400, h: 60 },
      { x: 1190, y: 390, w: 80, h: 18 },
      { x: 1110, y: 300, w: 80, h: 18 },
      { x: 1190, y: 210, w: 80, h: 18 },
      { x: 1110, y: 120, w: 80, h: 18 },
      { x: 1190, y: 30, w: 80, h: 18 },
      { x: 1110, y: -60, w: 80, h: 18 },
      { x: 1190, y: -150, w: 80, h: 18 },
      { x: 1200, y: -310, w: 80, h: 18 },
      { x: 1110, y: -390, w: 80, h: 18 },
      { x: 1200, y: -470, w: 80, h: 18 },
      { x: 1600, y: 370, w: 100, h: 18 },
      { x: 1750, y: 270, w: 100, h: 18 },
    ],

    exits: {
      up: { room: 22, spawnX: 470, spawnY: 400 },
    }, // izquierda y derecha las pone el recorrido (ROUTE)
    spawns: { left: { spawnX: 30, spawnY: -220 }, right: { spawnX: 2330, spawnY: 400 } },
    exitBands: { left: [-260, -140], right: [330, 480], up: [1080, 1320] },
    decorations: [
      { type:'crystal', x:1700, y:150, h:330 },
      { type:'crystal', x:400, y:-260, h:120 },
      { type:'arch',    x:2200, y:330 },
    ],
  },
  2: {
    name: 'Jardín Putrefacto',
    width: 2400, top: -540, // pasillos de jardín podrido: se entra abajo a la derecha y se sube en zigzag a la salida de arriba a la izquierda
    bg: ['#0a0805', '#1a1205'],
    floorColor: '#2a2010', platColor: '#3a2e18', edgeColor: '#4a3e28',
    particleColor: '#c08030',
    platforms: [
      // roca (lo que no es pasillo)
      { x: 0, y: -540, w: 2400, h: 70 },
      { x: 460, y: -470, w: 1940, h: 90 },
      { x: 0, y: -340, w: 300, h: 80 },
      { x: 1060, y: -380, w: 1340, h: 350 },
      { x: 0, y: -260, w: 900, h: 360 },
      { x: 0, y: 100, w: 1200, h: 90 },
      { x: 1500, y: 100, w: 200, h: 90 },
      { x: 1860, y: -30, w: 540, h: 370 },
      { x: 0, y: 190, w: 1700, h: 290 },
      { x: 0, y: 480, w: 2400, h: 60 },
      { x: 1780, y: 390, w: 70, h: 18 },
      { x: 1710, y: 300, w: 70, h: 18 },
      { x: 1780, y: 210, w: 70, h: 18 },
      { x: 1710, y: 120, w: 70, h: 18 },
      { x: 910, y: 10, w: 70, h: 18 },
      { x: 980, y: -80, w: 70, h: 18 },
      { x: 910, y: -170, w: 70, h: 18 },
    ],

    exits: {}, // las pone el recorrido (ROUTE)
    spawns: { left: { spawnX: 30, spawnY: -380 }, right: { spawnX: 2330, spawnY: 400 } },
    exitBands: { left: [-470, -340], right: [340, 480] },
    decorations: [ { type:'mushroom', x:2000, y:480 }, { type:'mushroom', x:1350, y:190 }, { type:'mushroom', x:600, y:-260 }, { type:'mushroom', x:2250, y:480 } ],
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
    width: 2400, top: -540, // pasillos del castillo que suben en zigzag hasta el hueco del techo
    upSpawnX: 1220,         // al bajar de La Cumbre
    bg: ['#0c0a10', '#18141e'],
    floorColor: '#2a2630', platColor: '#3a3542', edgeColor: '#55505e',
    particleColor: '#ff9a40',
    platforms: [
      // roca (lo que no es pasillo)
      { x: 0, y: -540, w: 200, h: 870 },
      { x: 200, y: -540, w: 500, h: 690 },
      { x: 700, y: -300, w: 60, h: 630 },
      { x: 0, y: 480, w: 900, h: 60 },
      { x: 900, y: 330, w: 30, h: 210 },
      { x: 700, y: -540, w: 300, h: 160 },
      { x: 1000, y: -540, w: 100, h: 110 },
      { x: 930, y: 60, w: 370, h: 480 },
      { x: 1300, y: 140, w: 300, h: 400 },
      { x: 760, y: -300, w: 980, h: 220 },
      { x: 1300, y: -540, w: 600, h: 110 },
      { x: 1600, y: 60, w: 300, h: 480 },
      { x: 1900, y: -540, w: 500, h: 1080 },
      { x: 770, y: 390, w: 70, h: 18 },
      { x: 850, y: 300, w: 70, h: 18 },
      { x: 770, y: 210, w: 70, h: 18 },
      { x: 850, y: 120, w: 70, h: 18 },
      { x: 1750, y: -30, w: 70, h: 18 },
      { x: 1820, y: -120, w: 70, h: 18 },
      { x: 1750, y: -210, w: 70, h: 18 },
      { x: 1130, y: -390, w: 80, h: 18 },
      { x: 1210, y: -470, w: 80, h: 18 },
      { x: 300, y: 250, w: 120, h: 18 },
    ],

    // Solo sube a La Cumbre Quebrantada (y vuelve al Patio de Armas)
    exits: {
      up:   { room: 7, spawnX: 270, spawnY: 400 },
    }, // la de la izquierda la pone el recorrido (ROUTE)
    spawns: { left: { spawnX: 30, spawnY: 400 } },
    exitBands: { left: [330, 480], up: [1100, 1300] },
    decorations: [
      { type:'bricks' },
      { type:'window', x:450, y:230 }, { type:'window', x:1100, y:-20 }, { type:'window', x:1500, y:-380 },
      { type:'torch', x:60, y:420 }, { type:'torch', x:650, y:250 }, { type:'torch', x:1000, y:0 },
      { type:'torch', x:1800, y:0 }, { type:'torch', x:1600, y:-370 },
    ],
  },
  7: {
    name: 'La Cumbre Quebrantada',
    width: 2400, top: -540, // dentro de la muralla rota: se sube del hueco del suelo a un mirador y sale arriba a la derecha
    style: 'castleRock', carved: true,
    bg: ['#6e5560', '#c08070'],
    floorColor: '#8a807e', platColor: '#9a908c', edgeColor: '#b4aaa4',
    particleColor: '#ffffff', noParticles: true,
    platforms: [
      // roca (lo que no es pasillo)
      { x: 0, y: -540, w: 2400, h: 90 },
      { x: 1500, y: -450, w: 900, h: 120 },
      { x: 560, y: -330, w: 840, h: 80 },
      { x: 700, y: -250, w: 700, h: 50 },
      { x: 700, y: -200, w: 1100, h: 70 },
      { x: 2000, y: -200, w: 400, h: 70 },
      { x: 700, y: -130, w: 1700, h: 60 },
      { x: 0, y: -450, w: 400, h: 510 },
      { x: 0, y: 60, w: 960, h: 240 },
      { x: 1120, y: -70, w: 1280, h: 420 },
      { x: 520, y: 300, w: 440, h: 50 },
      { x: 0, y: 300, w: 40, h: 180 },
      { x: 1100, y: 350, w: 1300, h: 130 },
      { x: 0, y: 480, w: 340, h: 60 },
      { x: 520, y: 480, w: 1880, h: 60 },
      { x: 970, y: 390, w: 70, h: 18 },
      { x: 1040, y: 300, w: 70, h: 18 },
      { x: 970, y: 210, w: 70, h: 18 },
      { x: 1040, y: 120, w: 70, h: 18 },
      { x: 480, y: -30, w: 70, h: 18 },
      { x: 410, y: -120, w: 70, h: 18 },
      { x: 480, y: -210, w: 70, h: 18 },
      { x: 410, y: -290, w: 70, h: 18 },
      { x: 1420, y: -265, w: 70, h: 18 },
    ],

    exits: {
      down:  { room: 6, spawnX: 1220, spawnY: -500 },
    }, // la de la derecha la pone el recorrido (ROUTE)
    spawns: { right: { spawnX: 2330, spawnY: -260 } },
    exitBands: { down: [340, 520], right: [-330, -200] },
    decorations: [ { type:'nightRanges' } ],
  },
  // ── Subida a la montaña: cada sala está más alta y es más de noche (night 1-4)
  8: {
    name: 'Sendero Helado',
    width: 2400, top: -540, // túneles de hielo que bajan hasta la salida de abajo; en medio, un mirador al cielo
    style: 'mountain', night: 1, carved: true,
    bg: ['#010208', '#0e1430'],
    floorColor: '#4a5068', platColor: '#4a5068', edgeColor: '#8a90a8',
    particleColor: '#ffffff', noParticles: true,
    platforms: [
      // roca (lo que no es pasillo)
      { x: 0, y: -540, w: 2400, h: 90 },
      { x: 0, y: -450, w: 1500, h: 50 },
      { x: 0, y: -400, w: 1000, h: 260 },
      { x: 1400, y: -400, w: 100, h: 260 },
      { x: 1660, y: -330, w: 740, h: 310 },
      { x: 0, y: -140, w: 700, h: 470 },
      { x: 860, y: -20, w: 1540, h: 500 },
      { x: 0, y: 480, w: 2400, h: 60 },
      { x: 1510, y: -110, w: 70, h: 18 },
      { x: 1580, y: -200, w: 70, h: 18 },
      { x: 1510, y: -290, w: 70, h: 18 },
      { x: 710, y: 390, w: 70, h: 18 },
      { x: 780, y: 300, w: 70, h: 18 },
      { x: 710, y: 210, w: 70, h: 18 },
      { x: 780, y: 120, w: 70, h: 18 },
      { x: 710, y: 30, w: 70, h: 18 },
      { x: 780, y: -60, w: 70, h: 18 },
      { x: 1100, y: -230, w: 100, h: 18 },
      { x: 1250, y: -320, w: 90, h: 18 },
    ],

    exits: {}, // las pone el recorrido (ROUTE)
    spawns: { right: { spawnX: 2330, spawnY: -380 }, left: { spawnX: 30, spawnY: 400 } },
    exitBands: { right: [-450, -330], left: [330, 480] },
    decorations: [ { type:'nightRanges', level: 1 } ],
  },
  9: {
    name: 'Paso de la Ventisca',
    width: 2400, top: -540, // túneles azotados por la ventisca: de arriba a la izquierda al túnel largo de abajo (con el banco)
    style: 'mountain', night: 2, carved: true,
    bg: ['#010208', '#0e1430'],
    floorColor: '#4a5068', platColor: '#4a5068', edgeColor: '#8a90a8',
    particleColor: '#ffffff', noParticles: true,
    platforms: [
      // roca (lo que no es pasillo)
      { x: 0, y: -540, w: 2400, h: 120 },
      { x: 800, y: -420, w: 1600, h: 270 },
      { x: 800, y: -150, w: 100, h: 130 },
      { x: 1200, y: -150, w: 1200, h: 130 },
      { x: 0, y: -300, w: 640, h: 400 },
      { x: 1500, y: -20, w: 900, h: 270 },
      { x: 0, y: 100, w: 1340, h: 240 },
      { x: 1500, y: 250, w: 200, h: 90 },
      { x: 2100, y: 250, w: 300, h: 90 },
      { x: 0, y: 480, w: 2400, h: 60 },
      { x: 650, y: 10, w: 70, h: 18 },
      { x: 720, y: -80, w: 70, h: 18 },
      { x: 650, y: -170, w: 70, h: 18 },
      { x: 720, y: -250, w: 70, h: 18 },
      { x: 1350, y: 390, w: 70, h: 18 },
      { x: 1420, y: 300, w: 70, h: 18 },
      { x: 1350, y: 210, w: 70, h: 18 },
      { x: 950, y: -40, w: 90, h: 18 },
      { x: 1800, y: 360, w: 100, h: 18 },
      { x: 1950, y: 300, w: 100, h: 18 },
    ],

    exits: {}, // las pone el recorrido (ROUTE)
    spawns: { left: { spawnX: 30, spawnY: -350 }, right: { spawnX: 2330, spawnY: 400 } },
    exitBands: { left: [-420, -300], right: [340, 480] },
    decorations: [ { type:'nightRanges', level: 2 } ],
  },
  10: {
    name: 'Risco sin Luna',
    width: 2400, top: -540, // túneles negros del risco: se baja del túnel alto al de abajo y se sale a la derecha
    style: 'mountain', night: 3, carved: true,
    bg: ['#010208', '#0e1430'],
    floorColor: '#4a5068', platColor: '#4a5068', edgeColor: '#8a90a8',
    particleColor: '#ffffff', noParticles: true,
    platforms: [
      // roca (lo que no es pasillo)
      { x: 0, y: -540, w: 2400, h: 220 },
      { x: 700, y: -320, w: 1700, h: 120 },
      { x: 720, y: -200, w: 1680, h: 100 },
      { x: 720, y: -100, w: 80, h: 180 },
      { x: 1100, y: -100, w: 1300, h: 180 },
      { x: 1400, y: 80, w: 1000, h: 70 },
      { x: 0, y: -200, w: 560, h: 400 },
      { x: 0, y: 200, w: 1000, h: 70 },
      { x: 1150, y: 200, w: 90, h: 70 },
      { x: 1400, y: 150, w: 200, h: 180 },
      { x: 2000, y: 150, w: 400, h: 180 },
      { x: 0, y: 270, w: 1240, h: 210 },
      { x: 0, y: 480, w: 2400, h: 60 },
      { x: 570, y: 110, w: 70, h: 18 },
      { x: 640, y: 20, w: 70, h: 18 },
      { x: 570, y: -70, w: 70, h: 18 },
      { x: 640, y: -150, w: 70, h: 18 },
      { x: 1250, y: 390, w: 70, h: 18 },
      { x: 1320, y: 300, w: 70, h: 18 },
      { x: 1250, y: 210, w: 70, h: 18 },
      { x: 850, y: 10, w: 90, h: 18 },
      { x: 980, y: -60, w: 90, h: 18 },
      { x: 1700, y: 360, w: 100, h: 18 },
      { x: 1850, y: 270, w: 100, h: 18 },
    ],

    exits: {}, // las pone el recorrido (ROUTE)
    spawns: { left: { spawnX: 30, spawnY: -260 }, right: { spawnX: 2330, spawnY: 400 } },
    exitBands: { left: [-320, -200], right: [330, 480] },
    decorations: [ { type:'nightRanges', level: 3 } ],
  },
  11: {
    name: 'Pico de la Noche Eterna',
    width: 2400, top: -540, // túneles hasta la cima abierta al cielo, con la trampilla; abajo, el banco roto
    style: 'mountain', night: 4, carved: true,
    bg: ['#010208', '#0e1430'],
    floorColor: '#4a5068', platColor: '#4a5068', edgeColor: '#8a90a8',
    particleColor: '#ffffff', noParticles: true,
    platforms: [
      // roca (lo que no es pasillo)
      { x: 0, y: -540, w: 1800, h: 220 },
      { x: 900, y: -320, w: 900, h: 30 },
      { x: 0, y: -200, w: 300, h: 540 },
      { x: 460, y: -200, w: 1940, h: 540 },
      { x: 800, y: 340, w: 1600, h: 140 },
      { x: 0, y: 480, w: 2400, h: 60 },
      { x: 310, y: 390, w: 70, h: 18 },
      { x: 380, y: 300, w: 70, h: 18 },
      { x: 310, y: 210, w: 70, h: 18 },
      { x: 380, y: 120, w: 70, h: 18 },
      { x: 310, y: 30, w: 70, h: 18 },
      { x: 380, y: -60, w: 70, h: 18 },
      { x: 310, y: -150, w: 70, h: 18 },
      { x: 2200, y: -300, w: 100, h: 18 },
    ],

    exits: {}, // la de la izquierda la pone el recorrido (ROUTE)
    spawns: { left: { spawnX: 30, spawnY: -260 } },
    hatch: { x: 2050, y: -200, w: 56, room: 36, spawnX: 1100, spawnY: -500 }, // trampilla al interior del castillo
    exitBands: { left: [-320, -200] },
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
      up:    { room: 11, spawnX: 2150, spawnY: -260 },
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
    width: 2400, top: -540, // pasillos medio derrumbados: se arrastra uno por una gatera y sube por tiros al techo
    upSpawnX: 317,          // al bajar desde arriba caes por el hueco del techo
    zone: 0,
    bg: ['#050810', '#0a1020'],
    floorColor: '#1a2238', platColor: '#243050', edgeColor: '#314068',
    particleColor: '#4060b0',
    platforms: [
      // roca (lo que no es pasillo)
      { x: 420, y: -540, w: 1980, h: 160 },
      { x: 0, y: -540, w: 240, h: 290 },
      { x: 0, y: -250, w: 1560, h: 230 },
      { x: 0, y: -20, w: 1300, h: 20 },
      { x: 1000, y: 0, w: 300, h: 50 },
      { x: 1700, y: -380, w: 700, h: 500 },
      { x: 720, y: 120, w: 80, h: 100 },
      { x: 950, y: 120, w: 1450, h: 100 },
      { x: 0, y: 0, w: 560, h: 350 },
      { x: 720, y: 220, w: 1680, h: 130 },
      { x: 700, y: 350, w: 1700, h: 130 },
      { x: 0, y: 480, w: 2400, h: 60 },
      { x: 640, y: 390, w: 70, h: 18 },
      { x: 570, y: 300, w: 70, h: 18 },
      { x: 640, y: 210, w: 70, h: 18 },
      { x: 1640, y: 30, w: 60, h: 18 },
      { x: 1570, y: -60, w: 60, h: 18 },
      { x: 1640, y: -150, w: 60, h: 18 },
      { x: 260, y: -340, w: 80, h: 18 },
      { x: 340, y: -430, w: 70, h: 18 },
    ],

    exits: {}, // las pone el recorrido (ROUTE)
    spawns: { left: { spawnX: 30, spawnY: 400 } },
    exitBands: { left: [350, 480], up: [240, 420] },
    decorations: [ { type:'pillar', x:60, y:420, h:60 } ],
  },
  15: {
    name: 'Galería de los Ecos',
    width: 2400, top: -540, // galería larga abajo; se sube por tiros a una cámara de ecos y sale arriba a la izquierda
    zone: 0,
    bg: ['#050810', '#0a1020'],
    floorColor: '#1a2238', platColor: '#243050', edgeColor: '#314068',
    particleColor: '#4060b0',
    platforms: [
      // roca (lo que no es pasillo)
      { x: 0, y: -540, w: 2370, h: 220 },
      { x: 860, y: -320, w: 140, h: 270 },
      { x: 1400, y: -320, w: 970, h: 270 },
      { x: 0, y: -180, w: 700, h: 260 },
      { x: 1660, y: -50, w: 710, h: 380 },
      { x: 0, y: 80, w: 1500, h: 250 },
      { x: 0, y: 330, w: 150, h: 150 },
      { x: 0, y: 480, w: 240, h: 60 },
      { x: 420, y: 480, w: 1950, h: 60 },
      { x: 1580, y: 390, w: 70, h: 18 },
      { x: 1510, y: 300, w: 70, h: 18 },
      { x: 1580, y: 210, w: 70, h: 18 },
      { x: 1510, y: 120, w: 70, h: 18 },
      { x: 780, y: -10, w: 70, h: 18 },
      { x: 710, y: -100, w: 70, h: 18 },
      { x: 1100, y: -130, w: 90, h: 18 },
      { x: 1250, y: -220, w: 90, h: 18 },
      { x: 2370, y: -540, w: 30, h: 920 },
      // pared
      { x: 2370, y: 380, w: 30, h: 100, breakable: 'w15' },
      // parece pared: se rompe a golpes
      { x: 2370, y: 480, w: 30, h: 60 },
    ],

    exits: { right: { room: 43, spawnX: 30, spawnY: 400, hidden: true } }, // el resto las pone el recorrido (ROUTE)
    spawns: { left: { spawnX: 30, spawnY: -260 }, down: { spawnX: 470, spawnY: 400 } },
    exitBands: { left: [-320, -180], down: [240, 420] },
    decorations: [ { type:'pillar', x:600, y:420, h:60 } ],
  },
  16: {
    name: 'Grieta de Cuarzo',
    width: 2400, top: -540, // grietas que bajan desde la derecha hasta un tiro que cae a la cueva de abajo
    zone: 1,
    bg: ['#05100a', '#0a1f14'],
    floorColor: '#1a3028', platColor: '#224038', edgeColor: '#2e5448',
    particleColor: '#30c090',
    platforms: [
      // roca (lo que no es pasillo)
      { x: 240, y: -540, w: 2160, h: 280 },
      { x: 240, y: -260, w: 1360, h: 110 },
      { x: 240, y: -150, w: 660, h: 70 },
      { x: 1200, y: -150, w: 400, h: 200 },
      { x: 240, y: -80, w: 200, h: 130 },
      { x: 740, y: -80, w: 160, h: 130 },
      { x: 1760, y: -140, w: 640, h: 320 },
      { x: 0, y: 180, w: 500, h: 360 },
      { x: 680, y: 180, w: 1720, h: 360 },
      { x: 1680, y: 90, w: 70, h: 18 },
      { x: 1610, y: 0, w: 70, h: 18 },
      { x: 1680, y: -80, w: 70, h: 18 },
      { x: 950, y: -40, w: 90, h: 18 },
      { x: 560, y: 110, w: 60, h: 18 },
      { x: 0, y: -540, w: 240, h: 620 },
      // pared
      { x: 0, y: 80, w: 240, h: 100, breakable: 'w16' },
      // parece pared: se rompe a golpes
    ],

    exits: { left: { room: 40, spawnX: 890, spawnY: 400, hidden: true } }, // el resto las pone el recorrido (ROUTE)
    spawns: { right: { spawnX: 2330, spawnY: -220 }, down: { spawnX: 700, spawnY: 100 } },
    exitBands: { right: [-260, -140], down: [500, 680] },
    decorations: [ { type:'crystal', x:1300, y:50, h:130 }, { type:'crystal', x:2000, y:-260, h:120 } ],
  },
  17: {
    name: 'Cueva Luminosa',
    width: 2400, top: -540, // se cae por un tiro a galerías luminosas que bajan hasta el pasillo de la izquierda
    upSpawnX: 590,          // al bajar desde arriba caes por el tiro
    zone: 1,
    bg: ['#05100a', '#0a1f14'],
    floorColor: '#1a3028', platColor: '#224038', edgeColor: '#2e5448',
    particleColor: '#30c090',
    platforms: [
      // roca (lo que no es pasillo)
      { x: 0, y: -540, w: 500, h: 210 },
      { x: 680, y: -540, w: 1720, h: 210 },
      { x: 0, y: -330, w: 300, h: 130 },
      { x: 1700, y: -330, w: 700, h: 130 },
      { x: 0, y: -200, w: 1560, h: 230 },
      { x: 1720, y: -200, w: 680, h: 350 },
      { x: 960, y: 150, w: 1440, h: 100 },
      { x: 0, y: 30, w: 800, h: 300 },
      { x: 960, y: 250, w: 840, h: 130 },
      { x: 2200, y: 250, w: 200, h: 230 },
      { x: 0, y: 480, w: 2400, h: 60 },
      { x: 510, y: -290, w: 80, h: 18 },
      { x: 590, y: -380, w: 80, h: 18 },
      { x: 510, y: -470, w: 80, h: 18 },
      { x: 1570, y: 60, w: 70, h: 18 },
      { x: 1640, y: -30, w: 70, h: 18 },
      { x: 1570, y: -120, w: 70, h: 18 },
      { x: 810, y: 390, w: 70, h: 18 },
      { x: 880, y: 300, w: 70, h: 18 },
      { x: 810, y: 210, w: 70, h: 18 },
    ],

    exits: {}, // las pone el recorrido (ROUTE)
    spawns: { left: { spawnX: 30, spawnY: 400 } },
    exitBands: { left: [330, 480], up: [500, 680] },
    decorations: [ { type:'crystal', x:1100, y:30, h:120 }, { type:'crystal', x:2000, y:250, h:230 } ],
  },
  18: {
    name: 'Raíces Podridas',
    width: 2880, top: -540, // túneles de raíces en forma de L: arriba el pasillo de las salidas y una vuelta larga por abajo
    upSpawnX: 2380,         // al bajar desde arriba caes por el hueco del techo
    mapCells: [[0, 0], [-1, 0], [-2, 0], [-1, 1], [-2, 1]], // forma en el mapa
    zone: 2,
    style: 'organic', // sala amorfa: todo es tierra con raíces, sin losas rectas
    smooth: true,     // paredes, pisos y techos lisos (sin ondulaciones)
    bg: ['#0a0805', '#1a1205'],
    floorColor: '#2a2010', platColor: '#3a2e18', edgeColor: '#4a3e28',
    particleColor: '#c08030',
    platforms: [
      // roca (lo que no es pasillo)
      { x: 0, y: -540, w: 2300, h: 120 },
      { x: 2500, y: -540, w: 380, h: 240 },
      { x: 1900, y: -420, w: 400, h: 120 },
      { x: 200, y: -300, w: 1600, h: 120 },
      { x: 200, y: -180, w: 1560, h: 170 },
      { x: 1920, y: -180, w: 960, h: 300 },
      { x: 760, y: 120, w: 340, h: 70 },
      { x: 1350, y: 120, w: 1530, h: 70 },
      { x: 0, y: -420, w: 40, h: 760 },
      { x: 200, y: -10, w: 400, h: 350 },
      { x: 760, y: 190, w: 2120, h: 290 },
      { x: 0, y: 480, w: 2880, h: 60 },
      { x: 2320, y: -270, w: 80, h: 18 },
      { x: 2400, y: -360, w: 80, h: 18 },
      { x: 2320, y: -450, w: 80, h: 18 },
      { x: 1840, y: 30, w: 70, h: 18 },
      { x: 1770, y: -55, w: 70, h: 18 },
      { x: 1840, y: -130, w: 70, h: 18 },
      { x: 610, y: 390, w: 70, h: 18 },
      { x: 680, y: 300, w: 70, h: 18 },
      { x: 610, y: 210, w: 70, h: 18 },
      { x: 50, y: 390, w: 70, h: 18 },
      { x: 120, y: 300, w: 70, h: 18 },
      { x: 50, y: 210, w: 70, h: 18 },
      { x: 120, y: 120, w: 70, h: 18 },
      { x: 50, y: 30, w: 70, h: 18 },
      { x: 120, y: -60, w: 70, h: 18 },
      { x: 50, y: -150, w: 70, h: 18 },
      { x: 120, y: -240, w: 70, h: 18 },
    ],

    exits: {}, // las pone el recorrido (ROUTE)
    spawns: { right: { spawnX: 2810, spawnY: -230 } },
    exitBands: { right: [-300, -180], up: [2300, 2500] },
    decorations: [ { type:'mushroom', x:300, y:480 }, { type:'mushroom', x:1300, y:120 }, { type:'mushroom', x:2600, y:-180 } ],
  },
  19: {
    name: 'Pantano de Esporas',
    width: 2400, top: -540, // túneles de pantano: del hueco del suelo se sube por tiros hasta el hueco del techo
    upSpawnX: 1060,         // al bajar desde arriba caes en la repisa bajo el hueco
    zone: 2,
    bg: ['#0a0805', '#1a1205'],
    floorColor: '#2a2010', platColor: '#3a2e18', edgeColor: '#4a3e28',
    particleColor: '#c08030',
    platforms: [
      // roca (lo que no es pasillo)
      { x: 0, y: -540, w: 1000, h: 60 },
      { x: 1200, y: -540, w: 1200, h: 60 },
      { x: 1300, y: -480, w: 1100, h: 120 },
      { x: 460, y: -360, w: 1940, h: 160 },
      { x: 460, y: -200, w: 1240, h: 70 },
      { x: 1060, y: -130, w: 640, h: 40 },
      { x: 0, y: -480, w: 300, h: 480 },
      { x: 2100, y: -200, w: 300, h: 200 },
      { x: 1060, y: 0, w: 1340, h: 330 },
      { x: 1060, y: 330, w: 740, h: 30 },
      { x: 0, y: 0, w: 900, h: 480 },
      { x: 0, y: 480, w: 1900, h: 60 },
      { x: 2100, y: 480, w: 300, h: 60 },
      { x: 980, y: 390, w: 70, h: 18 },
      { x: 910, y: 300, w: 70, h: 18 },
      { x: 980, y: 210, w: 70, h: 18 },
      { x: 910, y: 120, w: 70, h: 18 },
      { x: 980, y: 30, w: 70, h: 18 },
      { x: 380, y: -90, w: 70, h: 18 },
      { x: 310, y: -180, w: 70, h: 18 },
      { x: 380, y: -270, w: 70, h: 18 },
      { x: 1060, y: -450, w: 90, h: 18 },
    ],

    exits: {}, // las pone el recorrido (ROUTE)
    spawns: { down: { spawnX: 1820, spawnY: 400 } }, // se sube por el hueco del suelo
    exitBands: { down: [1900, 2100], up: [1000, 1200] },
    decorations: [ { type:'mushroom', x:1200, y:480 }, { type:'mushroom', x:600, y:0 }, { type:'mushroom', x:800, y:-360 } ],
  },
  20: {
    name: 'Antesala Carmesí',
    width: 2400, top: -540, // pasillos estrechos que suben en zigzag del hueco del suelo al pasillo de la derecha
    zone: 4,
    bg: ['#100505', '#200808'],
    floorColor: '#301010', platColor: '#481818', edgeColor: '#602020',
    particleColor: '#ff4040',
    platforms: [
      // roca (lo que no es pasillo)
      { x: 0, y: -540, w: 2400, h: 100 },
      { x: 0, y: -440, w: 1000, h: 110 },
      { x: 1300, y: -440, w: 1100, h: 110 },
      { x: 1760, y: -330, w: 640, h: 130 },
      { x: 580, y: -200, w: 1000, h: 140 },
      { x: 580, y: -60, w: 1820, h: 90 },
      { x: 0, y: -330, w: 400, h: 490 },
      { x: 0, y: 160, w: 1100, h: 170 },
      { x: 540, y: 330, w: 560, h: 30 },
      { x: 1260, y: 30, w: 1140, h: 450 },
      { x: 0, y: 330, w: 120, h: 150 },
      { x: 0, y: 480, w: 200, h: 60 },
      { x: 400, y: 480, w: 2000, h: 60 },
      { x: 1110, y: 390, w: 80, h: 18 },
      { x: 1190, y: 300, w: 80, h: 18 },
      { x: 1110, y: 210, w: 80, h: 18 },
      { x: 410, y: 70, w: 80, h: 18 },
      { x: 490, y: -20, w: 80, h: 18 },
      { x: 410, y: -110, w: 80, h: 18 },
      { x: 1030, y: -300, w: 100, h: 18 },
      { x: 1170, y: -380, w: 80, h: 18 },
      { x: 1600, y: -130, w: 80, h: 18 },
    ],

    exits: {}, // las pone el recorrido (ROUTE)
    spawns: { right: { spawnX: 2330, spawnY: -140 }, down: { spawnX: 470, spawnY: 400 } },
    exitBands: { right: [-200, -60], down: [200, 400] },
    decorations: [],
  },
  21: {
    name: 'Corredor del Trono',
    width: 2400, top: -540, // del pasillo alto se baja por dos tiros al corredor largo que llega al trono
    zone: 4,
    bg: ['#100505', '#200808'],
    floorColor: '#301010', platColor: '#481818', edgeColor: '#602020',
    particleColor: '#ff4040',
    platforms: [
      // roca (lo que no es pasillo)
      { x: 0, y: -540, w: 2400, h: 240 },
      { x: 0, y: -300, w: 250, h: 100 },
      { x: 500, y: -300, w: 1900, h: 100 },
      { x: 800, y: -200, w: 1600, h: 270 },
      { x: 0, y: -60, w: 620, h: 260 },
      { x: 1500, y: 70, w: 900, h: 160 },
      { x: 0, y: 200, w: 1340, h: 130 },
      { x: 1500, y: 230, w: 200, h: 100 },
      { x: 2250, y: 230, w: 150, h: 100 },
      { x: 0, y: 330, w: 400, h: 150 },
      { x: 0, y: 480, w: 2400, h: 60 },
      { x: 700, y: 110, w: 80, h: 18 },
      { x: 630, y: 20, w: 80, h: 18 },
      { x: 1350, y: 390, w: 70, h: 18 },
      { x: 1420, y: 300, w: 70, h: 18 },
    ],

    exits: {}, // las pone el recorrido (ROUTE)
    spawns: { left: { spawnX: 30, spawnY: -140 }, right: { spawnX: 2330, spawnY: 400 } },
    exitBands: { left: [-200, -60], right: [330, 480] },
    decorations: [],
  },
  22: {
    name: 'Pozo de las Estrellas',
    width: 2400, top: -540, // grietas estrechas entre estrellas: del hueco del suelo al del techo
    upSpawnX: 2100,         // al bajar desde arriba caes en el pasillo de arriba
    zone: 3,
    bg: ['#100818', '#1a0e28'],
    floorColor: '#2a1848', platColor: '#3a2060', edgeColor: '#503080',
    particleColor: '#c080ff',
    platforms: [
      // roca (lo que no es pasillo)
      { x: 0, y: -540, w: 2000, h: 90 },
      { x: 2200, y: -540, w: 200, h: 90 },
      { x: 0, y: -450, w: 1700, h: 120 },
      { x: 2250, y: -450, w: 150, h: 120 },
      { x: 0, y: -330, w: 1600, h: 180 },
      { x: 0, y: -150, w: 1180, h: 60 },
      { x: 1400, y: -150, w: 200, h: 60 },
      { x: 1950, y: -330, w: 450, h: 370 },
      { x: 0, y: -90, w: 880, h: 420 },
      { x: 600, y: 330, w: 280, h: 20 },
      { x: 1060, y: 40, w: 1340, h: 440 },
      { x: 0, y: 330, w: 150, h: 150 },
      { x: 0, y: 480, w: 200, h: 60 },
      { x: 400, y: 480, w: 2000, h: 60 },
      { x: 890, y: 390, w: 80, h: 18 },
      { x: 970, y: 290, w: 80, h: 18 },
      { x: 890, y: 200, w: 80, h: 18 },
      { x: 970, y: 110, w: 80, h: 18 },
      { x: 1200, y: -50, w: 80, h: 18 },
      { x: 1640, y: -50, w: 90, h: 18 },
      { x: 1780, y: -140, w: 90, h: 18 },
      { x: 1860, y: -230, w: 80, h: 18 },
      { x: 2050, y: -430, w: 100, h: 18 },
    ],

    exits: {
      up: { room: 23, spawnX: 1900, spawnY: 400 },
      down: { room: 1, spawnX: 1207, spawnY: -470 }, // cae junto a la reja
    },
    spawns: { down: { spawnX: 470, spawnY: 400 } },
    exitBands: { down: [200, 400], up: [2000, 2200] },
    decorations: [ { type:'star', x:300, y:380 }, { type:'star', x:700, y:420 }, { type:'star', x:1300, y:-10 }, { type:'star', x:1250, y:-120 },
      { type:'star', x:1750, y:-250 }, { type:'star', x:1900, y:-100 }, { type:'star', x:2150, y:-400 } ],
  },
  23: {
    name: 'Ascenso Fracturado',
    width: 2400, top: -540, // grietas del cielo roto: del hueco del suelo (derecha) al del techo (izquierda)
    upSpawnX: 290,
    zone: 3,
    bg: ['#100818', '#1a0e28'],
    floorColor: '#2a1848', platColor: '#3a2060', edgeColor: '#503080',
    particleColor: '#c080ff',
    platforms: [
      // roca (lo que no es pasillo)
      { x: 400, y: -540, w: 2000, h: 120 },
      { x: 0, y: -540, w: 200, h: 170 },
      { x: 400, y: -420, w: 350, h: 50 },
      { x: 1000, y: -420, w: 1400, h: 170 },
      { x: 0, y: -370, w: 150, h: 120 },
      { x: 670, y: -250, w: 1730, h: 220 },
      { x: 670, y: -30, w: 230, h: 60 },
      { x: 0, y: -250, w: 500, h: 410 },
      { x: 960, y: 100, w: 340, h: 60 },
      { x: 1470, y: -30, w: 930, h: 360 },
      { x: 1470, y: 330, w: 480, h: 10 },
      { x: 0, y: 160, w: 1300, h: 320 },
      { x: 0, y: 480, w: 2000, h: 60 },
      { x: 2200, y: 480, w: 200, h: 60 },
      { x: 1310, y: 390, w: 80, h: 18 },
      { x: 1390, y: 300, w: 80, h: 18 },
      { x: 1310, y: 210, w: 80, h: 18 },
      { x: 1390, y: 120, w: 80, h: 18 },
      { x: 510, y: 70, w: 80, h: 18 },
      { x: 590, y: -20, w: 80, h: 18 },
      { x: 510, y: -110, w: 80, h: 18 },
      { x: 590, y: -200, w: 80, h: 18 },
      { x: 230, y: -350, w: 90, h: 18 },
      { x: 310, y: -440, w: 80, h: 18 },
      { x: 800, y: -340, w: 90, h: 18 },
    ],

    exits: {
      up: { room: 3, spawnX: 180, spawnY: 450 },
      down: { room: 22, spawnX: 2100, spawnY: -500 },
    },
    spawns: { down: { spawnX: 1900, spawnY: 400 } },
    exitBands: { up: [200, 400], down: [2000, 2200] },
    decorations: [ { type:'star', x:1600, y:400 }, { type:'star', x:1100, y:20 }, { type:'star', x:700, y:80 }, { type:'star', x:400, y:-320 },
      { type:'star', x:850, y:-400 }, { type:'star', x:2200, y:380 } ],
  },
  24: {
    name: 'Escalera del Herrero',
    width: 2400, top: -540, // escalera de piedra en un túnel estrecho que sube en diagonal
    upSpawnX: 2290,         // al bajar desde arriba caes en el último escalón
    zone: 5,
    bg: ['#060412', '#0e0820'],
    floorColor: '#1c1430', platColor: '#2c2048', edgeColor: '#4a3870',
    particleColor: '#9944ff',
    platforms: [
      // roca (lo que no es pasillo)
      { x: 0, y: -540, w: 60, h: 1080 },
      { x: 60, y: 480, w: 40, h: 60 },
      { x: 60, y: -540, w: 340, h: 840 },
      { x: 300, y: 480, w: 100, h: 60 },
      { x: 400, y: -540, w: 110, h: 770 },
      { x: 400, y: 410, w: 110, h: 130 },
      { x: 510, y: -540, w: 110, h: 700 },
      { x: 510, y: 340, w: 110, h: 200 },
      { x: 620, y: -540, w: 110, h: 630 },
      { x: 620, y: 270, w: 110, h: 270 },
      { x: 730, y: -540, w: 110, h: 560 },
      { x: 730, y: 200, w: 370, h: 340 },
      { x: 840, y: -540, w: 260, h: 510 },
      { x: 1100, y: -540, w: 110, h: 490 },
      { x: 1100, y: 130, w: 110, h: 410 },
      { x: 1210, y: -540, w: 110, h: 420 },
      { x: 1210, y: 60, w: 110, h: 480 },
      { x: 1320, y: -540, w: 110, h: 350 },
      { x: 1320, y: -10, w: 110, h: 550 },
      { x: 1430, y: -540, w: 110, h: 280 },
      { x: 1540, y: -540, w: 40, h: 230 },
      { x: 1580, y: -540, w: 180, h: 100 },
      { x: 1430, y: -80, w: 370, h: 620 },
      { x: 1760, y: -540, w: 40, h: 230 },
      { x: 1800, y: -540, w: 110, h: 210 },
      { x: 1800, y: -150, w: 110, h: 690 },
      { x: 1910, y: -540, w: 110, h: 140 },
      { x: 1910, y: -220, w: 110, h: 760 },
      { x: 2020, y: -540, w: 110, h: 70 },
      { x: 2020, y: -290, w: 110, h: 830 },
      { x: 2130, y: -360, w: 110, h: 900 },
      { x: 2240, y: -430, w: 160, h: 970 },
      { x: 1620, y: -170, w: 90, h: 18 },
    ],

    exits: {
      up: { room: 25, spawnX: 2150, spawnY: 400 },
      down: { room: 3, spawnX: 460, spawnY: 110 },
    },
    exitBands: { down: [100, 300], up: [2240, 2400] },
    decorations: [],
  },
  25: {
    name: 'Depósito de Armas',
    width: 2400, top: -540, // pasillos de almacén entre estantes, del hueco del suelo al del techo
    zone: 5,
    bg: ['#060412', '#0e0820'],
    floorColor: '#1c1430', platColor: '#2c2048', edgeColor: '#4a3870',
    particleColor: '#9944ff',
    platforms: [
      // roca (lo que no es pasillo)
      { x: 300, y: -540, w: 2100, h: 90 },
      { x: 0, y: -540, w: 100, h: 210 },
      { x: 880, y: -450, w: 1520, h: 250 },
      { x: 880, y: -200, w: 120, h: 100 },
      { x: 1300, y: -200, w: 1100, h: 100 },
      { x: 0, y: -330, w: 700, h: 370 },
      { x: 1680, y: -100, w: 720, h: 430 },
      { x: 0, y: 40, w: 1500, h: 290 },
      { x: 900, y: 330, w: 600, h: 50 },
      { x: 0, y: 330, w: 300, h: 150 },
      { x: 0, y: 480, w: 2220, h: 60 },
      { x: 1510, y: 390, w: 80, h: 18 },
      { x: 1590, y: 300, w: 80, h: 18 },
      { x: 1510, y: 210, w: 80, h: 18 },
      { x: 1590, y: 120, w: 80, h: 18 },
      { x: 790, y: -50, w: 80, h: 18 },
      { x: 710, y: -140, w: 80, h: 18 },
      { x: 790, y: -230, w: 80, h: 18 },
      { x: 130, y: -430, w: 90, h: 18 },
      { x: 1050, y: -60, w: 90, h: 18 },
      { x: 1180, y: -140, w: 90, h: 18 },
    ],

    exits: {
      up: { room: 5, spawnX: 60, spawnY: 400 },
      down: { room: 24, spawnX: 2290, spawnY: -500 },
    },
    exitBands: { up: [100, 300], down: [2220, 2400] },
    decorations: [],
  },
  26: {
    name: 'Puente Levadizo',
    width: 2400, top: -540, // pasadizos de la muralla: abajo el foso (cae al patio), arriba el adarve
    zone: 6,
    bg: ['#0c0a10', '#18141e'],
    floorColor: '#2a2630', platColor: '#3a3542', edgeColor: '#55505e',
    particleColor: '#ff9a40',
    platforms: [
      // roca (lo que no es pasillo)
      { x: 0, y: -540, w: 2370, h: 140 },
      { x: 0, y: -400, w: 1100, h: 150 },
      { x: 1300, y: -400, w: 1070, h: 270 },
      { x: 0, y: -250, w: 500, h: 120 },
      { x: 750, y: -250, w: 350, h: 120 },
      { x: 0, y: -130, w: 300, h: 460 },
      { x: 2060, y: -130, w: 310, h: 460 },
      { x: 460, y: 0, w: 1440, h: 330 },
      { x: 0, y: 480, w: 820, h: 60 },
      { x: 1060, y: 480, w: 1310, h: 60 },
      { x: 310, y: 390, w: 70, h: 18 },
      { x: 380, y: 300, w: 70, h: 18 },
      { x: 310, y: 210, w: 70, h: 18 },
      { x: 380, y: 120, w: 70, h: 18 },
      { x: 310, y: 30, w: 70, h: 18 },
      { x: 1910, y: 390, w: 70, h: 18 },
      { x: 1980, y: 300, w: 70, h: 18 },
      { x: 1910, y: 210, w: 70, h: 18 },
      { x: 1980, y: 120, w: 70, h: 18 },
      { x: 1910, y: 30, w: 70, h: 18 },
      { x: 560, y: -130, w: 90, h: 18 },
      { x: 2370, y: -540, w: 30, h: 870 },
      // pared
      { x: 2370, y: 330, w: 30, h: 150, breakable: 'w26' },
      // parece pared: se rompe a golpes
      { x: 2370, y: 480, w: 30, h: 60 },
    ],

    exits: { right: { room: 41, spawnX: 30, spawnY: 400, hidden: true } }, // el resto las pone el recorrido (ROUTE)
    spawns: { left: { spawnX: 30, spawnY: 400 }, down: { spawnX: 760, spawnY: 400 } },
    exitBands: { left: [330, 480], down: [820, 1060] },
    decorations: [ { type:'bricks' }, { type:'window', x:1200, y:-300 }, { type:'torch', x:60, y:420 }, { type:'torch', x:1500, y:-70 }, { type:'torch', x:2200, y:420 } ],
  },
  27: {
    name: 'Patio de Armas',
    width: 2400, top: -540, // galerías estrechas que bajan del foso al patio y salen a la derecha
    upSpawnX: 930,          // al caer del foso
    zone: 6,
    bg: ['#0c0a10', '#18141e'],
    floorColor: '#2a2630', platColor: '#3a3542', edgeColor: '#55505e',
    particleColor: '#ff9a40',
    platforms: [
      // roca (lo que no es pasillo)
      { x: 0, y: -540, w: 820, h: 200 },
      { x: 1060, y: -540, w: 1340, h: 200 },
      { x: 0, y: -340, w: 500, h: 140 },
      { x: 0, y: -200, w: 1140, h: 180 },
      { x: 1300, y: -340, w: 1100, h: 460 },
      { x: 460, y: 120, w: 1940, h: 30 },
      { x: 460, y: 150, w: 740, h: 180 },
      { x: 1800, y: 150, w: 600, h: 180 },
      { x: 0, y: -20, w: 300, h: 500 },
      { x: 0, y: 480, w: 2400, h: 60 },
      { x: 850, y: -290, w: 80, h: 18 },
      { x: 950, y: -380, w: 80, h: 18 },
      { x: 850, y: -470, w: 80, h: 18 },
      { x: 1150, y: 30, w: 70, h: 18 },
      { x: 1220, y: -60, w: 70, h: 18 },
      { x: 1150, y: -150, w: 70, h: 18 },
      { x: 310, y: 390, w: 70, h: 18 },
      { x: 380, y: 300, w: 70, h: 18 },
      { x: 310, y: 210, w: 70, h: 18 },
      { x: 1350, y: 330, w: 120, h: 18 },
      { x: 1600, y: 240, w: 120, h: 18 },
    ],

    exits: {}, // las pone el recorrido (ROUTE)
    spawns: { right: { spawnX: 2330, spawnY: 400 } },
    exitBands: { up: [820, 1060], right: [330, 480] },
    decorations: [ { type:'bricks' }, { type:'torch', x:600, y:-280 }, { type:'torch', x:700, y:40 }, { type:'torch', x:2300, y:400 } ],
  },
  28: {
    name: 'Adarve Nevado',
    width: 2400, top: -540, // el camino de ronda por dentro de la muralla: baja, cruza y sube al hueco del techo
    upSpawnX: 2040,         // al bajar desde arriba caes en las repisas del hueco
    zone: 7,
    style: 'castleRock', carved: true,
    bg: ['#6e5560', '#c08070'],
    floorColor: '#8a807e', platColor: '#9a908c', edgeColor: '#b4aaa4',
    particleColor: '#ffffff', noParticles: true,
    platforms: [
      // roca (lo que no es pasillo)
      { x: 0, y: -540, w: 1900, h: 210 },
      { x: 2100, y: -540, w: 300, h: 270 },
      { x: 700, y: -330, w: 1200, h: 60 },
      { x: 700, y: -270, w: 740, h: 70 },
      { x: 2250, y: -270, w: 150, h: 120 },
      { x: 720, y: -200, w: 720, h: 260 },
      { x: 0, y: -200, w: 560, h: 400 },
      { x: 1600, y: -150, w: 800, h: 350 },
      { x: 0, y: 200, w: 1000, h: 60 },
      { x: 1200, y: 200, w: 1200, h: 60 },
      { x: 0, y: 260, w: 2400, h: 280 },
      { x: 570, y: 110, w: 70, h: 18 },
      { x: 640, y: 20, w: 70, h: 18 },
      { x: 570, y: -70, w: 70, h: 18 },
      { x: 640, y: -150, w: 70, h: 18 },
      { x: 1450, y: 110, w: 70, h: 18 },
      { x: 1520, y: 20, w: 70, h: 18 },
      { x: 1450, y: -70, w: 70, h: 18 },
      { x: 1930, y: -240, w: 80, h: 18 },
      { x: 2010, y: -330, w: 80, h: 18 },
      { x: 1930, y: -420, w: 80, h: 18 },
      { x: 2010, y: -490, w: 70, h: 18 },
    ],

    exits: {}, // las pone el recorrido (ROUTE)
    spawns: { left: { spawnX: 30, spawnY: -260 } },
    exitBands: { left: [-330, -200], up: [1900, 2100] },
    decorations: [ { type:'nightRanges' } ],
  },
  29: {
    name: 'Torre del Vigía',
    width: 2400, top: -540, // la torre por dentro: se sube por tiros y galerías hasta el pasillo alto de la izquierda
    zone: 7,
    style: 'castleRock', carved: true,
    bg: ['#6e5560', '#c08070'],
    floorColor: '#8a807e', platColor: '#9a908c', edgeColor: '#b4aaa4',
    particleColor: '#ffffff', noParticles: true,
    platforms: [
      // roca (lo que no es pasillo)
      { x: 0, y: -540, w: 2400, h: 90 },
      { x: 0, y: -330, w: 1740, h: 80 },
      { x: 0, y: -250, w: 1250, h: 120 },
      { x: 1550, y: -250, w: 190, h: 120 },
      { x: 1900, y: -450, w: 500, h: 450 },
      { x: 1060, y: 0, w: 1340, h: 330 },
      { x: 1060, y: 330, w: 640, h: 30 },
      { x: 0, y: -130, w: 900, h: 610 },
      { x: 0, y: 480, w: 1900, h: 60 },
      { x: 2100, y: 480, w: 300, h: 60 },
      { x: 980, y: 390, w: 70, h: 18 },
      { x: 910, y: 300, w: 70, h: 18 },
      { x: 980, y: 210, w: 70, h: 18 },
      { x: 910, y: 120, w: 70, h: 18 },
      { x: 980, y: 30, w: 70, h: 18 },
      { x: 1750, y: -90, w: 70, h: 18 },
      { x: 1820, y: -180, w: 70, h: 18 },
      { x: 1750, y: -270, w: 70, h: 18 },
      { x: 1300, y: -110, w: 90, h: 18 },
    ],

    exits: {}, // las pone el recorrido (ROUTE)
    spawns: { left: { spawnX: 30, spawnY: -380 }, down: { spawnX: 1830, spawnY: 400 } },
    exitBands: { left: [-450, -330], down: [1900, 2100] },
    decorations: [ { type:'nightRanges' } ],
  },
  30: {
    name: 'Ladera Blanca',
    width: 2400, top: -540, // túneles por la ladera con un claro de pinos; se sale por el techo
    upSpawnX: 1400,         // al bajar desde arriba caes en la repisa bajo el hueco
    zone: 8,
    style: 'mountain', night: 1.33, carved: true,
    bg: ['#010208', '#0e1430'],
    floorColor: '#4a5068', platColor: '#4a5068', edgeColor: '#8a90a8',
    particleColor: '#ffffff', noParticles: true,
    platforms: [
      // roca (lo que no es pasillo)
      { x: 0, y: -540, w: 1300, h: 130 },
      { x: 1500, y: -540, w: 900, h: 240 },
      { x: 660, y: -300, w: 1740, h: 40 },
      { x: 660, y: -260, w: 140, h: 210 },
      { x: 1300, y: -260, w: 1100, h: 210 },
      { x: 0, y: -410, w: 500, h: 490 },
      { x: 1660, y: -50, w: 740, h: 380 },
      { x: 0, y: 80, w: 1500, h: 400 },
      { x: 0, y: 480, w: 2400, h: 60 },
      { x: 1510, y: 390, w: 70, h: 18 },
      { x: 1580, y: 300, w: 70, h: 18 },
      { x: 1510, y: 210, w: 70, h: 18 },
      { x: 1580, y: 120, w: 70, h: 18 },
      { x: 580, y: -10, w: 70, h: 18 },
      { x: 510, y: -100, w: 70, h: 18 },
      { x: 580, y: -190, w: 70, h: 18 },
      { x: 510, y: -270, w: 70, h: 18 },
      { x: 1330, y: -390, w: 80, h: 18 },
      { x: 1410, y: -470, w: 70, h: 18 },
    ],

    exits: {}, // las pone el recorrido (ROUTE)
    spawns: { right: { spawnX: 2330, spawnY: 400 } },
    exitBands: { right: [330, 480], up: [1300, 1500] },
    decorations: [ { type:'nightRanges', level: 1.33 } ],
  },
  31: {
    name: 'Cornisa Helada',
    width: 2400, top: -540, // cornisas dentro del hielo: del hueco del suelo se sube a una cornisa y al túnel alto de la derecha
    zone: 8,
    style: 'mountain', night: 1.67, carved: true,
    bg: ['#010208', '#0e1430'],
    floorColor: '#4a5068', platColor: '#4a5068', edgeColor: '#8a90a8',
    particleColor: '#ffffff', noParticles: true,
    platforms: [
      // roca (lo que no es pasillo)
      { x: 30, y: -540, w: 2370, h: 120 },
      { x: 30, y: -420, w: 1970, h: 170 },
      { x: 30, y: -250, w: 1070, h: 160 },
      { x: 1500, y: -250, w: 500, h: 160 },
      { x: 2160, y: -300, w: 240, h: 340 },
      { x: 30, y: -90, w: 970, h: 130 },
      { x: 30, y: 40, w: 1510, h: 290 },
      { x: 30, y: 330, w: 870, h: 30 },
      { x: 1700, y: 40, w: 700, h: 500 },
      { x: 30, y: 480, w: 1470, h: 60 },
      { x: 1520, y: 400, w: 70, h: 18 },
      { x: 1610, y: 320, w: 70, h: 18 },
      { x: 1530, y: 240, w: 70, h: 18 },
      { x: 1610, y: 160, w: 70, h: 18 },
      { x: 1530, y: 80, w: 70, h: 18 },
      { x: 2010, y: -50, w: 70, h: 18 },
      { x: 2080, y: -140, w: 70, h: 18 },
      { x: 2010, y: -230, w: 70, h: 18 },
      { x: 1150, y: -110, w: 100, h: 18 },
      { x: 1320, y: -190, w: 100, h: 18 },
      { x: 0, y: -540, w: 30, h: 920 },
      // pared
      { x: 0, y: 380, w: 30, h: 100, breakable: 'w31' },
      // parece pared: se rompe a golpes
      { x: 0, y: 480, w: 30, h: 60 },
    ],

    exits: { left: { room: 42, spawnX: 890, spawnY: 400, hidden: true } }, // el resto las pone el recorrido (ROUTE)
    spawns: { down: { spawnX: 1430, spawnY: 400 }, right: { spawnX: 2330, spawnY: -350 } },
    exitBands: { down: [1500, 1700], right: [-420, -300] },
    decorations: [ { type:'nightRanges', level: 1.67 } ],
  },
  32: {
    name: 'Collado del Viento',
    width: 2400, top: -540, // grietas estrechas donde silba el viento; se sube al hueco del techo
    upSpawnX: 1000,         // al bajar desde arriba caes en la repisa bajo el hueco
    zone: 9,
    style: 'mountain', night: 2.33, carved: true,
    bg: ['#010208', '#0e1430'],
    floorColor: '#4a5068', platColor: '#4a5068', edgeColor: '#8a90a8',
    particleColor: '#ffffff', noParticles: true,
    platforms: [
      // roca (lo que no es pasillo)
      { x: 0, y: -540, w: 900, h: 170 },
      { x: 1100, y: -540, w: 1300, h: 170 },
      { x: 0, y: -370, w: 800, h: 120 },
      { x: 1800, y: -370, w: 600, h: 170 },
      { x: 0, y: -250, w: 1640, h: 240 },
      { x: 1800, y: -200, w: 200, h: 210 },
      { x: 2300, y: -200, w: 100, h: 300 },
      { x: 920, y: 100, w: 280, h: 70 },
      { x: 1400, y: 100, w: 1000, h: 70 },
      { x: 0, y: -10, w: 760, h: 350 },
      { x: 920, y: 170, w: 1480, h: 170 },
      { x: 900, y: 340, w: 1500, h: 140 },
      { x: 0, y: 480, w: 2400, h: 60 },
      { x: 770, y: 390, w: 70, h: 18 },
      { x: 840, y: 300, w: 70, h: 18 },
      { x: 770, y: 210, w: 70, h: 18 },
      { x: 840, y: 120, w: 70, h: 18 },
      { x: 1650, y: 10, w: 70, h: 18 },
      { x: 1720, y: -80, w: 70, h: 18 },
      { x: 1650, y: -170, w: 70, h: 18 },
      { x: 930, y: -350, w: 80, h: 18 },
      { x: 1010, y: -440, w: 80, h: 18 },
      { x: 2050, y: -20, w: 90, h: 18 },
      { x: 2180, y: -110, w: 90, h: 18 },
    ],

    exits: {}, // las pone el recorrido (ROUTE)
    spawns: { left: { spawnX: 30, spawnY: 400 } },
    exitBands: { left: [340, 480], up: [900, 1100] },
    decorations: [ { type:'nightRanges', level: 2.33 } ],
  },
  33: {
    name: 'Puente de Hielo',
    width: 2400, top: -540, // un puente de hielo sobre una cueva helada; se sale por el túnel alto de la derecha
    zone: 9,
    style: 'mountain', night: 2.67, carved: true,
    bg: ['#010208', '#0e1430'],
    floorColor: '#4a5068', platColor: '#4a5068', edgeColor: '#8a90a8',
    particleColor: '#ffffff', noParticles: true,
    platforms: [
      // roca (lo que no es pasillo)
      { x: 0, y: -540, w: 2400, h: 220 },
      { x: 0, y: -320, w: 1840, h: 60 },
      { x: 0, y: -260, w: 700, h: 200 },
      { x: 1000, y: -260, w: 840, h: 200 },
      { x: 2000, y: -200, w: 400, h: 260 },
      { x: 660, y: 60, w: 1740, h: 80 },
      { x: 660, y: 140, w: 540, h: 190 },
      { x: 0, y: -60, w: 500, h: 540 },
      { x: 1700, y: 140, w: 700, h: 340 },
      { x: 0, y: 480, w: 900, h: 60 },
      { x: 1100, y: 480, w: 1300, h: 60 },
      { x: 580, y: 390, w: 70, h: 18 },
      { x: 510, y: 300, w: 70, h: 18 },
      { x: 580, y: 210, w: 70, h: 18 },
      { x: 510, y: 120, w: 70, h: 18 },
      { x: 1850, y: -30, w: 70, h: 18 },
      { x: 1920, y: -120, w: 70, h: 18 },
      { x: 750, y: -30, w: 90, h: 18 },
      { x: 850, y: -120, w: 90, h: 18 },
    ],

    exits: {}, // las pone el recorrido (ROUTE)
    spawns: { down: { spawnX: 830, spawnY: 400 }, right: { spawnX: 2330, spawnY: -260 } },
    exitBands: { down: [900, 1100], right: [-320, -200] },
    decorations: [ { type:'nightRanges', level: 2.67 } ],
  },
  34: {
    name: 'Pared Negra',
    width: 2400, top: -540, // un tiro alto por dentro de la pared negra y una grieta hasta el hueco del techo
    upSpawnX: 1580,         // al bajar desde arriba caes por el hueco
    zone: 10,
    style: 'mountain', night: 3.33, carved: true,
    bg: ['#010208', '#0e1430'],
    floorColor: '#4a5068', platColor: '#4a5068', edgeColor: '#8a90a8',
    particleColor: '#ffffff', noParticles: true,
    platforms: [
      // roca (lo que no es pasillo)
      { x: 1700, y: -540, w: 700, h: 140 },
      { x: 0, y: -540, w: 1540, h: 310 },
      { x: 1700, y: -400, w: 300, h: 200 },
      { x: 2300, y: -400, w: 100, h: 280 },
      { x: 640, y: -120, w: 310, h: 80 },
      { x: 1070, y: -120, w: 1330, h: 80 },
      { x: 0, y: -230, w: 460, h: 570 },
      { x: 640, y: -40, w: 1760, h: 520 },
      { x: 0, y: 480, w: 2400, h: 60 },
      { x: 550, y: 390, w: 80, h: 18 },
      { x: 470, y: 300, w: 80, h: 18 },
      { x: 550, y: 210, w: 80, h: 18 },
      { x: 470, y: 120, w: 80, h: 18 },
      { x: 550, y: 30, w: 80, h: 18 },
      { x: 470, y: -60, w: 80, h: 18 },
      { x: 1620, y: -210, w: 70, h: 18 },
      { x: 1550, y: -300, w: 70, h: 18 },
      { x: 1620, y: -390, w: 70, h: 18 },
      { x: 1550, y: -470, w: 70, h: 18 },
      { x: 2050, y: -220, w: 90, h: 18 },
      { x: 2180, y: -310, w: 90, h: 18 },
    ],

    exits: {}, // las pone el recorrido (ROUTE)
    spawns: { left: { spawnX: 30, spawnY: 400 } },
    exitBands: { left: [340, 480], up: [1540, 1700] },
    decorations: [ { type:'nightRanges', level: 3.33 } ],
  },
  35: {
    name: 'Último Refugio',
    width: 2400, top: -540, // una cueva con fogata donde descansar; de ahí se sube al túnel de salida
    zone: 10,
    style: 'mountain', night: 3.67, carved: true,
    bg: ['#010208', '#0e1430'],
    floorColor: '#4a5068', platColor: '#4a5068', edgeColor: '#8a90a8',
    particleColor: '#ffffff', noParticles: true,
    platforms: [
      // roca (lo que no es pasillo)
      { x: 0, y: -540, w: 2400, h: 220 },
      { x: 0, y: -320, w: 1900, h: 260 },
      { x: 2060, y: -200, w: 340, h: 140 },
      { x: 0, y: -60, w: 1740, h: 260 },
      { x: 800, y: 200, w: 940, h: 130 },
      { x: 800, y: 330, w: 500, h: 10 },
      { x: 1900, y: 60, w: 500, h: 420 },
      { x: 0, y: 200, w: 200, h: 280 },
      { x: 0, y: 480, w: 1720, h: 60 },
      { x: 1880, y: 480, w: 520, h: 60 },
      { x: 1690, y: 400, w: 70, h: 18 },
      { x: 1790, y: 320, w: 70, h: 18 },
      { x: 1750, y: 240, w: 70, h: 18 },
      { x: 1830, y: 160, w: 70, h: 18 },
      { x: 1760, y: 80, w: 70, h: 18 },
      { x: 1910, y: -30, w: 70, h: 18 },
      { x: 1980, y: -120, w: 70, h: 18 },
    ],

    exits: {}, // las pone el recorrido (ROUTE)
    spawns: { down: { spawnX: 1430, spawnY: 400 }, right: { spawnX: 2330, spawnY: -260 } },
    exitBands: { down: [1720, 1880], right: [-320, -200] },
    decorations: [ { type:'nightRanges', level: 3.67 } ],
  },
  36: {
    name: 'Mazmorra Alta',
    width: 2400, top: -540, // pasillos de celdas: se cae de la trampilla y se baja hasta el hueco de la izquierda
    zone: 13,
    bg: ['#0c0a10', '#18141e'],
    floorColor: '#2a2630', platColor: '#3a3542', edgeColor: '#55505e',
    particleColor: '#ff9a40',
    platforms: [
      // roca (lo que no es pasillo)
      { x: 0, y: -540, w: 1000, h: 100 },
      { x: 1200, y: -540, w: 1200, h: 100 },
      { x: 0, y: -440, w: 900, h: 90 },
      { x: 1300, y: -440, w: 1100, h: 200 },
      { x: 460, y: -240, w: 1940, h: 220 },
      { x: 0, y: -350, w: 300, h: 450 },
      { x: 0, y: 100, w: 700, h: 120 },
      { x: 900, y: 100, w: 300, h: 120 },
      { x: 1400, y: 100, w: 140, h: 120 },
      { x: 0, y: 220, w: 1540, h: 120 },
      { x: 1700, y: -20, w: 700, h: 500 },
      { x: 0, y: 340, w: 200, h: 140 },
      { x: 0, y: 480, w: 300, h: 60 },
      { x: 480, y: 480, w: 1920, h: 60 },
      { x: 1030, y: -330, w: 80, h: 18 },
      { x: 1110, y: -420, w: 80, h: 18 },
      { x: 1110, y: -490, w: 70, h: 18 },
      { x: 310, y: 10, w: 70, h: 18 },
      { x: 380, y: -80, w: 70, h: 18 },
      { x: 310, y: -170, w: 70, h: 18 },
      { x: 1550, y: 390, w: 70, h: 18 },
      { x: 1620, y: 300, w: 70, h: 18 },
      { x: 1550, y: 210, w: 70, h: 18 },
      { x: 1620, y: 120, w: 70, h: 18 },
    ],

    exits: {
      up:   { room: 11, spawnX: 2150, spawnY: -260 },
      down: { room: 37, spawnX: 390, spawnY: -500 },
    },
    exitBands: { up: [1000, 1200], down: [300, 480] },
    decorations: [ { type:'bricks' }, { type:'torch', x:1100, y:-300 }, { type:'torch', x:600, y:30 }, { type:'torch', x:1400, y:30 }, { type:'torch', x:1000, y:410 } ],
  },
  37: {
    name: 'Escalera de la Guardia',
    width: 2400, top: -540, // escalera que baja por un túnel hasta el salón de la guardia
    upSpawnX: 390,          // al bajar desde arriba caes en la repisa
    zone: 13,
    bg: ['#0c0a10', '#18141e'],
    floorColor: '#2a2630', platColor: '#3a3542', edgeColor: '#55505e',
    particleColor: '#ff9a40',
    platforms: [
      // roca (lo que no es pasillo)
      { x: 0, y: -540, w: 100, h: 1080 },
      { x: 100, y: -540, w: 200, h: 80 },
      { x: 100, y: -340, w: 500, h: 880 },
      { x: 480, y: -540, w: 120, h: 80 },
      { x: 600, y: -540, w: 90, h: 78 },
      { x: 600, y: -272, w: 90, h: 812 },
      { x: 690, y: -540, w: 90, h: 146 },
      { x: 690, y: -204, w: 90, h: 744 },
      { x: 780, y: -540, w: 90, h: 214 },
      { x: 780, y: -136, w: 90, h: 676 },
      { x: 870, y: -540, w: 90, h: 282 },
      { x: 870, y: -68, w: 350, h: 608 },
      { x: 960, y: -540, w: 260, h: 242 },
      { x: 1220, y: -540, w: 90, h: 350 },
      { x: 1220, y: 0, w: 90, h: 540 },
      { x: 1310, y: -540, w: 90, h: 418 },
      { x: 1310, y: 68, w: 90, h: 472 },
      { x: 1400, y: -540, w: 90, h: 486 },
      { x: 1400, y: 136, w: 90, h: 404 },
      { x: 1490, y: -540, w: 90, h: 554 },
      { x: 1490, y: 204, w: 310, h: 336 },
      { x: 1580, y: -540, w: 220, h: 514 },
      { x: 1800, y: -540, w: 90, h: 622 },
      { x: 1800, y: 272, w: 90, h: 268 },
      { x: 1890, y: -540, w: 90, h: 690 },
      { x: 1890, y: 340, w: 90, h: 200 },
      { x: 1980, y: -540, w: 90, h: 758 },
      { x: 1980, y: 408, w: 90, h: 132 },
      { x: 2070, y: -540, w: 90, h: 826 },
      { x: 2070, y: 476, w: 90, h: 64 },
      { x: 2160, y: 480, w: 60, h: 60 },
      { x: 2160, y: -540, w: 240, h: 790 },
      { x: 2360, y: 480, w: 40, h: 60 },
      { x: 320, y: -430, w: 80, h: 18 },
      { x: 390, y: -500, w: 70, h: 18 },
    ],

    exits: {
      up: { room: 36, spawnX: 500, spawnY: 400 },
      down: { room: 13, spawnX: 460, spawnY: 40 },
    },
    exitBands: { up: [300, 480], down: [2220, 2360] },
    decorations: [ { type:'bricks' }, { type:'torch', x:200, y:-400 }, { type:'torch', x:1150, y:-120 }, { type:'torch', x:1900, y:330 } ],
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
    { x: 500, y: 456, dir: 1, patrolMin: 340, patrolMax: 740, speed: 1.2 },
    { x: 1450, y: 76, dir: -1, patrolMin: 1360, patrolMax: 1590, speed: 1.1 },
    { x: 1100, y: -284, dir: 1, patrolMin: 880, patrolMax: 1440, speed: 1.2 },
    { x: 1800, y: -444, dir: -1, patrolMin: 880, patrolMax: 2350, speed: 1.2 },
  ],
  1: [
    { x: 2000, y: 456, dir: 1, patrolMin: 1700, patrolMax: 2350, speed: 1.2 },
    { x: 800, y: -84, dir: -1, patrolMin: 620, patrolMax: 1080, speed: 1.1 },
    { x: 300, y: -164, dir: 1, patrolMin: 40, patrolMax: 580, speed: 1.1 },
  ],
  2: [
    { x: 2100, y: 456, dir: 1, patrolMin: 1880, patrolMax: 2350, speed: 1.3 },
    { x: 1600, y: 76, dir: -1, patrolMin: 1510, patrolMax: 1690, speed: 1.1 },
    { x: 1000, y: 76, dir: 1, patrolMin: 920, patrolMax: 1190, speed: 1.1 },
    { x: 600, y: -284, dir: -1, patrolMin: 320, patrolMax: 880, speed: 1.2 },
  ],
  3: [
    { x: 220, y: 346, dir:  1, patrolMin: 200, patrolMax: 355, speed: 1.4 },
    { x: 660, y: 346, dir: -1, patrolMin: 640, patrolMax: 795, speed: 1.4 },
  ],
  4: [], // sala del jefe — sin enemigos normales
  5: [], // armería
  6: [
    { x: 400, y: 400, dir: 1, patrolMin: 40, patrolMax: 740, speed: 1.1 },
    { x: 1100, y: 0, dir: -1, patrolMin: 950, patrolMax: 1880, speed: 1.1 },
    { x: 1400, y: -370, dir: 1, patrolMin: 1020, patrolMax: 1720, speed: 1.0 },
  ],
  7: [],
  8: [
    { x: 2000, y: -354, dir: -1, patrolMin: 1680, patrolMax: 2350, speed: 1.0 },
    { x: 1200, y: -44, dir: 1, patrolMin: 880, patrolMax: 1480, speed: 1.0 },
    { x: 600, y: 456, dir: -1, patrolMin: 450, patrolMax: 840, speed: 1.0 },
  ],
  9: [
    { x: 300, y: -360, dir: 1, patrolMin: 40, patrolMax: 600, speed: 1.0 },
    { x: 1000, y: 40, dir: -1, patrolMin: 700, patrolMax: 1320, speed: 1.0 },
    { x: 1200, y: 400, dir: 1, patrolMin: 400, patrolMax: 2300, speed: 1.1 },
  ],
  10: [
    { x: 300, y: -224, dir: 1, patrolMin: 20, patrolMax: 540, speed: 1.1 },
    { x: 800, y: 176, dir: -1, patrolMin: 740, patrolMax: 990, speed: 1.1 },
    { x: 1900, y: 456, dir: 1, patrolMin: 1420, patrolMax: 2350, speed: 1.2 },
  ],
  11: [
    { x: 600, y: -224, dir: 1, patrolMin: 20, patrolMax: 880, speed: 1.1 },
    { x: 1300, y: -224, dir: -1, patrolMin: 920, patrolMax: 1780, speed: 1.0 },
    { x: 600, y: 456, dir: -1, patrolMin: 480, patrolMax: 780, speed: 1.0 },
  ],
  14: [
    { x: 300, y: 456, dir: 1, patrolMin: 20, patrolMax: 540, speed: 1.2 },
    { x: 900, y: 96, dir: -1, patrolMin: 740, patrolMax: 990, speed: 1.0 },
    { x: 1400, y: 96, dir: 1, patrolMin: 1310, patrolMax: 1540, speed: 1.0 },
    { x: 900, y: -274, dir: -1, patrolMin: 440, patrolMax: 1540, speed: 1.2 },
  ],
  15: [
    { x: 1000, y: 400, dir: 1, patrolMin: 600, patrolMax: 2300, speed: 1.2 },
    { x: 1200, y: 0, dir: -1, patrolMin: 720, patrolMax: 1640, speed: 1.1 },
    { x: 400, y: -260, dir: 1, patrolMin: 40, patrolMax: 840, speed: 1.1 },
  ],
  16: [
    { x: 2000, y: -164, dir: -1, patrolMin: 1780, patrolMax: 2350, speed: 1.2 },
    { x: 1200, y: 156, dir: 1, patrolMin: 700, patrolMax: 1580, speed: 1.1 },
    { x: 350, y: 156, dir: -1, patrolMin: 250, patrolMax: 490, speed: 1.0 },
  ],
  17: [
    { x: 1000, y: -224, dir: 1, patrolMin: 700, patrolMax: 1540, speed: 1.1 },
    { x: 1200, y: 126, dir: -1, patrolMin: 980, patrolMax: 1540, speed: 1.1 },
    { x: 400, y: 456, dir: 1, patrolMin: 40, patrolMax: 780, speed: 1.2 },
    { x: 2000, y: 456, dir: -1, patrolMin: 1820, patrolMax: 2180, speed: 1.0 },
  ],
  18: [
    { x: 2100, y: -204, dir: -1, patrolMin: 1940, patrolMax: 2850, speed: 1.3 },
    { x: 1000, y: 96, dir: 1, patrolMin: 780, patrolMax: 1740, speed: 1.1 },
    { x: 300, y: 456, dir: 1, patrolMin: 20, patrolMax: 580, speed: 1.2 },
    { x: 900, y: -324, dir: -1, patrolMin: 220, patrolMax: 1780, speed: 1.2 },
  ],
  19: [
    { x: 1300, y: 456, dir: 1, patrolMin: 920, patrolMax: 1780, speed: 1.2 },
    { x: 600, y: -24, dir: -1, patrolMin: 480, patrolMax: 880, speed: 1.1 },
    { x: 700, y: -384, dir: 1, patrolMin: 480, patrolMax: 980, speed: 1.1 },
    { x: 1900, y: -24, dir: -1, patrolMin: 1720, patrolMax: 2080, speed: 1.0 },
  ],
  20: [
    { x: 800, y: 456, dir: 1, patrolMin: 560, patrolMax: 1090, speed: 1.2 },
    { x: 900, y: 136, dir: -1, patrolMin: 580, patrolMax: 1090, speed: 1.1 },
    { x: 1200, y: -224, dir: 1, patrolMin: 590, patrolMax: 1570, speed: 1.2 },
    { x: 2000, y: -84, dir: -1, patrolMin: 1780, patrolMax: 2350, speed: 1.2 },
  ],
  21: [
    { x: 300, y: -84, dir: 1, patrolMin: 20, patrolMax: 600, speed: 1.2 },
    { x: 900, y: 176, dir: 1, patrolMin: 820, patrolMax: 1320, speed: 1.1 },
    { x: 900, y: 456, dir: -1, patrolMin: 700, patrolMax: 1320, speed: 1.2 },
    { x: 2200, y: 456, dir: -1, patrolMin: 2050, patrolMax: 2350, speed: 1.2 },
  ],
  22: [
    { x: 800, y: 410, dir: 1, patrolMin: 620, patrolMax: 1040, speed: 1.1 },
    { x: 1300, y: -30, dir: -1, patrolMin: 1080, patrolMax: 1580, speed: 1.1 },
    { x: 1950, y: -400, dir: 1, patrolMin: 1980, patrolMax: 2230, speed: 1.0 },
  ],
  23: [
    { x: 1600, y: 400, dir: 1, patrolMin: 1320, patrolMax: 1930, speed: 1.1 },
    { x: 1100, y: 40, dir: -1, patrolMin: 920, patrolMax: 1450, speed: 1.0 },
    { x: 800, y: -320, dir: 1, patrolMin: 680, patrolMax: 980, speed: 1.0 },
  ],
  24: [
    { x: 900, y: 176, dir: 1, patrolMin: 845, patrolMax: 1090, speed: 1.0 },
    { x: 1600, y: -104, dir: -1, patrolMin: 1545, patrolMax: 1790, speed: 1.0 },
  ],
  25: [
    { x: 1800, y: 456, dir: 1, patrolMin: 1520, patrolMax: 2200, speed: 1.2 },
    { x: 1000, y: 16, dir: -1, patrolMin: 720, patrolMax: 1480, speed: 1.1 },
    { x: 500, y: -354, dir: 1, patrolMin: 320, patrolMax: 860, speed: 1.1 },
    { x: 600, y: 456, dir: 1, patrolMin: 320, patrolMax: 1480, speed: 1.1 },
  ],
  26: [
    { x: 500, y: 456, dir: 1, patrolMin: 20, patrolMax: 800, speed: 1.2 },
    { x: 1600, y: 456, dir: -1, patrolMin: 1080, patrolMax: 2340, speed: 1.2 },
    { x: 1200, y: -24, dir: 1, patrolMin: 480, patrolMax: 1880, speed: 1.1 },
  ],
  27: [
    { x: 700, y: -224, dir: 1, patrolMin: 520, patrolMax: 1120, speed: 1.1 },
    { x: 700, y: 96, dir: -1, patrolMin: 480, patrolMax: 1120, speed: 1.1 },
    { x: 1000, y: 456, dir: 1, patrolMin: 480, patrolMax: 2340, speed: 1.3 },
  ],
  28: [
    { x: 300, y: -224, dir: 1, patrolMin: 20, patrolMax: 540, speed: 1.1 },
    { x: 800, y: 176, dir: 1, patrolMin: 740, patrolMax: 980, speed: 1.1 },
    { x: 1300, y: 176, dir: -1, patrolMin: 1220, patrolMax: 1420, speed: 1.1 },
    { x: 1800, y: -174, dir: -1, patrolMin: 1620, patrolMax: 2230, speed: 1.1 },
  ],
  29: [
    { x: 1300, y: 456, dir: 1, patrolMin: 920, patrolMax: 1680, speed: 1.2 },
    { x: 1300, y: -24, dir: -1, patrolMin: 1080, patrolMax: 1720, speed: 1.1 },
    { x: 800, y: -354, dir: 1, patrolMin: 40, patrolMax: 1720, speed: 1.2 },
  ],
  30: [
    { x: 2000, y: 456, dir: 1, patrolMin: 1680, patrolMax: 2350, speed: 1.2 },
    { x: 1100, y: 56, dir: -1, patrolMin: 680, patrolMax: 1480, speed: 1.2 },
    { x: 900, y: -324, dir: 1, patrolMin: 680, patrolMax: 1280, speed: 1.1 },
  ],
  31: [
    { x: 500, y: 456, dir: 1, patrolMin: 50, patrolMax: 880, speed: 1.1 },
    { x: 1300, y: 16, dir: -1, patrolMin: 1020, patrolMax: 1980, speed: 1.1 },
    { x: 2250, y: -324, dir: 1, patrolMin: 2180, patrolMax: 2380, speed: 1.0 },
  ],
  32: [
    { x: 400, y: 400, dir: 1, patrolMin: 40, patrolMax: 740, speed: 1.1 },
    { x: 1000, y: 40, dir: -1, patrolMin: 900, patrolMax: 1620, speed: 1.1 },
    { x: 1300, y: -310, dir: 1, patrolMin: 1100, patrolMax: 1620, speed: 1.0 },
    { x: 2150, y: -100, dir: 1, patrolMin: 2020, patrolMax: 2280, speed: 1.0 },
  ],
  33: [
    { x: 1000, y: 36, dir: 1, patrolMin: 680, patrolMax: 1820, speed: 1.0 },
    { x: 1400, y: 456, dir: -1, patrolMin: 1220, patrolMax: 1680, speed: 1.0 },
    { x: 2200, y: -224, dir: -1, patrolMin: 2020, patrolMax: 2380, speed: 1.0 },
  ],
  34: [
    { x: 300, y: 456, dir: 1, patrolMin: 20, patrolMax: 440, speed: 1.0 },
    { x: 1200, y: -144, dir: -1, patrolMin: 660, patrolMax: 1520, speed: 1.0 },
    { x: 2000, y: -144, dir: 1, patrolMin: 1720, patrolMax: 2280, speed: 1.0 },
  ],
  35: [
    { x: 1000, y: 456, dir: 1, patrolMin: 820, patrolMax: 1280, speed: 1.0 },
    { x: 2100, y: 36, dir: -1, patrolMin: 1880, patrolMax: 2380, speed: 1.0 },
  ],
  36: [
    { x: 600, y: -264, dir: 1, patrolMin: 480, patrolMax: 880, speed: 1.1 },
    { x: 1000, y: 76, dir: -1, patrolMin: 480, patrolMax: 1520, speed: 1.1 },
    { x: 1000, y: 456, dir: 1, patrolMin: 500, patrolMax: 1680, speed: 1.2 },
  ],
  37: [
    { x: 1100, y: -92, dir: 1, patrolMin: 965, patrolMax: 1210, speed: 1.0 },
    { x: 2100, y: 456, dir: -1, patrolMin: 1980, patrolMax: 2200, speed: 1.0 },
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
const WIDE_ROOMS = [];
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
