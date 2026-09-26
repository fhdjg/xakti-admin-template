# Changelog

Semua perubahan pada proyek **Xakti Admin** dicatat dalam berkas ini. Format mengikuti [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) dan mengikuti standar [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Ditambahkan
- **README**: Menyesuaikan panduan menjalankan aplikasi, struktur folder, ukuran aset terbaru, serta tautan ke halaman dokumentasi dan struktur project.
- **Halaman Struktur Project**: Menambahkan `project-structure.html` dengan peta folder aplikasi, ukuran file CSS/JavaScript, entry point, dan alur pemuatan aset; halaman ini juga tersedia dari sidebar.
- **Dokumentasi Template**: Menambahkan `documentation.html` yang menjelaskan cara menjalankan, arsitektur, theming, API JavaScript publik, dan panduan pengembangan, serta menautkannya dari sidebar.

### Diperbaiki
- **Link Panduan Footer**: Mengarahkan link Panduan pada footer seluruh halaman ke `documentation.html`.
- **Posisi Daftar Isi Dokumentasi**: Menambahkan offset sticky agar daftar isi tetap berada di bawah navbar saat halaman digulir.

### Diperbaiki
- **Integrasi Plugin UI**: Menambahkan `plugin-integrations.css` untuk menyatukan DataTables Bootstrap 5, Summernote, dan Select2 dengan token tema Xakti Admin, serta halaman contoh `pages/plugin-examples.html`.
- **Dropdown Sidebar Bertingkat**: Menambahkan submenu hingga tiga tingkat menggunakan Bootstrap Collapse, lengkap dengan indentasi level ketiga dan navigasi keyboard-friendly berbasis tombol.
- **Konsistensi Active Component**: Menyesuaikan active state pada tab standar dan list group dengan token shadcn, sementara button, pagination, dan CTA tetap menggunakan token `--primary` sesuai hierarki aksinya.
- **Warna Active Dropdown**: Menyamakan state `.dropdown-item:active` dan `.dropdown-item.active` dengan token aksen shadcn, sehingga tidak lagi menggunakan warna biru bawaan Bootstrap.
- **Overflow Dropdown Notifikasi**: Membatasi lebar menu secara responsif dan mengizinkan teks notifikasi membungkus di dalam batas dropdown.
- **Kontras Footer Sidebar**: Menyesuaikan kontrol akun, avatar, dan alamat email pada `.xa-sidebar__footer` agar menggunakan token `--sidebar-*`, sehingga tetap nyaman dibaca saat preset warna sidebar diganti.

## [1.0.4] - 2026-09-24

### Diperbaiki
- **Latar Belakang & Kontras Preset Sidebar (Desktop)**:
  - Memperbaiki masalah latar belakang `.xa-sidebar` pada tampilan desktop (layar ≥ 992px) yang menjadi transparan (sehingga tampak putih menembus `.xa-shell`) akibat ditimpa oleh aturan bawaan Bootstrap 5.3 `.offcanvas-lg { background-color: transparent !important; }`. Ditambahkan `background-color: var(--sidebar-bg) !important;` pada [layout.css](file:///Users/egov/Perjuangan/Web/xakti-admin-template/assets/css/layout.css) sesuai aturan `R-CSS-02` agar warna latar belakang sidebar dari seluruh preset (termasuk preset `blue`) dapat tampil utuh.
  - Memperbaiki token `--sidebar-primary-bg`, `--sidebar-primary-fg`, dan `--sidebar-ring` pada preset warna sidebar di [tokens.css](file:///Users/egov/Perjuangan/Web/xakti-admin-template/assets/css/tokens.css) sehingga seluruh 10 preset sidebar kini lolos pengujian kontras WCAG 2.1 AA (`scripts/check_contrast.py`) dengan rasio kontras teks ≥ 4.5:1 dan elemen interaktif ≥ 3:1.
  - Memperbarui bundel minified [app.min.css](file:///Users/egov/Perjuangan/Web/xakti-admin-template/assets/css/app.min.css).

## [1.0.3] - 2026-09-24

### Diperbaiki
- **Interaktivitas Panel Kustomisasi Tema (`#xaCustomizer`)**:
  - Memperbaiki kegagalan inisialisasi JavaScript pada `assets/js/app.bundle.js` akibat `ReferenceError: destroy is not defined` pada modul Chart.js yang menyebabkan seluruh event listener UI tidak terdaftar.
  - Mengekspor fungsi `initRevenueChart`, `initTrafficChart`, dan `destroy` secara lengkap pada modul grafik `XaktiAdmin.charts`.
  - Menambahkan *event delegation* otomatis untuk tombol pemilihan warna aksen global (`data-xa-accent-value`) dan radius sudut (`data-xa-radius-value`) di `modules/theme.js`, serta menghapus *inline event handler* `onclick` pada `index.html` (sesuai aturan `R-HTM-08` dan `R-SEC-01` CSP-safe).
  - Memperbaiki tombol **Reset Default** agar turut mereset pilihan warna aksen dan radius sudut kembali ke kondisi default.

## [1.0.2] - 2026-09-24

### Diperbaiki & Ditingkatkan
- **Sinkronisasi Preset Sidebar dengan Mode Gelap / Terang (R-THM-07, PRD S-10)**: 
  - Saat beralih dari mode terang ke mode gelap (melalui tombol toggle topbar, Command Palette `Ctrl+K`, maupun Pengaturan), preset sidebar kini otomatis ikut berganti ke preset `dark` (`#09090b`), dan sebaliknya kembali ke `light` (`#fafafa`) saat mode terang diaktifkan.
  - Memperbarui skrip inline `<head>` di seluruh halaman agar langsung menerapkan preset sidebar yang sesuai dengan tema sebelum CSS dirender pertama kali (mencegah flash tema).
  - Indikator swatch aktif pada panel Theme Customizer secara otomatis sinkron dengan preset aktif.

## [1.0.1] - 2026-09-24

### Diperbaiki
- **Layout Mobile Sidebar**: Memperbaiki tumpukan layer `z-index` pada `.xa-sidebar` di mode mobile (`offcanvas-lg`) menjadi `var(--bs-offcanvas-zindex, 1045)` (desktop tetap `1020`). Sebelumnya `z-index: 1020` menyebabkan overlay gelap backdrop (`z-index: 1040`) berada di atas sidebar dan meredupkan seluruh menu navigasi.
- **Kontras Tombol Tutup**: Menambahkan penyesuaian filter kontras tombol close (`btn-close`) pada sidebar untuk preset warna sidebar yang bertipe gelap.

## [1.0.0] - 2026-09-24

### Ditambahkan
- **Desain Inti**: Sistem desain Bootstrap 5.3.x dengan nuansa visual minimalis ala shadcn/ui.
- **Kustomisasi Warna Sidebar (Fitur Inti)**:
  - 10 Preset bawaan: Light, Dark, Zinc, Slate, Blue, Indigo, Violet, Emerald, Rose, Amber.
  - Color picker bebas dengan perhitungan kontras otomatis (auto-contrast WCAG 2.1 AA) di `utils/color.js`.
  - Dukungan mode sidebar: `follow`, `light`, dan `dark`.
  - Ekspor dan impor konfigurasi tema dalam format JSON.
  - Pencegahan flash tema default menggunakan inline script sinkron di `<head>`.
- **App Shell & Navigasi**:
  - Sidebar desktop dengan mode diperluas (expanded) dan mode ringkas ikon saja (collapsed).
  - Shortcut keyboard `Ctrl+B` / `Cmd+B` untuk melipat atau membuka sidebar desktop.
  - Sidebar mobile responsif menggunakan Bootstrap 5 Offcanvas.
  - Menu bertingkat (nested menu) dengan Bootstrap Collapse.
- **Data Table Vanilla JS**:
  - Pencarian instan dengan debounce 150ms.
  - Pengurutan multi-tipe (teks, angka, tanggal) dengan pembaruan atribut `aria-sort`.
  - Pagination dinamis dengan ellipsis.
  - Multi-row selection dengan master checkbox di header.
  - Render performa tinggi berbasis `DocumentFragment`.
- **Command Palette (`Ctrl+K` / `Cmd+K`)**:
  - Pencarian cepat navigasi dan eksekusi aksi tema.
- **Visualisasi Grafik**:
  - Integrasi modular Chart.js untuk grafik pendapatan dan lalu lintas pengguna yang adaptif terhadap dark mode dan token tema.
- **Halaman Template**:
  - Dashboard analitik (`index.html`)
  - Data Table (`pages/data-table.html`)
  - Formulir lengkap (`pages/forms.html`)
  - Galeri Komponen / Living Style Guide (`pages/components.html`)
  - Pengaturan (`pages/settings.html`)
  - Profil Pengguna (`pages/profile.html`)
  - Starter Blank Page (`pages/blank.html`)
  - Halaman Auth: Login, Register, Forgot Password
  - Halaman Error: 403, 404, 500
- **Aset Mandiri (Self-Hosted)**:
  - Bootstrap 5.3.3 CSS & JS bundle lokal.
  - Chart.js 4.4.8 lokal.
  - Font Inter variable lokal.
  - SVG Sprite 74 ikon Lucide lokal.
  - Bundel non-module `app.bundle.js` untuk pembukaan via protokol `file://`.
