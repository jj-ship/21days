import { supabase } from '@/client/supabase'
import type { Recipe, Checkin, Weight, UserCycle, Tip } from './types'

// 当前用户 ID：小程序使用匿名登录，这里用固定标识简化（真实场景应使用微信 openid）
export const CURRENT_USER_ID = '00000000-0000-0000-0000-000000000001'

export async function getAllRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from('recipes')
    .select('id, day, week, title, breakfast, lunch, dinner, snack, image_url, tips')
    .order('day', { ascending: true })
  if (error) throw error
  return Array.isArray(data) ? (data as Recipe[]) : []
}

export async function getRecipeByDay(day: number): Promise<Recipe | null> {
  const { data, error } = await supabase
    .from('recipes')
    .select('id, day, week, title, breakfast, lunch, dinner, snack, image_url, tips')
    .eq('day', day)
    .maybeSingle()
  if (error) throw error
  return (data as Recipe) || null
}

export async function getUserCycle(): Promise<UserCycle | null> {
  const { data, error } = await supabase
    .from('user_cycles')
    .select('id, user_id, started_at')
    .eq('user_id', CURRENT_USER_ID)
    .maybeSingle()
  if (error) throw error
  return (data as UserCycle) || null
}

export async function upsertUserCycle(startedAt: string): Promise<void> {
  const { error } = await supabase
    .from('user_cycles')
    .upsert({ user_id: CURRENT_USER_ID, started_at: startedAt }, { onConflict: 'user_id' })
  if (error) throw error
}

export async function getCheckins(): Promise<Checkin[]> {
  const { data, error } = await supabase
    .from('checkins')
    .select('id, user_id, day, checked_at, weight')
    .eq('user_id', CURRENT_USER_ID)
    .order('day', { ascending: true })
  if (error) throw error
  return Array.isArray(data) ? (data as Checkin[]) : []
}

export async function checkin(day: number, weight?: number): Promise<void> {
  const payload: Record<string, unknown> = { user_id: CURRENT_USER_ID, day }
  if (weight !== undefined && weight > 0) {
    payload.weight = weight
  }
  const { error } = await supabase.from('checkins').insert(payload)
  if (error) throw error
}

export async function getWeights(): Promise<Weight[]> {
  const { data, error } = await supabase
    .from('weights')
    .select('id, user_id, record_date, weight')
    .eq('user_id', CURRENT_USER_ID)
    .order('record_date', { ascending: true })
  if (error) throw error
  return Array.isArray(data) ? (data as Weight[]) : []
}

export async function recordWeight(recordDate: string, weight: number): Promise<void> {
  const { error } = await supabase
    .from('weights')
    .upsert({ user_id: CURRENT_USER_ID, record_date: recordDate, weight }, { onConflict: 'user_id,record_date' })
  if (error) throw error
}

export async function getTips(): Promise<Tip[]> {
  const { data, error } = await supabase
    .from('tips')
    .select('id, title, content, category')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return Array.isArray(data) ? (data as Tip[]) : []
}

export async function resetProgress(): Promise<void> {
  const { error: cErr } = await supabase.from('checkins').delete().eq('user_id', CURRENT_USER_ID)
  if (cErr) throw cErr
  const { error: wErr } = await supabase.from('weights').delete().eq('user_id', CURRENT_USER_ID)
  if (wErr) throw wErr
  const { error: uErr } = await supabase.from('user_cycles').delete().eq('user_id', CURRENT_USER_ID)
  if (uErr) throw uErr
}