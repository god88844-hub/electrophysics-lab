# Phase 63 — Multi-scale 3D engineering representation and safe edits

Provides deterministic hierarchy nodes at assembly, component, and typed-port levels, stable original wire references, focused assembly exploration, and graphical scene data derived directly from the canonical 2D design. Transactional 3D translations create a proposed canonical diagram with snapped positions while preserving original typed electrical and computational connectivity, and do not mutate the source diagram. Cross-boundary wires are never silently deleted from topology metadata.

The 3D coordinates are presentation units, not CAD dimensions or actual physical geometries. This phase implements hierarchical *scene and edit data*, not a finished advanced interactive CAD renderer, mechanical tolerance model, or manufactured-device geometry evidence.

Run `node --test tests/phase63-multiscale-3d.test.mjs`, `node scripts/phase63-run.mjs`, `node scripts/phase63-strict.mjs`, `npm test`.
