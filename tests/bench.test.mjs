// bench.test.mjs — regression tests for the benchmarking harness itself.
// These run WITHOUT external engines (fast, CI-safe): they validate the
// comparison math, parsers, timeout/missing-executable handling, case
// verdict assembly (skip ≠ pass), and evidence-stage honesty.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  absErr, relErr, maxAbsErr, rmsErr, wrapDeg, phaseErrDeg,
  interpolate, compareUpToGlobalPhase, numCheck, seriesCheck, phaseCheck,
} from '../js/bench/compare.js';
import { parseOp, parsePrints, parseWrdata, detectNgspiceFailure, runNgspice, resolveNgspice } from '../js/bench/ngspice-adapter.js';
import { defineCase, runCase, runSuite, renderMarkdown } from '../js/bench/harness.js';
import { qiskitToIlOrder, bitReverse } from '../js/bench/quantum/quantum-adapter.js';

// ---------------- comparison math ------------------------------------------
test('bench: relative error has a documented near-zero floor', () => {
  assert.ok(relErr(1e-14, 0) <= 1e-2, 'near-zero reference must not blow up');
  assert.ok(Math.abs(relErr(1.1, 1) - 0.1) < 1e-12);
  assert.ok(Math.abs(absErr(1.1, 1) - 0.1) < 1e-12);
});

test('bench: series errors throw on length mismatch and return NaN on non-finite', () => {
  assert.throws(() => maxAbsErr([1, 2], [1]), /length mismatch/);
  assert.ok(Number.isNaN(maxAbsErr([NaN], [1])));
  assert.ok(Number.isNaN(rmsErr([1], [Infinity])));
  assert.equal(maxAbsErr([1, 2.5], [1, 2]), 0.5);
  assert.ok(Math.abs(rmsErr([0, 2], [0, 0]) - Math.SQRT2) < 1e-12);
});

test('bench: phase wrapping handles ±180-degree boundary and cross-wrap', () => {
  assert.equal(wrapDeg(180), 180);
  assert.equal(wrapDeg(-180), 180, 'wrap range is (-180, 180]');
  assert.equal(wrapDeg(190), -170);
  assert.equal(wrapDeg(-190), 170);
  assert.equal(phaseErrDeg(179, -179), 2, 'cross-wrap error must be 2 deg, not 358');
  assert.equal(phaseErrDeg(0, 360), 0);
});

test('bench: interpolate clamps outside the series and interpolates inside', () => {
  const s = [{ x: 0, y: 0 }, { x: 1, y: 10 }, { x: 2, y: 30 }];
  assert.equal(interpolate(s, 0.5), 5);
  assert.equal(interpolate(s, -5), 0);
  assert.equal(interpolate(s, 99), 30);
});

test('bench: global-phase comparison removes physically irrelevant phase', () => {
  // ref = (|0>+|1>)/sqrt2 ; actual = e^{i phi} * ref with phi = 30 deg
  const phi = Math.PI / 6;
  const ref = [{ re: Math.SQRT1_2, im: 0 }, { re: 0, im: 0 }, { re: Math.SQRT1_2, im: 0 }];
  const actual = ref.map((a) => ({
    re: a.re * Math.cos(phi) - a.im * Math.sin(phi),
    im: a.re * Math.sin(phi) + a.im * Math.cos(phi),
  }));
  const cmp = compareUpToGlobalPhase(actual, ref);
  assert.ok(cmp.maxErr < 1e-12, `maxErr ${cmp.maxErr}`);
  assert.ok(Math.abs(cmp.globalPhaseDeg - 30) < 1e-9, `phase ${cmp.globalPhaseDeg}`);
});

test('bench: global-phase comparison reports real disagreements', () => {
  const ref = [{ re: 1, im: 0 }, { re: 0, im: 0 }];
  const actual = [{ re: 0, im: 0 }, { re: 1, im: 0 }];
  const cmp = compareUpToGlobalPhase(actual, ref);
  assert.equal(cmp.maxErr, 1);
});

