import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const { lotteryType, hotNumbers, coldNumbers, config } = await request.json()

    const prompt = `Você é um especialista em análise estatística de loterias. Analise os seguintes dados da ${config.name}:

NÚMEROS QUENTES (mais frequentes): ${hotNumbers.join(', ')}
NÚMEROS FRIOS (menos frequentes): ${coldNumbers.join(', ')}

Configuração do jogo:
- Total de números: ${config.minNumber} a ${config.maxNumber}
- Números por jogo: ${config.numbersPerGame}

Forneça uma análise concisa (máximo 150 palavras) sobre:
1. Padrões observados nos números quentes e frios
2. Sugestão estratégica de como combinar números quentes e frios
3. Uma recomendação de jogo balanceada

Seja objetivo e prático. Lembre que loteria é aleatória, mas padrões históricos podem guiar escolhas.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Você é um analista estatístico especializado em loterias. Forneça análises objetivas e práticas.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 300
    })

    const analysis = completion.choices[0].message.content

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('Erro na análise:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar análise' },
      { status: 500 }
    )
  }
}
