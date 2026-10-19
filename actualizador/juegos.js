// Juegos que maneja el Actualizador. Para agregar uno: que tenga su versión de
// Windows publicada como release de GitHub con etiqueta "<etiqueta>X.Y.Z" y un
// instalador NSIS llamado como dice `instalador`, y ponerlo aquí.
//   buscar: texto del nombre con el que aparece en "Agregar o quitar programas"
//   exe: el programa que se abre al darle Jugar (dentro de la carpeta instalada)
//   pronto: todavía no tiene versión de Windows (sale en la lista sin botón)
//   herramienta: sale en la sección "Herramientas" y su botón dice ABRIR
//   imagen: fondo grande (en imagenes/); sin imagen, un degradado con `color` y el ícono
module.exports = [
  {
    id: 'mapachon', nombre: 'Mapachón', icono: '🦝',
    desc: 'Explora las ruinas como un mapache aventurero.',
    etiqueta: 'mapachon-v', instalador: v => `Mapachon-Instalador-${v}.exe`,
    buscar: 'Mapach', exe: 'Mapachon.exe', imagen: 'imagenes/mapachon.png', color: '#1a2a5a',
  },
  {
    id: 'pajaro', nombre: 'Pájaro Flaposo', icono: '🐦', desc: 'Vuela entre los tubos sin chocar.', color: '#3a0a0a',
    etiqueta: 'pajaro-v', instalador: v => `PajaroFlaposo-Instalador-${v}.exe`, buscar: 'Flaposo', exe: 'PajaroFlaposo.exe',
  },
  {
    id: 'miniclaude', nombre: 'Mini Claude', icono: '🤖', desc: 'Chat con IA (necesita internet).', color: '#0f1a40', herramienta: true,
    etiqueta: 'miniclaude-v', instalador: v => `MiniClaude-Instalador-${v}.exe`, buscar: 'Mini Claude', exe: 'MiniClaude.exe',
  },
  {
    id: 'mcbuilder', nombre: 'MC Builder', icono: '⛏️', desc: 'Patrones de bloques capa por capa para Minecraft.', color: '#14361a', herramienta: true,
    etiqueta: 'mcbuilder-v', instalador: v => `MCBuilder-Instalador-${v}.exe`, buscar: 'MC Builder', exe: 'MCBuilder.exe',
  },
];
