import Dexie, { type EntityTable } from 'dexie'
import type { Challenge, CookLog, Friend, Profile, Recipe } from './types'

/**
 * Almacenamiento local (IndexedDB). Toda lectura/escritura de la app pasa por
 * `repo.ts`; cuando llegue Supabase se sustituye ahí sin tocar las pantallas.
 */
export class CounterChefDB extends Dexie {
  recipes!: EntityTable<Recipe, 'id'>
  logs!: EntityTable<CookLog, 'id'>
  friends!: EntityTable<Friend, 'id'>
  challenges!: EntityTable<Challenge, 'id'>
  profile!: EntityTable<Profile, 'id'>

  constructor() {
    super('counter-chef')
    this.version(1).stores({
      recipes: 'id, title, category, updatedAt, favorite, *tags',
      logs: 'id, recipeId, date, createdAt',
      friends: 'id, name',
      challenges: 'id, recipeId, status, createdAt',
      profile: 'id',
    })
  }
}

export const db = new CounterChefDB()
