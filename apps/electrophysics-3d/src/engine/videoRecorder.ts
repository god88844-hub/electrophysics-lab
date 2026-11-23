export type Workspace = 'quantum' | 'silicon' | 'soc' | 'library';
export type CaptureMode = 'cinematic' | 'forensic';
export type Vector = readonly [number, number, number];

export interface CameraPose {
  position: Vector;
  target: Vector;
  up: Vector;
}

export interface CapturePlan {
  workspace: Workspace;
  mode: CaptureMode;
  seed: number;
  fps: typeof CAPTURE_FPS;
  durationMs: number;
  frameBudget: number;
  keyframes: ReadonlyArray<{ frame: number; camera: CameraPose }>;
}

export interface CaptureInput {
  playing: boolean;
  thermalView: boolean;
  dockTab: string | null;
  replayIndex: number | null;
  peelMode: string;
}

export interface DockTelemetry {
  frameId: number;
  tSimS: number;
  live: boolean;
  solverBadge: string;
  channels: ReadonlyArray<{ id: string; label: string; unit: string; value: number | null }>;
  failure: { type: string; value: number; threshold: number } | null;
}

export interface CapturedFrame {
  index: number;
  camera: CameraPose;
  input: CaptureInput;
  telemetry: DockTelemetry | null;
}

interface FrameEntry {
  index: number;
  timeUs: number;
  camera: CameraPose;
  telemetry: DockTelemetry | null;
  rasterSha256: string | null;
  sha256: string;
}

export type StopReason = 'user' | 'duration' | 'workspace-change' | 'hidden';

type RecordingMedia =
  | { kind: 'webm'; mimeType: string; bytes: number }
  | { kind: 'frame-sequence'; reason: string };

export interface CaptureManifest {
  format: typeof FORMAT;
  plan: CapturePlan;
  provenance: {
    badge: typeof CAPTURE_BADGE;
    workspace: Workspace;
    frameRange: readonly [number, number];
    frameSha256: string[];
    captureSha256: string;
  };
  raster: { width: number; height: number; encoding: 'RGBA8' } | null;
  inputEvents: Array<{ frame: number; state: CaptureInput }>;
  frames: FrameEntry[];
  stopReason: StopReason;
  skippedTicks: number;
  media: RecordingMedia;
}

type CopyPose = (camera: CameraPose) => CameraPose;
type PlanOptions = { workspace: Workspace; camera: CameraPose; mode: CaptureMode; seed: number; durationMs?: number };
type CreatePlan = (options: PlanOptions) => CapturePlan;
type ReadCamera = (plan: CapturePlan, frame: number) => CameraPose;
type NextFrame = (plan: CapturePlan, elapsedMs: number, previous: number) => number | null;
type CanonicalJson = (value: unknown) => string;
type HashBytes = (bytes: Uint8Array<ArrayBuffer>) => Promise<string>;
type FrameHash = (plan: CapturePlan, frame: Omit<FrameEntry, 'sha256'>, input: CaptureInput) => Promise<string>;
type MakeManifest = (
  plan: CapturePlan, captured: readonly CapturedFrame[], media: RecordingMedia, stopReason: StopReason,
  rasterAt?: (ordinal: number) => Uint8Array<ArrayBuffer>,
) => Promise<CaptureManifest>;
type ReplayHashes = (manifest: CaptureManifest) => Promise<string[]>;
type VideoChunkAdmission = (retained: number, chunk: number) => boolean;
type FrameEntries = FrameEntry[];
type InputEvents = CaptureManifest['inputEvents'];
type FrameRange = CaptureManifest['provenance']['frameRange'];
type MaybeInput = CaptureInput | undefined;
type MaybeText = string | undefined;

// The Node 20 data-URL test loads this pure core. Keep declarations
// JavaScript-compatible except for single-name binding type annotations.
// BEGIN RECORDER CORE
export const CAPTURE_FPS = 30;
export const MAX_DURATION_MS = 30_000;
export const MAX_FRAMES = CAPTURE_FPS * MAX_DURATION_MS / 1000;
export const MAX_VIDEO_BYTES = 24 * 1024 * 1024;
export const CAPTURE_SIZE = { width: 960, height: 540 };
export const RASTER_SIZE = { width: 96, height: 54 };
const RASTER_BYTES = RASTER_SIZE.width * RASTER_SIZE.height * 4;
const MAX_FRAME_INPUT_BYTES = 2048;
export const CAPTURE_BADGE = 'SIMULATED_PHYSICS_MODEL';
const FORMAT = 'invention-lab/recording/1';
const encoder = new TextEncoder();

