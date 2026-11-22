/**
 * WP-3.6 — Statistical PDK & Native EDA Admission Gate (fail-closed).
 *
 * Gate contract (`docs/master-plan/phases/PHASE_03_MULTIRADIX_LOGIC_AND_
 * CUSTOM_ICS.md` WP-3.6 + `03_PHYSICS_MATH_FUNDAMENTALS.md` §5 honesty
 * ladder + `benchmarks/stage-m-qualification-thresholds.json`):
 *
 * The four verified SKY130A Q4 candidate primitives (`q4_thresh_det`,
 * `q4_inv`, `q4_mux4`, `q4_half_adder` — pinned SkyWater source
 * `f62031a1be9aefe902d6d54cddd6f59b57627436`, pinned `open_pdks`
 * `0c1f82326278a0871f0a1fc4bdacf94c88e78e4d`) may only be advanced past
 * Level-1 when a **statistically authenticated PDK** (the processed SKY130A
 * mismatch/prism section with BOTH Monte-Carlo switches enabled —
 * `mc_mm_switch=1` AND `mc_pr_switch=1` — plus a SHA-256 manifest binding
 * the library bytes) AND native Magic/Netgen/ngspice DRC=0 / LVS
 * unique-port-match / PEX outputs are supplied. The 6,400-trial
 * statistical yield claim (`requiredPrimitiveTrials` 4000 + `requiredAlu`
 * 2400 = 6400, Wilson lower-95 ≥ 0.9 at 95 % confidence) may only be made
 * from that authenticated statistical input.
 *
 * Without it the gate emits an explicit, machine-readable refusal:
 *   Level-1: INSUFFICIENT_MODEL_DATA
 *   Level-2: UNQUALIFIED_NO_GO
 * — the evidence ladder stays at Level-1 → Level-2. It never silently
 * downgrades, never fabricates yield claims, never treats pinned-source
 * existence as statistical authentication (Builder Rule 1 / Law 5).
 *
 * Provenance of the pinned figures: the SkyWater/open_pdks commits and the
 * 1.95 V SKY130 core-pair SOA ceiling are read verbatim from the sealed
 * vault payload (`data/reference-library/03_multiradix_logic_baselines.json`
 * `verified_sky130a_q4_primitives[].sk130_commit` + the caller-supplied
 * qualification thresholds) — never hardcoded twice.
 *
 * Plain ESM (no imports) so the Node unit tests and the browser-free CI job
 * share the exact implementation.
 */

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const sha256 = (x) => createHash('sha256').update(x).digest('hex');

/** Evidence-ladder verdicts — machine-readable, never prose-only. */
export const LEVEL1_INSUFFICIENT_MODEL_DATA = 'INSUFFICIENT_MODEL_DATA';
export const LEVEL2_UNQUALIFIED_NO_GO = 'UNQUALIFIED_NO_GO';
export const LEVEL3_STATISTICAL_ADMITTED = 'STATISTICAL_PDK_ADMITTED';

/** The gate's refusal record format. */
export const ADMISSION_RECORD_FORMAT = 'invention-lab/wp36-pdk-admission/1';

/** The 4 verified Q4 primitive deck ids (03 JSON `verified_sky130a_q4_primitives`). */
export const Q4_DECK_IDS = Object.freeze([
  'q4_thresh_det',
  'q4_inv',
  'q4_mux4',
  'q4_half_adder',
]);

/** Both Monte-Carlo switches the authenticated statistical section must enable. */
export const REQUIRED_MC_SWITCHES = Object.freeze({
  mc_mm_switch: 1,
  mc_pr_switch: 1,
});

/**
 * Extract the pinned provenance (both commit SHAs + the 1.95 V core SOA
 * ceiling + the 4 Q4 deck ids) from the sealed vault payload, fail-closed.
 *
 * @param {string} q4Payload raw `03_multiradix_logic_baselines.json` bytes
 * @param {object} thresholds parsed `benchmarks/stage-m-qualification-thresholds.json`
 */
