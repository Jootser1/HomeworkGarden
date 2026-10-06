import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { creatureFromManifest, fallbackCreatureManifest } from '@/lib/creatures/factory'
import { creatureManifestSchema } from '@/lib/creatures/schema'

export const runtime = 'nodejs'
export const maxDuration = 30

const requestSchema = z.object({
  exerciseCount: z.number().int().min(1).max(40),
  exerciseKind: z.literal('addition_crossing_ten'),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
})

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = requestSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Demande invalide.' }, { status: 400 })
  }

  const { exerciseCount, difficulty } = parsed.data
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    const creature = creatureFromManifest(fallbackCreatureManifest(), exerciseCount)
    return NextResponse.json({ creature, source: 'fallback', warning: 'OPENAI_API_KEY absente : créature locale de secours.' })
  }

  try {
    const modelName = process.env.OPENAI_MODEL || 'gpt-4.1-mini'
    const result = await generateObject({
      model: openai(modelName),
      schema: creatureManifestSchema,
      schemaName: 'homework_garden_creature_manifest',
      schemaDescription: 'Manifest JSON sûr et stylisé pour une créature enfantine procédurale en 2D.',
      system: [
        'Tu conçois des créatures pour une application enfantine appelée Le Jardin des Devoirs.',
        'Les créatures sont mignonnes, variées, parfois malicieuses, parfois bizarres ou un peu sombres, mais jamais effrayantes.',
        'Aucun gore, aucune arme, aucune menace, aucun vocabulaire anxiogène.',
        'Réponds uniquement avec un objet conforme au schéma.',
        'Les couleurs doivent être des hex RGB complets.',
      ].join(' '),
      prompt: `Génère une créature unique pour une session de ${exerciseCount} additions avec passage de dizaine. Difficulté: ${difficulty}. La liste parts doit contenir exactement ${exerciseCount} éléments, avec body et eyes au début, puis des éléments révélables variés. Renseigne aussi rarity et visuals avec des valeurs du schéma. Choisis un biome cohérent, un mouvement compatible, une palette douce et un nom français court en rapport avec son profil.`,
    })

    const creature = creatureFromManifest(result.object, exerciseCount)
    return NextResponse.json({ creature, source: 'openai' })
  } catch (error) {
    console.error('Creature generation failed', error)
    const creature = creatureFromManifest(fallbackCreatureManifest(), exerciseCount)
    return NextResponse.json({ creature, source: 'fallback', warning: 'La génération IA a échoué : créature locale de secours.' })
  }
}
