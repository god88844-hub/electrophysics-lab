import React, { useRef, useState } from 'react';
import schema from '../../../../../docs/master-plan/schemas/experiment-bundle.schema.json';
import curriculumManifest from '../../../../../data/curriculum/MANIFEST.json';
import curriculumText from '../../../../../data/curriculum/01_academy_missions.json?raw';
import { compareArchitectures, systolicMatmul } from '../../../../../packages/chip-engine/src/index.mjs';
import { REFERENCE, verifyReferenceIntegrity } from '../../data/reference.js';
import type { LabState } from '../../state/store.js';
import {
  BUNDLE_MAX_BYTES, buildExperimentBundle, importExperimentBundle,
  replayExperimentBundle, requestFromWorkbench, serializeExperimentBundle, sha256BundleText,
} from '../../state/experimentBundle.js';

type Bundle = Awaited<ReturnType<typeof importExperimentBundle>>;
type BundleView = {
  bundle: Bundle;
  status: 'exported' | 'imported' | 'replayed';
};

async function loadRuntime() {
  const [integrity, quantum, thresholds, forensics, curriculumHash] = await Promise.all([
    verifyReferenceIntegrity(),
    import('../../../../../packages/quantum-engine/src/index.mjs'),
    import('../../../../../packages/physics-engine/src/thresholds.mjs'),
    import('../../../../../packages/physics-engine/src/forensics.mjs'),
    sha256BundleText(curriculumText),
  ]);
  const lockedCurriculum = curriculumManifest.files.find(file => file.file === '01_academy_missions.json');
  const curriculum = lockedCurriculum?.sha256 === curriculumHash
    && lockedCurriculum.size_bytes === new TextEncoder().encode(curriculumText).byteLength
    ? { sha256: curriculumHash, document: JSON.parse(curriculumText) } : undefined;
  const documents = {
    '02_semiconductor_pdk_silicon.json': REFERENCE.semiconductor,
    '04_quantum_hardware_modalities.json': REFERENCE.quantum,
    '05_chip_architecture_benchmarks.json': REFERENCE.architecture,
    '06_failure_physics_thresholds.json': REFERENCE.failures,
    '07_soc_interposer_memory_baselines.json': REFERENCE.socMemory,
  };
  const references = Object.fromEntries(integrity.details
    .filter(entry => entry.ok && Object.hasOwn(documents, entry.file))
    .map(entry => [entry.file, { sha256: entry.actual, document: documents[entry.file as keyof typeof documents] }]));
  return { schema, references, curriculum, engines: {
    TransmonDevice: quantum.TransmonDevice, spsa: quantum.spsa, nelderMead: quantum.nelderMead,
    compareArchitectures, systolicMatmul,
    evaluateThresholds: thresholds.evaluateThresholds, buildForensicReport: forensics.buildForensicReport,
  } };
}

let runtime: ReturnType<typeof loadRuntime> | undefined;

function runtimeForBundle() {
  runtime ??= loadRuntime().catch(error => { runtime = undefined; throw error; });
  return runtime;
}

const button: React.CSSProperties = {
  background: '#212a36', border: '1px solid #435267', color: '#eceff4',
  cursor: 'pointer', padding: '5px 9px', borderRadius: 7, fontSize: 12, whiteSpace: 'nowrap',
};
const card: React.CSSProperties = {
  color: '#eceff4', background: '#14171c', border: '1px solid #435267',
  borderRadius: 10, width: 'min(490px, 88vw)', padding: 18, fontFamily: 'inherit',
};

function downloadBundle(bundle: Bundle): void {
  const url = URL.createObjectURL(new Blob([serializeExperimentBundle(bundle)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'eplab-' + bundle.domain + '-' + bundle.seed + '.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

const WORKSPACE_LABEL = {
  quantum: 'Quantum Co-Inventor', silicon: 'Silicon Forensics', soc: 'SoC Architecture', library: null,
};

export function BundleExporter({ state, compact = false }: { state: LabState; compact?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const running = useRef(false);
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<BundleView | null>(null);
  const [error, setError] = useState('');
  const source = WORKSPACE_LABEL[state.workspace];

  async function perform(action: () => Promise<BundleView>) {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    setError('');
    setView(null);
    try {
      setView(await action());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      running.current = false;
      setBusy(false);
    }
  }

  function exportCurrent() {
    void perform(async () => {
      const config = await runtimeForBundle();
      const { request, observed } = requestFromWorkbench(state, config);
      const bundle = await buildExperimentBundle(request, config, observed);
      downloadBundle(bundle);
      return { bundle, status: 'exported' };
    });
  }

  function importFile(file: File) {
    void perform(async () => {
      if (file.size > BUNDLE_MAX_BYTES) throw new Error('Experiment bundle exceeds the 512 KiB import limit');
      const bytes = new Uint8Array(await file.arrayBuffer());
      return { bundle: await importExperimentBundle(bytes, await runtimeForBundle()), status: 'imported' };
    });
  }

  function replayCurrent(bundle: Bundle) {
    void perform(async () => ({
      bundle: await replayExperimentBundle(bundle, await runtimeForBundle()),
      status: 'replayed',
    }));
  }

  return (
    <div style={compact ? { position: 'absolute', bottom: 31, right: 10, zIndex: 110 } : { marginLeft: 'auto', marginRight: 8 }}>
      <button type="button" style={button} onClick={() => dialog.current?.showModal()}>Experiment bundles</button>
      <dialog ref={dialog} style={card} aria-label="Experiment bundles" onKeyDown={event => event.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <strong>Experiment bundles</strong>
          <button type="button" style={button} aria-label="Close experiment bundles" onClick={() => dialog.current?.close()}>×</button>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
          {source && <button type="button" style={button} disabled={busy} onClick={exportCurrent}>Export {source}</button>}
          <button type="button" style={button} disabled={busy} onClick={() => fileInput.current?.click()}>Import bundle</button>
          <input type="file" accept=".json,application/json" ref={fileInput} hidden aria-label="Bundle JSON file"
            onChange={event => {
              const file = event.currentTarget.files?.[0];
              event.currentTarget.value = '';
              if (file) importFile(file);
            }} />
        </div>
        {busy && <p role="status" aria-label="Bundle status">Verifying experiment bundle…</p>}
        {error && <p role="alert" style={{ color: '#ffab95', overflowWrap: 'anywhere' }}>{error}</p>}
        {view && (
          <div style={{ marginTop: 12, display: 'grid', gap: 7, fontSize: 12 }}>
            <div role="status" aria-label="Bundle status">
              {view.status === 'imported' && 'SHA-256 seal verified. Ready to replay.'}
              {view.status === 'exported' && 'Experiment bundle exported.'}
              {view.status === 'replayed' && 'Replay matched the original metrics and SHA-256 seal.'}
            </div>
            <div>{view.bundle.badge}</div>
            <code aria-label="Bundle SHA-256" style={{ overflowWrap: 'anywhere' }}>{view.bundle.sha256}</code>
            {view.status !== 'imported' && (
              <div>
                <div>{view.bundle.metrics.score}</div>
                {view.bundle.academyEvidence && <div>Academy evidence · {view.bundle.academyEvidence.missionId}</div>}
                <output aria-label="Experiment scores">{view.bundle.initialFidelity} → {view.bundle.optimizedFidelity}</output>
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {view.status === 'imported'
                ? <button type="button" style={button} onClick={() => replayCurrent(view.bundle)}>Replay bundle</button>
                : <button type="button" style={button} onClick={() => downloadBundle(view.bundle)}>Download bundle JSON</button>}
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
