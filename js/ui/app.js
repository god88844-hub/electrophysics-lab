// app.js — Invention Lab application shell: tabs, toolbar, run pipeline,
// undo/redo, save/load/export, keyboard shortcuts, beginner mode.

import { allLabs, getLab, allExamples, getExample, allComponents } from '../core/registry.js';
import { Diagram } from '../core/diagram.js';
import { CanvasEditor } from './canvas.js';
import { Palette } from './palette.js';
import { Inspector } from './inspector.js';
import { Scope } from './scope.js';
import { toSpiceDeck } from '../labs/chip/spice-export.js';
import { assemble, disassemble } from '../labs/cpu/assembler.js';

const CANVAS_LABS = new Set(['logic', 'chip', 'quantum', 'optics']);

export class App {
  constructor(root) {
    this.root = root;
    this.state = { labId: null };
    this.diagrams = {};       // labId -> Diagram
    this.history = {};        // labId -> { stack: [], idx }
    this.editor = null;
    this.palette = null;
    this.inspector = null;
    this.scope = Scope;
    this._buildDom();
  }

  // ------------------------------------------------------------------ dom --
  _buildDom() {
    this.root.innerHTML = `
      <header id="topbar">
        <div class="logo">⚗ Invention<span>Lab</span></div>
        <nav id="labtabs" aria-label="Labs"></nav>
        <div class="spacer"></div>
        <button id="btn-new" class="small" title="New design">New</button>
        <select id="examples" aria-label="Examples"><option value="">Examples…</option></select>
        <button id="btn-save" class="small" title="Download project JSON (Ctrl+S)">Save</button>
        <button id="btn-load" class="small" title="Load project JSON">Load</button>
        <select id="export-menu" aria-label="Export"><option value="">Export…</option></select>
        <button id="btn-undo" class="small" title="Undo (Ctrl+Z)">↶</button>
        <button id="btn-redo" class="small" title="Redo (Ctrl+Y)">↷</button>
        <button id="btn-run" class="primary" title="Run (Ctrl+Enter)">▶ Run</button>
        <div id="verdict-badge" data-v="unknown" title="Validation verdict">? UNKNOWN</div>
        <button id="btn-help" class="small" title="Beginner mode & shortcuts (?)">?</button>
        <input id="file-input" type="file" accept=".json" style="display:none">
      </header>
      <main id="workspace">
        <aside id="palette" aria-label="Component palette"></aside>
        <section id="editor-col">
          <div id="editor-area">
            <div id="canvas-hint">drag blocks • click ports to wire • wheel = zoom • drag empty = pan • Del = delete</div>
            <div id="editor-toolbar"></div>
            <div id="center-panel" class="lab-panel" style="display:none"></div>
          </div>
          <div id="output">
            <div id="output-tabs" role="tablist">
              <button data-tab="scope" class="active">Scope</button>
              <button data-tab="report">Report</button>
              <button data-tab="console">Console</button>
            </div>
            <div id="output-body"></div>
          </div>
        </section>
        <aside id="inspector" aria-label="Inspector"></aside>
      </main>`;

    const $ = (sel) => this.root.querySelector(sel);
    this.$tabs = $('#labtabs');
    this.$palette = $('#palette');
    this.$editorArea = $('#editor-area');
    this.$centerPanel = $('#center-panel');
    this.$editorToolbar = $('#editor-toolbar');
    this.$inspector = $('#inspector');
    this.$outputBody = $('#output-body');
    this.$verdict = $('#verdict-badge');
    this.$examples = $('#examples');
    this.$exportMenu = $('#export-menu');
    this.$fileInput = $('#file-input');

    this.consoleLines = [];
    this.scope.container = this.$outputBody;

    // tabs
    for (const lab of allLabs()) {
      const btn = document.createElement('button');
      btn.textContent = lab.label;
      btn.dataset.lab = lab.id;
      btn.addEventListener('click', () => this.switchLab(lab.id));
      this.$tabs.appendChild(btn);
    }
    const crossBtn = document.createElement('button');
    crossBtn.textContent = 'Cross-Lab';
    crossBtn.dataset.lab = 'crosslab';
    crossBtn.addEventListener('click', () => this.switchLab('crosslab'));
    this.$tabs.appendChild(crossBtn);

    // editor + palette + inspector
    this.editor = new CanvasEditor(this.$editorArea, {
      onChange: () => this._diagramChanged(),
      onSelect: (sel) => {
        if (sel?.kind === 'error') { this.log(sel.message, 'err'); return; }
        this._refreshInspector();
      },
    });
    this.editor.labAccent = (labId) => getLab(labId)?.accent || '#5aa2e8';
    this.palette = new Palette(this.$palette, {
      onAdd: (typeId, pos) => {
        const r = this.$editorArea.getBoundingClientRect();
        const w = this.editor.toWorld(r.width / 2, r.height / 2);
        this.editor.addBlock(typeId, pos?.x ?? w.x, pos?.y ?? w.y);
        this.log(`Added ${typeId}`);
      },
    });
    this.inspector = new Inspector(this.$inspector, {
      onChange: () => this._diagramChanged(true),
      onDelete: () => this.editor.deleteSelection(),
      onDuplicate: () => this.editor.duplicateSelection(),
    });

    // drag & drop from palette onto canvas
    this.$editorArea.addEventListener('dragover', (e) => e.preventDefault());
    this.$editorArea.addEventListener('drop', (e) => {
      e.preventDefault();
      const typeId = e.dataTransfer.getData('text/x-ilab-type');
      if (!typeId) return;
      const r = this.$editorArea.getBoundingClientRect();
      const w = this.editor.toWorld(e.clientX - r.left, e.clientY - r.top);
      this.editor.addBlock(typeId, w.x, w.y);
      this.log(`Added ${typeId}`);
    });

    // toolbar buttons
    $('#btn-run').addEventListener('click', () => this.run());
    $('#btn-new').addEventListener('click', () => this.newDesign());
    $('#btn-save').addEventListener('click', () => this.saveProject());
    $('#btn-load').addEventListener('click', () => this.$fileInput.click());
    $('#btn-undo').addEventListener('click', () => this.undo());
    $('#btn-redo').addEventListener('click', () => this.redo());
    $('#btn-help').addEventListener('click', () => this.showHelp());
    this.$fileInput.addEventListener('change', (e) => this.loadProject(e.target.files[0]));

    // canvas toolbar
    const fit = document.createElement('button');
    fit.className = 'small'; fit.textContent = 'Fit';
    fit.title = 'Fit view to design (F)';
    fit.addEventListener('click', () => this.editor.fit());
    this.$editorToolbar.appendChild(fit);

    // output tabs
    this.root.querySelectorAll('#output-tabs button').forEach((btn) => {
      btn.addEventListener('click', () => this.switchOutputTab(btn.dataset.tab));
    });

    // examples & export menus
    for (const ex of allExamples()) {
      const o = document.createElement('option');
      o.value = ex.id;
      o.textContent = ex.label;
      this.$examples.appendChild(o);
    }
    this.$examples.addEventListener('change', () => {
      const id = this.$examples.value;
      this.$examples.value = '';
      if (id) this.loadExample(id);
    });
    const exports = [
      ['json', 'Project JSON'],
      ['spice', 'SPICE deck (Chip Lab)'],
      ['report', 'Validation report (HTML)'],
      ['asm', 'CPU assembly (CPU Lab)'],
    ];
    for (const [v, label] of exports) {
      const o = document.createElement('option');
      o.value = v;
      o.textContent = label;
      this.$exportMenu.appendChild(o);
    }
    this.$exportMenu.addEventListener('change', () => {
      const v = this.$exportMenu.value;
      this.$exportMenu.value = '';
      if (v) this.exportAs(v);
    });

    // keyboard shortcuts
    window.addEventListener('keydown', (e) => this._keydown(e));
  }

