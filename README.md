# Xakti Admin Dashboard Template

> **Template admin dashboard modern berbasis Bootstrap 5.3.x dengan nuansa desain minimalis shadcn/ui.**  
> Murni HTML, CSS, dan Vanilla JavaScript (ES2020+) tanpa ketergantungan framework runtime (React, Vue, jQuery, Tailwind) dan tanpa build step wajib.

---

## 🌟 Fitur Utama

- **Prinsip Inti:** *Nama kelas = Bootstrap standar, Tampilan = shadcn/ui*.  
  Anda tetap menggunakan kelas Bootstrap bawaan (`.btn`, `.btn-primary`, `.card`, `.table`, `.form-control`, `.navbar`, dll.). Seluruh penyesuaian visual dilakukan lewat CSS variables dan override tanpa merusak markup resmi Bootstrap.
- **Kustomisasi Warna Sidebar (Fitur Unggulan):**  
  Sidebar dapat diganti warnanya secara instan tanpa memengaruhi area konten. Dilengkapi dengan **10 Preset Pilihan** dan **Color Picker Bebas** dengan kalkulasi kontras otomatis (*auto-contrast* WCAG 2.1 AA rasio ≥ 4.5:1).
- **Mode Gelap / Terang (Dark / Light / System):**  
  Menggunakan sistem `data-bs-theme` bawaan Bootstrap 5.3 yang tersimpan di `localStorage` dan dimuat tanpa kedipan layar (*no flash of default theme*).
- **Data Table Vanilla JS Berkecepatan Tinggi:**  
  Pencarian instan, pengurutan multi-kolom (teks, angka, tanggal), paginasi dinamis, dan seleksi baris jamak yang mampu memuat ribuan baris dengan mulus (< 100ms).
- **Command Palette (`Ctrl+K` / `Cmd+K`):**  
  Pencarian cepat navigasi halaman dan pintasan aksi aplikasi.
- **Lipat Sidebar Cepat (`Ctrl+B` / `Cmd+B`):**  
  Dukungan mode ringkas (icon-only 3.5rem) pada desktop dan mode Offcanvas pada layar sentuh/ponsel.
- **100% Self-Hosted & Bebas Dependensi Eksternal:**  
  Bootstrap 5.3.3, Chart.js 4.4.8, font Inter variable woff2, dan 74 SVG ikon Lucide tersimpan lokal di dalam repositori.

---

## 🚀 Cara Menjalankan

Tidak diperlukan `npm install` atau proses build untuk menjalankan template ini:

### Opsi A: Buka Langsung (Protokol `file://`)
Cukup klik ganda berkas `index.html` di penjelajah berkas (Finder / File Explorer) pada peramban web modern apa pun. Seluruh halaman produksi memuat bundel non-module `assets/js/app.bundle.js`, sehingga dapat berjalan tanpa batasan CORS modul lokal.

### Opsi B: Menggunakan Server Statis Lokal
Jika ingin menjalankan lewat server lokal (misalnya Python, PHP, atau Node):

```bash
# Jalankan dari folder frontend/
cd frontend

# Menggunakan Python 3
python3 -m http.server 8080

# Menggunakan PHP
php -S localhost:8080

# Menggunakan Node (npx serve)
npx serve .
```
Buka peramban di `http://localhost:8080`.

---

## 🎨 3 Cara Mengubah Warna Sidebar

### 1. Lewat Antarmuka (Theme Customizer)
Klik tombol ikon palet (`palette`) di bilah navigasi kanan atas. Pilih salah satu dari 10 preset (Light, Dark, Zinc, Slate, Blue, Indigo, Violet, Emerald, Rose, Amber) atau pilih warna sembarang pada color picker. Pengaturan otomatis disimpan di `localStorage`.

### 2. Lewat Atribut HTML
Tentukan preset default pada tag `<html>` berkas HTML Anda:
```html
<html lang="id" data-bs-theme="light" data-xa-sidebar-theme="emerald">
```

### 3. Lewat CSS Variables (`assets/css/tokens.css`)
Ubah atau tambahkan token sidebar langsung di berkas CSS:
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

## 📁 Struktur Berkas

