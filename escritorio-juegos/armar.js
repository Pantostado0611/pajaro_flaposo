// Arma el programa de Windows de un juego de apps.js:
//   node armar.js <id>        → dist/<id>/<Nombre>-Instalador-<versión>.exe
//   node armar.js <id> --solo-copiar   (solo prepara la carpeta, para `npx electron .`)
// Copia la página del juego a juego/, escribe app.json e icono.png y llama a electron-builder.
const fs = require('fs'), path = require('path');
const { execSync } = require('child_process');
const APPS = require('./apps.js');

const id = process.argv[2], a = APPS[id];
if (!a) { console.log('Uso: node armar.js <' + Object.keys(APPS).join('|') + '>'); process.exit(1); }
const raiz = path.join(__dirname, '..');

fs.rmSync(path.join(__dirname, 'juego'), { recursive: true, force: true });
fs.mkdirSync(path.join(__dirname, 'juego'));
fs.copyFileSync(path.join(raiz, a.pagina), path.join(__dirname, 'juego', a.pagina));
fs.copyFileSync(path.join(__dirname, 'iconos', id + '.png'), path.join(__dirname, 'icono.png'));
fs.writeFileSync(path.join(__dirname, 'app.json'), JSON.stringify(
  { nombre: a.nombre, pagina: a.pagina, ocultar: a.ocultar || '', ancho: a.ancho, alto: a.alto, fondo: a.fondo }, null, 2));
console.log(a.nombre, 'preparado');
if (process.argv.includes('--solo-copiar')) process.exit(0);

const config = {
  appId: a.appId, productName: a.nombre, executableName: a.exe,
  extraMetadata: { name: id, productName: a.nombre, version: a.version, description: a.nombre },
  files: ['main.js', 'app.json', 'icono.png', 'juego/**'],
  directories: { output: 'dist/' + id },
  win: { icon: 'icono.png', target: ['nsis'] },
  nsis: { oneClick: false, allowToChangeInstallationDirectory: true, createDesktopShortcut: true,
    shortcutName: a.nombre, artifactName: `${a.archivo}-\${version}.\${ext}` },
};
fs.writeFileSync(path.join(__dirname, 'builder.json'), JSON.stringify(config, null, 2));
execSync('npx electron-builder --win nsis --config builder.json', { cwd: __dirname, stdio: 'inherit' });
