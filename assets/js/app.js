/**
 * Main Application Entry Point (ES Module) — Xakti Admin
 * (R-STR-04, R-JS-01..03, §B5)
 */

import * as theme from './modules/theme.js';
import * as sidebar from './modules/sidebar.js';
import * as sidebarTheme from './modules/sidebar-theme.js';
import * as datatable from './modules/datatable.js';
import * as toast from './modules/toast.js';
import * as command from './modules/command.js';
import * as charts from './modules/charts.js';

const XaktiAdmin = {
  theme,
  sidebar,
  sidebarTheme,
  datatable,
  toast,
  command,
  charts
};

window.XaktiAdmin = XaktiAdmin;

document.addEventListener('DOMContentLoaded', () => {
  theme.init();
  sidebar.init();
  sidebarTheme.init();
  datatable.init();
  toast.init();
  command.init();
  charts.init();

  // Initialize Bootstrap Tooltips & Popovers
  if (window.bootstrap) {
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
      new window.bootstrap.Tooltip(el);
    });
    document.querySelectorAll('[data-bs-toggle="popover"]').forEach(el => {
      new window.bootstrap.Popover(el);
    });
  }
});

export default XaktiAdmin;
