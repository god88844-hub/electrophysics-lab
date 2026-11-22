import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ADMISSION_RECORD_FORMAT,
  LEVEL1_INSUFFICIENT_MODEL_DATA,
  LEVEL2_UNQUALIFIED_NO_GO,
  LEVEL3_STATISTICAL_ADMITTED,
  Q4_DECK_IDS,
  REQUIRED_MC_SWITCHES,
  admissionGate,
  main,
  pinnedProvenance,
} from '../scripts/v4-oracles/pdk-admission-gate.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');
const q4Payload = readFileSync(
  path.join(repoRoot, 'data', 'reference-library', '03_multiradix_logic_baselines.json'),
  'utf8',
);
const thresholds = JSON.parse(
  readFileSync(path.join(repoRoot, 'benchmarks', 'stage-m-qualification-thresholds.json'), 'utf8'),
);

/** An authenticated statistical PDK input: valid SHA-256 manifest + BOTH
 * Monte-Carlo switches enabled exactly once each in the sealed section. */
function validStatisticalPdk() {
  const libraryBytes = 'SKY130A processed statistical library bytes (fixture)';
  const sectionBody = [
    '* processed mc section',
    '.param mc_mm_switch=1',
    '.param mc_pr_switch=1',
  ].join('\n');
  return {
    libraryBytes,
    sectionName: 'mc',
    sectionBody,
    manifest: {
      pdkLibrarySha256: createHash('sha256').update(libraryBytes).digest('hex'),
      level2: LEVEL2_UNQUALIFIED_NO_GO,
      soaLimitV: 1.95,
    },
  };
}

/** The full native EDA output set: DRC=0, unique-port LVS, PEX, 4/4 decks. */
function validNativeOutputs() {
  const decks = Object.fromEntries(
    Q4_DECK_IDS.map((id) => [id, { passed: true, trials: 1 }]),
  );
  return {
    magic: { tool: 'magic', drcErrors: 0 },
    netgen: { tool: 'netgen', lvsMismatches: 0, uniquePortMatch: true },
    pex: { tool: 'magic', extracted: true },
    ngspice: { tool: 'ngspice', decks },
  };
}

