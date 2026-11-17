// app.js — Invention Lab application shell: tabs, toolbar, run pipeline,
// undo/redo, save/load/export, keyboard shortcuts, beginner mode.

import { allLabs, getLab, allExamples, getExample, allComponents } from '../core/registry.js';
import { Diagram } from '../core/diagram.js';
import { CanvasEditor } from './canvas.js';
import { Palette } from './palette.js';
import { Inspector } from './inspector.js';
import { Scope } from './scope.js';
import { Scene3DView } from '../scene/viewer.js';
import { AssemblyShelf } from './module-shelf.js';
import {
  captureModuleTemplate, instantiateModule, registerAssembly, ungroupAssembly,
  listAssemblies,
} from '../assembly/modules.js';
import {
  COMPOSITE_FORMAT,captureCompositeFromAssemblies,instantiateComposite,
  serializeHierarchicalLibrary,parseHierarchicalLibrary,
} from '../assembly/composites.js';
import { summarizeDesignEvidence, estimateScenarioPassRate } from '../evidence/feasibility.js';
import { fanIllustrativeScenario } from '../evidence/phase31-first-principles.js';
import { assessPublicSourceCoverage } from '../evidence/phase32-source-coverage.js';
import { PHYSICAL_STAGES } from '../evidence/physical-readiness.js';
import { buildEvidencePassport } from '../evidence/phase29-atlas.js';
import { toSpiceDeck } from '../labs/chip/spice-export.js';
import { assemble, disassemble } from '../labs/cpu/assembler.js';
import { runOnnxSubset } from '../labs/ai/onnx-subset.js';
import { runOnnxQuantizedCase } from '../labs/ai/onnx-quantized.js';
import { runPhase11Case } from '../labs/ai/onnx-per-axis-conv.js';
import { runIrisModelBenchmark } from '../labs/ai/iris-benchmark.js';

const CANVAS_LABS = new Set(['logic', 'chip', 'quantum', 'optics']);
const SCENE_LABS = new Set(['logic', 'chip', 'quantum']);

