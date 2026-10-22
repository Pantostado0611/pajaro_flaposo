# CLAUDE.md — Minijuegos

## Comando: deploy

Cuando el usuario diga **"deploy"** (o "despliega", "sube los cambios"), hacer lo siguiente:

1. `git add` de todos los archivos modificados/nuevos relevantes
2. Generar un mensaje de commit descriptivo basado en los cambios reales
3. `git commit`
4. `git push origin main`

Vercel está conectado al repo `Pantostado0611/pajaro_flaposo` y redeploya automáticamente con cada push. No se necesita ningún paso adicional.

### Deploy automático de `mapachon.html`

Cada cambio terminado en `mapachon.html` o en `mapachon-juego/` se despliega **automáticamente, sin preguntar ni esperar a que el usuario diga "deploy"**: probar, revisar que el diff solo toca lo pedido, commit y `git push origin main`, y decirle el hash del commit.

En los mensajes de commit no se dice dónde están las salas secretas: el usuario no quiere spoilers.

## Comando: Deploy App

Cuando el usuario diga **"Deploy App"**, sacar una versión nueva del programa de Windows de Mapachón (`escritorio/`, ver `escritorio/LEEME.md`). Si se refiere a otro juego o herramienta (Pájaro Flaposo, Mini Claude, MC Builder), ver `escritorio-juegos/` más abajo; si no queda claro cuál, preguntar:

1. Subir `version` en `escritorio/package.json` (1.0.3 → 1.0.4, etc.)
2. `npm run dist` dentro de `escritorio/` (crea el instalador y el portable en `escritorio/dist/`)
3. Probar que el `.exe` abra
4. `gh release create mapachon-vX.Y.Z` con los dos `.exe` y notas en español de lo nuevo desde la versión anterior (sin decir dónde están las salas secretas). El instalador se tiene que llamar `Mapachon-Instalador-X.Y.Z.exe`: así lo encuentra el Actualizador
5. Commit y `git push origin main`, y decirle al usuario la versión y el enlace. No hay que cambiar `index.html`: Mapachón para Windows ya no se descarga de la página, se instala y actualiza con el Actualizador, que detecta la versión nueva solo

## Actualizador

`actualizador/` es un programa de Windows (Electron) que instala, actualiza y abre los juegos que tienen versión de Windows. La lista de juegos está en `actualizador/juegos.js`; las versiones salen de los releases de GitHub (etiqueta `mapachon-v…`, etc.) y la versión instalada, del registro de Windows. La página (`index.html`) tiene su tarjeta con el botón para descargarlo.

`escritorio-juegos/` arma los demás (Pájaro Flaposo, Mini Claude, MC Builder) como programas de Windows con un solo armador: están en `escritorio-juegos/apps.js`. Versión nueva de uno: subir su `version` en `apps.js`, `node armar.js <id>` dentro de `escritorio-juegos/` (deja el instalador en `dist/<id>/`), probarlo, `gh release create <etiqueta>X.Y.Z` con ese instalador y notas en español, commit y push. El programa sirve la página desde `juego://app/`; las llamadas a `/api/chat` (la IA) las manda a https://burnedgames.vercel.app y sin internet responden "Sin acceso a internet". Juego nuevo: agregarlo en `apps.js` (con su ícono en `iconos/<id>.png`) y en `actualizador/juegos.js` (eso requiere una versión nueva del Actualizador).

Versión nueva del Actualizador: subir `version` en `actualizador/package.json`, `npm run dist` dentro de `actualizador/`, `gh release create actualizador-vX.Y.Z` con `Actualizador-Instalador-X.Y.Z.exe`, y cambiar el enlace de su tarjeta en `index.html`. Los que ya lo tienen ven el aviso para actualizarlo desde el mismo programa.

## Versión para itch.io

`node itch/armar-itch.js` deja en `itch/dist/` lo que se sube a itch.io: `Mapachon-Web-X.Y.Z.zip` (se juega en el navegador; es `mapachon.html` como `index.html` con `window.versionItch = true`, que esconde el botón "Salir" de la pantalla de inicio, sin manifest ni service worker) y `Mapachon-Windows-X.Y.Z.exe` (el portable de `escritorio/dist`). X.Y.Z sale de `escritorio/package.json`, así que conviene hacerlo después de un "Deploy App". El usuario sube los archivos a itch.io él mismo.

## Estructura del proyecto

- `index.html` — Hub principal de minijuegos
- `pajaro-flaposo.html` — Flappy Bird clone
- `mapachon.html` — Plataformas con mapache (solo la página; el código está en `mapachon-juego/`)
- `actualizador/` — programa de Windows que instala y actualiza los juegos (ver arriba)
- `escritorio/` — Mapachón como programa de Windows
- `escritorio-juegos/` — Pájaro Flaposo, Mini Claude y MC Builder como programas de Windows
- `itch/` — armador de los archivos para subir Mapachón a itch.io (ver arriba)
- `mapachon-juego/` — el juego del mapache repartido en archivos JS normales (no módulos) que se cargan en orden y comparten variables globales, más `estilo.css`. Un archivo puede usar lo que definen los de antes. Si se agrega un archivo nuevo, va en la lista de `<script>` de `mapachon.html`. `vercel.json` publica esta carpeta: si se renombra, actualizarlo.
