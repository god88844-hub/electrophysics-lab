// palette.js — component palette: grouped by category, click or drag to add.

export class Palette {
  constructor(container, { onAdd }) {
    this.container = container;
    this.onAdd = onAdd;
    this.defs = [];
  }

  show(labId, allComponents) {
    this.defs = allComponents.filter((d) => d.lab === labId);
    this.container.innerHTML = '';
    const cats = new Map();
    for (const d of this.defs) {
      const cat = d.category || 'Components';
      if (!cats.has(cat)) cats.set(cat, []);
      cats.get(cat).push(d);
    }
    for (const [cat, defs] of cats) {
      const h = document.createElement('h3');
      h.textContent = cat;
      this.container.appendChild(h);
      for (const def of defs) {
        const item = document.createElement('button');
        item.className = 'pal-item';
        item.type = 'button';
        item.draggable = true;
        item.title = def.desc || def.label;
        item.setAttribute('aria-label', `Add ${def.label}`);
        const sym = document.createElement('span');
        sym.className = 'sym';
        sym.textContent = def.draw || '▪';
        item.appendChild(sym);
        item.appendChild(document.createTextNode(def.label));
        item.addEventListener('click', () => this.onAdd(def.typeId, null));
        item.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/x-ilab-type', def.typeId);
          e.dataTransfer.effectAllowed = 'copy';
        });
        this.container.appendChild(item);
      }
    }
  }
}
