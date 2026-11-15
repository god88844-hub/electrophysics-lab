// units.js — SI unit system shared across all labs.
// Every physical quantity in Invention Lab is a Quantity: a number plus a unit.
// Conversions are exact within a dimension; cross-dimension conversion throws.

// Dimension table: unit symbol -> { dim, factor }  (factor converts to SI base)
const UNITS = {
  // length
  m: { dim: 'length', factor: 1 }, mm: { dim: 'length', factor: 1e-3 },
  um: { dim: 'length', factor: 1e-6 }, nm: { dim: 'length', factor: 1e-9 },
  km: { dim: 'length', factor: 1e3 },
  // time
  s: { dim: 'time', factor: 1 }, ms: { dim: 'time', factor: 1e-3 },
  us: { dim: 'time', factor: 1e-6 }, ns: { dim: 'time', factor: 1e-9 },
  ps: { dim: 'time', factor: 1e-12 }, min: { dim: 'time', factor: 60 },
  // frequency
  Hz: { dim: 'frequency', factor: 1 }, kHz: { dim: 'frequency', factor: 1e3 },
  MHz: { dim: 'frequency', factor: 1e6 }, GHz: { dim: 'frequency', factor: 1e9 },
  // voltage / current / resistance / capacitance / inductance / power
  V: { dim: 'voltage', factor: 1 }, mV: { dim: 'voltage', factor: 1e-3 }, kV: { dim: 'voltage', factor: 1e3 },
  A: { dim: 'current', factor: 1 }, mA: { dim: 'current', factor: 1e-3 }, uA: { dim: 'current', factor: 1e-6 },
  nA: { dim: 'current', factor: 1e-9 },
  ohm: { dim: 'resistance', factor: 1 }, kohm: { dim: 'resistance', factor: 1e3 }, Mohm: { dim: 'resistance', factor: 1e6 },
  F: { dim: 'capacitance', factor: 1 }, uF: { dim: 'capacitance', factor: 1e-6 },
  nF: { dim: 'capacitance', factor: 1e-9 }, pF: { dim: 'capacitance', factor: 1e-12 },
  H: { dim: 'inductance', factor: 1 }, mH: { dim: 'inductance', factor: 1e-3 }, uH: { dim: 'inductance', factor: 1e-6 },
  W: { dim: 'power', factor: 1 }, mW: { dim: 'power', factor: 1e-3 }, kW: { dim: 'power', factor: 1e3 },
  // temperature
  K: { dim: 'temperature', factor: 1 }, C: { dim: 'temperature_from_273_15', factor: 1 },
  // dimensionless
  '': { dim: 'scalar', factor: 1 }, pct: { dim: 'scalar_pct', factor: 1e-2 },
};

export class Quantity {
  constructor(value, unit = '') {
    if (!(unit in UNITS)) throw new Error(`Unknown unit "${unit}"`);
    this.value = value;
    this.unit = unit;
  }
  get dim() { return UNITS[this.unit].dim; }
  /** Convert to another unit of the same dimension. Returns a plain number. */
  to(unit) {
    if (!(unit in UNITS)) throw new Error(`Unknown unit "${unit}"`);
    const a = UNITS[this.unit], b = UNITS[unit];
    if (a.dim !== b.dim) throw new Error(`Cannot convert ${this.unit} (${a.dim}) to ${unit} (${b.dim})`);
    return (this.value * a.factor) / b.factor;
  }
  toString(digits = 4) {
    return `${fmtNum(this.value, digits)} ${this.unit}`.trim();
  }
}

/** Parse shorthand like "1k", "100n", "4.7u", "3.3", "50pct" -> base-SI number. */
export function parseSI(text) {
  const m = String(text).trim().match(/^([-+]?[\d.]+(?:e[-+]?\d+)?)\s*([pnuµmkMG]?)/i);
  if (!m) throw new Error(`Cannot parse "${text}" as an SI number`);
  const mult = { p: 1e-12, n: 1e-9, u: 1e-6, 'µ': 1e-6, m: 1e-3, k: 1e3, M: 1e6, G: 1e9, '': 1 }[m[2]];
  return parseFloat(m[1]) * mult;
}

/** Format a number with `digits` significant digits, trimming trailing zeros. */
export function fmtNum(v, digits = 4) {
  if (!isFinite(v)) return String(v);
  if (v === 0) return '0';
  const abs = Math.abs(v);
  if (abs >= 1e6 || abs < 1e-4) return v.toExponential(Math.max(0, digits - 1)).replace(/\.?0+e/, 'e');
  const r = Number(v.toPrecision(digits));
  return String(r);
}

export function convert(value, from, to) { return new Quantity(value, from).to(to); }

// kelvin <-> celsius helpers (offset dimension, handled explicitly)
export const cToK = (c) => c + 273.15;
export const kToC = (k) => k - 273.15;

// physical constants used by the labs (CODATA values, model provenance: NIST)
export const CONST = {
  k_B: 1.380649e-23,     // J/K (Boltzmann, exact since SI 2019)
  q_e: 1.602176634e-19,  // C (elementary charge, exact since SI 2019)
  T_ref: 300,            // K reference temperature for device models
};
