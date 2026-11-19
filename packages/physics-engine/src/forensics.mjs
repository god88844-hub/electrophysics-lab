/**
 * Forensic Autopsy report generation — JSON + Markdown export of a tripped
 * failure event with its governing physics, waveform window and evidence
 * provenance. All numbers flow from the solver + 06_failure_physics_thresholds.json.
 */

/**
 * @param {object} args
 * @param {object} args.event threshold event from evaluateThresholds
 * @param {Array<object>} args.samples ring-buffer window [{t, vdd, nodes, currents, temps}]
 * @param {object} args.thresholds threshold table used (for the report record)
 * @param {object} args.meta {simTimeS, playbackScale, gitSha?, datasetSha256}
 * @returns {object} structured report (JSON-serialisable)
 */
export function buildForensicReport(args) {
  const { event, samples, thresholds, meta = {} } = args;
  const peak = {
    vddV: samples.length ? Math.max(...samples.map((s) => s.vdd ?? 0)) : null,
    vgsV: samples.length ? Math.max(...samples.map((s) => s.vgsMax ?? 0)) : null,
    currentA: samples.length ? Math.max(...samples.map((s) => s.iMax ?? 0)) : null,
    tempC: samples.length ? Math.max(...samples.map((s) => s.tempMaxC ?? 0)) : null,
  };
  const oscilloscope = samples.map((s) => ({
    t: Number(s.t.toFixed(6)),
    vdd: s.vdd,
    vout_q4: s.nodes?.vout_q4,
    vout_bin: s.nodes?.vout_bin,
    i_vdd: s.currents?.['VDD'],
    trace_c: s.temps?.traceC,
    pcb_c: s.temps?.pcbC,
  }));
  return {
    format: 'invention-lab/forensic-autopsy/1',
    generatedAt: new Date().toISOString(),
    failure: {
      type: event.type,
      severity: event.severity,
      value: event.value,
      threshold: event.threshold,
      node: event.node ?? null,
      governingEquation: event.equation,
      note: event.note,
    },
    peaks: peak,
    oscilloscope,
    thresholdsUsed: thresholds,
    meta,
  };
}

/** Markdown rendering of a forensic report (for export / chat review). */
export function reportToMarkdown(report) {
  const f = report.failure;
  const lines = [];
  lines.push('# Forensic Autopsy Report');
  lines.push('');
  lines.push(`- **Failure**: \`${f.type}\` (severity: ${f.severity})`);
  lines.push(`- **Triggered**: ${f.value} vs threshold ${f.threshold}${f.node ? ` at node \`${f.node}\`` : ''}`);
  lines.push(`- **Governing physics**: ${f.governingEquation}`);
  lines.push(`- **Finding**: ${f.note}`);
  lines.push('');
  lines.push('## Peaks over the recorded window');
  lines.push('');
  lines.push('| Quantity | Peak |');
  lines.push('|---|---|');
  lines.push(`| VDD | ${report.peaks.vddV} V |`);
  lines.push(`| Vgs max | ${report.peaks.vgsV} V |`);
  lines.push(`| Current max | ${report.peaks.currentA} A |`);
  lines.push(`| Temp max | ${report.peaks.tempC} °C |`);
  lines.push('');
  lines.push('## Threshold provenance');
  lines.push('');
  lines.push('```json');
  lines.push(JSON.stringify(report.thresholdsUsed, null, 2));
  lines.push('```');
  if (report.meta?.datasetSha256) {
    lines.push('');
    lines.push(`Reference dataset SHA-256: \`${report.meta.datasetSha256}\``);
  }
  lines.push('');
  lines.push(`*Generated ${report.generatedAt} — simulation evidence only, not physical validation.*`);
  return lines.join('\n');
}
