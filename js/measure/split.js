// split.js — calibration/validation partitioning (Phase 3 §6).
//
// NON-NEGOTIABLE: calibration data is used for parameter estimation;
// validation data must be independent of the fitting process. Split
// manifests are created BEFORE fitting, are immutable, and group-based
// partitioning (specimen / session / condition / batch) is the default —
// never random-row splitting of the same correlated recording.

import { sha256 } from './dataset.js';

/**
 * Build an immutable split manifest from group keys.
 * groups: Map or object: groupKey -> [sampleIndex...]
 * calibrationGroups / validationGroups: arrays of group keys.
 *
 * The manifest records every sample index used on each side, a checksum of
 * the partition, and the creation time — so the split cannot silently change
 * after fitting begins.
 */
export function createSplitManifest({ id, groups, calibrationGroups, validationGroups, createdAt = new Date().toISOString() }) {
  const allKeys = [...Object.keys(groups)];
  const cal = calibrationGroups ?? [];
  const val = validationGroups ?? [];
  const overlap = cal.filter((g) => val.includes(g));
  if (overlap.length > 0) {
    throw new Error(`data leakage: group(s) [${overlap.join(', ')}] assigned to BOTH calibration and validation — overlapping groups are prohibited`);
  }
  const unknown = [...cal, ...val].filter((g) => !allKeys.includes(g));
  if (unknown.length > 0) {
    throw new Error(`unknown group key(s) [${unknown.join(', ')}] in the split — every key must exist in groups`);
  }
  const unassigned = allKeys.filter((g) => !cal.includes(g) && !val.includes(g));
  const calibrationSamples = cal.flatMap((g) => groups[g]);
  const validationSamples = val.flatMap((g) => groups[g]);
  const sampleOverlap = calibrationSamples.filter((i) => validationSamples.includes(i));
  if (sampleOverlap.length > 0) {
    throw new Error(`data leakage: sample indices [${sampleOverlap.slice(0, 5).join(', ')}${sampleOverlap.length > 5 ? '…' : ''}] appear in both calibration and validation`);
  }
  const partition = {
    calibration: { groups: [...cal].sort(), sampleIndices: [...calibrationSamples].sort((a, b) => a - b) },
    validation: { groups: [...val].sort(), sampleIndices: [...validationSamples].sort((a, b) => a - b) },
    unassignedGroups: unassigned,
  };
  return Object.freeze({
    format: 'invention-lab/split-manifest/1',
    id,
    createdAt,
    groups: Object.freeze({ ...groups }),
    calibrationGroups: Object.freeze([...cal]),
    validationGroups: Object.freeze([...val]),
    partition: Object.freeze(partition),
    checksum: sha256(JSON.stringify(partition)),
  });
}

/** verify a dataset against a split manifest: sample counts and no leakage. */
export function verifySplit(manifest, dataset) {
  const errors = [];
  const n = dataset.samples.length;
  for (const side of ['calibration', 'validation']) {
    for (const i of manifest.partition[side].sampleIndices) {
      if (i < 0 || i >= n) errors.push(`${side} sample index ${i} out of range (dataset has ${n} samples)`);
    }
  }
  const calSet = new Set(manifest.partition.calibration.sampleIndices);
  for (const i of manifest.partition.validation.sampleIndices) {
    if (calSet.has(i)) errors.push(`leakage: sample ${i} in both calibration and validation`);
  }
  const checksum = sha256(JSON.stringify(manifest.partition));
  if (checksum !== manifest.checksum) errors.push(`manifest checksum mismatch (recorded ${manifest.checksum?.slice(0, 12)}…, computed ${checksum.slice(0, 12)}…) — the split was altered after creation`);
  return { ok: errors.length === 0, errors };
}

/** split by a grouping field of the samples (e.g. specimen, session, condition). */
export function partitionByField(dataset, field, { calibrationValues, validationValues }) {
  const groups = {};
  dataset.samples.forEach((s, i) => {
    const key = String(s[field]);
    (groups[key] ??= []).push(i);
  });
  return createSplitManifest({
    id: `${dataset.id}-split-by-${field}`,
    groups,
    calibrationGroups: calibrationValues.map(String),
    validationGroups: validationValues.map(String),
  });
}
