<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TemplateController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/dashboard', function () {
    $user = auth()->user();
    $roles = $user->roles->pluck('name')->toArray();
    
    $stats = [
        'total' => 0,
        'supportive' => 0,
        'review' => 0,
        'concern' => 0,
    ];

    if (in_array('petugas_kredit', $roles)) {
        $stats['total'] = \App\Models\Assessment::where('officer_id', $user->id)->count();
        $stats['supportive'] = \App\Models\AssessmentDecision::whereHas('assessment', function($q) use ($user) {
            $q->where('officer_id', $user->id);
        })->where('final_recommendation', 'SUPPORTIVE')->count();
        $stats['review'] = \App\Models\AssessmentDecision::whereHas('assessment', function($q) use ($user) {
            $q->where('officer_id', $user->id);
        })->where('final_recommendation', 'like', '%REVIEW%')->count();
        $stats['concern'] = \App\Models\AssessmentDecision::whereHas('assessment', function($q) use ($user) {
            $q->where('officer_id', $user->id);
        })->where('final_recommendation', 'like', '%CONCERN%')->count();
    }

    return Inertia::render('Dashboard', [
        'stats' => $stats
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // PCSM-SOPI Petugas Kredit (AO) Routes
    Route::get('/borrowers', [App\Http\Controllers\BorrowerController::class, 'index'])->name('borrowers.index');
    Route::get('/borrowers/create', [App\Http\Controllers\BorrowerController::class, 'create'])->name('borrowers.create');
    Route::post('/borrowers', [App\Http\Controllers\BorrowerController::class, 'store'])->name('borrowers.store');

    Route::get('/assessments', [App\Http\Controllers\AssessmentController::class, 'index'])->name('assessments.index');
    Route::get('/assessments/create', [App\Http\Controllers\AssessmentController::class, 'create'])->name('assessments.create');
    Route::post('/assessments', [App\Http\Controllers\AssessmentController::class, 'store'])->name('assessments.store');
    Route::get('/assessments/{id}', [App\Http\Controllers\AssessmentController::class, 'show'])->name('assessments.show');
    Route::post('/assessments/{id}/note', [App\Http\Controllers\AssessmentController::class, 'addNote'])->name('assessments.addNote');
});

// PCSM-SOPI Public/Token Routes (Nasabah)
Route::get('/kuesioner/selesai', [App\Http\Controllers\QuestionnaireController::class, 'selesai'])->name('kuesioner.selesai');
Route::get('/kuesioner/{token}/consent', [App\Http\Controllers\QuestionnaireController::class, 'showConsent'])->name('kuesioner.consent');
Route::post('/kuesioner/{token}/consent', [App\Http\Controllers\QuestionnaireController::class, 'submitConsent'])->name('kuesioner.consent.submit');
Route::get('/kuesioner/{token}', [App\Http\Controllers\QuestionnaireController::class, 'showForm'])->name('kuesioner.form');
Route::post('/kuesioner/{token}', [App\Http\Controllers\QuestionnaireController::class, 'submitForm'])->name('kuesioner.submit');

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

