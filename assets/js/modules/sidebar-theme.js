/**
 * Sidebar Theme Module (PRD §6.2, S-01..11, R-THM-01..10)
 * Preset themes, custom color picker with auto-contrast, mode control, import/export.
 */

import { storage } from '../utils/storage.js';
import { generateSidebarTokens } from '../utils/color.js';

export const PRESETS = [
  { id: 'light', label: 'Light', color: '#fafafa' },
  { id: 'dark', label: 'Dark', color: '#09090b' },
  { id: 'zinc', label: 'Zinc', color: '#18181b' },
  { id: 'slate', label: 'Slate', color: '#0f172a' },
  { id: 'blue', label: 'Blue', color: '#172554' },
  { id: 'indigo', label: 'Indigo', color: '#1e1b4b' },
  { id: 'violet', label: 'Violet', color: '#2e1065' },
  { id: 'emerald', label: 'Emerald', color: '#064e3b' },
  { id: 'rose', label: 'Rose', color: '#4c0519' },
  { id: 'amber', label: 'Amber', color: '#451a03' }
];

const SIDEBAR_TOKEN_NAMES = [
  '--sidebar-bg',
  '--sidebar-fg',
  '--sidebar-muted-fg',
  '--sidebar-accent-bg',
  '--sidebar-accent-fg',
  '--sidebar-border',
  '--sidebar-ring',
  '--sidebar-primary-bg',
  '--sidebar-primary-fg'
];

function clearCustomVars() {
  SIDEBAR_TOKEN_NAMES.forEach(prop => {
    document.documentElement.style.removeProperty(prop);
  });
}

export function get() {
  const currentTheme = document.documentElement.getAttribute('data-bs-theme') || 'light';
  const defaultPreset = currentTheme === 'dark' ? 'dark' : 'light';
  return storage.get('xa:sidebar-theme', { preset: defaultPreset, vars: null });
}

export function apply(presetId) {
  const preset = PRESETS.find(p => p.id === presetId);
  if (!preset) return;

  clearCustomVars();
  document.documentElement.setAttribute('data-xa-sidebar-theme', presetId);
  storage.set('xa:sidebar-theme', { preset: presetId, vars: null });

  updateCustomizerUI();

  document.dispatchEvent(new CustomEvent('xa:sidebar-theme-change', {
    detail: { preset: presetId, custom: false }
  }));
}

export function setColor(hex) {
  if (!hex || !/^#[0-9a-fA-F]{3,6}$/.test(hex)) return;

  const tokens = generateSidebarTokens(hex);
  document.documentElement.removeAttribute('data-xa-sidebar-theme');

  for (const [k, v] of Object.entries(tokens)) {
    document.documentElement.style.setProperty(k, v);
  }

  storage.set('xa:sidebar-theme', { preset: null, vars: tokens });
  updateCustomizerUI();

  document.dispatchEvent(new CustomEvent('xa:sidebar-theme-change', {
    detail: { preset: null, custom: true, vars: tokens }
  }));
}

export function setMode(mode) {
  if (!['follow', 'light', 'dark'].includes(mode)) return;
  storage.set('xa:sidebar-mode', mode);
  document.documentElement.setAttribute('data-xa-sidebar-mode', mode);

  if (mode === 'follow') {
    const currentTheme = document.documentElement.getAttribute('data-bs-theme') || 'light';
    apply(currentTheme === 'dark' ? 'dark' : 'light');
  } else if (mode === 'light') {
    apply('light');
  } else if (mode === 'dark') {
    apply('dark');
  }

  document.querySelectorAll('[data-xa-sidebar-mode-value]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-xa-sidebar-mode-value') === mode);
  });
}

function handleThemeChange(event) {
  const mode = storage.get('xa:sidebar-mode', 'follow');
  if (mode !== 'follow') return;

  const effectiveTheme = event.detail?.effectiveTheme ||
    (document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 'dark' : 'light');

  const current = get();
  if (!current.vars) {
    apply(effectiveTheme === 'dark' ? 'dark' : 'light');
  }
}

export function reset() {
  clearCustomVars();
  document.documentElement.removeAttribute('data-xa-sidebar-theme');
  document.documentElement.removeAttribute('data-xa-sidebar-mode');
  document.documentElement.removeAttribute('data-xa-accent');
  document.documentElement.removeAttribute('data-xa-radius');

  storage.remove('xa:sidebar-theme');
  storage.remove('xa:sidebar-mode');
  storage.remove('xa:accent');
  storage.remove('xa:radius');

  // Reset theme, accent, and radius via theme module
  if (window.XaktiAdmin && window.XaktiAdmin.theme) {
    window.XaktiAdmin.theme.set('system');
    window.XaktiAdmin.theme.setAccent(null);
    window.XaktiAdmin.theme.setRadius(null);
  }

  // Ensure default follow mode is restored
  setMode('follow');

  updateCustomizerUI();

  document.dispatchEvent(new CustomEvent('xa:sidebar-theme-change', {
    detail: { reset: true }
  }));
}