export class App {
  constructor(root) {
    this.root = root;
    this.state = { labId: null };
    this.viewMode = '2d';
    this.moduleLibrary = [];
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
              <button data-tab="evidence">Build Evidence</button>
              <button data-tab="atlas">Evidence Atlas</button>
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
        if (this.scene3d) {
          this.scene3d.selectedId = sel?.kind === 'block' ? sel.id : null;
          this.scene3d.sync();
        }
        this._refreshInspector();
      },
    });
    this.editor.labAccent = (labId) => getLab(labId)?.accent || '#5aa2e8';
    this.scene3d = new Scene3DView(this.$editorArea, {
      onSelect: (id) => {
        this.editor.selection = id ? { kind: 'block', id } : null;
        this.editor.requestRender();
        this._refreshInspector();
      },
      onMove: (id, x, y) => {
        const block = this.diagrams[this.state.labId]?.block(id);
        if (!block) return;
        if (block.x === x && block.y === y) return;
        block.x = x; block.y = y;
        this._diagramChanged();
        this.editor.requestRender();
      },
      onConnect: (fromId, fromPort, toId, toPort) => {
        try {
          const d = this.diagrams[this.state.labId];
          const wire = d.connect(fromId, fromPort, toId, toPort);
          if (wire) {
            this._diagramChanged();
            this.editor.requestRender();
            this.log('3D wire: ' + fromId + '.' + fromPort + ' → ' + toId + '.' + toPort);
          }
        } catch (error) {
          this.log('3D connection rejected: ' + error.message, 'warn');
        }
      },
      onError: (msg) => this.log('3D view: ' + msg, 'warn'),
    });

    this.palette = new Palette(this.$palette, {
      onAdd: (typeId, pos) => {
        const r = this.$editorArea.getBoundingClientRect();
        const w = this.viewMode === '3d' ? this.scene3d.centerDesign() :
          this.editor.toWorld(r.width / 2, r.height / 2);
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
      const w = this.viewMode === '3d' && SCENE_LABS.has(this.state.labId)
        ? this.scene3d.designAt(e.clientX, e.clientY)
        : this.editor.toWorld(e.clientX - r.left, e.clientY - r.top);
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
    fit.addEventListener('click', () => this.viewMode === '3d' ? this.scene3d.fit() : this.editor.fit());
    this.$editorToolbar.appendChild(fit);
    this.$sceneButton = document.createElement('button');
    this.$sceneButton.className = 'small';
    this.$sceneButton.type = 'button';
    this.$sceneButton.title = 'Switch between editable 2D wiring and real-time WebGL 3D component workspace';
    this.$sceneButton.textContent = '3D View';
    this.$sceneButton.setAttribute('aria-pressed', 'false');
    this.$sceneButton.addEventListener('click', () => this.set3D(this.viewMode !== '3d'));
    this.$editorToolbar.appendChild(this.$sceneButton);
    const atlasButton=document.createElement('button');
    atlasButton.className='small'; atlasButton.type='button';
    atlasButton.textContent='Evidence Atlas';atlasButton.id='btn-view-evidence-atlas';
    atlasButton.title='Inspect selected 2D/3D component model provenance and independent historical source references';
    atlasButton.addEventListener('click',()=>this.switchOutputTab('atlas'));
    this.$editorToolbar.appendChild(atlasButton);
    this.$assembliesButton = document.createElement('button');
    this.$assembliesButton.className = 'small';
    this.$assembliesButton.type = 'button';
    this.$assembliesButton.textContent = 'Assemblies';
    this.$assembliesButton.title = 'Capture, reuse and explore computing circuit assemblies';
    this.$assembliesButton.setAttribute('aria-expanded','false');
    this.$assembliesButton.addEventListener('click', () => {
      const open = this.assemblyShelf.toggle();
      this.$assembliesButton.setAttribute('aria-expanded', String(open));
    });
    this.$editorToolbar.appendChild(this.$assembliesButton);
    this.assemblyShelf = new AssemblyShelf(this.$editorArea, {
      onCreate: (args) => this.createAssembly(args),
      onCompose: (args) => this.composeAssemblies(args),
      onPlace: (id,overrides={}) => this.placeModule(id,overrides),
      onFocus: (id,path=null) => this.focusAssembly(id,path),
      onUngroup: (id) => this.ungroup(id),
      onRemoveTemplate: (id) => this.removeModuleTemplate(id),
      onImport: (raw) => this.importModuleLibrary(raw),
      onExport: () => this.exportModuleLibrary(),
      onError: (message) => this.log('Assembly: ' + message, 'err'),
    });

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
      ['passport', 'Evidence passport (JSON)'], 
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
    try {
      const stored = localStorage.getItem('ilab.moduleLibrary.v1');
      this.moduleLibrary = stored ? parseHierarchicalLibrary(stored) : [];
    } catch (error) {
      this.moduleLibrary = [];
      this.log('Module library could not be loaded: ' + error.message, 'warn');
    }
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
    this.$editorArea.querySelector('.lab-canvas')?.style.setProperty('display', CANVAS_LABS.has(labId) && this.viewMode !== '3d' ? '' : 'none');
    document.getElementById('canvas-hint').style.display = CANVAS_LABS.has(labId) && this.viewMode !== '3d' ? '' : 'none';

    if (labId === 'crosslab') {
      this.assemblyShelf.toggle(false);
      this.$assembliesButton.setAttribute('aria-expanded','false');
      this.set3D(false);
      this._showCrosslabPanel();
      this.palette.show('none', allComponents());
      this.inspector.showMessage('Cross-lab demos run pipelines across labs. Load them from the Examples menu.');
      if(this._activeOutputTab==='atlas')this._renderEvidenceAtlas();
      return;
    }

    const lab = getLab(labId);
    if (!this.diagrams[labId]) {
      this.diagrams[labId] = this._restoreOrNew(labId, lab);
    }
    const diagram = this.diagrams[labId];
    if (CANVAS_LABS.has(labId)) {
      this.editor.mount(diagram);
      if (SCENE_LABS.has(labId)) this.scene3d.mount(diagram);
      this.palette.show(labId, allComponents());
    } else if (labId === 'rv32i') {
      this._showRv32iPanel(diagram);
      this.palette.show('none', allComponents());
    } else if (labId === 'cpu') {
      this._showCpuPanel(diagram);
      this.palette.show('none', allComponents());
    } else if (labId === 'ai') {
      this._showAiPanel(diagram);
      this.palette.show('none', allComponents());
    }
    this.set3D(this.viewMode === '3d' && SCENE_LABS.has(labId));
    if (!SCENE_LABS.has(labId)) this.assemblyShelf.toggle(false);
    this.$assembliesButton.style.display = SCENE_LABS.has(labId) ? '' : 'none';
    this.$assembliesButton.setAttribute('aria-expanded',String(this.assemblyShelf.open));
    this.assemblyShelf.setData(diagram,this.moduleLibrary,this.editor.selection?.id);
    this._refreshInspector();
    this.requestRenderReport();
    if(this._activeOutputTab==='atlas')this._renderEvidenceAtlas();
  }

  set3D(enabled) {
    const canShow = enabled && SCENE_LABS.has(this.state.labId) && this.scene3d.available;
    this.viewMode = canShow ? '3d' : '2d';
    if (canShow) this.scene3d.selectedId = this.editor.selection?.kind === 'block' ? this.editor.selection.id : null;
    this.scene3d.activate(canShow);
    this.editor.canvas.style.display = canShow || !CANVAS_LABS.has(this.state.labId) ? 'none' : '';
    this.$sceneButton.style.display = SCENE_LABS.has(this.state.labId) ? '' : 'none';
    this.$sceneButton.setAttribute('aria-pressed', String(canShow));
    this.$sceneButton.textContent = canShow ? '2D Wiring' : '3D View';
    this.$editorArea.querySelector('#canvas-hint').style.display = canShow || !CANVAS_LABS.has(this.state.labId) ? 'none' : '';
    if (!canShow) this.editor.requestRender();
    return canShow;
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
    this.scene3d.sync();
    if (SCENE_LABS.has(labId)) this.assemblyShelf.setData(diagram,this.moduleLibrary,this.editor.selection?.id);
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
    if (SCENE_LABS.has(this.state.labId)) {
      this.scene3d.mount(d);
      this.assemblyShelf.setData(d,this.moduleLibrary);
    }
    if (this.state.labId === 'cpu') this._showCpuPanel(d);
    if (this.state.labId === 'rv32i') this._showRv32iPanel(d);
    this._refreshInspector();
    this.editor.requestRender();
    this.log(`History: ${h.idx + 1}/${h.stack.length}`);
  }

  _persistModuleLibrary(next) {
    const serialized = serializeHierarchicalLibrary(next);
    try { localStorage.setItem('ilab.moduleLibrary.v1',serialized); }
    catch (error) { throw Error('Module library storage failed; export your library: ' + error.message); }
    this.moduleLibrary = next;
    this.assemblyShelf.setData(this.diagrams[this.state.labId],next,this.editor.selection?.id);
  }

  createAssembly({name,blockIds}) {
    const diagram = this.diagrams[this.state.labId];
    const template = captureModuleTemplate(diagram,{name,blockIds});
    const next = [...this.moduleLibrary,template];
    // Capacity/integrity check before touching the active design.
    serializeHierarchicalLibrary(next);
    const previous = structuredClone(diagram.meta.assemblies || []);
    let record;
    try {
      record = registerAssembly(diagram,{name,blockIds,templateId:template.id});
      // Persist the real port-to-block mapping. This survives later module
      // composition even when a group was captured in a different block order.
      const registered=diagram.meta.assemblies.find(a=>a.id===record.id);
      registered.interfaceBindings=Object.fromEntries(template.interfaces.map(p=>[
        p.name,{blockId:p.blockId,portId:p.portId,dir:p.dir,type:p.type},
      ]));
      this._persistModuleLibrary(next);
    } catch (error) {
      // Never leave a group pretending to have been saved if the template
      // library failed to persist (quota, disabled storage, invalid module).
      diagram.meta.assemblies = previous;
      throw error;
    }
    this._diagramChanged(true);
    this.log('Reusable module created: '+template.name+' · '+template.blocks.length+' components');
    return {template,assembly:record};
  }

  composeAssemblies({name,groupIds}) {
    const diagram=this.diagrams[this.state.labId];
    const composite=captureCompositeFromAssemblies(diagram,groupIds,this.moduleLibrary,{name});
    this._persistModuleLibrary([...this.moduleLibrary,composite]);
    this.log('Nested module created: '+composite.name+' · '+composite.children.length+' child modules, '+composite.parameters.length+' numeric parameters');
    return composite;
  }

  placeModule(templateId,overrides={}) {
    const template=this.moduleLibrary.find(t=>t.id===templateId);
    if(!template)throw Error('Reusable module not found');
    const diagram=this.diagrams[this.state.labId];
    const center=this.viewMode==='3d'?this.scene3d.centerDesign():
      this.editor.toWorld(this.editor.canvas.width/2,this.editor.canvas.height/2);
    const at = {x:center.x+120,y:center.y+80};
    const result=template.format===COMPOSITE_FORMAT
      ? instantiateComposite(diagram,template,this.moduleLibrary,{...at,overrides})
      : instantiateModule(diagram,template,{...at});
    if(template.format!==COMPOSITE_FORMAT){
      // Legacy leaf placements now preserve an exact named interface mapping
      // for future captured composites, independent of its block order.
      const original=diagram.meta.assemblies.find(a=>a.id===result.assembly.id);
      original.interfaceBindings=Object.fromEntries(result.exposedPorts.map(p=>[
        p.name,{blockId:p.blockId,portId:p.portId,dir:p.dir,type:p.type},
      ]));
    }
    this._diagramChanged();
    this.editor.requestRender();
    this.log('Placed '+template.name+' as '+result.createdBlockIds.length+' real blocks / '+result.createdWireIds.length+' real wires');
    return result;
  }

  focusAssembly(id,path=null) {
    if(id===null) {
      this.scene3d.setFocus(null);
      this.log('Viewing complete design');
      return;
    }
    const group=listAssemblies(this.diagrams[this.state.labId]).find(a=>a.id===id);
    if(!group)throw Error('Assembly no longer exists');
    if(group.staleBlockIds.length)throw Error('Assembly contains deleted blocks; ungroup or repair the design');
    if(!this.set3D(true))throw Error('WebGL 3D view is not available');
    if(path!==null) {
      const members=group.childGroups?.[path];
      if(!Array.isArray(members)||!members.length || members.some(x=>!group.blockIds.includes(x)))
        throw Error('Nested child path is not part of this assembly');
      this.scene3d.setFocus(members,group.name+' / '+path);
      this.log('Exploring nested child '+group.name+' / '+path+' · '+members.length+' components');
      return;
    }
    this.scene3d.setFocus(group.blockIds,group.name);
    this.log('Exploring '+group.name+' · '+group.blockIds.length+' components');
  }

  ungroup(id) {
    const diagram=this.diagrams[this.state.labId];
    if(!ungroupAssembly(diagram,id))throw Error('Assembly not found');
    this.scene3d.setFocus(null);
    this._diagramChanged(true);
    this.log('Assembly annotation removed; its real blocks and wires remain');
  }

  removeModuleTemplate(id) {
    const next=this.moduleLibrary.filter(t=>t.id!==id);
    if(next.length===this.moduleLibrary.length)throw Error('Template not found');
    if(this.moduleLibrary.some(t=>t.format===COMPOSITE_FORMAT &&
        t.children.some(child=>child.templateId===id)))
      throw Error('Cannot delete a module referenced by a composite; remove its dependents first');
    this._persistModuleLibrary(next);
    this.log('Removed reusable template from local library; existing design blocks remain');
  }

  exportModuleLibrary() {
    download('invention-lab-computing-modules.json',serializeHierarchicalLibrary(this.moduleLibrary),'application/json');
    this.log('Exported reusable module library');
  }

  importModuleLibrary(raw) {
    const incoming=parseHierarchicalLibrary(raw);
    const next=[...this.moduleLibrary];
    for(const template of incoming){
      const existing=next.find(t=>t.id===template.id);
      if(existing) {
        if(JSON.stringify(existing)!==JSON.stringify(template))
          throw Error('Module ID conflict: '+template.id+' differs from existing template');
      }else next.push(template);
    }
    const added=next.length-this.moduleLibrary.length;
    this._persistModuleLibrary(next);
    this.log('Module library imported: '+incoming.length+' entries, '+added+' added');
    return next.length;
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

  _showRv32iPanel(diagram) {
    const p = this.$centerPanel;
    p.replaceChildren();
    const h = document.createElement('h2');
    h.textContent = 'RISC-V RV32I / RV32IM — 32-bit integer architecture';
    p.appendChild(h);
    const warning = document.createElement('p');
    warning.className = 'muted';
    warning.textContent = 'Bounded, single-hart functional ISA model. Not a cycle-accurate CPU, privileged OS, hardware verification result or real silicon.';
    p.appendChild(warning);
    const grid = document.createElement('div');
    grid.className = 'grid2';
    const left = document.createElement('div'), right = document.createElement('div');
    grid.append(left, right); p.appendChild(grid);
    const isaField = document.createElement('label');
    isaField.className='field';
    isaField.textContent = 'Architecture profile (M extension is opt-in)';
    const isaSelect=document.createElement('select');
    isaSelect.setAttribute('aria-label','RISC-V ISA profile');
    for(const [value,label] of [
      ['rv32i','RV32I base (no multiply/divide)'],
      ['rv32im','RV32IM (RV32I + M multiply/divide)'],
    ]){
      const option=document.createElement('option');
      option.value=value; option.textContent=label;isaSelect.append(option);
    }
    isaSelect.value=diagram.meta.isa??'rv32i';
    isaSelect.addEventListener('change',()=>{
      diagram.meta.isa=isaSelect.value;
      this._diagramChanged(true);
    });
    isaField.append(isaSelect);
    left.append(isaField);
    const sourceLabel = document.createElement('label');
    sourceLabel.textContent = '32-bit little-endian encoded instruction words (one 8-hex-digit word per line)';
    const editor = document.createElement('textarea');
    editor.className = 'code-editor'; editor.value = String(diagram.meta.source || '');
    editor.setAttribute('aria-label','RV32I machine-code editor');
    editor.addEventListener('change',()=>{
      diagram.meta.source = editor.value;
      this._diagramChanged(true);
    });
    sourceLabel.appendChild(editor); left.appendChild(sourceLabel);
    for (const item of [
      {key:'expectedRegister',label:'Expected register x0–x31',min:0,max:31},
      {key:'expectedValue',label:'Expected unsigned 32-bit value',min:0,max:4294967295},
      {key:'maxSteps',label:'Instruction step budget (1–1,000,000)',min:1,max:1000000},
    ]) {
      const label=document.createElement('label');
      label.textContent=item.label;label.className='field';
      const input=document.createElement('input');
      input.type='number';input.step='1';input.min=String(item.min);input.max=String(item.max);
      input.value=String(diagram.meta[item.key]??getLab('rv32i').metaSchema.find(x=>x.key===item.key)?.default);
      input.addEventListener('change',()=>{
        diagram.meta[item.key]=Number(input.value);
        this._diagramChanged(true);
      });
      label.appendChild(input);left.appendChild(label);
    }
    const run=document.createElement('button');
    run.className='primary';run.type='button';run.textContent='▶ Decode and execute selected RISC-V ISA';
    run.addEventListener('click',()=>this.run());
    left.appendChild(run);
    const note=document.createElement('p');note.className='muted';
    note.textContent='The default example computes 5 + 7 → register x3 = 12 and reaches EBREAK. Select RV32IM to enable MUL, MULH, MULHSU, MULHU, DIV, DIVU, REM and REMU. ISA certification, cycle timing, real silicon and manufacturing yield are NOT established by this emulator or an EBREAK.';
    left.appendChild(note);
    right.appendChild(Object.assign(document.createElement('div'),{textContent:'Instruction words and architectural state:'}));
    const listing=document.createElement('pre');listing.className='mono';
    listing.style.fontSize='11px';
    try {
      const lines=String(diagram.meta.source||'').trim().split(/\r?\n/);
      listing.textContent=lines.map((word,i)=>'0x'+(i*4).toString(16).padStart(8,'0')+'   '+word).join('\n');
    } catch(error) { listing.textContent=error.message; }
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

    const onnxSection=document.createElement('section');
    onnxSection.className='field';
    const heading=document.createElement('h3');
    heading.textContent='ONNX operator-graph examples (opset 13, float32)';
    onnxSection.append(heading);
    const description=document.createElement('p');description.className='muted';
    description.textContent='Five small, fixed 2D networks: MatMul, Gemm, Add, Relu, Sigmoid, Softmax. Independent ONNX Runtime evidence is generated in CI only; local execution is model-only.';
    onnxSection.append(description);
    const selector=document.createElement('select');
    selector.setAttribute('aria-label','ONNX operator graph example');
    for(const [id,name] of [
      ['matmul-relu','MatMul + Relu'],
      ['gemm-sigmoid','Gemm + Sigmoid'],
      ['add-softmax','Broadcast Add + Softmax'],
      ['gemm-transpose','Gemm transposes / alpha / beta'],
      ['two-layer-mlp','Two-layer MLP + Softmax'],
    ]) {
      const option=document.createElement('option');
      option.value=id;option.textContent=name;selector.append(option);
    }
    onnxSection.append(selector);
    const runOnnx=document.createElement('button');
    runOnnx.type='button';runOnnx.className='primary';
    runOnnx.setAttribute('data-action','run-onnx-subset');
    runOnnx.textContent='▶ Run ONNX subset graph';
    runOnnx.addEventListener('click',()=>this.runOnnxExample(selector.value).catch(error=>{
      this.log('ONNX subset failed: '+error.message,'err');
      this._setVerdict('fail');
    }));
    onnxSection.append(runOnnx);
    left.append(onnxSection);

    const quantSection=document.createElement('section');
    quantSection.className='field';
    const quantHeading=document.createElement('h3');
    quantHeading.textContent='ONNX int8 / uint8 quantization (Phase 10)';
    quantSection.append(quantHeading);
    const quantNote=document.createElement('p');
    quantNote.className='muted';
    quantNote.textContent='Per-tensor 2D QLinearMatMul and QuantizeLinear → DequantizeLinear. These are software arithmetic models, NOT real GPU/TPU execution or physical accuracy.';
    quantSection.append(quantNote);
    const quantSelector=document.createElement('select');
    quantSelector.setAttribute('aria-label','Quantized ONNX reference example');
    for(const [id,label] of [
      ['qlinear-int8-symmetric','Int8 symmetric QLinearMatMul'],
      ['qlinear-uint8-offset','Uint8 nonzero zero-point QLinearMatMul'],
      ['qlinear-int8-saturation','Int8 clipped QLinearMatMul'],
      ['qlinear-uint8-saturation','Uint8 clipped QLinearMatMul'],
      ['qdq-int8-ties-even','Signed Quantize → Dequantize (ties-to-even)'],
      ['qdq-uint8-offset-saturation','Uint8 Quantize → Dequantize (offset/saturation)']
    ]){
      const option=document.createElement('option');option.value=id;option.textContent=label;
      quantSelector.append(option);
    }
    quantSection.append(quantSelector);
    const runQuant=document.createElement('button');
    runQuant.type='button';runQuant.className='primary';
    runQuant.setAttribute('data-action','run-quantized-onnx');
    runQuant.textContent='▶ Run quantized ONNX subset';
    runQuant.addEventListener('click',()=>this.runOnnxQuantizedExample(quantSelector.value).catch(error=>{
      this.log('ONNX quantization failed: '+error.message,'err');
      this._setVerdict('fail');
    }));
    quantSection.append(runQuant);
    left.append(quantSection);

    const convSection=document.createElement('section');
    convSection.className='field';
    const convHeading=document.createElement('h3');
    convHeading.textContent='Quantized convolution / per-axis QDQ (Phase 11)';
    convSection.append(convHeading);
    const convNote=document.createElement('p');convNote.className='muted';
    convNote.textContent='Small fixed NCHW QLinearConv and 2D per-axis QuantizeLinear / DequantizeLinear. Browser runs a model; independently verified ONNX Runtime CPU executes only in CI.';
    convSection.append(convNote);
    const convSelector=document.createElement('select');
    convSelector.setAttribute('aria-label','Phase 11 ONNX convolution and per-axis example');
    for(const [id,label] of [
      ['qconv-uint8-valid','Uint8 valid 2D quantized convolution'],
      ['qconv-int8-pad-stride','Int8 padded and strided convolution'],
      ['qconv-mixed-per-channel','Mixed uint8/int8 per-channel weights and bias'],
      ['qconv-int8-saturation','Saturating int8 convolution'],
      ['per-axis-int8-axis1','Per-axis signed QDQ (axis=1)'],
      ['per-axis-uint8-negative-axis','Per-axis uint8 QDQ (negative axis)'],
    ]){
      const option=document.createElement('option');option.value=id;option.textContent=label;
      convSelector.append(option);
    }
    convSection.append(convSelector);
    const runConv=document.createElement('button');
    runConv.type='button';runConv.className='primary';
    runConv.setAttribute('data-action','run-phase11-onnx');
    runConv.textContent='▶ Run convolution / per-axis example';
    runConv.addEventListener('click',()=>this.runPhase11Example(convSelector.value).catch(error=>{
      this.log('Phase 11 ONNX arithmetic failed: '+error.message,'err');
      this._setVerdict('fail');
    }));
    convSection.append(runConv);
    left.append(convSection);

    const modelSection=document.createElement('section');
    modelSection.className='field';
    const modelHeading=document.createElement('h3');
    modelHeading.textContent='Real licensed dataset / model-level holdout (Phase 12)';
    modelSection.append(modelHeading);
    const modelDescription=document.createElement('p');
    modelDescription.className='muted';
    modelDescription.textContent='UCI Iris (CC BY 4.0): 150 labeled real samples, 120 train-only, 30 unseen holdout. A fixed six-hidden-neuron MLP predicts three flower species. Model-only; not a GPU/TPU or silicon benchmark.';
    modelSection.append(modelDescription);
    const runModel=document.createElement('button');
    runModel.type='button';runModel.className='primary';
    runModel.setAttribute('data-action','run-iris-holdout');
    runModel.textContent='▶ Run 30-sample Iris model benchmark';
    runModel.addEventListener('click',()=>this.runIrisHoldoutBenchmark().catch(error=>{
      this.log('Iris model holdout failed: '+error.message,'err');
      this._setVerdict('fail');
    }));
    modelSection.append(runModel);
    left.append(modelSection);

    right.innerHTML = `
      <div>What this runs:</div>
      <ul class="muted">
        <li>Random matmul (seeded) at the chosen precision vs the f64 reference</li>
        <li>Analytical P×P systolic-array model: cycles, utilization, GMAC/s, energy</li>
        <li>2-3-1 MLP trained on XOR (deterministic seed) with prediction table</li>
        <li>Validation: precision-dependent error bounds, self-consistency, honesty notes</li>
      </ul>`;
  }

  async runOnnxExample(caseId='matmul-relu'){
    if(this.state.labId!=='ai')throw Error('ONNX subset can run only in the accelerator lab');
    const response=await fetch(new URL('../../benchmarks/phase9/graphs.json',import.meta.url));
    if(!response.ok)throw Error('ONNX fixture file unavailable: HTTP '+response.status);
    const manifest=await response.json();
    if(manifest?.format!=='invention-lab/onnx-subset-fixtures/1'||
       manifest?.operatorSet!==13||manifest?.dtype!=='float32'||
       !Array.isArray(manifest.cases)||manifest.cases.length!==5)
      throw Error('Unsupported or incomplete frozen ONNX example library');
    const graph=manifest.cases.find(item=>item.id===caseId);
    if(!graph)throw Error('Unknown ONNX operator graph example '+caseId);
    const result=runOnnxSubset(graph);
    result.kind='onnx-subset';
    result.caseId=caseId;
    this.lastResult=result;
    this.switchOutputTab('scope');
    this._setVerdict('warn');
    this.log('Model-only ONNX opset-13 graph '+caseId+' computed with '+result.executedNodes+
      ' f32 tensor nodes; independent verification belongs to Phase 9 CI.');
    return result;
  }

  async runOnnxQuantizedExample(caseId='qlinear-int8-symmetric'){
    if(this.state.labId!=='ai')throw Error('ONNX quantized samples require the AI Accelerator Lab');
    const url=new URL('../../benchmarks/phase10/quantized-cases.json',import.meta.url);
    const response=await fetch(url);
    if(!response.ok)throw Error('Quantized sample library missing: HTTP '+response.status);
    const document=await response.json();
    if(document?.format!=='invention-lab/phase10-quantized-fixtures/1'||
       document?.opset!==13||document?.perTensorScalesOnly!==true||
       !Array.isArray(document.cases)||document.cases.length!==6)
       throw Error('Invalid or incomplete quantized ONNX fixture library');
    const graph=document.cases.find(x=>x.id===caseId);
    if(!graph)throw Error('Unknown quantized ONNX example '+caseId);
    const result=runOnnxQuantizedCase(graph);
    this.lastResult=result;
    this.switchOutputTab('scope');
    this._setVerdict('warn');
    this.log('MODEL-ONLY quantized inference '+caseId+' completed. Real ONNX Runtime runs separately in Phase 10 CI.');
    return result;
  }

  async runPhase11Example(caseId='qconv-uint8-valid'){
    if(this.state.labId!=='ai')throw Error('Phase 11 ONNX graph examples require the AI Accelerator Lab');
    const response=await fetch(new URL('../../benchmarks/phase11/cases.json',import.meta.url));
    if(!response.ok)throw Error('Phase 11 ONNX fixture missing: HTTP '+response.status);
    const data=await response.json();
    if(data?.format!=='invention-lab/phase11-fixtures/1'||
       data?.opset!==13||!Array.isArray(data.cases)||data.cases.length!==6)
      throw Error('Invalid Phase 11 frozen operator example collection');
    const c=data.cases.find(x=>x.id===caseId);
    if(!c)throw Error('Unknown Phase 11 operator example '+caseId);
    const result=runPhase11Case(c);
    this.lastResult=result;
    this.switchOutputTab('scope');
    this._setVerdict('warn');
    this.log('MODEL-ONLY Phase 11 '+caseId+' computed. Independent ONNX Runtime validation belongs to CI.');
    return result;
  }

  async runIrisHoldoutBenchmark(){
    if(this.state.labId!=='ai')throw Error('Iris MLP model benchmark requires the AI Accelerator Lab');
    const response=await fetch(new URL('../../benchmarks/phase12/iris-mlp.json',import.meta.url));
    if(!response.ok)throw Error('Licensed Iris model fixture unavailable: HTTP '+response.status);
    const fixture=await response.json();
    const result=runIrisModelBenchmark(fixture);
    this.lastResult=result;
    this.switchOutputTab('scope');
    this._setVerdict('warn');
    this.log('MODEL-ONLY UCI Iris holdout: '+result.correct+'/'+result.samples+
      ' classification predictions correct; independent sklearn/ORT engines run separately in CI, not the browser.');
    return result;
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
    else if (CANVAS_LABS.has(labId) || labId === 'cpu' || labId === 'rv32i') {
      this.inspector.showDesign(lab, diagram, { onMetaChange: () => this._diagramChanged(true) });
    } else {
      this.inspector.showMessage('This lab runs fixed workloads — see the center panel.');
    }
    this.editor.requestRender();
    this.scene3d.sync();
    if(this._activeOutputTab==='atlas')this._renderEvidenceAtlas();
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
    if (this._activeOutputTab === 'evidence') this._renderEvidence();
    if (this._activeOutputTab === 'atlas') this._renderEvidenceAtlas();
  }

  _renderEvidence() {
    const diagram = this.diagrams[this.state.labId];
    if (!diagram) return;
    const report = this.lastReport;
    const data = summarizeDesignEvidence({ diagram, report });
    const body = this.$outputBody;
    body.replaceChildren();
    const heading = document.createElement('h3');
    heading.textContent = 'Real-world build evidence — ' + diagram.name;
    const caption = document.createElement('p');
    caption.className = 'muted';
    caption.textContent = 'Design-specific simulation checks are not a measured build-success probability.';
    const stats = document.createElement('div');
    stats.className = 'evidence-stats';
    for (const [name, value] of [
      ['Design checks passed', data.checks.pass],
      ['Warnings / failures', data.checks.warn + ' / ' + data.checks.fail],
      ['Real-world build success', 'Not estimated'],
      ['Physical validation', 'No verified measurements for this design'],
    ]) {
      const cell = document.createElement('div');
      const title = document.createElement('span');
      title.className = 'muted'; title.textContent = name;
      const val = document.createElement('strong'); val.textContent = String(value);
      cell.append(title, val); stats.appendChild(cell);
    }
    const note = document.createElement('p');
    note.className = 'muted'; note.textContent = data.rationale +
      ' A conditional Monte Carlo rate can only be reported with explicit parameter distributions, an uncertainty model, and stated acceptance criteria.';
    body.append(heading, caption, stats, note);
    const atlasOpen=document.createElement('button');
    atlasOpen.className='small'; atlasOpen.textContent='Explore evidence across labs';
    atlasOpen.setAttribute('data-action','open-evidence-atlas');
    atlasOpen.addEventListener('click',()=>this.switchOutputTab('atlas'));
    body.appendChild(atlasOpen);
    this._renderDesignPhysicalLadder(body);
    this._renderScenarioDemo(body);
    if(this.state.labId==='chip')this._renderFanFirstPrinciplesDemo(body);
    if(this.state.labId==='chip')this._renderPublicSourceResearch(body);
  }

  currentEvidencePassport(){
    const labId=this.state.labId;
    const selection=this.editor.selection;
    const diagram=labId==='crosslab'?null:(this.diagrams[labId]??null);
    return buildEvidencePassport({
      labId,diagram,report:labId==='crosslab'?null:(this.lastReport??null),
      viewMode:this.viewMode,
      selectedBlockId:labId!=='crosslab'&&selection?.kind==='block'?
        selection.id:null
    });
  }

  _renderEvidenceAtlas(){
    const passport=this.currentEvidencePassport(),container=this.$outputBody;
    container.replaceChildren();
    const add=(parent,tag,content,css='')=>{
      const e=document.createElement(tag);
      if(css)e.className=css;
      e.textContent=String(content);
      parent.appendChild(e);
      return e;
    };
    const panel=document.createElement('section');
    panel.className='atlas-panel';
    add(panel,'h3','Evidence Atlas — '+passport.labId);
    add(panel,'p','Historical tool and numerical benchmarks are separate fixed examples. No proof transfers automatically to this design.','muted');
    const current=document.createElement('section');
    current.className='atlas-active';
    add(current,'h4','Current workspace • MODEL ONLY');
    if(passport.currentDesign){
      const d=passport.currentDesign;
      add(current,'p',d.name+' · '+passport.viewMode.toUpperCase()+
        ' view · '+d.blockCount+' components · '+d.wireCount+' connections');
      add(current,'p','Software report: '+d.simulationReportVerdict+
        ' · '+d.simulationCounts.pass+' passing checks, '+
        d.simulationCounts.warn+' warnings, '+d.simulationCounts.fail+' failed checks');
      if(passport.currentComponent){
        const selected=passport.currentComponent;
        add(current,'p','Selected 2D/3D component: '+selected.label+' ('+selected.id+')');
        add(current,'p','Model provenance: '+(selected.modelProvenance||'Unknown / not declared'),'muted');
      }else{
        add(current,'p','Select a component in 2D or 3D to inspect its model provenance.','muted');
      }
    }else add(current,'p','Cross-lab adapters have no single canonical design; outputs remain software only.');
    add(current,'p','DESIGN PHYSICAL STATUS: UNKNOWN — no verified hardware measurements; build-success probability not estimated.','atlas-unknown');
    panel.appendChild(current);
    const references=document.createElement('section');
    references.className='atlas-references';
    add(references,'h4','Source-linked historical references ('+passport.atlas.historicalReferences.length+')');
    if(!passport.atlas.historicalReferences.length){
      add(references,'p','No independent historical external benchmark is registered for this lab.','muted');
    }
    for(const ref of passport.atlas.historicalReferences){
      const card=document.createElement('article');
      card.className='atlas-reference';
      const link=document.createElement('a');
      link.textContent=ref.title;
      link.href=ref.url;link.target='_blank';link.rel='noopener noreferrer';
      card.appendChild(link);
      add(card,'p',ref.summary);
      add(card,'p',ref.kind+' · historical reference · NOT linked to this current design','muted');
      references.appendChild(card);
    }
    panel.appendChild(references);
    const button=add(panel,'button','Export evidence passport (JSON)');
    button.className='small';
    button.setAttribute('data-action','export-evidence-passport');
    button.addEventListener('click',()=>this.exportAs('passport'));
    add(panel,'p','Export includes the exact canonical design snapshot and model-only report. It is not a signed hardware certificate.','muted');
    container.appendChild(panel);
  }

  // The reference ALU's external CI evidence belongs to that example ONLY.
  // None of these physical stages has been executed for the active diagram.
  _renderDesignPhysicalLadder(body){
    const section=document.createElement('section');
    section.className='physical-readiness-ladder';
    const title=document.createElement('h4');
    title.textContent='Design-specific hardware evidence ladder';
    const note=document.createElement('p');
    note.className='muted';
    note.textContent='Every stage is UNKNOWN for this current design unless independently executed and linked to its exact model/source. Phase 13 has a separate real SKY130 ALU technology-mapping CI example; it is NOT evidence that this diagram passes those stages.';
    const list=document.createElement('ul');
    list.setAttribute('aria-label','Current design physical evidence stages');
    for(const id of PHYSICAL_STAGES){
      const entry=document.createElement('li');
      entry.textContent=id+' — UNKNOWN (not run for this design)';
      list.appendChild(entry);
    }
    const verdict=document.createElement('p');
    verdict.className='muted';
    verdict.textContent='PHYSICAL SIGNOFF: UNKNOWN. DRC/LVS/PVT, measured calibration, and prototype tests are not verified. Real-world build success: NOT ESTIMATED.';
    section.append(title,note,list,verdict);
    body.appendChild(section);
  }

  // Demonstration is intentionally independent of the current circuit graph.
  // It is a probability experiment under user-declared toy assumptions, not a
  // manufacturing yield or physical validation claim for the selected design.
  _renderScenarioDemo(body) {
    const section = document.createElement('section');
    section.className = 'scenario-demo';
    const title = document.createElement('h4');
    title.textContent = 'Educational experiment — resistor-divider tolerance';
    const explain = document.createElement('p');
    explain.className = 'muted';
    explain.textContent = 'Model-only example, NOT the current design. Independent Gaussian parameter variation is an explicit assumption. No fabrication yield, aging, thermal effects or measured calibration is included.';
    section.append(title, explain);
    const fields = [
      ['vin', 'Input voltage (V)', 5],
      ['r1', 'Upper resistance R1 (Ω)', 1000],
      ['r2', 'Lower resistance R2 (Ω)', 1000],
      ['rsd', 'Resistor uncertainty, 1σ (%)', 5],
      ['vsd', 'Source uncertainty, 1σ (%)', 1],
      ['min', 'Required Vout minimum (V)', 2.3],
      ['max', 'Required Vout maximum (V)', 2.7],
    ];
    const grid = document.createElement('div');
    grid.className = 'scenario-fields';
    const inputs = {};
    for (const [key, label, defaultValue] of fields) {
      const wrap = document.createElement('label');
      wrap.textContent = label;
      const input = document.createElement('input');
      input.type = 'number'; input.step = 'any';
      input.value = String(defaultValue); input.dataset.scenario = key;
      input.setAttribute('aria-label', label);
      wrap.appendChild(input);
      inputs[key] = input; grid.appendChild(wrap);
    }
    const run = document.createElement('button');
    run.type = 'button'; run.className = 'primary';
    run.textContent = 'Calculate modeled scenario pass %';
    const result = document.createElement('p');
    result.setAttribute('role', 'status');
    result.className = 'scenario-result';
    result.textContent = 'Adjust assumptions and calculate. Real-world build probability remains not estimated.';
    run.addEventListener('click', () => {
      try {
        const v = Object.fromEntries(Object.entries(inputs).map(([k, input]) => {
          if (!input.value.trim()) throw Error(k + ' must not be empty');
          return [k, Number(input.value)];
        }));
        if (Object.values(v).some(n => !Number.isFinite(n)) ||
            v.vin <= 0 || v.r1 <= 0 || v.r2 <= 0 || v.rsd < 0 || v.vsd < 0 ||
            v.min < 0 || v.max <= v.min) throw Error('Voltages, resistances and uncertainty must be physically meaningful; target maximum must exceed minimum.');
        const trial = estimateScenarioPassRate({
          designId: 'educational-divider-scenario',
          intendedUse: 'Ideal resistor-divider output within the specified voltage window',
          parameters: [
            {name:'Vin',mean:v.vin,sd:v.vin*v.vsd/100},
            {name:'R1',mean:v.r1,sd:v.r1*v.rsd/100},
            {name:'R2',mean:v.r2,sd:v.r2*v.rsd/100},
          ],
          independenceAsserted: true, seed: 27, samples: 5000,
          assumptions: [
            'Independent Gaussian component and supply variation, with the entered percentages interpreted as one standard deviation.',
            'Ideal Ohmic resistors and unloaded output; no thermal, parasitic, process-yield or component-failure model.',
          ],
          model: p => {
            if (p.R1 <= 0 || p.R2 <= 0 || p.Vin < 0) throw Error('Nonphysical sampled component value');
            return { Vout:p.Vin*p.R2/(p.R1+p.R2) };
          },
          constraints: [{metric:'Vout',min:v.min,max:v.max}],
        });
        if (trial.status !== 'model-only') {
          result.textContent = 'Inconclusive: ' + trial.modelErrors + ' invalid model evaluation(s). Real-world build success not estimated.';
          return;
        }
        const [lo,hi] = trial.samplingInterval95Percent;
        result.textContent = 'MODEL-ONLY pass rate: ' + trial.modeledPassRatePercent.toFixed(1) +
          '% (95% Monte Carlo sampling interval ' + lo.toFixed(1) + '–' + hi.toFixed(1) +
          '%). Real-world build success: NOT ESTIMATED. This is not physical validation.';
      } catch (e) {
        result.textContent = 'Cannot estimate: ' + e.message;
      }
    });
    section.append(grid, run, result);
    body.appendChild(section);
  }

  // First-principles worked example. This is NOT assembled from the user's
  // current circuit and does not have externally measured motor uncertainty.
  _renderFanFirstPrinciplesDemo(body){
    const section=document.createElement('section');
    section.className='scenario-demo phase31-fan-evidence';
    const title=document.createElement('h4');
    title.textContent='First principles • Battery → Two Wires → DC Motor → Fan';
    const note=document.createElement('p');
    note.className='muted';
    note.textContent='Worked illustrative motor example, NOT the current design: battery droop, Ohmic wire drops, a shared torque/back-EMF constant, static startup, and nonlinear fan drag. All component variation values are hypothetical. This is a brushed DC motor; BLDC electronics need a different model.';
    section.append(title,note);
    const labels=[
      ['voltageV','Battery open-circuit voltage (V)',3],
      ['voltageStdPercent','Assumed battery voltage variation, 1σ (%)',4],
      ['minRpm','Required minimum steady speed (RPM)',1150],
      ['maxMotorCurrentA','Maximum motor running current (A)',0.8],
      ['rpmDiscrepancyAllowance','Optional assumed absolute motor-model error (RPM)','']
    ];
    const grid=document.createElement('div');
    grid.className='scenario-fields';
    const input={};
    for(const [key,text,value] of labels){
      const wrap=document.createElement('label');
      wrap.textContent=text;
      const field=document.createElement('input');
      field.type='number';field.step='any';field.value=String(value);
      field.dataset.fanField=key;
      field.setAttribute('aria-label',text);
      input[key]=field;
      wrap.appendChild(field);grid.appendChild(wrap);
    }
    const button=document.createElement('button');
    button.type='button';button.className='primary';
    button.dataset.action='phase31-fan-calculate';
    button.textContent='Predict conditional fan success %';
    const result=document.createElement('p');
    result.setAttribute('role','status');result.className='scenario-result';
    result.dataset.fanResult='phase31';
    result.textContent='Model the assumptions to calculate a conditional success percentage. Real physical success remains unmeasured.';
    button.addEventListener('click',()=>{
      try{
        const args={};
        for(const [key,field] of Object.entries(input)){
          if(!field.value.trim()){
            if(key==='rpmDiscrepancyAllowance'){args[key]=null;continue;}
            throw Error(key+' is required');
          }
          args[key]=Number(field.value);
          if(!Number.isFinite(args[key]))throw Error(key+' must be finite');
        }
        const trial=fanIllustrativeScenario({...args,seed:31,samples:5000});
        if(trial.status!=='model-only'){
          result.textContent='INCONCLUSIVE: '+trial.modelEvaluationErrors+' nonphysical or invalid simulation samples. Physical success remains unmeasured.';
          return;
        }
        const n=trial.illustrativeNominal;
        const mc=trial.conditionalMonteCarloInterval95Percent;
        const modeled=trial.conditionalModeledSuccessPercent.toFixed(1);
        const interval=mc[0].toFixed(1)+'–'+mc[1].toFixed(1);
        const bound=trial.conditionalWorstCaseModeledSuccessPercent===null?' No measured model-discrepancy bound available.':
          ' If your ASSUMED RPM error bound holds: modeled range '+
          trial.conditionalWorstCaseModeledSuccessPercent.toFixed(1)+'–'+
          trial.conditionalBestCaseModeledSuccessPercent.toFixed(1)+'%.';
        result.textContent='CONDITIONAL MODEL pass: '+modeled+
          '% (95% simulation-sampling interval '+interval+
          '%). Nominal ideal speed '+n.speedRpm.toFixed(0)+
          ' RPM; modeled current '+n.motorCurrentA.toFixed(2)+' A.'+
          bound+' ACTUAL physical/build success: UNKNOWN, not estimated. This is not a measured prototype.';
      }catch(error){
        result.textContent='Cannot calculate: '+error.message;
      }
    });
    section.append(grid,button,result);
    body.appendChild(section);
  }

  // Phase32: load audited external-reference metadata, never assume a source
  // measured this particular user assembly or authenticated the raw logs.
  _renderPublicSourceResearch(body){
    const section=document.createElement('section');
    section.className='scenario-demo phase32-source-research';
    section.dataset.sourceCoverage='phase32';
    const header=document.createElement('h4');
    header.textContent='Source research • Missing data for near-physical evidence';
    const lead=document.createElement('p');
    lead.className='muted';
    lead.textContent='Public measurements from DIFFERENT motors and cells cannot validate this specific battery, wires, motor and fan. Read the 23-item gap checklist before estimating physical success.';
    const details=document.createElement('details');
    const summary=document.createElement('summary');
    summary.textContent='Research sources and missing measurements (loading...)';
    details.appendChild(summary);
    const status=document.createElement('p');
    status.setAttribute('role','status');
    status.dataset.sourceStatus='phase32';
    status.textContent='Loading source-locked research metadata; no claim of physical validation.';
    section.append(header,lead,details,status);
    body.appendChild(section);
    this._sourceResearchPromise=fetch('/benchmarks/phase32/public-source-catalog.json',{
      cache:'no-store'
    }).then(response=>{
      if(!response.ok)throw Error('research catalog unavailable (HTTP '+response.status+')');
      return response.json();
    }).then(catalog=>{
      const report=assessPublicSourceCoverage(catalog);
      if(!section.isConnected||this.state.labId!=='chip')return null;
      summary.textContent=report.sourceReferenceCount+' researched sources, '+
        report.totalExplicitEvidenceRequirements+' requirements, '+
        report.fullyPhysicallySatisfiedRequirements+' target-specific physical gates verified';
      status.textContent='SOURCE INVENTORY ONLY: '+report.publishedExperimentalDatasetsIdentified+
        ' relevant but DIFFERENT-device public datasets identified. Actual raw records ingested: '+
        report.publishedDataOriginalMeasurementsIngested+
        '. Actual target assembly physical measurements: 0. Real manufacturing success: UNKNOWN.';
      const sourcesTitle=document.createElement('h5');
      sourcesTitle.textContent='Externally sourced references (not physical proof for this design)';
      details.appendChild(sourcesTitle);
      const list=document.createElement('ul');
      for(const source of catalog.sources){
        const item=document.createElement('li');
        const a=document.createElement('a');a.textContent=source.title;
        a.href=source.url;a.target='_blank';a.rel='noopener noreferrer';
        const scope=document.createElement('span');
        scope.textContent=' — '+source.recordStatus+'; '+source.subjectMatch;
        item.append(a,scope);list.appendChild(item);
      }
      details.appendChild(list);
      const requirementTitle=document.createElement('h5');
      requirementTitle.textContent='Evidence missing from this exact fan assembly';
      details.appendChild(requirementTitle);
      const requirements=document.createElement('ul');
      for(const row of report.requirements){
        const item=document.createElement('li');
        item.textContent=row.id+': '+row.requirement+' — '+
          (row.id==='solver-verification'?'model equations checked, physical evidence not established':
           'exact-device measurements MISSING');
        requirements.appendChild(item);
      }
      details.appendChild(requirements);
      const spec=document.createElement('p');spec.className='muted';
      spec.textContent='Published DIFFERENT motor (Pololu #1592) at 3 V: no-load speed '+
        report.supplierCharacteristics.sourceNoLoadSpeedRpm+' RPM, stall '+
        report.supplierCharacteristics.sourceStallCurrentA+' A, inferred winding resistance '+
        report.supplierCharacteristics.inferredStallResistanceOhm+' Ω. Kt/Ke approximation difference '+
        report.supplierCharacteristics.kRelativeInconsistencyPercent.toFixed(2)+
        '%, NOT a calibrated fan model error and NOT a physical success percentage.';
      details.appendChild(spec);
      return report;
    }).catch(error=>{
      status.textContent='Cannot audit public sources: '+error.message+
        '. Do not infer matching-device physical measurements.';
      return null;
    });
    return section;
  }

  _setVerdict(v) {
    const label = { pass: '✔ PASS', warn: '⚠ WARN', fail: '✘ FAIL', unknown: '? UNKNOWN', none: '– NOT TESTED' }[v] || v;
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
    } else if (tab === 'evidence') {
      this._renderEvidence();
    } else if (tab === 'atlas') {
      this._renderEvidenceAtlas();
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
    if (SCENE_LABS.has(this.state.labId)) {
      this.scene3d.mount(this.diagrams[this.state.labId]);
      this.assemblyShelf.setData(this.diagrams[this.state.labId],this.moduleLibrary);
    }
    if (this.state.labId === 'cpu') this._showCpuPanel(this.diagrams[this.state.labId]);
    if (this.state.labId === 'rv32i') this._showRv32iPanel(this.diagrams[this.state.labId]);
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
    if(kind==='passport'){
      const passport=this.currentEvidencePassport();
      const name=passport.currentDesign?.name||this.state.labId||'crosslab';
      download(name.replace(/[^a-z0-9_-]+/gi,'_')+'.evidence-passport.json',
        JSON.stringify(passport,null,2),'application/json');
      this.log('Exported exact design snapshot and scoped reference evidence; hardware status remains UNKNOWN.');
      return;
    }
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
    if (this.viewMode === '3d' && !mod && ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key) &&
        !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)) {
      const id = this.scene3d.selectedId;
      const block = id && this.diagrams[this.state.labId]?.block(id);
      if (block) {
        e.preventDefault();
        block.x += e.key === 'ArrowLeft' ? -20 : e.key === 'ArrowRight' ? 20 : 0;
        block.y += e.key === 'ArrowUp' ? -20 : e.key === 'ArrowDown' ? 20 : 0;
        this._diagramChanged(); this.editor.requestRender();
        return;
      }
    }
    if (e.key === 'f' || e.key === 'F') {
      this.viewMode === '3d' ? this.scene3d.fit() : this.editor.fit(); return;
    }
    if (e.key === '?') { this.showHelp(); return; }
    if (e.key === 'Escape') {
      document.getElementById('overlay')?.remove();
      if(this.assemblyShelf.open){
        this.assemblyShelf.toggle(false);
        this.$assembliesButton.setAttribute('aria-expanded','false');
      } else if(this.scene3d.focusIds) {
        this.scene3d.setFocus(null);
      }
    }
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
