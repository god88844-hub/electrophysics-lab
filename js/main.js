// main.js — application entry point.
// Registration order matters: labs register into the global registry, then
// examples, then third-party plugins (which use the same public API — see
// docs/PLUGIN_API.md), and finally the UI mounts.

// core registries
import { allLabs, allExamples } from './core/registry.js';

// built-in labs (each file self-registers)
import './labs/logic/components.js';
import './labs/logic/lab.js';
import './labs/chip/components.js';
import './labs/chip/lab.js';
import './labs/cpu/lab.js';
import './labs/ai/lab.js';
import './labs/quantum/components.js';
import './labs/quantum/lab.js';

// examples + cross-lab demos
import './examples/index.js';
import './examples/crosslab.js';

// third-party plugin demo (registers the Optics lab)
import './plugins/index.js';

// UI
import { App } from './ui/app.js';

const app = new App(document.getElementById('app'));
app.boot();

// expose for console tinkering
window.inventionLab = { app, labs: allLabs(), examples: allExamples() };
