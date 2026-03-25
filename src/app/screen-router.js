/**
 * screen-router.js — Manages which screen is visible and browser history state.
 * Screens are identified by matching #screen-{name} element IDs.
 */

const SCREEN_PREFIX = 'screen-';

/** @type {string|null} */
let _currentScreen = null;

/**
 * Shows the named screen and hides all others.
 * Pushes a browser history entry so the back button returns to the previous screen.
 *
 * @param {string} name — 'level-select' | 'game' | 'modal'
 * @param {object} [state] — optional data to attach to the history entry
 */
export function showScreen(name, state = {}) {
  const allScreens = document.querySelectorAll('.screen');
  const target = document.getElementById(`${SCREEN_PREFIX}${name}`);

  if (!target) {
    console.warn(`[screen-router] No screen found: #${SCREEN_PREFIX}${name}`);
    return;
  }

  allScreens.forEach(el => {
    if (el === target) {
      el.removeAttribute('hidden');
    } else {
      // Don't hide the modal overlay using the same mechanism — modal is layered
      if (!el.classList.contains('screen--modal') || name === 'modal') {
        el.setAttribute('hidden', '');
      }
    }
  });

  if (name !== 'modal') {
    // Only non-modal transitions push real history entries
    if (_currentScreen !== name) {
      window.history.pushState({ screen: name, ...state }, '', `#${name}`);
    }
  }

  _currentScreen = name;
}

/**
 * Hides the modal overlay without affecting the underlying screen.
 */
export function hideModal() {
  const modal = document.getElementById('screen-modal');
  if (modal) modal.setAttribute('hidden', '');
  if (_currentScreen === 'modal') {
    _currentScreen = null;
  }
}

/**
 * Returns the name of the currently visible screen, or null.
 * @returns {string|null}
 */
export function currentScreen() {
  return _currentScreen;
}

/**
 * Sets up the popstate listener so the browser back button navigates screens.
 * Call once during bootstrap.
 *
 * @param {function} onBack — called with the popped screen name (or null)
 */
export function initRouter(onBack) {
  window.addEventListener('popstate', (event) => {
    const name = event.state?.screen ?? null;
    if (name) {
      showScreen(name, event.state);
    }
    if (typeof onBack === 'function') {
      onBack(name, event.state);
    }
  });
}
