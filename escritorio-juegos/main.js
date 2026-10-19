// Un juego (o herramienta) de la página como programa de Windows. Qué abre lo
// dice app.json, que escribe armar.js al armar cada programa.
// La página se sirve desde juego://app/ (como si fuera una web) para que
// localStorage funcione igual. Las llamadas a /api/chat (la IA) se mandan a
// la página real en internet; sin internet responden "Sin acceso a internet".
// F11 o Alt+Enter: pantalla completa.
const { app, BrowserWindow, Menu, protocol, net, shell } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');
const APP = require('./app.json');
const SERVIDOR = process.env.IA_SERVIDOR || 'https://burnedgames.vercel.app';

protocol.registerSchemesAsPrivileged([{ scheme: 'juego', privileges: { standard: true, secure: true, supportFetchAPI: true } }]);

const sinInternet = () => new Response(JSON.stringify({ error: 'Sin acceso a internet' }),
  { status: 503, headers: { 'Content-Type': 'application/json' } });

async function servir(req) {
  const { pathname } = new URL(req.url);
  if (pathname.startsWith('/api/')) {
    if (!net.isOnline()) return sinInternet();
    try {
      return await net.fetch(SERVIDOR + pathname, { method: req.method, headers: req.headers, body: req.body, duplex: 'half' });
    } catch (e) { return sinInternet(); }
  }
  const archivo = path.join(__dirname, 'juego', decodeURIComponent(pathname));
  if (!archivo.startsWith(path.join(__dirname, 'juego'))) return new Response('', { status: 404 });
  return net.fetch(pathToFileURL(archivo).toString());
}

function crearVentana() {
  const win = new BrowserWindow({
    width: APP.ancho, height: APP.alto, minWidth: 480, minHeight: 400,
    title: APP.nombre, backgroundColor: APP.fondo,
    icon: path.join(__dirname, 'icono.png'),
    autoHideMenuBar: true,
  });
  win.loadURL('juego://app/' + APP.pagina);
  if (APP.ocultar) win.webContents.on('did-finish-load', () => win.webContents.insertCSS(APP.ocultar));
  // no salir de la página: los enlaces de internet se abren en el navegador
  win.webContents.on('will-navigate', (e, url) => {
    if (url.startsWith('juego://app/' + APP.pagina)) return;
    e.preventDefault();
    if (/^https?:\/\//.test(url)) shell.openExternal(url);
  });
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:\/\//.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F11' || (input.alt && input.key === 'Enter')) { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
  });
  win.on('page-title-updated', e => e.preventDefault());
}

Menu.setApplicationMenu(null);
app.whenReady().then(() => { protocol.handle('juego', servir); crearVentana(); });
app.on('window-all-closed', () => app.quit());
