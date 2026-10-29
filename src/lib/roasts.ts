import type { RoastLevel } from '../data/types'

export type RoastContext =
  | 'sermon'
  | 'greeting'
  | 'emptyRecipes'
  | 'emptyDiary'
  | 'emptyCrew'
  | 'scaleUp'
  | 'scaleDown'
  | 'ratingLow'
  | 'ratingMid'
  | 'ratingHigh'
  | 'disaster'
  | 'cookStart'
  | 'cookStep'
  | 'cookDone'
  | 'timerDone'
  | 'importOk'
  | 'importFail'
  | 'saved'
  | 'deleted'
  | 'beef'
  | 'dough'
  | 'nutrition'

type Lines = Record<RoastContext, string[]>

const PICANTE: Lines = {
  sermon: [
    'Hijo mío, la sal no se echa "a ojo" si tu ojo es el mismo que quemó el arroz del martes. Pesa. La báscula no muerde.',
    'Precalentar el horno no es opcional. Meter la masa en un horno frío es como hacer rush B con la pistola de inicio: valiente, inútil y acabas llorando.',
    'Una receta dice "dejar reposar 24 horas" y tú lees "o 20 minutos si tengo hambre". Así te va. La paciencia también es un ingrediente.',
    'Si el humo llega antes que el olor, no estás cocinando: estás plantando la bomba. Baja el fuego y retírate a base.',
    'La harina de fuerza no es para hacer flexiones. Es para el pan. Deja de comprar la que está de oferta y luego quejarte del alveolo.',
    'Probar mientras cocinas no es picar: es control de calidad. Picar es lo que haces tú, que te comes el relleno antes de rellenar.',
    'Un cuchillo sin afilar corta más dedos que tomates. Afila. Tu sangre no es un aliño.',
    'La masa no está "rara", está mal amasada. Diez minutos más. Sin quejarte. El servidor no se cae por amasar.',
    'Si la receta pide mantequilla fría y la sacaste hace dos horas, no tienes hojaldre: tienes una tortita triste con complejo de croissant.',
    'Limpiar mientras cocinas es de cocineros. Dejar la montaña en el fregadero es de campers. Y tú campeas en la cocina como en de_dust2.',
    'Nadie te ha pedido "darle tu toque" a la tarta de queso. Tu toque es exactamente lo que la arruinó la última vez.',
    'Mise en place: todo cortado, pesado y en su sitio antes de encender el fuego. No a mitad de sofrito buscando el ajo como quien busca la C4 en un eco round.',
  ],
  greeting: [
    '¿Qué vas a destrozar hoy?',
    'Vuelve el terror de los fogones.',
    'Bomba plantada en la cocina. Otra vez.',
    'Tu horno ha pedido una orden de alejamiento.',
    'Ronda nueva, mismos errores.',
    'El detector de humo ya está calentando.',
  ],
  emptyRecipes: [
    'Cero recetas. Ni el microondas confía en ti todavía.',
    'Recetario vacío. Como tu nevera, pero con menos excusas.',
    'Aquí no hay nada. Importa una receta antes de que pidas otra pizza congelada.',
  ],
  emptyDiary: [
    'No has cocinado nada. O lo has hecho tan mal que te da vergüenza apuntarlo.',
    'Diario vacío. La cocina sigue limpia, que ya es un récord para ti.',
  ],
  emptyCrew: [
    'Sin pandilla. Normal, nadie quiere cenar en tu casa. Invita a alguien y que sufra contigo.',
    'Cocinar solo está bien. Que nadie vea el desastre está mejor. Pero añade a alguien para vacilarle.',
  ],
  scaleUp: [
    'Multiplicando la receta. Multiplicando también los cacharros que no vas a fregar.',
    'Más cantidad, más gloria… o más tupper para el desastre.',
    'Full buy de ingredientes. Que no sea para tirarlo, ¿eh?',
  ],
  scaleDown: [
    'Media receta: la mitad de riesgo, el mismo drama.',
    'Eco round de ingredientes. Bien visto, por si acaso.',
    'Versión mini. Si sale mal, al menos se tira menos.',
  ],
  ratingLow: [
    'Un {n}. Lo has intentado. Eso dicen también de los que se tiran al mapa sin chaleco.',
    'Un {n}. El gato la ha olido y se ha ido. Mensaje recibido.',
    'Un {n}. No es una receta fallida, es un tutorial de lo que no hay que hacer.',
  ],
  ratingMid: [
    'Un {n}. Comestible. Que es lo máximo que se te puede pedir.',
    'Un {n}. Ni ace ni teamkill. Sobrevives a la ronda.',
    'Un {n}. Tu madre diría "está rico, hijo" mientras busca el kétchup.',
  ],
  ratingHigh: [
    'Un {n}. ¿Seguro que la has hecho tú? Enséñame la foto o no cuenta.',
    'Un {n}. Headshot. Guárdala antes de que se te olvide cómo la hiciste.',
    'Un {n}. Hoy cocinas como si alguien te estuviera mirando. Sigue así.',
  ],
  disaster: [
    'Desastre registrado. Lo apuntamos para la posteridad y para el grupo de WhatsApp.',
    'GG. El soufflé no respawnea. Siguiente ronda.',
    'Has perdido la ronda, pero el detector de humo ha hecho un ace.',
  ],
  cookStart: [
    'Ronda en marcha. Manos limpias, móvil lejos del aceite.',
    'Modo cocina activado. La pantalla no se apaga; tu excusa tampoco.',
    'Empieza la ronda. Nada de improvisar hasta el paso 3.',
  ],
  cookStep: [
    'Sigue el paso. Tal cual. No lo "mejores".',
    'Lee el paso entero antes de hacer nada. Todo. Hasta el final.',
    'Si te saltas este paso, no te quejes luego.',
    'Respira. El fuego no tiene prisa, tú tampoco.',
  ],
  cookDone: [
    'Ronda terminada. Ahora puntúa con honestidad, que te conocemos.',
    'Plato fuera. Foto y nota, que si no, no ha pasado.',
  ],
  timerDone: [
    '¡BOOM! Saca eso del horno YA.',
    'Tiempo. La bomba ha explotado. Corre a la cocina.',
    '¡Temporizador! Si huele a quemado, ya sabes por qué.',
  ],
  importOk: [
    'Receta capturada. Ahora toca hacerla, no solo guardarla como haces con todo.',
    'Importada. Otra receta más para tu colección de "algún día".',
    'Dentro. Revisa las cantidades, que en TikTok todo es "un poquito".',
  ],
  importFail: [
    'No he sacado nada de ahí. Ni receta, ni dignidad.',
    'Esto no es una receta, es un vídeo de alguien bailando con una sartén.',
  ],
  saved: [
    'Guardada. Que conste en acta.',
    'Receta guardada. La pelota ahora está en tu tejado. Y en tu horno.',
    'Guardado. No la pierdas como pierdes los tuppers.',
  ],
  deleted: ['Borrada. Aquí no ha pasado nada.', 'Eliminada. Mejor así, créeme.'],
  beef: [
    'Te reto a hacer esto sin llamar a tu madre a mitad.',
    'Hazla mejor que yo. Spoiler: no puedes.',
    'Yo la clavé. Tú vas a necesitar los bomberos.',
    'Si te sale mejor, te invito a cenar. Tranquilo, no voy a tener que pagar.',
    'Esta receta es para jugadores de verdad, no para silvers del microondas.',
    'Mi nota está ahí arriba. La tuya va a estar en el suelo, como tu masa.',
  ],
  dough: [
    'Pesa la levadura con báscula de precisión. "Una pizca" no es una medida, es un deseo.',
    'Más hidratación, más alveolo… y más masa pegada en tus manos. Tú eliges.',
    'Si la masa no dobla su volumen, no es la levadura: eres tú.',
  ],
  nutrition: [
    'Datos aproximados. Igual de aproximados que tu "una cucharadita" de aceite.',
    'Las calorías no cuentan si cocinas mal y nadie se lo come. Ciencia.',
  ],
}

