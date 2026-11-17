# Phase 62 — Prospective quantum hardware validation

Plan covers 4 distinct future device slots, 16 source-locked circuit sessions, and 1,024 requested measurement shots per session. Calibration uses two devices and only the |1> excitation circuit for a conditional amplitude damping parameter; evaluation uses two completely different devices and untouched |+> and Bell circuits. Candidate raw measurement bytes are SHA-256 checked and parsed to confirm consistency with reported counts. Self-generated hashes do not authenticate actual instruments or hardware.

Any supplied data are *untrusted* and never promoted to independently qualified physical results. Synthetic test samples are used strictly for software validation. No real quantum backend, calibration certificate, device identity attestation, measured noise parameters or empirical error coverage is included. Physical qualification remains unknown.

Run `node --test tests/phase62-quantum-hardware.test.mjs`, `node scripts/phase62-run.mjs`, `node scripts/phase62-strict.mjs`, `npm test`.
