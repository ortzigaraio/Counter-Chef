import { uid } from '../lib/id'
import { parseIngredientLine } from '../lib/parse'
import { saveRecipe } from './repo'
import type { Category } from './types'

const SAMPLES: { title: string; category: Category; servings: number; servingsLabel: string; prepMin?: number; cookMin?: number; ingredients: string[]; steps: string[]; tags: string[]; notes?: string }[] = [
  {
    title: 'Pizza napolitana de 24 horas',
    category: 'pizza',
    servings: 4,
    servingsLabel: 'bolas',
    prepMin: 30,
    cookMin: 2,
    ingredients: ['640 g harina 00', '416 g agua', '18 g sal', '0,6 g levadura fresca', '400 g tomate triturado', '250 g mozzarella', 'Albahaca al gusto', '2 cda aceite de oliva'],
    steps: [
      'Disuelve la levadura en el agua fría.',
      'Añade la harina poco a poco y mezcla. Reposa 20 min.',
      'Añade la sal y amasa 15 min hasta que la masa esté lisa.',
      'Fermenta en bloque 2 h a temperatura ambiente.',
      'Divide en 4 bolas de 270 g y deja fermentar 22 h a 18–20 °C.',
      'Estira sin rodillo, del centro hacia fuera, dejando el borde.',
      'Tomate, mozzarella escurrida y al horno lo más fuerte posible: 90 segundos en horno de pizza o 7 min en piedra a 280 °C.',
    ],
    tags: ['napolitana', 'masa', 'fermentación larga'],
    notes: 'Escurre la mozzarella una hora antes o tendrás sopa de pizza.',
  },
  {
    title: 'Pan de pueblo con masa madre',
    category: 'panaderia',
    servings: 1,
    servingsLabel: 'hogaza',
    prepMin: 40,
    cookMin: 45,
    ingredients: ['450 g harina panificable', '50 g harina integral', '350 g agua', '100 g masa madre', '10 g sal'],
    steps: [
      'Mezcla harinas y 320 g de agua. Autólisis 1 h.',
      'Añade la masa madre, la sal y el resto del agua. Amasa 5 min.',
      'Haz 4 series de pliegues cada 30 min.',
      'Fermenta en bloque hasta que crezca un 50 % (unas 4 h a 24 °C).',
      'Forma la hogaza y deja en banneton 12 h en nevera.',
      'Hornea en olla tapada 20 min a 250 °C y 25 min destapada a 230 °C.',
    ],
    tags: ['masa madre', 'pan'],
  },
  {
    title: 'Bizcocho de yogur de toda la vida',
    category: 'reposteria',
    servings: 8,
    servingsLabel: 'porciones',
    prepMin: 15,
    cookMin: 35,
    ingredients: ['1 yogur natural', '3 huevos', '250 g azúcar', '100 ml aceite de girasol', '220 g harina floja', '1 sobre levadura química', 'Ralladura de limón al gusto'],
    steps: [
      'Precalienta el horno a 180 °C, calor arriba y abajo.',
      'Bate huevos y azúcar hasta que blanqueen.',
      'Añade yogur, aceite y ralladura.',
      'Incorpora harina y levadura tamizadas con movimientos envolventes.',
      'Hornea en molde de 22 cm unos 35 min. No abras el horno los primeros 25 min.',
    ],
    tags: ['clásico', 'merienda'],
  },
  {
    title: 'Tortilla de patatas (con cebolla, sí)',
    category: 'cocina',
    servings: 4,
    servingsLabel: 'raciones',
    prepMin: 15,
    cookMin: 35,
    ingredients: ['800 g patatas', '1 cebolla', '6 huevos', '300 ml aceite de oliva', '1 cdta sal'],
    steps: [
      'Pela y corta las patatas en láminas finas. Pica la cebolla.',
      'Confita patata y cebolla en el aceite a fuego medio 25 min.',
      'Escurre bien y mezcla con los huevos batidos y la sal. Reposa 10 min.',
      'Cuaja en sartén caliente 3 min por lado. Dale la vuelta con decisión.',
    ],
    tags: ['clásico', 'debate eterno'],
  },
]

export async function loadSamples() {
  for (const s of SAMPLES) {
    await saveRecipe({ ...s, ingredients: s.ingredients.map((l) => parseIngredientLine(l, uid())) })
  }
}
