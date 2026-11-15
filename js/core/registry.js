// registry.js — global component / lab / example registries.
// This is the plugin surface: third-party labs register here and the UI
// picks them up automatically (see docs/PLUGIN_API.md).

const components = new Map(); // typeId -> def
const labs = new Map();       // labId -> lab object
const examples = new Map();   // exampleId -> { id, label, lab, json | getJSON() }

export function registerComponent(def) {
  if (!def.typeId || !def.lab || !def.label) {
    throw new Error(`Component definition needs typeId, lab and label: ${JSON.stringify(def.typeId)}`);
  }
  if (components.has(def.typeId)) throw new Error(`Duplicate component typeId: ${def.typeId}`);
  components.set(def.typeId, def);
}
export function getComponent(typeId) { return components.get(typeId) || null; }
export function allComponents() { return [...components.values()]; }
export function componentsForLab(labId) { return allComponents().filter((d) => d.lab === labId); }

export function registerLab(lab) {
  if (!lab.id || !lab.label) throw new Error('Lab needs id and label');
  if (labs.has(lab.id)) throw new Error(`Duplicate lab id: ${lab.id}`);
  labs.set(lab.id, lab);
}
export function getLab(id) { return labs.get(id) || null; }
export function allLabs() { return [...labs.values()]; }

export function registerExample(ex) {
  if (!ex.id || !ex.label) throw new Error('Example needs id and label');
  examples.set(ex.id, ex);
}
export function allExamples() { return [...examples.values()]; }
export function getExample(id) { return examples.get(id) || null; }
