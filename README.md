# Counter-Chef

El recetario, la calculadora y el diario de cocina de una pandilla que cocina regular y se vacila por ello.
PWA instalable, offline y sin cuentas: todo vive en tu dispositivo.

![Logo](public/icon-192.png)

## Qué hace

- **Recetas**: crear, editar, duplicar, favoritas, fotos, búsqueda y filtros por categoría.
- **Escalador de dosis**: por raciones, por factor o por el peso de un ingrediente ("tengo 750 g de harina").
  Vista en gramos y en **porcentaje panadero** con hidratación.
- **Masa de pizza y pan**: bolas × peso, hidratación, sal, aceite, azúcar, levadura estimada según horas y
  temperatura, poolish y biga. Se guarda como receta.
- **Convertidor**: tazas y cucharadas a gramos según el ingrediente, moldes, horno (°C/°F/gas) y levaduras.
- **Nutrición** aproximada por ración (base de ~90 ingredientes en español).
- **Modo cocina**: pantalla siempre encendida, paso a paso, temporizadores tipo C4 detectados en el texto,
  lectura en voz alta y lista de ingredientes tachable.
- **Diario / calendario**: cada vez que cocinas, nota, resultado, reseña y foto. Rachas y rangos estilo CS.
- **Importar**: enlaces de webs (schema.org), texto de TikTok/Instagram/Notas, archivos `.json`, el menú
  *Compartir* de Android (Web Share Target) y, opcional, **IA con Claude** usando tu propia clave.
- **Compartir**: enlace autocontenido (la receta va comprimida en la URL), texto para WhatsApp, JSON, PDF.
- **La Pandilla**: retos por enlace con nota a superar, respuesta del rival, marcador y generador de vaciles.

## Desarrollo

```bash
npm install
```

```bash
npm run dev
```

```bash
npm test
```

```bash
npm run build
```

`npm run icons` regenera favicon e iconos PWA desde `src/brand/logo.ts` (usa Playwright).

## Publicar en GitHub Pages

El workflow `.github/workflows/deploy.yml` construye y publica en cada push a `main`.
Una sola vez: en el repositorio, **Settings → Pages → Source: GitHub Actions**.

## IA (opcional)

En **Perfil → Importar con IA** pega una clave de la [consola de Anthropic](https://console.anthropic.com/settings/keys).
Se guarda solo en el dispositivo y las peticiones van directas del navegador a la API (modelo `claude-opus-5-5`,
salida JSON estructurada y `web_fetch` para leer enlaces). Sin clave, el importador gratuito sigue funcionando.

## Estructura

- `src/lib/` lógica pura y probada: parser de ingredientes, unidades, escalado, masa, nutrición, importadores, IA, vaciles, rangos.
- `src/data/` IndexedDB (Dexie) detrás de `repo.ts`, la única puerta a los datos. Ahí se enchufará Supabase en la V2.
- `src/pages/` pantallas. `src/components/` piezas compartidas. `docs/PROMPT.md` el prompt maestro del proyecto.

## Siguiente versión

- Cuentas y amigos reales con Supabase (feed del beef en tiempo real, recetas compartidas sin enlaces).
- App nativa con Capacitor si hace falta estar en las tiendas.
