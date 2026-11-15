// run.mjs — benchmark CLI.
//
// Usage:
//   node js/bench/run.mjs --suite ngspice|quantum|all [--ngspice <path>] [--python <path>] [--out benchmarks/evidence] [--strict]
//
// Writes machine-readable JSON + human-readable Markdown artifacts and a
// combined evidence summary (merging latest on-disk reports of suites not run
// in this invocation, so totals always cover every suite). Skipped/failed
// benchmarks are reported as such — never folded into a pass count.
// --strict (CI): exits non-zero unless EVERY case in every suite passed.

import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { runSuite, renderMarkdown, exitCodeFor, crossSolverEvidenceStatus, combineReports } from './harness.js';
import { resolveNgspice } from './ngspice-adapter.js';
import { resolvePython, runQuantumRef, qiskitToIlOrder } from './quantum/quantum-adapter.js';
import { ngspiceCases } from './cases/ngspice-cases.js';
import { readFileSync } from 'node:fs';
const manifest = JSON.parse(readFileSync(new URL('./manifest.json', import.meta.url), 'utf8'));
const manifestIds = manifest.requiredCaseIds;
console.log(`  manifest: ${manifestIds.length} required cases (independent spec: js/bench/manifest.json, phase ${manifest.phase})`);
import { quantumCases } from './cases/quantum-cases.js';

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const suiteArg = arg('suite') || 'all';
const outDir = path.resolve(arg('out') || 'benchmarks/evidence');
const ngspiceArg = arg('ngspice');
const pythonArg = arg('python');

const commitSHA = (() => {
  try { return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(); }
  catch { return 'unknown (not a git checkout)'; }
})();

console.log('Invention Lab — independent benchmarking harness');
console.log(`  commit: ${commitSHA}`);
console.log(`  node:   ${process.version}`);
console.log('');

// resolve engines and record versions
const engines = {};
let ngspice = null;
let quantum = null;

if (suiteArg === 'ngspice' || suiteArg === 'all') {
  ngspice = await resolveNgspice(ngspiceArg);
  engines.ngspice = ngspice ? { version: ngspice.version, exe: ngspice.exe } : { version: null, exe: null, note: 'NOT FOUND — ngspice suite will be SKIPPED, not passed' };
  console.log(`  ngspice: ${ngspice ? `v${ngspice.version} @ ${ngspice.exe}` : 'NOT FOUND'}`);
}
if (suiteArg === 'quantum' || suiteArg === 'all') {
  const py = await resolvePython(pythonArg);
  let qiskitVersion = null;
  if (py) {
    // probe qiskit availability honestly
    const probe = await import('node:child_process').then(({ spawn }) => new Promise((resolve) => {
      const child = spawn(py.exe, ['-c', 'import qiskit;print(qiskit.__version__)'], { windowsHide: true });
      let out = '';
      child.stdout.on('data', (d) => { out += d; });
      child.on('error', () => resolve(null));
      child.on('close', (c) => resolve(c === 0 ? out.trim() || null : null));
    }));
    qiskitVersion = probe;
  }
  quantum = {
    python: py,
    qiskit: qiskitVersion,
    numpy: py ? 'see runner' : null,
    run: (circuit) => runQuantumRef(py.exe, circuit),
    toIlOrder: (amplitudes, n) => qiskitToIlOrder(amplitudes, n),
  };
  engines.qiskit = { version: qiskitVersion, note: qiskitVersion ? null : 'NOT INSTALLED — qiskit cases will be SKIPPED, not passed' };
  engines.numpy = { version: py ? 'independent reference (see per-case engine strings)' : null };
  console.log(`  python:  ${py ? py.version + ' @ ' + py.exe : 'NOT FOUND'}`);
  console.log(`  qiskit:  ${qiskitVersion ?? 'NOT INSTALLED'}`);
}
console.log('');

const ctx = { ngspice, quantum };

const suitesToRun = [];
if (suiteArg === 'ngspice' || suiteArg === 'all') {
  suitesToRun.push({ label: 'ngspice (external circuit simulator)', cases: ngspiceCases() });
}
if (suiteArg === 'quantum' || suiteArg === 'all') {
  suitesToRun.push({ label: 'quantum (Qiskit + independent NumPy qudit reference)', cases: quantumCases() });
}

await mkdir(outDir, { recursive: true });
const allReports = [];
const executedBases = new Set();
for (const s of suitesToRun) {
  console.log(`=== ${s.label}: ${s.cases.length} cases ===`);
  const report = await runSuite(s.cases, ctx, {
    engineVersions: engines,
    commitSHA,
    suiteLabel: s.label,
  });
  const fileBase = s.label.split(' ')[0];
  executedBases.add(fileBase);
  await writeFile(path.join(outDir, `latest-${fileBase}.json`), JSON.stringify(report, null, 2));
  await writeFile(path.join(outDir, `latest-${fileBase}.md`), renderMarkdown(report));
  allReports.push(report);
  console.log(`  pass ${report.summary.pass} / fail ${report.summary.fail} / skipped ${report.summary.skipped} / unsupported ${report.summary.unsupported} / model-mismatch ${report.summary['model-mismatch'] || 0} / inconclusive ${report.summary.inconclusive}`);
  for (const c of report.cases) {
    console.log(`    [${c.status.toUpperCase()}] ${c.id}${c.classification && c.classification !== c.status ? ` (${c.classification})` : ''}`);
  }
  console.log('');
}

