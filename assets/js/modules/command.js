/**
 * Command Palette Module (PRD §6.3, P-154)
 * Quick launcher dialog accessible via Ctrl+K / Cmd+K.
 */

let commandModal = null;
let keyListener = null;

export const COMMAND_ITEMS = [
  { id: 'dash', title: 'Dashboard', category: 'Navigasi', href: 'index.html', icon: 'layout-dashboard' },
  { id: 'dt', title: 'Data Table', category: 'Navigasi', href: 'pages/data-table.html', icon: 'table' },
  { id: 'forms', title: 'Formulir', category: 'Navigasi', href: 'pages/forms.html', icon: 'file-text' },
  { id: 'comp', title: 'Komponen (Styleguide)', category: 'Navigasi', href: 'pages/components.html', icon: 'blocks' },
  { id: 'sett', title: 'Pengaturan', category: 'Navigasi', href: 'pages/settings.html', icon: 'settings' },
  { id: 'prof', title: 'Profil Saya', category: 'Navigasi', href: 'pages/profile.html', icon: 'user' },
  { id: 'blank', title: 'Starter / Blank Page', category: 'Navigasi', href: 'pages/blank.html', icon: 'file' },
  { id: 'login', title: 'Halaman Login', category: 'Autentikasi', href: 'pages/auth/login.html', icon: 'log-in' },
  { id: 'reg', title: 'Halaman Registrasi', category: 'Autentikasi', href: 'pages/auth/register.html', icon: 'user-plus' },
  { id: 'toggle-theme', title: 'Ganti Mode Gelap / Terang', category: 'Aksi', action: 'toggle-theme', icon: 'sun' },
  { id: 'toggle-sidebar', title: 'Lipat / Buka Sidebar', category: 'Aksi', action: 'toggle-sidebar', icon: 'panel-left' }
];

export function open() {
  let modalEl = document.getElementById('xaCommandModal');
  if (!modalEl) {
    modalEl = createModalElement();
    document.body.appendChild(modalEl);
  }

  if (window.bootstrap && window.bootstrap.Modal) {
    commandModal = window.bootstrap.Modal.getOrCreateInstance(modalEl);
    commandModal.show();

    setTimeout(() => {
      const input = modalEl.querySelector('#xaCommandInput');
      if (input) input.focus();
    }, 100);
  }
}

export function close() {
  if (commandModal) {
    commandModal.hide();
  }
}

function createModalElement() {
  const isInsidePages = window.location.pathname.includes('/pages/');
  const prefix = isInsidePages ? '../' : '';

  const div = document.createElement('div');
  div.className = 'modal fade xa-command-dialog';
  div.id = 'xaCommandModal';
  div.tabIndex = -1;
  div.setAttribute('aria-hidden', 'true');

  div.innerHTML = `
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="xa-command__search-wrapper">
          <svg class="xa-icon text-muted" aria-hidden="true">
            <use href="${prefix}assets/icons/sprite.svg#search"/>
          </svg>
          <input type="text" class="xa-command__search-input" id="xaCommandInput" placeholder="Ketik perintah atau cari halaman..." autocomplete="off">
          <span class="xa-command__shortcut">ESC</span>
        </div>
        <div class="xa-command__list" id="xaCommandList">
          <!-- Rendered dynamically -->
        </div>
      </div>
    </div>
  `;

  const input = div.querySelector('#xaCommandInput');
  const list = div.querySelector('#xaCommandList');

  const renderItems = (filterText = '') => {
    const q = filterText.toLowerCase().trim();
    const filtered = COMMAND_ITEMS.filter(item =>
      item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
    );

    if (filtered.length === 0) {
      list.innerHTML = `<div class="text-center py-4 text-muted small">Tidak ada hasil ditemukan</div>`;
      return;
    }

    // Group by category
    const groups = {};
    filtered.forEach(it => {
      groups[it.category] = groups[it.category] || [];
      groups[it.category].push(it);
    });

    let html = '';
    for (const [cat, items] of Object.entries(groups)) {
      html += `<div class="xa-command__group-title">${cat}</div>`;
      items.forEach(it => {
        let hrefAttr = '#';
        if (it.href) {
          hrefAttr = isInsidePages
            ? (it.href.startsWith('pages/') ? it.href.replace('pages/', '') : '../' + it.href)
            : it.href;
        }

        html += `
          <a class="xa-command__item" href="${hrefAttr}" data-xa-command-action="${it.action || ''}">
            <svg class="xa-icon text-muted" aria-hidden="true">
              <use href="${prefix}assets/icons/sprite.svg#${it.icon}"/>
            </svg>
            <span>${it.title}</span>
            <span class="xa-command__shortcut">↵</span>
          </a>
        `;
      });
    }
    list.innerHTML = html;
  };

  input.addEventListener('input', (e) => {
    renderItems(e.target.value);
  });

  list.addEventListener('click', (e) => {
    const item = e.target.closest('.xa-command__item');
    if (!item) return;

    const action = item.getAttribute('data-xa-command-action');
    if (action === 'toggle-theme') {
      e.preventDefault();
      close();
      const current = window.XaktiAdmin?.theme?.get();
      window.XaktiAdmin?.theme?.set(current === 'dark' ? 'light' : 'dark');
    } else if (action === 'toggle-sidebar') {
      e.preventDefault();
      close();
      window.XaktiAdmin?.sidebar?.toggle();
    } else {
      close();
    }
  });

  renderItems();
  return div;
}

export function init() {
  keyListener = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      open();
    }
  };
  window.addEventListener('keydown', keyListener);

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-xa-command-open]')) {
      e.preventDefault();
      open();
    }
  });
}

export function destroy() {
  if (keyListener) {
    window.removeEventListener('keydown', keyListener);
    keyListener = null;
  }
}