  // ------------------------------------------------------------- lifecycle --
  boot() {
    const saved = localStorage.getItem('ilab.lab');
    const labIds = allLabs().map((l) => l.id);
    const first = labIds.includes(saved) ? saved : 'logic';
    this.switchLab(first);
    this.log('Invention Lab ready. All models are wrong; the reports tell you how wrong.');
  }

  switchLab(labId) {
    this.state.labId = labId;
    this.root.querySelectorAll('#labtabs button').forEach((b) => {
      b.classList.toggle('active', b.dataset.lab === labId);
    });
    this.palette.container.style.display = CANVAS_LABS.has(labId) ? '' : 'none';
    this.$editorToolbar.style.display = CANVAS_LABS.has(labId) ? '' : 'none';
    this.$centerPanel.style.display = CANVAS_LABS.has(labId) ? 'none' : '';
    this.$editorArea.querySelector('.lab-canvas')?.style.setProperty('display', CANVAS_LABS.has(labId) ? '' : 'none');
    document.getElementById('canvas-hint').style.display = CANVAS_LABS.has(labId) ? '' : 'none';

    if (labId === 'crosslab') {
      this._showCrosslabPanel();
      this.palette.show('none', allComponents());
      this.inspector.showMessage('Cross-lab demos run pipelines across labs. Load them from the Examples menu.');
      return;
    }

    const lab = getLab(labId);
    if (!this.diagrams[labId]) {
      this.diagrams[labId] = this._restoreOrNew(labId, lab);
    }
    const diagram = this.diagrams[labId];
    if (CANVAS_LABS.has(labId)) {
      this.editor.mount(diagram);
      this.palette.show(labId, allComponents());
    } else if (labId === 'cpu') {
      this._showCpuPanel(diagram);
      this.palette.show('none', allComponents());
    } else if (labId === 'ai') {
      this._showAiPanel(diagram);
      this.palette.show('none', allComponents());
    }
    this._refreshInspector();
    this.requestRenderReport();
  }

