<?php

namespace App\Http\Controllers;

use App\Models\Assessment;
use App\Models\OutcomeMonitoring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class OutcomeMonitoringController extends Controller
{
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (!$user->hasRole(['manajemen_risiko', 'admin_sistem', 'compliance'])) {
            abort(403, 'Anda tidak memiliki hak akses ke modul Outcome Monitoring.');
        }

        $outcomes = OutcomeMonitoring::with(['assessment.borrower', 'recorder'])
            ->latest('monitoring_date')
            ->get();

        // Ambil asesmen yang sudah berstatus decided/reviewed untuk input monitoring baru
        $assessments = Assessment::with('borrower')
            ->whereIn('status', ['submitted', 'reviewed', 'decided'])
            ->get();

        $stats = [
            'total_monitored' => $outcomes->count(),
            'lancar' => $outcomes->where('collectibility_status', 'Kol 1 (Lancar)')->count(),
            'dpk' => $outcomes->where('collectibility_status', 'Kol 2 (DPK)')->count(),
            'npl' => $outcomes->where('is_npl', true)->count(),
        ];

        return Inertia::render('Risk/Outcome/Index', [
            'outcomes' => $outcomes,
            'assessments' => $assessments,
            'stats' => $stats,
            'canRecord' => $user->hasRole(['manajemen_risiko', 'admin_sistem']),
        ]);
    }

    public function store(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (!$user->hasRole(['manajemen_risiko', 'admin_sistem'])) {
            abort(403, 'Hanya Unit Manajemen Risiko atau Admin yang dapat menginput data kolektibilitas Y0.');
        }

        $validated = $request->validate([
            'assessment_id' => 'required|exists:assessments,id',
            'collectibility_status' => 'required|in:Kol 1 (Lancar),Kol 2 (DPK),Kol 3 (Kurang Lancar),Kol 4 (Diragukan),Kol 5 (Macet)',
            'dpd_days' => 'required|integer|min:0',
            'outstanding_balance' => 'nullable|numeric|min:0',
            'monitoring_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        // Otomatis tandai NPL bila Kol 3, 4, atau 5
        $isNpl = in_array($validated['collectibility_status'], [
            'Kol 3 (Kurang Lancar)',
            'Kol 4 (Diragukan)',
            'Kol 5 (Macet)'
        ]);

        OutcomeMonitoring::updateOrCreate(
            ['assessment_id' => $validated['assessment_id']],
            [
                'collectibility_status' => $validated['collectibility_status'],
                'dpd_days' => $validated['dpd_days'],
                'is_npl' => $isNpl,
                'outstanding_balance' => $validated['outstanding_balance'] ?? 0,
                'monitoring_date' => $validated['monitoring_date'],
                'notes' => $validated['notes'],
                'recorded_by' => $user->id,
            ]
        );

        return redirect()->back()->with('success', 'Status kolektibilitas riil (Y0) berhasil dicatat.');
    }
}
