# Xakti Admin Dashboard Template

> **Modern admin dashboard template built on Bootstrap 5.3.x with a clean, minimalist shadcn/ui aesthetic.**  
> Pure HTML, CSS, and Vanilla JavaScript (ES2020+) without runtime framework dependencies (React, Vue, jQuery, Tailwind) and with no required build step.

**English** | [Bahasa Indonesia](README.id.md)

---

## 🌟 Key Features

- **Core Principle:** *Class names = Standard Bootstrap, Appearance = shadcn/ui*.  
  You continue using standard Bootstrap classes (`.btn`, `.btn-primary`, `.card`, `.table`, `.form-control`, `.navbar`, etc.). All visual styling is achieved via CSS variables and overrides without breaking Bootstrap's official markup.
- **Sidebar Color Customization (Flagship Feature):**  
  Change sidebar colors instantly without affecting the main content area. Includes **10 Built-in Presets** and a **Custom Color Picker** with automated WCAG 2.1 AA text contrast calculation (contrast ratio ≥ 4.5:1).
- **Dark / Light / System Mode:**  
  Powered by native Bootstrap 5.3 `data-bs-theme`, saved in `localStorage`, and applied before CSS rendering to eliminate flash of unstyled theme (FOUC).
- **High-Performance Vanilla JS Data Table:**  
  Instant search, multi-column sorting (text, numbers, dates), dynamic pagination, and bulk row selection capable of handling thousands of rows smoothly (< 100ms).
- **Command Palette (`Ctrl+K` / `Cmd+K`):**  
  Quick search for page navigation and template action shortcuts.
- **Fast Sidebar Collapse (`Ctrl+B` / `Cmd+B`):**  
  Supports compact icon-only mode (3.5rem) on desktop and native offcanvas drawer on mobile / touch displays.
- **100% Self-Hosted & Zero External Dependencies:**  
  Bootstrap 5.3.3, Chart.js 4.4.8, Inter variable woff2 font, and 74 Lucide SVG icons are bundled locally inside the repository.

---

## 🚀 Getting Started

No `npm install` or build step is required to run this template:

### Option A: Open Directly (`file://` Protocol)
Double-click `index.html` in your file explorer (Finder / File Explorer) with any modern web browser. All production pages load the non-module `assets/js/app.bundle.js` bundle, so it runs immediately without local CORS module restrictions.

### Option B: Using a Local Static Server
If you prefer running through a local development server (e.g., Python, PHP, or Node):

```bash
# Navigate to the frontend directory
cd frontend

# Using Python 3
python3 -m http.server 8080

# Using PHP
php -S localhost:8080

# Using Node (npx serve)
npx serve .
```
Open your browser at `http://localhost:8080`.

---

## 🎨 3 Ways to Customize Sidebar Colors

### 1. Via User Interface (Theme Customizer)
Click the palette icon button (`palette`) on the top-right navbar. Choose one of the 10 presets (Light, Dark, Zinc, Slate, Blue, Indigo, Violet, Emerald, Rose, Amber) or pick any color using the color picker. Settings are saved automatically in `localStorage`.

### 2. Via HTML Attribute
Set the default preset on the root `<html>` tag of your HTML document:
```html
<html lang="en" data-bs-theme="light" data-xa-sidebar-theme="emerald">
```

### 3. Via CSS Variables (`assets/css/tokens.css`)
Modify or declare custom sidebar tokens directly in your CSS:
```css
:root {
  --sidebar-bg: #064e3b;
  --sidebar-fg: #d1fae5;
  --sidebar-muted-fg: #6ee7b7;
  --sidebar-accent-bg: #065f46;
  --sidebar-accent-fg: #ffffff;
  --sidebar-border: #065f46;
  --sidebar-ring: #34d399;
}
```

---

## 📁 Directory Structure