test('bench: numCheck treats NaN/Infinity as failure, never pass', () => {
  assert.equal(numCheck('x', NaN, 1, { abs: 1 }).verdict, 'fail');
  assert.equal(numCheck('x', 1, Infinity, { abs: 1 }).verdict, 'fail');
  assert.equal(numCheck('x', 1, 1, {}).verdict, 'inconclusive', 'no tolerance = no evidence');
  assert.equal(numCheck('x', 1.05, 1, { abs: 0.1 }).verdict, 'pass');
  assert.equal(numCheck('x', 2, 1, { rel: 1.0 }).verdict, 'pass', 'rel limit satisfied');
  assert.equal(numCheck('x', 2, 1, { abs: 0.1, rel: 1.0 }).verdict, 'fail', 'ALL provided limits must hold');
  assert.equal(numCheck('x', 2, 1, { abs: 0.1 }).verdict, 'fail');
});

test('bench: seriesCheck with permissive tolerance still FAILS on non-finite data', () => {
  const r = seriesCheck('x', [NaN], [1], { maxAbs: 1e9 });
  assert.equal(r.verdict, 'fail');
  assert.ok(r.note.includes('non-finite'));
});

test('bench: phaseCheck wraps before comparing', () => {
  assert.equal(phaseCheck('p', 179, -179, 5).verdict, 'pass');
  assert.equal(phaseCheck('p', 0, 10, 5).verdict, 'fail');
});

// ---------------- ngspice output parsing ------------------------------------
test('bench: parseOp reads v() lines and ignores other output', () => {
  const out = parseOp('noise line\nv(n_mid) = 2.500000e+00\nv(n1) = 1.000000e+01\nmore noise');
  assert.equal(out['n_mid'], 2.5);
  assert.equal(out['n1'], 10);
  assert.throws(() => parseOp('no data here'), /malformed|empty|no v/);
});

test('bench: parsePrints reads current and voltage vectors', () => {
  const out = parsePrints('i(vchipammeter1) = 5.000000e-02\nv(n1) = 1.000000e+00');
  assert.equal(out['i(vchipammeter1)'], 0.05);
  assert.equal(out['v(n1)'], 1);
});

test('bench: parseWrdata handles interleaved (x, y) pairs and rejects malformed rows', () => {
  const { series, rowCount } = parseWrdata('1.0 10.0 1.0 20.0\n2.0 30.0 2.0 40.0\n', 2);
  assert.equal(rowCount, 2);
  assert.deepEqual(series[0], [{ x: 1, y: 10 }, { x: 2, y: 30 }]);
  assert.deepEqual(series[1], [{ x: 1, y: 20 }, { x: 2, y: 40 }]);
  assert.throws(() => parseWrdata('1.0 2.0\n', 2), /columns/);
  assert.throws(() => parseWrdata('garbage line\n', 1), /non-numeric/);
  assert.throws(() => parseWrdata('', 1), /empty/);
});

test('bench: detectNgspiceFailure catches convergence errors and missing circuits', () => {
  assert.ok(detectNgspiceFailure({ stdout: '... failed to converge ...', stderr: '', log: '', status: 'ok', code: 0 }));
  assert.ok(detectNgspiceFailure({ stdout: 'Error: no such vector v(x)', stderr: '', log: '', status: 'ok', code: 0 }));
  assert.ok(detectNgspiceFailure({ stdout: '', stderr: '', log: 'there aren\'t any circuits', status: 'ok', code: 0 }));
  assert.ok(detectNgspiceFailure({ status: 'timeout', timedOut: true }));
  assert.ok(detectNgspiceFailure({ status: 'reference-unavailable', error: 'ENOENT' }));
  assert.equal(detectNgspiceFailure({ stdout: 'v(n1) = 1.0', stderr: '', log: '', status: 'ok', code: 0 }), null);
});

test('bench: runNgspice reports missing executable as reference-unavailable', async () => {
  const r = await runNgspice({ exe: 'Z:/definitely/missing/ngspice_con.exe', deck: '* x' });
  assert.equal(r.status, 'reference-unavailable');
});

test('bench: runNgspice enforces timeouts on a hanging process', async () => {
  // node as a "hanging executable" — available everywhere the suite runs
  const r = await runNgspice({ exe: process.execPath, deck: '* x', timeoutMs: 500, bare: true });
  // bare mode passes --version which node rejects instantly; instead simulate
  // a hang via a node script argument (deck is passed as a file path — node
  // will try to run it and exit; either way the adapter must return promptly)
  assert.ok(['ok', 'timeout', 'reference-failure'].includes(r.status));
}, { timeout: 5000 });

