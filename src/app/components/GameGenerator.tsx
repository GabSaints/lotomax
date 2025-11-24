'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { LotteryType } from '@/lib/types'
import { LOTTERY_CONFIGS, generateRandomGame, formatNumbers } from '@/lib/lottery-config'
import { supabase } from '@/lib/supabase'
import { Sparkles, Save, RefreshCw, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

interface GameGeneratorProps {
  lotteryType: LotteryType
  onGameSaved?: () => void
}

export default function GameGenerator({ lotteryType, onGameSaved }: GameGeneratorProps) {
  const [currentGame, setCurrentGame] = useState<number[]>([])
  const [notes, setNotes] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  const config = LOTTERY_CONFIGS[lotteryType]

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      const newGame = generateRandomGame(lotteryType)
      setCurrentGame(newGame)
      setIsGenerating(false)
      toast.success('Jogo gerado com sucesso!')
    }, 500)
  }

  const handleSave = async () => {
    if (currentGame.length === 0) {
      toast.error('Gere um jogo primeiro!')
      return
    }

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('games')
        .insert({
          lottery_type: lotteryType,
          numbers: currentGame,
          is_saved: true,
          user_notes: notes || null
        })

      if (error) throw error

      toast.success('Jogo salvo com sucesso!')
      setNotes('')
      onGameSaved?.()
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar jogo')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCopy = () => {
    if (currentGame.length === 0) return
    
    navigator.clipboard.writeText(formatNumbers(currentGame))
    setCopied(true)
    toast.success('Números copiados!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Generator Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Gerador de Jogos
          </CardTitle>
          <CardDescription>
            Gere números aleatórios para {config.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Display Numbers */}
          {currentGame.length > 0 ? (
            <div className="space-y-4">
              <div className={`bg-gradient-to-r ${config.color} p-6 rounded-xl shadow-lg`}>
                <div className="flex flex-wrap gap-2 justify-center">
                  {currentGame.map((num, idx) => (
                    <div
                      key={idx}
                      className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full flex items-center justify-center text-lg sm:text-xl font-bold text-gray-800 shadow-md animate-in fade-in zoom-in duration-300"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      {num.toString().padStart(2, '0')}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className="flex-1"
                  size="sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>Clique em "Gerar Jogo" para começar</p>
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`w-full bg-gradient-to-r ${config.color} hover:opacity-90 text-white font-semibold py-6 text-lg`}
            size="lg"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Gerar Jogo
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Save Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="w-5 h-5 text-blue-500" />
            Salvar Jogo
          </CardTitle>
          <CardDescription>
            Adicione notas e salve seu jogo no histórico
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Ex: Jogo baseado em datas especiais, números da sorte..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving || currentGame.length === 0}
            className="w-full"
            variant="default"
            size="lg"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar no Histórico
              </>
            )}
          </Button>

          {currentGame.length === 0 && (
            <p className="text-sm text-muted-foreground text-center">
              Gere um jogo primeiro para poder salvar
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
