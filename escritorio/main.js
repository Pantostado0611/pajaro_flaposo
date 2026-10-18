// Mapachón como programa de Windows: una ventana con el juego, sin menús de navegador.
// F11 o Alt+Enter: pantalla completa.
const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');

function crearVentana() {
  const win = new BrowserWindow({
    width: 1280, height: 720, minWidth: 640, minHeight: 360,
    title: 'Mapachón', backgroundColor: '#000000',
    icon: path.join(__dirname, 'build', 'icon.png'),
    autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true },
  });
  win.loadFile(path.join(__dirname, 'juego', 'mapachon.html'));
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F11' || (input.alt && input.key === 'Enter')) { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
  });
  // que el título de la página no cambie el nombre de la ventana
  win.on('page-title-updated', e => e.preventDefault());
}

Menu.setApplicationMenu(null);
ipcMain.on('salir', () => app.quit());
app.whenReady().then(crearVentana);
app.on('window-all-closed', () => app.quit());
