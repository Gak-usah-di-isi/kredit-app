# 📋 Panduan Pengerjaan Task (Git Workflow & Rules)

Dokumen ini adalah panduan standar bagi developer yang akan mengembangkan fitur-fitur tambahan pada aplikasi **PCSM-SOPI Kredit App**.

---

## 🌿 Standar Git Workflow

Setiap pengerjaan fitur baru **WAJIB** mengikuti alur Git berikut agar tidak terjadi konflik kode di branch utama:

### 1. Sinkronisasi Branch Utama (`development`)
Sebelum memulai fitur apapun, pastikan branch lokal Anda up-to-date dengan remote:
```bash
git checkout development
git pull origin development
```

### 2. Membuat Branch Baru per Fitur
Buat branch baru dengan format penamaan `feature/<nama-fitur>`:
```bash
# Contoh untuk Fitur 1 (Standby Mode)
git checkout -b feature/standby-mode

# Contoh untuk Fitur 2 (Topbar & Pengaturan)
git checkout -b feature/topbar-settings-notification

# Contoh untuk Fitur 3 (Profile Enhancement)
git checkout -b feature/profile-enhancement
```

### 3. Pengerjaan & Pengujian Lokal
Selama pengerjaan, pastikan server lokal berjalan untuk memantau perubahan secara real-time:
```bash
# Terminal 1: Laravel Backend Server
php artisan serve

# Terminal 2: Vite Frontend Bundler
npm run dev
```

Sebelum melakukan commit, jalankan pengujian:
```bash
# Pastikan tidak ada error kompilasi frontend
npm run build

# Pastikan semua test otomatis lolos
php artisan test
```

### 4. Commit & Push ke Branch Baru
Gunakan pesan commit deskriptif sesuai konvensi (*conventional commits*):
```bash
git add .
git commit -m "feat: implement standby mode lockscreen with bg-auth"
git push origin feature/<nama-fitur>
```

---

## 📑 Daftar Tiket Task

| No | File Dokumen | Nama Fitur | PIC / Estimasi |
|:---:|---|---|:---:|
| **01** | [`01_standby_mode.md`](./01_standby_mode.md) | **Standby Mode (Sleep Screen / Lock Screen)** | Frontend (1–2 hari) |
| **02** | [`02_topbar_settings_notification.md`](./02_topbar_settings_notification.md) | **Topbar, Settings Menu & Notifikasi Kredit** | Fullstack (1–2 hari) |
| **03** | [`03_profile_page_enhancement.md`](./03_profile_page_enhancement.md) | **Penyempurnaan Halaman Profil Karyawan BPR** | Fullstack (1 hari) |

---

## 📌 Catatan Arsitektur Penting
1. **Frontend**: Menggunakan **React 18 + Inertia.js + Tailwind CSS** (tanpa reload halaman).
2. **Backend**: Menggunakan **Laravel 12** dengan otorisasi berbasis peran (**Laratrust RBAC**).
3. **Desain**: Pertahankan konsistensi desain perbankan yang bersih, modern, dan profesional.