const copyPose: CopyPose = camera => {
  const { position, target, up } = camera;
  if ([position, target, up].some(vector => vector.length !== 3 || !vector.every(Number.isFinite))) {
    throw new RangeError('Camera pose must contain finite three-dimensional vectors');
  }
  return { position: [...position], target: [...target], up: [...up] };
};

export const createCapturePlan: CreatePlan = ({
  workspace, camera, mode, seed, durationMs = MAX_DURATION_MS,
}) => {
  if (!Number.isFinite(durationMs) || durationMs < 1000 / CAPTURE_FPS || durationMs > MAX_DURATION_MS) {
    throw new RangeError('Recording duration must be between one frame and 30 seconds');
  }
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffff_ffff) {
    throw new RangeError('Recording seed must be an unsigned 32-bit integer');
  }
  const anchor = copyPose(camera);
  const frameBudget = Math.floor(durationMs * CAPTURE_FPS / 1000);
  const keyframes = [{ frame: 0, camera: anchor }];
  if (mode === 'cinematic' && frameBudget > 1) {
    const mixed = Math.imul(seed ^ (seed >>> 16), 0x45d9f3b) >>> 0;
    const arc = (Math.PI / 180) * (25 + (mixed % 16)) * (mixed & 0x100 ? -1 : 1);
    const last = frameBudget - 1;
    for (const frame of [...new Set([Math.ceil(last / 2), last])]) {
      const angle = arc * frame / last;
      const [x, y, z] = anchor.position;
      const [tx, , tz] = anchor.target;
      const dx = x - tx;
      const dz = z - tz;
      keyframes.push({ frame, camera: {
        ...anchor,
        position: [tx + dx * Math.cos(angle) + dz * Math.sin(angle),
          y, tz - dx * Math.sin(angle) + dz * Math.cos(angle)],
      } });
    }
  }
  return { workspace, mode, seed, fps: CAPTURE_FPS, durationMs, frameBudget, keyframes };
};

export const cameraAt: ReadCamera = (plan, frame) => {
  const after = plan.keyframes.findIndex(keyframe => keyframe.frame >= frame);
  if (after === 0) return plan.keyframes[0].camera;
  if (after < 0) return plan.keyframes[plan.keyframes.length - 1].camera;
  const from = plan.keyframes[after - 1];
  const to = plan.keyframes[after];
  const t = (frame - from.frame) / (to.frame - from.frame);
  const eased = t * t * (3 - 2 * t);
  const a = from.camera.position;
  const b = to.camera.position;
  return { ...from.camera, position: [
    a[0] + (b[0] - a[0]) * eased,
    a[1] + (b[1] - a[1]) * eased,
    a[2] + (b[2] - a[2]) * eased,
  ] };
};

/** Choose the next due tick after a real render. A scheduling gap stays a gap. */
export const nextCaptureFrame: NextFrame = (plan, elapsedMs, previous) => {
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0 || elapsedMs >= plan.durationMs) return null;
  const frame = Math.floor(elapsedMs * plan.fps / 1000);
  return frame > previous && frame < plan.frameBudget ? frame : null;
};

const canonicalJson: CanonicalJson = value => {
  if (value === null || typeof value === 'string' || typeof value === 'boolean'
    || (typeof value === 'number' && Number.isFinite(value))) return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(canonicalJson).join(',') + ']';
  if (typeof value !== 'object' || value === null) throw new TypeError('Invalid frame metadata');
  const entries = Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0);
  return '{' + entries.map(([key, item]) => JSON.stringify(key) + ':' + canonicalJson(item)).join(',') + '}';
};

const sha256: HashBytes = async bytes => {
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
};

const frameHash: FrameHash = (plan, frame, input) => {
  return sha256(encoder.encode(canonicalJson({
    format: FORMAT, badge: CAPTURE_BADGE, workspace: plan.workspace, mode: plan.mode, seed: plan.seed, frame, input,
  })));
};

