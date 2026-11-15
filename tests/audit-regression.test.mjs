// audit-regression.test.mjs
// Independent regression checks for Invention Lab at commit ef76a5b.
// Reconstructed replacement for the unavailable download.
// These tests intentionally assert desired behavior and expose known defects.
// Save this file under tests/ and run: node --test tests/audit-regression.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';

import '../js/labs/chip/components.js';
import '../js/labs/logic/components.js';
import '../js/labs/quantum/components.js';

import { Diagram } from '../js/core/diagram.js';
import { assembleReport, makeCheck } from '../js/core/validation.js';
import { getComponent } from '../js/core/registry.js';
import { chipLab } from '../js/labs/chip/lab.js';
import { logicLab } from '../js/labs/logic/lab.js';
import { quantumLab } from '../js/labs/quantum/lab.js';
import { solveDC } from '../js/labs/chip/engine.js';
import { toSpiceDeck } from '../js/labs/chip/spice-export.js';

function makeResistorCircuit({ resistance = 1000, voltage = 5 } = {}) {
  const d = new Diagram({ lab: 'chip', name: 'Resistor reference' });
  const src = d.addBlock('chip.VSOURCE', { params: { mode: 'dc', dc: voltage } });
  const r = d.addBlock('chip.RES', { params: { r: resistance } });
  const gnd = d.addBlock('chip.GND');
  d.connect(src.id, 'p', r.id, 'p');
  d.connect(r.id, 'n', gnd.id, 'g');
  d.connect(src.id, 'n', gnd.id, 'g');
  return { d, src, r, gnd };
}

test('audit: unknown physical assumptions must prevent unconditional PASS', () => {
  const d = new Diagram({ lab: 'chip', name: 'Uncalibrated source' });
  d.addBlock('chip.VSOURCE'); // numeric source parameters lack tolerances
  const report = assembleReport({
    diagram: d,
    checks: [makeCheck({ name: 'Arithmetic sanity', actual: 1, expected: 1 })],
  });
  assert.ok(report.assumptions.length > 0, 'test requires documented unknown assumptions');
  assert.notEqual(report.verdict, 'pass',
    'An uncalibrated design must not receive an unconditional PASS');
});

test('audit: separable |00> state must not be called maximally entangled', () => {
  const d = new Diagram({
    lab: 'quantum', name: 'Separable two-qubit state',
    meta: { d: 2, shots: 100, seed: 7 },
  });
  d.addBlock('quantum.WIRE', { x: 0, y: 0 });
  d.addBlock('quantum.WIRE', { x: 0, y: 100 });
  // No gates: state is exactly |00>, a product state.
  const report = quantumLab.report(d);
  const falsePositive = report.checks.find(check =>
    check.verdict === 'pass' &&
    (/entanglement/i.test(check.name) || /maximally entangled/i.test(check.note || ''))
  );
  assert.equal(falsePositive, undefined,
    'A zero cross-term probability is not an entanglement witness by itself');
});

test('audit: SPICE export must preserve a custom MOSFET threshold voltage', () => {
  const d = new Diagram({ lab: 'chip', name: 'Custom NMOS' });
  d.addBlock('chip.NMOS', { params: { vth: 0.75, k: 0.012 } });
  const deck = toSpiceDeck(d);
  assert.match(deck, /\bVto=0\.75\b/i,
    'SPICE model must use the configured 0.75 V threshold, not a hard-coded 2 V');
});

test('audit: SPICE current-source direction must match internal solver', () => {
  const d = new Diagram({ lab: 'chip', name: 'Current-source polarity' });
  const src = d.addBlock('chip.ISOURCE', { params: { i: 0.001 } });
  const r = d.addBlock('chip.RES', { params: { r: 1000 } });
  const gnd = d.addBlock('chip.GND');
  d.connect(src.id, 'p', r.id, 'p');
  d.connect(r.id, 'n', gnd.id, 'g');
  d.connect(src.id, 'n', gnd.id, 'g');

  const solved = solveDC(d);
  assert.equal(solved.ok, true, (solved.problems || []).join('; '));
  assert.ok(Object.values(solved.nodes).some(v => Math.abs(v - 1) < 1e-4),
    'Internal model should deliver +1 V across a 1 kOhm resistor');

  const line = toSpiceDeck(d).split('\n').find(x => x.startsWith('I' + src.id + ' '));
  assert.ok(line, 'Expected SPICE current-source line');
  const fields = line.trim().split(/\s+/);
  const from = fields[1], to = fields[2], value = Number(fields[4]);
  assert.equal(fields[3].toUpperCase(), 'DC');
  assert.ok(
    (from === '0' && to !== '0' && value > 0) ||
    (from !== '0' && to === '0' && value < 0),
    'Exported current source must inject positive current into its p terminal'
  );
});

