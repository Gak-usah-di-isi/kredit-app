# 🎫 Task 02: Perapihan Topbar, Notifikasi Kredit & Menu Pengaturan

- **ID Tiket**: `TASK-SOPI-02`
- **Prioritas**: High / Clean Code & Usability
- **Kategori**: Frontend (React / Tailwind / Inertia)
- **Branch Target**: `feature/topbar-settings-notification`

---

## 🌿 Langkah Awal Git
```bash
# 1. Pastikan kembali ke development dan tarik pembaruan terbaru
git checkout development
git pull origin development

# 2. Buat branch baru untuk fitur ini
git checkout -b feature/topbar-settings-notification
```

---

## 🎯 Latar Belakang & Masalah
Pada file [`KreditAppTopbar.jsx`](file:///Users/anaskhalif/Documents/kredit-app/resources/js/Pages/layout/KreditAppTopbar.jsx), masih ditemukan sisa template lama (template klinik/rumah sakit) dan link dummy:
1. **Lonceng Notifikasi (Notification Dropdown)**:
   Masih menampilkan teks mock klinik:
   - *"New appointment - Patient scheduled for tomorrow"*
   - *"Payment received - Rp 500.000 from patient #123"*
   Hal ini membingungkan pihak bank/kredit. Notifikasi harus disesuaikan dengan konteks **Aplikasi Kredit & Psikometrik BPR**.
2. **Icon Pengaturan (Settings Gear)**:
   Saat ini tombol pengaturan mengarah ke link hardcoded `href="/template/pengaturan"` yang tidak ada/broken di production.
   Harus diubah menjadi **Menu Pengaturan / Quick Settings Dropdown** yang relevan sesuai peran staf BPR.
3. **Dropdown Profil Staf**:
   Item menu "Profile" di topbar belum memiliki event klik (`onClick`) atau tautan ke halaman profil pengguna (`/profile`).

---

## 🖼️ Gambaran Solusi & Visual

### A. Lonceng Notifikasi Berbasis Kredit BPR
Dropdown menampilkan notifikasi kontekstual kredit (baik notifikasi dinamis maupun fallback state kredit):
```
+-----------------------------------------------------------+
| Notifikasi Aktivitas Kredit                      [Tandai Dibaca] |
+-----------------------------------------------------------+
| 📝 Asesmen Membutuhkan Review Officer                     |
|    Debitur: Bambang Pamungkas (Skor: 68.5 - Perlu Verif)  |
|    15 menit lalu                                          |
+-----------------------------------------------------------+
| 🎯 Kuesioner Selesai Diisi                                |
|    Debitur: Siti Nurhaliza telah menyelesaikan 40 butir   |
|    1 jam lalu                                             |
+-----------------------------------------------------------+
| ⚖️ Putusan Kredit Diterbitkan                             |
|    Komite menyetujui pengajuan kredit #CR-2026-089        |
|    2 jam lalu                                             |
+-----------------------------------------------------------+
| [ Lihat Semua Aktivitas Asesmen ]                         |
+-----------------------------------------------------------+
```

### B. Menu Pengaturan (Settings Icon)
Ubah icon gear menjadi dropdown menu pengaturan yang cerdas (disesuaikan dengan role Laratrust pengguna):
```
+-----------------------------------------------------------+
| ⚙️ Pengaturan Sistem & Preferensi                          |
+-----------------------------------------------------------+
| 📊 Kalibrasi Parameter Skoring  (Admin Sistem / Peneliti) |
|    Bobot dimensi, passing grade, & batas C-W-S            |
+-----------------------------------------------------------+
| 📚 Bank Soal & Item Psikometri  (Admin / AO)              |
|    Kelola butir soal, dimensi, dan opsi jawaban           |
+-----------------------------------------------------------+
| 👥 Manajemen Pengguna & Hak Akses (Admin Sistem)          |
|    Kelola akun AO, Supervisor, Pemutus, & IT              |
+-----------------------------------------------------------+
| 🔒 Keamanan & Sandi Akun                                  |
|    Ubah password & otentikasi sesi staf                   |
+-----------------------------------------------------------+
```

---

## 🛠️ Yang Harus Dikerjakan (Spesifikasi Teknis)

### 1. Perbarui `resources/js/Pages/layout/KreditAppTopbar.jsx`

#### A. Notifikasi Kredit
- Hapus semua teks mock appointment/patient.
- Siapkan daftar notifikasi berbasis konteks kredit atau hubungkan dengan props asesmen pending:
  - Notifikasi asesmen yang butuh tinjauan officer note (`/assessments?status=review_officer`).
  - Notifikasi asesmen yang menunggu putusan komite (`/assessments?status=siap_diputus`).
  - Tambahkan badge counter dinamis (misal badge merah kecil di atas icon lonceng jika ada item unread).
  - Tautan "Lihat Semua" mengarah ke halaman asesmen `/assessments`.

#### B. Menu Pengaturan (Settings)
- Ubah tombol `<a href="/template/pengaturan">` menjadi `DropdownMenu`:
  - Gunakan `DropdownMenu`, `DropdownMenuTrigger`, dan `DropdownMenuContent`.
  - Item menu disesuaikan dengan role staf:
    - **Kalibrasi Parameter**: `router.visit('/calibration-parameters')` (hanya jika role `admin_sistem` atau staf terkait).
    - **Bank Soal**: `router.visit('/item-masters')` (hanya jika role `admin_sistem` atau `petugas_kredit`).
    - **Manajemen Akun**: `router.visit('/users')` (hanya jika role `admin_sistem`).
    - **Profil & Keamanan**: `router.visit('/profile')` (semua role).
  - Jika staf adalah nasabah (`isNasabah`), sembunyikan icon settings seperti aturan yang sudah ada.

#### C. Sambungkan Link Profil
- Pada dropdown profil staf (garis menu `Profile`), tambahkan aksi navigasi ke `/profile`:
  ```jsx
  <DropdownMenuItem onClick={() => router.visit('/profile')} className="cursor-pointer">
    <Icon icon="solar:user-outline" className="mr-2" width={16} />
    Profil Saya
  </DropdownMenuItem>
  ```

### 2. File yang Terlibat:
1. `resources/js/Pages/layout/KreditAppTopbar.jsx` *(Pembersihan mock data, penambahan dropdown settings, dan route profile)*

---

## ✅ Kriteria Keberhasilan (Acceptance Criteria)
- [ ] Tidak ada lagi kata "appointment", "patient", atau nominal mock klinik di lonceng notifikasi.
- [ ] Notifikasi menampilkan aktivitas kredit (review officer, pengisian kuesioner, keputusan komite).
- [ ] Icon gear (Pengaturan) tidak lagi broken link ke `/template/pengaturan`.
- [ ] Icon gear membuka dropdown yang berisi jalan pintas ke menu konfigurasi BPR (Kalibrasi, Bank Soal, Keamanan Akun).
- [ ] Mengklik "Profile" / "Profil Saya" pada dropdown avatar membuka halaman [`/profile`](file:///Users/anaskhalif/Documents/kredit-app/resources/js/Pages/Profile/Edit.jsx) secara lancar.
- [ ] Build front-end (`npm run build`) berjalan sukses tanpa error sintaks JSX.

---

## 🚀 Setelah Selesai (Push ke Remote)
```bash
# 1. Jalankan test & build
npm run build
php artisan test

# 2. Commit perubahan
git add resources/js/Pages/layout/KreditAppTopbar.jsx
git commit -m "refactor(topbar): replace clinic mock notifications with credit alerts & add contextual settings dropdown"

# 3. Push ke branch remote
git push origin feature/topbar-settings-notification
```
*Setelah push, buat Pull Request (PR) dari `feature/topbar-settings-notification` ke `development`.*
