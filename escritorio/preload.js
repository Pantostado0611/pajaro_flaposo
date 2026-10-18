// Lo que el juego puede pedirle al programa de escritorio
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('escritorio', { salir: () => ipcRenderer.send('salir') });