// review round 4: merge in the latest on-disk reports of suites not run in
// this invocation — but ONLY reports generated at the CURRENT commit; stale
// reports (different SHA) are excluded from evidence counts and recorded as
// such, never published as current under the "latest" label.
const KNOWN_SUITE_FILES = ['latest-ngspice.json', 'latest-quantum.json'];
const previousReports = [];
for (const file of KNOWN_SUITE_FILES) {
  const base = file.replace('latest-', '').replace('.json', '');
  if (executedBases.has(base)) continue;
  try {
    previousReports.push(JSON.parse(await readFile(path.join(outDir, file), 'utf8')));
  } catch (e) {
    if (e.code !== 'ENOENT') console.log(`(could not read previous report ${file}: ${e.message})`);
    // missing previous report for a suite is fine — strict mode enforces the manifest
  }
}
const { merged: combinedReports, staleExcluded } = combineReports(allReports, previousReports, commitSHA);
for (const st of staleExcluded) {
  console.log(`(stale report excluded from evidence counts: suite "${st.suite}" generated at a different commit — current is ${commitSHA.slice(0, 7)})`);
}

// review round 5: the required manifest is the INDEPENDENT version-controlled
// specification (js/bench/manifest.json), not a list derived from the case
// definitions — deleting a benchmark definition now FAILS strict validation
// instead of shrinking the requirement.
const requiredCaseIds = manifestIds;

// combined machine-readable evidence summary for the validation-stage system
const evidence = {
  generatedAt: new Date().toISOString(),
  commitSHA,
  engines,
  staleExcludedReports: staleExcluded,
  stages: {
    // review round 3: honest, graded cross-solver evidence — a single passing
    // case must never imply complete coverage.
    crossSolver: {
      ...crossSolverEvidenceStatus(combinedReports, { requiredIds: requiredCaseIds }),
      declaredScope: suiteArg,
      manifest: { source: 'js/bench/manifest.json', requiredCases: manifestIds.length, phase: manifest.phase },
      requiredCases: requiredCaseIds.length,
      note: 'Cross-solver agreement applies to the BENCHMARK SUITE cases only — it does not transfer to arbitrary user designs (see docs/BENCHMARKING.md §evidence).',
    },
    physicalValidation: { status: 'none', note: 'No physical measurements exist. Numerical agreement with Ngspice/Qiskit is NOT physical validation.' },
    modelCalibration: { status: 'none', note: 'No model parameter has been estimated from measured data.' },
  },
};
await writeFile(path.join(outDir, 'evidence-summary.json'), JSON.stringify(evidence, null, 2));

// combined markdown
const staleLines = (evidence.staleExcludedReports || []).map((st) =>
  `- **Stale report excluded from evidence counts**: suite "${st.suite}" was generated at a different source commit (${st.reason}) — it is not current evidence.`);
const md = [
  '# Invention Lab — independent benchmarking report',
  '',
  `Generated ${evidence.generatedAt} · commit \`${commitSHA}\` · node ${process.version}`,
  '',
  `Engines: ${Object.entries(engines).map(([k, v]) => `${k}=${v?.version ?? 'unavailable'}`).join(' · ')}`,
  '',
  ...(staleLines.length ? ['**Stale reports excluded from evidence counts** (different source commit — not current evidence):', ...staleLines, ''] : []),
  ...combinedReports.map((r) => renderMarkdown(r)),
  '',
  '## Evidence-stage summary',
  '',
  '- **Cross-solver agreement**: ' + evidence.stages.crossSolver.status + ` (${evidence.stages.crossSolver.passed}/${evidence.stages.crossSolver.total} cases passed) — ` + evidence.stages.crossSolver.note,
  '- **Model calibration**: none — no parameter has been estimated from measured data.',
  '- **Physical validation**: none — agreement with an independent numerical solver is not physical validation.',
].join('\n');
await writeFile(path.join(outDir, 'REPORT.md'), md);

console.log(`Artifacts written to ${outDir} (JSON + Markdown).`);
console.log(`Evidence: cross-solver ${evidence.stages.crossSolver.status} (${evidence.stages.crossSolver.passed}/${evidence.stages.crossSolver.total} passed)`);
// exit per policy: --strict (used by CI, which installs the engines) requires
// EVERY case in the required manifest (all 24: 10 ngspice + 14 quantum) to be
// present and passing — skipped/unsupported/inconclusive/model-mismatch/
// missing suites all fail strict CI. Scoped runs (e.g. --suite ngspice) in
// strict mode therefore fail unless the manifest scope is narrowed; the
// declared scope is recorded in the evidence summary. Without --strict
// (local informational runs) only hard failures exit non-zero.
process.exit(exitCodeFor(combinedReports, {
  strict: process.argv.includes('--strict'),
  requiredIds: requiredCaseIds,
  manifestIds,
}));
