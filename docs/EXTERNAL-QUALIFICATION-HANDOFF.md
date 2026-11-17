# External laboratory and independent reviewer handoff

This post-integration request kit collects the existing **Phase42 fan physical-capture protocol**, **Phase52 twelve missing physical gates**, **Phase54 source-locked original ALU acquisition plan**, **Phase55 independent fabrication/metrology provenance policy** and **Phase57 frozen release NO-GO policy**, without inventing experimental results or generating trusted reviewer attestations.

Generate the request with:

```bash
node scripts/external-qualification-run.mjs
node scripts/external-qualification-strict.mjs
```

The output files are `benchmarks/evidence/external-qualification/qualification-request.json` and `lab-and-reviewer-request.md`. Each machine-readable source hash is the SHA-256 of the **original committed input bytes**, and `sourceCommit` records the exact checkout. GitHub Actions uploads both as a ready-to-send prospective lab/reviewer request artifact.

## What qualified external participants must do

1. **Before a fan experiment:** independently review mechanical containment, rated impeller speed, power/current faults and temperature safety. Freeze a *purchased, source-matched* specimen bill of materials, calibrations and permitted operating envelope. Do not energize an unqualified exposed rotating part.
2. **For physical fan evidence:** supply original synchronized instrument exports with pack/motor voltage, current, calibrated RPM and temperatures, instrument calibration/custody evidence, preregistered uncertainty, and lot-separated blind holdouts. No synthetic test values qualify.
3. **For SKY130 ALU evidence:** obtain independently authorized fabricated dies and original metrology exports using the frozen RTL/vector fingerprints. Preserve output-blind measurements and independent fabrication/metrology attestor identities; verify trust anchors out of band. The planned 8 dies, 48 sessions and 49,152 readings have **not happened**.
4. **For scientific and security signoff:** engage separate human reviewers to inspect the code, physical-model applicability, third-party licenses, security posture and assumptions, provide written signed conclusions and document exceptions. The same developer's automated CI is not independent review.
5. **For software product acceptance:** conduct representative user studies and independently reviewed installation/accessibility/security checks. The existing GitHub-hosted Ubuntu/macOS/Windows smoke tests are a different, narrower evidence class.

Never upload raw private source files, specimen serials, personal identifiers, proprietary reports or reviewer private keys to a public GitHub repository. Use a secured authorized delivery channel. A hash alone cannot establish physical provenance or authenticity.

## Conditions not yet satisfied

**Physical fan qualification: NO-GO.** **Original ALU prototype qualification: NO-GO/UNKNOWN.** **Independent security and scientific review: NOT PERFORMED.** **Signed production software release: NOT APPROVED.** **Manufacturing/tapeout: NOT AUTHORIZED.**

The request kit does not turn a planned study into physical validation or justify a success probability. Its purpose is to transfer concrete requirements to qualified labs and reviewers, with precise source fingerprints and explicit missing-evidence gates.

See [Issue #74](https://github.com/god88844-hub/invention-lab/issues/74) for outstanding external dependencies.