export const makeCaptureManifest: MakeManifest = async (plan, captured, media, stopReason, rasterAt) => {
  if (captured.length < 1 || captured.length > plan.frameBudget || captured.length > MAX_FRAMES) {
    throw new RangeError('Capture has no frames or exceeds the frame budget');
  }
  const frames: FrameEntries = [];
  const inputEvents: InputEvents = [];
  let previous = -1;
  let lastInput: MaybeText = undefined;
  for (const [ordinal, capturedFrame] of captured.entries()) {
    const { index, camera, input, telemetry } = capturedFrame;
    if (!Number.isInteger(index) || index <= previous || index >= plan.frameBudget) {
      throw new RangeError('Capture frame indices must increase within the plan budget');
    }
    previous = index;
    const canonicalInput = canonicalJson(input);
    if (canonicalInput !== lastInput) {
      inputEvents.push({ frame: index, state: input });
      lastInput = canonicalInput;
    }
    const raster = rasterAt?.(ordinal);
    if (raster && raster.byteLength !== RASTER_BYTES) throw new RangeError('Capture raster has the wrong size');
    const frame = {
      index, timeUs: Math.round(index * 1_000_000 / plan.fps),
      camera, telemetry, rasterSha256: raster ? await sha256(raster) : null,
    };
    frames.push({ ...frame, sha256: await frameHash(plan, frame, input) });
  }
  const frameRange: FrameRange = [frames[0].index, previous];
  const frameSha256 = frames.map(frame => frame.sha256);
  const captureSha256 = await sha256(encoder.encode(canonicalJson({ plan, frameRange, frameSha256 })));
  return {
    format: FORMAT, plan, stopReason, media,
    raster: rasterAt ? { ...RASTER_SIZE, encoding: 'RGBA8' } : null,
    provenance: { badge: CAPTURE_BADGE, workspace: plan.workspace, frameRange, frameSha256, captureSha256 },
    skippedTicks: (stopReason === 'duration' ? plan.frameBudget : previous + 1) - frames.length,
    inputEvents, frames,
  };
};

/** Replay the exported input changes against the recorded camera/telemetry and raster digests. */
export const replayFrameHashes: ReplayHashes = async manifest => {
  const result = [];
  let input: MaybeInput = undefined;
  let nextEvent = 0;
  for (const { sha256: _recorded, ...frame } of manifest.frames) {
    const event = manifest.inputEvents[nextEvent];
    if (event?.frame === frame.index) {
      input = event.state;
      nextEvent++;
    }
    if (!input) throw new RangeError('Capture is missing its first input event');
    result.push(await frameHash(manifest.plan, frame, input));
  }
  if (nextEvent !== manifest.inputEvents.length) throw new RangeError('Capture has unmatched input events');
  return result;
};

export const admitsVideoChunk: VideoChunkAdmission = (retained, chunk) =>
  Number.isSafeInteger(retained) && retained >= 0
  && Number.isSafeInteger(chunk) && chunk >= 0
  && chunk <= MAX_VIDEO_BYTES - retained;
// END RECORDER CORE

type VideoSink = ReturnType<typeof startVideoSink>;

