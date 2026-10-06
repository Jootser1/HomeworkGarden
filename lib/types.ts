export type ExerciseKind = 'addition_crossing_ten'

export type ExerciseDifficulty = 'easy' | 'medium' | 'hard'

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
