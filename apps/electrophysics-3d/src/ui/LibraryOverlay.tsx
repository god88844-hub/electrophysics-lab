import React, { useMemo, useState, useSyncExternalStore } from 'react';
import { REFERENCE, type ReferenceLibrary } from '../data/reference.js';
import { store } from '../state/store.js';

interface LibraryEntry {
  file: string;
  title: string;
  path: string;
  valueText: string;
  unit: string;
  note: string;
}

const FILE_TITLES: Record<string, string> = {
  '01_fundamental_constants.json': 'Fundamental constants (CODATA 2022)',
  '02_semiconductor_pdk_silicon.json': 'Semiconductor PDK & materials',
  '03_multiradix_logic_baselines.json': 'Multi-radix logic baselines',
  '04_quantum_hardware_modalities.json': 'Quantum hardware modalities',
  '05_chip_architecture_benchmarks.json': 'Chip architecture benchmarks',
  '06_failure_physics_thresholds.json': 'Failure physics thresholds',
};

function fmt(v: unknown): string {
  if (typeof v === 'number') {
    if (Number.isInteger(v)) return String(v);
    if (Math.abs(v) >= 1e5 || (Math.abs(v) < 1e-3 && v !== 0)) return v.toExponential(3);
    return String(Number(v.toPrecision(6)));
  }
  if (Array.isArray(v)) return v.map((x) => (typeof x === 'number' ? fmt(x) : JSON.stringify(x))).join(', ');
  if (typeof v === 'object' && v !== null) return JSON.stringify(v);
  return String(v);
}

/** Flatten a JSON tree into searchable, unit-aware rows. */
function flatten(file: string, node: unknown, path: string, out: LibraryEntry[]): void {
  if (node === null || node === undefined) return;
  if (typeof node !== 'object') {
    out.push({ file, title: FILE_TITLES[file] ?? file, path, valueText: fmt(node), unit: '', note: '' });
    return;
  }
  const obj = node as Record<string, unknown>;
  const hasValue = 'value' in obj && (typeof obj.value === 'number' || typeof obj.value === 'string');
  if (hasValue) {
    out.push({
      file,
      title: FILE_TITLES[file] ?? file,
      path,
      valueText: fmt(obj.value),
      unit: typeof obj.unit === 'string' ? obj.unit : '',
      note: typeof obj.note === 'string' ? obj.note : '',
    });
    return;
  }
  for (const [k, v] of Object.entries(obj)) {
    flatten(file, v, path ? `${path}.${k}` : k, out);
  }
}

function buildEntries(ref: ReferenceLibrary): LibraryEntry[] {
  const out: LibraryEntry[] = [];
  const files: Array<[string, unknown]> = [
    ['01_fundamental_constants.json', ref.constants],
    ['02_semiconductor_pdk_silicon.json', ref.semiconductor],
    ['03_multiradix_logic_baselines.json', ref.multiradix],
    ['04_quantum_hardware_modalities.json', ref.quantum],
    ['05_chip_architecture_benchmarks.json', ref.architecture],
    ['06_failure_physics_thresholds.json', ref.failures],
  ];
  for (const [file, json] of files) {
    const root = json as Record<string, unknown>;
    for (const section of ['parameters', 'derived', 'failure_thresholds', 'valid_operating_envelope', 'material_properties', 'equations'] as const) {
      if (section in root) flatten(file, root[section], section, out);
    }
    // equations array entries as rows
    if (Array.isArray(root.equations)) {
      for (const eq of root.equations as string[]) {
        out.push({ file, title: FILE_TITLES[file] ?? file, path: 'equations', valueText: eq, unit: '', note: '' });
      }
    }
  }
  return out;
}

const getStore = () => store.get();
const subscribeStore = (fn: () => void) => store.subscribe(fn);

/** Bay 5 — searchable offline physics library over the 6 verified JSON files. */
export function LibraryOverlay({ onClose }: { onClose: () => void }): React.ReactElement {
  const integrity = useSyncExternalStore(subscribeStore, getStore).integrity;
  const [query, setQuery] = useState('');
  const entries = useMemo(() => buildEntries(REFERENCE), []);
  const filtered = useMemo(() => {
    if (!query.trim()) return entries;
    const q = query.toLowerCase();
    return entries.filter(
      (e) =>
        e.path.toLowerCase().includes(q) ||
        e.note.toLowerCase().includes(q) ||
        e.valueText.toLowerCase().includes(q) ||
        e.file.toLowerCase().includes(q) ||
        e.title.toLowerCase().includes(q)
    );
  }, [entries, query]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 480,
        height: '100%',
        background: 'rgba(10,15,22,0.96)',
        borderRight: '1px solid #223042',
        zIndex: 140,
        padding: 18,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h2 style={{ color: '#e8eef7', fontSize: 16, margin: 0 }}>Offline Physics Library</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#4e5d70', cursor: 'pointer', fontSize: 16 }}>
          ✕
        </button>
      </div>
      <div
        style={{
          marginTop: 6,
          marginBottom: 10,
          fontSize: 12,
          color: integrity.allVerified ? '#5fd48a' : '#8ea1b8',
          fontFamily: 'monospace',
        }}
      >
        {integrity.done
          ? `SHA-256 ${integrity.verified}/${integrity.total} verified ${integrity.allVerified ? '✓' : '✗ INTEGRITY FAILURE'}`
          : 'verifying…'}{' '}
        · provenance verified_offline_standard
      </div>
      <input
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search constants, PDK params, thresholds… (e.g. 1.95, quench, sheet)"
        style={{
          background: '#101823',
          border: '1px solid #2a3a52',
          borderRadius: 8,
          color: '#e8eef7',
          padding: '8px 10px',
          fontSize: 13,
          marginBottom: 12,
          outline: 'none',
        }}
      />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.length === 0 && <div style={{ color: '#4e5d70', fontSize: 13 }}>No entries match “{query}”.</div>}
        {filtered.map((e, i) => (
          <div
            key={`${e.file}-${e.path}-${i}`}
            style={{
              padding: '8px 10px',
              marginBottom: 6,
              background: 'rgba(22,30,42,0.55)',
              borderRadius: 8,
              border: '1px solid #1c2838',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9fb4cc', fontSize: 11, fontFamily: 'monospace' }}>{e.path}</span>
              <span style={{ color: '#3f5068', fontSize: 10 }}>{e.title}</span>
            </div>
            <div style={{ color: '#e8eef7', fontSize: 13.5, marginTop: 3, fontFamily: 'monospace', wordBreak: 'break-word' }}>
              {e.valueText}
              {e.unit && <span style={{ color: '#6fd0ff' }}> {e.unit}</span>}
            </div>
            {e.note && <div style={{ color: '#6f8aa8', fontSize: 11.5, marginTop: 3, lineHeight: 1.45 }}>{e.note}</div>}
          </div>
        ))}
      </div>
      <div style={{ color: '#3f5068', fontSize: 11, marginTop: 8 }}>
        {filtered.length} of {entries.length} entries · all data offline · no network fetch
      </div>
    </div>
  );
}
