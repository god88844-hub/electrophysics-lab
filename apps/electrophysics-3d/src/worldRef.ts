import type { LabWorld } from './world.js';

/** Late-bound world instance (set at App boot) for UI→3D commands. */
export const worldRef: { current: LabWorld | null } = { current: null };