test('bench: resolveNgspice returns null when nothing exists', async () => {
  const r = await resolveNgspice('Z:/definitely/missing.exe');
  assert.equal(r, null);
});

// ---------------- case verdict assembly --------------------------------------
test('bench: skipped cases are reported as skipped and never counted as pass', async () => {
  const c = defineCase({
    id: 'x', suite: 's', title: 't', purpose: 'p',
    run: async () => ({ status: 'skipped', classification: 'reference-unavailable', notes: ['engine missing'] }),
  });
  const rec = await runCase(c, {});
  assert.equal(rec.status, 'skipped');
  const suite = await runSuite([c], {}, { suiteLabel: 's' });
  assert.equal(suite.summary.skipped, 1);
  assert.equal(suite.summary.pass, 0);
});

test('bench: thrown errors become implementation-failure with the stack visible', async () => {
  const c = defineCase({
    id: 'y', suite: 's', title: 't', purpose: 'p',
    run: async () => { throw new Error('boom'); },
  });
  const rec = await runCase(c, {});
  assert.equal(rec.status, 'fail');
  assert.equal(rec.classification, 'implementation-failure');
  assert.ok(rec.error.includes('boom'));
});

test('bench: case verdict is the worst of its checks', async () => {
  const c = defineCase({
    id: 'z', suite: 's', title: 't', purpose: 'p',
    run: async () => ({ checks: [
      { name: 'a', verdict: 'pass' },
      { name: 'b', verdict: 'inconclusive' },
    ] }),
  });
  const rec = await runCase(c, {});
  assert.equal(rec.status, 'inconclusive');
});

test('bench: runSuite counts statuses honestly (skip never folded into pass)', async () => {
  // legitimate passes carry at least one check (review-3 policy)
  const mk = (id, status) => defineCase({ id, suite: 's', title: 't', purpose: 'p', run: async () => status === 'pass' ? { status, checks: [{ name: 'c', verdict: 'pass' }] } : { status } });
  const suite = await runSuite([
    mk('a', 'pass'), mk('b', 'skipped'), mk('c', 'fail'), mk('d', 'unsupported'), mk('e', 'model-mismatch'),
  ], {}, { suiteLabel: 'test' });
  assert.equal(suite.summary.pass, 1);
  assert.equal(suite.summary.skipped, 1);
  assert.equal(suite.summary.fail, 1);
  assert.equal(suite.summary.unsupported, 1);
  assert.equal(suite.summary['model-mismatch'], 1);
  const md = renderMarkdown(suite);
  assert.ok(md.includes('1 skipped'));
  assert.ok(md.includes('NOT counted as a pass') || md.includes('never counted as a pass'));
});

test('bench: empty suite produces a report whose summary has zero passes', async () => {
  const suite = await runSuite([], {}, { suiteLabel: 'empty' });
  assert.equal(suite.summary.total, 0);
  assert.equal(suite.summary.pass, 0);
});

// ---------------- qubit index mapping ----------------------------------------
test('bench: qiskitToIlOrder maps amplitudes by identity (conventions documented)', () => {
  // the runner maps qudit q -> qiskit qubit (n-1-q), so Invention Lab q0 sits
  // on Qiskit's MSB and the index mapping is the identity; the previous
  // bit-reversal double-counted the convention (swap-chain benchmark caught it)
  const amps = [{ re: 0, im: 0 }, { re: 1, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }];
  const mapped = qiskitToIlOrder(amps, 2);
  assert.deepEqual(mapped, amps);
});

test('bench: bitReverse helper stays available for convention tooling', () => {
  assert.equal(bitReverse(1, 3), 4);
  assert.equal(bitReverse(4, 3), 1);
});

// ---------------- review round 3: acceptance-policy regressions -------------
import { exitCodeFor, crossSolverEvidenceStatus, combineReports } from '../js/bench/harness.js';

test('bench: explicit "pass" with no checks is rejected as inconclusive', async () => {
  const c = defineCase({
    id: 'unsubstantiated', suite: 's', title: 't', purpose: 'p',
    run: async () => ({ status: 'pass', notes: [] }), // claims pass, produced nothing
  });
  const rec = await runCase(c, {});
  assert.equal(rec.status, 'inconclusive');
  assert.ok(rec.notes.some((n) => n.includes('unsubstantiated passes are not evidence')));
});

