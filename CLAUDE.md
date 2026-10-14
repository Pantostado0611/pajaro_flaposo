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

## Estructura del proyecto

- `index.html` — Hub principal de minijuegos
- `pajaro-flaposo.html` — Flappy Bird clone
- `mapachon.html` — Plataformas con mapache (solo la página; el código está en `mapachon-juego/`)
- `mapachon-juego/` — el juego del mapache repartido en archivos JS normales (no módulos) que se cargan en orden y comparten variables globales, más `estilo.css`. Un archivo puede usar lo que definen los de antes. Si se agrega un archivo nuevo, va en la lista de `<script>` de `mapachon.html`. `vercel.json` publica esta carpeta: si se renombra, actualizarlo.
