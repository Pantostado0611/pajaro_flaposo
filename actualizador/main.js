// Actualizador: lista los juegos con su botón Instalar / Actualizar / Jugar.
// Las versiones nuevas salen de los releases de GitHub del repo; la versión
// instalada se lee de "Agregar o quitar programas" (registro de Windows).
// Los instaladores corren en silencio (/S), así que no hay que dar clics.
const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path'), fs = require('fs');
const { execFile, spawn } = require('child_process');
const JUEGOS = require('./juegos.js');

const REPO = 'Pantostado0611/pajaro_flaposo';
const ETIQUETA_PROPIA = 'actualizador-v';
let win = null;

// ── Versiones ────────────────────────────────────────────────────────────────
const comparar = (a, b) => {
  const x = a.split('.').map(Number), y = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) - (y[i] || 0);
  return 0;
};

// Releases del repo (la última versión de cada juego sale de su etiqueta)
let releases = null;
async function leerReleases() {
  const r = await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=100`, {
    headers: { 'User-Agent': 'Actualizador', Accept: 'application/vnd.github+json' },
  });
  if (!r.ok) throw new Error('GitHub respondió ' + r.status);
  releases = await r.json();
}
// Todas las versiones publicadas de un juego, de la más nueva a la más vieja
function versiones(etiqueta, archivo) {
  const lista = [];
  for (const rel of releases || []) {
    if (rel.draft || rel.prerelease || !rel.tag_name.startsWith(etiqueta)) continue;
    const v = rel.tag_name.slice(etiqueta.length);
    const asset = rel.assets.find(a => a.name === archivo(v));
    if (asset) lista.push({ version: v, url: asset.browser_download_url, tam: asset.size });
  }
  return lista.sort((a, b) => comparar(b.version, a.version));
}
const ultima = (etiqueta, archivo) => versiones(etiqueta, archivo)[0] || null;

// Programa instalado: busca en el registro su versión y su carpeta
const reg = args => new Promise(res => execFile('reg', ['query', ...args], { windowsHide: true }, (err, out) => res(err ? '' : out)));
async function instalado(buscar) {
  const raices = ['HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
    'HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall'];
  for (const [i, raiz] of raices.entries()) {
    // la búsqueda solo da las claves (y los valores que coinciden); luego se lee cada clave entera
    const claves = (await reg([raiz, '/s', '/f', buscar, '/d'])).split(/\r?\n/).filter(l => l.startsWith('HKEY_'));
    for (const clave of claves) {
      const out = await reg([clave]);
      const val = n => { const m = out.match(new RegExp('^\\s+' + n + '\\s+REG_\\w+\\s+(.*)$', 'm')); return m ? m[1].trim() : null; };
      const nombre = val('DisplayName'), version = val('DisplayVersion');
      if (!nombre || !nombre.includes(buscar) || !version) continue;
      let carpeta = val('InstallLocation');
      if (!carpeta) { const icono = val('DisplayIcon'); if (icono) carpeta = path.dirname(icono.replace(/"/g, '').replace(/,\d+$/, '')); }
      return { version, carpeta, todos: i === 1 }; // todos: instalado para todos los usuarios
    }
  }
  return null;
}

async function estado() {
  let error = null;
  try { await leerReleases(); } catch (e) { error = 'No se pudo revisar si hay versiones nuevas (¿hay internet?).'; }
  const juegos = [];
  for (const j of JUEGOS) {
    const base = { id: j.id, nombre: j.nombre, icono: j.icono, desc: j.desc, imagen: j.imagen, color: j.color };
    if (j.pronto) { juegos.push({ ...base, pronto: true }); continue; }
    const inst = await instalado(j.buscar);
    juegos.push({ ...base, instalada: inst && inst.version,
      versiones: versiones(j.etiqueta, j.instalador).map(v => ({ version: v.version, tam: v.tam })) });
  }
  // ¿hay un Actualizador más nuevo?
  const propia = releases ? ultima(ETIQUETA_PROPIA, v => `Actualizador-Instalador-${v}.exe`) : null;
  const yo = app.getVersion();
  return { juegos, error, yo, nuevoActualizador: propia && comparar(propia.version, yo) > 0 ? propia.version : null };
}

// ── Descargar e instalar ─────────────────────────────────────────────────────
async function descargar(url, destino, progreso) {
  const r = await fetch(url, { headers: { 'User-Agent': 'Actualizador' } });
  if (!r.ok) throw new Error('No se pudo descargar (' + r.status + ')');
  const total = Number(r.headers.get('content-length')) || 0;
  const archivo = fs.createWriteStream(destino);
  const lector = r.body.getReader();
  let llevo = 0;
  for (;;) {
    const { done, value } = await lector.read();
    if (done) break;
    llevo += value.length;
    if (!archivo.write(Buffer.from(value))) await new Promise(res => archivo.once('drain', res));
    if (total) progreso(llevo / total);
  }
  await new Promise((res, rej) => archivo.end(err => (err ? rej(err) : res())));
}

const corriendo = exe => new Promise(res => execFile('tasklist', ['/FI', `IMAGENAME eq ${exe}`, '/NH'], { windowsHide: true },
  (err, out) => res(!err && out.toLowerCase().includes(exe.toLowerCase()))));

function correrInstalador(archivo, args) {
  return new Promise((res, rej) => {
    const p = spawn(archivo, ['/S', ...args], { windowsHide: true });
    p.on('error', rej);
    p.on('exit', code => (code === 0 ? res() : rej(new Error('El instalador terminó con error ' + code))));
  });
}

// Instala la versión elegida (la última si no se dice); reemplaza la que haya
async function instalar(id, version) {
  const j = JUEGOS.find(x => x.id === id);
  if (!releases) await leerReleases();
  const lista = versiones(j.etiqueta, j.instalador);
  const nueva = version ? lista.find(v => v.version === version) : lista[0];
  if (!nueva) throw new Error('No hay versión para descargar.');
  if (await corriendo(j.exe)) throw new Error(`Cierra ${j.nombre} antes de cambiar de versión.`);
  // se actualiza donde ya estaba; uno nuevo va solo para este usuario (no pide permiso de administrador)
  const inst = await instalado(j.buscar);
  const destino = path.join(app.getPath('temp'), j.instalador(nueva.version));
  const avisar = (paso, p) => win && win.webContents.send('progreso', { id, paso, p });
  avisar('Descargando…', 0);
  await descargar(nueva.url, destino, p => avisar('Descargando…', p));
  avisar('Instalando…', 1);
  try { await correrInstalador(destino, [inst && inst.todos ? '/allusers' : '/currentuser']); } finally { fs.rm(destino, { force: true }, () => {}); }
}

async function jugar(id) {
  const j = JUEGOS.find(x => x.id === id);
  const inst = await instalado(j.buscar);
  const exe = inst && inst.carpeta && path.join(inst.carpeta, j.exe);
  if (!exe || !fs.existsSync(exe)) throw new Error(`No encontré ${j.nombre} instalado.`);
  spawn(exe, [], { detached: true, stdio: 'ignore', cwd: inst.carpeta }).unref();
}

// El Actualizador se actualiza a sí mismo: baja su instalador, lo corre y se cierra
async function actualizarme() {
  if (!releases) await leerReleases();
  const propia = ultima(ETIQUETA_PROPIA, v => `Actualizador-Instalador-${v}.exe`);
  const destino = path.join(app.getPath('temp'), `Actualizador-Instalador-${propia.version}.exe`);
  await descargar(propia.url, destino, p => win && win.webContents.send('progreso', { id: 'yo', paso: 'Descargando…', p }));
  spawn(destino, ['/S', '--force-run'], { detached: true, stdio: 'ignore' }).unref();
  app.quit();
}

// las acciones devuelven { error } en vez de fallar, para mostrar el mensaje
const seguro = fn => async (e, ...a) => { try { return { ok: await fn(...a) }; } catch (err) { return { error: err.message }; } };
ipcMain.handle('estado', seguro(estado));
ipcMain.handle('instalar', seguro(instalar));
ipcMain.handle('jugar', seguro(jugar));
ipcMain.handle('actualizarme', seguro(actualizarme));

Menu.setApplicationMenu(null);
app.whenReady().then(() => {
  win = new BrowserWindow({
    width: 1100, height: 660, minWidth: 820, minHeight: 520,
    title: 'Actualizador', backgroundColor: '#05050f',
    icon: path.join(__dirname, 'build', 'icon.png'),
    autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true },
  });
  win.loadFile(path.join(__dirname, 'ui.html'));
  win.on('page-title-updated', e => e.preventDefault());
});
app.on('window-all-closed', () => app.quit());
