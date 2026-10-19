// Juegos y herramientas de la página que se arman como programa de Windows
// (Mapachón tiene su propia carpeta, escritorio/). Para sacar una versión
// nueva de uno: subir aquí su `version` y correr `node armar.js <id>`.
//   pagina: el .html de la raíz del proyecto que abre
//   etiqueta: prefijo del release de GitHub (debe coincidir con actualizador/juegos.js)
//   archivo: nombre del instalador (el Actualizador lo busca con este nombre)
//   ocultar: CSS de cosas de la página que no sirven en el programa
//   ancho/alto: tamaño de la ventana al abrir
module.exports = {
  pajaro: {
    nombre: 'Pájaro Flaposo', exe: 'PajaroFlaposo', appId: 'com.burnedgames.pajaroflaposo', version: '1.0.0',
    pagina: 'pajaro-flaposo.html', etiqueta: 'pajaro-v', archivo: 'PajaroFlaposo-Instalador',
    ancho: 900, alto: 820, fondo: '#000000',
  },
  miniclaude: {
    nombre: 'Mini Claude', exe: 'MiniClaude', appId: 'com.burnedgames.miniclaude', version: '1.0.0',
    pagina: 'claude-chat.html', etiqueta: 'miniclaude-v', archivo: 'MiniClaude-Instalador',
    ocultar: '.back-btn { display: none !important; }', ancho: 1000, alto: 760, fondo: '#0a0a14',
  },
  mcbuilder: {
    nombre: 'MC Builder', exe: 'MCBuilder', appId: 'com.burnedgames.mcbuilder', version: '1.0.0',
    pagina: 'minecraft-builder.html', etiqueta: 'mcbuilder-v', archivo: 'MCBuilder-Instalador',
    ancho: 1280, alto: 820, fondo: '#0a140a',
  },
};
