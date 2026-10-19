// Juegos que maneja el Actualizador. Para agregar uno: que tenga su versión de
// Windows publicada como release de GitHub con etiqueta "<etiqueta>X.Y.Z" y un
// instalador NSIS llamado como dice `instalador`, y ponerlo aquí.
//   buscar: texto del nombre con el que aparece en "Agregar o quitar programas"
//   exe: el programa que se abre al darle Jugar (dentro de la carpeta instalada)
//   pronto: todavía no tiene versión de Windows (sale en la lista sin botón)
//   imagen: fondo grande (en imagenes/); sin imagen, un degradado con `color` y el ícono
module.exports = [
  {
    id: 'mapachon', nombre: 'Mapachón', icono: '🦝',
    desc: 'Explora las ruinas como un mapache aventurero.',
    etiqueta: 'mapachon-v', instalador: v => `Mapachon-Instalador-${v}.exe`,
    buscar: 'Mapach', exe: 'Mapachon.exe', imagen: 'imagenes/mapachon.png', color: '#1a2a5a',
  },
  { id: 'pajaro', nombre: 'Pájaro Flaposo', icono: '🐦', desc: 'Vuela entre los tubos sin chocar.', color: '#3a0a0a', pronto: true },
];
