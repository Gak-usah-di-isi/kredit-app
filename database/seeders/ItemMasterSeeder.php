<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ItemMasterSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            // Prudent Financial Responsibility (PFR)
            ['item_code' => 'X11', 'dimension' => 'PFR', 'text' => 'Saya selalu menyisihkan sebagian pendapatan untuk ditabung secara rutin.'],
            ['item_code' => 'X12', 'dimension' => 'PFR', 'text' => 'Saya mencatat setiap pengeluaran dan pemasukan usaha sekecil apapun.'],
            ['item_code' => 'X15', 'dimension' => 'PFR', 'text' => 'Saya selalu memisahkan uang untuk kebutuhan rumah tangga dan uang untuk modal usaha.'],
            ['item_code' => 'X21', 'dimension' => 'PFR', 'text' => 'Saya merencanakan dengan hati-hati sebelum menggunakan uang untuk membeli sesuatu yang mahal.'],
            ['item_code' => 'X31', 'dimension' => 'PFR', 'text' => 'Jika saya memiliki utang, membayar cicilan tepat waktu adalah prioritas utama saya.'],
            ['item_code' => 'X34', 'dimension' => 'PFR', 'text' => 'Saya merasa sangat terbebani jika belum bisa melunasi pinjaman saat jatuh tempo.'],
            ['item_code' => 'X41', 'dimension' => 'PFR', 'text' => 'Saya lebih memilih keuntungan yang sedikit tetapi pasti daripada keuntungan besar tetapi berisiko tinggi.'],
            
            // Stakeholder & Sustainability Responsibility (SSR)
            ['item_code' => 'X24', 'dimension' => 'SSR', 'text' => 'Saya mengutamakan pembayaran gaji atau upah karyawan tepat waktu walaupun keuntungan sedang turun.'],
            ['item_code' => 'X26', 'dimension' => 'SSR', 'text' => 'Membangun kepercayaan dengan pemasok dan pelanggan lebih penting bagi saya daripada sekadar mendapatkan untung.'],
            ['item_code' => 'X54', 'dimension' => 'SSR', 'text' => 'Saya memastikan limbah atau sampah dari usaha saya dibuang dengan benar agar tidak mengganggu lingkungan sekitar.'],
            ['item_code' => 'X55', 'dimension' => 'SSR', 'text' => 'Saya peduli dan sering membantu kegiatan sosial di lingkungan sekitar tempat tinggal atau tempat usaha.'],
            
            // Social Desirability (SD) - Contoh item, disesuaikan agar logis
            ['item_code' => 'SD1', 'dimension' => 'SD', 'text' => 'Saya tidak pernah berbohong meskipun untuk kebaikan.'],
            ['item_code' => 'SD2', 'dimension' => 'SD', 'text' => 'Saya selalu menaati peraturan lalu lintas walaupun tidak ada polisi.'],
            ['item_code' => 'SD3', 'dimension' => 'SD', 'text' => 'Saya tidak pernah merasa iri atas kesuksesan orang lain.'],
            ['item_code' => 'SD4', 'dimension' => 'SD', 'text' => 'Saya tidak pernah menunda pekerjaan yang seharusnya saya selesaikan.'],
            ['item_code' => 'SD5', 'dimension' => 'SD', 'text' => 'Saya selalu tersenyum saat melayani pelanggan, seburuk apapun suasana hati saya.'],
            ['item_code' => 'SD6', 'dimension' => 'SD', 'text' => 'Saya selalu bersedia mengorbankan waktu istirahat saya demi membantu orang lain.'],
        ];

        foreach ($items as $index => $item) {
            $item['display_order'] = $index + 1;
            $item['created_at'] = Carbon::now();
            $item['updated_at'] = Carbon::now();
            DB::table('item_master')->insert($item);
        }
    }
}
