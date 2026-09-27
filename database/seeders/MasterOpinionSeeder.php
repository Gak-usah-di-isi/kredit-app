<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class MasterOpinionSeeder extends Seeder
{
    public function run(): void
    {
        $opinions = [
            // 1. Rekomendasi Utama (Formula E63 & E57)
            [
                'code' => 'REC_SUPPORTIVE',
                'category' => 'Rekomendasi Utama',
                'title' => 'Rekomendasi: SUPPORTIVE',
                'narrative' => 'Profil psikometrik menunjukkan tingkat prudent financial responsibility dan stakeholder & sustainability responsibility yang tinggi. Tidak terdapat flag kredibilitas respons yang material. Hasil ini mendukung proses asesmen untuk dilanjutkan sesuai SOP BPR.',
                'description' => 'Digunakan saat kedua dimensi PFR & SSR berstatus Supportive dan kredibilitas Normal.',
            ],
            [
                'code' => 'REC_CONCERN',
                'category' => 'Rekomendasi Utama',
                'title' => 'Rekomendasi: CONCERN & HIGH PRIORITY REVIEW',
                'narrative' => 'Ditemukan skor rendah pada salah satu atau lebih dimensi psikometrik. Hasil ini bukan penolakan otomatis, namun menjadi sinyal untuk pendalaman lebih lanjut pada proses asesmen kredit.',
                'description' => 'Digunakan saat salah satu atau kedua dimensi berada di zona Concern.',
            ],
            [
                'code' => 'REC_REVIEW',
                'category' => 'Rekomendasi Utama',
                'title' => 'Rekomendasi: REVIEW, ENHANCED REVIEW & RESPONSE VERIFICATION',
                'narrative' => 'Profil psikometrik secara umum memadai, namun terdapat satu atau lebih aspek yang memerlukan verifikasi tambahan. Petugas disarankan melakukan klarifikasi melalui wawancara dan dokumentasi pendukung sebelum mengambil keputusan kredit.',
                'description' => 'Digunakan saat dimensi berada pada kisaran Review atau profil Supportive namun terdapat flag kredibilitas.',
            ],

            // 2. Dimensi Prudent Financial Responsibility (PFR - Formula F55)
            [
                'code' => 'PFR_SUPPORTIVE',
                'category' => 'Dimensi PFR',
                'title' => 'PFR: Supportive',
                'narrative' => 'Skor PFR tinggi - nasabah menunjukkan kehati-hatian dan tanggung jawab finansial yang kuat, mendukung proses asesmen kredit.',
                'description' => 'Skor PFR >= P75 (Ambang batas atas).',
            ],
            [
                'code' => 'PFR_REVIEW',
                'category' => 'Dimensi PFR',
                'title' => 'PFR: Review',
                'narrative' => 'Skor PFR berada pada kisaran menengah - kehati-hatian finansial cukup memadai namun belum kuat. Perlu verifikasi tambahan sebelum disimpulkan.',
                'description' => 'Skor PFR berada di antara P25 dan P75.',
            ],
            [
                'code' => 'PFR_CONCERN',
                'category' => 'Dimensi PFR',
                'title' => 'PFR: Concern',
                'narrative' => 'Skor PFR (Prudent Financial Responsibility) di bawah ambang minimum - kehati-hatian dan tanggung jawab finansial nasabah masih rendah. Disarankan pendalaman lebih lanjut pada pengelolaan keuangan nasabah.',
                'description' => 'Skor PFR < P25 (Ambang batas bawah).',
            ],

            // 3. Dimensi Stakeholder & Sustainability Responsibility (SSR - Formula F56)
            [
                'code' => 'SSR_SUPPORTIVE',
                'category' => 'Dimensi SSR',
                'title' => 'SSR: Supportive',
                'narrative' => 'Skor SSR tinggi - nasabah menunjukkan orientasi kuat terhadap keberlanjutan dan tanggung jawab ke pemangku kepentingan.',
                'description' => 'Skor SSR >= P75 (Ambang batas atas).',
            ],
            [
                'code' => 'SSR_REVIEW',
                'category' => 'Dimensi SSR',
                'title' => 'SSR: Review',
                'narrative' => 'Skor SSR berada pada kisaran menengah - orientasi keberlanjutan cukup, namun belum konsisten kuat.',
                'description' => 'Skor SSR berada di antara P25 dan P75.',
            ],
            [
                'code' => 'SSR_CONCERN',
                'category' => 'Dimensi SSR',
                'title' => 'SSR: Concern',
                'narrative' => 'Skor SSR (Stakeholder & Sustainability Responsibility) di bawah ambang minimum - orientasi terhadap keberlanjutan dan tanggung jawab ke komunitas/lingkungan masih rendah.',
                'description' => 'Skor SSR < P25 (Ambang batas bawah).',
            ],

            // 4. Kredibilitas Respon - Social Desirability (Formula F50)
            [
                'code' => 'SD_NORMAL',
                'category' => 'Kredibilitas Respon',
                'title' => 'Social Desirability: Normal',
                'narrative' => 'Pola jawaban terhadap item kontrol Social Desirability wajar, tidak ada indikasi jawaban yang terlalu ideal secara sosial.',
                'description' => 'Skor SD < P75 (Di bawah ambang Elevated).',
            ],
            [
                'code' => 'SD_ELEVATED',
                'category' => 'Kredibilitas Respon',
                'title' => 'Social Desirability: Elevated',
                'narrative' => 'Skor Social Desirability cukup tinggi (di atas ambang Elevated) - ada kecenderungan menjawab secara terlalu ideal/positif. Perlu diverifikasi agar skor SOPI tidak bias.',
                'description' => 'Skor SD antara P75 dan P90.',
            ],
            [
                'code' => 'SD_HIGH',
                'category' => 'Kredibilitas Respon',
                'title' => 'Social Desirability: High',
                'narrative' => 'Skor Social Desirability sangat tinggi (>= ambang High) - indikasi kuat jawaban bias ke arah citra diri yang ideal. Skor PFR/SSR sebaiknya tidak diandalkan sepenuhnya tanpa klarifikasi langsung ke nasabah.',
                'description' => 'Skor SD >= P90 (Batas High).',
            ],

            // 5. Kredibilitas Keseluruhan (Formula F51)
            [
                'code' => 'CRED_NORMAL',
                'category' => 'Kredibilitas Respon',
                'title' => 'Kredibilitas Keseluruhan: Normal',
                'narrative' => 'Tidak ditemukan flag kredibilitas - pola jawaban, variasi jawaban, dan Social Desirability berada dalam batas wajar.',
                'description' => 'Tidak ada flag SD, Straightlining, maupun Low Variability.',
            ],
            [
                'code' => 'CRED_FLAGGED',
                'category' => 'Kredibilitas Respon',
                'title' => 'Kredibilitas Keseluruhan: Flag Terdeteksi',
                'narrative' => 'Ditemukan satu atau lebih flag kredibilitas (Social Desirability tinggi, pola jawaban seragam/straightlining, dan/atau variasi jawaban terlalu rendah). Skor PFR/SSR perlu dibaca hati-hati dan disertai klarifikasi langsung ke nasabah.',
                'description' => 'Terdapat minimal satu flag kredibilitas aktif.',
            ],

            // 6. Disclaimer Resmi (Formula B68)
            [
                'code' => 'DISCLAIMER_SYSTEM',
                'category' => 'Disclaimer',
                'title' => 'Disclaimer Sistem BPR Jwalita',
                'narrative' => 'Hasil PCSM-SOPI merupakan informasi pendukung untuk membantu proses asesmen kredit (Decision Support System). Hasil ini tidak merupakan keputusan otomatis persetujuan atau penolakan kredit dan harus dibaca bersama informasi serta prosedur kredit lain yang berlaku di BPR. Keputusan final kredit tetap mengikuti SOP, kewenangan pejabat kredit, dan informasi lain yang dipersyaratkan BPR.',
                'description' => 'Klausul disclaimer hukum dan kepatuhan SOP perbankan yang tampil di setiap hasil asesmen.',
            ],
        ];

        foreach ($opinions as $opini) {
            DB::table('master_opinions')->updateOrInsert(
                ['code' => $opini['code']],
                [
                    'category' => $opini['category'],
                    'title' => $opini['title'],
                    'narrative' => $opini['narrative'],
                    'description' => $opini['description'],
                    'updated_at' => Carbon::now(),
                    'created_at' => Carbon::now(),
                ]
            );
        }
    }
}
