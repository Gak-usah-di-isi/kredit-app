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
            // Prudent Financial Responsibility (PFR) - 7 Item
            ['item_code' => 'X11', 'dimension' => 'PFR', 'text' => 'Saya hanya membeli barang yang benar-benar dibutuhkan untuk usaha, bukan karena keinginan sesaat.'],
            ['item_code' => 'X12', 'dimension' => 'PFR', 'text' => 'Saya menghindari pemborosan dalam pengeluaran sehari-hari, termasuk operasional usaha.'],
            ['item_code' => 'X15', 'dimension' => 'PFR', 'text' => 'Saya menyisihkan sebagian penghasilan usaha sebelum digunakan untuk keperluan lain.'],
            ['item_code' => 'X21', 'dimension' => 'PFR', 'text' => 'Saya merasa bertanggung jawab untuk menepati kewajiban keuangan demi menjaga kepercayaan orang lain.'],
            ['item_code' => 'X31', 'dimension' => 'PFR', 'text' => 'Dalam mengambil keputusan keuangan, saya mempertimbangkan dampaknya di masa mendatang.'],
            ['item_code' => 'X34', 'dimension' => 'PFR', 'text' => 'Saya mempertimbangkan kemampuan bayar jangka panjang sebelum mengambil utang baru.'],
            ['item_code' => 'X41', 'dimension' => 'PFR', 'text' => 'Saya memberikan informasi keuangan usaha yang jujur kepada bank, termasuk saat kondisinya kurang baik.'],
            
            // Stakeholder & Sustainability Responsibility (SSR) - 4 Item
            ['item_code' => 'X24', 'dimension' => 'SSR', 'text' => 'Usaha saya memberikan manfaat nyata bagi lingkungan sekitar, bukan hanya keuntungan pribadi.'],
            ['item_code' => 'X26', 'dimension' => 'SSR', 'text' => 'Saya membantu sesama pelaku usaha di komunitas saya, misalnya berbagi informasi atau sumber daya.'],
            ['item_code' => 'X54', 'dimension' => 'SSR', 'text' => 'Saya merasa bahwa keberhasilan usaha saya harus sejalan dengan kebaikan bagi lingkungan dan komunitas.'],
            ['item_code' => 'X55', 'dimension' => 'SSR', 'text' => 'Saya menerapkan praktik ramah lingkungan dan sosial dalam operasional usaha, sesuai kemampuan yang saya miliki.'],
            
            // Social Desirability (SD) - 6 Item Kontrol Kredibilitas
            ['item_code' => 'SD1', 'dimension' => 'SD', 'text' => 'Saya selalu tepat waktu dalam segala hal dan tidak pernah terlambat.'],
            ['item_code' => 'SD2', 'dimension' => 'SD', 'text' => 'Saya tidak pernah merasa kesal atau marah kepada siapa pun.'],
            ['item_code' => 'SD3', 'dimension' => 'SD', 'text' => 'Saya selalu bersikap sopan, bahkan kepada orang yang tidak saya sukai.'],
            ['item_code' => 'SD4', 'dimension' => 'SD', 'text' => 'Saya tidak pernah membicarakan keburukan orang lain.'],
            ['item_code' => 'SD5', 'dimension' => 'SD', 'text' => 'Saya selalu menepati semua janji yang saya buat, tanpa terkecuali.'],
            ['item_code' => 'SD6', 'dimension' => 'SD', 'text' => 'Saya tidak pernah merasa iri terhadap keberhasilan orang lain.'],
        ];

        foreach ($items as $index => $item) {
            $item['display_order'] = $index + 1;
            $item['created_at'] = Carbon::now();
            $item['updated_at'] = Carbon::now();
            DB::table('item_master')->insert($item);
        }
    }
}
