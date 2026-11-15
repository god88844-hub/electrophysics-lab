// envelope.js — validation envelopes (Phase 3 §9).
//
// A validation envelope is a machine-readable statement of the operating
// conditions under which evidence exists. CRITICAL: separate min/max bounds
// do NOT prove that every point inside the resulting box is validated —
// coverage comes from actually tested points, and multidimensional requests
// between sparse tested points are at best
// 'interpolation-with-limited-evidence'.

export const ENVELOPE_CLASSES = [
  'within-demonstrated-envelope',
  'interpolation-with-limited-evidence',
  'outside-demonstrated-envelope',
  'unsupported',
  'insufficient-evidence',
];

/**
 * Define an envelope.
 *   ranges: { quantity: [min, max], ... } in SI units
 *   sets: { quantity: ['resistor', 'capacitor'], ... } for categorical conditions
 *   requiredAccuracy: documented accuracy target for the intended decision
 *   intendedDecision: what the validated model will be used for
 */
export function defineEnvelope({ id, ranges = {}, sets = {}, testedPoints = [], requiredAccuracy = null, intendedDecision = null, assumptions = [] }) {
  return Object.freeze({
    format: 'invention-lab/validation-envelope/1',
    id,
    ranges: Object.freeze({ ...ranges }),
    sets: Object.freeze({ ...sets }),
    testedPoints: Object.freeze(testedPoints.map((p) => Object.freeze({ ...p }))),
    requiredAccuracy,
    intendedDecision,
    assumptions: Object.freeze([...assumptions]),
  });
}

/** add tested points (from a validation run) to an envelope builder */
export function withTestedPoints(envelope, newPoints) {
  return defineEnvelope({
    id: envelope.id,
    ranges: envelope.ranges,
    sets: envelope.sets,
    testedPoints: [...envelope.testedPoints, ...newPoints],
    requiredAccuracy: envelope.requiredAccuracy,
    intendedDecision: envelope.intendedDecision,
    assumptions: envelope.assumptions,
  });
}

function withinRanges(envelope, request) {
  for (const [qty, [min, max]] of Object.entries(envelope.ranges)) {
    const v = request[qty];
    if (typeof v !== 'number' || !Number.isFinite(v)) return { ok: false, reason: `quantity "${qty}" missing or non-numeric in the request` };
    if (v < min || v > max) return { ok: false, reason: `${qty} = ${v} outside declared range [${min}, ${max}]` };
  }
  for (const [qty, allowed] of Object.entries(envelope.sets)) {
    const v = request[qty];
    if (!allowed.includes(v)) return { ok: false, reason: `${qty} = "${v}" not in declared set [${allowed.join(', ')}]` };
  }
  return { ok: true };
}

function distance(a, b, keys) {
  let maxRel = 0;
  for (const k of keys) {
    const span = Math.abs(b[k] - 0) || 1;
    const scale = Math.max(Math.abs(b[k]), Math.abs(a[k]), 1e-30);
    void span; void scale;
    maxRel = Math.max(maxRel, Math.abs(a[k] - b[k]) / Math.max(Math.abs(b[k]), 1e-30));
  }
  return maxRel; // max relative coordinate difference
}

/**
 * Classify a requested prediction against the envelope and its tested points.
 *
 * Returns { classification, detail, nearestTestedPoint|null, missingIds }.
 * Classifications:
 *   within-demonstrated-envelope      — request matches a tested point
 *   interpolation-with-limited-evidence — inside ranges, between tested points
 *   outside-demonstrated-envelope     — outside a declared range/set
 *   unsupported                       — envelope declares no range for a needed quantity
 *   insufficient-evidence             — envelope has ranges but NO tested points
 *
 * `matchTolerance` (relative, default 0.02) decides when a request is
 * considered to coincide with a tested point.
 */
export function classifyRequest(envelope, request, { matchTolerance = 0.02 } = {}) {
  if (!envelope.testedPoints || envelope.testedPoints.length === 0) {
    return { classification: 'insufficient-evidence', detail: 'the envelope declares ranges but contains no tested points — no demonstrated evidence exists', nearestTestedPoint: null };
  }
  const rangeCheck = withinRanges(envelope, request);
  if (!rangeCheck.ok) {
    return { classification: 'outside-demonstrated-envelope', detail: rangeCheck.reason, nearestTestedPoint: null };
  }
  // nearest tested point (max relative difference over the range quantities)
  const qtyKeys = Object.keys(envelope.ranges);
  let nearest = null, nearestDist = Infinity;
  for (const tp of envelope.testedPoints) {
    const d = distance(request, tp, qtyKeys);
    if (d < nearestDist) { nearestDist = d; nearest = tp; }
  }
  if (nearestDist <= matchTolerance) {
    return { classification: 'within-demonstrated-envelope', detail: `request coincides with tested point (relative distance ${nearestDist.toExponential(2)})`, nearestTestedPoint: nearest };
  }
  // inside ranges but not at a tested point: interpolation, bounded evidence
  return {
    classification: 'interpolation-with-limited-evidence',
    detail: `inside the declared ranges but ${nearestDist.toExponential(2)} (relative) from the nearest tested point — evidence is interpolative and limited; it must never inherit a validation PASS`,
    nearestTestedPoint: nearest,
  };
}

/**
 * Check a validation-run result against the envelope: a claim may only be
 * 'validated' when the classification is 'within-demonstrated-envelope' (or
 * interpolation is explicitly allowed by the acceptance criteria AND declared),
 * the dataset origin is real, and the prespecified criteria are met.
 */
export function envelopeGate({ classification, datasetOrigin, criteriaMet }) {
  if (datasetOrigin !== 'real-measurement') {
    return { allowed: false, reason: `dataset origin is "${datasetOrigin}" — only real-measurement data can support physical-validation evidence` };
  }
  if (classification === 'within-demonstrated-envelope' && criteriaMet) {
    return { allowed: true, reason: 'all prespecified criteria met within the demonstrated envelope' };
  }
  if (classification === 'interpolation-with-limited-evidence') {
    return { allowed: false, reason: 'interpolative evidence only — cannot support a physical-validation claim' };
  }
  if (classification === 'outside-demonstrated-envelope') {
    return { allowed: false, reason: 'outside the demonstrated envelope — no evidence' };
  }
  return { allowed: false, reason: `insufficient or unsupported evidence (classification: ${classification})` };
}
