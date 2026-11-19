import React from 'react';
import type { LabState } from '../state/store.js';
import { Q4_PRIMITIVES, REFERENCE, TRANSMON } from '../data/reference.js';
import { physicsClient } from '../physics/physicsClient.js';
import { worldRef } from '../worldRef.js';

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
  const ph = state.physics;
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
          <div style={{ color: state.physics && state.physics.cryoK > 1.2 ? '#ff9d7a' : '#9fd8ff', fontSize: 12.5, marginTop: 6, fontFamily: 'monospace' }}>
            mixing chamber: {ph ? (ph.cryoK * 1000).toFixed(1) : '15.0'} mK
          </div>
        </div>
        <div style={sectionStyle}>
          <div style={labelStyle}>MICROWAVE DRIVE LOAD (dT/dt = (Q_load − Q_cool)/C_th)</div>
          <div style={{ color: '#8ea1b8', fontSize: 11, marginBottom: 6 }}>
            Q_load = {state.drivePowerMW} mW · quench threshold 12 mW
          </div>
          <input
            type="range"
            min={1}
            max={2000}
            step={1}
            value={state.drivePowerMW}
            onChange={(e) => {
              const mw = parseInt(e.target.value);
              dispatch({ drivePowerMW: mw });
              physicsClient.setParams({ drivePowerW: mw / 1000 });
            }}
            style={{ width: '100%', accentColor: '#4fc3f7' }}
          />
          <div style={{ color: '#6f8aa8', fontSize: 11, marginTop: 6, lineHeight: 1.5 }}>
            Overdrive the 15 mK stage to trigger a real thermal quench — T₁/T₂ collapse across the die. Physical
            recovery in a real fridge ≈ 4 h.
          </div>
        </div>
        <div style={sectionStyle}>
          <div style={labelStyle}>TRANSMON (04 REFERENCE)</div>
          <div style={{ color: '#6f8aa8', fontSize: 11, lineHeight: 1.5 }}>
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
          <div style={labelStyle}>LIVE ELECTRO-THERMAL BENCH (MNA + HEAT PDE)</div>
          <div style={{ color: '#cfe2f7', fontSize: 12, fontFamily: 'monospace', lineHeight: 1.7 }}>
            VDD {ph ? ph.vdd.toFixed(2) : '1.80'} V · V_out(Q4) {ph ? ph.voutQ4.toFixed(2) : '—'} V
            <br />
            I_rail {ph ? Math.abs(ph.iRail * 1000).toFixed(1) : '—'} mA · T_trace {ph ? ph.traceC.toFixed(0) : '27'} °C
            <br />
            T_junction {ph ? ph.junctionC.toFixed(0) : '27'} °C {ph?.melted ? '· RAIL FUSED' : ''}
          </div>
          <div style={{ color: '#8ea1b8', fontSize: 11, marginTop: 8, marginBottom: 4 }}>
            Supply voltage VDD (SOA ceiling 1.95 V · nominal 1.80 V)
          </div>
          <input
            type="range"
            min={0}
            max={3.3}
            step={0.01}
            value={state.vddSlider}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              dispatch({ vddSlider: v });
              physicsClient.setParams({ vdd: v });
            }}
            style={{ width: '100%', accentColor: '#ffc107' }}
          />
          <div style={{ color: '#8ea1b8', fontSize: 11, marginTop: 8, marginBottom: 4 }}>Q4 gate drive level</div>
          {[0, 0.6, 1.2, 1.8].map((lvl) => (
            <button
              key={lvl}
              style={btnStyle(false, '#ffc107')}
              onClick={() => physicsClient.setParams({ gateLevel: lvl })}
            >
              {lvl} V
            </button>
          ))}
          <div style={{ color: '#8ea1b8', fontSize: 11, marginTop: 8, marginBottom: 4 }}>Load resistance</div>
          {[10000, 100000, 1000000].map((r) => (
            <button
              key={r}
              style={btnStyle(false, '#ffc107')}
              onClick={() => physicsClient.setParams({ loadR: r })}
            >
              {r >= 1e6 ? '1 MΩ' : `${r / 1000} kΩ`}
            </button>
          ))}
        </div>
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
          <div style={labelStyle}>TILE THERMAL ZONES (LIVE HEAT PDE)</div>
          <div style={{ color: '#cfe2f7', fontSize: 12, fontFamily: 'monospace', lineHeight: 1.7 }}>
            {ph && ph.pcbC !== undefined
              ? `board max ${ph.pcbC.toFixed(0)} °C (FR-4 delam 260 °C)`
              : 'waiting for solver…'}
          </div>
          <div style={{ color: '#8ea1b8', fontSize: 11, marginTop: 8, marginBottom: 4 }}>
            Tile power scale (push past 260 °C to trip delamination)
          </div>
          <input
            type="range"
            min={1}
            max={30}
            step={1}
            defaultValue={5}
            onChange={(e) => {
              const v = parseInt(e.target.value) / 10;
              physicsClient.setParams({ tilePowerScale: v });
            }}
            style={{ width: '100%', accentColor: '#26c6da' }}
          />
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
            Push Bay 2's VDD slider past the ceiling — the vault records the failure, opens the Forensic Autopsy, and
            shows the slow-motion replay.
          </div>
        </div>
        <div style={sectionStyle}>
          <div style={labelStyle}>RECOVERY</div>
          <button
            style={btnStyle(false, '#ff9d5a')}
            onClick={() => {
              physicsClient.reset();
              worldRef.current?.clearFailureVisuals();
              dispatch({ forensic: null, autopsyOpen: false, replayIndex: null });
            }}
          >
            Reset bench &amp; clear faults
          </button>
          <button
            style={btnStyle(state.thermalView, '#ff5030')}
            onClick={() => {
              const on = !state.thermalView;
              dispatch({ thermalView: on });
              worldRef.current?.setThermalView(on);
            }}
          >
            Thermal camera (T)
          </button>
        </div>
        <div style={sectionStyle}>
          <div style={labelStyle}>ELECTRO-THERMAL ENGINE</div>
          <div style={{ color: '#6f8aa8', fontSize: 11.5, lineHeight: 1.6 }}>
            MNA (Shichman–Hodges + CLM, numeric Jacobian, source stepping) + 2D FTCS Fourier heat diffusion +
            threshold set from 06_failure_physics_thresholds.json. 240 Hz in a Web Worker.
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