  _restoreOrNew(labId, lab) {
    try {
      const saved = localStorage.getItem(`ilab.diagram.${labId}`);
      if (saved) return Diagram.fromJSON(JSON.parse(saved));
    } catch { /* corrupted autosave -> fall through to fresh */ }
    return this._freshDiagram(labId, lab);
  }

  _freshDiagram(labId, lab) {
    const d = new Diagram({ name: `New ${lab.label} design`, lab: labId });
    for (const s of lab.metaSchema || []) d.meta[s.key] = s.default;
    return d;
  }

  _diagramChanged(isMeta = false) {
    const labId = this.state.labId;
    const diagram = this.diagrams[labId];
    // history
    const h = (this.history[labId] ??= { stack: [], idx: -1 });
    h.stack = h.stack.slice(0, h.idx + 1);
    h.stack.push(JSON.stringify(diagram.toJSON()));
    if (h.stack.length > 60) h.stack.shift();
    h.idx = h.stack.length - 1;
    // autosave
    try { localStorage.setItem(`ilab.diagram.${labId}`, JSON.stringify(diagram.toJSON())); } catch { /* quota */ }
    localStorage.setItem('ilab.lab', labId);
    if (isMeta) this._refreshInspector(true);
    this.requestRenderReport();
  }

  undo() {
    const h = this.history[this.state.labId];
    if (!h || h.idx <= 0) return;
    h.idx -= 1;
    this._applyHistory(h);
  }
  redo() {
    const h = this.history[this.state.labId];
    if (!h || h.idx >= h.stack.length - 1) return;
    h.idx += 1;
    this._applyHistory(h);
  }
  _applyHistory(h) {
    const d = Diagram.fromJSON(JSON.parse(h.stack[h.idx]));
    this.diagrams[this.state.labId] = d;
    try { localStorage.setItem(`ilab.diagram.${this.state.labId}`, JSON.stringify(d.toJSON())); } catch { /* quota */ }
    if (CANVAS_LABS.has(this.state.labId)) this.editor.mount(d);
    if (this.state.labId === 'cpu') this._showCpuPanel(d);
    this._refreshInspector();
    this.editor.requestRender();
    this.log(`History: ${h.idx + 1}/${h.stack.length}`);
  }

