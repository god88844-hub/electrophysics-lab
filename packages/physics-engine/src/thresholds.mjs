/**
 * Failure-threshold evaluation. Threshold values come from
 * data/reference-library/06_failure_physics_thresholds.json (callers pass the
 * relevant subset in as `thresholds`), keeping this module data-driven.
 *
 * NOTE on FR-4 delamination: the verified reference gives 260 °C
 * (fr4_delamination_c, CRC/Ioffe data). Where older draft copy said 400 °C,
 * the verified 260 °C value is authoritative here.
 */

/**
 * Evaluate a snapshot against the failure thresholds.
 * @param {object} snapshot {vgsMaxV, traceTempC, pcbTempC, junctionTempC, driveLoadW}
 * @param {object} t {vgsThresholdV, cuMeltingC, fr4DelaminationC, siThermalRunawayC, cryoQuench15mkW, gammaDecPerV, hardBreakdownV}
 * @returns {Array<{type: string, severity: 'warn'|'fault', value: number, threshold: number, node?: string, equation: string, note: string}>}
 */
export function evaluateThresholds(snapshot, t) {
  const events = [];
  if (snapshot.vgsMaxV !== undefined && t.vgsThresholdV !== undefined) {
    if (snapshot.vgsMaxV > t.vgsThresholdV) {
      const hard = t.hardBreakdownV !== undefined && snapshot.vgsMaxV >= t.hardBreakdownV;
      events.push({
        type: 'gate_oxide_breakdown',
        severity: hard ? 'fault' : 'fault',
        value: snapshot.vgsMaxV,
        threshold: t.vgsThresholdV,
        node: snapshot.vgsMaxNode,
        equation: 'E-model TDDB: ln(TTF) = ln(A) − γ·Vgs (γ ≈ ' + (t.gammaDecPerV ?? 300) + ' dec/V)',
        note: hard
          ? `Vgs ${snapshot.vgsMaxV.toFixed(2)} V ≥ hard-breakdown ${t.hardBreakdownV} V — gate oxide destroyed (shorted gate)`
          : `Vgs ${snapshot.vgsMaxV.toFixed(2)} V exceeded the SKY130 core SOA ceiling ${t.vgsThresholdV} V — TDDB accelerated; oxide breakdown`,
      });
    }
  }
  if (snapshot.traceTempC !== undefined && t.cuMeltingC !== undefined) {
    if (snapshot.traceTempC >= t.cuMeltingC) {
      events.push({
        type: 'trace_fusing',
        severity: 'fault',
        value: snapshot.traceTempC,
        threshold: t.cuMeltingC,
        node: snapshot.traceNode,
        equation: 'P = I²·R(T); Onderdonk: I_f = S·√((T_melt − T_amb)/(t·ρ₀·α))',
        note: `Trace reached ${snapshot.traceTempC.toFixed(0)} °C ≥ Cu melting ${t.cuMeltingC} °C — open-circuit fusing`,
      });
    } else if (snapshot.pcbTempC !== undefined && t.fr4DelaminationC !== undefined && snapshot.pcbTempC >= t.fr4DelaminationC) {
      events.push({
        type: 'pcb_delamination',
        severity: 'fault',
        value: snapshot.pcbTempC,
        threshold: t.fr4DelaminationC,
        node: snapshot.pcbNode,
        equation: 'ρ·cp·∂T/∂t = k·∇²T + q − h·(T − T_amb)',
        note: `FR-4 reached ${snapshot.pcbTempC.toFixed(0)} °C ≥ delamination ${t.fr4DelaminationC} °C — board-level thermal fault`,
      });
    } else if (snapshot.junctionTempC !== undefined && t.siThermalRunawayC !== undefined && snapshot.junctionTempC >= t.siThermalRunawayC) {
      events.push({
        type: 'si_thermal_runaway',
        severity: 'warn',
        value: snapshot.junctionTempC,
        threshold: t.siThermalRunawayC,
        node: snapshot.junctionNode,
        equation: 'I_leak(T) = I₀·exp(−E_g/(2·k_B·T)) — doubles every ≈10 °C above 300 K',
        note: `Junction ${snapshot.junctionTempC.toFixed(0)} °C ≥ Si thermal-runaway onset ${t.siThermalRunawayC} °C`,
      });
    }
  }
  if (snapshot.driveLoadW !== undefined && t.cryoQuench15mkW !== undefined) {
    if (snapshot.driveLoadW > t.cryoQuench15mkW) {
      events.push({
        type: 'cryo_quench',
        severity: 'fault',
        value: snapshot.driveLoadW,
        threshold: t.cryoQuench15mkW,
        equation: 'dT/dt = (Q_load − Q_cool(T))/C_th; Q_cool(15 mK) = 12 mW (Bluefors XLD400)',
        note: `Mixing-chamber load ${snapshot.driveLoadW} W > cooling capacity ${t.cryoQuench15mkW} W — thermal quench`,
      });
    }
  }
  return events;
}

/**
 * Physics-valid remediation proposals ("AI Fix & Re-Test").
 * Each fix names its source constant so nothing is invented.
 */
export function proposeFix(event, context = {}) {
  switch (event.type) {
    case 'gate_oxide_breakdown':
      return {
        title: 'Clamp VDD to the SKY130 nominal rail',
        description: `Clamp VDD ≤ ${context.vddNominalV ?? 1.8} V (02_semiconductor_pdk_silicon.json nominal_vdd_v; the 1.95 V ceiling is the SOA limit, ${event.value.toFixed(2)} V was applied).`,
        patch: { vddMaxV: context.vddNominalV ?? 1.8 },
        source: '02_semiconductor_pdk_silicon.json → parameters.sky130a.nominal_vdd_v',
      };
    case 'trace_fusing':
      return {
        title: 'Widen the supply trace (halve current density)',
        description: 'Double the trace width: J ∝ I/(w·t) halves, Joule heating I²R per length quarters with the wider cross-section, holding T below the 1085 °C Cu melting point.',
        patch: { traceWidthFactor: 2 },
        source: '06_failure_physics_thresholds.json → cu_melting_c = 1085',
      };
    case 'pcb_delamination':
      return {
        title: 'Spread tile power / raise convection',
        description: `Hold the board below the FR-4 delamination threshold (${event.threshold} °C) by spreading dissipation and adding airflow (h↑).`,
        patch: { convectionScale: 3 },
        source: '06_failure_physics_thresholds.json → fr4_delamination_c = 260',
      };
    case 'si_thermal_runaway':
      return {
        title: 'Reduce tile power before the runaway onset',
        description: `Keep the junction below ${event.threshold} °C (leakage doubles every ~10 °C above it).`,
        patch: { tilePowerScale: 0.5 },
        source: '06_failure_physics_thresholds.json → si_thermal_runaway_c = 200',
      };
    case 'cryo_quench':
      return {
        title: 'Reduce microwave drive below the 12 mW budget',
        description: `Cap drive power at ≤ ${(event.threshold * 1000).toFixed(0)} mW so Q_load ≤ Q_cool(15 mK). Physical recovery in a real fridge takes ≈ 4 h.`,
        patch: { drivePowerMaxW: event.threshold },
        source: '06_failure_physics_thresholds.json → cryo_quench_15mk_w = 0.012',
      };
    default:
      return null;
  }
}
