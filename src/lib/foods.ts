/**
 * Base de ingredientes comunes. Valores nutricionales aproximados por 100 g
 * (BEDCA / USDA, redondeados). density = g/ml, unit = g por pieza.
 * n = [kcal, proteínas, hidratos, grasas, fibra, sal]
 */
export interface Food {
  key: string
  label: string
  aliases: string[]
  density?: number
  unit?: number
  flour?: boolean
  n: [number, number, number, number, number, number]
}

export const FOODS: Food[] = [
  { key: 'harina', label: 'Harina de trigo', aliases: ['harina', 'harina de trigo', 'harina de fuerza', 'harina panificable', 'harina floja', 'harina reposteria', 'harina 00', 'harina tipo 00', 'manitoba', 'flour'], density: 0.53, flour: true, n: [364, 10.3, 76.3, 1, 2.7, 0] },
  { key: 'harina-integral', label: 'Harina integral', aliases: ['harina integral', 'harina de trigo integral', 'whole wheat flour'], density: 0.51, flour: true, n: [340, 13.2, 72, 2.5, 10.7, 0] },
  { key: 'semola', label: 'Sémola de trigo duro', aliases: ['semola', 'semola de trigo', 'semola rimacinata', 'semolina'], density: 0.69, flour: true, n: [360, 12.7, 73, 1.1, 3.9, 0] },
  { key: 'centeno', label: 'Harina de centeno', aliases: ['harina de centeno', 'centeno'], density: 0.43, flour: true, n: [330, 10, 69, 1.8, 15, 0] },
  { key: 'espelta', label: 'Harina de espelta', aliases: ['harina de espelta', 'espelta'], density: 0.5, flour: true, n: [338, 14.6, 70, 2.4, 10.7, 0] },
  { key: 'maicena', label: 'Maicena', aliases: ['maicena', 'almidon de maiz', 'harina de maiz fina', 'cornstarch'], density: 0.54, n: [381, 0.3, 91, 0.1, 0.9, 0] },
  { key: 'agua', label: 'Agua', aliases: ['agua', 'water'], density: 1, n: [0, 0, 0, 0, 0, 0] },
  { key: 'leche', label: 'Leche entera', aliases: ['leche', 'leche entera', 'milk'], density: 1.03, n: [61, 3.2, 4.8, 3.3, 0, 0.1] },
  { key: 'leche-desnatada', label: 'Leche desnatada', aliases: ['leche desnatada', 'leche semidesnatada'], density: 1.03, n: [40, 3.4, 5, 1.2, 0, 0.1] },
  { key: 'leche-condensada', label: 'Leche condensada', aliases: ['leche condensada'], density: 1.3, n: [321, 7.9, 54, 8.7, 0, 0.3] },
  { key: 'nata', label: 'Nata', aliases: ['nata', 'nata para montar', 'nata liquida', 'crema de leche', 'heavy cream'], density: 1, n: [340, 2.1, 2.8, 36, 0, 0.1] },
  { key: 'mantequilla', label: 'Mantequilla', aliases: ['mantequilla', 'manteca', 'butter'], density: 0.96, n: [717, 0.9, 0.1, 81, 0, 0.03] },
  { key: 'aceite-oliva', label: 'Aceite de oliva', aliases: ['aceite de oliva', 'aceite', 'aove', 'olive oil', 'aceite de oliva virgen extra'], density: 0.91, n: [884, 0, 0, 100, 0, 0] },
  { key: 'aceite-girasol', label: 'Aceite de girasol', aliases: ['aceite de girasol', 'aceite vegetal', 'aceite de semillas'], density: 0.92, n: [884, 0, 0, 100, 0, 0] },
  { key: 'azucar', label: 'Azúcar blanco', aliases: ['azucar', 'azucar blanco', 'azucar blanca', 'sugar'], density: 0.85, n: [387, 0, 100, 0, 0, 0] },
  { key: 'azucar-moreno', label: 'Azúcar moreno', aliases: ['azucar moreno', 'azucar morena', 'panela', 'brown sugar'], density: 0.93, n: [380, 0.1, 98, 0, 0, 0] },
  { key: 'azucar-glas', label: 'Azúcar glas', aliases: ['azucar glas', 'azucar glass', 'azucar impalpable', 'azucar en polvo'], density: 0.51, n: [389, 0, 100, 0, 0, 0] },
  { key: 'miel', label: 'Miel', aliases: ['miel', 'honey'], density: 1.42, n: [304, 0.3, 82, 0, 0.2, 0] },
  { key: 'sal', label: 'Sal', aliases: ['sal', 'sal fina', 'sal marina', 'sal en escamas', 'salt'], density: 1.2, n: [0, 0, 0, 0, 0, 100] },
  { key: 'levadura-fresca', label: 'Levadura fresca', aliases: ['levadura fresca', 'levadura de panadero', 'levadura prensada'], density: 1, unit: 25, n: [105, 8.4, 18, 1.9, 8.1, 0] },
  { key: 'levadura-seca', label: 'Levadura seca', aliases: ['levadura seca', 'levadura de panaderia seca', 'levadura instantanea', 'levadura seca de panadero', 'dry yeast', 'instant yeast'], density: 0.6, n: [325, 40, 41, 7.6, 27, 0.1] },
  { key: 'levadura-quimica', label: 'Levadura química', aliases: ['levadura quimica', 'polvo de hornear', 'polvo para hornear', 'royal', 'impulsor', 'baking powder'], density: 0.93, n: [53, 0, 28, 0, 0.2, 26.5] },
  { key: 'bicarbonato', label: 'Bicarbonato', aliases: ['bicarbonato', 'bicarbonato sodico', 'baking soda'], density: 0.97, n: [0, 0, 0, 0, 0, 68] },
  { key: 'masa-madre', label: 'Masa madre (100 %)', aliases: ['masa madre', 'prefermento', 'starter', 'levain', 'sourdough'], density: 1, n: [182, 5.2, 38, 0.5, 1.4, 0] },
  { key: 'malta', label: 'Malta diastásica', aliases: ['malta', 'malta diastasica'], density: 0.6, n: [360, 10, 78, 1.8, 7, 0] },
  { key: 'huevo', label: 'Huevo', aliases: ['huevo', 'huevos', 'huevo l', 'huevo m', 'egg', 'eggs'], density: 1.03, unit: 50, n: [143, 12.6, 0.7, 9.5, 0, 0.36] },
  { key: 'yema', label: 'Yema', aliases: ['yema', 'yemas', 'yema de huevo'], density: 1.03, unit: 18, n: [322, 15.9, 3.6, 26.5, 0, 0.12] },
  { key: 'clara', label: 'Clara', aliases: ['clara', 'claras', 'clara de huevo'], density: 1.03, unit: 32, n: [52, 10.9, 0.7, 0.2, 0, 0.42] },
  { key: 'chocolate', label: 'Chocolate negro', aliases: ['chocolate', 'chocolate negro', 'chocolate fondant', 'chocolate de cobertura', 'pepitas de chocolate'], n: [598, 7.8, 46, 43, 11, 0.05] },
  { key: 'cacao', label: 'Cacao en polvo', aliases: ['cacao', 'cacao en polvo', 'cacao puro'], density: 0.4, n: [228, 19.6, 58, 13.7, 37, 0.05] },
  { key: 'vainilla', label: 'Extracto de vainilla', aliases: ['vainilla', 'extracto de vainilla', 'esencia de vainilla'], density: 0.88, n: [288, 0.1, 12.7, 0.1, 0, 0] },
  { key: 'canela', label: 'Canela', aliases: ['canela', 'canela molida'], density: 0.53, n: [247, 4, 81, 1.2, 53, 0] },
  { key: 'gelatina', label: 'Gelatina', aliases: ['gelatina', 'hojas de gelatina', 'gelatina neutra'], unit: 2, n: [335, 86, 0, 0, 0, 0.5] },
  { key: 'coco', label: 'Coco rallado', aliases: ['coco', 'coco rallado'], density: 0.35, n: [660, 6.9, 24, 64, 16, 0.1] },
  { key: 'almendra', label: 'Almendra', aliases: ['almendra', 'almendras', 'harina de almendra', 'almendra molida'], density: 0.45, n: [579, 21, 22, 50, 12.5, 0] },
  { key: 'nuez', label: 'Nueces', aliases: ['nuez', 'nueces'], density: 0.42, n: [654, 15, 14, 65, 6.7, 0] },
  { key: 'avena', label: 'Copos de avena', aliases: ['avena', 'copos de avena', 'oats'], density: 0.38, n: [389, 16.9, 66, 6.9, 10.6, 0] },
  { key: 'pan-rallado', label: 'Pan rallado', aliases: ['pan rallado', 'panko'], density: 0.45, n: [395, 13, 72, 5.3, 4.5, 1.8] },
  { key: 'yogur', label: 'Yogur natural', aliases: ['yogur', 'yogur natural', 'yogurt', 'yogur griego'], density: 1.03, unit: 125, n: [61, 3.5, 4.7, 3.3, 0, 0.1] },
  { key: 'queso-crema', label: 'Queso crema', aliases: ['queso crema', 'queso philadelphia', 'philadelphia', 'queso de untar', 'cream cheese'], density: 1, n: [342, 6, 4, 34, 0, 0.8] },
  { key: 'mascarpone', label: 'Mascarpone', aliases: ['mascarpone'], density: 1, n: [435, 4.6, 4.8, 44, 0, 0.1] },
  { key: 'ricotta', label: 'Ricotta', aliases: ['ricotta', 'requeson'], density: 1, n: [174, 11, 3, 13, 0, 0.2] },
  { key: 'mozzarella', label: 'Mozzarella', aliases: ['mozzarella', 'mozarella', 'fior di latte', 'bufala', 'mozzarella de bufala'], n: [300, 22.2, 2.2, 22.4, 0, 1.6] },
  { key: 'parmesano', label: 'Parmesano', aliases: ['parmesano', 'parmigiano', 'grana padano', 'queso rallado', 'pecorino'], density: 0.4, n: [392, 35.8, 3.2, 25.8, 0, 4] },
  { key: 'cheddar', label: 'Cheddar', aliases: ['cheddar', 'queso cheddar', 'queso en lonchas', 'queso curado', 'queso manchego', 'manchego'], n: [403, 25, 1.3, 33, 0, 1.6] },
  { key: 'queso-azul', label: 'Queso azul', aliases: ['gorgonzola', 'queso azul', 'roquefort', 'cabrales'], n: [353, 21, 2.3, 29, 0, 3.6] },
  { key: 'queso-cabra', label: 'Queso de cabra', aliases: ['queso de cabra', 'rulo de cabra'], n: [364, 21.6, 0.1, 29.8, 0, 1.2] },
  { key: 'tomate-triturado', label: 'Tomate triturado', aliases: ['tomate triturado', 'tomate frito', 'salsa de tomate', 'passata', 'pelati', 'tomate en lata', 'tomate natural triturado'], density: 1.03, n: [32, 1.6, 7.3, 0.3, 1.9, 0.4] },
  { key: 'tomate', label: 'Tomate', aliases: ['tomate', 'tomates', 'tomate cherry', 'tomates cherry'], unit: 120, n: [18, 0.9, 3.9, 0.2, 1.2, 0.01] },
  { key: 'jamon-serrano', label: 'Jamón serrano', aliases: ['jamon serrano', 'jamon iberico', 'prosciutto', 'jamon curado'], n: [241, 31, 0, 13, 0, 5] },
  { key: 'jamon-york', label: 'Jamón cocido', aliases: ['jamon york', 'jamon cocido', 'jamon dulce', 'jamon'], n: [107, 18, 1.5, 3, 0, 2.3] },
  { key: 'chorizo', label: 'Chorizo / pepperoni', aliases: ['chorizo', 'pepperoni', 'salami', 'salchichon'], n: [455, 24, 1.9, 38, 0, 3] },
  { key: 'bacon', label: 'Bacon / panceta', aliases: ['bacon', 'panceta', 'beicon', 'guanciale', 'tocino'], n: [417, 13, 1.3, 40, 0, 2] },
  { key: 'anchoa', label: 'Anchoas', aliases: ['anchoa', 'anchoas', 'boquerones'], n: [210, 29, 0, 9.7, 0, 9.2] },
  { key: 'pollo', label: 'Pechuga de pollo', aliases: ['pollo', 'pechuga de pollo', 'pechuga', 'muslos de pollo', 'contramuslos'], n: [120, 22.5, 0, 2.6, 0, 0.15] },
  { key: 'carne-picada', label: 'Carne picada', aliases: ['carne picada', 'carne de ternera', 'ternera', 'vacuno', 'hamburguesa', 'carne'], n: [254, 17.2, 0, 20, 0, 0.17] },
  { key: 'cerdo', label: 'Lomo de cerdo', aliases: ['cerdo', 'lomo de cerdo', 'lomo', 'solomillo de cerdo', 'costillas'], n: [143, 21, 0, 6, 0, 0.13] },
  { key: 'salmon', label: 'Salmón', aliases: ['salmon'], n: [208, 20, 0, 13, 0, 0.15] },
  { key: 'atun', label: 'Atún en aceite', aliases: ['atun', 'atun en lata', 'atun en aceite', 'bonito'], n: [198, 29, 0, 8, 0, 0.9] },
  { key: 'gambas', label: 'Gambas', aliases: ['gambas', 'langostinos', 'camarones', 'gamba'], n: [85, 20, 0, 0.5, 0, 0.3] },
  { key: 'arroz', label: 'Arroz', aliases: ['arroz', 'arroz bomba', 'arroz basmati', 'arroz redondo', 'rice'], density: 0.85, n: [360, 6.6, 79, 0.6, 1.3, 0] },
  { key: 'pasta', label: 'Pasta seca', aliases: ['pasta', 'espaguetis', 'spaghetti', 'macarrones', 'tallarines', 'fideos', 'penne', 'lasana'], n: [371, 13, 75, 1.5, 3.2, 0] },
  { key: 'patata', label: 'Patata', aliases: ['patata', 'patatas', 'papa', 'papas'], unit: 170, n: [77, 2, 17, 0.1, 2.2, 0] },
  { key: 'cebolla', label: 'Cebolla', aliases: ['cebolla', 'cebollas', 'cebolleta', 'chalota', 'puerro'], unit: 150, n: [40, 1.1, 9.3, 0.1, 1.7, 0] },
  { key: 'ajo', label: 'Ajo', aliases: ['ajo', 'ajos', 'diente de ajo', 'dientes de ajo'], unit: 5, n: [149, 6.4, 33, 0.5, 2.1, 0] },
  { key: 'pimiento', label: 'Pimiento', aliases: ['pimiento', 'pimientos', 'pimiento rojo', 'pimiento verde'], unit: 150, n: [31, 1, 6, 0.3, 2.1, 0] },
  { key: 'zanahoria', label: 'Zanahoria', aliases: ['zanahoria', 'zanahorias'], unit: 80, n: [41, 0.9, 9.6, 0.2, 2.8, 0.17] },
  { key: 'champinon', label: 'Champiñones', aliases: ['champinon', 'champinones', 'setas', 'hongos', 'boletus'], n: [22, 3.1, 3.3, 0.3, 1, 0] },
  { key: 'espinaca', label: 'Espinacas', aliases: ['espinaca', 'espinacas', 'rucula', 'canonigos'], n: [23, 2.9, 3.6, 0.4, 2.2, 0.2] },
  { key: 'calabacin', label: 'Calabacín', aliases: ['calabacin', 'calabacines', 'berenjena'], unit: 250, n: [17, 1.2, 3.1, 0.3, 1, 0] },
  { key: 'lechuga', label: 'Lechuga', aliases: ['lechuga', 'lechugas'], unit: 300, n: [15, 1.4, 2.9, 0.2, 1.3, 0] },
  { key: 'pepino', label: 'Pepino', aliases: ['pepino', 'pepinos'], unit: 200, n: [15, 0.7, 3.6, 0.1, 0.5, 0] },
  { key: 'aguacate', label: 'Aguacate', aliases: ['aguacate', 'aguacates', 'palta'], unit: 150, n: [160, 2, 8.5, 14.7, 6.7, 0] },
  { key: 'limon', label: 'Limón', aliases: ['limon', 'limones', 'zumo de limon', 'lima', 'ralladura de limon'], density: 1.03, unit: 100, n: [29, 1.1, 9.3, 0.3, 2.8, 0] },
  { key: 'naranja', label: 'Naranja', aliases: ['naranja', 'naranjas', 'zumo de naranja'], density: 1.04, unit: 180, n: [47, 0.9, 12, 0.1, 2.4, 0] },
  { key: 'manzana', label: 'Manzana', aliases: ['manzana', 'manzanas', 'pera', 'peras'], unit: 180, n: [52, 0.3, 14, 0.2, 2.4, 0] },
  { key: 'platano', label: 'Plátano', aliases: ['platano', 'platanos', 'banana', 'bananas'], unit: 120, n: [89, 1.1, 23, 0.3, 2.6, 0] },
  { key: 'fresa', label: 'Fresas / frutos rojos', aliases: ['fresa', 'fresas', 'frambuesas', 'arandanos', 'frutos rojos', 'moras'], n: [32, 0.7, 7.7, 0.3, 2, 0] },
  { key: 'aceituna', label: 'Aceitunas', aliases: ['aceituna', 'aceitunas', 'olivas'], n: [145, 1, 3.8, 15, 3.3, 3.9] },
  { key: 'maiz', label: 'Maíz dulce', aliases: ['maiz', 'maiz dulce', 'elote'], n: [86, 3.3, 19, 1.4, 2, 0] },
  { key: 'garbanzo', label: 'Garbanzos cocidos', aliases: ['garbanzo', 'garbanzos'], n: [164, 8.9, 27, 2.6, 7.6, 0] },
  { key: 'lenteja', label: 'Lentejas cocidas', aliases: ['lenteja', 'lentejas'], n: [116, 9, 20, 0.4, 7.9, 0] },
  { key: 'alubia', label: 'Alubias cocidas', aliases: ['alubias', 'judias', 'frijoles', 'porotos'], n: [132, 8.9, 23.7, 0.5, 8.7, 0] },
  { key: 'tofu', label: 'Tofu', aliases: ['tofu'], n: [76, 8, 1.9, 4.8, 0.3, 0] },
  { key: 'albahaca', label: 'Hierbas frescas', aliases: ['albahaca', 'perejil', 'cilantro', 'hierbabuena', 'menta', 'cebollino', 'eneldo'], n: [23, 3.2, 2.7, 0.6, 1.6, 0] },
  { key: 'oregano', label: 'Hierbas secas', aliases: ['oregano', 'tomillo', 'romero', 'hierbas provenzales', 'laurel'], density: 0.24, n: [265, 9, 69, 4.3, 42.5, 0] },
  { key: 'pimienta', label: 'Pimienta', aliases: ['pimienta', 'pimienta negra', 'comino', 'curry', 'nuez moscada'], density: 0.48, n: [251, 10, 64, 3.3, 25, 0] },
  { key: 'pimenton', label: 'Pimentón', aliases: ['pimenton', 'paprika', 'pimenton de la vera', 'chile en polvo', 'cayena'], density: 0.46, n: [282, 14, 54, 13, 35, 0.2] },
  { key: 'vino', label: 'Vino', aliases: ['vino', 'vino blanco', 'vino tinto', 'jerez', 'brandy', 'ron', 'cointreau'], density: 0.99, n: [82, 0.1, 2.6, 0, 0, 0] },
  { key: 'cerveza', label: 'Cerveza', aliases: ['cerveza', 'beer'], density: 1.01, n: [43, 0.5, 3.6, 0, 0, 0] },
  { key: 'caldo', label: 'Caldo', aliases: ['caldo', 'caldo de pollo', 'caldo de verduras', 'fumet', 'caldo de pescado'], density: 1, n: [7, 1, 0.5, 0.2, 0, 0.8] },
  { key: 'vinagre', label: 'Vinagre', aliases: ['vinagre', 'vinagre de jerez', 'vinagre de manzana', 'vinagre balsamico'], density: 1.01, n: [18, 0, 0.04, 0, 0, 0] },
  { key: 'soja', label: 'Salsa de soja', aliases: ['salsa de soja', 'soja', 'tamari', 'soy sauce'], density: 1.15, n: [53, 8.1, 4.9, 0.6, 0.8, 14.5] },
  { key: 'mostaza', label: 'Mostaza', aliases: ['mostaza', 'mostaza dijon'], density: 1.05, n: [66, 4.4, 5.8, 4, 3.3, 2.8] },
  { key: 'mayonesa', label: 'Mayonesa', aliases: ['mayonesa', 'mahonesa', 'alioli'], density: 0.95, n: [680, 1, 0.6, 75, 0, 1.6] },
  { key: 'ketchup', label: 'Kétchup', aliases: ['ketchup', 'catsup', 'salsa barbacoa'], density: 1.15, n: [101, 1, 27, 0.1, 0.3, 2.3] },
]

export const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9ñ\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const INDEX = FOODS.flatMap((f) => f.aliases.map((a) => ({ alias: normalize(a), food: f }))).sort(
  (a, b) => b.alias.length - a.alias.length,
)

/** Busca el alimento cuyo alias más largo aparece como palabra completa en el nombre. */
export function matchFood(name: string): Food | undefined {
  const n = ` ${normalize(name)} `
  for (const { alias, food } of INDEX) {
    if (n.includes(` ${alias} `)) return food
    // plural sencillo: "fresas" → "fresa", "tomates" → "tomate"
    if (n.includes(` ${alias}s `) || n.includes(` ${alias}es `)) return food
  }
  return undefined
}
