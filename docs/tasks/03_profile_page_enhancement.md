# 🎫 Task 03: Peningkatan Halaman Profil Staf BPR (`/profile`)

- **ID Tiket**: `TASK-SOPI-03`
- **Prioritas**: Medium-High / Bank Compliance & UX
- **Kategori**: Frontend (React / Tailwind / Inertia)
- **Branch Target**: `feature/profile-enhancement`

---

## 🌿 Langkah Awal Git
```bash
# 1. Pastikan kembali ke development dan tarik pembaruan terbaru
git checkout development
git pull origin development

# 2. Buat branch baru untuk fitur ini
git checkout -b feature/profile-enhancement
```

---

## 🎯 Latar Belakang & Kebutuhan Fitur
Saat ini halaman profil pengguna di [`resources/js/Pages/Profile/Edit.jsx`](file:///Users/anaskhalif/Documents/kredit-app/resources/js/Pages/Profile/Edit.jsx) masih berupa template bawaan standar Laravel Breeze:
1. **Bahaya Fitur Hapus Akun Mandiri (`DeleteUserForm`)**:
   Dalam standar operasional perbankan (SOP BPR/Finansial) dan kepatuhan audit OJK, **karyawan/staf tidak boleh memiliki tombol untuk menghapus akun mereka sendiri**. Setiap riwayat asesmen, penilaian, dan keputusan kredit terikat pada ID user staf untuk kebutuhan *audit trail*. Menghapus akun secara mandiri merusak integritas database.
2. **Kurangnya Informasi Identitas Perbankan**:
   Profil belum mencantumkan informasi penting staf seperti:
   - Jabatan/Peran resmi dalam alur kredit (misal: *Petugas Kredit (AO)*, *Supervisor Kredit*, *Komite Pemutus*, atau *Admin Sistem*).
   - Kantor Cabang / Wilayah Penugasan.
   - Status Akun & Keamanan Sesi.
3. **Penyelarasan Tampilan (Theme & Layout)**:
   Perlu diselaraskan dengan estetika antarmuka kredit modern (kartu statistik, badge peran Laratrust bergradasi, dan navigasi yang menyatu dengan sidebar/topbar).

---

## 🖼️ Gambaran Visual (Wireframe / Mockup)

```
+-------------------------------------------------------------------------------+
| Profil Pengguna & Keamanan Akun                                              |
| Kelola informasi pribadi, identitas staf perbankan, dan keamanan akun Anda.   |
+-------------------------------------------------------------------------------+

[ KARTU IDENTITAS STAF BPR ]
+-------------------------------------------------------------------------------+
|  [ AVATAR ]   Ahmad Dani                                                      |
|               ahmad.dani@bpr-jateng.co.id                                     |
|               Badge: [ 🛡️ Petugas Kredit (AO) ]   Status: [ ✅ Aktif ]         |
|               -------------------------------------------------------------   |
|               🏢 Kantor Cabang : Cabang Utama Bandung                         |
|               🆔 NIP Pegawai   : BPR-2024-0891                                |
|               📅 Bergabung Sejak: 12 Januari 2024                             |
+-------------------------------------------------------------------------------+

[ INFORMASI PRIBADI & EMAIL ]             [ KEAMANAN & UBAH KATA SANDI ]
+------------------------------------+    +------------------------------------+
| 📝 Informasi Profil                 |    | 🔒 Perbarui Kata Sandi             |
|                                    |    |                                    |
| Nama Lengkap:                      |    | Kata Sandi Saat Ini:               |
| [ Ahmad Dani                     ] |    | [ •••••••••••••••••• ]             |
|                                    |    |                                    |
| Alamat Email:                      |    | Kata Sandi Baru:                   |
| [ ahmad.dani@bpr-jateng.co.id    ] |    | [ •••••••••••••••••• ]             |
|                                    |    |                                    |
| [ Simpan Perubahan ]               |    | Konfirmasi Sandi Baru:             |
|                                    |    | [ •••••••••••••••••• ]             |
|                                    |    |                                    |
|                                    |    | [ Perbarui Kata Sandi ]            |
+------------------------------------+    +------------------------------------+

[ CATATAN KEAMANAN & KEBIJAKAN BPR ]
+-------------------------------------------------------------------------------+
| ℹ️ Kebijakan Akun Institusi:                                                  |
| Akun ini merupakan akun resmi operasional kredit BPR. Perubahan hak akses,    |
| perpindahan cabang, atau penonaktifan akun hanya dapat dilakukan melalui      |
| Administrator Sistem (Unit IT) sesuai SOP Perbankan.                          |
+-------------------------------------------------------------------------------+
```

---

## 🛠️ Yang Harus Dikerjakan (Spesifikasi Teknis)

### 1. Modifikasi `resources/js/Pages/Profile/Edit.jsx`
- **Hapus / Sembunyikan `DeleteUserForm`**:
  Hapus komponen `<DeleteUserForm />` dari tampilan staf. Akun operasional perbankan tidak boleh dihapus mandiri oleh staf pengguna.
- **Tambahkan Header Profil Staf (Identity Card)**:
  Buat card identitas di bagian atas yang menampilkan:
  - Avatar besar dengan inisial nama atau foto profil staf.
  - Nama staf dan email resmi.
  - Badge role dinamis dari Laratrust (`authRoles` / `user.roles`).
  - Label informasi unit kerja/cabang (contoh: *"BPR Kantor Operasional"*).
  - Status aktif akun.
- **Grid Layout yang Responsif**:
  Susun `UpdateProfileInformationForm` dan `UpdatePasswordForm` bersebelahan dalam grid 2 kolom di layar desktop (`grid grid-cols-1 lg:grid-cols-2 gap-6`) agar tidak memanjang ke bawah dan lebih nyaman dilihat.
- **Card Kebijakan Kepatuhan (Compliance Card)**:
  Tambahkan panel informasi di bagian bawah yang menjelaskan bahwa akun dilindungi oleh kebijakan keamanan data perbankan.

### 2. File yang Terlibat:
1. `resources/js/Pages/Profile/Edit.jsx` *(Layout utama halaman profil)*
2. `resources/js/Pages/Profile/Partials/UpdateProfileInformationForm.jsx` *(Penyesuaian styling dan label input)*
3. `resources/js/Pages/Profile/Partials/UpdatePasswordForm.jsx` *(Penyesuaian styling tombol dan pesan sukses)*

---

## ✅ Kriteria Keberhasilan (Acceptance Criteria)
- [ ] Halaman `/profile` dapat diakses langsung melalui dropdown topbar menu "Profile".
- [ ] Form "Delete Account" (Hapus Akun) sudah **tidak ada / dihilangkan** untuk staf operasional.
- [ ] Terdapat kartu identitas staf BPR yang menampilkan nama, badge peran (Laratrust role), dan status akun.
- [ ] Form pembaruan nama/email berfungsi normal dan menampilkan notifikasi sukses saat disimpan.
- [ ] Form ubah password berfungsi normal dengan validasi kata sandi lama dan baru.
- [ ] Tampilan responsif baik pada resolusi mobile maupun desktop.
- [ ] `npm run build` dan `php artisan test` berjalan sukses 100%.

---

## 🚀 Setelah Selesai (Push ke Remote)
```bash
# 1. Jalankan test & build
npm run build
php artisan test

# 2. Commit perubahan
git add resources/js/Pages/Profile/
git commit -m "feat(profile): enhance banking staff profile with identity card and remove self-delete option"

# 3. Push ke branch remote
git push origin feature/profile-enhancement
```
*Setelah push, buat Pull Request (PR) dari `feature/profile-enhancement` ke `development`.*
