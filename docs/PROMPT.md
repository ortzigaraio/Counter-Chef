# Counter-Chef — prompt maestro

> Prompt refinado a partir de la idea original y de las respuestas a las preguntas de alcance.
> Sirve para regenerar, ampliar o pasar el proyecto a otra persona o agente.

---

## Rol

Actúa como director de diseño de producto y desarrollador frontend senior. Construye una PWA
completa, instalable y offline-first, con criterio visual propio (aplica las reglas de
**impeccable** —modo *Operate* para las pantallas de trabajo, *craft floor*, estados completos—
y de **taste-skill** —cero plantilla, dar "cara" al producto, datos reales, una pieza única—).
Termina el trabajo: nada de pantallas vacías ni botones que no hacen nada.

## Producto

**Counter-Chef**: el recetario, la calculadora y el diario de cocina de una pandilla de amigos que
cocinan regular y se vacilan por ello. Para panadería, pizza, repostería y hostelería.

Personalidad: un jefe de cocina gritón que además juega a CS:GO. Chistes y sermones *picantes*
sobre lo mal que cocinas, con jerga de Counter-Strike ("has plantado la bomba en el horno",
"eco round de ingredientes", "GG, el soufflé no respawnea"). Nunca insultos fuertes; hay un
interruptor para bajar el tono a *suave*.

## Decisiones cerradas

| Tema | Decisión |
| --- | --- |
| Plataforma | PWA (React + TypeScript + Vite), instalable en Android/iOS/escritorio |
| Datos | **Local primero** (IndexedDB con Dexie). Capa de datos detrás de un repositorio para enchufar **Supabase** en la V2 (login, amigos y feed real) |
| Importar | Parser gratis (schema.org JSON-LD + heurística de texto) y **IA con Claude** (clave propia del usuario, guardada solo en el dispositivo; `claude-opus-5-5`, salida JSON estructurada y `web_fetch` para leer enlaces) |
| Tono | Picante por defecto, opción suave |
| Publicación | **GitHub Pages** con GitHub Actions; rutas relativas y `HashRouter` |
| App nativa | Fuera de la V1; la PWA ya se instala. Capacitor queda como opción futura |

## Funcionalidades

1. **Recetas**: crear, editar, duplicar, borrar. Campos: título, categoría (panadería, pizza,
   repostería, cocina, hostelería, bebida), raciones, tiempos, ingredientes (cantidad, unidad,
   nombre, nota), pasos, etiquetas, foto, fuente (URL), notas. Búsqueda y filtros.
2. **Escalador de dosis**: por raciones, por factor o por peso objetivo de un ingrediente
   ("tengo 750 g de harina"). Redondeo inteligente por unidad. Vista en **porcentaje panadero**
   (harina = 100 %).
3. **Calculadora de masas / pizza**: nº de bolas × peso, hidratación, sal, aceite, azúcar,
   tipo de levadura (fresca/seca/instantánea/masa madre) con conversión automática, y
   prefermento (poolish/biga) opcional. Resultado listo para guardar como receta.
4. **Convertidor de medidas**: masa, volumen, temperatura (°C/°F/gas), tazas y cucharadas a gramos
   según el ingrediente (tabla de densidades), levaduras, y **moldes** (escalar una receta de un
   molde redondo/rectangular a otro).
5. **Calculadora nutricional**: base de datos local por 100 g de ingredientes comunes en español
   (kcal, proteínas, hidratos, grasas, fibra, sal) con coincidencia por alias; totales y por
   ración; valores marcados como aproximados y editables.
6. **Modo cocina**: pantalla completa paso a paso, letra grande, pantalla siempre encendida
   (Wake Lock), temporizadores detectados en el texto ("hornea 20 min") con estilo de bomba C4,
   lista de ingredientes tachables, lectura en voz alta y frases del chef.
7. **Diario / calendario**: registrar cada vez que cocinas una receta (fecha, puntuación 1–5,
   reseña, foto, "¿cómo salió?"); vista mensual; rachas; historial por receta.
8. **Importar**: pegar enlace o texto; recibir desde el menú *Compartir* de TikTok, Instagram,
   Chrome o Notas (Web Share Target en Android); abrir archivos `.json`; abrir enlaces de receta
   compartidos por amigos. Siempre con vista previa editable antes de guardar.
9. **Exportar y compartir**: enlace autocontenido (la receta comprimida en la URL, sin servidor),
   texto bonito para WhatsApp, archivo `.json`, copia de seguridad completa e impresión.
10. **Perfil**: nombre, avatar, **rango estilo CS** según lo que cocinas y tus notas
    (de "Plata I" a "Élite Global del Fogón"), estadísticas.
11. **La Pandilla (beef)**: amigos locales, **retos** por enlace ("hazla mejor que yo, saqué un 3"),
    respuestas que vuelven por enlace, marcador del pique, generador de vaciles para enviar.

## Identidad visual

- **Logo**: chef de silueta monolínea dentro de un círculo sosteniendo una campana (cloche),
  como la referencia, pero la cara es el terrorista *Phoenix* de CS:GO (pasamontañas blanco con
  dos ojos) y lleva **gorro de chef** en lugar de boina. Minimalista, con colores animados en el
  aro y la campana (respeta `prefers-reduced-motion`).
- **Paleta** (distinta a ReciMe): Tinta `#1A1512`, Crema `#FFF7EA`, Bomba `#FF5A1F`,
  Mostaza `#FFC93C`, Albahaca `#1FA36B`, Azul CT `#3D6BFF` (solo para la Pandilla y el rival).
- **Tipografía** autoalojada: Bricolage Grotesque (titulares) + Onest (interfaz), cifras tabulares.
- **Estilo**: atrevido y animado, pero la interfaz de trabajo se mantiene clara. Un momento de
  movimiento por pantalla, nada de animación decorativa en todo. Sin texto en degradado, sin
  emojis como iconos (Lucide), sin tarjetas de icono-título-texto repetidas.
- Tema claro por defecto (cocina con luz) y oscuro automático.

## Calidad

- Contraste AA, foco visible, navegación por teclado, objetivos táctiles ≥ 44 px.
- Estados: vacío (con chiste y acción), cargando, error con salida, deshabilitado.
- Funciona sin conexión; la IA se desactiva con aviso si no hay red o clave.
- Pruebas unitarias de parseo de ingredientes, conversión, escalado y masa.
