<?php

namespace App\Http\Controllers;

use App\Models\Assessment;
use App\Models\Borrower;
use App\Models\Branch;
use App\Models\ModelVersion;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class AssessmentController extends Controller
{
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Query berdasarkan role:
        // Petugas Kredit (AO) hanya melihat asesmen miliknya.
        // Pejabat Pemutus, Admin Sistem, Manajemen Risiko, dan Kepatuhan melihat seluruh asesmen.
        $query = Assessment::with(['borrower', 'decision', 'officer', 'score'])->latest();

        if ($user->hasRole('petugas_kredit') && !$user->hasRole(['admin_sistem', 'pejabat_pemutus'])) {
            $query->where('officer_id', $user->id);
        }

        $assessments = $query->get();
        $borrowers = Borrower::orderBy('name')->get();

        $canCreateAssessment = $user->hasRole(['petugas_kredit', 'admin_sistem']);

        return Inertia::render('AO/Assessment/Index', [
            'assessments' => $assessments,
            'borrowers' => $borrowers,
            'canCreateAssessment' => $canCreateAssessment,
        ]);
    }

    public function create()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (!$user->hasRole(['petugas_kredit', 'admin_sistem'])) {
            abort(403, 'Hanya Petugas Kredit (AO) atau Admin yang dapat membuat asesmen baru.');
        }

        $borrowers = Borrower::orderBy('name')->get();
        return Inertia::render('AO/Assessment/Create', [
            'borrowers' => $borrowers
        ]);
    }

    public function store(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (!$user->hasRole(['petugas_kredit', 'admin_sistem'])) {
            abort(403, 'Hanya Petugas Kredit (AO) atau Admin yang dapat membuat asesmen baru.');
        }

        $request->validate([
            'borrower_id' => 'required|exists:borrowers,id',
        ]);

        $borrower = Borrower::findOrFail($request->borrower_id);
        $activeModel = ModelVersion::where('status', 'active')->firstOrFail();

        $assessment = Assessment::create([
            'borrower_id' => $borrower->id,
            'officer_id' => $user->id,
            'branch_id' => $borrower->branch_id,
            'model_version_id' => $activeModel->id,
            'status' => 'draft',
        ]);

        return redirect()->route('assessments.show', $assessment->id)
            ->with('success', 'Asesmen berhasil dibuat. Silakan bagikan link kuesioner ke nasabah.');
    }

    public function show($id)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $assessment = Assessment::with([
            'borrower',
            'officer',
            'score',
            'flag',
            'decision.notedBy',
            'decision.approver',
            'consent',
            'outcomeMonitoring.recorder',
            'responses.itemMaster'
        ])->findOrFail($id);

        $isOwner = $assessment->officer_id === $user->id;
        $hasAccessRole = $user->hasRole(['pejabat_pemutus', 'admin_sistem', 'compliance', 'manajemen_risiko']);

        if (!$isOwner && !$hasAccessRole) {
            abort(403, 'Anda tidak memiliki hak akses untuk melihat asesmen ini.');
        }

        $canEditNote = $isOwner || $user->hasRole(['pejabat_pemutus', 'admin_sistem']);
        $canReviewDecision = $user->hasRole(['pejabat_pemutus', 'admin_sistem']);
        $canRecordOutcome = $user->hasRole(['manajemen_risiko', 'admin_sistem']);
        $isReadOnly = !$canEditNote;

        $rec = $assessment->decision?->final_recommendation ?? '';
        $needsOfficerNote = str_contains($rec, 'REVIEW') || str_contains($rec, 'CONCERN');

        return Inertia::render('AO/Assessment/Detail', [
            'assessment' => $assessment,
            'questionnaire_url' => url('/kuesioner/' . $assessment->token),
            'canEditNote' => $canEditNote,
            'canReviewDecision' => $canReviewDecision,
            'canRecordOutcome' => $canRecordOutcome,
            'needsOfficerNote' => $needsOfficerNote,
            'isReadOnly' => $isReadOnly,
        ]);
    }

    public function addNote(Request $request, $id)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $assessment = Assessment::findOrFail($id);

        $isOwner = $assessment->officer_id === $user->id;
        $canAddNote = $isOwner || $user->hasRole(['pejabat_pemutus', 'admin_sistem']);

        if (!$canAddNote) {
            abort(403, 'Anda tidak berwenang menambahkan catatan pada asesmen ini.');
        }

        $request->validate([
            'officer_note' => 'required|string'
        ]);

        if ($assessment->decision) {
            $assessment->decision->update([
                'officer_note' => $request->officer_note,
                'officer_note_by' => $user->id,
                'officer_note_at' => now()
            ]);

            $assessment->update(['status' => 'reviewed']);
        }

        return redirect()->back()->with('success', 'Catatan petugas berhasil disimpan.');
    }

    /**
     * Step 9: Pejabat Pemutus Keputusan Kredit Final / Review Approval
     */
    public function updateApproverDecision(Request $request, $id)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (!$user->hasRole(['pejabat_pemutus', 'admin_sistem'])) {
            abort(403, 'Hanya Pejabat Pemutus atau Admin yang berhak memberikan keputusan peninjauan.');
        }

        $assessment = Assessment::with('decision')->findOrFail($id);
        $decision = $assessment->decision;

        if (!$decision) {
            abort(400, 'Hasil asesmen belum dihitung.');
        }

        // GAP 6: Validasi Wajib Officer Note jika status Review atau Concern
        $rec = $decision->final_recommendation ?? '';
        $isReviewOrConcern = str_contains($rec, 'REVIEW') || str_contains($rec, 'CONCERN');

        if ($isReviewOrConcern && empty($decision->officer_note)) {
            return redirect()->back()->withErrors([
                'approver_decision' => 'Asesmen dengan status Review atau Concern WAJIB dilengkapi Catatan Petugas (Officer Note) sebelum Pejabat Pemutus dapat menetapkan keputusan.'
            ]);
        }

        $validated = $request->validate([
            'approver_decision' => 'required|in:APPROVED_FOR_PROCESSING,RETURNED_FOR_REVISION,REJECTED',
            'approver_note' => 'required|string|max:1000',
        ]);

        $decision->update([
            'approver_decision' => $validated['approver_decision'],
            'approver_note' => $validated['approver_note'],
            'approver_id' => $user->id,
            'approved_at' => now(),
        ]);

        $newStatus = $validated['approver_decision'] === 'RETURNED_FOR_REVISION' ? 'revision_needed' : 'decided';
        $assessment->update(['status' => $newStatus]);

        return redirect()->back()->with('success', 'Keputusan peninjauan Pejabat Pemutus berhasil disimpan.');
    }
}