```
frontend/
├── index.html                  # Analytics Dashboard page
├── documentation.html          # Architecture and development guide
├── project-structure.html      # Folder structure and CSS/JS asset sizes
├── pages/
│   ├── data-table.html         # Interactive Data Table page
│   ├── forms.html              # Comprehensive Form Elements & Validation
│   ├── components.html         # Component Gallery & Living Style Guide
│   ├── settings.html           # Account & System Settings
│   ├── profile.html            # User Profile page
│   ├── blank.html              # Blank Starter template
│   ├── auth/
│   │   ├── login.html          # Sign In page
│   │   ├── register.html       # Sign Up page
│   │   └── forgot-password.html# Forgot Password page
│   └── errors/
│       ├── 403.html            # 403 Forbidden error page
│       ├── 404.html            # 404 Not Found error page
│       └── 500.html            # 500 Internal Server Error page
├── assets/
│   ├── css/
│   │   ├── tokens.css          # Design tokens, sidebar presets & accents
│   │   ├── theme.css           # Bootstrap variable mappings & overrides
│   │   ├── layout.css          # App shell, responsive sidebar & topbar
│   │   ├── components.css      # Extensions: btn-ghost, btn-icon, avatar, empty state
│   │   ├── app.css             # Entry @import file
│   │   └── app.min.css         # Minified bundle loaded by pages (36.31 KB)
│   ├── js/
│   │   ├── app.js              # Modular ES Module entrypoint
│   │   ├── app.bundle.js       # Standalone bundle compatible with file:// (43.42 KB)
│   │   ├── modules/
│   │   │   ├── theme.js        # Theme mode, accent color, and radius controller
│   │   │   ├── sidebar.js      # Collapse/expand, mobile offcanvas, Ctrl+B shortcut
│   │   │   ├── sidebar-theme.js# Presets, color picker, auto-contrast, export/import
│   │   │   ├── datatable.js    # Search, sorting, and pagination engine
│   │   │   ├── toast.js        # Modern toast notification helper
│   │   │   ├── command.js      # Command palette modal dialog (Ctrl+K)
│   │   │   └── charts.js       # Adaptive Chart.js integration
│   │   └── utils/
│   │       ├── storage.js      # Safe localStorage wrapper
│   │       └── color.js        # WCAG AA contrast calculation utility
│   ├── vendor/
│   │   ├── bootstrap/          # Local Bootstrap 5.3.3 CSS & JS bundle
│   │   └── chartjs/            # Local Chart.js 4.4.8
│   ├── fonts/                  # Local Inter variable woff2 font
│   └── icons/                  # Local Lucide SVG sprite (74 icons)
├── CHANGELOG.md
├── LICENSE
├── README.id.md                # Indonesian documentation
└── README.md                   # English documentation
```

> Project specifications and rules are located one level above the application directory in [`../docs/`](../docs/). For complete details and file sizes, visit [`project-structure.html`](project-structure.html).

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + B` / `Cmd + B` | Toggle / collapse desktop sidebar navigation |
| `Ctrl + K` / `Cmd + K` | Open quick search (Command Palette) |
| `Escape` | Close modal dialogs, offcanvas panels, or search dialog |

---

## 💻 Public JavaScript API (`window.XaktiAdmin`)

You can control all template functionality programmatically via the browser console or your custom scripts:

```javascript
// Manage appearance theme
XaktiAdmin.theme.set('dark');       // 'light' | 'dark' | 'system'
XaktiAdmin.theme.setAccent('blue');  // 'zinc' | 'blue' | 'green' | 'orange' | 'rose' | 'violet'
XaktiAdmin.theme.setRadius('0.5');   // '0' | '0.3' | '0.5' | '0.75' | '1'

// Manage sidebar state
XaktiAdmin.sidebar.toggle();
XaktiAdmin.sidebar.expand();
XaktiAdmin.sidebar.collapse();

// Manage sidebar colors
XaktiAdmin.sidebarTheme.apply('emerald');    // Preset ID
XaktiAdmin.sidebarTheme.setColor('#0f172a'); // Custom color with auto-contrast
XaktiAdmin.sidebarTheme.reset();             // Reset to defaults

// Display Toast notifications
XaktiAdmin.toast.show({
  title: 'Changes Saved',
  message: 'Your profile settings have been updated successfully.',
  variant: 'success', // 'default' | 'success' | 'danger'
  delay: 4000
});
```

---

## 📦 Key Asset Sizes

Current file sizes in the repository (subject to minor updates as assets evolve):

| Asset | Size |
|---|---:|
| CSS sources (`assets/css/*.css`) | 85.01 KB |
| `assets/css/app.min.css` (loaded by served pages) | 36.31 KB |
| Modular JavaScript (`app.js`, `modules/`, `utils/`) | 43.10 KB |
| `assets/js/app.bundle.js` | 43.42 KB |

For individual file breakdowns, see [Project Structure](project-structure.html).

---

## 📚 Documentation & Reference Pages

- [Template Architecture & Guide](documentation.html)
- [Project Structure & Asset Sizes](project-structure.html)
- [UI Component Gallery](pages/components.html)
- [Plugin Integration Examples](pages/plugin-examples.html)

---

## 🔌 UI Plugin Integrations

The template provides optional styling layers in `assets/css/plugin-integrations.css` (also included in `app.min.css`) for:

- **DataTables Bootstrap 5** — toolbars, inputs, pagination, and table states.
- **Summernote** — editor frame, toolbar, content area, and status bar.
- **Select2** — selection container, dropdown menus, option highlighting, search inputs, and focus ring.

Install plugin assets locally according to their respective documentation, then include the plugin CSS after Bootstrap and Xakti Admin CSS. No CDN requests or jQuery dependencies are forced into the core template. View working visual demos at [`pages/plugin-examples.html`](pages/plugin-examples.html) and under the **Plugin UI** section in the sidebar.

---

## ☕ Support Development

If Xakti Admin helps your workflow, consider supporting its development:

- [☕ Buy Me a Coffee](https://www.buymeacoffee.com/nayfos)
- [💝 Saweria](https://saweria.co/nayfos)
- [💜 GitHub Sponsors](https://github.com/sponsors/fhdjg)

---

## 📄 License

Distributed under the [MIT](LICENSE) license. Feel free to use it for personal, institutional, or commercial projects.
