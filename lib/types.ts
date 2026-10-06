export type ExerciseKind = 'addition_crossing_ten'

export type ExerciseDifficulty = 'easy' | 'medium' | 'hard'

export type TerrainType = 'grass' | 'flower' | 'pond' | 'forest' | 'mushroom' | 'dirt'

export type BiomeId = 'meadow' | 'pond' | 'forest' | 'mushroom_grove' | 'moon_clearing'

export type MovementType = 'walking' | 'hopping' | 'flying' | 'floating' | 'swimming' | 'amphibious'

export type Direction = 'down' | 'up' | 'left' | 'right'

export type Exercise = {
  id: string
  kind: ExerciseKind
  prompt: string
  operands: [number, number]
  expectedAnswer: number
  childAnswer?: number
  attempts: number
  status: 'pending' | 'correct'
  revealedPartId?: string
}

export type CreaturePartKind =
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

export type Creature = {
  id: string
  name: string
  description: string
  personality: string
  biome: BiomeId
  bodyShape: 'round' | 'bean' | 'leaf' | 'mushroom' | 'droplet'
  earShape: 'leaf' | 'round' | 'horns' | 'none'
  tailShape: 'glow' | 'leaf' | 'curl' | 'none'
  pattern: 'spots' | 'moon' | 'stripes' | 'freckles' | 'none'
  palette: CreaturePalette
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
  exercises: Exercise[]
  creature: Creature
  currentExerciseIndex: number
}

export type GardenPlacement = {
  creatureId: string
  x: number
  y: number
  direction: Direction
}

export type GardenState = {
  placements: GardenPlacement[]
}

export type AppState = {
  sessions: HomeworkSession[]
  garden: GardenState
}
