import rigJson from '../../../../../data/cad-specs/03_quantum_hardware_rigs.json';

/**
 * WP-5.4 — single import point for the sealed Quantum Lab cad-spec.
 *
 * The JSON is bundled verbatim from `data/cad-specs/03_quantum_hardware_rigs.json`
 * (SHA-256-sealed by its MANIFEST, checked by tests/master-plan-integrity).
 * `bay1Quantum.ts` derives ALL rig geometry from it via `rigSpec.mjs`.
 */
export const QUANTUM_RIG_SPEC_JSON = rigJson as Record<string, unknown>;
