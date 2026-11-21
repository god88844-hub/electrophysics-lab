/** Type declarations for logicStream.mjs (WP-1.6 logic analyzer interface). */
export declare const LOGIC_STREAM_FORMAT: string;
export declare const LOGIC_RING_EVENTS: number;
export interface LogicStreamDescriptor {
  name: string;
  channels: string[];
  badge?: string;
}
export interface LogicEvent {
  t: number;
  channel: string;
  value: number;
  edge: '' | 'rising' | 'falling';
}
export declare function attachLogicStream(descriptor: LogicStreamDescriptor): LogicStreamDescriptor & { format: string };
export declare function detachLogicStream(): boolean;
export declare function getLogicStream(): (LogicStreamDescriptor & { format: string; badge: string }) | null;
export declare function isLogicStreamActive(): boolean;
export declare function publishLogicEvents(events: unknown[]): { accepted: number; refused: number; reasons: string[] };
export declare function readLogicEvents(max?: number): LogicEvent[];
export declare function logicEventStats(): { total: number; refused: number; buffered: number; capacity: number };
export declare function subscribeLogic(fn: () => void): () => boolean;
export declare function resetLogicStream(): void;
export declare const logicSurfaceApi: {
  format: string;
  attach: typeof attachLogicStream;
  detach: typeof detachLogicStream;
  publish: typeof publishLogicEvents;
  get: typeof getLogicStream;
  isActive: typeof isLogicStreamActive;
  events: typeof readLogicEvents;
  stats: typeof logicEventStats;
};
