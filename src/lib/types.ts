export type LotteryType = 'megasena' | 'quina' | 'lotofacil'

export interface LotteryConfig {
  name: string
  minNumber: number
  maxNumber: number
  numbersPerGame: number
  color: string
  icon: string
}

export interface Game {
  id: string
  lottery_type: LotteryType
  numbers: number[]
  created_at: string
  is_saved: boolean
  user_notes?: string
}

export interface GameResult {
  id: string
  lottery_type: LotteryType
  draw_number: number
  numbers: number[]
  draw_date: string
}

export interface HotColdAnalysis {
  lottery_type: LotteryType
  hot_numbers: { number: number; frequency: number }[]
  cold_numbers: { number: number; frequency: number }[]
  last_updated: string
}

export interface AIAnalysis {
  id: string
  lottery_type: LotteryType
  analysis_text: string
  recommended_numbers: number[]
  confidence_score: number
  created_at: string
}