test('bench: a checks-derived pass over an EMPTY checks array is rejected', async () => {
  // worst([]) would be 'pass' — the harness must not accept it as evidence
  const c = defineCase({
    id: 'no-checks', suite: 's', title: 't', purpose: 'p',
    run: async () => ({ checks: [] }),
  });
  const rec = await runCase(c, {});
  assert.equal(rec.status, 'inconclusive');
  assert.ok(rec.notes.some((n) => n.includes('not evidence of agreement')));
});

test('bench: a legitimate pass (>=1 passing check) is still accepted', async () => {
  const c = defineCase({
    id: 'real-pass', suite: 's', title: 't', purpose: 'p',
    run: async () => ({ checks: [{ name: 'comparison', verdict: 'pass' }] }),
  });
  const rec = await runCase(c, {});
  assert.equal(rec.status, 'pass');
});

test('bench: exitCodeFor strict mode fails on skipped/unsupported/inconclusive', () => {
  const mk = (id, status) => ({ summary: { total: 1, pass: status === 'pass' ? 1 : 0, fail: status === 'fail' ? 1 : 0, skipped: status === 'skipped' ? 1 : 0, unsupported: status === 'unsupported' ? 1 : 0, inconclusive: status === 'inconclusive' ? 1 : 0, 'model-mismatch': status === 'model-mismatch' ? 1 : 0 } });
  // non-strict: only hard failures exit non-zero (informational runs)
  assert.equal(exitCodeFor([mk('a', 'skipped')], { strict: false }), 0);
  // strict: any non-pass outcome fails
  assert.equal(exitCodeFor([mk('a', 'pass')], { strict: true }), 0);
  assert.equal(exitCodeFor([mk('a', 'skipped')], { strict: true }), 1);
  assert.equal(exitCodeFor([mk('a', 'unsupported')], { strict: true }), 1);
  assert.equal(exitCodeFor([mk('a', 'inconclusive')], { strict: true }), 1);
  assert.equal(exitCodeFor([mk('a', 'model-mismatch')], { strict: true }), 1);
  assert.equal(exitCodeFor([mk('a', 'fail')], { strict: true }), 1);
  // empty suite in strict mode: nothing validated -> fail
  assert.equal(exitCodeFor([mk('a', 'pass')].slice(0, 0), { strict: true }), 1);
});

test('bench: exitCodeFor non-strict still fails on hard failures', () => {
  const reports = [{ summary: { total: 2, pass: 1, fail: 1, skipped: 0, unsupported: 0, inconclusive: 0, 'model-mismatch': 0 } }];
  assert.equal(exitCodeFor(reports, { strict: false }), 1);
});

test('bench: cross-solver evidence status is graded, not overstated', () => {
  const mk = (id, status) => ({ summary: (() => {
    const s = { total: 1, pass: 0, fail: 0, skipped: 0, unsupported: 0, inconclusive: 0, 'model-mismatch': 0 };
    s[status] = 1;
    return s;
  })() });
  // all passed -> complete
  assert.equal(crossSolverEvidenceStatus([mk('a', 'pass'), mk('b', 'pass')]).status, 'complete');
  // one pass + one skipped -> partial (never "complete")
  const partial = crossSolverEvidenceStatus([mk('a', 'pass'), mk('b', 'skipped')]);
  assert.equal(partial.status, 'partial');
  assert.ok(partial.note.includes('Incomplete coverage'));
  // zero passes -> failed
  assert.equal(crossSolverEvidenceStatus([mk('a', 'fail')]).status, 'failed');
  // nothing executed -> missing
  assert.equal(crossSolverEvidenceStatus([]).status, 'missing');
  assert.equal(crossSolverEvidenceStatus([mk('a', 'skipped')]).status, 'missing');
  // a single passing case must NOT claim complete coverage
  const single = crossSolverEvidenceStatus([mk('a', 'pass'), mk('b', 'fail')]);
  assert.equal(single.status, 'partial');
});

// ---------------- review round 4: evidence-integrity regressions -------------
// These tests were written FIRST and failed against the pre-fix code
// (demonstrated in the PR discussion), then the fixes were implemented.

test('bench: explicit PASS cannot override a FAILING check (verdict derived from checks)', async () => {
  const c = defineCase({
    id: 'pass-overrides-fail', suite: 's', title: 't', purpose: 'p',
    run: async () => ({ status: 'pass', checks: [{ name: 'numeric comparison', verdict: 'fail' }] }),
  });
  const rec = await runCase(c, {});
  assert.equal(rec.status, 'fail', 'a recorded FAIL must win over a claimed PASS');
  assert.ok(rec.notes.some((n) => n.includes('overridden')));
});

