export type Category = 'panaderia' | 'pizza' | 'reposteria' | 'cocina' | 'hosteleria' | 'bebida'

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'panaderia', label: 'Panadería' },
  { id: 'pizza', label: 'Pizza' },
  { id: 'reposteria', label: 'Repostería' },
  { id: 'cocina', label: 'Cocina' },
  { id: 'hosteleria', label: 'Hostelería' },
  { id: 'bebida', label: 'Bebida' },
]

export interface Ingredient {
  id: string
  qty: number | null
  unit: string
  name: string
  note?: string
  /** Ingrediente base para el % panadero (normalmente la harina). */
  isFlour?: boolean
}

export interface Recipe {
  id: string
  title: string
  category: Category
  servings: number
  servingsLabel: string
  prepMin?: number
  cookMin?: number
  ingredients: Ingredient[]
  steps: string[]
  tags: string[]
  notes?: string
  sourceUrl?: string
  photo?: string
  /** Quién la creó, si llegó por enlace de un amigo. */
  author?: string
  favorite?: boolean
  /** Si viene del catálogo: su slug y el crédito de la foto (Wikimedia Commons). */
  catalogSlug?: string
  photoCredit?: string
  createdAt: number
  updatedAt: number
}

export type Outcome = 'clavada' | 'decente' | 'sobrevivible' | 'desastre'

export const OUTCOMES: { id: Outcome; label: string }[] = [
  { id: 'clavada', label: 'Clavada' },
  { id: 'decente', label: 'Decente' },
  { id: 'sobrevivible', label: 'Sobrevivible' },
  { id: 'desastre', label: 'Desastre' },
]

export interface CookLog {
  id: string
  recipeId: string
  recipeTitle: string
  date: string // YYYY-MM-DD
  rating: number // 1..5
  outcome: Outcome
  review: string
  photo?: string
  /** Factor de escala usado ese día. */
  scale?: number
  createdAt: number
}

export interface Friend {
  id: string
  name: string
  hue: number
  createdAt: number
}

export interface Challenge {
  id: string
  recipeId: string
  recipeTitle: string
  /** 'enviado' = lo lanzaste tú; 'recibido' = te lo lanzaron. */
  direction: 'enviado' | 'recibido'
  rival: string
  myRating?: number
  rivalRating?: number
  rivalReview?: string
  trash?: string
  status: 'abierto' | 'cerrado'
  createdAt: number
}

export type RoastLevel = 'suave' | 'picante'

export interface Profile {
  id: 'me'
  name: string
  hue: number
  roastLevel: RoastLevel
  anthropicKey?: string
  theme: 'auto' | 'light' | 'dark'
  createdAt: number
}
