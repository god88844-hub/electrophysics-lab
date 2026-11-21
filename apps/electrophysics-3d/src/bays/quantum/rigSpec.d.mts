/**
 * Type declarations for rigSpec.mjs (WP-5.4).
 * The implementation is plain JS so the Node 20/22/24 unit tests can import
 * it directly; these declarations give the TypeScript builders full types.
 */

export interface MaterialParams {
  colorHex: number;
  metalness: number;
  roughness: number;
  clearcoat: number;
  label: string;
}

export interface Point2 { x: number; z: number }
export interface Point3 { x: number; y: number; z: number }

export interface CryoStageSpec {
  label: string;
  tempK: number;
  yCm: number;
  radiusCm: number;
  thicknessCm: number;
  coolingPowerW: number | null;
  material: MaterialParams;
  name: string;
}

export interface CryostatGeometry {
  stages: CryoStageSpec[];
  canister: {
    radiusCm: number;
    heightCm: number;
    centerYCm: number;
    material: MaterialParams;
  };
  supportRods: {
    count: number;
    ringRadiusCm: number;
    radiusCm: number;
    lengthCm: number;
    centerYCm: number;
    material: MaterialParams;
    spacers: Array<{ yCm: number; radiusCm: number; thicknessCm: number }>;
  };
  coaxLines: {
    count: number;
    tubeRadiusCm: number;
    material: MaterialParams;
    waypoints(angle: number): Point3[];
    barrels: Array<{ yCm: number; ringRadiusCm: number; radiusCm: number; lengthCm: number }>;
  };
  thermalStraps: {
    count: number;
    material: MaterialParams;
    radiusCm: number;
    routes: Array<{ from: string; to: string; points: Point3[] }>;
  };
  coldLinks: Array<{
    fromLabel: string;
    toLabel: string;
    yFromCm: number;
    yToCm: number;
    radiusCm: number;
    material: MaterialParams;
  }>;
}

export interface TransmonGeometry {
  sizeCm: number;
  thicknessCm: number;
  substrate: MaterialParams;
  dieCenterYCm: number;
  topYCm: number;
  padsYCm: number;
  junctionYCm: number;
  pads: {
    rows: number;
    cols: number;
    pitchCm: number;
    sizeCm: number;
    thicknessCm: number;
    material: MaterialParams;
    positions: Point2[];
  };
  cpw: {
    rows: number;
    spanCm: number;
    widthCm: number;
    tubeRadiusCm: number;
    amplitudeCm: number;
    material: MaterialParams;
    rowZs: number[];
    paths: Point2[][];
  };
  junctions: {
    count: number;
    sizeCm: number;
    thicknessCm: number;
    material: MaterialParams;
    positions: Point2[];
  };
  superconductingTransitionK: number | null;
}

export interface MziGeometry {
  die: {
    widthCm: number;
    heightCm: number;
    thicknessCm: number;
    mountYCm: number;
    substrate: MaterialParams;
  };
  waveguides: {
    count: number;
    armOffsetCm: number;
    tubeRadiusCm: number;
    material: MaterialParams;
    presentationNm: number;
    paths: Point3[][];
  };
  coupler: {
    count: number;
    lengthCm: number;
    zSizeCm: number;
    heightCm: number;
    material: MaterialParams;
    position: Point2;
  };
  heaters: {
    pPiMw: number;
    count: number;
    material: MaterialParams;
    pads: Array<{ xCm: number; zCm: number; lengthCm: number; widthCm: number; heightCm: number }>;
  };
  gratings: {
    count: number;
    finCount: number;
    finThicknessCm: number;
    finWidthCm: number;
    finHeightCm: number;
    positions: Point2[];
  };
  edgeMarginCm: number;
}

export interface TweezerGeometry {
  table: {
    widthCm: number;
    depthCm: number;
    thicknessCm: number;
    topYCm: number;
    material: MaterialParams;
  };
  chamber: {
    radiusCm: number;
    heightCm: number;
    wallThicknessCm: number;
    baseYCm: number;
    centerYCm: number;
    material: MaterialParams;
    viewportCount: number;
    viewportRadiusCm: number;
    viewportYCm: number;
    vacuumTorr: number;
  };
  atoms: {
    rows: number;
    cols: number;
    pitchCm: number;
    radiusCm: number;
    material: MaterialParams;
    planeYCm: number;
    trapDepthMhz: number;
    positions: Point2[];
  };
  halos: {
    radiusCm: number;
    innerRadiusCm: number;
    count: number;
    planeYCm: number;
    positions: Point2[];
  };
  lasers: {
    rydberg: {
      nm: number;
      colorHex: number;
      beamRadiusCm: number;
      lengthCm: number;
      coneRadiusCm: number;
      coneLengthCm: number;
      planeYCm: number;
    };
    trap: {
      nm: number;
      colorHex: number;
      beamRadiusCm: number;
      lengthCm: number;
      planeYCm: number;
      angleRad: number;
    };
  };
}

export interface BlochGeometry {
  sphereRadiusCm: number;
  dockedPanel: string;
  hudDefaultOn: boolean;
  positions: ReadonlyArray<readonly [number, number, number]>;
}

export interface QuantumRigGeometry {
  sourceId: string;
  units: { length: string; workspace: string };
  cryostat: CryostatGeometry;
  transmon: TransmonGeometry;
  mzi: MziGeometry;
  tweezer: TweezerGeometry;
  bloch: BlochGeometry;
  stageTempsK: number[];
  superconductingTransitionK: number;
}

export const RENDER: Readonly<Record<string, number | Readonly<Record<string, number>>>>;
export const SCENE: Readonly<Record<string, number | ReadonlyArray<readonly [number, number, number]>>>;

export function parseMaterialSpec(str: string, fallbackLabel?: string): MaterialParams;
export function parseTemperatureK(label: string): number;
export function parsePadGrid(str: string): { rows: number; cols: number; pitchCm: number };
export function parseTransitionTempK(note: string): number | null;
export function parseRoutePairs(routing: string): Array<[string, string]>;
export function wavelengthToHex(nm: number): number;
export function loadQuantumRigSpec(json: object): Readonly<Record<string, unknown>>;

export function deriveCryostat(json: object): CryostatGeometry;
export function deriveTransmonDie(json: object, cryostat: CryostatGeometry): TransmonGeometry;
export function deriveMzi(json: object): MziGeometry;
export function deriveTweezer(json: object): TweezerGeometry;
export function deriveBloch(json: object): BlochGeometry;
export function deriveAll(json: object): QuantumRigGeometry;
