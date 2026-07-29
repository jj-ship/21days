export interface Recipe {
  id: number
  day: number
  week: number
  title: string
  breakfast: string
  lunch: string
  dinner: string
  snack: string | null
  image_url: string
  tips: string
}

export interface Checkin {
  id: number
  user_id: string
  day: number
  checked_at: string
  weight: number | null
}

export interface Weight {
  id: number
  user_id: string
  record_date: string
  weight: number
}

export interface UserCycle {
  id: number
  user_id: string
  started_at: string
}

export interface Tip {
  id: number
  title: string
  content: string
  category: string
}