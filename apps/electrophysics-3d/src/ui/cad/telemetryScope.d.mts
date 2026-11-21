/** Type declarations for telemetryScope.mjs (WP-1.6 solver-frame oscilloscope). */
export declare const TELEMETRY_SAMPLE_MS: number;
export declare const TELEMETRY_RING_LEN: number;
export declare const TELEMETRY_CHANNEL_COUNT: number;
export interface TelemetryChannel {
  readonly id: string;
  readonly label: string;
  readonly unit: string;
  readonly color: string;
  source(state: unknown): number;
}
export declare const TELEMETRY_CHANNELS: readonly TelemetryChannel[];
export interface TelemetryHistory {
  readonly ringLen: number;
  readonly rings: Float64Array[];
  cursors: number[];
  filled: number[];
  lastValues: number[];
  lastFrameId: number;
  samples: number;
  frame: unknown;
}
export declare function createTelemetryHistory(ringLen?: number): TelemetryHistory;
export declare function sampleTelemetry(history: TelemetryHistory, state: unknown): boolean;
export declare function sampleFrameStore(history: TelemetryHistory): boolean;
export declare function readChannelInto(history: TelemetryHistory, c: number, target: Float64Array, n?: number): number;
export declare function channelMeta(c: number): TelemetryChannel;