/** Keep only admitted chunks and request frames explicitly, never at the source canvas cadence. */
function startVideoSink(canvas: HTMLCanvasElement) {
  let recorder: MediaRecorder | undefined;
  let stream: MediaStream | undefined;
  let track: CanvasCaptureMediaStreamTrack | undefined;
  let output: BlobPart[] = [];
  let bytes = 0;
  let reason = 'WebM encoding is unavailable in this browser';
  let resolveStop: (() => void) | undefined;
  let finishTimer: ReturnType<typeof setTimeout> | undefined;
  let stopped = false;

  function release(): void {
    if (stopped) return;
    stopped = true;
    if (finishTimer !== undefined) clearTimeout(finishTimer);
    stream?.getTracks().forEach(item => item.stop());
    resolveStop?.();
  }

  function discard(message: string): void {
    reason = message;
    output = [];
    bytes = 0;
    try {
      if (recorder && recorder.state !== 'inactive') recorder.stop();
    } catch {
      // The track must still be released if the encoder is already invalid.
    } finally {
      release();
    }
  }

  try {
    const mimeType = typeof MediaRecorder === 'undefined' ? undefined :
      ['video/webm;codecs=vp8', 'video/webm;codecs=vp9', 'video/webm'].find(type => MediaRecorder.isTypeSupported(type));
    if (mimeType && typeof canvas.captureStream === 'function') {
      stream = canvas.captureStream(0);
      track = stream.getVideoTracks()[0] as CanvasCaptureMediaStreamTrack | undefined;
      if (!track || typeof track.requestFrame !== 'function') {
        release();
      } else {
        recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 2_500_000 });
        recorder.ondataavailable = ({ data }) => {
          if (stopped || !data.size) return;
          if (!admitsVideoChunk(bytes, data.size)) {
            discard('WebM reached the 24 MiB capture budget');
            return;
          }
          output.push(data);
          bytes += data.size;
        };
        recorder.onstop = release;
        recorder.onerror = () => discard('The WebM encoder stopped with an error');
        recorder.start(250);
      }
    }
  } catch {
    discard('The WebM encoder could not start');
  }

  return {
    requestFrame() {
      if (stopped || !recorder || recorder.state !== 'recording') return;
      try { track?.requestFrame(); }
      catch { discard('The capture track could not submit a frame'); }
    },
    async finish() {
      if (recorder && !stopped) {
        await new Promise<void>(resolve => {
          resolveStop = resolve;
          finishTimer = setTimeout(() => discard('The WebM encoder did not finish'), 3000);
          try {
            if (recorder?.state !== 'inactive') recorder?.stop();
          } catch {
            discard('The WebM encoder could not stop');
          }
        });
      }
      const blob = bytes > 0 && recorder ? new Blob(output, { type: recorder.mimeType }) : null;
      output = [];
      return { blob, reason: reason === 'WebM encoding is unavailable in this browser' && recorder
        ? 'The WebM encoder returned no frames' : reason };
    },
    dispose() { discard('Recording was discarded'); },
  };
}

function createCanvas(width: number, height: number, readback = false): CanvasRenderingContext2D {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { alpha: false, willReadFrequently: readback });
  if (!context) throw new Error('A capture canvas could not be created');
  return context;
}

function paintFrame(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, plan: CapturePlan, frame: CapturedFrame): void {
  const { width, height } = ctx.canvas;
  const sceneHeight = height - 68;
  ctx.fillStyle = '#14171c';
  ctx.fillRect(0, 0, width, height);
  const scale = Math.min(width / canvas.width, sceneHeight / canvas.height);
  const w = Math.round(canvas.width * scale);
  const h = Math.round(canvas.height * scale);
  ctx.drawImage(canvas, Math.floor((width - w) / 2), Math.floor((sceneHeight - h) / 2), w, h);
  ctx.fillStyle = '#ffd18b';
  ctx.font = 'bold 15px monospace';
  ctx.fillText(CAPTURE_BADGE + '  /  ' + plan.workspace + '  /  FRAME ' + frame.index, 14, sceneHeight + 20);
  ctx.fillStyle = '#eceff4';
  ctx.font = '13px monospace';
  const telemetry = frame.telemetry;
  if (telemetry) {
    const split = (channels: DockTelemetry['channels']) => channels.map(({ label, value, unit }) =>
      label + ' ' + (value === null ? 'â€”' : value.toPrecision(4) + ' ' + unit)).join('   ');
    ctx.fillText(split(telemetry.channels.slice(0, 4)), 14, sceneHeight + 40, width - 28);
    const trailing = telemetry.failure
      ? 'FAULT ' + telemetry.failure.type + '  /  ' + telemetry.failure.value + ' > ' + telemetry.failure.threshold
      : split(telemetry.channels.slice(4));
    ctx.fillText(trailing, 14, sceneHeight + 57, width - 28);
  } else {
    ctx.fillText('Waiting for solver telemetry', 14, sceneHeight + 41);
  }
}

export interface RecordingResult {
  manifest: CaptureManifest;
  video: Blob | null;
}

interface RenderSource {
  workspace: Workspace;
  canvas: HTMLCanvasElement;
  render(pose: CameraPose | null): void;
  read(pose: CameraPose | null): Omit<CapturedFrame, 'index'>;
}

/**
 * Browser session. Of the app's 2 GB envelope, less than 50 MiB of owned
 * capture backing buffers and admitted WebM bytes are reserved at maximum
 * settings. The GPU readback is one 96Ã—54 raster per accepted tick.
 */
