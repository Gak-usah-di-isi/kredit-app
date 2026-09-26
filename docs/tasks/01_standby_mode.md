# 🎫 Task 01: Standby Mode (Sleep Screen / Lock Screen)

- **ID Tiket**: `TASK-SOPI-01`
- **Prioritas**: High / User Experience
- **Kategori**: Frontend (React / Tailwind / Inertia)
- **Branch Target**: `feature/standby-mode`

---

## 🌿 Langkah Awal Git
```bash
# 1. Pastikan branch development terbaru
git checkout development
git pull origin development

# 2. Buat branch baru untuk fitur ini
git checkout -b feature/standby-mode
```

---

## 🎯 Latar Belakang & Kebutuhan Fitur
Di operasional Bank Perkreditan Rakyat (BPR), Account Officer (AO) atau staf kredit sering meninggalkan meja kerja (misal: sholat, makan siang, melayani nasabah di counter, atau koordinasi internal). Layar aplikasi yang menampilkan skor psikometrik dan data NIK calon debitur **tidak boleh dibiarkan terbuka begitu saja** demi mematuhi prinsip kerahasiaan data perbankan.

Tombol **"Standby mode"** di bagian bawah sidebar sudah ada, namun saat ini fungsinya masih kosong (`onStandByMode={() => {}}`).

Fitur ini bertujuan untuk mengaktifkan **Layar Kunci / Sleep Mode** seketika saat tombol tersebut diklik, dengan tampilan estetik menggunakan background kantor perbankan yang sudah tersedia di `/images/bg-auth.jpeg`.

---

## 🖼️ Gambaran Visual (Wireframe / Mockup)

Layar ditutup **Full-Screen (z-index 9999)** dengan efek *backdrop blur* halus di atas gambar `/images/bg-auth.jpeg`:

```
+-------------------------------------------------------------------------+
|                                                                         |
|                [ BACKGROUND GAMBAR: /images/bg-auth.jpeg ]              |
|                     (diberi overlay gelap 50% + blur)                   |
|                                                                         |
|                             14:32:05 WIB                                |
|                      Senin, 28 September 2026                           |
|                                                                         |
|                                [ 👤 ]                                   |
|                             Ahmad Dani                                  |
|                      Account Officer - Cabang Bandung                   |
|                                                                         |
|              🔒 Layar Dalam Mode Standby (Data Terlindungi)              |
|                                                                         |
|                [ 🔓 Klik untuk Melanjutkan / Bangunkan ]                 |
|                                                                         |
|                     (Tekan tombol 'Spasi' atau 'Esc')                   |
|                                                                         |
+-------------------------------------------------------------------------+
```

---

## 🛠️ Yang Harus Dikerjakan (Spesifikasi Teknis)

### 1. Buat Komponen Baru: `resources/js/Components/StandbyModal.jsx`
Buat komponen modal overlay penuh dengan spesifikasi:
- **Background**: Menggunakan style background gambar:
  ```jsx
  style={{
      backgroundImage: "url('/images/bg-auth.jpeg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
  }}
  ```
- **Lapisan Overlay**: Tambahkan `div` backdrop berwarna hitam transparan dengan efek blur:
  `className="absolute inset-0 bg-slate-950/65 backdrop-blur-md"`
- **Jam Digital Real-Time**:
  Gunakan `useEffect` dengan `setInterval` tiap 1 detik untuk memperbarui waktu (Format: `HH:mm:ss WIB` dan format tanggal lengkap Bahasa Indonesia).
- **Profil Pengguna Aktif**:
  Ambil data pengguna dari Inertia `usePage().props.auth.user` atau `authUser` (Nama, Role, Inisial/Avatar).
- **Fungsi Bangunkan (Unlock)**:
  - Tombol elegan dengan efek hover: *"Buka Kunci / Melanjutkan Bekerja"*.
  - Event listener keyboard global: Tekan tombol **`Space`** atau **`Escape`** untuk langsung membuka kunci.

### 2. Hubungkan ke Layout Utama: `resources/js/Layouts/AuthenticatedLayout.jsx`
- Buat state `isStandby`:
  ```jsx
  const [isStandby, setIsStandby] = useState(() => {
      // Simpan di sessionStorage agar jika direfresh tetap dalam mode standby
      return sessionStorage.getItem('kredit_standby_mode') === 'true';
  });
  ```
- Buat fungsi handler:
  ```jsx
  const activateStandby = () => {
      setIsStandby(true);
      sessionStorage.setItem('kredit_standby_mode', 'true');
  };

  const deactivateStandby = () => {
      setIsStandby(false);
      sessionStorage.removeItem('kredit_standby_mode');
  };
  ```
- Teruskan `activateStandby` ke prop `onStandByMode` di `<KreditAppSidebar />`:
  ```jsx
  <KreditAppSidebar
      ...
      onStandByMode={activateStandby}
  />
  ```
- Render komponen `<StandbyModal isOpen={isStandby} onClose={deactivateStandby} />` di root return.

### 3. File yang Terlibat:
1. `resources/js/Components/StandbyModal.jsx` *(Baru)*
2. `resources/js/Layouts/AuthenticatedLayout.jsx` *(Update state & integrasi)*
3. `resources/js/Pages/layout/KreditAppSidebar.jsx` *(Pastikan onClick memanggil onStandByMode)*

---

## ✅ Kriteria Keberhasilan (Acceptance Criteria)
- [ ] Mengklik tombol **"Standby mode"** di sidebar membuka layar penuh seketika tanpa jeda/flicker.
- [ ] Gambar latar belakang menampilkan [`/public/images/bg-auth.jpeg`](file:///Users/anaskhalif/Documents/kredit-app/public/images/bg-auth.jpeg) dengan efek overlay gelap & blur elegan.
- [ ] Jam digital berjalan setiap detik dan tanggal akurat.
- [ ] Nama staf dan peran yang sedang login muncul dengan benar di tengah layar.
- [ ] Layar tertutup rapat sehingga data debitur di belakangnya tidak bisa terbaca.
- [ ] Mengklik tombol unlock atau menekan tombol `Space`/`Esc` mengembalikan pengguna ke dashboard/halaman terakhir tanpa reload.
- [ ] `npm run build` berjalan sukses tanpa error.

---

## 🚀 Setelah Selesai (Push ke Remote)
```bash
# 1. Jalankan test & build
npm run build
php artisan test

# 2. Commit perubahan
git add .
git commit -m "feat(ui): implement standby mode sleep screen with bg-auth backdrop"

# 3. Push ke branch remote
git push origin feature/standby-mode
```
*Setelah push, buat Pull Request (PR) dari `feature/standby-mode` ke `development`.*
