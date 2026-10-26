import { additionModule } from './modules/addition'
import { comparisonModule } from './modules/comparison'
import { sequenceModule } from './modules/sequence'
import { subtractionModule } from './modules/subtraction'
import { multiplicationModule } from './modules/multiplication'
import { createExerciseRegistry } from './registry'

/** Composition root: enabling/removing a family changes only its import and entry.
 * Saved exercises remain playable through their presentation/answer snapshots.
 */
export const exerciseRegistry = createExerciseRegistry([additionModule, comparisonModule, sequenceModule, subtractionModule, multiplicationModule])
