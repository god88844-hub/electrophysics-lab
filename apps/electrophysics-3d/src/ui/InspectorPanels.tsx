import React from 'react';
import type { LabState } from '../state/store.js';
import { Q4_PRIMITIVES, REFERENCE, TRANSMON } from '../data/reference.js';

export interface BayPanelProps {
  bay: number;
  state: LabState;
  dispatch: (patch: Partial<LabState>) => void;
}

const sectionStyle: React.CSSProperties = {
  marginBottom: 14,
  padding: '10px 12px',
  background: 'rgba(22,30,42,0.6)',
  borderRadius: 10,
  border: '1px solid #223042',
};
const labelStyle: React.CSSProperties = { color: '#8ea1b8', fontSize: 11, marginBottom: 6, letterSpacing: '0.06em' };
const btnStyle = (active: boolean, color: string): React.CSSProperties => ({
  background: active ? color : 'transparent',
  color: active ? '#0a0e14' : '#8ea1b8',
  border: '1px solid #2a3a52',
  borderRadius: 8,
  padding: '4px 10px',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: active ? 600 : 400,
  marginRight: 6,
  marginBottom: 6,
});

/** Per-bay Inspector content. Zero clutter: only live, data-backed controls. */
export function InspectorPanels({ bay, state, dispatch }: BayPanelProps): React.ReactElement {
  if (bay === 1) {
    const stages = ['300 K', '4 K', '100 mK', '15 mK'];
    return (
      <div>
        <div style={sectionStyle}>
          <div style={labelStyle}>BAY 1 MODE</div>
          {(['fridge', 'mzi', 'tweezer'] as const).map((m) => (
            <button key={m} style={btnStyle(state.bay1Mode === m, '#4fc3f7')} onClick={() => dispatch({ bay1Mode: m })}>
              {m === 'fridge' ? 'Dilution refrigerator' : m === 'mzi' ? 'Photonic MZI chip' : 'Tweezer grid'}
            </button>
          ))}
        </div>
        <div style={sectionStyle}>
          <div style={labelStyle}>CRYO STAGES (04 / 06 REFERENCE)</div>
          {stages.map((s) => (
            <div key={s} style={{ color: '#cfe2f7', fontSize: 12.5, display: 'flex', justifyContent: 'space-between' }}>
              <span>{s}</span>
              <span style={{ color: '#4e5d70', fontFamily: 'monospace' }}>
                {s === '15 mK' ? 'Q_max 12 mW' : s === '100 mK' ? 'Q_max 100 mW' : s === '4 K' ? 'Q_max 1.5 W' : 'ambient'}
              </span>
            </div>
          ))}
          <div style={{ color: '#6f8aa8', fontSize: 11, marginTop: 8, lineHeight: 1.5 }}>
            T₁ ≈ {TRANSMON.t1_us.typical} µs · T₂ ≈ {TRANSMON.t2_us.typical} µs · ZZ crosstalk ≈{' '}
            {TRANSMON.zz_crosstalk_khz.typical} kHz · readout {TRANSMON.readout_fidelity.typical}
          </div>
        </div>
      </div>
    );
  }

  if (bay === 2) {
    return (
      <div>
        <div style={sectionStyle}>
          <div style={labelStyle}>LAYER-PEEL SLICER (L)</div>
          <button style={btnStyle(state.peelMode === 'exploded', '#ffc107')} onClick={() => dispatch({ peelMode: state.peelMode === 'exploded' ? 'assembled' : 'exploded' })}>
            {state.peelMode === 'exploded' ? 'Exploded stack' : 'Assembled stack'}
          </button>
          <div style={{ color: '#8ea1b8', fontSize: 11, marginTop: 8 }}>
            Focal plane: layer {state.peelDepth} / 12 (0 = met3 top · 11 = substrate)
          </div>
          <input
            type="range"
            min={0}
            max={12}
            step={1}
            value={state.peelDepth}
            onChange={(e) => dispatch({ peelDepth: parseInt(e.target.value) })}
            style={{ width: '100%', accentColor: '#ffc107' }}
          />
        </div>
        <div style={sectionStyle}>
          <div style={labelStyle}>VERIFIED SKY130A Q4 PRIMITIVES (PHASE 0)</div>
          {Q4_PRIMITIVES.map((p) => (
            <div key={p.cell_name} style={{ marginBottom: 8 }}>
              <div style={{ color: '#ffd98a', fontSize: 12.5, fontFamily: 'monospace' }}>{p.cell_name}</div>
              <div style={{ color: '#8ea1b8', fontSize: 11 }}>{p.function}</div>
              <div style={{ color: '#5fd48a', fontSize: 10.5, fontFamily: 'monospace' }}>
                {p.gate_count} gates · DRC=0 · LVS ✓ · PEX ✓
              </div>
            </div>
          ))}
        </div>
        <div style={sectionStyle}>
          <div style={labelStyle}>SKY130A STACK DATA</div>
          {(['li1', 'met1', 'met2', 'met3'] as const).map((k) => {
            const m = (REFERENCE.semiconductor.parameters.sky130a.metal_stack as Record<string, { sheet_resistance_ohm_per_sq: number; thickness_nm: number }>)[k];
            return (
              <div key={k} style={{ color: '#cfe2f7', fontSize: 12, display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace' }}>
                <span>{k}</span>
                <span style={{ color: '#4e5d70' }}>{m.thickness_nm} nm · {m.sheet_resistance_ohm_per_sq} Ω/sq</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (bay === 3) {
    return (
      <div>
        <div style={sectionStyle}>
          <div style={labelStyle}>PACKAGE</div>
          <button style={btnStyle(state.npuAttached, '#b08cff')} onClick={() => dispatch({ npuAttached: !state.npuAttached })}>
            {state.npuAttached ? 'NPU attached ✓' : 'Swap in multi-radix NPU'}
          </button>
        </div>
        <div style={sectionStyle}>
          <div style={labelStyle}>TILE POWER MODEL (05 REFERENCE · P = C·V²·f)</div>
          <div style={{ color: '#cfe2f7', fontSize: 12, lineHeight: 1.7 }}>
            <div>CPU Cluster — {((REFERENCE.architecture.parameters.riscv_rv32im.power_mw_at_100mhz_130nm / 1000) * 8).toFixed(2)} W idle model</div>
            <div>Systolic TPU 8×8 — {(REFERENCE.architecture.parameters.systolic_array_tpu.power_w.tpu_v1 * 0.08).toFixed(1)} W idle model</div>
            <div>SIMT GPU — {(REFERENCE.architecture.parameters.simt_gpu.power_w.intel_iris_xe_155u_tdp * 0.35).toFixed(1)} W idle model</div>
            <div>Unified Memory — 2.1 W idle model</div>
          </div>
        </div>
        <div style={sectionStyle}>
          <div style={labelStyle}>OPERATING ENVELOPE</div>
          <div style={{ color: '#8ea1b8', fontSize: 11.5, lineHeight: 1.6 }}>
            RV32IM VDD 0.8–1.2 V · TPU VDD 0.7–0.9 V · junction max 125 °C · Si thermal-runaway alarm 200 °C
          </div>
        </div>
      </div>
    );
  }

  if (bay === 4) {
    return (
      <div>
        <div style={sectionStyle}>
          <div style={labelStyle}>SOA BREAKDOWN BENCH</div>
          <div style={{ color: '#cfe2f7', fontSize: 12.5, lineHeight: 1.7 }}>
            SKY130 gate-oxide TDDB ceiling: <b style={{ color: '#ff9d7a' }}>V_gs = 1.95 V</b> (E-model γ ≈ 300 dec/V).
            Drive VDD above the ceiling to trigger a real breakdown capture — the vault records the last 100 ms and
            opens the Forensic Autopsy automatically.
          </div>
        </div>
        <div style={sectionStyle}>
          <div style={labelStyle}>ELECTRO-THERMAL PHYSICS</div>
          <div style={{ color: '#6f8aa8', fontSize: 11.5, lineHeight: 1.6 }}>
            Live MNA solver + Fourier heat diffusion + failure thresholds from 06_failure_physics_thresholds.json.
            (Wired into the scene in Milestone 5 — this bay currently shows the instrumented stage.)
          </div>
        </div>
      </div>
    );
  }

  if (bay === 5) {
    return (
      <div>
        <div style={sectionStyle}>
          <div style={labelStyle}>OFFLINE PHYSICS LIBRARY</div>
          <div style={{ color: '#cfe2f7', fontSize: 12.5, marginBottom: 8 }}>
            {state.integrity.done
              ? state.integrity.allVerified
                ? `All ${state.integrity.verified}/${state.integrity.total} datasets SHA-256 verified ✓`
                : `Integrity failure — ${state.integrity.verified}/${state.integrity.total} verified`
              : 'Verifying SHA-256 integrity…'}
          </div>
          <button
            style={btnStyle(true, '#9fd0ff')}
            onClick={() => dispatch({ libraryOpen: true })}
          >
            Browse library (key 5)
          </button>
        </div>
        <div style={sectionStyle}>
          <div style={labelStyle}>PROVENANCE</div>
          <div style={{ color: '#6f8aa8', fontSize: 11, lineHeight: 1.6, fontFamily: 'monospace' }}>
            manifest {REFERENCE.manifest.format}
            <br />
            generated {REFERENCE.manifest.generatedAt.slice(0, 10)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ color: '#8ea1b8', fontSize: 12.5, lineHeight: 1.7 }}>
      Select a bay (1–5) or click a glowing pedestal. The Inspector Drawer opens per bay; Esc returns to the overview.
    </div>
  );
}