  // --------------------------------------------------------------- panels --
  _showCpuPanel(diagram) {
    const p = this.$centerPanel;
    p.innerHTML = '';
    p.appendChild(Object.assign(document.createElement('h2'), { textContent: 'IL-8 — 8-bit RISC, 5-stage pipeline' }));
    const grid = document.createElement('div');
    grid.className = 'grid2';
    const left = document.createElement('div');
    const right = document.createElement('div');
    grid.append(left, right);
    p.appendChild(grid);

    left.appendChild(Object.assign(document.createElement('div'), { textContent: 'Assembly source (IL-8 ISA):' }));
    const ta = document.createElement('textarea');
    ta.className = 'code-editor';
    ta.value = diagram.meta.source ?? '';
    ta.setAttribute('aria-label', 'Assembly source');
    ta.addEventListener('change', () => {
      diagram.meta.source = ta.value;
      this._diagramChanged(true);
    });
    left.appendChild(ta);
    const runBtn = document.createElement('button');
    runBtn.className = 'primary';
    runBtn.textContent = '▶ Assemble & Run';
    runBtn.addEventListener('click', () => this.run());
    left.appendChild(runBtn);

    const info = document.createElement('div');
    info.className = 'muted';
    info.textContent = 'Ports: OUT port, Rs writes to I/O; IN Rd, port reads. Port 0 = console. Branches resolve in EX (2-cycle penalty when taken); load-use hazards stall 1 cycle.';
    left.appendChild(info);

    right.appendChild(Object.assign(document.createElement('div'), { textContent: 'Machine code:' }));
    const listing = document.createElement('pre');
    listing.className = 'mono';
    listing.style.fontSize = '11px';
    try {
      const asm = assemble(diagram.meta.source ?? '');
      listing.textContent = asm.ok
        ? disassemble(asm.bytes) + `\n\n${asm.size} bytes; labels: ${Object.entries(asm.labels).map(([k, v]) => `${k}=0x${v.toString(16)}`).join(', ') || '—'}`
        : asm.errors.join('\n');
    } catch (e) { listing.textContent = String(e.message); }
    right.appendChild(listing);
  }

  _showAiPanel(diagram) {
    const p = this.$centerPanel;
    p.innerHTML = '';
    p.appendChild(Object.assign(document.createElement('h2'), { textContent: 'AI Accelerator — tensor units & performance model' }));
    const grid = document.createElement('div');
    grid.className = 'grid2';
    const left = document.createElement('div');
    const right = document.createElement('div');
    grid.append(left, right);
    p.appendChild(grid);

    left.appendChild(Object.assign(document.createElement('div'), { textContent: 'Run configuration:' }));
    for (const s of getLab('ai').metaSchema) {
      const field = document.createElement('div');
      field.className = 'field';
      const label = document.createElement('label');
      label.textContent = s.label;
      field.appendChild(label);
      let input;
      if (s.type === 'select') {
        input = document.createElement('select');
        for (const o of s.options) {
          const opt = document.createElement('option');
          opt.value = String(o);
          opt.textContent = String(o);
          input.appendChild(opt);
        }
        input.value = String(diagram.meta[s.key] ?? s.default);
      } else {
        input = document.createElement('input');
        input.type = s.type === 'number' ? 'number' : 'text';
        input.value = diagram.meta[s.key] ?? s.default;
      }
      input.addEventListener('change', () => {
        let v = input.value;
        if (s.type === 'number') v = parseFloat(v);
        diagram.meta[s.key] = v;
        this._diagramChanged(true);
      });
      field.appendChild(input);
      left.appendChild(field);
    }
    const runBtn = document.createElement('button');
    runBtn.className = 'primary';
    runBtn.textContent = '▶ Run workload';
    runBtn.addEventListener('click', () => this.run());
    left.appendChild(runBtn);

    right.innerHTML = `
      <div>What this runs:</div>
      <ul class="muted">
        <li>Random matmul (seeded) at the chosen precision vs the f64 reference</li>
        <li>Analytical P×P systolic-array model: cycles, utilization, GMAC/s, energy</li>
        <li>2-3-1 MLP trained on XOR (deterministic seed) with prediction table</li>
        <li>Validation: precision-dependent error bounds, self-consistency, honesty notes</li>
      </ul>`;
  }

