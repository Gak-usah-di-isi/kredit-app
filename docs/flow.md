# PCSM-SOPI — Psychometric Credit Scoring & Sustainability-Oriented Personality Index

[![Project Status: Initial / Development](https://img.shields.io/badge/Status-Development-blue.svg)](#)
[![Target Sector](https://img.shields.io/badge/Sector-BPR%20%2F%20UMKM-green.svg)](#)
[![System Type](https://img.shields.io/badge/Type-Decision%20Support%20System-orange.svg)](#)

Aplikasi **PCSM-SOPI** adalah modul sistem pendukung keputusan (*decision support system*) berbasis psikometrik yang dirancang khusus untuk Bank Perkreditan Rakyat (BPR). Sistem ini mengukur profil kepribadian dan perilaku keuangan calon debitur UMKM guna mendampingi asesmen kredit dan menekan risiko kredit bermasalah (*Non-Performing Loan* / NPL).

---

## 📌 Ringkasan Utama & Prinsip Dasar

- **Bukan Mesin Pemutus Otomatis:** Sistem **TIDAK BOLEH** menghasilkan keputusan otomatis *Approve* atau *Reject*. Hasil dari aplikasi ini bersifat pendukung (*supportive tool*) yang mendampingi keputusan manual pejabat kredit sesuai SOP BPR[cite: 1].
- **Dimension-Gated Recommendation:** Rekomendasi tidak hanya bergantung pada skor total, tetapi mengevaluasi tiap dimensi secara terpisah (skor tinggi di satu dimensi tidak menutupi skor rendah di dimensi lain)[cite: 1].
- **Non-Runtime Outcome Monitoring ($Y_0$):** Data kolektibilitas riil ($Y_0$) diinput secara berkala setelah kredit berjalan oleh Unit Manajemen Risiko untuk pemantauan dan rekalibrasi model, bukan sebagai variabel scoring saat asesmen berjalan[cite: 1].

---

## 📐 Struktur Instrumen (17 Item)

Instrumen penilaian terdiri dari 17 item kuesioner skala Likert (1–7)[cite: 1]:

| Kode | Dimensi | Jumlah Item | Deskripsi Singkat |
| :--- | :--- | :---: | :--- |
| **PFR** | *Prudent Financial Responsibility* | 7 Item | Mengukur disiplin, kehati-hatian, dan tanggung jawab pengelolaan keuangan[cite: 1]. |
| **SSR** | *Stakeholder & Sustainability Responsibility* | 4 Item | Mengukur kepedulian sosial, lingkungan, dan keberlanjutan usaha[cite: 1]. |
| **SD** | *Social Desirability* | 6 Item | Indikator kontrol untuk mendeteksi tingkat kejujuran/kredibilitas jawaban[cite: 1]. |

---

## 👥 Peran Pengguna (User Roles) & Hak Akses

Sistem menggunakan skema *Role-Based Access Control* (RBAC) dengan 6 peran pengguna[cite: 1]:


+-----------------------------------------------------------------------------------+
|                                  ROLES & PERMISSIONS                              |
+---------------------+-------------------------------------------------------------+
| Role                | Deskripsi & Hak Akses Utama                                 |
+---------------------+-------------------------------------------------------------+
| Nasabah / Debitur   | • Mengisi informed consent & 17 item kuesioner             |
|                     | • Tampilan form netral (tanpa label dimensi / skor)         |
+---------------------+-------------------------------------------------------------+
| Petugas Kredit (AO) | • Membuka asesmen baru & mendampingi pengisian              |
|                     | • Melihat skor, flag kredibilitas, & rekomendasi akhir      |
|                     | • Mengisi Officer Note (wajib untuk status Review/Concern)  |
+---------------------+-------------------------------------------------------------+
| Pejabat Pemutus     | • Meninjau hasil asesmen (Review/Concern)                   |
|                     | • Membaca Officer Note & melihat dashboard per cabang       |
+---------------------+-------------------------------------------------------------+
| Admin Sistem (IT)   | • Manajemen user, hak akses, & master item                  |
|                     | • Mengelola versi model & parameter kalibrasi (P25/P75)     |
|                     | • Mengakses log audit menyeluruh                            |
+---------------------+-------------------------------------------------------------+
| Manajemen Risiko    | • Menginput status kolektibilitas riil (Y0) pascakredit    |
|                     | • Memantau drift skor & mengusulkan rekalibrasi parameter   |
+---------------------+-------------------------------------------------------------+
| Unit Kepatuhan      | • Read-only access ke log consent & audit log (compliance)  |
+---------------------+-------------------------------------------------------------+


---

## 🔄 Alur Sistem (End-to-End System Flow)

[1. Petugas AO Input Metadata & Consent]
│
▼
[2. Nasabah Mengisi 17 Item Kuesioner (Skala 1–7)]
│
▼
[3. Validasi Kelengkapan Real-Time (17/17 Wajib Terisi)]
│
▼
[4. Scoring Engine: Raw Score (1–7) ──> Konversi 0–100 ──> Overall SOPI (50:50)]
│
▼
[5. Credibility Engine: Cek SD Flag, Straightlining, & Respon SD]
│
▼
[6. Decision Engine: Klasifikasi PFR & SSR vs Param Kalibrasi (P25/P75)]
│
▼
[7. Keluaran Hasil Rekomendasi + Narasi + Disclaimer Wajib]
│
▼
[8. Input Officer Note oleh AO (Wajib jika Review / Concern)]
│
▼
[9. Keputusan Kredit Final oleh Pejabat Pemutus (Di Luar Sistem / SOP BPR)]
│
▼
[10. Kredit Berjalan ──> Monitoring Risiko Input Data Kolektibilitas (Y0)]
│
▼
[11. Dashboard Recalibration & Update Param Kalibrasi Versi Baru]

--

## 🛠️ Logika Perhitungan & Mesin Keputusan

### 1. Perhitungan Skor (Scoring Engine)
1. **Raw Score (Skala 1–7):** Rata-rata aritmetik item penyusun per dimensi ($PFR_{raw}$, $SSR_{raw}$, $SD_{raw}$)[cite: 1].
2. **Konversi Skala 0–100:**
   $$\text{Score}_{100} = \left( \frac{\text{Score}_{raw} - 1}{6} \right) \times 100$$[cite: 1]
3. **Overall SOPI 100 (Bobot 50:50):**
   $$\text{Overall SOPI}_{100} = \frac{PFR_{100} + SSR_{100}}{2}$$[cite: 1]

### 2. Mesin Kredibilitas (Credibility Engine)
Mengevaluasi tingkat keabsahan jawaban berdasarkan:
- **SD Flag:** Membandingkan $SD_{100}$ terhadap persentil kalibrasi ($P_{75}$ & $P_{90}$) $\rightarrow$ Normal / Elevated / High[cite: 1].
- **Straightlining:** Flag aktif jika *identical answer ratio* $\ge 0.80$ (80% jawaban bernilai sama)[cite: 1].
- **Low Variability:** Simpangan baku jawaban ($response\_sd$) yang terlalu rendah[cite: 1].

### 3. Matriks Keputusan Akhir (Decision Engine)
Kategori dimensi ditentukan terhadap parameter persentil aktif ($P_{25}$ dan $P_{75}$)[cite: 1]:

| Kondisi Dimensi (PFR & SSR vs P25/P75) | Status Kredibilitas | Rekomendasi Akhir |
| :--- | :--- | :--- |
| PFR Supportive & SSR Supportive | Normal | **SUPPORTIVE**[cite: 1] |
| PFR Supportive & SSR Supportive | Elevated / High | **REVIEW – RESPONSE VERIFICATION**[cite: 1] |
| Salah satu Review, tidak ada Concern | Normal | **REVIEW**[cite: 1] |
| Salah satu Review, tidak ada Concern | Elevated / High | **ENHANCED REVIEW**[cite: 1] |
| Salah satu dimensi Concern | Apa pun | **CONCERN**[cite: 1] |
| Kedua dimensi Concern | Apa pun | **CONCERN – HIGH PRIORITY REVIEW**[cite: 1] |

---

## 📜 Disclaimer Sistem Wajib

Setiap lembar laporan / output asesmen yang dihasilkan oleh aplikasi ini **WAJIB** mencantumkan teks disclaimer berikut:

> *"Hasil PCSM-SOPI merupakan informasi pendukung untuk membantu proses asesmen kredit. Hasil ini tidak merupakan keputusan otomatis persetujuan atau penolakan kredit dan harus dibaca bersama informasi serta prosedur kredit lain yang berlaku di BPR."*[cite: 1]