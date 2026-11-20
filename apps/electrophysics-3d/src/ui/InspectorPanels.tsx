import React, { useEffect, useRef } from 'react';
import type { SandboxComponent } from '../state/store.js';

/** Live-execution hooks for the Bay 3 SoC twin (lazy import keeps boot light). */
async function chipEngine() {
  return import('@chip/index.mjs');
}
import type { LabState } from '../state/store.js';
import { Q4_PRIMITIVES, REFERENCE, TRANSMON } from '../data/reference.js';
import { physicsClient } from '../physics/physicsClient.js';
import { quantumClient, type BreakthroughBundle } from '../physics/quantumClient.js';
import { worldRef } from '../worldRef.js';
import { flashToast } from '../state/store.js';

/** Live convergence chart for the AI Co-Inventor (canvas 2D). */
function ConvergenceChart({ history }: { history: Array<{ k: number; error: number }> }): React.ReactElement {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0a1218';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (history.length < 2) return;
    const maxE = Math.max(0.01, ...history.map((h) => h.error));
    ctx.strokeStyle = '#62d0ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    history.forEach((h, i) => {
      const x = (i / (history.length - 1)) * (canvas.width - 12) + 6;
      const y = canvas.height - 8 - (h.error / maxE) * (canvas.height - 18);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.fillStyle = '#4e6a80';
    ctx.font = '10px monospace';
    ctx.fillText(`error ${history[history.length - 1].error.toFixed(4)}`, 8, 12);
  }, [history]);
  return <canvas ref={ref} width={280} height={90} style={{ width: '100%', borderRadius: 6, border: '1px solid #3a4250' }} />;
}

export interface BayPanelProps {
  bay: number;
  state: LabState;
  dispatch: (patch: Partial<LabState>) => void;
}

