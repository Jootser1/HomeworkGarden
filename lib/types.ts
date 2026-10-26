import type { ExerciseOptions } from '@/lib/exercises/contracts'
import type { CatalogCreatureArt, CatalogDecorArt } from '@/lib/rewards/vector'

/** Persisted identifiers stay readable even after a module is unregistered. */
export type ExerciseKind = string

export type ExerciseDifficulty = 'easy' | 'medium' | 'hard'

export type AdditionGenerationOptions = {
  count: number
  minBase: number
  maxBase: number
  addendMin: number
  addendMax: number
  difficulty: ExerciseDifficulty
}

export type TerrainType = 'grass' | 'flower' | 'pond' | 'forest' | 'mushroom' | 'dirt' | 'stone' | 'glow'

export type BiomeId = 'meadow' | 'pond' | 'forest' | 'mushroom_grove' | 'moon_clearing'

export type MovementType = 'walking' | 'hopping' | 'flying' | 'floating' | 'swimming' | 'amphibious'

export type Direction = 'down' | 'up' | 'left' | 'right'

export type CreatureRarity = 'common' | 'uncommon' | 'rare' | 'wonder'

export type BodyShape = 'round' | 'bean' | 'leaf' | 'mushroom' | 'droplet' | 'star' | 'pebble' | 'long' | 'shell' | 'cloud'
export type EarShape = 'leaf' | 'round' | 'horns' | 'fin' | 'petal' | 'tuft' | 'none'
export type TailShape = 'glow' | 'leaf' | 'curl' | 'fin' | 'star' | 'puff' | 'ribbon' | 'none'
export type PatternShape = 'spots' | 'moon' | 'stripes' | 'freckles' | 'stars' | 'rings' | 'leaf_veins' | 'waves' | 'none'
export type EyeStyle = 'round' | 'sleepy' | 'sparkle' | 'wide' | 'crescent' | 'dot' | 'glow'
export type MouthStyle = 'smile' | 'tiny' | 'cat' | 'beak' | 'none'
export type WingStyle = 'none' | 'small' | 'leaf' | 'butterfly' | 'moth' | 'bubble'
export type AntennaStyle = 'none' | 'dots' | 'leaves' | 'stars' | 'curl'
export type LegStyle = 'none' | 'tiny' | 'webbed' | 'boots' | 'leafy'
export type AuraStyle = 'none' | 'sparkles' | 'moon_glow' | 'mist' | 'bubbles' | 'pollen'

export type Exercise = {
  id: string
  kind: ExerciseKind
  prompt: string
  /** Legacy numerical operands; not required by other exercise families. */
  operands?: [number, number]
  /** Self-contained presentation survives removal of the originating module. */
  instruction?: string
  choices?: number[]
  data?: Record<string, unknown>
  expectedAnswer: number
  childAnswer?: number
  attempts: number
  status: 'pending' | 'correct'
  revealedPartId?: string
}

export type CreaturePartKind =
  | 'catalog_group'
  | 'body'
  | 'eyes'
  | 'mouth'
  | 'ears'
  | 'legs'
  | 'tail'
  | 'wings'
  | 'spots'
  | 'aura'
  | 'belly'
  | 'antennae'
  | 'cheeks'
  | 'sparkles'
  | 'horns'
  | 'crest'
  | 'shadow_glow'

export type CreaturePart = {
  id: string
  kind: CreaturePartKind
  label: string
  revealOrder: number
  revealed: boolean
}

export type CreaturePalette = {
  primary: string
  secondary: string
  accent: string
  dark: string
}

export type CreatureMovement = {
  type: MovementType
  allowedTerrain: TerrainType[]
  preferredBiomes: BiomeId[]
  speed: 'slow' | 'medium'
}

export type CreatureVisuals = {
  eyeStyle: EyeStyle
  mouthStyle: MouthStyle
  wingStyle: WingStyle
  antennaStyle: AntennaStyle
  legStyle: LegStyle
  auraStyle: AuraStyle
  size: 'tiny' | 'small' | 'medium' | 'large'
  tilt: -2 | -1 | 0 | 1 | 2
}

export type Creature = {
  id: string
  catalogId?: string
  catalogArt?: CatalogCreatureArt
  name: string
  description: string
  personality: string
  rarity: CreatureRarity
  biome: BiomeId
  bodyShape: BodyShape
  earShape: EarShape
  tailShape: TailShape
  pattern: PatternShape
  palette: CreaturePalette
  visuals: CreatureVisuals
  movement: CreatureMovement
  parts: CreaturePart[]
  state: 'revealing' | 'complete_static' | 'alive_in_garden'
  createdAt: string
}

export type HomeworkSession = {
  id: string
  createdAt: string
  status: 'draft' | 'active' | 'completed'
  title: string
  exerciseKind: ExerciseKind
  generationOptions?: AdditionGenerationOptions | ExerciseOptions
  solvedAt?: string
  exercises: Exercise[]
  /** Absent for new décor sessions; legacy creature sessions remain unchanged. */
  creature?: Creature
  decor?: GardenDecor
  /** Only new reward sessions participate in the ten-décor cycle. */
  rewardSequence?: number
  currentExerciseIndex: number
}

export type GardenPlacement = {
  creatureId: string
  x: number
  y: number
  direction: Direction
}

export type DecorVariant = 'round' | 'willow' | 'birch' | 'pine' | 'fruit' | 'fan' | 'buttons' | 'bells' | 'stump' | 'cluster' | 'shelf' | 'lantern' | 'moss' | 'pebbles' | 'standing' | 'arch' | 'slate' | 'fern' | 'daisies' | 'poppies' | 'lavender' | 'reeds' | 'lilies' | 'lotus'

export type DecorRecipe = {
  variant: DecorVariant
  palette: 'sage' | 'gold' | 'rose' | 'lilac'
  seed: number
}

export type DecorElementKind = 'pebble' | 'moss' | 'fern' | 'flower' | 'grass'
export type DecorBuildElement = {
  kind: DecorElementKind
  x: number
  y: number
  size: number
  angle: number
  tone: 0 | 1 | 2
}
export type DecorBuildPlan = {
  version: 1
  steps: { elements: DecorBuildElement[] }[]
}

export type GardenDecor = {
  id: string
  recipe: DecorRecipe
  /** Saved construction instructions, not an image or a moving reveal mask. */
  buildPlan?: DecorBuildPlan
  /** Versioned whole-group illustration snapshot for new catalogue gifts. */
  catalogArt?: CatalogDecorArt
  /** One deterministic reveal step per exercise, independent of the AI. */
  stepCount: number
  revealedSteps: number
}

export type DecorPlacement = { decorId: string; x: number; y: number }

export type GardenState = {
  placements: GardenPlacement[]
  decorPlacements?: DecorPlacement[]
}

export type AppState = {
  /** Permanent local composition reservations, including stored/abandoned gifts. */
  rewardHistory?: string[]
  sessions: HomeworkSession[]
  garden: GardenState
}
