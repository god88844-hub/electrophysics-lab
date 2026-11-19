import test from 'node:test';
import assert from 'node:assert/strict';
import { attachPanelClose } from '../js/ui/panel-close.mjs';

/** Minimal DOM stub sufficient for attachPanelClose wiring semantics. */
function makeElement(tag = 'div') {
  const el = {
    tag,
    children: [],
    listeners: {},
    attributes: {},
    dataset: {},
    hidden: false,
    style: {},
    classList: {
      _set: new Set(),
      add(c) { this._set.add(c); },
      remove(c) { this._set.delete(c); },
      contains(c) { return this._set.has(c); },
    },
    ownerDocument: null,
    appendChild(child) { this.children.push(child); child.parentElement = this; return child; },
    removeChild(child) {
      const i = this.children.indexOf(child);
      if (i >= 0) this.children.splice(i, 1);
      child.parentElement = null;
    },
    addEventListener(type, fn) { (this.listeners[type] ??= []).push(fn); },
    removeEventListener(type, fn) {
      this.listeners[type] = (this.listeners[type] ?? []).filter((f) => f !== fn);
    },
    setAttribute(k, v) { this.attributes[k] = v; },
    getAttribute(k) { return this.attributes[k] ?? null; },
    click() { for (const fn of this.listeners.click ?? []) fn({}); },
    fireKey(key) { for (const fn of (el.ownerDocument?.listeners.keydown) ?? []) fn({ key }); },
  };
  return el;
}

function makeDoc() {
  const doc = makeElement('#document');
  doc.createElement = (tag) => {
    const el = makeElement(tag);
    el.ownerDocument = doc;
    return el;
  };
  return doc;
}

test('panel-close: adds a visible × button and closes on click', () => {
  const doc = makeDoc();
  const panel = doc.createElement('section');
  panel.ownerDocument = doc;
  const toggle = doc.createElement('button');
  toggle.setAttribute('aria-expanded', 'true');
  const { button } = attachPanelClose({ panel, toggle, label: 'Close test panel' });
  assert.ok(panel.children.includes(button), 'close button is inside the panel');
  assert.equal(button.textContent, '×');
  assert.equal(button.getAttribute('aria-label'), 'Close test panel');
  button.click();
  assert.equal(panel.hidden, true, 'panel hides on × click');
  assert.equal(toggle.getAttribute('aria-expanded'), 'false', 'aria-expanded resets');
});

test('panel-close: Esc key closes an open panel but not a hidden one', () => {
  const doc = makeDoc();
  const panel = doc.createElement('aside');
  panel.ownerDocument = doc;
  let closed = 0;
  const { close } = attachPanelClose({ panel, onClose: () => closed++ });
  panel.hidden = false;
  doc.listeners.keydown[0]({ key: 'Escape' });
  assert.equal(panel.hidden, true);
  assert.equal(closed, 1);
  // Esc on an already-hidden panel is a no-op.
  doc.listeners.keydown[0]({ key: 'Escape' });
  assert.equal(closed, 1);
  // Other keys never close.
  panel.hidden = false;
  doc.listeners.keydown[0]({ key: 'Tab' });
  assert.equal(panel.hidden, false);
  void close;
});

test('panel-close: dispose removes the button and listeners', () => {
  const doc = makeDoc();
  const panel = doc.createElement('div');
  panel.ownerDocument = doc;
  const handle = attachPanelClose({ panel });
  const listenerCount = doc.listeners.keydown.length;
  handle.dispose();
  assert.equal(panel.children.length, 0, 'close button removed');
  assert.equal(doc.listeners.keydown.length, listenerCount - 1, 'document Esc listener removed');
});

test('panel-close: requires a panel element', () => {
  assert.throws(() => attachPanelClose({}), /panel element required/);
});