export class ViewportRecording {
  private readonly pixels: Uint8Array<ArrayBuffer>;
  private readonly composite: CanvasRenderingContext2D;
  private readonly raster: CanvasRenderingContext2D;
  private video: VideoSink | undefined;
  private readonly frames: CapturedFrame[] = [];
  private readonly deadline: ReturnType<typeof setTimeout>;
  private readonly startTime: number;
  private lastFrame = -1;
  private result: Promise<RecordingResult> | undefined;
  private disposed = false;

  readonly plan: CapturePlan;

  constructor(plan: CapturePlan, onStop: (reason: StopReason) => void) {
    if (plan.fps !== CAPTURE_FPS || !Number.isInteger(plan.frameBudget)
      || plan.frameBudget < 1 || plan.frameBudget > MAX_FRAMES
      || !Number.isFinite(plan.durationMs) || plan.durationMs > MAX_DURATION_MS
      || plan.frameBudget !== Math.floor(plan.durationMs * CAPTURE_FPS / 1000)) {
      throw new RangeError('Capture plan exceeds the recording budget');
    }
    if (!globalThis.crypto?.subtle) throw new Error('Frame hashing requires a secure context');
    this.plan = plan;
    this.pixels = new Uint8Array(plan.frameBudget * RASTER_BYTES);
    this.composite = createCanvas(CAPTURE_SIZE.width, CAPTURE_SIZE.height);
    this.raster = createCanvas(RASTER_SIZE.width, RASTER_SIZE.height, true);
    this.startTime = performance.now();
    this.deadline = setTimeout(() => onStop('duration'), plan.durationMs);
    this.onStop = onStop;
  }

  private readonly onStop: (reason: StopReason) => void;

  render(source: RenderSource): void {
    if (this.disposed || this.result) {
      source.render(null);
      return;
    }
    const elapsed = performance.now() - this.startTime;
    if (elapsed >= this.plan.durationMs || source.workspace !== this.plan.workspace) {
      this.onStop(elapsed >= this.plan.durationMs ? 'duration' : 'workspace-change');
      source.render(null);
      return;
    }
    const index = nextCaptureFrame(this.plan, elapsed, this.lastFrame);
    const pose = this.plan.mode === 'cinematic' ? cameraAt(this.plan, index ?? Math.max(0, this.lastFrame)) : null;
    source.render(pose);
    if (index === null || !source.canvas.width || !source.canvas.height
      || performance.now() - this.startTime >= this.plan.durationMs) return;
    const frame = { index, ...source.read(pose) };
    if (encoder.encode(canonicalJson(frame)).byteLength > MAX_FRAME_INPUT_BYTES) {
      throw new RangeError('Frame metadata exceeded the capture budget');
    }
    paintFrame(this.composite, source.canvas, this.plan, frame);
    this.raster.drawImage(this.composite.canvas, 0, 0, RASTER_SIZE.width, RASTER_SIZE.height);
    const sample = this.raster.getImageData(0, 0, RASTER_SIZE.width, RASTER_SIZE.height);
    this.pixels.set(sample.data, this.frames.length * RASTER_BYTES);
    this.frames.push(frame);
    this.lastFrame = index;
    if (performance.now() - this.startTime < this.plan.durationMs) {
      // The stream's first automatic frame must see a painted canvas.
      this.video ??= startVideoSink(this.composite.canvas);
      this.video.requestFrame();
    }
  }

  stop(reason: StopReason): Promise<RecordingResult> {
    clearTimeout(this.deadline);
    this.result ??= this.finalize(reason);
    return this.result;
  }

  private async finalize(reason: StopReason): Promise<RecordingResult> {
    const { blob, reason: fallback } = this.video
      ? await this.video.finish() : { blob: null, reason: 'No WebM frames were submitted' };
    const media: RecordingMedia = blob
      ? { kind: 'webm', mimeType: blob.type, bytes: blob.size }
      : { kind: 'frame-sequence', reason: fallback };
    const manifest = await makeCaptureManifest(this.plan, this.frames, media, reason,
      ordinal => this.pixels.subarray(ordinal * RASTER_BYTES, (ordinal + 1) * RASTER_BYTES));
    return { manifest, video: blob };
  }

  dispose(): void {
    this.disposed = true;
    clearTimeout(this.deadline);
    this.video?.dispose();
  }
}
