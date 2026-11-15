# Plugin API

Invention Lab is extensible through one global registry. A plugin is any ES module that calls the
registration functions and is imported from `js/plugins/index.js` (add **one line**). The UI
discovers labs, components and examples automatically — no core changes, no rebuild.

```js
// js/plugins/index.js
import './your-lab/index.js';
```

The Optics Lab (`js/plugins/optics/index.js`) is a complete working example: a new lab with three
components, validation checks, a report and a shipped example — built only on the public API.

## The three registries

```js
import { registerComponent, registerLab, registerExample } from '../core/registry.js';
```

| Function | Registers | Discovered by |
|---|---|---|
| `registerComponent(def)` | one component type | palette, canvas, inspector, engines |
| `registerLab(lab)` | one lab (a tab) | lab tabs, run/report pipeline |
| `registerExample(ex)` | one example project | Examples menu |

## Component definition

```js
registerComponent({
  typeId: 'optics.LENS',          // globally unique
  lab: 'optics',                  // which lab's palette it appears in
  category: 'Optics',             // palette grouping
  label: 'Thin Lens',
  desc: 'Ideal thin lens, focal length f, aperture a.',
  params: [
    { key: 'f', label: 'Focal length (mm)', type: 'number', default: 40,
      tol: 0.02,                  // ±2% manufacturing tolerance -> used by Monte Carlo
      min: 0.001 },
    // type: 'number' | 'text' | 'select' | 'checkbox' | 'textarea'
    // noTolRequired: true  -> abstract params (delays, labels) exempt from the
    //                         "no tolerance data" assumption report
  ],
  ports: (params) => [
    { id: 'in',  name: 'in',  dir: 'in',  type: 'optics' },   // dir: 'in'|'out'|'bidi'
    { id: 'out', name: 'out', dir: 'out', type: 'optics' },
  ],
  draw: ')(  ',                   // short glyph on the block body
  optics: { kind: 'lens' },       // optional lab-private payload (chip uses chip:{kind}, etc.)
  validation: {
    provenance: 'Thin-lens equation 1/u + 1/v = 1/f (paraxial). No aberrations.',
  },
});
```

Connection rule: an output port may connect to an input port (`out→in`; `bidi` matches either),
and the `type` strings must be equal (or `'any'`).

## Lab definition

```js
registerLab({
  id: 'optics',                  // unique
  label: 'Optics Lab',           // tab caption
  blurb: 'Paraxial thin-lens optics…',
  accent: '#5fd4d0',             // tab/palette accent color
  metaSchema: [ /* lab-level settings rendered in the inspector */ ],
  hasCanvas: true,               // false -> center panel instead of canvas (see app.js)

  /** Run the design. Called by the ▶ Run button and the report. */
  run(diagram, opts) { /* your engine here; return { ok, ...result, warnings, problems } */ },

  /** Design validation. Return checks[]; assembleReport adds assumptions + provenance. */
  validate(diagram) {
    return [
      makeCheck({ name: 'Lens formula', actual: 1/u + 1/v, expected: 1/f, abs: 1e-9 }),
      { name: 'Paraxial honesty', verdict: 'warn', note: '…' },
      unknownCheck('…'), // verdict 'unknown' — never silently passes
    ];
  },

  report(diagram) { return assembleReport({ diagram, checks: this.validate(diagram) }); },
});
```

### Check verdicts

| Verdict | Meaning | Badge |
|---|---|---|
| `pass` | within stated tolerance, evidence attached | ✔ |
| `warn` | marginal, or an honesty qualifier (e.g. "analytical model") | ⚠ |
| `fail` | outside tolerance — the design does not validate | ✘ |
| `unknown` | no validated model covers this — never treated as a pass | ? |

The design verdict is the worst of its checks. Assumptions (blocks without provenance, numeric
parameters without tolerance) are collected automatically by `collectAssumptions`.

## Validation helpers (`js/core/validation.js`)

- `makeCheck({ name, actual, expected, abs, rel, verdict, note, evidence })`
- `monteCarlo({ n, rng, draw, run, metric })`, `sampleParam(spec, rng)`
- `mulberry32(seed)` — deterministic RNG (use it so your claims are reproducible)
- `assembleReport({ diagram, checks })`, `collectAssumptions(diagram)`

## Example projects

```js
registerExample({
  id: 'optics-lens-demo',
  label: 'Optics: converging lens (plugin demo)',
  lab: 'optics',
  blurb: '…',
  getJSON: () => diagram.toJSON(),   // build with the Diagram API -> always schema-valid
});
```

## Canvas integration (optional)

If your lab uses the shared canvas editor, port types drive wiring and `def.draw` decorates
blocks. Multi-wire components (like quantum's CNOT) pair input/output ports via a
`passThrough: { cin: 'cout', tin: 'tout' }` map so wire-chains can be walked left-to-right.

## Rules of the house

1. **Declare provenance for every model** and tolerances for physical parameters — otherwise your
   own components show up as "unknown" in reports. That's the point.
2. **Refuse what you cannot compute** (throw with a clear message) instead of returning numbers
   that look authoritative but aren't.
3. **Seed every random process** and expose the seed as a parameter.
4. **Test in Node.** Engines must not touch the DOM; put UI-only code in `js/ui/`.
