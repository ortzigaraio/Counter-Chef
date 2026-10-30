# Crítica de diseño · Counter-Chef v0.1

Evaluación de la PWA publicada (390 × 844, tema claro y oscuro) con las heurísticas de Nielsen,
las leyes de UX y el método de impeccable / taste-skill (modo *Operate*: la app es una herramienta).
Severidad 0–4 (4 = impide la tarea).

## Contexto

- **Quién:** una pandilla de amigos que cocina en casa; uso en el móvil, con las manos sucias, unos minutos cada vez.
- **Tareas frecuentes:** encontrar una receta, escalarla, cocinarla, apuntar cómo salió y retar a alguien.
- **Postura:** transitoria (entrar, hacer, salir); el modo cocina es la excepción, que es soberana.

## Prueba de 5 segundos (Inicio)

Lo primero que se ve es un saludo enorme y un bloque naranja a sangre con el «sermón». Hay que bajar para
encontrar qué hacer. El chiste gana a la tarea.

## Hallazgos

| # | Hallazgo | Principio | Sev. | Recomendación |
|---|---|---|---|---|
| 1 | En Inicio, el sermón ocupa el primer pantallazo y las acciones quedan debajo | Jerarquía visual, H8 | 3 | Acciones primero; el sermón pasa a ser una cita breve, más abajo |
| 2 | «Importar» está dos veces (cabecera e Inicio) con dos estilos distintos | H4 Consistencia, Hick | 2 | Una sola entrada global; en Inicio, las acciones que no están en la cabecera |
| 3 | En la ficha de receta hay 6 botones de solo icono (favorita, compartir, editar, duplicar, imprimir, borrar) | Iconos sin texto (IA), H6 | 3 | Tres acciones con texto + «Más» para las raras; «Borrar» queda escondido |
| 4 | Seis colores de acento (naranja, mostaza, albahaca, azul CT, rosa, lila) para categorías y estados | Von Restorff, Similitud | 2 | Un solo acento (óxido); las categorías se distinguen por icono y texto |
| 5 | La paleta naranja + crema satura y compite con las fotos del catálogo | Estética-usabilidad, H8 | 2 | Papel gris neutro y tinta carbón: la comida pone el color |
| 6 | El logo monolínea anterior y la tipografía grotesca no tienen la calidez «de casa de comidas» que pide la marca | Coincidencia con el mundo real, H2 | 2 | Sello hexagonal con estrellas + rótulo script estilo Capoli |
| 7 | El placeholder del buscador del catálogo se corta en móvil («…«masa madre») | H8, legibilidad | 1 | Texto corto: «Receta o ingrediente» |
| 8 | En los errores de importación, el chiste va delante del motivo | H9, tono en momentos críticos | 2 | Primero qué ha pasado y cómo seguir; el vacile, después y en pequeño |
| 9 | Los tickets del riel y las tarjetas del catálogo son dos lenguajes distintos para lo mismo (una receta) | Similitud, H4 | 2 | Una sola tarjeta de receta en toda la app |
| 10 | Modo cocina: contraste alto, objetivos grandes y temporizador claro | — | 0 | Mantener; solo adaptar la paleta |

## Dirección del rediseño

- **Mundo:** rótulo pintado a mano de casa de comidas, papel gris claro, tinta carbón, sello óxido con dos estrellas
  (referencia: Capoli). El terrorista Separatista se queda, ahora como grabado de una sola tinta dentro del sello.
- **Tipografía:** Great Vibes solo para la marca y los grandes titulares de portada; Fraunces para los titulares;
  Onest para la interfaz y las cifras (tabulares).
- **Color:** papel `#ECECE7`, tarjeta `#F7F7F3`, tinta `#2E2C29`, óxido `#B4532A` (texto `#93401D`), oliva `#5B6B4A`
  solo para «bien hecho». Modo oscuro carbón `#1C1B19`.
- **Estructura:** Inicio = acciones → hoy te toca → tu última ronda → rango → sermón. Una tarjeta de receta.
  Acciones con texto. Un solo acento.
