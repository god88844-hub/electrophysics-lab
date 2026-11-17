# Phase 55 — Independent ALU acquisition provenance screening

Phase54's source-locked prospective design is preserved: 8 planned but unmade dies, 48 planned but unmeasured laboratory sessions, and 1024 blind inputs in each session. The Phase55 intake is a quarantine protocol, not a claim of manufactured silicon.

The workflow validates frozen source identifiers, unique die IDs, source-file digests of original bytes, and cryptographic Ed25519 signatures over die/session statements. Role-separated fabrication and metrology public keys must come from an independent out-of-band trust registry, never from a self-asserted lab return. Even correctly signed records cannot alone prove that the instruments were calibrated or that the claimed silicon came from the qualified fab. External independent review is still mandatory.

The checked-in policy has **0 accepted external attestors, 0 original instrument readings, 0 verified physical dies, and UNKNOWN physical qualification**. Candidate-provided percentages and proof claims cannot become authenticated evidence.

Run: \`node --test tests/phase55-provenance.test.mjs\`, \`node scripts/phase55-run.mjs\`, \`node scripts/phase55-strict.mjs\`, and \`npm test\`.
