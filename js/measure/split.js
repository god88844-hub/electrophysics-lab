// split.js — calibration/validation partitioning (Phase 3 §6).
//
// NON-NEGOTIABLE: calibration data is used for parameter estimation;
// validation data must be independent of the fitting process. Split
// manifests are created BEFORE fitting, are immutable, and group-based
// partitioning (specimen / session / condition / batch) is the default —
// never random-row splitting of the same correlated recording.

import { sha256 } from './dataset.js';

/** Deep freeze the complete manifest, including nested group/partition arrays. */
function freezeManifest(value) {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) freezeManifest(child);
    Object.freeze(value);
  }
  return value;
}


/**
 * Build an immutable split manifest from group keys.
 * groups: Map or object: groupKey -> [sampleIndex...]
 * calibrationGroups / validationGroups: arrays of group keys.
 *
 * The manifest records every sample index used on each side, a checksum of
 * the partition, and the creation time — so the split cannot silently change
 * after fitting begins.
 */
export function createSplitManifest({ id, groups, calibrationGroups, validationGroups, createdAt = new Date().toISOString(), dataset = null, groupField = null }) {
  if (!groups || typeof groups !== 'object') throw new Error('split manifest requires group membership');
  const clonedGroups = Object.fromEntries(Object.entries(groups).map(([key, values]) => [key, [...values]]));
  const allKeys = [...Object.keys(clonedGroups)];
  if (dataset && (!dataset.source?.datasetSha256 || !dataset.id)) {
    throw new Error('dataset-bound split requires dataset ID and verified content digest');
  }
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
  const calibrationSamples = cal.flatMap((g) => clonedGroups[g]);
  const validationSamples = val.flatMap((g) => clonedGroups[g]);
  const sampleOverlap = calibrationSamples.filter((i) => validationSamples.includes(i));
  if (sampleOverlap.length > 0) {
    throw new Error(`data leakage: sample indices [${sampleOverlap.slice(0, 5).join(', ')}${sampleOverlap.length > 5 ? '…' : ''}] appear in both calibration and validation`);
  }
  if ([...calibrationSamples, ...validationSamples].some(i => !Number.isInteger(i) || i < 0)) {
    throw new Error('split sample indices must be nonnegative integers');
  }
  if (new Set(calibrationSamples).size !== calibrationSamples.length || new Set(validationSamples).size !== validationSamples.length) {
    throw new Error('split has duplicate sample indices — observation membership is ambiguous');
  }
  const partition = {
    calibration: { groups: [...cal].sort(), sampleIndices: [...calibrationSamples].sort((a, b) => a - b) },
    validation: { groups: [...val].sort(), sampleIndices: [...validationSamples].sort((a, b) => a - b) },
    unassignedGroups: unassigned,
  };
  return freezeManifest({
    format: 'invention-lab/split-manifest/1',
    id,
    createdAt,
    groupField,
    sourceDatasetId: dataset?.id ?? null,
    sourceDatasetVersion: dataset?.version ?? null,
    sourceDatasetSha256: dataset?.source?.datasetSha256 ?? null,
    groups: clonedGroups,
    calibrationGroups: [...cal],
    validationGroups: [...val],
    partition,
    checksum: sha256(JSON.stringify(partition)),
  });
}

/** verify a dataset against a split manifest: sample counts and no leakage. */
export function verifySplit(manifest, dataset) {
  const errors = [];
  if (!manifest || !dataset || !Array.isArray(dataset.samples) || !manifest.partition?.calibration || !manifest.partition?.validation) {
    return { ok: false, errors: ['invalid split manifest or dataset structure'] };
  }
  const n = dataset.samples.length;
  const cal = manifest.partition.calibration.sampleIndices;
  const val = manifest.partition.validation.sampleIndices;
  if (!Array.isArray(cal) || !Array.isArray(val)) return { ok: false, errors: ['missing calibration or validation sample identities'] };
  for (const [side, values] of [['calibration', cal], ['validation', val]]) {
    if (new Set(values).size !== values.length) errors.push(`duplicate ${side} sample indices`);
    for (const i of values) {
      if (!Number.isInteger(i) || i < 0 || i >= n) errors.push(`${side} sample index ${i} out of range (dataset has ${n} samples)`);
    }
  }
  const calSet = new Set(cal);
  for (const i of val) if (calSet.has(i)) errors.push(`leakage: sample ${i} in both calibration and validation`);
  const checksum = sha256(JSON.stringify(manifest.partition));
  if (checksum !== manifest.checksum) errors.push(`manifest checksum mismatch (recorded ${String(manifest.checksum).slice(0, 12)}…, computed ${checksum.slice(0, 12)}…) — the split was altered after creation`);
  if (manifest.sourceDatasetId != null) {
    if (dataset.id !== manifest.sourceDatasetId) errors.push('split source dataset ID mismatch');
    if (dataset.version !== manifest.sourceDatasetVersion) errors.push('split source dataset version mismatch');
    if (!manifest.sourceDatasetSha256 || dataset.source?.datasetSha256 !== manifest.sourceDatasetSha256) errors.push('split source dataset checksum mismatch');
  }
  if (manifest.groupField) {
    const groups = {};
    dataset.samples.forEach((sample, index) => {
      const key = String(sample[manifest.groupField]);
      (groups[key] ??= []).push(index);
    });
    const actual = manifest.groups ?? {};
    const keys = [...new Set([...Object.keys(groups), ...Object.keys(actual)])];
    for (const key of keys) {
      const expected = [...(groups[key] ?? [])].sort((a, b) => a - b);
      const recorded = [...(actual[key] ?? [])].sort((a, b) => a - b);
      if (JSON.stringify(expected) !== JSON.stringify(recorded)) errors.push(`split group membership mismatch for "${key}"`);
    }
  }
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
    dataset,
    groupField: field,
  });
}
