// Copia el juego (mapachon.html y mapachon-juego/) dentro de la app de escritorio
const fs = require('fs'), path = require('path');
const raiz = path.join(__dirname, '..'), destino = path.join(__dirname, 'juego');
fs.rmSync(destino, { recursive: true, force: true });
fs.mkdirSync(destino, { recursive: true });
fs.copyFileSync(path.join(raiz, 'mapachon.html'), path.join(destino, 'mapachon.html'));
fs.cpSync(path.join(raiz, 'mapachon-juego'), path.join(destino, 'mapachon-juego'), { recursive: true });
console.log('juego copiado a', destino);