  _showCrosslabPanel() {
    const p = this.$centerPanel;
    p.innerHTML = '';
    p.appendChild(Object.assign(document.createElement('h2'), { textContent: 'Cross-lab coupling' }));
    p.appendChild(Object.assign(document.createElement('div'), {
      textContent: 'Labs run as separate engines; data crosses boundaries only through documented adapters (ports, thresholds, bit packing). Each demo computes an independent reference and verifies data consistency.',
    }));
    for (const ex of allExamples().filter((e) => e.lab === 'crosslab')) {
      const card = document.createElement('div');
      card.className = 'field';
      const btn = document.createElement('button');
      btn.className = 'primary';
      btn.textContent = `▶ ${ex.label}`;
      btn.addEventListener('click', async () => {
        this.log(`Running ${ex.label}…`);
        const res = await ex.run();
        this.lastResult = res;
        this.switchOutputTab('scope');
        this.scope.renderResult('crosslab', res, null);
        this._setVerdict(res.verdict);
        this.log(`${ex.label}: ${res.verdict.toUpperCase()} — ${res.consistency.check}`, res.verdict === 'pass' ? 'ok' : 'err');
      });
      card.appendChild(btn);
      card.appendChild(Object.assign(document.createElement('div'), { className: 'muted', textContent: ex.blurb }));
      p.appendChild(card);
    }
  }

  _refreshInspector(skipIfBlock = false) {
    const labId = this.state.labId;
    if (labId === 'crosslab') return;
    const lab = getLab(labId);
    const diagram = this.diagrams[labId];
    if (!diagram) return;
    const sel = this.editor.selection;
    const block = sel?.kind === 'block' ? diagram.block(sel.id) : null;
    if (block) this.inspector.showBlock(block, { diagram });
    else if (CANVAS_LABS.has(labId) || labId === 'cpu') {
      this.inspector.showDesign(lab, diagram, { onMetaChange: () => this._diagramChanged(true) });
    } else {
      this.inspector.showMessage('This lab runs fixed workloads — see the center panel.');
    }
    this.editor.requestRender();
  }

  // ------------------------------------------------------------------- run --
  async run() {
    const labId = this.state.labId;
    if (labId === 'crosslab') { this.log('Use the demo buttons above.'); return; }
    const lab = getLab(labId);
    const diagram = this.diagrams[labId];
    if (!diagram) return;
    this.log(`▶ Running ${lab.label}: ${diagram.name}…`);
    try {
      const result = await lab.run(diagram);
      this.lastResult = result;
      this.switchOutputTab('scope');
      this.scope.renderResult(labId, result, diagram);
      if (result.ok === false) {
        for (const p of result.problems || []) this.log(`✘ ${p}`, 'err');
      }
      for (const w of result.warnings || []) this.log(`⚠ ${w}`, 'warn');
    } catch (e) {
      this.log(`✘ ${e.message}`, 'err');
      this._setVerdict('fail');
      return;
    }
    this.requestRenderReport();
  }

  requestRenderReport() {
    const labId = this.state.labId;
    if (labId === 'crosslab') return;
    const lab = getLab(labId);
    const diagram = this.diagrams[labId];
    if (!lab || !diagram) return;
    let report;
    try {
      report = lab.report(diagram);
    } catch (e) {
      this.log(`✘ validation failed: ${e.message}`, 'err');
      return;
    }
    this.lastReport = report;
    if (this._activeOutputTab === 'report') this.scope.renderReport(report);
    this._setVerdict(report.verdict);
  }