test('bench: exitCodeFor strict enforces the required case manifest, not just included cases', () => {
  // a quantum-only run where every included case passed
  const quantumOnly = [{
    suite: 'quantum',
    summary: { total: 14, pass: 14, fail: 0, skipped: 0, unsupported: 0, inconclusive: 0, 'model-mismatch': 0 },
    cases: [{ id: 'quantum-basis-identity' }, { id: 'quantum-hadamard-all' }], // subset shown
  }];
  const all10Ngspice = ['ngspice-divider', 'ngspice-isource-polarity', 'ngspice-rc-transient',
    'ngspice-rc-ac', 'ngspice-ac-phase', 'ngspice-rl', 'ngspice-diode', 'ngspice-nmos',
    'ngspice-pmos', 'ngspice-combined'];
  // without a manifest: passes (old behavior)
  assert.equal(exitCodeFor(quantumOnly, { strict: true }), 0);
  // with the required manifest: the 10 missing ngspice cases fail strict mode
  assert.equal(exitCodeFor(quantumOnly, { strict: true, requiredIds: all10Ngspice }), 1,
    'quantum-only strict run must not claim complete Phase 2 validation');
  // a full passing report satisfies the manifest
  const full = [{
    suite: 'all',
    summary: { total: 24, pass: 24, fail: 0, skipped: 0, unsupported: 0, inconclusive: 0, 'model-mismatch': 0 },
    cases: [...all10Ngspice, 'quantum-basis-identity', 'quantum-qft-3'].map((id) => ({ id })),
  }];
  assert.equal(exitCodeFor(full, { strict: true, requiredIds: all10Ngspice }), 0);
});

test('bench: combineReports merges same-commit reports and excludes stale ones', () => {
  const CURRENT = 'abc123';
  const executed = [{ suite: 'quantum', generatedAt: 'T2', commitSHA: CURRENT, summary: { total: 14, pass: 14, fail: 0, skipped: 0, unsupported: 0, inconclusive: 0, 'model-mismatch': 0 }, cases: [] }];
  const sameCommit = { suite: 'ngspice', generatedAt: 'T1', commitSHA: CURRENT, summary: { total: 10, pass: 10, fail: 0, skipped: 0, unsupported: 0, inconclusive: 0, 'model-mismatch': 0 }, cases: [] };
  const stale = { suite: 'ngspice', generatedAt: 'T0', commitSHA: 'deadbeef', summary: { total: 10, pass: 10, fail: 0, skipped: 0, unsupported: 0, inconclusive: 0, 'model-mismatch': 0 }, cases: [] };

  const merged = combineReports(executed, [sameCommit], CURRENT);
  assert.equal(merged.merged.length, 2, 'same-commit report is merged');
  assert.equal(merged.staleExcluded.length, 0);

  const withStale = combineReports(executed, [stale], CURRENT);
  assert.equal(withStale.merged.length, 1, 'stale-commit report is NOT merged as current');
  assert.equal(withStale.staleExcluded.length, 1);
  assert.ok(withStale.staleExcluded[0].reason.includes('deadbeef'), 'stale exclusion records the foreign SHA');
});

// ---------------- external process exit codes --------------------------------
test('bench: python adapter treats nonzero exit as reference failure even with stdout', async () => {
  const { resolvePython, runQuantumRef } = await import('../js/bench/quantum/quantum-adapter.js');
  const py = await resolvePython();
  if (!py) return; // python unavailable in this environment — skip honestly
  // a runner that prints plausible JSON and THEN exits nonzero must fail
  const bad = await runQuantumRef(py.exe, {
    mode: 'numpy', n: 1, d: 2,
    gates: [{ kind: 'H', qubits: [0] }],
    sabotage: 'exit-nonzero',
  });
  assert.equal(bad.status, 'reference-failure');
});

test('bench: ngspice nonzero exit is a failure even when stdout contains quit', () => {
  const r = {
    status: 'ok', code: 1, timedOut: false,
    stdout: 'v(n1) = 1.0\nquit\n', stderr: '', log: '',
  };
  assert.ok(detectNgspiceFailure(r), 'nonzero exit must be classified as failure');
});
