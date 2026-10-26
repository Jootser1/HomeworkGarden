import { openai } from '@ai-sdk/openai'
import { generateText, Output } from 'ai'
import { NextResponse } from 'next/server'
import { decorRecipeSchema } from '@/lib/garden/decor'

export const runtime = 'nodejs'
export const maxDuration = 15
let windowStart = 0
let requests = 0
let busy = false

export async function POST(req: Request) {
  // No public paid endpoint until real parent authentication and distributed quotas exist.
  if (process.env.NODE_ENV !== 'development' || process.env.GARDEN_DECOR_AI_ENABLED !== 'true' || !process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'Utilise le catalogue local.' }, { status: 403 })
  }
  const origin = req.headers.get('origin')
  if (!origin || origin !== new URL(req.url).origin) return NextResponse.json({ error: 'Origine invalide.' }, { status: 403 })
  if (Number(req.headers.get('content-length') ?? 0) > 256) return NextResponse.json({ error: 'Demande trop grande.' }, { status: 413 })
  const body = await req.text()
  if (body.length > 256 || body.trim() !== '{}') return NextResponse.json({ error: 'Demande invalide.' }, { status: 400 })
  const now = Date.now()
  if (now - windowStart > 60000) { windowStart = now; requests = 0 }
  if (busy || requests >= 6) return NextResponse.json({ error: 'Réessaie plus tard.' }, { status: 429 })
  requests++
  busy = true
  try {
    const result = await generateText({
      model: openai(process.env.OPENAI_MODEL || 'gpt-4.1-mini'),
      output: Output.object({ schema: decorRecipeSchema }),
      system: 'Compose une recette de décor pour un jardin enfantin doux et arrondi. Choisis uniquement les valeurs du schéma. Varie les familles, les palettes et le seed. Aucun texte libre, aucune image, aucun code.',
      prompt: 'Propose un décor naturel varié, de style petit diorama illustré.',
      maxOutputTokens: 180,
      maxRetries: 0,
      abortSignal: AbortSignal.timeout(9000),
    })
    return NextResponse.json({ recipe: decorRecipeSchema.parse(result.output) })
  } catch {
    return NextResponse.json({ error: 'Le catalogue local prend le relais.' }, { status: 503 })
  } finally { busy = false }
}
