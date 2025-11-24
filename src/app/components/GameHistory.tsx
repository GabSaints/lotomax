'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LotteryType, Game } from '@/lib/types'
import { LOTTERY_CONFIGS, formatNumbers } from '@/lib/lottery-config'
import { supabase } from '@/lib/supabase'
import { History, Trash2, Calendar, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface GameHistoryProps {
  lotteryType: LotteryType
  refreshTrigger?: number
}

export default function GameHistory({ lotteryType, refreshTrigger }: GameHistoryProps) {
  const [games, setGames] = useState<Game[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const config = LOTTERY_CONFIGS[lotteryType]

  useEffect(() => {
    loadGames()
  }, [lotteryType, refreshTrigger])

  const loadGames = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('lottery_type', lotteryType)
        .eq('is_saved', true)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      setGames(data || [])
    } catch (error) {
      console.error('Erro ao carregar jogos:', error)
      toast.error('Erro ao carregar histórico')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', id)

      if (error) throw error

      setGames(games.filter(g => g.id !== id))
      toast.success('Jogo removido')
    } catch (error) {
      console.error('Erro ao deletar:', error)
      toast.error('Erro ao remover jogo')
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p>Carregando histórico...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (games.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <History className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium mb-2">Nenhum jogo salvo ainda</p>
            <p className="text-sm">
              Gere e salve jogos para vê-los aqui
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-500" />
            Histórico de Jogos
          </CardTitle>
          <CardDescription>
            {games.length} {games.length === 1 ? 'jogo salvo' : 'jogos salvos'} para {config.name}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {games.map((game) => (
          <Card key={game.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Numbers */}
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {game.numbers.map((num, idx) => (
                      <div
                        key={idx}
                        className={`w-10 h-10 bg-gradient-to-br ${config.color} rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm`}
                      >
                        {num.toString().padStart(2, '0')}
                      </div>
                    ))}
                  </div>

                  {/* Meta Info */}
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(game.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </div>
                    {game.user_notes && (
                      <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        <span className="max-w-[200px] truncate">{game.user_notes}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(formatNumbers(game.numbers))
                      toast.success('Números copiados!')
                    }}
                  >
                    Copiar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(game.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
