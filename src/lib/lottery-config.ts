import { LotteryConfig, LotteryType } from './types'

export const LOTTERY_CONFIGS: Record<LotteryType, LotteryConfig> = {
  megasena: {
    name: 'Mega Sena',
    minNumber: 1,
    maxNumber: 60,
    numbersPerGame: 6,
    color: 'from-emerald-500 to-green-600',
    icon: '🍀'
  },
  quina: {
    name: 'Quina',
    minNumber: 1,
    maxNumber: 80,
    numbersPerGame: 5,
    color: 'from-purple-500 to-pink-600',
    icon: '⭐'
  },
  lotofacil: {
    name: 'Lotofácil',
    minNumber: 1,
    maxNumber: 25,
    numbersPerGame: 15,
    color: 'from-blue-500 to-cyan-600',
    icon: '🎯'
  }
}

export function generateRandomGame(lotteryType: LotteryType): number[] {
  const config = LOTTERY_CONFIGS[lotteryType]
  const numbers: number[] = []
  
  while (numbers.length < config.numbersPerGame) {
    const randomNum = Math.floor(Math.random() * (config.maxNumber - config.minNumber + 1)) + config.minNumber
    if (!numbers.includes(randomNum)) {
      numbers.push(randomNum)
    }
  }
  
  return numbers.sort((a, b) => a - b)
}

export function formatNumbers(numbers: number[]): string {
  return numbers.map(n => n.toString().padStart(2, '0')).join(' - ')
}
