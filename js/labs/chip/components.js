// components.js — Chip Lab analog component library.
// Each component carries its model provenance and (where physical) a
// manufacturing tolerance used by Monte Carlo validation.

import { registerComponent } from '../../core/registry.js';

function p(key, label, def, extra = {}) {
  return { key, label, type: 'number', default: def, ...extra };
}
// Analog terminals are bidirectional — dir 'bidi'
const T = (id, name) => ({ id, name, dir: 'bidi', type: 'analog' });

const defs = [
  {
    typeId: 'chip.VSOURCE', lab: 'chip', category: 'Sources', label: 'Voltage Source',
    desc: 'Independent voltage source. DC, sine, or pulse waveform.',
    params: [
      { key: 'mode', label: 'Mode', type: 'select', options: ['dc', 'sine', 'pulse'], default: 'dc' },
      p('dc', 'DC value (V)', 5, { unit: 'V' }),
      p('amp', 'Amplitude (V)', 1, { unit: 'V' }),
      p('freq', 'Frequency (Hz)', 1000, { unit: 'Hz' }),
      p('offset', 'Offset (V)', 0, { unit: 'V' }),
      p('duty', 'Pulse duty', 0.5, { min: 0.01, max: 0.99 }),
    ],
    ports: () => [T('p', '+'), T('n', '-')],
    chip: { kind: 'vsource' },
    validation: { provenance: 'Ideal source: zero output impedance, no sag. Real supplies droop under load — model separately if it matters.' },
  },
  {
    typeId: 'chip.ISOURCE', lab: 'chip', category: 'Sources', label: 'Current Source',
    desc: 'Independent current source delivering `i` out of terminal p into the circuit.',
    params: [p('i', 'Current (A)', 1e-3, { unit: 'A' })],
    ports: () => [T('p', '→out'), T('n', 'ret')],
    chip: { kind: 'isource' },
    validation: { provenance: 'Ideal source: infinite output impedance.' },
  },
  {
    typeId: 'chip.RES', lab: 'chip', category: 'Passives', label: 'Resistor',
    desc: 'Ohmic resistor. Tolerance defaults to ±5% (E24 style).',
    params: [
      p('r', 'Resistance (Ω)', 1000, { unit: 'ohm', tol: 0.05, min: 1e-3 }),
      p('rth', 'Thermal resistance (°C/W)', 100, { noTolRequired: true }),
    ],
    ports: () => [T('p'), T('n')],
    chip: { kind: 'res' },
    validation: { provenance: 'Ohm\'s law (ideal linear). Real resistors add ±tol%, tempco (~100ppm/°C), and parasitic L — not modeled.' },
  },
  {
    typeId: 'chip.CAP', lab: 'chip', category: 'Passives', label: 'Capacitor',
    desc: 'Ideal capacitor. Tolerance defaults to ±10% (class-II ceramic style).',
    params: [
      p('c', 'Capacitance (F)', 100e-9, { unit: 'F', tol: 0.1, min: 1e-15 }),
      p('vInit', 'Initial voltage (V)', 0, { noTolRequired: true }),
    ],
    ports: () => [T('p'), T('n')],
    chip: { kind: 'cap' },
    validation: { provenance: 'Ideal linear C. Real ceramics lose 20-80% under DC bias and with temperature — derate before trusting.' },
  },
  {
    typeId: 'chip.IND', lab: 'chip', category: 'Passives', label: 'Inductor',
    desc: 'Ideal inductor.',
    params: [
      p('l', 'Inductance (H)', 1e-3, { unit: 'H', tol: 0.1, min: 1e-12 }),
      p('iInit', 'Initial current (A)', 0, { noTolRequired: true }),
    ],
    ports: () => [T('p'), T('n')],
    chip: { kind: 'ind' },
    validation: { provenance: 'Ideal linear L. Real inductors saturate and have winding resistance — not modeled.' },
  },
  {
    typeId: 'chip.DIODE', lab: 'chip', category: 'Semiconductors', label: 'Diode',
    desc: 'Shockley ideal diode: Is, emission coefficient n (linearized via Newton).',
    params: [
      p('is', 'Saturation current Is (A)', 1e-12, { unit: 'A', tol: 0.5, min: 1e-18 }),
      p('n', 'Emission coefficient', 1, { noTolRequired: true, min: 0.5, max: 2 }),
    ],
    ports: () => [T('a', 'anode'), T('c', 'cathode')],
    chip: { kind: 'diode' },
    validation: { provenance: 'Shockley ideal-diode equation I=Is(e^(V/nVt)-1). No series resistance, no high-level injection, no reverse breakdown. Real silicon diodes deviate >±10% at high current.' },
  },
  {
    typeId: 'chip.NMOS', lab: 'chip', category: 'Semiconductors', label: 'NMOS (square-law)',
    desc: 'N-channel MOSFET, level-1 square-law model (k, Vth). No body effect.',
    params: [
      p('k', 'Transconductance k (A/V²)', 0.02, { unit: 'A/V^2', tol: 0.2, min: 1e-6 }),
      p('vth', 'Threshold Vth (V)', 2, { unit: 'V', tol: 0.1, min: -10, max: 10 }),
      p('lambda', 'Channel-length mod λ (1/V)', 0.01, { noTolRequired: true, min: 0, max: 1 }),
      p('rth', 'Thermal resistance (°C/W)', 100, { noTolRequired: true }),
    ],
    ports: () => [T('g', 'gate'), T('d', 'drain'), T('s', 'source')],
    chip: { kind: 'nmos' },
    validation: { provenance: 'Square-law (level-1) MOSFET with channel-length modulation λ: Id = k/2·(Vgs-Vth)²(1+λVds) in saturation. No subthreshold slope, no body effect, no velocity saturation, zero capacitances. Expect ±20% vs a real process.' },
  },
  {
    typeId: 'chip.PMOS', lab: 'chip', category: 'Semiconductors', label: 'PMOS (square-law)',
    desc: 'P-channel MOSFET, level-1 square-law model (k, Vth with negative sign).',
    params: [
      p('k', 'Transconductance k (A/V²)', 0.02, { unit: 'A/V^2', tol: 0.2, min: 1e-6 }),
      p('vth', 'Threshold Vth (V)', -2, { unit: 'V', tol: 0.1, min: -10, max: 10 }),
      p('lambda', 'Channel-length mod λ (1/V)', 0.01, { noTolRequired: true, min: 0, max: 1 }),
      p('rth', 'Thermal resistance (°C/W)', 100, { noTolRequired: true }),
    ],
    ports: () => [T('g', 'gate'), T('d', 'drain'), T('s', 'source')],
    chip: { kind: 'pmos' },
    validation: { provenance: 'Square-law (level-1) PMOS with sign-reversed variables and CLM λ; same limitations as NMOS.' },
  },
  {
    typeId: 'chip.OPAMP', lab: 'chip', category: 'Semiconductors', label: 'Op-Amp (ideal)',
    desc: 'Ideal op-amp: Vout = A·(vp - vn), supply rails clip at ±Vcc.',
    params: [
      p('gain', 'Open-loop gain A', 1e5, { noTolRequired: true }),
      p('vcc', 'Rail voltage ±Vcc (V)', 15, { unit: 'V', noTolRequired: true }),
    ],
    ports: () => [T('vp', '+in'), T('vn', '-in'), T('vout', 'out')],
    chip: { kind: 'opamp' },
    validation: { provenance: 'Ideal VCVS with finite gain and rails. No GBW limit, no offset, no slew rate — AC gain above GBW is wrong by construction.' },
  },
  {
    typeId: 'chip.GND', lab: 'chip', category: 'Sources', label: 'Ground',
    desc: 'Reference node (0 V). Every circuit needs exactly one net grounded.',
    params: [],
    ports: () => [T('g', 'gnd')],
    chip: { kind: 'gnd' },
    validation: { provenance: 'Ideal reference node.' },
  },
  {
    typeId: 'chip.VOLTMETER', lab: 'chip', category: 'Instruments', label: 'Voltmeter',
    desc: 'Ideal voltmeter: infinite impedance, records its node voltage.',
    params: [{ key: 'name', label: 'Label', type: 'text', default: 'V' }],
    ports: () => [T('p', 'probe')],
    chip: { kind: 'voltmeter' },
    validation: { provenance: 'Ideal instrument: infinite impedance, infinite bandwidth.' },
  },
  {
    typeId: 'chip.AMMETER', lab: 'chip', category: 'Instruments', label: 'Ammeter',
    desc: 'Ideal ammeter: 0 V series element, records current through it (p → n).',
    params: [{ key: 'name', label: 'Label', type: 'text', default: 'A' }],
    ports: () => [T('p', 'in'), T('n', 'out')],
    chip: { kind: 'ammeter' },
    validation: { provenance: 'Ideal instrument: zero series impedance.' },
  },
];

for (const d of defs) registerComponent(d);
