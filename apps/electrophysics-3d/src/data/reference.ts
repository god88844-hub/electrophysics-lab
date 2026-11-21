// Offline reference library — the single physics data source for every visual
// effect in the lab. All JSON is imported raw so SHA-256 integrity can be
// verified in-browser against MANIFEST.json (exact same bytes as on disk).
import rawConstants from '@reflib/01_fundamental_constants.json?raw';
import rawSemiconductor from '@reflib/02_semiconductor_pdk_silicon.json?raw';
import rawMultiradix from '@reflib/03_multiradix_logic_baselines.json?raw';
import rawQuantum from '@reflib/04_quantum_hardware_modalities.json?raw';
import rawArchitecture from '@reflib/05_chip_architecture_benchmarks.json?raw';
import rawFailures from '@reflib/06_failure_physics_thresholds.json?raw';
import rawSocMemory from '@reflib/07_soc_interposer_memory_baselines.json?raw';
import rawCells from '@reflib/08_standard_and_multiradix_cells.json?raw';
import rawManifest from '@reflib/MANIFEST.json?raw';

import constantsJson from '@reflib/01_fundamental_constants.json';
import semiconductorJson from '@reflib/02_semiconductor_pdk_silicon.json';
import multiradixJson from '@reflib/03_multiradix_logic_baselines.json';
import quantumJson from '@reflib/04_quantum_hardware_modalities.json';
import architectureJson from '@reflib/05_chip_architecture_benchmarks.json';
import failuresJson from '@reflib/06_failure_physics_thresholds.json';
import socMemoryJson from '@reflib/07_soc_interposer_memory_baselines.json';
import cellsJson from '@reflib/08_standard_and_multiradix_cells.json';
import manifestJson from '@reflib/MANIFEST.json';

export interface ManifestEntry {
  file: string;
  sha256: string;
  size_bytes: number;
}
export interface ReferenceManifest {
  format: string;
  generatedAt: string;
  files: ManifestEntry[];
}

const RAW_FILES: Record<string, string> = {
  '01_fundamental_constants.json': rawConstants,
  '02_semiconductor_pdk_silicon.json': rawSemiconductor,
  '03_multiradix_logic_baselines.json': rawMultiradix,
  '04_quantum_hardware_modalities.json': rawQuantum,
  '05_chip_architecture_benchmarks.json': rawArchitecture,
  '06_failure_physics_thresholds.json': rawFailures,
  '07_soc_interposer_memory_baselines.json': rawSocMemory,
  '08_standard_and_multiradix_cells.json': rawCells,
};

async function sha256Hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export interface IntegrityResult {
  verified: number;
  total: number;
  allVerified: boolean;
  details: Array<{ file: string; expected: string; actual: string; ok: boolean }>;
}

/** Verify every reference file byte-for-byte against MANIFEST.json. */
export async function verifyReferenceIntegrity(): Promise<IntegrityResult> {
  const manifest = manifestJson as unknown as ReferenceManifest;
  const details: IntegrityResult['details'] = [];
  for (const entry of manifest.files) {
    const raw = RAW_FILES[entry.file];
    if (raw === undefined) {
      details.push({ file: entry.file, expected: entry.sha256, actual: '(missing)', ok: false });
      continue;
    }
    const actual = await sha256Hex(raw);
    details.push({ file: entry.file, expected: entry.sha256, actual, ok: actual === entry.sha256 });
  }
  const verified = details.filter((d) => d.ok).length;
  return { verified, total: details.length, allVerified: verified === details.length, details };
}

export const REFERENCE = {
  constants: constantsJson,
  semiconductor: semiconductorJson,
  multiradix: multiradixJson,
  quantum: quantumJson,
  architecture: architectureJson,
  failures: failuresJson,
  socMemory: socMemoryJson,
  cells: cellsJson,
  manifest: manifestJson as unknown as ReferenceManifest,
};

export type ReferenceLibrary = typeof REFERENCE;

