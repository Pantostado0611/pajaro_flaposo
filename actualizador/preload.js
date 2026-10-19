// Lo único que la ventana puede pedirle al programa
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('actualizador', {
  estado: () => ipcRenderer.invoke('estado'),
  instalar: (id, version) => ipcRenderer.invoke('instalar', id, version),
  jugar: id => ipcRenderer.invoke('jugar', id),
  actualizarme: () => ipcRenderer.invoke('actualizarme'),
  alProgreso: fn => ipcRenderer.on('progreso', (e, d) => fn(d)),
});
