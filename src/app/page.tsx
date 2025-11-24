'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LotteryType } from '@/lib/types'
import { LOTTERY_CONFIGS } from '@/lib/lottery-config'
import GameGenerator from './components/GameGenerator'
import GameHistory from './components/GameHistory'
import HotColdAnalysis from './components/HotColdAnalysis'
import { Sparkles, History, TrendingUp } from 'lucide-react'

export default function Home() {
  const [selectedLottery, setSelectedLottery] = useState<LotteryType>('megasena')
  const [refreshHistory, setRefreshHistory] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🎰</div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Loteria Inteligente
              </h1>
              <p className="text-sm text-muted-foreground">
                Geração, análise e simulação de jogos com IA
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Lottery Type Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {(Object.keys(LOTTERY_CONFIGS) as LotteryType[]).map((type) => {
            const config = LOTTERY_CONFIGS[type]
            const isSelected = selectedLottery === type
            
            return (
              <Card
                key={type}
                className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                  isSelected 
                    ? 'ring-2 ring-purple-500 shadow-lg' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedLottery(type)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{config.icon}</span>
                      <CardTitle className="text-xl">{config.name}</CardTitle>
                    </div>
                    {isSelected && (
                      <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse" />
                    )}
                  </div>
                  <CardDescription>
                    {config.numbersPerGame} números de {config.minNumber} a {config.maxNumber}
                  </CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="generator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[600px] mx-auto">
            <TabsTrigger value="generator" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Gerar Jogos</span>
              <span className="sm:hidden">Gerar</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Histórico</span>
              <span className="sm:hidden">Jogos</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Análise</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="space-y-6">
            <GameGenerator 
              lotteryType={selectedLottery}
              onGameSaved={() => setRefreshHistory(prev => prev + 1)}
            />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <GameHistory 
              lotteryType={selectedLottery}
              refreshTrigger={refreshHistory}
            />
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <HotColdAnalysis lotteryType={selectedLottery} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>🎲 Loteria Inteligente - Análise com IA e estatísticas avançadas</p>
          <p className="mt-2 text-xs">
            Jogos gerados aleatoriamente. Jogue com responsabilidade.
          </p>
        </div>
      </footer>
    </div>
  )
}
