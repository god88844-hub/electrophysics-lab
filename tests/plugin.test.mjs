// plugin.test.mjs — the Optics plugin lab (demonstrates the plugin API).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import '../js/plugins/optics/index.js';
import { getLab, allLabs, getComponent, getExample } from '../js/core/registry.js';
import { Diagram } from '../js/core/diagram.js';

test('plugin: optics lab auto-registers into the global registry', () => {
  const lab = getLab('optics');
  assert.ok(lab, 'optics lab missing from registry');
  assert.ok(allLabs().some((l) => l.id === 'optics'));
  assert.ok(getComponent('optics.LENS'), 'lens component registered');
  assert.ok(getExample('optics-lens-demo'), 'plugin example registered');
});

function lensDiagram(u = 60, f = 40, d = 120) {
  const json = getExample('optics-lens-demo').getJSON();
  const dg = Diagram.fromJSON(json);
  dg.block('opticsSOURCE1').params.u = u;
  dg.block('opticsLENS1').params.f = f;
  dg.block('opticsSCREEN1').params.d = d;
  return dg;
}

test('plugin: thin lens equation — u=60, f=40 -> v=120, m=-2', () => {
  const res = getLab('optics').run(lensDiagram(60, 40, 120));
  assert.equal(res.ok, true, res.problems?.join('; '));
  assert.ok(Math.abs(res.v - 120) < 1e-9);
  assert.ok(Math.abs(res.m - (-2)) < 1e-9);
  // screen at exactly the image plane -> diffraction-limited spot ~ 0
  assert.ok(res.spot < 1e-9);
});

test('plugin: object at focal point -> image at infinity (honest warning)', () => {
  const res = getLab('optics').run(lensDiagram(40, 40, 120));
  assert.equal(res.ok, true);
  assert.equal(res.v, Infinity);
  assert.ok(res.warnings.some((w) => w.includes('infinity')));
});

test('plugin: virtual image when u < f (magnifier case)', () => {
  const res = getLab('optics').run(lensDiagram(20, 40, 120));
  assert.equal(res.ok, true);
  // v = 1/(1/40 - 1/20) = -40 -> virtual
  assert.ok(res.v < 0, `v should be negative, got ${res.v}`);
});

test('plugin: lab validation passes and includes the lens-formula check', () => {
  const report = getLab('optics').report(lensDiagram());
  const check = report.checks.find((c) => c.name.includes('Thin-lens formula'));
  assert.equal(check.verdict, 'pass');
  assert.equal(report.verdict, 'warn'); // paraxial honesty warning
});
