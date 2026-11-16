// scope.js — output renderers: waveforms, Bode plots, tables, histograms,
// validation reports. Every renderer is a pure function of the result object
// produced by a lab engine.

const COLORS = ['#4f9cf9', '#f0a94f', '#5fd48a', '#e060d8', '#5fd4d0', '#e0e06a'];

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else node.setAttribute(k, v);
  }
  for (const child of children) {
    if (child == null) continue;
    node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return node;
}

function table(headers, rows, { numCols = [] } = {}) {
  const t = el('table', { class: 'data' });
  const tr = el('tr');
  for (const h of headers) tr.appendChild(el('th', { text: h }));
  t.appendChild(tr);
  for (const row of rows) {
    const r = el('tr');
    row.forEach((cell, i) => {
      const td = el('td', numCols.includes(i) ? { class: 'num' } : {});
      td.textContent = String(cell);
      r.appendChild(td);
    });
    t.appendChild(r);
  }
  return t;
}

function verdictChip(v) {
  const sym = { pass: '✔', warn: '⚠', fail: '✘', unknown: '?', none: '–' }[v] || '?';
  const label = v === 'none' ? 'NOT TESTED' : v.toUpperCase();
  const chip = el('span', { class: 'chip', 'data-v': v, text: `${sym} ${label}` });
  return chip;
}

function fmt(v, digits = 4) {
  if (v == null || Number.isNaN(v)) return '—';
  if (v === 0) return '0';
  const a = Math.abs(v);
  if (a >= 1e5 || a < 1e-3) return v.toExponential(3);
  return String(Number(v.toPrecision(digits)));
}