// Frequently used, physically exact numbers pulled straight from the library.
export const SKY130 = {
  PDK: 'SKY130A',
  VDD_NOMINAL_V: semiconductorJson.parameters.sky130a.nominal_vdd_v as number,
  VGS_SOA_MAX_V: semiconductorJson.parameters.sky130a.core_soa_max_vgs_v as number,
  VTH_NMOS_V: semiconductorJson.parameters.sky130a.vth_nmos_typ_v as number,
  VTH_PMOS_V: semiconductorJson.parameters.sky130a.vth_pmos_typ_v as number,
  GATE_OXIDE_NM: semiconductorJson.parameters.sky130a.oxide_thickness_nm.gate_oxide as number,
  METAL_STACK: semiconductorJson.parameters.sky130a.metal_stack,
} as const;

export const Q4_LEVELS_V = (multiradixJson.parameters.quaternary_q4_1p8v_ldo.voltage_levels_v as number[]) ?? [0, 0.6, 1.2, 1.8];
export const Q4_PRIMITIVES = multiradixJson.verified_sky130a_q4_primitives as Array<{
  cell_name: string;
  function: string;
  gate_count: number;
  drc_status: string;
  lvs_status: string;
  pex_status: string;
}>;

/** Copper material constants (02_semiconductor_pdk_silicon.json). */
export const COPPER = {
  RESISTIVITY: semiconductorJson.material_properties.copper.resistivity_ohm_m_at_300K as number,
  TCR: semiconductorJson.material_properties.copper.tcr_per_k as number,
  THERMAL_K: semiconductorJson.material_properties.copper.thermal_conductivity_w_per_m_k as number,
  SPECIFIC_HEAT: semiconductorJson.material_properties.copper.specific_heat_j_per_kg_k as number,
  DENSITY: semiconductorJson.material_properties.copper.density_kg_per_m3 as number,
  MELTING_C: semiconductorJson.material_properties.copper.melting_point_c as number,
} as const;

export const FR4 = {
  THERMAL_K: semiconductorJson.material_properties.fr4_pcb.thermal_conductivity_w_per_m_k as number,
  SPECIFIC_HEAT: semiconductorJson.material_properties.fr4_pcb.specific_heat_j_per_kg_k as number,
  DENSITY: semiconductorJson.material_properties.fr4_pcb.density_kg_per_m3 as number,
  DELAMINATION_C: semiconductorJson.material_properties.fr4_pcb.delamination_c as number,
  GLASS_TRANSITION_C: semiconductorJson.material_properties.fr4_pcb.glass_transition_c as number,
} as const;

/** Failure thresholds (06_failure_physics_thresholds.json). */
export const THRESHOLDS = {
  VGS_TDDB_V: failuresJson.failure_thresholds.gate_oxide_tddb.vgs_threshold_v as number,
  GAMMA_DEC_PER_V: failuresJson.failure_thresholds.gate_oxide_tddb.gamma_dec_per_v as number,
  CU_MELTING_C: failuresJson.failure_thresholds.cu_melting_c as number,
  FR4_DELAMINATION_C: failuresJson.failure_thresholds.fr4_delamination_c as number,
  SI_THERMAL_RUNAWAY_C: failuresJson.failure_thresholds.si_thermal_runaway_c as number,
  CRYO_QUENCH_15MK_W: failuresJson.failure_thresholds.cryo_quench_15mk_w as number,
  BLACKBODY: failuresJson.parameters.blackbody_rgb_temperature_curve.visible_color_mapping as Record<
    string,
    { rgb: [number, number, number]; note: string }
  >,
} as const;

/** Transmon modality (04_quantum_hardware_modalities.json). */
export const TRANSMON = quantumJson.parameters.superconducting_transmon as Record<string, unknown> & {
  t1_us: { typical: number };
  t2_us: { typical: number };
  zz_crosstalk_khz: { typical: number };
  readout_fidelity: { typical: number };
  gate_2q_duration_ns: { typical: number };
  gate_2q_error: { typical: number };
};

/** Blackbody colour ramp — Planck's law mapped through CIE 1931 (06 JSON). */
export const BLACKBODY_STOPS: Array<{ tK: number; rgb: [number, number, number] }> = [
  { tK: 300, rgb: [0, 0, 0] },
  { tK: 500, rgb: [64, 0, 0] },
  { tK: 750, rgb: [153, 0, 0] },
  { tK: 1000, rgb: [255, 40, 0] },
  { tK: 1500, rgb: [255, 128, 24] },
  { tK: 2000, rgb: [255, 190, 76] },
  { tK: 2500, rgb: [255, 225, 155] },
];
