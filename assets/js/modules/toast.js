/**
 * Toast Module (PRD §6.3, R-BS-01, B11)
 * Helper to show modern toasts using Bootstrap Toast API.
 */

let container = null;

function getContainer() {
  if (!container || !document.body.contains(container)) {
    container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
      container.style.zIndex = '1090';
      document.body.appendChild(container);
    }
  }
  return container;
}

export function show({ title = '', message = '', variant = 'default', delay = 4000 } = {}) {
  const cont = getContainer();

  const toastEl = document.createElement('div');
  toastEl.className = 'toast align-items-center shadow-sm';
  toastEl.setAttribute('role', 'alert');
  toastEl.setAttribute('aria-live', 'assertive');
  toastEl.setAttribute('aria-atomic', 'true');

  let iconName = 'info';
  if (variant === 'success') iconName = 'check-circle-2';
  if (variant === 'danger') iconName = 'alert-triangle';

  toastEl.innerHTML = `
    <div class="toast-header">
      <svg class="xa-icon me-2 text-primary" aria-hidden="true">
        <use href="${document.baseURI.includes('/pages/') ? '../' : ''}assets/icons/sprite.svg#${iconName}"/>
      </svg>
      <strong class="me-auto">${title || 'Notifikasi'}</strong>
      <small class="text-body-secondary">Baru saja</small>
      <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Tutup"></button>
    </div>
    <div class="toast-body">
      ${message}
    </div>
  `;

  cont.appendChild(toastEl);

  if (window.bootstrap && window.bootstrap.Toast) {
    const bsToast = new window.bootstrap.Toast(toastEl, { delay });
    bsToast.show();
    toastEl.addEventListener('hidden.bs.toast', () => {
      toastEl.remove();
    });
  } else {
    // Fallback if bootstrap JS is not loaded yet
    setTimeout(() => toastEl.remove(), delay);
  }

  return toastEl;
}

export function init() {
  // Can bind to trigger buttons if needed
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-xa-toast]');
    if (trigger) {
      const title = trigger.getAttribute('data-xa-toast-title') || 'Info';
      const message = trigger.getAttribute('data-xa-toast-message') || 'Aksi berhasil dijalankan.';
      const variant = trigger.getAttribute('data-xa-toast-variant') || 'default';
      show({ title, message, variant });
    }
  });
}

export function destroy() {
  if (container && container.parentNode) {
    container.parentNode.removeChild(container);
    container = null;
  }
}