/** generic line chart on a canvas */
function lineChart(container, series, { xLabel = '', yLabel = '', logX = false, yPad = 0.1, formatX = (v) => fmt(v, 3), formatY = (v) => fmt(v, 3) }) {
  const canvas = el('canvas', { class: 'scope-canvas' });
  canvas.style.height = '180px';
  container.appendChild(canvas);
  const draw = () => {
    const w = canvas.clientWidth || 600, h = 180;
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#12161d';
    ctx.fillRect(0, 0, w, h);
    const all = series.flatMap((s) => s.points);
    if (!all.length) return;
    let minX = Math.min(...all.map((p) => p[0])), maxX = Math.max(...all.map((p) => p[0]));
    let minY = Math.min(...all.map((p) => p[1])), maxY = Math.max(...all.map((p) => p[1]));
    if (logX) { minX = Math.log10(Math.max(1e-12, minX)); maxX = Math.log10(Math.max(1e-12, maxX)); }
    const padY = (maxY - minY) * yPad + 1e-12;
    minY -= padY; maxY += padY;
    const L = 46, R = 12, T = 10, B = 22;
    const tx = (v) => L + ((logX ? Math.log10(Math.max(1e-12, v)) : v) - minX) / (maxX - minX) * (w - L - R);
    const ty = (v) => T + (1 - (v - minY) / (maxY - minY)) * (h - T - B);
    // axes
    ctx.strokeStyle = '#2a3546';
    ctx.beginPath();
    ctx.moveTo(L, T); ctx.lineTo(L, h - B); ctx.lineTo(w - R, h - B);
    ctx.stroke();
    ctx.fillStyle = '#8ea1b8';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'center';
    for (let i = 0; i <= 4; i++) {
      const v = minX + (maxX - minX) * i / 4;
      const x = tx(logX ? Math.pow(10, v) : v);
      ctx.fillText(logX ? '1e' + v.toFixed(1) : formatX(v), x, h - 6);
    }
    ctx.textAlign = 'right';
    for (let i = 0; i <= 3; i++) {
      const v = minY + (maxY - minY) * i / 3;
      ctx.fillText(formatY(v), L - 5, ty(v) + 3);
    }
    // series
    series.forEach((s, si) => {
      ctx.strokeStyle = s.color || COLORS[si % COLORS.length];
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      s.points.forEach((p, i) => {
        const x = tx(p[0]), y = ty(p[1]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });
    // legend
    ctx.textAlign = 'left';
    series.forEach((s, si) => {
      ctx.fillStyle = s.color || COLORS[si % COLORS.length];
      ctx.fillText(s.label, L + 8 + si * 130, T + 12);
    });
    if (xLabel) { ctx.fillStyle = '#8ea1b8'; ctx.textAlign = 'right'; ctx.fillText(xLabel, w - R, h - 6); }
    if (yLabel) { ctx.textAlign = 'left'; ctx.fillText(yLabel, L + 2, T + 12 + series.length * 0 - 12 + 0); }
  };
  requestAnimationFrame(draw);
  return canvas;
}

/** digital step waveform (logic probes / clocks) */
function stepWaveform(container, probes, radix) {
  const canvas = el('canvas', { class: 'scope-canvas' });
  canvas.style.height = Math.min(340, 60 + probes.length * 56) + 'px';
  container.appendChild(canvas);
  const draw = () => {
    const w = canvas.clientWidth || 600, h = canvas.height;
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#12161d';
    ctx.fillRect(0, 0, w, h);
    if (!probes.length) return;
    const maxT = Math.max(1, ...probes.flatMap((p) => p.rec.times));
    const L = 70, R = 12, T = 8;
    const rowH = 52;
    probes.forEach((p, pi) => {
      const y0 = T + pi * rowH;
      // label
      ctx.fillStyle = '#e8eef7';
      ctx.font = '11px ui-monospace, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(p.rec.label, 8, y0 + 18);
      const amp = rowH - 22;
      const yHigh = y0 + 4, yLow = y0 + 4 + amp;
      ctx.strokeStyle = '#2a3546';
      ctx.beginPath();
      ctx.moveTo(L, yLow); ctx.lineTo(w - R, yLow);
      ctx.stroke();
      const tx = (t) => L + (t / maxT) * (w - L - R);
      ctx.strokeStyle = COLORS[pi % COLORS.length];
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      let lastX = tx(p.rec.times[0] ?? 0);
      const vals = p.rec.values, times = p.rec.times;
      // map digit -> level
      const level = (v) => (v === 'Z' ? null : v / Math.max(1, radix - 1));
      let prevY = null, prevT = 0;
      for (let i = 0; i < vals.length; i++) {
        const lv = level(vals[i]);
        const x = tx(times[i]);
        const y = lv == null ? yLow : yLow + (1 - lv) * amp;
        if (lv == null) {
          // Z: draw hatched midline segment
          ctx.save();
          ctx.strokeStyle = '#666';
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(prevX ?? x, (yHigh + yLow) / 2);
          ctx.lineTo(x, (yHigh + yLow) / 2);
          ctx.stroke();
          ctx.restore();
        } else {
          if (prevY != null) { ctx.lineTo(x, prevY); }
          ctx.lineTo(x, y);
        }
        prevX = x; prevY = y; prevT = times[i];
        // digit label at transitions
        ctx.fillStyle = '#8ea1b8';
        ctx.font = '9px ui-monospace, monospace';
        ctx.textAlign = 'left';
        if (x - lastX > 22) {
          ctx.fillText(String(vals[i]), lastX + 3, yHigh - 1);
        }
        lastX = x;
        ctx.strokeStyle = COLORS[pi % COLORS.length];
      }
      // final segment to right edge
      if (prevY != null && prevT < maxT) { ctx.lineTo(tx(maxT), prevY); }
      ctx.stroke();
    });
  };
  requestAnimationFrame(draw);
}

// ---------------------------------------------------------------------------
// per-lab renderers
// ---------------------------------------------------------------------------
export const Scope = {
  container: null,

  renderResult(labId, result, diagram, consoleLines) {
    const c = this.container;
    c.innerHTML = '';
    if (!result) return;
    const fn = this[`render_${labId}`];
    if (fn) fn.call(this, c, result, diagram);
    else c.appendChild(el('div', { class: 'muted', text: 'No scope for this lab — check the Report/Data tabs.' }));
  },

  render_logic(c, res) {
    if (!res.ok) {
      c.appendChild(el('div', { class: 'err', text: res.problems.join('\n') }));
      return;
    }
    const probes = Object.entries(res.probes).map(([id, rec]) => ({ id, rec }));
    if (!probes.length) {
      c.appendChild(el('div', { class: 'muted', text: 'No probes in the design — add Probe blocks to see waveforms.' }));
    }
    stepWaveform(c, probes, res.stats.radix);
    c.appendChild(el('div', { class: 'muted', text: `Events: ${res.stats.events}, simulated time: ${res.stats.maxTime} ticks (1 tick = 1 ps nominal), radix ${res.stats.radix}` }));
  },

  render_chip(c, res) {
    if (!res.ok) {
      c.appendChild(el('div', { class: 'err', text: (res.problems || []).join('\n') }));
      return;
    }
    if (res.analysis === 'tran') {
      const series = Object.entries(res.meters).map(([id, vals], i) => ({
        label: id, color: COLORS[i % COLORS.length],
        points: res.t.map((t, k) => [t, vals[k]]),
      }));
      if (series.length) lineChart(c, series, { xLabel: 't (s)', yLabel: 'V / A' });
      else c.appendChild(el('div', { class: 'muted', text: 'No meters — add Voltmeter/Ammeter blocks.' }));
      const rows = Object.entries(res.elements).map(([id, e]) => [
        id, e.label, fmt(avg(e.power)), fmt(max(e.current)),
      ]);
      c.appendChild(el('div', { text: 'Element power (avg) and current (peak):' }));
      c.appendChild(table(['Block', 'Element', 'Avg power (W)', 'Peak |I| (A)'], rows, { numCols: [2, 3] }));
    } else if (res.analysis === 'ac') {
      const series = Object.entries(res.meters).map(([id, m], i) => ({
        label: `${id} (dB)`, color: COLORS[i % COLORS.length],
        points: res.f.map((f, k) => [f, m.db[k]]),
      }));
      lineChart(c, series, { xLabel: 'f (Hz, log)', yLabel: 'dB', logX: true });
      const rows = Object.entries(res.meters).map(([id, m]) => {
        // -3dB crossing
        let f3 = null;
        for (let i = 1; i < m.db.length; i++) {
          if (m.db[i] <= -3 && m.db[i - 1] > -3) {
            const t = (-3 - m.db[i - 1]) / (m.db[i] - m.db[i - 1]);
            f3 = res.f[i - 1] + t * (res.f[i] - res.f[i - 1]);
            break;
          }
        }
        return [id, f3 ? `${fmt(f3)} Hz` : 'no crossing', fmt(min(m.db)), fmt(max(m.mag))];
      });
      c.appendChild(table(['Meter', '−3 dB point', 'Min dB', 'Max |V|'], rows, { numCols: [] }));
    } else if (res.analysis === 'dc-sweep') {
      const series = Object.entries(res.meters).map(([id, vals], i) => ({
        label: id, color: COLORS[i % COLORS.length],
        points: res.sweepVals.map((v, k) => [v, vals[k]]),
      }));
      lineChart(c, series, { xLabel: `${res.sweep.param} of ${res.sweep.blockId}`, yLabel: 'V / A' });
    } else {
      // DC operating point
      c.appendChild(el('div', { text: 'Node voltages:' }));
      c.appendChild(table(['Node', 'Connected', 'V'], Object.entries(res.nodes).map(([n, v]) => [n, (res.nodeAliases[n] || []).join(', '), fmt(v)]), { numCols: [2] }));
      c.appendChild(el('div', { text: 'Elements:' }));
      c.appendChild(table(
        ['Block', 'Element', 'V', 'I', 'Power (W)', 'Tj est (°C)', 'Noise (Vrms, 1MHz)'],
        res.elements.map((e) => [e.blockId, e.label, fmt(e.v), fmt(e.i), fmt(e.power), e.tempC ? fmt(e.tempC) : '—', e.noiseVRms ? fmt(e.noiseVRms) : '—']),
        { numCols: [2, 3, 4, 5, 6] },
      ));
      const total = res.elements.reduce((a, e) => a + (e.kind === 'vsource' || e.kind === 'isource' ? -e.power : e.power), 0);
      c.appendChild(el('div', { class: 'muted', text: `Power balance check: net ≈ ${fmt(total)} W (should be ≈ 0; delivered − dissipated). gmin used: ${res.gminUsed}.` }));
    }
  },

  render_cpu(c, res) {
    if (!res.ok) {
      c.appendChild(el('div', { class: 'err', text: (res.problems || []).join('\n') }));
      return;
    }
    const cpu = res.cpu;
    c.appendChild(el('div', { text: `Registers:` }));
    c.appendChild(table(
      ['R0', 'R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'Z', 'N', 'C'],
      [[...cpu.regs, cpu.flags.z ? 1 : 0, cpu.flags.n ? 1 : 0, cpu.flags.c ? 1 : 0]],
      { numCols: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
    ));
    c.appendChild(el('div', { text: `Pipeline: ${cpu.stats.cycles} cycles, ${cpu.stats.retired} retired, ${cpu.stats.stalls} load-use stalls, ${cpu.stats.flushes} squashed slots (${cpu.stats.flushes / 2} taken branches). Halted: ${cpu.halted ? 'yes' : 'NO'}` }));
    if (cpu.ports.length) {
      c.appendChild(el('div', { text: 'I/O port writes:' }));
      c.appendChild(table(['Cycle', 'Port', 'Value'], cpu.ports.map((p) => [p.cycle, p.port, p.value]), { numCols: [0, 1, 2] }));
    }
    if (cpu.trace.length) {
      c.appendChild(el('div', { text: 'Pipeline trace (last cycles):' }));
      c.appendChild(table(
        ['Cycle', 'IF', 'ID', 'EX', 'ME', 'WB', 'Note'],
        cpu.trace.slice(-24).map((t) => [t.cycle, t.if, t.id, t.ex, t.me, t.wb, [t.stall ? 'STALL' : '', t.flush ? 'FLUSH' : ''].join(' ')]),
      ));
    }
  },

  render_rv32i(c, res) {
    if (!res.cpu) {
      c.appendChild(el('div',{class:'err',text:(res.problems||[]).join('\n')}));
      return;
    }
    const cpu=res.cpu;
    c.appendChild(el('div',{text:'RV32I 2.1 architectural execution: '+cpu.status+' ('+cpu.stopReason+')'}));
    c.appendChild(el('div',{class:'muted',text:
      'This is a functional instruction-level model, not cycle timing or physical validation. An EBREAK is an architectural trap and only a teaching-harness stop.'}));
    c.appendChild(el('div',{text:'Retired instructions: '+cpu.retired+', final PC: 0x'+cpu.pc.toString(16).padStart(8,'0')}));
    const rows=Array.from({length:8},(_,r)=>
      Array.from({length:4},(_,c)=>'x'+(r*4+c)+' = 0x'+cpu.regs[r*4+c].toString(16).padStart(8,'0')));
    c.appendChild(table(['Registers 0–7','8–15','16–23','24–31'],rows));
    if(cpu.traces.length) {
      c.appendChild(el('div',{text:'Instruction trace (last 32 retired instructions):'}));
      c.appendChild(table(['PC','Instruction','Mnemonic','Next PC'],
        cpu.traces.slice(-32).map(t=>[
          '0x'+t.pc.toString(16).padStart(8,'0'),
          '0x'+t.word.toString(16).padStart(8,'0'),
          t.mnemonic,
          '0x'+t.nextPc.toString(16).padStart(8,'0'),
        ])));
    }
    if(cpu.writes.length) {
      c.appendChild(el('div',{text:'Memory writes (up to 32 shown):'}));
      c.appendChild(table(['Address','Bytes','Value'],cpu.writes.slice(0,32).map(w=>[
        '0x'+w.address.toString(16).padStart(8,'0'),w.size,'0x'+w.value.toString(16),
      ])));
    }
    c.appendChild(el('div',{class:'muted',text:'Physical validation: NONE. Real-world fabrication success percentage: NOT ESTIMATED.'}));
  },

  render_ai(c, res) {
    if(res?.kind==='onnx-quantized'){
      this.render_onnx_quantized(c,res);
      return;
    }
    if(res?.kind==='onnx-subset'){
      this.render_onnx_subset(c,res);
      return;
    }
    const m = res.matmul;
    c.appendChild(el('div', { text: `Matmul ${m.dims.join('×')} in ${m.precision}: max |C−C_f64| = ${m.err.toExponential(3)}` }));
    c.appendChild(el('div', { text: 'C (computed):' }));
    c.appendChild(matrixTable(m.C));
    const p = res.perf;
    c.appendChild(el('div', { text: 'Systolic array model:' }));
    c.appendChild(table(
      ['Grid', 'Tiles', 'Cycles', 'Latency (µs)', 'Utilization', 'GMAC/s', 'Energy (nJ)'],
      [[p.grid, p.tiles, p.cycles, fmt(p.latencyUs), `${(p.utilization * 100).toFixed(1)}%`, fmt(p.gmacs), fmt(p.energyNJ)]],
      { numCols: [1, 2, 3, 5, 6] },
    ));
    c.appendChild(el('div', { class: 'muted', text: p.assumptions.join(' ') }));
    c.appendChild(el('div', { text: 'MLP on XOR (trained in-run):' }));
    c.appendChild(table(
      ['Input', 'Target', 'Prediction'],
      res.mlp.targets.map((t, i) => [`[${[[0, 0], [0, 1], [1, 0], [1, 1]][i]}]`, t, res.mlp.predictions[i].toFixed(3)]),
      { numCols: [2] },
    ));
  },

  render_onnx_quantized(c,res){
    c.appendChild(el('div',{text:'ONNX quantization subset — '+res.caseId+' (opset 13)'}));
    c.appendChild(el('div',{class:'muted',text:
      'MODEL-ONLY JS arithmetic. Real ONNX Runtime runs ONLY in CI; no measured GPU/TPU timing, silicon reliability or fabrication yield.'}));
    c.appendChild(table(['Executed operations','Output dtype','Shape'],[[
      res.operations.join(' → '),res.output.dtype,res.output.shape.join('×')
    ]]));
    const render=(label,t)=>{
      c.appendChild(el('div',{text:label+' ('+t.dtype+')'}));
      const [rows,cols]=t.shape;
      c.appendChild(table(Array.from({length:cols},(_,i)=>'C'+i),
        Array.from({length:rows},(_,i)=>t.values.slice(i*cols,(i+1)*cols).map(x=>
          typeof x==='number'?Number(x.toPrecision(8)):x))));
    };
    if(res.quantized)render('Quantized intermediate',res.quantized);
    render('Result',res.output);
    c.appendChild(el('div',{class:'muted',text:
      'Physical validation: NONE. Real-world build success: Not estimated. Supported only: bounded 2D per-tensor int8/uint8 QLinearMatMul, QuantizeLinear and DequantizeLinear.'}));
  },

  render_onnx_subset(c,res){
    c.appendChild(el('div',{text:'ONNX subset — '+res.caseId+' (opset '+res.operatorSet+', '+res.dtype+')'}));
    c.appendChild(el('div',{class:'muted',text:
      'MODEL-ONLY result: ONNX Runtime is NOT executing in the browser. Independent ONNX Runtime CPU comparisons are performed separately in CI. No GPU/TPU timing or physical validation.'}));
    c.appendChild(el('div',{text:'Graph execution trace:'}));
    c.appendChild(table(['Node','Operator','Output','Shape'],
      res.trace.map(t=>[t.node,t.op,t.output,t.shape.join('×')])));
    for(const [name,t] of Object.entries(res.outputs)){
      c.appendChild(el('div',{text:'Output '+name+' · '+t.shape.join('×')+' tensor'}));
      const [rows,cols]=t.shape;
      c.appendChild(table(Array.from({length:cols},(_,i)=>'C'+i),
        Array.from({length:rows},(_,i)=>t.values.slice(i*cols,(i+1)*cols).map(x=>Number(x.toPrecision(7))))));
    }
    c.appendChild(el('div',{class:'muted',text:
      'Real-world build success: Not estimated. Supported only: 2D float32 MatMul/Gemm/Add/Relu/Sigmoid/Softmax.'}));
  },

  render_quantum(c, res) {
    if (!res.ok) {
      c.appendChild(el('div', { class: 'err', text: (res.problems || []).join('\n') }));
      return;
    }
    c.appendChild(el('div', { text: `${res.n} qudit(s), d=${res.d}, ${res.gates} gates, ${res.shots} shots. Outcomes (probability = exact; count = sampled ± SE):` }));
    const outcomes = Object.keys(res.probs).filter((k) => res.probs[k] > 1e-12 || res.counts[k]);
    const rows = outcomes.map((k) => [
      `|${k}>`,
      `${(res.probs[k] * 100).toFixed(2)}%`,
      res.counts[k] || 0,
      res.standardErrors[k] ? `±${res.standardErrors[k].toFixed(4)}` : '—',
    ]);
    c.appendChild(table(['Outcome', 'Exact P', 'Counts', 'Std. error'], rows, { numCols: [1, 2, 3] }));
    // bar chart
    const canvas = el('canvas', { class: 'scope-canvas' });
    canvas.style.height = '150px';
    c.appendChild(canvas);
    requestAnimationFrame(() => {
      const w = canvas.clientWidth || 600, h = 150;
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#12161d';
      ctx.fillRect(0, 0, w, h);
      const shown = outcomes.slice(0, 32);
      const bw = (w - 60) / Math.max(1, shown.length);
      const maxP = Math.max(...shown.map((k) => res.probs[k]), 0.01);
      shown.forEach((k, i) => {
        const bh = (res.probs[k] / maxP) * (h - 50);
        ctx.fillStyle = COLORS[0];
        ctx.fillRect(50 + i * bw, h - 30 - bh, Math.max(2, bw - 4), bh);
        ctx.fillStyle = '#8ea1b8';
        ctx.font = '10px ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(k, 50 + i * bw + bw / 2, h - 16);
        if (res.probs[k] > 0.001) {
          ctx.fillText((res.probs[k] * 100).toFixed(1) + '%', 50 + i * bw + bw / 2, h - 34 - bh);
        }
      });
    });
    if (res.stateVector) {
      c.appendChild(el('div', { text: 'State vector (Re, Im):' }));
      c.appendChild(table(
        ['State', 'Re', 'Im', 'P'],
        res.stateVector.filter((s) => s.prob > 1e-12).map((s) => [`|${s.state}>`, s.amp.re.toFixed(6), s.amp.im.toFixed(6), s.prob.toFixed(6)]),
        { numCols: [1, 2, 3] },
      ));
    }
  },

  render_optics(c, res) {
    if (!res.ok) {
      c.appendChild(el('div', { class: 'err', text: (res.problems || []).join('\n') }));
      return;
    }
    c.appendChild(el('div', { text: 'Thin-lens ray trace (paraxial):' }));
    c.appendChild(table(
      ['Quantity', 'Value'],
      [
        ['Object distance u', `${fmt(res.u)} mm`],
        ['Focal length f', `${fmt(res.f)} mm`],
        ['Image distance v = 1/(1/f − 1/u)', res.v === Infinity ? '∞ (object at focal point)' : `${fmt(res.v)} mm`],
        ['Magnification m = −v/u', res.v === Infinity ? '∞' : fmt(res.m, 3)],
        ['Screen distance d', `${fmt(res.d)} mm`],
        ['Spot diameter on screen', res.v === Infinity ? '—' : `${fmt(res.spot, 3)} mm`],
      ],
    ));
    drawRayDiagram(c, res);
    c.appendChild(el('div', { class: 'muted', text: 'Assumptions: paraxial optics, thin lens, no aberrations, no diffraction. Valid only for |u|, |v| >> aperture.' }));
  },

  render_crosslab(c, res) {
    c.appendChild(el('h2', { text: res.title }));
    for (const step of res.steps) {
      c.appendChild(el('div', { text: `▸ ${step.name}` }));
    }
    const chip = verdictChip(res.verdict);
    c.appendChild(el('div', {}, chip, el('span', { class: 'muted', text: `  ${res.consistency.check}: ${JSON.stringify(res.consistency.note)}` })));
    c.appendChild(table(
      Object.keys(res.consistency).filter((k) => !['check', 'note'].includes(k)),
      [Object.keys(res.consistency).filter((k) => !['check', 'note'].includes(k)).map((k) => {
        const v = res.consistency[k];
        return typeof v === 'number' ? fmt(v, 3) : JSON.stringify(v);
      })],
    ));
  },

  // ---- validation report -----------------------------------------------------
  renderReport(report) {
    const c = this.container;
    c.innerHTML = '';
    if (!report) return;
    c.appendChild(el('div', {}, el('b', { text: `Design report: ${report.title || report.diagramName}` }), el('span', { text: '   ' }), verdictChip(report.verdict)));
    c.appendChild(el('div', { class: 'muted', text: `Generated ${new Date(report.generatedAt).toLocaleTimeString()} — verdicts follow George Box's rule: models are wrong; we state how wrong they may be.` }));

    // evidence stages (audit): distinguish the kind of evidence behind the verdict
    if (report.stages) {
      const stageRows = [
        ['Execution (the requested analysis ran)', report.stages.execution],
        ['Mathematical correctness (checks vs references)', report.stages.mathematical],
        ['Cross-solver agreement (independent implementations agree)', report.stages.crossSolver],
        ['Independent physical validation (measurements)', report.stages.physical],
      ];
      const st = table(['Evidence stage', 'Status'], stageRows);
      report.physicalValidation && st.rows[3].cells[1].appendChild(
        el('span', { class: 'muted', text: ` — ${report.physicalValidation.note}` }));
      c.appendChild(st);
    }
    if (report.assumptions.length && report.verdict === 'warn') {
      c.appendChild(el('div', { class: 'warn', text: `⚠ Verdict capped at WARN: ${report.assumptions.length} uncalibrated assumption(s) — a design without tolerance evidence can never receive an unconditional PASS.` }));
    }

    c.appendChild(el('h3', { text: 'Checks' }));
    if (!report.checks.length) c.appendChild(el('div', { class: 'muted', text: 'No checks (empty design).' }));
    const rows = report.checks.map((chk) => [
      chk.name,
      fmt(chk.actual, 5), fmt(chk.expected, 5), chk.tolerance == null ? '—' : fmt(chk.tolerance, 4),
      chk.note || '',
    ]);
    const t = table(['Check', 'Actual', 'Expected', 'Tolerance', 'Evidence / note'], rows);
    // inject verdict chips into first column
    report.checks.forEach((chk, i) => {
      const cell = t.rows[i + 1].cells[0];
      cell.prepend(verdictChip(chk.verdict), document.createTextNode(' '));
    });
    c.appendChild(t);

    if (report.assumptions.length) {
      c.appendChild(el('h3', { text: 'Assumptions & unknowns (unvalidated)' }));
      const ul = el('ul');
      for (const a of report.assumptions) ul.appendChild(el('li', { text: a }));
      c.appendChild(ul);
    } else {
      c.appendChild(el('div', { class: 'muted', text: 'No untracked assumptions: every block has provenance and every numeric parameter has a tolerance.' }));
    }
    if (report.provenance.length) {
      c.appendChild(el('h3', { text: 'Model provenance' }));
      const ul = el('ul');
      for (const p of report.provenance) ul.appendChild(el('li', { text: p }));
      c.appendChild(ul);
    }
  },
};

function matrixTable(M) {
  return table(
    M[0].map((_, j) => `col ${j}`),
    M.map((row) => row.map((v) => fmt(v, 4))),
    { numCols: M[0].map((_, j) => j) },
  );
}
function avg(a) { return a.reduce((x, y) => x + y, 0) / Math.max(1, a.length); }
function max(a) { return Math.max(...a.map(Math.abs)); }
function min(a) { return Math.min(...a); }

function drawRayDiagram(c, res) {
  const canvas = el('canvas', { class: 'scope-canvas' });
  canvas.style.height = '200px';
  c.appendChild(canvas);
  requestAnimationFrame(() => {
    const w = canvas.clientWidth || 600, h = 200;
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#12161d';
    ctx.fillRect(0, 0, w, h);
    const span = Math.max(res.u + (isFinite(res.v) ? res.v : res.f * 2), res.f * 2, 100);
    const scale = (w - 80) / span;
    const midY = h / 2;
    const lensX = 40 + res.u * scale;
    // axis
    ctx.strokeStyle = '#2a3546';
    ctx.beginPath(); ctx.moveTo(20, midY); ctx.lineTo(w - 20, midY); ctx.stroke();
    // lens
    ctx.strokeStyle = '#5fd4d0';
    ctx.beginPath();
    ctx.moveTo(lensX, midY - 50); ctx.quadraticCurveTo(lensX + 14, midY, lensX, midY + 50);
    ctx.quadraticCurveTo(lensX - 14, midY, lensX, midY - 50);
    ctx.stroke();
    // object point
    const objX = 40, objY = midY - res.h * scale;
    ctx.fillStyle = '#f0a94f';
    ctx.beginPath(); ctx.arc(objX, objY, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#8ea1b8';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('object', objX, objY - 8);
    // three paraxial rays to the lens, then to image point (if real image)
    ctx.strokeStyle = '#4f9cf9';
    if (isFinite(res.v) && res.v > 0) {
      const imgX = lensX + res.v * scale;
      const imgY = midY + res.h * res.m * scale * -1;
      for (const targetY of [midY, objY, midY + 50]) {
        ctx.beginPath();
        ctx.moveTo(objX, objY);
        ctx.lineTo(lensX, targetY === midY ? midY : (targetY === objY ? objY : midY + 50));
        ctx.lineTo(imgX, imgY);
        ctx.stroke();
      }
      ctx.fillStyle = '#f06a5f';
      ctx.beginPath(); ctx.arc(imgX, imgY, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillText('image', imgX + 6, imgY - 8);
    } else {
      // virtual image: rays diverge; draw backward extensions dashed
      ctx.setLineDash([4, 4]);
      const backX = isFinite(res.v) ? lensX + res.v * scale : lensX;
      const imgY = midY - res.h * res.m * scale * -1;
      for (const targetY of [midY, objY, midY + 50]) {
        ctx.beginPath();
        ctx.moveTo(objX, objY);
        ctx.lineTo(lensX, targetY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(lensX, targetY);
        ctx.lineTo(backX, imgY);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }
  });
}