  _setVerdict(v) {
    const label = { pass: '✔ PASS', warn: '⚠ WARN', fail: '✘ FAIL', unknown: '? UNKNOWN' }[v] || v;
    this.$verdict.dataset.v = v;
    this.$verdict.textContent = label;
  }

  // ----------------------------------------------------------------- output --
  switchOutputTab(tab) {
    this._activeOutputTab = tab;
    this.root.querySelectorAll('#output-tabs button').forEach((b) => {
      b.classList.toggle('active', b.dataset.tab === tab);
    });
    if (tab === 'scope' && this.lastResult) {
      this.scope.renderResult(this.state.labId, this.lastResult, this.diagrams[this.state.labId]);
    } else if (tab === 'report') {
      this.scope.renderReport(this.lastReport);
    } else if (tab === 'console') {
      this.scope.container.innerHTML = '';
      const pre = document.createElement('div');
      pre.id = 'console-out';
      pre.innerHTML = this.consoleLines.map((l) => `<span class="${l.cls || ''}"><span class="t">${l.t}</span> ${escape(l.msg)}</span>`).join('\n');
      this.scope.container.appendChild(pre);
      this.scope.container.scrollTop = this.scope.container.scrollHeight;
    }
  }

  log(msg, cls = '') {
    const t = new Date().toLocaleTimeString();
    this.consoleLines.push({ t, msg, cls });
    if (this.consoleLines.length > 400) this.consoleLines.shift();
    if (this._activeOutputTab === 'console') this.switchOutputTab('console');
  }

  // ------------------------------------------------------------- files/menu --
  newDesign() {
    const lab = getLab(this.state.labId);
    if (!lab) return;
    this.diagrams[this.state.labId] = this._freshDiagram(this.state.labId, lab);
    this.history[this.state.labId] = { stack: [], idx: -1 };
    if (CANVAS_LABS.has(this.state.labId)) this.editor.mount(this.diagrams[this.state.labId]);
    if (this.state.labId === 'cpu') this._showCpuPanel(this.diagrams[this.state.labId]);
    if (this.state.labId === 'ai') this._showAiPanel(this.diagrams[this.state.labId]);
    this._refreshInspector();
    this.log('New design created.');
  }

  loadExample(id) {
    const ex = getExample(id);
    if (!ex) return;
    this.log(`Loading example: ${ex.label}`);
    if (ex.lab === 'crosslab') {
      this.switchLab('crosslab');
      return;
    }
    const d = Diagram.fromJSON(ex.getJSON());
    this.diagrams[d.lab] = d;
    this.history[d.lab] = { stack: [JSON.stringify(d.toJSON())], idx: 0 };
    try { localStorage.setItem(`ilab.diagram.${d.lab}`, JSON.stringify(d.toJSON())); } catch { /* quota */ }
    this.switchLab(d.lab);
    // fit after the canvas has its real size (ResizeObserver runs next frame)
    requestAnimationFrame(() => this.editor.fit());
    this.run();
  }

  saveProject() {
    const d = this.diagrams[this.state.labId];
    if (!d) return;
    download(`${d.name.replace(/\s+/g, '_')}.ilab.json`, JSON.stringify(d.toJSON(), null, 2), 'application/json');
    this.log(`Saved ${d.name}.ilab.json`);
  }

  loadProject(file) {
    if (!file) return;
    file.text().then((text) => {
      try {
        const d = Diagram.fromJSON(JSON.parse(text));
        this.diagrams[d.lab] = d;
        this.switchLab(d.lab);
        this.editor.fit();
        this.log(`Loaded ${file.name} (${d.blocks.length} blocks)`);
        this.run();
      } catch (e) {
        this.log(`✘ Load failed: ${e.message}`, 'err');
      }
    });
  }

