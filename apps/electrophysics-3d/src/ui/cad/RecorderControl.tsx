import { useEffect, useRef, useState, type CSSProperties, type MutableRefObject, type RefObject } from 'react';
import type { CameraRig } from '../../engine/cameraRig.js';
import type { RendererBundle } from '../../engine/renderer.js';
import { physicsClient, type PhysicsSnapshot } from '../../physics/physicsClient.js';
import {
  createCapturePlan, ViewportRecording, CAPTURE_BADGE, MAX_DURATION_MS,
  type CameraPose, type CaptureMode, type DockTelemetry, type RecordingResult, type StopReason,
} from '../../engine/videoRecorder.js';
import { store, type LabState } from '../../state/store.js';
import { TELEMETRY_CHANNELS } from './telemetryScope.mjs';

type Viewport = { renderer: RendererBundle; rig: CameraRig };
export type RecorderRenderHook = (renderer: RendererBundle, rig: CameraRig, dt: number) => void;

type RecorderState =
  | { status: 'idle' | 'recording' | 'finishing' }
  | { status: 'ready'; manifest: RecordingResult['manifest']; jsonUrl: string; videoUrl: string | null }
  | { status: 'error'; message: string };

const toolbarButton: CSSProperties = {
  background: 'rgba(26,32,41,0.9)', color: '#eceff4', border: '1px solid #3a4250',
  borderRadius: 8, padding: '3px 9px', cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap',
};
const panelStyle: CSSProperties = {
  position: 'absolute', right: 0, top: 'calc(100% + 10px)', width: 250, zIndex: 1,
  border: '1px solid #3a4250', borderRadius: 8, background: '#14171c', color: '#eceff4',
  boxShadow: '0 8px 24px #0008', padding: 12, fontSize: 12, display: 'grid', gap: 8,
};
const actionStyle: CSSProperties = { ...toolbarButton, padding: '6px 8px', textDecoration: 'none' };

function cameraPose(renderer: RendererBundle, rig: CameraRig): CameraPose {
  // The viewport composer renders through its perspective camera. Capture its
  // actual transform, and use the orbit target only for the cinematic anchor.
  const camera = renderer.camera;
  return {
    position: [camera.position.x, camera.position.y, camera.position.z],
    target: [rig.target.x, rig.target.y, rig.target.z],
    up: [camera.up.x, camera.up.y, camera.up.z],
  };
}

interface SolverSample {
  snapshot: PhysicsSnapshot;
  frameId: number;
  live: boolean;
}

function telemetryOf(state: LabState, sample: SolverSample | null): DockTelemetry | null {
  if (!sample) return null;
  const { snapshot, frameId, live } = sample;
  const rail = snapshot.currents.RAIL;
  const values: Record<string, number> = {
    vdd: snapshot.vdd, i_rail: Math.abs(rail) * 1000,
    vout_q4: snapshot.nodes.vout_q4, vout_bin: snapshot.nodes.vout_bin,
    t_trace: snapshot.temps.traceC, t_junction: snapshot.temps.junctionC, cryo: snapshot.temps.cryoK,
  };
  const failure = state.forensic?.report.failure;
  return {
    frameId, tSimS: snapshot.t, live, solverBadge: CAPTURE_BADGE,
    channels: TELEMETRY_CHANNELS.map(({ id, label, unit }) => ({
      id, label, unit, value: Number.isFinite(values[id]) ? values[id] : null,
    })),
    failure: failure && Number.isFinite(failure.value) && Number.isFinite(failure.threshold)
      ? { type: failure.type.slice(0, 80), value: failure.value, threshold: failure.threshold }
      : null,
  };
}

function renderHookFor(
  recording: ViewportRecording, viewport: Viewport, sample: () => SolverSample | null,
  fail: (error: unknown) => void,
): RecorderRenderHook {
  const camera = viewport.renderer.camera;
  const position = camera.position.clone();
  const orientation = camera.quaternion.clone();
  const up = camera.up.clone();
  let didRender = false;
  return (renderer, rig, dt) => {
    didRender = false;
    const state = store.get();
    try {
      recording.render({
        workspace: state.workspace,
        canvas: renderer.renderer.domElement,
        render(pose) {
          if (!pose) {
            renderer.render(dt);
            didRender = true;
            return;
          }
          position.copy(camera.position);
          orientation.copy(camera.quaternion);
          up.copy(camera.up);
          camera.up.set(...pose.up);
          camera.position.set(...pose.position);
          camera.lookAt(...pose.target);
          try {
            renderer.render(dt);
            didRender = true;
          } finally {
            camera.position.copy(position);
            camera.quaternion.copy(orientation);
            camera.up.copy(up);
            camera.updateMatrixWorld();
          }
        },
        read: pose => ({
          camera: pose ?? cameraPose(renderer, rig),
          input: {
            playing: state.playing, dockTab: state.dockOpen ? state.dockTab : null,
            replayIndex: state.replayIndex, thermalView: state.thermalView, peelMode: state.peelMode,
          },
          telemetry: telemetryOf(state, sample()),
        }),
      });
    } catch (error) {
      fail(error);
      if (!didRender) renderer.render(dt);
    }
  };
}