test('audit: AC voltage-source mode must be available in the component UI', () => {
  const def = getComponent('chip.VSOURCE');
  const mode = def.params.find(p => p.key === 'mode');
  assert.ok(mode?.options?.includes('ac'),
    'The AC solver requires mode=ac, but the UI does not offer it');
});

test('audit: DC parameter overrides must not mutate the original diagram', () => {
  const { d, r } = makeResistorCircuit();
  const before = JSON.stringify(d.toJSON());
  const result = solveDC(d, { paramOverrides: { [r.id]: { r: 1500 } } });
  assert.equal(result.ok, true, (result.problems || []).join('; '));
  assert.equal(r.params.r, 1000, 'The original resistor value must stay at 1000 Ohms');
  assert.equal(JSON.stringify(d.toJSON()), before, 'The original design must be immutable');
});

test('audit: unsupported requested AC analysis must not receive a PASS report', () => {
  const d = new Diagram({
    lab: 'chip', name: 'Unsupported diode AC analysis', meta: { analysis: 'ac' },
  });
  const src = d.addBlock('chip.VSOURCE', { params: { mode: 'ac', amp: 1, dc: 5 } });
  const r = d.addBlock('chip.RES', { params: { r: 1000 } });
  const diode = d.addBlock('chip.DIODE');
  const gnd = d.addBlock('chip.GND');
  d.connect(src.id, 'p', r.id, 'p');
  d.connect(r.id, 'n', diode.id, 'a');
  d.connect(diode.id, 'c', gnd.id, 'g');
  d.connect(src.id, 'n', gnd.id, 'g');

  const execution = chipLab.run(d);
  assert.equal(execution.ok, false, 'Nonlinear AC analysis is unsupported');
  const report = chipLab.report(d);
  assert.notEqual(report.verdict, 'pass',
    'Validation must reflect failure of the requested AC analysis');
});

test('audit: disconnected logic inputs must not receive a PASS report', () => {
  const d = new Diagram({ lab: 'logic', name: 'Disconnected AND', meta: { radix: 4 } });
  d.addBlock('logic.AND'); // Both input ports are unconnected.
  const report = logicLab.report(d);
  assert.notEqual(report.verdict, 'pass',
    'An AND gate with undriven inputs is not a validated circuit');
});

test('audit: MOSFET power and temperature must use drain-source voltage', () => {
  const d = new Diagram({ lab: 'chip', name: 'Conducting NMOS' });
  const src = d.addBlock('chip.VSOURCE', { params: { mode: 'dc', dc: 5 } });
  const r = d.addBlock('chip.RES', { params: { r: 1000 } });
  const mos = d.addBlock('chip.NMOS', {
    params: { k: 0.02, vth: 2, lambda: 0.01, rth: 100 },
  });
  const gnd = d.addBlock('chip.GND');
  d.connect(src.id, 'p', r.id, 'p');
  d.connect(r.id, 'n', mos.id, 'd');
  d.connect(src.id, 'p', mos.id, 'g');
  d.connect(mos.id, 's', gnd.id, 'g');
  d.connect(src.id, 'n', gnd.id, 'g');

  const solved = solveDC(d);
  assert.equal(solved.ok, true, (solved.problems || []).join('; '));
  const device = solved.elements.find(e => e.blockId === mos.id);
  assert.ok(device, 'MOSFET must appear in element report');
  assert.ok(Math.abs(device.i) > 1e-4, 'MOSFET should conduct');
  assert.ok(device.power > 1e-6, 'Conducting MOSFET with Vds > 0 dissipates power');
  assert.ok(device.tempC > 25, 'Junction temperature should rise above ambient');
});
