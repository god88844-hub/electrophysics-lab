import { deriveAll } from './rigSpec.mjs';

/** The derived, JSON-bound geometry of all three Quantum Lab rigs. */
export type QuantumRigGeometry = ReturnType<typeof deriveAll>;
