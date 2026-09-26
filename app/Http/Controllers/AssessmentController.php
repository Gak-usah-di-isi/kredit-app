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
        $assessments = Assessment::with(['borrower', 'decision'])
            ->where('officer_id', Auth::id())
            ->latest()
            ->get();
        $borrowers = Borrower::orderBy('name')->get();

        return Inertia::render('AO/Assessment/Index', [
            'assessments' => $assessments,
            'borrowers' => $borrowers,
        ]);
    }

    public function create()
    {
        $borrowers = Borrower::orderBy('name')->get();
        return Inertia::render('AO/Assessment/Create', [
            'borrowers' => $borrowers
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'borrower_id' => 'required|exists:borrowers,id',
        ]);

        $borrower = Borrower::findOrFail($request->borrower_id);
        $activeModel = ModelVersion::where('status', 'active')->firstOrFail();

        $assessment = Assessment::create([
            'borrower_id' => $borrower->id,
            'officer_id' => Auth::id(),
            'branch_id' => $borrower->branch_id,
            'model_version_id' => $activeModel->id,
            'status' => 'draft',
        ]);

        return redirect()->route('assessments.show', $assessment->id)
            ->with('success', 'Asesmen berhasil dibuat. Silakan bagikan link kuesioner ke nasabah.');
    }

    public function show($id)
    {
        $assessment = Assessment::with([
            'borrower',
            'score',
            'flag',
            'decision',
            'consent',
            'responses.itemMaster'
        ])->findOrFail($id);

        // Hanya boleh diakses oleh pembuatnya atau role lebih tinggi (disini cukup officer_id untuk MVP)
        if ($assessment->officer_id !== Auth::id()) {
            abort(403);
        }

        return Inertia::render('AO/Assessment/Detail', [
            'assessment' => $assessment,
            'questionnaire_url' => url('/kuesioner/' . $assessment->token)
        ]);
    }

    public function addNote(Request $request, $id)
    {
        $assessment = Assessment::findOrFail($id);

        $request->validate([
            'officer_note' => 'required|string'
        ]);

        if ($assessment->decision) {
            $assessment->decision->update([
                'officer_note' => $request->officer_note,
                'officer_note_by' => Auth::id(),
                'officer_note_at' => now()
            ]);

            $assessment->update(['status' => 'reviewed']);
        }

        return redirect()->back()->with('success', 'Catatan berhasil disimpan.');
    }
}
