(function () {
  "use strict";

  // --- utils/storage.js ---
  /**
 * Storage Utility — Safe LocalStorage access with memory fallback (R-JS-05)
 */

  const memoryStore = {};

  const storage = {
    get(key, fallback = null) {
      try {
        const val = window.localStorage.getItem(key);
        if (val === null) return fallback;
        try {
          return JSON.parse(val);
        } catch {
          return val;
        }
      } catch {
        return Object.prototype.hasOwnProperty.call(memoryStore, key) ? memoryStore[key] : fallback;
      }
    },

    set(key, value) {
      try {
        const str = typeof value === 'string' ? value : JSON.stringify(value);
        window.localStorage.setItem(key, str);
      } catch {
        memoryStore[key] = value;
      }
    },

    remove(key) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        delete memoryStore[key];
      }
    }
  };


  // --- utils/color.js ---
  /**
 * Color & Auto-Contrast Utility (R-THM-03, R-THM-04, PRD §7.2)
 * Ensures WCAG 2.1 AA contrast ratio (>= 4.5:1 for normal text, >= 3:1 for muted).
 */

  function parseHex(hex) {
    let c = hex.replace('#', '').trim();
    if (c.length === 3) {
      c = c.split('').map(x => x + x).join('');
    }
    const num = parseInt(c, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  function toHex(r, g, b) {
    const clamp = v => Math.max(0, Math.min(255, Math.round(v)));
    const toPadded = v => clamp(v).toString(16).padStart(2, '0');
    return '#' + toPadded(r) + toPadded(g) + toPadded(b);
  }

  function luminance(hex) {
    const { r, g, b } = parseHex(hex);
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  }

  function contrastRatio(colorA, colorB) {
    const l1 = luminance(colorA);
    const l2 = luminance(colorB);
    const max = Math.max(l1, l2);
    const min = Math.min(l1, l2);
    return (max + 0.05) / (min + 0.05);
  }

  function pickForeground(bgHex) {
    const darkCandidate = '#09090b';
    const lightCandidate = '#fafafa';
    const crDark = contrastRatio(bgHex, darkCandidate);
    const crLight = contrastRatio(bgHex, lightCandidate);
    return crLight >= crDark ? lightCandidate : darkCandidate;
  }

  function mixColor(hexA, hexB, weight = 0.5) {
    const rgbA = parseHex(hexA);
    const rgbB = parseHex(hexB);
    const w = Math.max(0, Math.min(1, weight));
    const r = rgbA.r * (1 - w) + rgbB.r * w;
    const g = rgbA.g * (1 - w) + rgbB.g * w;
    const b = rgbA.b * (1 - w) + rgbB.b * w;
    return toHex(r, g, b);
  }

  /**
   * Generate full sidebar tokens from any custom background color (R-THM-04)
   */
  function generateSidebarTokens(bgHex) {
    const isDark = luminance(bgHex) < 0.2;
    const fg = isDark ? '#f4f4f5' : '#18181b';
    const mutedFg = isDark ? '#a1a1aa' : '#71717a';

    // Accent background: subtle contrast step
    const accentBg = isDark
      ? mixColor(bgHex, '#ffffff', 0.12)
      : mixColor(bgHex, '#000000', 0.06);

    const accentFg = isDark ? '#ffffff' : '#09090b';

    // Border: subtle line
    const border = isDark
      ? mixColor(bgHex, '#ffffff', 0.1)
      : mixColor(bgHex, '#000000', 0.08);

    const ring = isDark
      ? mixColor(bgHex, '#ffffff', 0.3)
      : mixColor(bgHex, '#000000', 0.25);

    const primaryBg = isDark ? '#fafafa' : '#18181b';
    const primaryFg = isDark ? '#09090b' : '#fafafa';

    return {
      '--sidebar-bg': bgHex,
      '--sidebar-fg': fg,
      '--sidebar-muted-fg': mutedFg,
      '--sidebar-accent-bg': accentBg,
      '--sidebar-accent-fg': accentFg,
      '--sidebar-border': border,
      '--sidebar-ring': ring,
      '--sidebar-primary-bg': primaryBg,
      '--sidebar-primary-fg': primaryFg
    };
  }


  // --- modules/theme.js ---
  const _theme = (function () {
    /**
 * Theme Module (R-THM-08, R-STR-06, PRD §6.5)
 * Manages light/dark/system modes, global accent color, and radius.
 */



    let mediaQueryListener = null;

    function getSystemTheme() {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }

    function getEffectiveTheme(preference) {
      return preference === 'system' ? getSystemTheme() : preference;
    }

    function get() {
      return storage.get('xa:theme', 'system');
    }

    function set(theme) {
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

    function setAccent(accent) {
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

    function setRadius(radius) {
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

    function init(root = document) {
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

    function destroy(root = document) {
      root.removeEventListener('click', handleThemeClick);
      if (mediaQueryListener && window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', mediaQueryListener);
        mediaQueryListener = null;
      }
    }

    return { getSystemTheme, getEffectiveTheme, get, set, setAccent, setRadius, init, destroy };
  })();

  // --- modules/sidebar.js ---
  const _sidebar = (function () {
    /**
 * Sidebar Module (PRD §6.1, L-01..13, §B2, §B3)
 * Controls desktop expand/collapse, mobile offcanvas, active links, and Ctrl+B shortcut.
 */



    let keydownListener = null;

    function getState() {
      return storage.get('xa:sidebar-state', 'expanded');
    }

    function setState(state) {
      const finalState = state === 'collapsed' ? 'collapsed' : 'expanded';
      storage.set('xa:sidebar-state', finalState);
      document.documentElement.setAttribute('data-xa-sidebar-state', finalState);

      document.dispatchEvent(new CustomEvent('xa:sidebar-toggle', {
        detail: { state: finalState }
      }));
    }

    function toggle() {
      const current = getState();
      setState(current === 'collapsed' ? 'expanded' : 'collapsed');
    }

    function expand() {
      setState('expanded');
    }

    function collapse() {
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

    function init(root = document) {
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

    function destroy(root = document) {
      root.removeEventListener('click', handleSidebarClick);
      root.removeEventListener('click', handleMobileNavClick);
      if (keydownListener) {
        window.removeEventListener('keydown', keydownListener);
        keydownListener = null;
      }
    }

    return { getState, setState, toggle, expand, collapse, init, destroy };
  })();

  // --- modules/sidebar-theme.js ---
  const _sidebarTheme = (function () {
    /**
 * Sidebar Theme Module (PRD §6.2, S-01..11, R-THM-01..10)
 * Preset themes, custom color picker with auto-contrast, mode control, import/export.
 */




    const PRESETS = [
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

    function get() {
      const currentTheme = document.documentElement.getAttribute('data-bs-theme') || 'light';
      const defaultPreset = currentTheme === 'dark' ? 'dark' : 'light';
      return storage.get('xa:sidebar-theme', { preset: defaultPreset, vars: null });
    }

    function apply(presetId) {
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

    function setColor(hex) {
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

    function setMode(mode) {
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

    function reset() {
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

    function exportConfig() {
      const config = {
        theme: storage.get('xa:theme', 'system'),
        sidebarTheme: storage.get('xa:sidebar-theme', { preset: 'light', vars: null }),
        sidebarMode: storage.get('xa:sidebar-mode', 'follow'),
        accent: storage.get('xa:accent', null),
        radius: storage.get('xa:radius', null)
      };
      return JSON.stringify(config, null, 2);
    }

    function importConfig(jsonString) {
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

    function init(root = document) {
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

    function destroy() {
      document.removeEventListener('xa:theme-change', handleThemeChange);
    }

    return { PRESETS, get, apply, setColor, setMode, reset, exportConfig, importConfig, init, destroy };
  })();

  // --- modules/datatable.js ---
  const _datatable = (function () {
    /**
 * Data Table Module (Vanilla JS, R-JS-06, PRD §6.4 P-02, §B6)
 * High-performance search, sort, pagination, and multi-row selection.
 */

    class DataTable {
      constructor(tableEl, options = {}) {
        this.table = tableEl;
        this.tbody = tableEl.querySelector('tbody');
        this.thead = tableEl.querySelector('thead');
        this.pageSize = parseInt(tableEl.getAttribute('data-xa-page-size') || options.pageSize || 10, 10);
        this.currentPage = 1;
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.searchQuery = '';

        // Extract all rows once into an in-memory dataset
        this.originalRows = Array.from(this.tbody.querySelectorAll('tr')).map(tr => {
          const cells = Array.from(tr.children).map(td => ({
            html: td.innerHTML,
            text: td.textContent.trim().toLowerCase(),
            rawText: td.textContent.trim()
          }));
          return { el: tr.cloneNode(true), cells };
        });

        this.filteredRows = [...this.originalRows];

        this.initControls();
        this.bindEvents();
        this.render();
      }

      initControls() {
        // Find search input
        const tableId = this.table.id;
        this.searchInput = document.querySelector(`[data-xa-datatable-search="${tableId}"]`) ||
          document.querySelector('[data-xa-datatable-search]');

        // Find pagination container
        this.paginationContainer = document.querySelector(`[data-xa-datatable-pagination="${tableId}"]`) ||
          this.table.closest('.card')?.querySelector('[data-xa-datatable-pagination]');

        // Find info label (Showing X to Y of Z entries)
        this.infoContainer = document.querySelector(`[data-xa-datatable-info="${tableId}"]`) ||
          this.table.closest('.card')?.querySelector('[data-xa-datatable-info]');

        // Setup sortable headers
        this.thead.querySelectorAll('th[data-xa-sort]').forEach((th, idx) => {
          th.style.cursor = 'pointer';
          th.setAttribute('aria-sort', 'none');
          th.setAttribute('role', 'columnheader');
          if (!th.querySelector('.xa-sort-icon')) {
            th.innerHTML += ` <span class="xa-sort-icon opacity-50 ms-1" aria-hidden="true">↕</span>`;
          }
        });
      }

      bindEvents() {
        // Search input with debounce
        if (this.searchInput) {
          let timeout;
          this.searchHandler = (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
              this.search(e.target.value);
            }, 150);
          };
          this.searchInput.addEventListener('input', this.searchHandler);
        }

        // Sort click on headers
        this.headerClickHandler = (e) => {
          const th = e.target.closest('th[data-xa-sort]');
          if (!th) return;
          const thIndex = Array.from(th.parentNode.children).indexOf(th);
          const type = th.getAttribute('data-xa-sort') || 'text';
          this.sort(thIndex, type);
        };
        this.thead.addEventListener('click', this.headerClickHandler);

        // Master checkbox select-all
        this.masterCheckbox = this.thead.querySelector('input[type="checkbox"]');
        if (this.masterCheckbox) {
          this.masterCheckHandler = () => {
            const isChecked = this.masterCheckbox.checked;
            this.tbody.querySelectorAll('input[type="checkbox"]').forEach(cb => {
              cb.checked = isChecked;
            });
          };
          this.masterCheckbox.addEventListener('change', this.masterCheckHandler);
        }
      }

      search(query) {
        this.searchQuery = query.trim().toLowerCase();
        this.currentPage = 1;

        if (!this.searchQuery) {
          this.filteredRows = [...this.originalRows];
        } else {
          this.filteredRows = this.originalRows.filter(row => {
            return row.cells.some(cell => cell.text.includes(this.searchQuery));
          });
        }

        if (this.sortColumn !== null) {
          this.applySort();
        }

        this.render();
      }

      sort(columnIndex, type = 'text') {
        if (this.sortColumn === columnIndex) {
          this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
          this.sortColumn = columnIndex;
          this.sortDirection = 'asc';
        }

        // Update aria-sort on headers
        this.thead.querySelectorAll('th[data-xa-sort]').forEach((th, idx) => {
          if (idx === columnIndex) {
            th.setAttribute('aria-sort', this.sortDirection === 'asc' ? 'ascending' : 'descending');
            const icon = th.querySelector('.xa-sort-icon');
            if (icon) icon.textContent = this.sortDirection === 'asc' ? '↑' : '↓';
          } else {
            th.setAttribute('aria-sort', 'none');
            const icon = th.querySelector('.xa-sort-icon');
            if (icon) icon.textContent = '↕';
          }
        });

        this.applySort(type);
        this.render();
      }

      applySort(type = 'text') {
        const col = this.sortColumn;
        const dir = this.sortDirection === 'asc' ? 1 : -1;

        this.filteredRows.sort((a, b) => {
          const valA = a.cells[col].rawText;
          const valB = b.cells[col].rawText;

          if (type === 'number') {
            const numA = parseFloat(valA.replace(/[^0-9.-]/g, '')) || 0;
            const numB = parseFloat(valB.replace(/[^0-9.-]/g, '')) || 0;
            return (numA - numB) * dir;
          }

          if (type === 'date') {
            const dateA = new Date(valA).getTime() || 0;
            const dateB = new Date(valB).getTime() || 0;
            return (dateA - dateB) * dir;
          }

          return valA.localeCompare(valB) * dir;
        });
      }

      render() {
        const total = this.filteredRows.length;
        const totalPages = Math.max(1, Math.ceil(total / this.pageSize));
        if (this.currentPage > totalPages) this.currentPage = totalPages;

        const startIdx = (this.currentPage - 1) * this.pageSize;
        const endIdx = Math.min(startIdx + this.pageSize, total);
        const visibleRows = this.filteredRows.slice(startIdx, endIdx);

        // Render table body using DocumentFragment for maximum performance
        const fragment = document.createDocumentFragment();
        if (visibleRows.length === 0) {
          const colSpan = this.thead.querySelectorAll('th').length || 5;
          const tr = document.createElement('tr');
          tr.innerHTML = `<td colspan="${colSpan}" class="text-center py-5 text-muted">No data found</td>`;
          fragment.appendChild(tr);
        } else {
          visibleRows.forEach(row => {
            fragment.appendChild(row.el.cloneNode(true));
          });
        }

        this.tbody.innerHTML = '';
        this.tbody.appendChild(fragment);

        // Update info
        if (this.infoContainer) {
          if (total === 0) {
            this.infoContainer.textContent = 'Showing 0 records';
          } else {
            this.infoContainer.textContent = `Showing ${startIdx + 1}–${endIdx} of ${total} data`;
          }
        }

        // Update pagination
        this.renderPagination(totalPages);

        document.dispatchEvent(new CustomEvent('xa:datatable-render', {
          detail: { table: this.table, total, currentPage: this.currentPage }
        }));
      }

      renderPagination(totalPages) {
        if (!this.paginationContainer) return;

        let html = '<ul class="pagination pagination-sm mb-0">';

        // Previous
        html += `<li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
      <button class="page-link" type="button" data-xa-page="${this.currentPage - 1}" aria-label="Previous">«</button>
    </li>`;

        // Pages numbers with ellipsis
        for (let p = 1; p <= totalPages; p++) {
          if (p === 1 || p === totalPages || (p >= this.currentPage - 1 && p <= this.currentPage + 1)) {
            html += `<li class="page-item ${p === this.currentPage ? 'active' : ''}">
          <button class="page-link" type="button" data-xa-page="${p}">${p}</button>
        </li>`;
          } else if (p === this.currentPage - 2 || p === this.currentPage + 2) {
            html += `<li class="page-item disabled"><span class="page-link">…</span></li>`;
          }
        }

        // Next
        html += `<li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
      <button class="page-link" type="button" data-xa-page="${this.currentPage + 1}" aria-label="Next">»</button>
    </li>`;

        html += '</ul>';
        this.paginationContainer.innerHTML = html;

        // Attach click listeners to pagination buttons
        this.paginationContainer.querySelectorAll('button[data-xa-page]').forEach(btn => {
          btn.addEventListener('click', () => {
            const page = parseInt(btn.getAttribute('data-xa-page'), 10);
            if (page >= 1 && page <= totalPages && page !== this.currentPage) {
              this.currentPage = page;
              this.render();
            }
          });
        });
      }

      destroy() {
        if (this.searchInput && this.searchHandler) {
          this.searchInput.removeEventListener('input', this.searchHandler);
        }
        if (this.thead && this.headerClickHandler) {
          this.thead.removeEventListener('click', this.headerClickHandler);
        }
        if (this.masterCheckbox && this.masterCheckHandler) {
          this.masterCheckbox.removeEventListener('change', this.masterCheckHandler);
        }
      }
    }

    const instances = new Map();

    function init(root = document) {
      root.querySelectorAll('table[data-xa-datatable]').forEach(el => {
        if (!instances.has(el)) {
          instances.set(el, new DataTable(el));
        }
      });
    }

    function destroy(root = document) {
      root.querySelectorAll('table[data-xa-datatable]').forEach(el => {
        if (instances.has(el)) {
          instances.get(el).destroy();
          instances.delete(el);
        }
      });
    }

    return { init, destroy };
  })();

  // --- modules/toast.js ---
  const _toast = (function () {
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

    function show({ title = '', message = '', variant = 'default', delay = 4000 } = {}) {
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
      <strong class="me-auto">${title || 'Notifications'}</strong>
      <small class="text-body-secondary">New</small>
      <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
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

    function init() {
      // Can bind to trigger buttons if needed
      document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-xa-toast]');
        if (trigger) {
          const title = trigger.getAttribute('data-xa-toast-title') || 'Info';
          const message = trigger.getAttribute('data-xa-toast-message') || 'Action completed successfully.';
          const variant = trigger.getAttribute('data-xa-toast-variant') || 'default';
          show({ title, message, variant });
        }
      });
    }

    function destroy() {
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
        container = null;
      }
    }

    return { show, init, destroy };
  })();

  // --- modules/command.js ---
  const _command = (function () {
    /**
 * Command Palette Module (PRD §6.3, P-154)
 * Quick launcher dialog accessible via Ctrl+K / Cmd+K.
 */

    let commandModal = null;
    let keyListener = null;

    const COMMAND_ITEMS = [
      { id: 'dash', title: 'Dashboard', category: 'Navigation', href: 'index.html', icon: 'layout-dashboard' },
      { id: 'dt', title: 'Data Table', category: 'Navigation', href: 'pages/data-table.html', icon: 'table' },
      { id: 'forms', title: 'Forms', category: 'Navigation', href: 'pages/forms.html', icon: 'file-text' },
      { id: 'comp', title: 'Components (Styleguide)', category: 'Navigation', href: 'pages/components.html', icon: 'blocks' },
      { id: 'sett', title: 'Settings', category: 'Navigation', href: 'pages/settings.html', icon: 'settings' },
      { id: 'prof', title: 'My Profile', category: 'Navigation', href: 'pages/profile.html', icon: 'user' },
      { id: 'blank', title: 'Starter / Blank Page', category: 'Navigation', href: 'pages/blank.html', icon: 'file' },
      { id: 'login', title: 'Login Page', category: 'Authentication', href: 'pages/auth/login.html', icon: 'log-in' },
      { id: 'reg', title: 'Registration Page', category: 'Authentication', href: 'pages/auth/register.html', icon: 'user-plus' },
      { id: 'toggle-theme', title: 'Toggle Dark / Light Mode', category: 'Actions', action: 'toggle-theme', icon: 'sun' },
      { id: 'toggle-sidebar', title: 'Collapse / Expand Sidebar', category: 'Actions', action: 'toggle-sidebar', icon: 'panel-left' }
    ];

    function open() {
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

    function close() {
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
          <input type="text" class="xa-command__search-input" id="xaCommandInput" placeholder="Type a command or search for a page..." autocomplete="off">
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
          list.innerHTML = `<div class="text-center py-4 text-muted small">No results found</div>`;
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

    function init() {
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

    function destroy() {
      if (keyListener) {
        window.removeEventListener('keydown', keyListener);
        keyListener = null;
      }
    }

    return { COMMAND_ITEMS, open, close, init, destroy };
  })();

  // --- modules/charts.js ---
  const _charts = (function () {
    /**
 * Charts Wrapper Module (PRD §6.6, R-STK-07)
 * Wraps Chart.js and adapts dynamically to theme tokens & dark mode.
 */

    let activeCharts = [];

    function getCSSVar(name) {
      return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    }

    function initRevenueChart(canvas) {
      if (!canvas || !window.Chart) return null;

      const ctx = canvas.getContext('2d');
      const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
      const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
      const textColor = isDark ? '#a1a1aa' : '#71717a';

      const chart1 = getCSSVar('--chart-1') || '#e76e50';
      const chart2 = getCSSVar('--chart-2') || '#2a9d90';

      const chart = new window.Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [
            {
              label: 'Revenue 2026',
              data: [18500, 22400, 21800, 27500, 26000, 31200, 34500, 32800, 38900, 42100, 40500, 46800],
              borderColor: chart1,
              backgroundColor: 'transparent',
              tension: 0.35,
              borderWidth: 2,
              pointRadius: 3,
              pointHoverRadius: 5
            },
            {
              label: 'Expenses 2026',
              data: [12000, 14500, 13800, 16200, 15500, 18400, 19200, 18700, 21500, 23000, 22100, 25400],
              borderColor: chart2,
              backgroundColor: 'transparent',
              tension: 0.35,
              borderWidth: 2,
              pointRadius: 3,
              pointHoverRadius: 5,
              borderDash: [5, 5]
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
              align: 'end',
              labels: {
                boxWidth: 12,
                font: { family: 'Inter', size: 12 },
                color: textColor
              }
            },
            tooltip: {
              padding: 10,
              backgroundColor: isDark ? '#18181b' : '#ffffff',
              titleColor: isDark ? '#fafafa' : '#09090b',
              bodyColor: isDark ? '#fafafa' : '#09090b',
              borderColor: isDark ? '#27272a' : '#e4e4e7',
              borderWidth: 1,
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { family: 'Inter', size: 11 }, color: textColor }
            },
            y: {
              grid: { color: gridColor },
              ticks: {
                font: { family: 'Inter', size: 11 },
                color: textColor,
                callback: (v) => 'Rp ' + (v / 1000) + 'M'
              }
            }
          }
        }
      });

      activeCharts.push(chart);
      return chart;
    }

    function initTrafficChart(canvas) {
      if (!canvas || !window.Chart) return null;

      const ctx = canvas.getContext('2d');
      const chart1 = getCSSVar('--chart-1') || '#e76e50';
      const chart2 = getCSSVar('--chart-2') || '#2a9d90';
      const chart3 = getCSSVar('--chart-3') || '#274754';
      const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
      const textColor = isDark ? '#a1a1aa' : '#71717a';

      const chart = new window.Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Organic', 'Direct', 'Referral'],
          datasets: [{
            data: [58, 27, 15],
            backgroundColor: [chart1, chart2, chart3],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '72%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 10,
                font: { family: 'Inter', size: 12 },
                color: textColor
              }
            }
          }
        }
      });

      activeCharts.push(chart);
      return chart;
    }

    function init() {
      document.addEventListener('xa:theme-change', () => {
        // Re-render or update active charts when theme or accent changes
        activeCharts.forEach(c => {
          if (c && c.destroy) c.destroy();
        });
        activeCharts = [];

        const revCanvas = document.getElementById('revenueChart');
        if (revCanvas) initRevenueChart(revCanvas);

        const trafficCanvas = document.getElementById('trafficChart');
        if (trafficCanvas) initTrafficChart(trafficCanvas);
      });
    }

    function destroy() {
      activeCharts.forEach(c => {
        if (c && c.destroy) c.destroy();
      });
      activeCharts = [];
    }

    return { init, initRevenueChart, initTrafficChart, destroy };
  })();

  const XaktiAdmin = {
    theme: _theme,
    sidebar: _sidebar,
    sidebarTheme: _sidebarTheme,
    datatable: _datatable,
    toast: _toast,
    command: _command,
    charts: _charts
  };

  window.XaktiAdmin = XaktiAdmin;

  function boot() {
    _theme.init();
    _sidebar.init();
    _sidebarTheme.init();
    _datatable.init();
    _toast.init ? _toast.init() : null;
    _command.init();
    _charts.init();

    if (window.bootstrap) {
      document.querySelectorAll("[data-bs-toggle=\"tooltip\"]").forEach(el => {
        new window.bootstrap.Tooltip(el);
      });
      document.querySelectorAll("[data-bs-toggle=\"popover\"]").forEach(el => {
        new window.bootstrap.Popover(el);
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