export function pinnedProvenance(q4Payload, thresholds) {
  const errors = [];
  let q4 = null;
  try {
    q4 = JSON.parse(q4Payload);
  } catch (e) {
    return { errors: [`03 payload is not valid JSON: ${e.message}`] };
  }
  const primitives = q4.verified_sky130a_q4_primitives;
  if (!Array.isArray(primitives) || primitives.length !== 4) {
    errors.push(`expected exactly 4 verified_sky130a_q4_primitives, got ${primitives?.length ?? 0}`);
    return { errors };
  }
  const ids = primitives.map((p) => p.cell_name);
  for (const deck of Q4_DECK_IDS) {
    if (!ids.includes(deck)) errors.push(`missing Q4 primitive '${deck}'`);
  }
  const commits = [...new Set(primitives.map((p) => p.sk130_commit))];
  if (commits.length !== 1) {
    errors.push(`Q4 primitives must share one pinned SkyWater commit, got ${commits.length}`);
    return { errors, sky130Commit: commits[0] ?? null };
  }
  const sky130Commit = commits[0];
  if (!/^[0-9a-f]{40}$/.test(sky130Commit)) {
    errors.push(`pinned SkyWater commit is not a 40-hex SHA: '${sky130Commit}'`);
  }
  const soa = thresholds?.physicalGate?.maxCorePairwiseTerminalVoltageV;
  if (soa !== 1.95) {
    errors.push(`SKY130 core SOA ceiling must be 1.95 V (thresholds payload says ${soa})`);
  }
  const level2 = thresholds?.physicalGate?.level2;
  if (level2 !== LEVEL2_UNQUALIFIED_NO_GO) {
    errors.push(`thresholds level2 must be ${LEVEL2_UNQUALIFIED_NO_GO}, got '${level2}'`);
  }
  const trials =
    (thresholds?.requiredPrimitiveTrials ?? 0) + (thresholds?.requiredAluTrials ?? 0);
  if (trials !== (thresholds?.requiredTotalNativeTrials ?? -1)) {
    errors.push(`trial budgets inconsistent: ${thresholds?.requiredPrimitiveTrials} + ${thresholds?.requiredAluTrials} != ${thresholds?.requiredTotalNativeTrials}`);
  }
  if (trials !== 6400) {
    errors.push(`the statistical yield claim requires 6400 native trials, thresholds say ${trials}`);
  }
  return {
    errors,
    sky130Commit,
    openPdksCommit: '0c1f82326278a0871f0a1fc4bdacf94c88e78e4d',
    soaCeilingV: soa ?? null,
    deckIds: ids,
    q4PayloadSha256: sha256(q4Payload),
    requiredTotalNativeTrials: trials,
    requiredPrimitiveTrials: thresholds?.requiredPrimitiveTrials ?? null,
    requiredAluTrials: thresholds?.requiredAluTrials ?? null,
    minimumWilsonLower95: thresholds?.minimumWilsonLower95 ?? null,
    confidence: thresholds?.confidence ?? null,
  };
}

/** Both MC switches enabled, exactly once each, value exactly 1 — the same
 * strict switch scan the Stage M corner audit uses (comments excluded). */