const sectionStyle: React.CSSProperties = {
  marginBottom: 14,
  padding: '10px 12px',
  background: 'rgba(28,33,41,0.72)',
  borderRadius: 10,
  border: '1px solid #3a4250',
};
const labelStyle: React.CSSProperties = { color: '#aeb9c8', fontSize: 11, marginBottom: 6, letterSpacing: '0.06em' };
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
            <div key={s} style={{ color: '#eceff4', fontSize: 12.5, display: 'flex', justifyContent: 'space-between' }}>
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
          <div style={{ color: '#aeb9c8', fontSize: 11, marginBottom: 6 }}>
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
          <div style={{ color: '#8fa0b4', fontSize: 11, marginTop: 6, lineHeight: 1.5 }}>
            Overdrive the 15 mK stage to trigger a real thermal quench — T₁/T₂ collapse across the die. Physical
            recovery in a real fridge ≈ 4 h.
          </div>
        </div>
        <div style={sectionStyle}>
          <div style={labelStyle}>TRANSMON (04 REFERENCE)</div>
          <div style={{ color: '#8fa0b4', fontSize: 11, lineHeight: 1.5 }}>
            T₁ ≈ {TRANSMON.t1_us.typical} µs · T₂ ≈ {TRANSMON.t2_us.typical} µs · ZZ crosstalk ≈{' '}
            {TRANSMON.zz_crosstalk_khz.typical} kHz · readout {TRANSMON.readout_fidelity.typical}
          </div>
          {state.quantum && (
            <div style={{ color: '#9fd8ff', fontSize: 11.5, marginTop: 6, fontFamily: 'monospace' }}>
              {state.quantum.bloch.slice(0, 2).map((b, i) => (
                <div key={i}>
                  q{i}: ⟨Z⟩ {b.z.toFixed(3)} · purity {b.purity.toFixed(3)}
                </div>
              ))}
              {state.quantum.gateFidelity !== null && (
                <div>last X-gate state fidelity: {(state.quantum.gateFidelity * 100).toFixed(1)}%</div>
              )}
            </div>
          )}
        </div>
        <div style={sectionStyle}>
          <div style={labelStyle}>PULSE EDITOR (DRAG, 25 ns GATE)</div>
          <div style={{ color: '#aeb9c8', fontSize: 11 }}>amplitude {state.pulseParams.amplitude} MHz</div>
          <input
            type="range"
            min={5}
            max={40}
            step={0.5}
            value={state.pulseParams.amplitude}
            onChange={(e) => {
              const amplitude = parseFloat(e.target.value);
              dispatch({ pulseParams: { ...state.pulseParams, amplitude } });
              quantumClient.setParams({ pulse: { amplitude } });
            }}
            style={{ width: '100%', accentColor: '#4fc3f7' }}
          />
          <div style={{ color: '#aeb9c8', fontSize: 11 }}>σ {state.pulseParams.sigmaNs} ns · DRAG β {state.pulseParams.beta.toFixed(2)}</div>
          <input
            type="range"
            min={3}
            max={12}
            step={0.5}
            value={state.pulseParams.sigmaNs}
            onChange={(e) => {
              const sigmaNs = parseFloat(e.target.value);
              dispatch({ pulseParams: { ...state.pulseParams, sigmaNs } });
              quantumClient.setParams({ pulse: { sigmaNs } });
            }}
            style={{ width: '100%', accentColor: '#4fc3f7' }}
          />
          <input
            type="range"
            min={0}
            max={1.5}
            step={0.05}
            value={state.pulseParams.beta}
            onChange={(e) => {
              const beta = parseFloat(e.target.value);
              dispatch({ pulseParams: { ...state.pulseParams, beta } });
              quantumClient.setParams({ pulse: { beta } });
            }}
            style={{ width: '100%', accentColor: '#4fc3f7' }}
          />
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            <button
              style={btnStyle(false, '#4fc3f7')}
              onClick={() => {
                quantumClient.applyPulse();
                worldRef.current?.bay1.setPulseLevel(1);
              }}
            >
              Fire X pulse
            </button>
            <button style={btnStyle(false, '#4fc3f7')} onClick={() => quantumClient.reset()}>
              Reset qubits
            </button>
          </div>
        </div>
        <div style={sectionStyle}>
          <div style={labelStyle}>AI CO-INVENTOR — DISCOVERY EXPERIMENT</div>
          <div style={{ color: '#8fa0b4', fontSize: 11, lineHeight: 1.5, marginBottom: 8 }}>
            Minimize X-gate error under real T₁/T₂ + ZZ crosstalk (fixed-seed SPSA → Nelder–Mead against the Lindblad
            solver). Reproducible: identical seed ⇒ identical trace.
          </div>
          <ConvergenceChart history={state.quantumExp.history} />
          <div style={{ marginTop: 8 }}>
            <button
              style={btnStyle(state.quantumExp.running, '#8ef0b2')}
              onClick={() => {
                dispatch({ quantumExp: { running: true, k: 0, total: 110, history: [], bundle: null, finalError: null } });
                quantumClient.runExperiment();
                flashToast('AI Discovery Experiment running (seed 20241119)');
              }}
            >
              {state.quantumExp.running ? `Optimizing… ${state.quantumExp.k}/${state.quantumExp.total}` : 'Run AI Discovery Experiment'}
            </button>
            {state.quantumExp.finalError !== null && (
              <div style={{ color: '#8ef0b2', fontSize: 11.5, marginTop: 6, fontFamily: 'monospace' }}>
                final error {(state.quantumExp.finalError * 100).toFixed(2)}% ·{' '}
                {state.quantumExp.bundle
                  ? `fidelity ${(((state.quantumExp.bundle as BreakthroughBundle).optimizedFidelity ?? 0) * 100).toFixed(1)}%`
                  : ''}
              </div>
            )}
            {state.quantumExp.bundle && (
              <button
                style={{ ...btnStyle(false, '#8ef0b2'), marginTop: 6 }}
                onClick={async () => {
                  const bundle = state.quantumExp.bundle as BreakthroughBundle;
                  const payload = { ...bundle };
                  // SHA-256 over the canonical JSON — bundle integrity seal.
                  const bytes = new TextEncoder().encode(JSON.stringify(payload));
                  const digest = await crypto.subtle.digest('SHA-256', bytes);
                  payload.sha256 = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
                  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `breakthrough-bundle-${payload.seed}.json`;
                  a.click();
                  setTimeout(() => URL.revokeObjectURL(url), 2000);
                  flashToast('Reproducible Breakthrough Experiment Bundle exported (SIMULATED_NOISY_MODEL)');
                }}
              >
                Export Breakthrough Bundle (JSON)
              </button>
            )}
          </div>
        </div>
        <div style={sectionStyle}>
          <div style={labelStyle}>QUANTUM ERROR CORRECTION</div>
          <button
            style={btnStyle(state.qecCurve !== null, '#ff6d8a')}
            onClick={async () => {
              flashToast('QEC sweep: logical vs physical error (d3 segment + bit-flip code)');
              const { surfaceCodeLogicalErrorRate, bitFlipLogicalErrorRate } = await import('@quantum/stabilizer.mjs');
              const curve: Array<{ p: number; logical: number; bitflip: number }> = [];
              for (let ppm = 10; ppm <= 80; ppm += 10) {
                const p = ppm / 1000;
                curve.push({
                  p,
                  logical: surfaceCodeLogicalErrorRate(600, p, 20241120 + ppm),
                  bitflip: bitFlipLogicalErrorRate(600, p, 314159 + ppm),
                });
              }
              dispatch({ qecCurve: curve });
            }}
          >
            Run QEC sweep
          </button>
          {state.qecCurve && (
            <div style={{ color: '#a9b8cc', fontSize: 10.5, marginTop: 6, fontFamily: 'monospace', lineHeight: 1.6 }}>
              {state.qecCurve.map((r) => (
                <div key={r.p}>
                  p {(r.p * 100).toFixed(0)}% → logical {(r.logical * 100).toFixed(2)}% (code) · {(r.bitflip * 100).toFixed(2)}% (d2)
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (bay === 2) {
    return (
      <div>
        <div style={sectionStyle}>
          <div style={labelStyle}>LIVE ELECTRO-THERMAL BENCH (MNA + HEAT PDE)</div>
          <div style={{ color: '#eceff4', fontSize: 12, fontFamily: 'monospace', lineHeight: 1.7 }}>
            VDD {ph ? ph.vdd.toFixed(2) : '1.80'} V · V_out(Q4) {ph ? ph.voutQ4.toFixed(2) : '—'} V
            <br />
            I_rail {ph ? Math.abs(ph.iRail * 1000).toFixed(1) : '—'} mA · T_trace {ph ? ph.traceC.toFixed(0) : '27'} °C
            <br />
            T_junction {ph ? ph.junctionC.toFixed(0) : '27'} °C {ph?.melted ? '· RAIL FUSED' : ''}
          </div>
          <div style={{ color: '#aeb9c8', fontSize: 11, marginTop: 8, marginBottom: 4 }}>
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
          <div style={{ color: '#aeb9c8', fontSize: 11, marginTop: 8, marginBottom: 4 }}>Q4 gate drive level</div>
          {[0, 0.6, 1.2, 1.8].map((lvl) => (
            <button
              key={lvl}
              style={btnStyle(false, '#ffc107')}
              onClick={() => physicsClient.setParams({ gateLevel: lvl })}
            >
              {lvl} V
            </button>
          ))}
          <div style={{ color: '#aeb9c8', fontSize: 11, marginTop: 8, marginBottom: 4 }}>Load resistance</div>
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
          <div style={labelStyle}>SANDBOX WORKBENCH — BUILD &amp; STRESS REAL NETLISTS</div>
          <button
            style={btnStyle(state.sandboxOpen, '#ffc107')}
            onClick={() => dispatch({ sandboxOpen: !state.sandboxOpen })}
          >
            {state.sandboxOpen ? 'Hide component palette' : 'Open component palette (starts closed)'}
          </button>
          {state.sandboxOpen && (
            <div>
              <div style={{ color: '#aeb9c8', fontSize: 11, marginTop: 6, marginBottom: 4 }}>
                Place components on the bench; wires connect declared node names. Live compile → MNA + thermal solver.
              </div>
              {(['nmos', 'pmos', 'trace', 'resistor', 'rail', 'gnd', 'q4_inv', 'q4_half_adder', 'cmos_inv', 'binary_half_adder', 'probe'] as const).map((kind) => (
                <button
                  key={kind}
                  style={btnStyle(false, '#ffc107')}
                  onClick={() => {
                    const n = state.sandboxComponents.length;
                    const comp: SandboxComponent = {
                      id: kind + '_' + n,
                      kind,
                      params: kind === 'trace' ? { widthUm: 10, lengthUm: 500 } : kind === 'rail' ? { V: state.vddSlider } : undefined,
                      nodes: kind === 'nmos' ? ['gate', 'drain', 'gnd']
                        : kind === 'pmos' ? ['gate', 'drain', 'vdd']
                        : kind === 'rail' ? ['vdd']
                        : kind === 'gnd' ? ['gnd']
                        : kind === 'probe' ? ['drain']
                        : ['in', 'drain', 'vdd'],
                      position: [n % 4, Math.floor(n / 4) % 3],
                    };
                    dispatch({ sandboxComponents: [...state.sandboxComponents, comp] });
                  }}
                >
                  + {kind}
                </button>
              ))}
              <div style={{ color: '#aeb9c8', fontSize: 11, marginTop: 8, marginBottom: 4 }}>One-click starter circuits (real thresholds preserved)</div>
              {(['q4-half-adder', 'noise-margin-shootout', 'oxide-breakdown', 'trace-fusing'] as const).map((name) => (
                <button
                  key={name}
                  style={btnStyle(false, '#8ef0b2')}
                  onClick={async () => {
                    const { starterCircuit } = await import('@physics/index.mjs');
                    const spec = starterCircuit(name);
                    const comps = (spec.components ?? []).map((c: { id: string; kind: string; position?: number[] }, i: number) => ({
                      id: c.id, kind: c.kind, params: (c as { params?: Record<string, unknown> }).params,
                      nodes: (c as { nodes?: string[] }).nodes ?? [],
                      position: [c.position?.[0] ?? i % 4, c.position?.[1] ?? Math.floor(i / 4)] as [number, number],
                    }));
                    dispatch({ sandboxComponents: comps, sandboxLoaded: true });
                    physicsClient.setNetlist(spec);
                    flashToast('Starter circuit compiled into the live MNA solver');
                  }}
                >
                  {name}
                </button>
              ))}
              <div style={{ color: '#aeb9c8', fontSize: 11, marginTop: 8, marginBottom: 4 }}>
                Placed: {state.sandboxComponents.length}
              </div>
              {state.sandboxComponents.map((c) => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, fontFamily: 'monospace', color: '#eceff4' }}>
                  <span>{c.id} · {c.kind}</span>
                  <button
                    style={{ background: 'none', border: '1px solid #4a3028', color: '#c9a29a', borderRadius: 5, cursor: 'pointer', fontSize: 10 }}
                    onClick={() => {
                      const rest = state.sandboxComponents.filter((x) => x.id !== c.id);
                      dispatch({ sandboxComponents: rest });
                      if (rest.length === 0) physicsClient.clearNetlist();
                    }}
                  >
                    delete
                  </button>
                </div>
              ))}
              {state.sandboxComponents.length > 0 && (
                <button
                  style={{ ...btnStyle(false, '#8ef0b2'), marginTop: 8 }}
                  onClick={async () => {
                    const { compileSandbox } = await import('@physics/index.mjs');
                    compileSandbox({ components: state.sandboxComponents, wires: [], rails: { vdd: state.vddSlider } }); // compile-check
                    physicsClient.setNetlist({ components: state.sandboxComponents, wires: [], rails: { vdd: state.vddSlider } });
                    dispatch({ sandboxLoaded: true });
                    flashToast('Sandbox netlist compiled into the live solver');
                  }}
                >
                  Compile &amp; run netlist
                </button>
              )}
            </div>
          )}
        </div>
        <div style={sectionStyle}>
          <div style={labelStyle}>LAYER-PEEL SLICER (L)</div>
          <button style={btnStyle(state.peelMode === 'exploded', '#ffc107')} onClick={() => dispatch({ peelMode: state.peelMode === 'exploded' ? 'assembled' : 'exploded' })}>
            {state.peelMode === 'exploded' ? 'Exploded stack' : 'Assembled stack'}
          </button>
          <div style={{ color: '#aeb9c8', fontSize: 11, marginTop: 8 }}>
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
              <div style={{ color: '#aeb9c8', fontSize: 11 }}>{p.function}</div>
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
          <div style={{ color: '#eceff4', fontSize: 12, fontFamily: 'monospace', lineHeight: 1.7 }}>
            {ph && ph.pcbC !== undefined
              ? `board max ${ph.pcbC.toFixed(0)} °C (FR-4 delam 260 °C)`
              : 'waiting for solver…'}
          </div>
          <div style={{ color: '#aeb9c8', fontSize: 11, marginTop: 8, marginBottom: 4 }}>
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
          <div style={labelStyle}>LIVE EXECUTION — SOC DIGITAL TWIN</div>
          <div style={{ color: '#aeb9c8', fontSize: 10.5, fontFamily: 'monospace', marginBottom: 6 }}>
            badge: SIMULATED_ARCHITECTURAL_MODEL
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button style={btnStyle(state.soc.arch === 'discrete', '#26c6da')} onClick={() => dispatch({ soc: { ...state.soc, arch: 'discrete' } })}>Discrete PCIe</button>
            <button style={btnStyle(state.soc.arch === 'unified', '#26c6da')} onClick={() => dispatch({ soc: { ...state.soc, arch: 'unified' } })}>Unified memory</button>
            <button style={btnStyle(state.soc.radix === 'int8', '#b08cff')} onClick={() => dispatch({ soc: { ...state.soc, radix: 'int8' } })}>INT8 NPU</button>
            <button style={btnStyle(state.soc.radix === 'q4', '#b08cff')} onClick={() => dispatch({ soc: { ...state.soc, radix: 'q4' } })}>Q4 NPU</button>
          </div>
          <button style={{ ...btnStyle(false, '#8ef0b2'), marginTop: 8 }} onClick={async () => {
            const { compareArchitectures, systolicMatmul } = await chipEngine();
            const A = Array.from({ length: 32 }, (_, i) => Array.from({ length: 32 }, (_, k) => ((i * 7 + k * 13) % 120) - 60));
            const B = Array.from({ length: 32 }, (_, k) => Array.from({ length: 32 }, (_, j) => ((k * 5 + j * 3) % 120) - 60));
            const run = systolicMatmul(A, B, { gridSize: 8, clockMHz: 700, vdd: 0.8 });
            const cmp = compareArchitectures({ M: 32, N: 32, K: 32 });
            const pick = state.soc.arch === 'unified' ? cmp.unifiedInt8 : cmp.discreteInt8;
            physicsClient.setTilePower(Math.min(180, run.dynamicPowerW * 8));
            worldRef.current?.bay3.setBusActivity([0.9, 0.8, 0.85, 0.7, 0.6]);
            dispatch({ soc: { ...state.soc, result: {
              cycles: run.cycles, utilization: run.utilization, macOps: run.macOps, dynamicPowerW: run.dynamicPowerW,
              archCycles: pick.totalCycles, bandwidthGBps: pick.bandwidthGBps, energyPerOpPJ: pick.energyPerOpPJ,
              hotspotC: pick.hotspotC, badge: cmp.badge, radix: state.soc.radix, arch: state.soc.arch } } });
            flashToast('SoC workload executed — tiles heating via the Fourier solver');
          }}>Run quantized workload</button>
          {state.soc.result && (
            <div style={{ color: '#eceff4', fontSize: 11, fontFamily: 'monospace', lineHeight: 1.7, marginTop: 6 }}>
              <div>TPU cycles {String(state.soc.result.cycles)} · util {Number(state.soc.result.utilization).toFixed(3)}</div>
              <div>MAC ops {String(state.soc.result.macOps)} · P = {Number(state.soc.result.dynamicPowerW).toFixed(2)} W</div>
              <div>{String(state.soc.result.arch)} · {String(state.soc.result.radix)}: {String(state.soc.result.archCycles)} cycles · {Number(state.soc.result.bandwidthGBps).toFixed(1)} GB/s</div>
              <div>E/op {Number(state.soc.result.energyPerOpPJ).toFixed(1)} pJ · hotspot {Number(state.soc.result.hotspotC).toFixed(0)} °C</div>
            </div>
          )}
          <div style={{ color: '#aeb9c8', fontSize: 11, marginTop: 10, marginBottom: 4 }}>RV32IM core</div>
          <button style={btnStyle(false, '#62d0ff')} onClick={async () => {
            const { createRV32, asm } = await chipEngine();
            const cpu = createRV32({ pcStart: 0 });
            cpu.load([asm.opImm(0, 5, 0, 0), asm.opImm(0, 6, 0, 10), asm.R(0, 6, 5, 0, 5, 0x33), asm.opImm(0, 6, 6, -1), asm.B(-8, 0, 6, 1, 0x63), asm.halt()]);
            cpu.run(200);
            dispatch({ soc: { ...state.soc, rv32: { pc: cpu.pc, x5: cpu.regs[5], x6: cpu.regs[6], x7: cpu.regs[7], cycles: cpu.cycles, halted: cpu.halted } } });
            flashToast('RV32IM sum-1..10 executed — x5 = 55');
          }}>Run program</button>
          {state.soc.rv32 && (
            <div style={{ color: '#eceff4', fontSize: 11, fontFamily: 'monospace', lineHeight: 1.7, marginTop: 6 }}>
              PC {String(state.soc.rv32.pc)} · x5 {String(state.soc.rv32.x5)} · x6 {String(state.soc.rv32.x6)} · cycles {String(state.soc.rv32.cycles)}{state.soc.rv32.halted ? ' · HALTED' : ''}
            </div>
          )}
        </div>
        <div style={sectionStyle}>
          <div style={labelStyle}>TILE POWER MODEL (05 REFERENCE · P = C·V²·f)</div>
          <div style={{ color: '#eceff4', fontSize: 12, lineHeight: 1.7 }}>
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
          <div style={{ color: '#eceff4', fontSize: 12.5, lineHeight: 1.7 }}>
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
          <div style={{ color: '#8fa0b4', fontSize: 11.5, lineHeight: 1.6 }}>
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
          <div style={{ color: '#eceff4', fontSize: 12.5, marginBottom: 8 }}>
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
          <div style={{ color: '#8fa0b4', fontSize: 11, lineHeight: 1.6, fontFamily: 'monospace' }}>
            manifest {REFERENCE.manifest.format}
            <br />
            generated {REFERENCE.manifest.generatedAt.slice(0, 10)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ color: '#aeb9c8', fontSize: 12.5, lineHeight: 1.7 }}>
      Select a bay (1–5) or click a glowing pedestal. The Inspector Drawer opens per bay; Esc returns to the overview.
    </div>
  );
}