export function exportConfig() {
  const config = {
    theme: storage.get('xa:theme', 'system'),
    sidebarTheme: storage.get('xa:sidebar-theme', { preset: 'light', vars: null }),
    sidebarMode: storage.get('xa:sidebar-mode', 'follow'),
    accent: storage.get('xa:accent', null),
    radius: storage.get('xa:radius', null)
  };
  return JSON.stringify(config, null, 2);
}

export function importConfig(jsonString) {
  try {
    const config = JSON.parse(jsonString);
    if (config.theme && window.XaktiAdmin && window.XaktiAdmin.theme) {
      window.XaktiAdmin.theme.set(config.theme);
    }
    if (config.accent && window.XaktiAdmin && window.XaktiAdmin.theme) {
      window.XaktiAdmin.theme.setAccent(config.accent);
    }
    if (config.radius && window.XaktiAdmin && window.XaktiAdmin.theme) {
      window.XaktiAdmin.theme.setRadius(config.radius);
    }
    if (config.sidebarMode) {
      setMode(config.sidebarMode);
    }
    if (config.sidebarTheme) {
      if (config.sidebarTheme.preset) {
        apply(config.sidebarTheme.preset);
      } else if (config.sidebarTheme.vars && config.sidebarTheme.vars['--sidebar-bg']) {
        setColor(config.sidebarTheme.vars['--sidebar-bg']);
      }
    }
    return true;
  } catch (e) {
    console.error('Importt failed', e);
    return false;
  }
}

function updateCustomizerUI() {
  const current = get();

  // Swatches
  document.querySelectorAll('[data-xa-sidebar-preset]').forEach(btn => {
    const pId = btn.getAttribute('data-xa-sidebar-preset');
    btn.classList.toggle('is-active', current.preset === pId);
  });

  // Color input
  const picker = document.querySelector('[data-xa-sidebar-picker]');
  if (picker && current.vars && current.vars['--sidebar-bg']) {
    picker.value = current.vars['--sidebar-bg'];
  }
}

export function init(root = document) {
  // Preset buttons
  root.addEventListener('click', (e) => {
    const presetBtn = e.target.closest('[data-xa-sidebar-preset]');
    if (presetBtn) {
      const presetId = presetBtn.getAttribute('data-xa-sidebar-preset');
      apply(presetId);
    }

    const resetBtn = e.target.closest('[data-xa-reset-customizer]');
    if (resetBtn) {
      reset();
    }

    const modeBtn = e.target.closest('[data-xa-sidebar-mode-toggle]');
    if (modeBtn) {
      const mode = modeBtn.getAttribute('data-xa-sidebar-mode-toggle');
      setMode(mode);
    }

    const exportBtn = e.target.closest('[data-xa-export-theme]');
    if (exportBtn) {
      const json = exportConfig();
      navigator.clipboard.writeText(json).then(() => {
        if (window.XaktiAdmin && window.XaktiAdmin.toast) {
          window.XaktiAdmin.toast.show({
            title: 'Configuration Copied',
            message: 'Theme JSON copied to clipboard.'
          });
        } else {
          alert('Configuration copied to clipboard:\n' + json);
        }
      });
    }
  });

  // Color picker
  root.addEventListener('input', (e) => {
    const picker = e.target.closest('[data-xa-sidebar-picker]');
    if (picker) {
      setColor(picker.value);
    }
  });

  // Listen for global theme changes (R-THM-07, PRD S-10)
  document.addEventListener('xa:theme-change', handleThemeChange);

  // Restore saved state
  const savedMode = storage.get('xa:sidebar-mode', 'follow');
  setMode(savedMode);

  const effectiveTheme = document.documentElement.getAttribute('data-bs-theme') || 'light';
  const saved = storage.get('xa:sidebar-theme', null);

  if (savedMode === 'follow' && (!saved || !saved.vars)) {
    apply(effectiveTheme === 'dark' ? 'dark' : 'light');
  } else if (saved) {
    if (saved.preset) {
      apply(saved.preset);
    } else if (saved.vars) {
      for (const [k, v] of Object.entries(saved.vars)) {
        document.documentElement.style.setProperty(k, v);
      }
    }
  } else {
    apply(effectiveTheme === 'dark' ? 'dark' : 'light');
  }

  updateCustomizerUI();
}

export function destroy() {
  document.removeEventListener('xa:theme-change', handleThemeChange);
}
