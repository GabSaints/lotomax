'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LotteryType } from '@/lib/types'
import { LOTTERY_CONFIGS } from '@/lib/lottery-config'
import { supabase } from '@/lib/supabase'
import { TrendingUp, TrendingDown, Brain, RefreshCw, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

interface HotColdAnalysisProps {
  lotteryType: LotteryType
}

interface NumberFrequency {
  number: number
  frequency: number
}

export default function HotColdAnalysis({ lotteryType }: HotColdAnalysisProps) {
  const [hotNumbers, setHotNumbers] = useState<NumberFrequency[]>([])
  const [coldNumbers, setColdNumbers] = useState<NumberFrequency[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<string>('')
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)

  const config = LOTTERY_CONFIGS[lotteryType]

  useEffect(() => {
    analyzeNumbers()
  }, [lotteryType])

  const analyzeNumbers = async () => {
    setIsAnalyzing(true)
    try {
      // Buscar todos os jogos salvos
      const { data: games, error } = await supabase
        .from('games')
        .select('numbers')
        .eq('lottery_type', lotteryType)
        .eq('is_saved', true)

      if (error) throw error

      if (!games || games.length === 0) {
        setHotNumbers([])
        setColdNumbers([])
        return
      }

      // Contar frequência de cada número
      const frequency: Record<number, number> = {}
      
      games.forEach(game => {
        game.numbers.forEach((num: number) => {
          frequency[num] = (frequency[num] || 0) + 1
        })
      })

      // Converter para array e ordenar
      const frequencyArray = Object.entries(frequency).map(([num, freq]) => ({
        number: parseInt(num),
        frequency: freq
      }))

      frequencyArray.sort((a, b) => b.frequency - a.frequency)

      // Top 10 mais frequentes (quentes)
      setHotNumbers(frequencyArray.slice(0, 10))

      // Top 10 menos frequentes (frios) - números que aparecem menos ou não aparecem
      const allNumbers = Array.from(
        { length: config.maxNumber - config.minNumber + 1 },
        (_, i) => i + config.minNumber
      )

      const coldFrequency = allNumbers.map(num => ({
        number: num,
        frequency: frequency[num] || 0
      }))

      coldFrequency.sort((a, b) => a.frequency - b.frequency)
      setColdNumbers(coldFrequency.slice(0, 10))

    } catch (error) {
      console.error('Erro ao analisar:', error)
      toast.error('Erro ao analisar números')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const generateAIAnalysis = async () => {
    setIsGeneratingAI(true)
    try {
      const response = await fetch('/api/analyze-lottery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lotteryType,
          hotNumbers: hotNumbers.slice(0, 5).map(n => n.number),
          coldNumbers: coldNumbers.slice(0, 5).map(n => n.number),
          config
        })
      })

      if (!response.ok) throw new Error('Erro na API')

      const data = await response.json()
      setAiAnalysis(data.analysis)
      toast.success('Análise gerada com sucesso!')
    } catch (error) {
      console.error('Erro ao gerar análise:', error)
      toast.error('Erro ao gerar análise com IA')
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const renderNumberGrid = (numbers: NumberFrequency[], isHot: boolean) => {
    if (numbers.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p>Salve alguns jogos para ver a análise</p>
        </div>
      )
    }

    const maxFreq = Math.max(...numbers.map(n => n.frequency))

    return (
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {numbers.map((item, idx) => {
          const intensity = (item.frequency / maxFreq) * 100
          const bgColor = isHot 
            ? `rgba(239, 68, 68, ${intensity / 100})` 
            : `rgba(59, 130, 246, ${intensity / 100})`

          return (
            <div
              key={item.number}
              className="relative p-4 rounded-lg border-2 transition-transform hover:scale-105"
              style={{ 
                backgroundColor: bgColor,
                borderColor: isHot ? '#ef4444' : '#3b82f6'
              }}
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {item.number.toString().padStart(2, '0')}
                </div>
                <div className="text-xs text-gray-700 dark:text-gray-300">
                  {item.frequency}x
                </div>
              </div>
              <div className="absolute top-1 right-1 text-xs font-semibold text-gray-600 dark:text-gray-400">
                #{idx + 1}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                Análise Estatística
              </CardTitle>
              <CardDescription>
                Números mais e menos sorteados nos seus jogos salvos
              </CardDescription>
            </div>
            <Button
              onClick={analyzeNumbers}
              disabled={isAnalyzing}
              variant="outline"
              size="sm"
            >
              {isAnalyzing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="hot" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="hot" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Números Quentes
          </TabsTrigger>
          <TabsTrigger value="cold" className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4" />
            Números Frios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hot">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🔥 Top 10 Números Quentes</CardTitle>
              <CardDescription>
                Números que aparecem com mais frequência
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderNumberGrid(hotNumbers, true)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cold">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">❄️ Top 10 Números Frios</CardTitle>
              <CardDescription>
                Números que aparecem com menos frequência
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderNumberGrid(coldNumbers, false)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Analysis Section */}
      <Card className="border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            Análise com IA
          </CardTitle>
          <CardDescription>
            Obtenha insights inteligentes sobre padrões e tendências
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={generateAIAnalysis}
            disabled={isGeneratingAI || hotNumbers.length === 0}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:opacity-90"
          >
            {isGeneratingAI ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Analisando com IA...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Gerar Análise com IA
              </>
            )}
          </Button>

          {aiAnalysis && (
            <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {aiAnalysis}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
