// Arma los archivos para subir Mapachón a itch.io:
//   node itch/armar-itch.js
// Deja en itch/dist/:
//   - Mapachon-Web-X.Y.Z.zip: versión para jugar en el navegador (en itch:
//     "This file will be played in the browser"). index.html + mapachon-juego/,
//     sin lo de la app del celular y con `versionItch` (esconde "Salir").
//   - Mapachon-Windows-X.Y.Z.exe: el portable de escritorio/dist (hay que
//     haber hecho `npm run dist` en escritorio/ con esa versión).
// X.Y.Z es la versión de escritorio/package.json.
const fs = require('fs'), path = require('path');
const { execFileSync } = require('child_process');

const raiz = path.join(__dirname, '..');
const version = require(path.join(raiz, 'escritorio', 'package.json')).version;
const dist = path.join(__dirname, 'dist'), web = path.join(dist, 'web');
fs.rmSync(web, { recursive: true, force: true });
fs.mkdirSync(path.join(web, 'mapachon-juego'), { recursive: true });

// la página: sin manifest ni service worker (son de la app del celular en nuestra web)
let html = fs.readFileSync(path.join(raiz, 'mapachon.html'), 'utf8');
html = html.replace(/^.*rel="(manifest|apple-touch-icon)".*\r?\n/gm, '')
  .replace(/<script>\s*\/\/ se puede instalar como app[\s\S]*?<\/script>\s*/, '')
  .replace('<link rel="stylesheet"', '<script>window.versionItch = true;</script>\n<link rel="stylesheet"');
if (!html.includes('versionItch')) throw new Error('no se pudo marcar la versión de itch');
fs.writeFileSync(path.join(web, 'index.html'), html);

// solo el código y el estilo del juego (ni la carpeta app/ ni otras cosas sueltas)
for (const f of fs.readdirSync(path.join(raiz, 'mapachon-juego'))) {
  if (/\.(js|css)$/.test(f)) fs.copyFileSync(path.join(raiz, 'mapachon-juego', f), path.join(web, 'mapachon-juego', f));
}
const zip = path.join(dist, `Mapachon-Web-${version}.zip`);
fs.rmSync(zip, { force: true });
// el tar de Windows (el de Git no hace .zip)
const tar = path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'tar.exe');
execFileSync(tar, ['-a', '-c', '-f', path.relative(web, zip), 'index.html', 'mapachon-juego'], { cwd: web });
console.log('listo:', path.relative(raiz, zip));

const portable = path.join(raiz, 'escritorio', 'dist', `Mapachon-Portable-${version}.exe`);
if (fs.existsSync(portable)) {
  fs.copyFileSync(portable, path.join(dist, `Mapachon-Windows-${version}.exe`));
  console.log('listo:', path.relative(raiz, path.join(dist, `Mapachon-Windows-${version}.exe`)));
} else console.log('falta el portable', path.relative(raiz, portable), '(npm run dist en escritorio/)');
