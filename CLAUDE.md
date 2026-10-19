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

Cuando el usuario diga **"Deploy App"**, sacar una versión nueva del programa de Windows (`escritorio/`, ver `escritorio/LEEME.md`):

1. Subir `version` en `escritorio/package.json` (1.0.3 → 1.0.4, etc.)
2. `npm run dist` dentro de `escritorio/` (crea el instalador y el portable en `escritorio/dist/`)
3. Probar que el `.exe` abra
4. `gh release create mapachon-vX.Y.Z` con los dos `.exe` y notas en español de lo nuevo desde la versión anterior (sin decir dónde están las salas secretas). El instalador se tiene que llamar `Mapachon-Instalador-X.Y.Z.exe`: así lo encuentra el Actualizador
5. Commit y `git push origin main`, y decirle al usuario la versión y el enlace. No hay que cambiar `index.html`: Mapachón para Windows ya no se descarga de la página, se instala y actualiza con el Actualizador, que detecta la versión nueva solo

## Actualizador

`actualizador/` es un programa de Windows (Electron) que instala, actualiza y abre los juegos que tienen versión de Windows. La lista de juegos está en `actualizador/juegos.js`; las versiones salen de los releases de GitHub (etiqueta `mapachon-v…`, etc.) y la versión instalada, del registro de Windows. La página (`index.html`) tiene su tarjeta con el botón para descargarlo.

Versión nueva del Actualizador: subir `version` en `actualizador/package.json`, `npm run dist` dentro de `actualizador/`, `gh release create actualizador-vX.Y.Z` con `Actualizador-Instalador-X.Y.Z.exe`, y cambiar el enlace de su tarjeta en `index.html`. Los que ya lo tienen ven el aviso para actualizarlo desde el mismo programa.

## Estructura del proyecto

- `index.html` — Hub principal de minijuegos
- `pajaro-flaposo.html` — Flappy Bird clone
- `mapachon.html` — Plataformas con mapache (solo la página; el código está en `mapachon-juego/`)
- `actualizador/` — programa de Windows que instala y actualiza los juegos (ver arriba)
- `mapachon-juego/` — el juego del mapache repartido en archivos JS normales (no módulos) que se cargan en orden y comparten variables globales, más `estilo.css`. Un archivo puede usar lo que definen los de antes. Si se agrega un archivo nuevo, va en la lista de `<script>` de `mapachon.html`. `vercel.json` publica esta carpeta: si se renombra, actualizarlo.