export function RecorderControl({
  viewport, renderHook,
}: {
  viewport: RefObject<Viewport>;
  renderHook: MutableRefObject<RecorderRenderHook | null>;
}) {
  const session = useRef<ViewportRecording | null>(null);
  const urls = useRef<string[]>([]);
  const unsubscribe = useRef<(() => void) | null>(null);
  const [panel, setPanel] = useState(false);
  const [state, setState] = useState<RecorderState>({ status: 'idle' });

  function revokeDownloads(): void {
    urls.current.forEach(url => URL.revokeObjectURL(url));
    urls.current = [];
  }

  function releaseSnapshotFeed(): void {
    unsubscribe.current?.();
    unsubscribe.current = null;
  }

  function fail(error: unknown): void {
    releaseSnapshotFeed();
    session.current?.dispose();
    session.current = null;
    renderHook.current = null;
    setState({ status: 'error', message: error instanceof Error ? error.message : String(error) });
  }

  function stop(reason: StopReason): void {
    const active = session.current;
    if (!active || !renderHook.current) return;
    releaseSnapshotFeed();
    renderHook.current = null;
    setPanel(true);
    setState({ status: 'finishing' });
    void active.stop(reason).then(({ manifest, video }) => {
      if (session.current !== active) return;
      const jsonUrl = URL.createObjectURL(new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' }));
      urls.current.push(jsonUrl);
      const videoUrl = video ? URL.createObjectURL(video) : null;
      if (videoUrl) urls.current.push(videoUrl);
      session.current = null;
      setState({ status: 'ready', manifest, jsonUrl, videoUrl });
    }).catch(error => { if (session.current === active) fail(error); });
  }

  function start(mode: CaptureMode): void {
    if (session.current) return;
    const current = viewport.current;
    if (!current) {
      fail(new Error('The viewport is still loading'));
      return;
    }
    revokeDownloads();
    try {
      const plan = createCapturePlan({
        workspace: store.get().workspace, camera: cameraPose(current.renderer, current.rig), mode, seed: 63,
      });
      const recording = new ViewportRecording(plan, stop);
      session.current = recording;
      let frameId = 0;
      let sample: SolverSample | null = physicsClient.latest && physicsClient.live !== false
        ? { snapshot: physicsClient.latest, live: true, frameId } : null;
      // Follow the same worker snapshot stream as the viewport, including
      // the live:false records emitted while the forensic dock is replaying.
      unsubscribe.current = physicsClient.onSnapshot(snapshot => {
        sample = { snapshot, frameId: ++frameId, live: physicsClient.live !== false };
      });
      renderHook.current = renderHookFor(recording, current, () => sample, fail);
      setState({ status: 'recording' });
    } catch (error) { fail(error); }
  }

  useEffect(() => {
    const onVisibility = () => { if (document.hidden) stop('hidden'); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      releaseSnapshotFeed();
      renderHook.current = null;
      session.current?.dispose();
      session.current = null;
      revokeDownloads();
    };
  }, [renderHook]);

  const busy = state.status === 'recording' || state.status === 'finishing';
  const stem = state.status === 'ready' ? 'eplab-' + state.manifest.plan.workspace + '-recording' : '';
  return (
    <div style={{ position: 'relative', flex: '0 0 auto' }}>
      <button type="button" style={toolbarButton} aria-expanded={panel} aria-controls="recorder-panel"
        onClick={() => setPanel(value => !value)}>
        {state.status === 'recording' ? '● Recording' : 'Record'}
      </button>
      {panel && (
        <div id="recorder-panel" role="region" aria-label="Viewport recorder" style={panelStyle}>
          {state.status === 'recording' && <>
            <span role="status">Recording viewport and dock telemetry · {MAX_DURATION_MS / 1000} s max</span>
            <button type="button" style={actionStyle} onClick={() => stop('user')}>Stop recording</button>
          </>}
          {state.status === 'finishing' && <span role="status">Finalizing frame hashes…</span>}
          {state.status === 'ready' && <>
            <span role="status">
              {state.manifest.frames.length} frames · {state.manifest.provenance.workspace}
              {state.manifest.stopReason === 'workspace-change' && ' · workspace changed'}
            </span>
            {state.manifest.media.kind === 'frame-sequence' && <span>{state.manifest.media.reason}. Frame manifest ready.</span>}
            {state.videoUrl && <a style={actionStyle} href={state.videoUrl} download={stem + '.webm'}>Download WebM</a>}
            <a style={actionStyle} href={state.jsonUrl} download={stem + '.json'}>Download manifest</a>
          </>}
          {state.status === 'error' && <span role="alert">{state.message}</span>}
          {!busy && <>
            <button type="button" style={actionStyle} onClick={() => start('cinematic')}>Start cinematic recording</button>
            <button type="button" style={actionStyle} onClick={() => start('forensic')}>Start forensic recording</button>
          </>}
        </div>
      )}
    </div>
  );
}