function fullyAdmittedInput(overrides = {}) {
  return {
    q4Payload,
    thresholds,
    nativeToolsAvailable: true,
    statisticalPdk: validStatisticalPdk(),
    nativeOutputs: validNativeOutputs(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Pinned provenance (Law 5 — from the sealed vault, never invented)
// ---------------------------------------------------------------------------

test('pinned provenance: both commits, 1.95 V SOA ceiling and the 4 Q4 decks verify', () => {
  const p = pinnedProvenance(q4Payload, thresholds);
  assert.deepEqual(p.errors, [], 'no provenance errors');
  assert.equal(p.sky130Commit, 'f62031a1be9aefe902d6d54cddd6f59b57627436');
  assert.equal(p.openPdksCommit, '0c1f82326278a0871f0a1fc4bdacf94c88e78e4d');
  assert.equal(p.soaCeilingV, 1.95);
  assert.deepEqual(p.deckIds, [...Q4_DECK_IDS]);
  assert.equal(p.requiredTotalNativeTrials, 6400);
  assert.equal(p.requiredPrimitiveTrials, 4000);
  assert.equal(p.requiredAluTrials, 2400);
  assert.equal(p.minimumWilsonLower95, 0.9);
  assert.equal(p.confidence, 0.95);
  assert.match(p.q4PayloadSha256, /^[0-9a-f]{64}$/);
});

test('pinned provenance: tampered payloads are refused fail-closed', () => {
  const cases = [
    ['wrong commit', q4Payload.replace('f62031a1be9aefe902d6d54cddd6f59b57627436', 'a'.repeat(40))],
    ['missing primitive', q4Payload.replace('"q4_half_adder"', '"q4_xor"')],
    ['non-40-hex commit', q4Payload.replace('f62031a1be9aefe902d6d54cddd6f59b57627436', 'deadbeef')],
  ];
  for (const [what, payload] of cases) {
    const p = pinnedProvenance(payload, thresholds);
    assert.ok(p.errors.length > 0, `${what} must be refused`);
  }
  // Invalid thresholds.
  const badThresholds = {
    ...thresholds,
    physicalGate: { ...thresholds.physicalGate, maxCorePairwiseTerminalVoltageV: 1.8 },
  };
  assert.ok(pinnedProvenance(q4Payload, badThresholds).errors.length > 0, 'SOA ceiling tamper refused');
  const split = {
    ...thresholds,
    requiredPrimitiveTrials: 3000,
  };
  assert.ok(pinnedProvenance(q4Payload, split).errors.length > 0, 'trial-budget tamper refused');
  assert.ok(pinnedProvenance('not json', thresholds).errors.length > 0, 'invalid JSON refused');
});

// ---------------------------------------------------------------------------
// Level-1 refusal paths — explicit, machine-readable, never silent
// ---------------------------------------------------------------------------

test('level-1 refusal: no statistical PDK + no native tools → explicit refusal record', () => {
  const record = admissionGate({ q4Payload, thresholds });
  assert.equal(record.format, ADMISSION_RECORD_FORMAT);
  assert.equal(record.admitted, false);
  assert.equal(record.level, LEVEL1_INSUFFICIENT_MODEL_DATA);
  assert.equal(record.verdict, 'REFUSED');
  assert.equal(record.level2, LEVEL2_UNQUALIFIED_NO_GO, 'the record carries Level-2 explicitly');
  assert.equal(record.provenance, 'SIMULATED_ARCHITECTURAL_MODEL');
  assert.match(record.note, /INSUFFICIENT_MODEL_DATA.*no statistical yield claim/i);
  // All three absences are named explicitly.
  assert.ok(record.reasons.some((r) => r.includes('native Magic/Netgen/ngspice tools not available')));
  assert.ok(record.reasons.some((r) => r.includes('statistical PDK input absent')));
  assert.ok(record.reasons.some((r) => r.includes('native DRC/LVS/PEX/ngspice outputs absent')));
  // The required contract is machine-readable on the record.
  assert.equal(record.required.pinnedSky130Commit, 'f62031a1be9aefe902d6d54cddd6f59b57627436');
  assert.equal(record.required.soaCeilingV, 1.95);
  assert.deepEqual(record.required.statisticalSwitches, REQUIRED_MC_SWITCHES);
  assert.deepEqual(record.required.nativeOutputs.q4Decks, [...Q4_DECK_IDS]);
});

test('level-1 refusal: statistical PDK present but only ONE Monte-Carlo switch enabled', () => {
  const sp = validStatisticalPdk();
  sp.sectionBody = sp.sectionBody.replace('.param mc_pr_switch=1', '.param mc_pr_switch=0');
  const record = admissionGate({ q4Payload, thresholds, statisticalPdk: sp, nativeToolsAvailable: true });
  assert.equal(record.admitted, false);
  assert.equal(record.level, LEVEL1_INSUFFICIENT_MODEL_DATA);
  assert.ok(
    record.reasons.some((r) => r.includes('does not enable BOTH Monte-Carlo switches')),
    `reason: ${record.reasons.join('; ')}`,
  );
});

test('level-1 refusal: MC switch enabled twice (duplicate assignment) is refused', () => {
  const sp = validStatisticalPdk();
  sp.sectionBody = `${sp.sectionBody}\n.param mc_mm_switch=1`;
  const record = admissionGate({ q4Payload, thresholds, statisticalPdk: sp, nativeToolsAvailable: true });
  assert.equal(record.admitted, false);
  assert.match(record.reasons.join('; '), /BOTH Monte-Carlo switches/);
});

test('level-1 refusal: comment lines never satisfy the MC switch scan', () => {
  const sp = validStatisticalPdk();
  sp.sectionBody = `* .param mc_mm_switch=1\n* .param mc_pr_switch=1\n.param mc_mm_switch=0`;
  const record = admissionGate({ q4Payload, thresholds, statisticalPdk: sp, nativeToolsAvailable: true });
  assert.equal(record.admitted, false);
});

test('level-1 refusal: TAMPERED statistical library (SHA-256 manifest mismatch)', () => {
  const sp = validStatisticalPdk();
  sp.libraryBytes = `${sp.libraryBytes} — tampered`;
  const record = admissionGate({ q4Payload, thresholds, statisticalPdk: sp, nativeToolsAvailable: true });
  assert.equal(record.admitted, false);
  assert.equal(record.level, LEVEL1_INSUFFICIENT_MODEL_DATA);
  assert.match(record.reasons.join('; '), /TAMPERED/);
});

test('level-1 refusal: manifest with wrong level2 or wrong SOA limit', () => {
  const sp = validStatisticalPdk();
  sp.manifest.level2 = 'QUALIFIED_GO';
  let record = admissionGate({ q4Payload, thresholds, statisticalPdk: sp, nativeToolsAvailable: true });
  assert.equal(record.admitted, false);
  assert.match(record.reasons.join('; '), /UNQUALIFIED_NO_GO/);
  const sp2 = validStatisticalPdk();
  sp2.manifest.soaLimitV = 2.1;
  record = admissionGate({ q4Payload, thresholds, statisticalPdk: sp2, nativeToolsAvailable: true });
  assert.equal(record.admitted, false);
  assert.match(record.reasons.join('; '), /1\.95 V ceiling/);
});

test('level-1 refusal: no yield claim is ever fabricated on a refusal', () => {
  const record = admissionGate({ q4Payload, thresholds });
  assert.equal(record.yieldClaimPermitted, undefined, 'refusals never carry a yield claim');
  assert.match(record.note, /no statistical yield claim is permitted/);
});

// ---------------------------------------------------------------------------
// Full admission — valid statistical PDK + native outputs + tools
// ---------------------------------------------------------------------------

test('full admission: authenticated statistical PDK + DRC=0/LVS-unique/PEX + 4/4 decks → ADMITTED', () => {
  const record = admissionGate(fullyAdmittedInput());
  assert.equal(record.admitted, true);
  assert.equal(record.level, LEVEL3_STATISTICAL_ADMITTED);
  assert.equal(record.verdict, 'ADMITTED');
  assert.deepEqual(record.reasons, []);
  assert.match(record.note, /6400-trial yield claims may now flow through the Phase 0 gates/);
  assert.equal(record.yieldClaimPermitted.totalNativeTrials, 6400);
  assert.equal(record.yieldClaimPermitted.primitiveTrials, 4000);
  assert.equal(record.yieldClaimPermitted.aluTrials, 2400);
  assert.equal(record.yieldClaimPermitted.minimumWilsonLower95, 0.9);
  assert.equal(record.yieldClaimPermitted.confidence, 0.95);
  assert.equal(record.checked.statisticalPdk.switches.mc_mm_switch, 1);
  assert.equal(record.checked.statisticalPdk.switches.mc_pr_switch, 1);
});

test('full admission: each missing native output blocks admission explicitly', () => {
  for (const drop of ['magic', 'netgen', 'pex', 'ngspice']) {
    const outputs = validNativeOutputs();
    delete outputs[drop];
    const record = admissionGate(fullyAdmittedInput({ nativeOutputs: outputs }));
    assert.equal(record.admitted, false, `missing ${drop} must block`);
    assert.match(record.reasons.join('; '), new RegExp(drop));
  }
});

test('full admission: DRC errors, LVS mismatches, missing unique-port match and deck failures each block', () => {
  const variants = [
    ['magic DRC errors', { magic: { tool: 'magic', drcErrors: 3 } }],
    ['netgen LVS mismatches', { netgen: { tool: 'netgen', lvsMismatches: 2, uniquePortMatch: true } }],
    ['netgen not a unique port match', { netgen: { tool: 'netgen', lvsMismatches: 0, uniquePortMatch: false } }],
    ['pex not extracted', { pex: { tool: 'magic', extracted: false } }],
  ];
  for (const [what, output] of variants) {
    const outputs = { ...validNativeOutputs(), ...output };
    const record = admissionGate(fullyAdmittedInput({ nativeOutputs: outputs }));
    assert.equal(record.admitted, false, `${what} must block`);
    assert.match(record.reasons.join('; '), new RegExp(what.split(' ').slice(-1)[0], 'i'));
  }
  // One failing Q4 deck blocks (4/4 required).
  const outputs = validNativeOutputs();
  outputs.ngspice.decks.q4_half_adder = { passed: false };
  const record = admissionGate(fullyAdmittedInput({ nativeOutputs: outputs }));
  assert.equal(record.admitted, false);
  assert.match(record.reasons.join('; '), /q4_half_adder/);
  // A missing deck blocks too.
  const outputs2 = validNativeOutputs();
  delete outputs2.ngspice.decks.q4_mux4;
  const record2 = admissionGate(fullyAdmittedInput({ nativeOutputs: outputs2 }));
  assert.equal(record2.admitted, false);
  assert.match(record2.reasons.join('; '), /q4_mux4/);
});

test('full admission: tools available but no statistical PDK → Level-1 (tools alone never admit)', () => {
  const record = admissionGate({
    q4Payload,
    thresholds,
    nativeToolsAvailable: true,
    nativeOutputs: validNativeOutputs(),
  });
  assert.equal(record.admitted, false);
  assert.equal(record.level, LEVEL1_INSUFFICIENT_MODEL_DATA);
  assert.match(record.reasons.join('; '), /statistical PDK input absent/);
});

test('full admission: malformed native records (missing tool name) are refused', () => {
  const outputs = validNativeOutputs();
  outputs.magic = { drcErrors: 0 };
  const record = admissionGate(fullyAdmittedInput({ nativeOutputs: outputs }));
  assert.equal(record.admitted, false);
  assert.match(record.reasons.join('; '), /native magic output record missing or malformed/);
});

// ---------------------------------------------------------------------------
// CLI (default Level-1 evidence from the sealed vault)
// ---------------------------------------------------------------------------

test('cli: the default record is the honest Level-1 refusal with verified provenance', () => {
  const lines = [];
  const record = main([], { log: (x) => lines.push(x) });
  assert.equal(record.admitted, false);
  assert.equal(record.level, LEVEL1_INSUFFICIENT_MODEL_DATA);
  assert.equal(record.checked.pinnedProvenance.sky130Commit, 'f62031a1be9aefe902d6d54cddd6f59b57627436');
  assert.equal(record.checked.pinnedProvenance.soaCeilingV, 1.95);
  const printed = JSON.parse(lines.join('\n'));
  assert.equal(printed.format, ADMISSION_RECORD_FORMAT);
});