  exportAs(kind) {
    const d = this.diagrams[this.state.labId];
    if (!d) return;
    if (kind === 'json') return this.saveProject();
    if (kind === 'spice') {
      if (this.state.labId !== 'chip') { this.log('SPICE export is available in the Chip Lab.', 'warn'); return; }
      download(`${d.name.replace(/\s+/g, '_')}.spice`, toSpiceDeck(d, { analysis: d.meta.analysis === 'ac' ? 'ac' : 'tran' }), 'text/plain');
      this.log('Exported SPICE deck (verify against Ngspice before use).');
      return;
    }
    if (kind === 'report') {
      const report = this.lastReport;
      if (!report) { this.log('Run a design first to produce a report.', 'warn'); return; }
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invention Lab report — ${escape(report.title || report.diagramName)}</title>
<style>body{font-family:system-ui;max-width:900px;margin:2rem auto;padding:0 1rem;color:#1c2430}
table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:4px 8px;font-size:14px}
.pass{color:#167a3d;font-weight:700}.warn{color:#9a6a10;font-weight:700}.fail{color:#a8281f;font-weight:700}.unknown{color:#55606e;font-weight:700}</style></head><body>
<h1>Invention Lab — validation report</h1><p><b>${escape(report.title || report.diagramName)}</b> — verdict: <b class="${report.verdict}">${report.verdict.toUpperCase()}</b> (${new Date(report.generatedAt).toLocaleString()})</p>
<p><i>“All models are wrong; the practical question is how wrong do they have to be to not be useful.” — G. E. P. Box</i></p>
<h2>Checks</h2><table><tr><th>Check</th><th>Verdict</th><th>Actual</th><th>Expected</th><th>Tolerance</th><th>Note</th></tr>
${report.checks.map((c) => `<tr><td>${escape(c.name)}</td><td class="${c.verdict}">${c.verdict.toUpperCase()}</td><td>${c.actual ?? '—'}</td><td>${c.expected ?? '—'}</td><td>${c.tolerance ?? '—'}</td><td>${escape(c.note || '')}</td></tr>`).join('')}
</table><h2>Assumptions &amp; unknowns</h2><ul>${report.assumptions.map((a) => `<li>${escape(a)}</li>`).join('') || '<li>none recorded</li>'}</ul>
<h2>Model provenance</h2><ul>${report.provenance.map((p) => `<li>${escape(p)}</li>`).join('') || '<li>none</li>'}</ul></body></html>`;
      download(`${(report.title || 'report').replace(/\s+/g, '_')}.report.html`, html, 'text/html');
      this.log('Exported validation report (HTML).');
      return;
    }
    if (kind === 'asm') {
      if (this.state.labId !== 'cpu') { this.log('Assembly export is available in the CPU Lab.', 'warn'); return; }
      download(`${d.name.replace(/\s+/g, '_')}.asm`, d.meta.source || '', 'text/plain');
      this.log('Exported assembly source.');
    }
  }

  // --------------------------------------------------------------- help/keys --
  showHelp() {
    const lab = getLab(this.state.labId);
    const overlay = document.createElement('div');
    overlay.id = 'overlay';
    const steps = TUTORIALS[this.state.labId] || TUTORIALS.default;
    overlay.innerHTML = `
      <div class="card" role="dialog" aria-modal="true" aria-label="Help">
        <h2>⚗ Beginner mode — ${lab ? lab.label : 'Cross-Lab'}</h2>
        <p class="muted">${lab?.blurb || 'Run pipelines that couple two labs and verify data consistency.'}</p>
        <ol class="steps">${steps.map((s) => `<li>${s}</li>`).join('')}</ol>
        <h3>Shortcuts</h3>
        <ul>
          <li><kbd>Ctrl</kbd>+<kbd>Enter</kbd> run · <kbd>Del</kbd> delete selection · <kbd>Ctrl</kbd>+<kbd>D</kbd> duplicate</li>
          <li><kbd>Ctrl</kbd>+<kbd>Z</kbd>/<kbd>Y</kbd> undo/redo · <kbd>Ctrl</kbd>+<kbd>S</kbd> save · <kbd>F</kbd> fit view</li>
          <li><kbd>?</kbd> this help · wheel zoom · drag empty space to pan</li>
        </ul>
        <button class="primary" id="overlay-close">Got it</button>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#overlay-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  }

  _keydown(e) {
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.key === 'Enter') { e.preventDefault(); this.run(); return; }
    if (mod && e.key.toLowerCase() === 's') { e.preventDefault(); this.saveProject(); return; }
    if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); this.undo(); return; }
    if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); this.redo(); return; }
    if (mod && e.key.toLowerCase() === 'd') { e.preventDefault(); this.editor.duplicateSelection(); return; }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (document.activeElement?.tagName === 'TEXTAREA' || document.activeElement?.tagName === 'INPUT') return;
      this.editor.deleteSelection();
      return;
    }
    if (e.key === 'f' || e.key === 'F') { this.editor.fit(); return; }
    if (e.key === '?') { this.showHelp(); return; }
    if (e.key === 'Escape') { document.getElementById('overlay')?.remove(); }
  }
}

