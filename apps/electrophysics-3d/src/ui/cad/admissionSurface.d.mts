/** Type declarations for admissionSurface.mjs (WP-1.6 admission-refusal surface). */
export declare const ADMISSION_SOURCE: string;
export interface AdmissionBudgets {
  readonly quantumMaxQubits: number;
  readonly mnaMaxNodes: number;
  readonly mnaMaxVoltageSources: number;
  readonly thermalMaxCols: number;
  readonly thermalMaxRows: number;
  readonly arenaMaxBytes: number;
}
export declare const ADMISSION_BUDGETS: AdmissionBudgets;
export declare const ADMISSION_DOMAINS: readonly string[];
export interface AdmissionRequest {
  domain: string;
  qubits?: number;
  nodes?: number;
  voltageSources?: number;
  cols?: number;
  rows?: number;
  bytes?: number;
}
export interface AdmissionOutcome {
  admitted: boolean;
  reason?: string;
  domain?: string;
  requested?: number;
  limit?: number;
}
export declare function admitWorkload(request: AdmissionRequest): AdmissionOutcome;
export declare function publishRefusal(outcome: AdmissionOutcome): unknown;
export declare function subscribeRefusals(fn: () => void): () => boolean;
export declare function getLatestRefusal(): (AdmissionOutcome & { tsUnixMs: number }) | null;
export declare function getRefusalCount(): number;
export declare function readRefusalRing(): Array<AdmissionOutcome & { tsUnixMs: number }>;
export declare function resetAdmissionSurface(): void;
export declare function admitAndSurface(request: AdmissionRequest): AdmissionOutcome;
export declare const admissionSurfaceApi: {
  budgets: AdmissionBudgets;
  source: string;
  admitWorkload: typeof admitWorkload;
  admitAndSurface: typeof admitAndSurface;
  publishRefusal: typeof publishRefusal;
  latest: typeof getLatestRefusal;
  count: typeof getRefusalCount;
  ring: typeof readRefusalRing;
};