const SUAVE: Lines = {
  sermon: [
    'Pesar los ingredientes es el truco más sencillo para que la receta salga igual dos veces.',
    'Precalienta siempre el horno: la masa lo nota desde el primer minuto.',
    'El reposo es parte de la receta. Respetar los tiempos marca la diferencia.',
    'Prepara todo antes de encender el fuego: así no se te pasa nada.',
    'Prueba mientras cocinas y ajusta la sal al final.',
    'Un cuchillo afilado es más seguro que uno sin filo.',
  ],
  greeting: ['¿Qué cocinamos hoy?', 'Hora de cocinar.', 'La cocina te espera.'],
  emptyRecipes: ['Aún no tienes recetas. Importa una o crea la primera.'],
  emptyDiary: ['Todavía no has registrado nada. Cuando cocines algo, apúntalo aquí.'],
  emptyCrew: ['Añade a tus amigos para retaros con recetas.'],
  scaleUp: ['Receta ampliada. ¡A por todas!'],
  scaleDown: ['Receta reducida.'],
  ratingLow: ['Un {n}. La próxima saldrá mejor.'],
  ratingMid: ['Un {n}. Nada mal.'],
  ratingHigh: ['Un {n}. ¡Muy bien hecho!'],
  disaster: ['No pasa nada: hasta los mejores tienen días malos.'],
  cookStart: ['Modo cocina activado. La pantalla se queda encendida.'],
  cookStep: ['Lee el paso completo antes de empezar.', 'Tómatelo con calma.'],
  cookDone: ['¡Terminado! Puntúa cómo ha salido.'],
  timerDone: ['¡Tiempo! Revisa la cocina.'],
  importOk: ['Receta importada. Revisa las cantidades antes de guardar.'],
  importFail: ['No he encontrado una receta en ese contenido.'],
  saved: ['Receta guardada.'],
  deleted: ['Eliminada.'],
  beef: ['¿Te atreves a hacerla mejor que yo?', 'Reto lanzado. ¡Suerte!'],
  dough: ['Pesa la levadura con precisión: pequeñas diferencias cambian mucho el resultado.'],
  nutrition: ['Valores aproximados calculados a partir de los ingredientes.'],
}

export function roast(ctx: RoastContext, level: RoastLevel = 'picante', vars: Record<string, string | number> = {}, seed?: number) {
  const list = (level === 'suave' ? SUAVE : PICANTE)[ctx]
  const i = seed == null ? Math.floor(Math.random() * list.length) : Math.abs(seed) % list.length
  return list[i].replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''))
}

/** Semilla estable para "el sermón del día". */
export const daySeed = (d = new Date()) => d.getFullYear() * 1000 + Math.floor((+d - +new Date(d.getFullYear(), 0, 0)) / 864e5)

export function ratingRoast(n: number, level: RoastLevel) {
  return roast(n <= 2 ? 'ratingLow' : n === 3 ? 'ratingMid' : 'ratingHigh', level, { n })
}