const TUTORIALS = {
  logic: [
    'Load the “Half adder” example from the Examples menu and press Run — probes show SUM and CARRY.',
    'Change the radix in Design settings to 4: the same XOR/AND gates now use quaternary algebra (min/max/mod).',
    'Click an IN block and set its value; press Run again. Unconnected inputs honestly read Z.',
    'Build your own: click a palette item to add a gate, click an output port then an input port to wire, press Run.',
  ],
  chip: [
    'Load “RC low-pass filter” and press Run — the AC sweep finds the −3 dB cutoff and validation compares it with 1/(2πRC).',
    'Switch the analysis to DC (Design settings) to get the operating point, powers, thermal estimates and Johnson-noise figures.',
    'Export the SPICE deck (Export menu) and cross-check against Ngspice — we export, we do not pretend to be SPICE.',
    'Add blocks from the palette: sources, R/C/L, diodes, MOSFETs, op-amp. Every circuit needs one GND block.',
  ],
  cpu: [
    'Press “Assemble & Run” on the default program (sum of 1..10 → OUT port 0 = 55).',
    'Watch the Report tab: the pipeline result is differentially verified against an unpipelined reference.',
    'Load “CPU: load-use hazard demo” — the stats show exactly 1 stall caused by LD followed by its use.',
    'Write your own program: LDI/LD/ST/ADD/SUB/CMP/JMP/JZ/JNZ/OUT/IN/HLT, with labels and .byte data.',
  ],
  ai: [
    'Press “Run workload”: matmul runs in your chosen precision and is compared against the f64 reference.',
    'Compare precisions: f32 errors ~1e-6, int8 ~1% — the validation bounds are documented per mode.',
    'The systolic model reports cycles/utilization/energy; it is analytical (±30%) and says so in the report.',
    'The MLP trains on XOR with a fixed seed — same run, same result, every time.',
  ],
  quantum: [
    'Load “Quantum: Bell state” and Run: only |00> and |11> occur — the entanglement witness is in the report.',
    'Load the qutrit Fourier example (d=3): qudit gates work in any dimension.',
    'Add gates from the palette onto qubit wires; order on the canvas = circuit order.',
    'Finite shots are honest: every count carries its binomial standard error.',
  ],
  optics: [
    'Place a Point Source, a Lens and a Screen, wire them in series, and press Run.',
    'The thin-lens equation v = 1/(1/f − 1/u) gives the image distance; the report checks the lens formula.',
    'Move the screen distance d: the spot diameter grows as |d − v|·aperture/v.',
    'This lab is a plugin — see docs/PLUGIN_API.md to write your own.',
  ],
  default: [
    'Pick a lab tab, load an example from the Examples menu, and press Run.',
    'Every design gets a validation report: checks, tolerances, and what is NOT covered.',
  ],
};

function download(filename, text, mime) {
  const blob = new Blob([text], { type: mime });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function escape(s) {
  return String(s ?? '').replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
}
