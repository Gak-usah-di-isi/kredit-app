<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TemplateController;
use App\Http\Controllers\AssessmentController;
use App\Http\Controllers\BorrowerController;
use App\Http\Controllers\CalibrationController;
use App\Http\Controllers\ItemMasterController;
use App\Http\Controllers\MasterOpinionController;
use App\Http\Controllers\OutcomeMonitoringController;
use App\Http\Controllers\QuestionnaireController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/dashboard', function () {
    /** @var \App\Models\User $user */
    $user = auth()->user();
    $roles = $user->roles->pluck('name')->toArray();
    
    $stats = [
        'total' => 0,
        'supportive' => 0,
        'review' => 0,
        'concern' => 0,
        'pending_review' => 0,
    ];

    $isOfficerOnly = in_array('petugas_kredit', $roles) && !in_array('admin_sistem', $roles) && !in_array('pejabat_pemutus', $roles);

    if ($isOfficerOnly) {
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
        $stats['pending_review'] = \App\Models\Assessment::where('officer_id', $user->id)
            ->where('status', 'submitted')
            ->count();
    } else {
        // Pejabat Pemutus, Admin Sistem, Manajemen Risiko, Compliance
        $stats['total'] = \App\Models\Assessment::count();
        $stats['supportive'] = \App\Models\AssessmentDecision::where('final_recommendation', 'SUPPORTIVE')->count();
        $stats['review'] = \App\Models\AssessmentDecision::where('final_recommendation', 'like', '%REVIEW%')->count();
        $stats['concern'] = \App\Models\AssessmentDecision::where('final_recommendation', 'like', '%CONCERN%')->count();
        $stats['pending_review'] = \App\Models\Assessment::where('status', 'submitted')->count();
    }

    $recentQuery = \App\Models\Assessment::with(['borrower', 'decision', 'officer'])->latest()->take(5);
    if ($isOfficerOnly) {
        $recentQuery->where('officer_id', $user->id);
    }
    $recentAssessments = $recentQuery->get();

    return Inertia::render('Dashboard', [
        'stats' => $stats,
        'recentAssessments' => $recentAssessments,
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // PCSM-SOPI: Borrowers - Hak akses role
    Route::middleware('role:petugas_kredit|pejabat_pemutus|admin_sistem|manajemen_risiko')->group(function () {
        Route::get('/borrowers', [BorrowerController::class, 'index'])->name('borrowers.index');
        Route::get('/borrowers/create', [BorrowerController::class, 'create'])->name('borrowers.create');
        Route::post('/borrowers', [BorrowerController::class, 'store'])->name('borrowers.store');
    });

    // PCSM-SOPI: Assessments - Hak akses role
    Route::middleware('role:petugas_kredit|pejabat_pemutus|admin_sistem|manajemen_risiko|compliance')->group(function () {
        Route::get('/assessments', [AssessmentController::class, 'index'])->name('assessments.index');
        Route::get('/assessments/create', [AssessmentController::class, 'create'])->name('assessments.create');
        Route::post('/assessments', [AssessmentController::class, 'store'])->name('assessments.store');
        Route::get('/assessments/{id}', [AssessmentController::class, 'show'])->name('assessments.show');
        Route::post('/assessments/{id}/note', [AssessmentController::class, 'addNote'])->name('assessments.addNote');
        Route::post('/assessments/{id}/approver-decision', [AssessmentController::class, 'updateApproverDecision'])->name('assessments.approverDecision');
    });

    // PCSM-SOPI: Step 10 - Outcome Monitoring Y0 (Manajemen Risiko)
    Route::middleware('role:manajemen_risiko|admin_sistem|compliance')->group(function () {
        Route::get('/outcome-monitoring', [OutcomeMonitoringController::class, 'index'])->name('outcome.index');
        Route::post('/outcome-monitoring', [OutcomeMonitoringController::class, 'store'])->name('outcome.store');
    });

    // PCSM-SOPI: Step 11 - Rekalibrasi & Parameter Model (Admin & Manajemen Risiko)
    Route::middleware('role:admin_sistem|manajemen_risiko|compliance')->group(function () {
        Route::get('/calibration', [CalibrationController::class, 'index'])->name('calibration.index');
        Route::post('/calibration', [CalibrationController::class, 'store'])->name('calibration.store');
    });

    // PCSM-SOPI: Master Item Kuesioner (Admin IT & Compliance)
    Route::middleware('role:admin_sistem|compliance')->group(function () {
        Route::get('/item-masters', [ItemMasterController::class, 'index'])->name('item-masters.index');
        Route::put('/item-masters/{id}', [ItemMasterController::class, 'update'])->name('item-masters.update');
    });

    // PCSM-SOPI: Master Opini & Narasi Rekomendasi (Admin IT, Manajemen Risiko, & Compliance)
    Route::middleware('role:admin_sistem|manajemen_risiko|compliance')->group(function () {
        Route::get('/master-opinions', [MasterOpinionController::class, 'index'])->name('master-opinions.index');
        Route::put('/master-opinions/{id}', [MasterOpinionController::class, 'update'])->name('master-opinions.update');
    });
});

// PCSM-SOPI Public/Token Routes (Nasabah)
Route::get('/kuesioner/selesai', [QuestionnaireController::class, 'selesai'])->name('kuesioner.selesai');
Route::get('/kuesioner/{token}/consent', [QuestionnaireController::class, 'showConsent'])->name('kuesioner.consent');
Route::post('/kuesioner/{token}/consent', [QuestionnaireController::class, 'submitConsent'])->name('kuesioner.consent.submit');
Route::get('/kuesioner/{token}', [QuestionnaireController::class, 'showForm'])->name('kuesioner.form');
Route::post('/kuesioner/{token}', [QuestionnaireController::class, 'submitForm'])->name('kuesioner.submit');

// Template Radix UI (development only)
Route::get('/template', [TemplateController::class, 'index'])->name('template.index');
Route::get('/template/doctor', [TemplateController::class, 'index'])->name('template.doctor');
Route::get('/template/front-office', [TemplateController::class, 'frontOffice'])->name('template.front-office');
Route::get('/template/business', [TemplateController::class, 'business'])->name('template.business');

require __DIR__.'/auth.php';