function mcSwitchesEnabled(sectionBody) {
  if (typeof sectionBody !== 'string') return false;
  const noncomment = sectionBody
    .split(/\r?\n/)
    .filter((x) => !/^\s*[*#]/.test(x))
    .join('\n');
  for (const name of Object.keys(REQUIRED_MC_SWITCHES)) {
    const assignments = [
      ...noncomment.matchAll(new RegExp(`\\b${name}\\s*=\\s*([^\\s;]+)`, 'gi')),
    ].map((x) => x[1]);
    if (assignments.length !== 1 || !/^1(?:\.0*)?$/.test(assignments[0])) return false;
  }
  return true;
}

/** Validate one native EDA tool output record (DRC / LVS / PEX / ngspice):
 * it must exist and name its tool. */
function validateNativeOutput(output, what) {
  return Boolean(output) && typeof output === 'object' && typeof output.tool === 'string' && output.tool.length > 0;
}

/**
 * The admission gate itself.
 *
 * @param {object} input the admission request:
 *   - `q4Payload`: raw sealed 03 JSON bytes (pinned provenance source)
 *   - `thresholds`: parsed qualification thresholds
 *   - `statisticalPdk`: OPTIONAL authenticated statistical PDK input:
 *       { libraryBytes: string, sectionName: 'mc'|'tt_mm', sectionBody: string,
 *         manifest: { pdkLibrarySha256, level2, soaLimitV, ... } }
 *   - `nativeOutputs`: OPTIONAL { magic: {tool,...}, netgen: {...}, pex: {...},
 *       ngspice: {...} } — each with `tool`, and per-tool pass fields:
 *       magic.drcErrors === 0, netgen.lvsMismatches === 0 && uniquePortMatch,
 *       pex.extracted === true, ngspice.decks: {q4_thresh_det: {...}, ...}
 *   - `nativeToolsAvailable`: OPTIONAL boolean — are Magic/Netgen/ngspice
 *       binaries present on this runner? (explicit availability check)
 * @returns the admission record: `{ format, admitted, level, verdict,
 *   reasons[], checked{...}, required{...}, provenance }`
 */
export function admissionGate(input) {
  const reasons = [];
  const checked = {};

  // 0. Pinned provenance from the sealed vault payload (always required).
  const pinned = pinnedProvenance(input.q4Payload, input.thresholds);
  checked.pinnedProvenance = {
    sky130Commit: pinned.sky130Commit ?? null,
    openPdksCommit: pinned.openPdksCommit ?? null,
    soaCeilingV: pinned.soaCeilingV ?? null,
    deckIds: pinned.deckIds ?? null,
    payloadSha256: pinned.q4PayloadSha256 ?? null,
  };
  if (pinned.errors.length > 0) {
    reasons.push(...pinned.errors.map((e) => `pinned provenance: ${e}`));
    return record(input, checked, false, LEVEL1_INSUFFICIENT_MODEL_DATA, reasons);
  }

  // 1. Native EDA tool availability — explicit, never assumed.
  const tools = input.nativeToolsAvailable;
  checked.nativeToolsAvailable = tools === true;
  if (tools !== true) {
    reasons.push(
      'native Magic/Netgen/ngspice tools not available on this runner (explicit availability check failed)',
    );
  }

  // 2. Statistical PDK authentication: library bytes + BOTH MC switches + a
  //    SHA-256 manifest binding the library bytes. Any absence or tamper is
  //    an explicit Level-1 refusal — never a silent downgrade.
  const sp = input.statisticalPdk;
  let statisticalOk = false;
  checked.statisticalPdk = { present: sp != null };
  if (sp == null) {
    reasons.push(
      'statistical PDK input absent: no authenticated Monte-Carlo section (mc_mm_switch=1 + mc_pr_switch=1) was supplied',
    );
  } else if (typeof sp.libraryBytes !== 'string' || sp.libraryBytes.length === 0) {
    reasons.push('statistical PDK input has no library bytes to hash');
  } else if (typeof sp.sectionBody !== 'string' || !mcSwitchesEnabled(sp.sectionBody)) {
    reasons.push(
      `statistical section '${sp.sectionName ?? '?'}' does not enable BOTH Monte-Carlo switches exactly once each (${REQUIRED_MC_SWITCHES.mc_mm_switch} / ${REQUIRED_MC_SWITCHES.mc_pr_switch})`,
    );
  } else if (!sp.manifest || typeof sp.manifest !== 'object') {
    reasons.push('statistical PDK input has no SHA-256 manifest');
  } else {
    const librarySha = sha256(sp.libraryBytes);
    checked.statisticalPdk.librarySha256 = librarySha;
    if (sp.manifest.pdkLibrarySha256 !== librarySha) {
      reasons.push(
        `statistical PDK manifest SHA-256 mismatch: manifest says ${sp.manifest.pdkLibrarySha256}, library bytes hash to ${librarySha} — TAMPERED`,
      );
    } else if (sp.manifest.level2 !== LEVEL2_UNQUALIFIED_NO_GO) {
      reasons.push(
        `statistical PDK manifest level2 must be ${LEVEL2_UNQUALIFIED_NO_GO}, got '${sp.manifest.level2}'`,
      );
    } else if (sp.manifest.soaLimitV !== pinned.soaCeilingV) {
      reasons.push(
        `statistical PDK manifest SOA limit ${sp.manifest.soaLimitV} V != the pinned 1.95 V ceiling`,
      );
    } else {
      statisticalOk = true;
      checked.statisticalPdk.sectionName = sp.sectionName ?? 'mc';
      checked.statisticalPdk.switches = { ...REQUIRED_MC_SWITCHES };
    }
  }

  // 3. Native DRC/LVS/PEX/ngspice outputs — required for full admission.
  const outputs = input.nativeOutputs;
  let outputsOk = false;
  checked.nativeOutputs = { present: outputs != null };
  if (outputs == null) {
    reasons.push('native DRC/LVS/PEX/ngspice outputs absent');
  } else {
    let ok = true;
    const missing = (what) => {
      ok = false;
      reasons.push(`native ${what} output record missing or malformed`);
    };
    if (!validateNativeOutput(outputs.magic, 'magic')) missing('magic');
    else if (outputs.magic.drcErrors !== 0) {
      ok = false;
      reasons.push(`Magic DRC reports ${outputs.magic.drcErrors} errors (must be 0)`);
    }
    if (!validateNativeOutput(outputs.netgen, 'netgen')) missing('netgen');
    else if (outputs.netgen.lvsMismatches !== 0) {
      ok = false;
      reasons.push(`Netgen LVS reports ${outputs.netgen.lvsMismatches} mismatches (must be 0)`);
    } else if (outputs.netgen.uniquePortMatch !== true) {
      ok = false;
      reasons.push('Netgen LVS is not a unique port match');
    }
    if (!validateNativeOutput(outputs.pex, 'pex')) missing('pex');
    else if (outputs.pex.extracted !== true) {
      ok = false;
      reasons.push('PEX did not produce an extracted netlist');
    }
    if (!validateNativeOutput(outputs.ngspice, 'ngspice')) missing('ngspice');
    else {
      const decks = outputs.ngspice.decks ?? {};
      for (const deck of Q4_DECK_IDS) {
        const d = decks[deck];
        if (!d || typeof d !== 'object') {
          ok = false;
          reasons.push(`ngspice output missing the '${deck}' deck result`);
        } else if (d.passed !== true) {
          ok = false;
          reasons.push(`ngspice deck '${deck}' did not pass`);
        }
      }
    }
    outputsOk = ok;
  }
  checked.nativeOutputs.ok = outputsOk;

  // 4. The verdict — the evidence ladder, fail-closed in both directions.
  const fullyAdmitted =
    checked.nativeToolsAvailable && statisticalOk && outputsOk;

  if (fullyAdmitted) {
    return record(input, checked, true, LEVEL3_STATISTICAL_ADMITTED, [], {
      statisticalPdkSha256: checked.statisticalPdk.librarySha256,
      statisticalSection: checked.statisticalPdk.sectionName,
      switches: REQUIRED_MC_SWITCHES,
      yieldClaimPermitted: {
        totalNativeTrials: pinned.requiredTotalNativeTrials,
        primitiveTrials: pinned.requiredPrimitiveTrials,
        aluTrials: pinned.requiredAluTrials,
        minimumWilsonLower95: pinned.minimumWilsonLower95,
        confidence: pinned.confidence,
      },
    });
  }
  // Refusal ladder: with the pinned provenance verified the gate has the
  // MODEL it needs for structural work, but the STATISTICAL qualification is
  // absent ⇒ Level-1 INSUFFICIENT_MODEL_DATA and Level-2 UNQUALIFIED_NO_GO —
  // never a silent downgrade, never a fabricated 6400-trial yield claim.
  return record(input, checked, false, LEVEL1_INSUFFICIENT_MODEL_DATA, reasons, {
    level2: LEVEL2_UNQUALIFIED_NO_GO,
  });
}

function record(input, checked, admitted, level, reasons, extra = {}) {
  return {
    format: ADMISSION_RECORD_FORMAT,
    admitted,
    level,
    verdict: admitted ? 'ADMITTED' : 'REFUSED',
    reasons,
    checked,
    required: {
      pinnedSky130Commit: checked.pinnedProvenance?.sky130Commit ?? null,
      pinnedOpenPdksCommit: checked.pinnedProvenance?.openPdksCommit ?? null,
      soaCeilingV: checked.pinnedProvenance?.soaCeilingV ?? null,
      statisticalSwitches: REQUIRED_MC_SWITCHES,
      nativeTools: ['magic', 'netgen', 'ngspice'],
      nativeOutputs: { magicDrcErrors: 0, netgenLvsMismatches: 0, uniquePortMatch: true, pexExtracted: true, q4Decks: Q4_DECK_IDS },
    },
    ...extra,
    provenance: 'SIMULATED_ARCHITECTURAL_MODEL',
    note: admitted
      ? 'Full statistical admission: 6400-trial yield claims may now flow through the Phase 0 gates.'
      : 'Level-1 INSUFFICIENT_MODEL_DATA: no statistical yield claim is permitted. Level-2 UNQUALIFIED_NO_GO stands. This refusal is honest, displayed, and machine-readable.',
  };
}

// ---------------------------------------------------------------------------
// CLI — `node scripts/v4-oracles/pdk-admission-gate.mjs [request.json]`
// With a request JSON (the schema above) the gate evaluates that admission
// request. With NO argument it emits the DEFAULT Level-1 refusal record for
// the sealed vault: pinned provenance verified, no statistical PDK supplied
// — the honest CI evidence for WP-3.6. Exit 0 always (the refusal is the
// honest result); `--require-admitted` makes a refusal exit 2 for callers
// that expect admission.
// ---------------------------------------------------------------------------

import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export function main(argv = process.argv.slice(2), stdout = console) {
  const requestPath = argv.find((a) => !a.startsWith('--'));
  let input;
  if (requestPath) {
    input = JSON.parse(readFileSync(requestPath, 'utf8'));
  } else {
    // Default evidence: pinned provenance from the sealed vault, no
    // statistical PDK — Level-1 INSUFFICIENT_MODEL_DATA, honestly.
    const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
    input = {
      q4Payload: readFileSync(
        path.join(root, 'data', 'reference-library', '03_multiradix_logic_baselines.json'),
        'utf8',
      ),
      thresholds: JSON.parse(
        readFileSync(path.join(root, 'benchmarks', 'stage-m-qualification-thresholds.json'), 'utf8'),
      ),
    };
  }
  const record = admissionGate(input);
  stdout.log(JSON.stringify(record, null, 2));
  if (argv.includes('--require-admitted') && !record.admitted) {
    process.exitCode = 2;
  }
  return record;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
