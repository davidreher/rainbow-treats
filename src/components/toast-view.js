export class ToastView {
  constructor(containerId = 'toast-container') {
    this._container = document.getElementById(containerId);
    this._onStorageError = () => this.show('Progress cannot be saved');
    document.addEventListener('storage-error', this._onStorageError);
  }

  show(message, timeout = 2600) {
    if (!this._container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.textContent = message;

    const dismiss = () => {
      toast.classList.add('toast--exiting');
      setTimeout(() => toast.remove(), 220);
    };

    toast.addEventListener('click', dismiss);
    this._container.appendChild(toast);
    setTimeout(dismiss, timeout);
  }

  destroy() {
    document.removeEventListener('storage-error', this._onStorageError);
  }
}
