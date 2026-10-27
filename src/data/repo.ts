import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'
import type { Challenge, CookLog, Friend, Profile, Recipe } from './types'
import { uid } from '../lib/id'

/**
 * Capa de datos. Las pantallas solo hablan con este módulo.
 * V2: implementar las mismas funciones contra Supabase y sincronizar con Dexie.
 */

export { uid }

const DEFAULT_PROFILE: Profile = {
  id: 'me',
  name: '',
  hue: 18,
  roastLevel: 'picante',
  theme: 'auto',
  createdAt: Date.now(),
}

// ---------- Recetas ----------

export function useRecipes() {
  return useLiveQuery(() => db.recipes.orderBy('updatedAt').reverse().toArray(), [])
}

export function useRecipe(id: string | undefined) {
  return useLiveQuery(() => (id ? db.recipes.get(id) : undefined), [id])
}

export async function saveRecipe(r: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'> & Partial<Recipe>) {
  const now = Date.now()
  const recipe: Recipe = {
    ...r,
    id: r.id ?? uid(),
    createdAt: r.createdAt ?? now,
    updatedAt: now,
  } as Recipe
  await db.recipes.put(recipe)
  return recipe
}

export async function deleteRecipe(id: string) {
  await db.transaction('rw', db.recipes, db.logs, async () => {
    await db.recipes.delete(id)
    await db.logs.where('recipeId').equals(id).delete()
  })
}

export async function toggleFavorite(r: Recipe) {
  await db.recipes.update(r.id, { favorite: !r.favorite })
}

// ---------- Diario ----------

export function useLogs() {
  return useLiveQuery(() => db.logs.orderBy('date').reverse().toArray(), [])
}

export function useRecipeLogs(recipeId: string | undefined) {
  return useLiveQuery(
    async () => (recipeId ? (await db.logs.where('recipeId').equals(recipeId).sortBy('date')).reverse() : []),
    [recipeId],
  )
}

export async function saveLog(l: Omit<CookLog, 'id' | 'createdAt'> & Partial<CookLog>) {
  const log: CookLog = { ...l, id: l.id ?? uid(), createdAt: l.createdAt ?? Date.now() } as CookLog
  await db.logs.put(log)
  return log
}

export async function deleteLog(id: string) {
  await db.logs.delete(id)
}

// ---------- Pandilla ----------

export function useFriends() {
  return useLiveQuery(() => db.friends.orderBy('name').toArray(), [])
}

export async function addFriend(name: string) {
  const clean = name.trim()
  const existing = await db.friends.where('name').equalsIgnoreCase(clean).first()
  if (existing) return existing
  const count = await db.friends.count()
  // Tonos separados ≥ 60° para que cada colega se distinga a simple vista.
  const friend: Friend = { id: uid(), name: clean, hue: (200 + count * 67) % 360, createdAt: Date.now() }
  await db.friends.put(friend)
  return friend
}

export async function deleteFriend(id: string) {
  await db.friends.delete(id)
}

export function useChallenges() {
  return useLiveQuery(() => db.challenges.orderBy('createdAt').reverse().toArray(), [])
}

export async function saveChallenge(c: Omit<Challenge, 'id' | 'createdAt'> & Partial<Challenge>) {
  const ch: Challenge = { ...c, id: c.id ?? uid(), createdAt: c.createdAt ?? Date.now() } as Challenge
  await db.challenges.put(ch)
  return ch
}

export async function getChallenge(id: string) {
  return db.challenges.get(id)
}

export async function deleteChallenge(id: string) {
  await db.challenges.delete(id)
}

// ---------- Perfil ----------

export function useProfile(): Profile | undefined {
  return useLiveQuery(async () => (await db.profile.get('me')) ?? DEFAULT_PROFILE, [])
}

export async function getProfile(): Promise<Profile> {
  return (await db.profile.get('me')) ?? DEFAULT_PROFILE
}

export async function updateProfile(patch: Partial<Profile>) {
  const current = await getProfile()
  await db.profile.put({ ...current, ...patch, id: 'me' })
}

// ---------- Copia de seguridad ----------

export interface Backup {
  app: 'counter-chef'
  version: 1
  exportedAt: string
  recipes: Recipe[]
  logs: CookLog[]
  friends: Friend[]
  challenges: Challenge[]
}

export async function exportAll(): Promise<Backup> {
  const [recipes, logs, friends, challenges] = await Promise.all([
    db.recipes.toArray(),
    db.logs.toArray(),
    db.friends.toArray(),
    db.challenges.toArray(),
  ])
  return { app: 'counter-chef', version: 1, exportedAt: new Date().toISOString(), recipes, logs, friends, challenges }
}

export async function importBackup(b: Backup) {
  await db.transaction('rw', [db.recipes, db.logs, db.friends, db.challenges], async () => {
    await db.recipes.bulkPut(b.recipes ?? [])
    await db.logs.bulkPut(b.logs ?? [])
    await db.friends.bulkPut(b.friends ?? [])
    await db.challenges.bulkPut(b.challenges ?? [])
  })
  return { recipes: b.recipes?.length ?? 0, logs: b.logs?.length ?? 0 }
}