```
frontend/
├── index.html                  # Halaman Dashboard Analitik
├── documentation.html          # Dokumentasi cara kerja dan pengembangan
├── project-structure.html      # Struktur folder dan ukuran aset CSS/JS
├── pages/
│   ├── data-table.html         # Halaman Tabel Interaktif
│   ├── forms.html              # Halaman Formulir Lengkap & Validasi
│   ├── components.html         # Living Style Guide Seluruh Komponen
│   ├── settings.html           # Pengaturan Akun & Tampilan
│   ├── profile.html            # Halaman Profil Pengguna
│   ├── blank.html              # Template Kosong (Starter)
│   ├── auth/
│   │   ├── login.html          # Halaman Masuk
│   │   ├── register.html       # Halaman Pendaftaran
│   │   └── forgot-password.html# Halaman Lupa Sandi
│   └── errors/
│       ├── 403.html            # Error 403 Forbidden
│       ├── 404.html            # Error 404 Not Found
│       └── 500.html            # Error 500 Server Error
├── assets/
│   ├── css/
│   │   ├── tokens.css          # Token desain shadcn, preset sidebar & aksen
│   │   ├── theme.css           # Pemetaan variabel & override Bootstrap
│   │   ├── layout.css          # App shell, sidebar responsif, topbar
│   │   ├── components.css      # Ekstensi: btn-ghost, btn-icon, avatar, empty state
│   │   ├── app.css             # Entry @import
│   │   └── app.min.css         # Bundel CSS yang dimuat halaman (36.31 KB)
│   ├── js/
│   │   ├── app.js              # Entry point modular (ES Modules)
│   │   ├── app.bundle.js       # Bundel mandiri kompatibel file:// (43.42 KB)
│   │   ├── modules/
│   │   │   ├── theme.js        # Pengendali tema, aksen, dan radius
│   │   │   ├── sidebar.js      # Lipat/buka, offcanvas mobile, shortcut Ctrl+B
│   │   │   ├── sidebar-theme.js# Preset, color picker, auto-contrast, ekspor/impor
│   │   │   ├── datatable.js    # Mesin pencarian, sorting, dan paginasi
│   │   │   ├── toast.js        # Helper notifikasi modern
│   │   │   ├── command.js      # Command palette dialog (Ctrl+K)
│   │   │   └── charts.js       # Integrasi grafik Chart.js adaptif
│   │   └── utils/
│   │       ├── storage.js      # Wrapper aman localStorage
│   │       └── color.js        # Utilitas kalkulasi kontras WCAG AA
│   ├── vendor/
│   │   ├── bootstrap/          # Bootstrap 5.3.3 CSS & JS bundle lokal
│   │   └── chartjs/            # Chart.js 4.4.8 lokal
│   ├── fonts/                  # Inter variable woff2 font lokal
│   └── icons/                  # 74 Ikon Lucide SVG sprite
├── CHANGELOG.md
├── LICENSE
└── README.md
```

> Dokumen aturan dan PRD berada satu tingkat di atas folder aplikasi, yaitu [`../docs/`](../docs/). Peta struktur lengkap dan ukuran setiap file tersedia di [`project-structure.html`](project-structure.html).

---

## ⌨️ Pintasan Papan Ketik (Keyboard Shortcuts)

| Pintasan | Fungsi |
|---|---|
| `Ctrl + B` / `Cmd + B` | Lipat / buka sidebar navigasi desktop |
| `Ctrl + K` / `Cmd + K` | Buka kotak pencarian cepat (Command Palette) |
| `Escape` | Tutup dialog modal, offcanvas, atau pencarian |

---

## 💻 API JavaScript Publik (`window.XaktiAdmin`)

Anda dapat mengontrol seluruh fitur template lewat konsol peramban atau skrip kustom Anda:

```javascript
// Mengatur tema tampilan
XaktiAdmin.theme.set('dark');      // 'light' | 'dark' | 'system'
XaktiAdmin.theme.setAccent('blue'); // 'zinc' | 'blue' | 'green' | 'orange' | 'rose' | 'violet'
XaktiAdmin.theme.setRadius('0.5');  // '0' | '0.3' | '0.5' | '0.75' | '1'

// Mengontrol sidebar
XaktiAdmin.sidebar.toggle();
XaktiAdmin.sidebar.expand();
XaktiAdmin.sidebar.collapse();

// Mengganti tema sidebar
XaktiAdmin.sidebarTheme.apply('emerald'); // Nama preset
XaktiAdmin.sidebarTheme.setColor('#0f172a'); // Warna kustom + auto-contrast otomatis
XaktiAdmin.sidebarTheme.reset(); // Reset ke pengaturan bawaan

// Menampilkan notifikasi Toast
XaktiAdmin.toast.show({
  title: 'Pembaruan Berhasil',
  message: 'Data Anda telah tersimpan dengan aman.',
  variant: 'success', // 'default' | 'success' | 'danger'
  delay: 4000
});
```

---

## 📦 Ukuran aset utama

Ukuran berikut adalah ukuran file saat ini di repositori dan dapat berubah setelah aset diperbarui:

| Aset | Ukuran |
|---|---:|
| CSS sumber (`assets/css/*.css`) | 85.01 KB |
| `assets/css/app.min.css` (yang dimuat halaman) | 36.31 KB |
| JavaScript modular (`app.js`, `modules/`, `utils/`) | 43.10 KB |
| `assets/js/app.bundle.js` | 43.42 KB |

Untuk rincian per file, lihat [Struktur Project](project-structure.html).

## 📚 Dokumentasi dan halaman referensi

- [Dokumentasi cara kerja template](documentation.html)
- [Struktur project dan ukuran aset](project-structure.html)
- [Galeri komponen UI](pages/components.html)
- [Contoh integrasi plugin UI](pages/plugin-examples.html)

## 📄 Lisensi

Didistribusikan di bawah lisensi [MIT](LICENSE). Silakan gunakan secara bebas untuk keperluan proyek pribadi, instansi, maupun komersial.

## Integrasi plugin UI

Template menyediakan lapisan gaya opsional di `assets/css/plugin-integrations.css` (juga sudah termasuk di `app.min.css`) untuk plugin berikut:

- **DataTables Bootstrap 5** — toolbar, input, pagination, dan state tabel.
- **Summernote** — frame editor, toolbar, area konten, dan status bar.
- **Select2** — selection, dropdown, option highlight, search, dan focus ring.

Instal aset plugin secara lokal sesuai dokumentasi masing-masing plugin, lalu muat CSS plugin tersebut setelah Bootstrap dan CSS Xakti Admin. Tidak ada CDN atau jQuery yang ditambahkan ke template inti. Lihat contoh visual di [`pages/plugin-examples.html`](pages/plugin-examples.html) dan submenu **Plugin UI** pada sidebar.
