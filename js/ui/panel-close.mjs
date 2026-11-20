// panel-close.mjs — universal × Close / Clear affordance for every
// toggleable Phase 0 panel (drawers, inspectors, modals).
// Adds a crisp top-right close button plus an Esc handler; both hide the
// panel and restore the toggle's aria-expanded state. Zero dependencies,
// no styling assumptions beyond an optional CSS class.

/**
 * Attach a close affordance to a toggleable panel.
 * @param {object} args
 * @param {HTMLElement} args.panel the panel element (hidden-flag pattern)
 * @param {HTMLElement} [args.toggle] the button that toggles the panel
 * @param {Function} [args.onClose] extra cleanup hook (optional)
 * @param {string} [args.label] accessible label (default 'Close panel')
 * @returns {{close: Function, dispose: Function, button: HTMLElement}}
 */
export function attachPanelClose({ panel, toggle, onClose, label = 'Close panel' }) {
  if (!panel) throw Error('attachPanelClose: panel element required');
  const doc = panel.ownerDocument ?? document;
  const button = doc.createElement('button');
  button.type = 'button';
  button.className = 'panel-close';
  button.textContent = '×';
  button.setAttribute('aria-label', label);
  button.title = 'Close (Esc)';
  // Panel headers vary; place the button absolutely inside the panel.
  button.style.position = 'absolute';
  button.style.top = '6px';
  button.style.right = '8px';
  button.style.zIndex = '5';
  if (!panel.style.position || panel.style.position === 'static') {
    // Do not mutate panels that already manage their own positioning.
    if (!getComputedStyleSafe(panel).includes('relative')) {
      panel.classList.add('has-panel-close');
    }
  }
  panel.appendChild(button);

  const close = () => {
    if (panel.hidden) return;
    panel.hidden = true;
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
      if (typeof toggle.dataset !== 'undefined' && toggle.dataset.action) {
        toggle.setAttribute('aria-pressed', 'false');
      }
    }
    if (onClose) onClose();
  };
  button.addEventListener('click', close);

  const onKey = (event) => {
    if (event.key !== 'Escape') return;
    if (panel.hidden) return;
    close();
  };
  doc.addEventListener('keydown', onKey);

  return {
    close,
    button,
    dispose() {
      button.removeEventListener('click', close);
      doc.removeEventListener('keydown', onKey);
      if (button.parentElement === panel) panel.removeChild(button);
    },
  };
}

/** Minimal computed-style probe that works headless (no window). */
function getComputedStyleSafe(el) {
  try {
    if (typeof getComputedStyle === 'function') {
      return getComputedStyle(el).position ?? '';
    }
  } catch {
    /* headless/edge environments */
  }
  return '';
}
