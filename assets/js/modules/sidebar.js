/**
 * Sidebar Module (PRD §6.1, L-01..13, §B2, §B3)
 * Controls desktop expand/collapse, mobile offcanvas, active links, and Ctrl+B shortcut.
 */

import { storage } from '../utils/storage.js';

let keydownListener = null;

export function getState() {
  return storage.get('xa:sidebar-state', 'expanded');
}

export function setState(state) {
  const finalState = state === 'collapsed' ? 'collapsed' : 'expanded';
  storage.set('xa:sidebar-state', finalState);
  document.documentElement.setAttribute('data-xa-sidebar-state', finalState);

  document.dispatchEvent(new CustomEvent('xa:sidebar-toggle', {
    detail: { state: finalState }
  }));
}

export function toggle() {
  const current = getState();
  setState(current === 'collapsed' ? 'expanded' : 'collapsed');
}

export function expand() {
  setState('expanded');
}

export function collapse() {
  setState('collapsed');
}

function handleSidebarClick(event) {
  const toggleBtn = event.target.closest('[data-xa-sidebar-toggle]');
  if (!toggleBtn) return;

  // Check if mobile (< 992px)
  if (window.innerWidth < 992) {
    const sidebarEl = document.querySelector('[data-xa-sidebar]');
    if (sidebarEl && window.bootstrap && window.bootstrap.Offcanvas) {
      const bsOffcanvas = window.bootstrap.Offcanvas.getOrCreateInstance(sidebarEl);
      bsOffcanvas.toggle();
    }
  } else {
    toggle();
  }
}

function handleMobileNavClick(event) {
  if (window.innerWidth >= 992) return;
  const link = event.target.closest('.xa-sidebar .nav-link:not([data-bs-toggle="collapse"])');
  if (link) {
    const sidebarEl = document.querySelector('[data-xa-sidebar]');
    if (sidebarEl && window.bootstrap && window.bootstrap.Offcanvas) {
      const bsOffcanvas = window.bootstrap.Offcanvas.getInstance(sidebarEl);
      if (bsOffcanvas) bsOffcanvas.hide();
    }
  }
}

function highlightActiveLink() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const links = document.querySelectorAll('.xa-sidebar .nav-link[href]');

  links.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const targetFile = href.split('/').pop().split('#')[0];
    if (targetFile === currentPath) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');

      // Expand parent collapse if any
      const parentCollapse = link.closest('.collapse');
      if (parentCollapse) {
        parentCollapse.classList.add('show');
        const trigger = document.querySelector(`[data-bs-target="#${parentCollapse.id}"]`);
        if (trigger) {
          trigger.setAttribute('aria-expanded', 'true');
          trigger.classList.remove('collapsed');
        }
      }
    }
  });
}

export function init(root = document) {
  // Listen for clicks
  root.addEventListener('click', handleSidebarClick);
  root.addEventListener('click', handleMobileNavClick);

  // Keyboard shortcut Ctrl+B / Cmd+B (PRD L-13)
  keydownListener = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      // Don't intercept if user is typing in an input
      const activeTag = document.activeElement ? document.activeElement.tagName : '';
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag)) return;
      e.preventDefault();
      toggle();
    }
  };
  window.addEventListener('keydown', keydownListener);

  // Sync initial state
  const state = getState();
  setState(state);
  highlightActiveLink();
}

export function destroy(root = document) {
  root.removeEventListener('click', handleSidebarClick);
  root.removeEventListener('click', handleMobileNavClick);
  if (keydownListener) {
    window.removeEventListener('keydown', keydownListener);
    keydownListener = null;
  }
}
