# Phase 56 — Physical ALU evidence admission

The admission workflow cross-checks the original Phase27 blind capture schema, Phase54 lab plan and Phase55 independent provenance claims. It enforces matching die/lot/wafer/mask identities, instrument exports, original SHA-256 bytes, acquisition freeze and eight independent human review gates.

**Source digests and signatures alone cannot prove hardware measurements.** No independently obtained die, foundry attestation, qualified lab raw export or timing measurement is present. Even a self-claimed reviewer approval cannot pass the physical admission gate. Until an out-of-band physical source review exists, zero measurement values are admitted and the physically validated success probability remains unknown.

Run `node --test tests/phase56-admission.test.mjs`, `node scripts/phase56-run.mjs`, `node scripts/phase56-strict.mjs`, and `npm test`.
