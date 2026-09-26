/**
 * Theme Module (R-THM-08, R-STR-06, PRD §6.5)
 * Manages light/dark/system modes, global accent color, and radius.
 */

import { storage } from '../utils/storage.js';

let mediaQueryListener = null;

export function getSystemTheme() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function getEffectiveTheme(preference) {
  return preference === 'system' ? getSystemTheme() : preference;
}

export function get() {
  return storage.get('xa:theme', 'system');
}

export function set(theme) {
  if (!['light', 'dark', 'system'].includes(theme)) return;
  storage.set('xa:theme', theme);

  const effective = getEffectiveTheme(theme);
  document.documentElement.setAttribute('data-bs-theme', effective);

  // Update theme toggle UI states if present
  document.querySelectorAll('[data-xa-theme-value]').forEach(el => {
    const isActive = el.getAttribute('data-xa-theme-value') === theme;
    el.classList.toggle('active', isActive);
    el.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });

  document.dispatchEvent(new CustomEvent('xa:theme-change', {
    detail: { theme, effectiveTheme: effective }
  }));
}

export function setAccent(accent) {
  if (!accent) {
    storage.remove('xa:accent');
    document.documentElement.removeAttribute('data-xa-accent');
  } else {
    storage.set('xa:accent', accent);
    document.documentElement.setAttribute('data-xa-accent', accent);
  }

  document.querySelectorAll('[data-xa-accent-value]').forEach(el => {
    const isActive = el.getAttribute('data-xa-accent-value') === accent;
    el.classList.toggle('is-active', isActive);
  });
}

export function setRadius(radius) {
  if (radius === null || radius === undefined) {
    storage.remove('xa:radius');
    document.documentElement.removeAttribute('data-xa-radius');
  } else {
    storage.set('xa:radius', String(radius));
    document.documentElement.setAttribute('data-xa-radius', String(radius));
  }

  document.querySelectorAll('[data-xa-radius-value]').forEach(el => {
    const isActive = el.getAttribute('data-xa-radius-value') === String(radius);
    el.classList.toggle('is-active', isActive);
  });
}

function handleThemeClick(event) {
  const btn = event.target.closest('[data-xa-theme-toggle]');
  if (btn) {
    const targetTheme = btn.getAttribute('data-xa-theme-toggle');
    if (targetTheme) {
      set(targetTheme);
    } else {
      const current = get();
      const next = current === 'dark' ? 'light' : 'dark';
      set(next);
    }
  }

  const accentBtn = event.target.closest('[data-xa-accent-value]');
  if (accentBtn) {
    const accent = accentBtn.getAttribute('data-xa-accent-value');
    setAccent(accent);
  }

  const radiusBtn = event.target.closest('[data-xa-radius-value]');
  if (radiusBtn) {
    const radius = radiusBtn.getAttribute('data-xa-radius-value');
    setRadius(radius);
  }
}

export function init(root = document) {
  // Listen for media query changes if in system mode
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQueryListener = (e) => {
    if (get() === 'system') {
      const eff = e.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-bs-theme', eff);
      document.dispatchEvent(new CustomEvent('xa:theme-change', {
        detail: { theme: 'system', effectiveTheme: eff }
      }));
    }
  };
  mq.addEventListener('change', mediaQueryListener);

  root.addEventListener('click', handleThemeClick);

  // Restore current theme & UI state
  const currentTheme = get();
  set(currentTheme);

  const savedAccent = storage.get('xa:accent', null);
  if (savedAccent) setAccent(savedAccent);

  const savedRadius = storage.get('xa:radius', null);
  if (savedRadius) setRadius(savedRadius);
}

export function destroy(root = document) {
  root.removeEventListener('click', handleThemeClick);
  if (mediaQueryListener && window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', mediaQueryListener);
    mediaQueryListener = null;
  }
}
