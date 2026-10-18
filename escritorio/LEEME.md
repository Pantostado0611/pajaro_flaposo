# Mapachón para Windows

El juego (`../mapachon.html` y `../mapachon-juego/`) metido en un programa de
Windows con Electron. No hay que tocar el juego: `npm run dist` lo copia aquí.

- `npm install` (una vez)
- `npm start` — abre el juego en su ventana para probar
- `npm run dist` — crea en `dist/` el instalador (`Mapachon-Instalador-x.y.z.exe`)
  y la versión portable (`Mapachon-Portable-x.y.z.exe`)

F11 o Alt+Enter: pantalla completa. "Salir" en la pantalla de inicio cierra el programa.
Para una versión nueva, sube `version` en `package.json`.

Si `npm run dist` falla con "Cannot create symbolic link" (winCodeSign), descomprime
a mano el `.7z` de `%LOCALAPPDATA%\electron-builder\Cache\winCodeSign` en una
carpeta `winCodeSign-2.6.0` junto a él (los errores de los archivos de Mac no importan).
