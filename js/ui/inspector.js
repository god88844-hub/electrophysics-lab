// inspector.js — property editor for the selected block + design settings.
// Validation info (model provenance, tolerances) is always shown: the UI
// surfaces WHAT IS KNOWN about each model, including what is unknown.

import { getComponent } from '../core/registry.js';

export class Inspector {
  constructor(container, { onChange, onDelete, onDuplicate }) {
    this.container = container;
    this.onChange = onChange;
    this.onDelete = onDelete;
    this.onDuplicate = onDuplicate;
  }

  showBlock(block, { diagram } = {}) {
    const def = getComponent(block.type);
    this.container.innerHTML = '';
    const h = document.createElement('h3');
    h.textContent = def?.label || block.type;
    this.container.appendChild(h);
    const idRow = document.createElement('div');
    idRow.className = 'muted mono';
    idRow.style.fontSize = '11px';
    idRow.textContent = block.id;
    this.container.appendChild(idRow);

    for (const p of def?.params || []) {
      const field = document.createElement('div');
      field.className = 'field';
      const label = document.createElement('label');
      label.textContent = p.label || p.key;
      if (p.tol !== undefined) label.textContent += ` (±${Math.round(p.tol * 100)}%)`;
      field.appendChild(label);
      let input;
      if (p.type === 'select') {
        input = document.createElement('select');
        for (const opt of p.options) {
          const o = document.createElement('option');
          o.value = String(opt);
          o.textContent = String(opt);
          input.appendChild(o);
        }
        input.value = String(block.params[p.key]);
      } else if (p.type === 'textarea') {
        input = document.createElement('textarea');
        input.rows = 6;
        input.value = block.params[p.key] ?? '';
      } else if (p.type === 'checkbox') {
        input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = !!block.params[p.key];
      } else {
        input = document.createElement('input');
        input.type = 'number';
        if (p.step) input.step = p.step;
        input.value = block.params[p.key];
      }
      input.addEventListener('change', () => {
        let v = input.value;
        if (p.type === 'number') v = parseFloat(v);
        if (p.type === 'checkbox') v = input.checked;
        block.params[p.key] = v;
        this.onChange('param');
      });
      field.appendChild(input);
      this.container.appendChild(field);
    }

    // model provenance & tolerance transparency
    const prov = def?.validation?.provenance;
    const box = document.createElement('div');
    box.className = 'prov';
    if (prov) {
      box.innerHTML = `<b>Model provenance:</b> ${escapeHtml(prov)}`;
    } else {
      box.innerHTML = `<b>⚠ Unknown model:</b> this component has no provenance and appears in the report assumptions.`;
    }
    this.container.appendChild(box);

    const row = document.createElement('div');
    row.className = 'rowbtns';
    const dup = document.createElement('button');
    dup.textContent = 'Duplicate';
    dup.className = 'small';
    dup.addEventListener('click', () => this.onDuplicate());
    const del = document.createElement('button');
    del.textContent = 'Delete';
    del.className = 'small';
    del.addEventListener('click', () => this.onDelete());
    row.append(dup, del);
    this.container.appendChild(row);
  }

  showDesign(lab, diagram, { onMetaChange }) {
    this.container.innerHTML = '';
    const h = document.createElement('h3');
    h.textContent = 'Design settings';
    this.container.appendChild(h);
    const note = document.createElement('div');
    note.className = 'muted';
    note.style.fontSize = '11px';
    note.textContent = 'Select a block to edit its parameters. Lab-level settings:';
    this.container.appendChild(note);

    for (const s of lab?.metaSchema || []) {
      const field = document.createElement('div');
      field.className = 'field';
      const label = document.createElement('label');
      label.textContent = s.label || s.key;
      field.appendChild(label);
      let input;
      if (s.type === 'select') {
        input = document.createElement('select');
        for (const opt of s.options) {
          const o = document.createElement('option');
          o.value = String(opt);
          o.textContent = String(opt);
          input.appendChild(o);
        }
        input.value = String(diagram.meta[s.key] ?? s.default);
      } else if (s.type === 'textarea') {
        input = document.createElement('textarea');
        input.rows = 14;
        input.className = 'mono';
        input.style.width = '100%';
        input.value = diagram.meta[s.key] ?? s.default;
      } else {
        input = document.createElement('input');
        input.type = s.type === 'number' ? 'number' : 'text';
        input.value = diagram.meta[s.key] ?? s.default;
      }
      input.addEventListener('change', () => {
        let v = input.value;
        if (s.type === 'number') v = parseFloat(v);
        if (s.type === 'select' && !isNaN(Number(v)) && typeof s.options?.[0] === 'number') v = Number(v);
        diagram.meta[s.key] = v;
        onMetaChange(s.key, v);
      });
      field.appendChild(input);
      this.container.appendChild(field);
    }
  }

  showMessage(msg, isError = false) {
    this.container.innerHTML = '';
    const box = document.createElement('div');
    box.className = 'prov';
    box.style.color = isError ? 'var(--fail)' : 'var(--text-dim)';
    box.textContent = msg;
    this.container.appendChild(box);
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
}
