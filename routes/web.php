<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TemplateController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Template Radix UI (development only)
Route::get('/template', [TemplateController::class, 'index'])->name('template.index');
Route::get('/template/doctor', [TemplateController::class, 'index'])->name('template.doctor');
Route::get('/template/front-office', [TemplateController::class, 'frontOffice'])->name('template.front-office');
Route::get('/template/business', [TemplateController::class, 'business'])->name('template.business');

// Modul pages
Route::get('/template/jadwal/saya',            [TemplateController::class, 'jadwalSaya'])->name('template.jadwal.saya');
Route::get('/template/jadwal/klinik',          [TemplateController::class, 'jadwalKlinik'])->name('template.jadwal.klinik');
Route::get('/template/jadwal/staff',           [TemplateController::class, 'jadwalStaff'])->name('template.jadwal.staff');
Route::get('/template/pasien',                  [TemplateController::class, 'pasien'])->name('template.pasien');
Route::get('/template/pasien/register',         [TemplateController::class, 'pasienRegister'])->name('template.pasien.register');
Route::get('/template/penjualan/transaksi',     [TemplateController::class, 'transaksi'])->name('template.transaksi');
Route::get('/template/treatment/daftar',        [TemplateController::class, 'treatment'])->name('template.treatment');
Route::get('/template/produk/daftar',           [TemplateController::class, 'produk'])->name('template.produk');
Route::get('/template/produk/kategori',         [TemplateController::class, 'kategoriProduk'])->name('template.produk.kategori');
Route::get('/template/inventory/ruang',         [TemplateController::class, 'ruangPenyimpanan'])->name('template.ruang');
Route::get('/template/inventory/penerimaan',    [TemplateController::class, 'penerimaan'])->name('template.penerimaan');
Route::get('/template/pengaturan',              [TemplateController::class, 'setting'])->name('template.setting');
Route::get('/template/pengaturan/staff',        [TemplateController::class, 'daftarStaff'])->name('template.staff');
Route::get('/template/pengaturan/staff/tambah', [TemplateController::class, 'tambahStaff'])->name('template.staff.tambah');
Route::get('/template/pengaturan/cabang',       [TemplateController::class, 'cabang'])->name('template.cabang');
Route::get('/template/pengaturan/compliance',            [TemplateController::class, 'complianceDocument'])->name('template.compliance');
Route::get('/template/pengaturan/compliance/{id}',       [TemplateController::class, 'lihatDokumen'])->name('template.compliance.view');
Route::get('/template/pengaturan/role',         [TemplateController::class, 'userRole'])->name('template.role');
Route::get('/template/pengaturan/supplier',     [TemplateController::class, 'supplierList'])->name('template.supplier');
Route::get('/template/pengaturan/payment',      [TemplateController::class, 'paymentMethod'])->name('template.payment');
Route::get('/template/docs',                    [TemplateController::class, 'docs'])->name('template.docs');

require __DIR__.'/auth.php';

