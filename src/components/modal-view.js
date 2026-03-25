export class ModalView {
  constructor() {
    this._screen = document.getElementById('screen-modal');
    this._title = document.getElementById('modal-title');
    this._message = document.getElementById('modal-message');
    this._actions = document.getElementById('modal-actions');

    this._screen?.setAttribute('aria-live', 'assertive');
    this._screen?.setAttribute('aria-labelledby', 'modal-title');
    this._screen?.setAttribute('aria-describedby', 'modal-message');
  }

  show({ title, message, actions = [] }) {
    if (!this._screen) return;

    this._title.textContent = title ?? '';
    this._message.textContent = message ?? '';
    this._actions.innerHTML = '';

    for (const action of actions) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = action.label;
      if (action.primary) btn.classList.add('btn-primary');
      btn.setAttribute('aria-label', action.label);
      btn.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('modal-action', {
          bubbles: true,
          detail: { action: action.id },
        }));
      });
      this._actions.appendChild(btn);
    }

    this._screen.removeAttribute('hidden');
    const firstAction = this._actions.querySelector('button');
    firstAction?.focus();
  }

  hide() {
    if (this._screen) this._screen.setAttribute('hidden', '');
  }
}
