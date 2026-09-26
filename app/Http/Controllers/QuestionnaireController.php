<?php

namespace App\Http\Controllers;

use App\Models\Assessment;
use App\Models\ConsentLog;
use App\Models\ItemMaster;
use App\Models\CalibrationParameter;
use App\Services\ScoringEngine;
use App\Services\CredibilityEngine;
use App\Services\DecisionEngine;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class QuestionnaireController extends Controller
{
    public function showConsent($token)
    {
        $assessment = Assessment::with('borrower')->where('token', $token)->firstOrFail();
        
        if ($assessment->status !== 'draft') {
            return Inertia::render('Kuesioner/Selesai', [
                'message' => 'Kuesioner ini sudah diselesaikan.'
            ]);
        }

        return Inertia::render('Kuesioner/Consent', [
            'assessment' => $assessment,
            'borrower' => $assessment->borrower
        ]);
    }

    public function submitConsent(Request $request, $token)
    {
        $assessment = Assessment::where('token', $token)->firstOrFail();
        
        if ($assessment->status !== 'draft') {
            return redirect()->route('kuesioner.selesai');
        }

        ConsentLog::updateOrCreate(
            ['assessment_id' => $assessment->id],
            [
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'agreed_at' => now()
            ]
        );

        $assessment->update(['start_time' => now()]);

        return redirect()->route('kuesioner.form', ['token' => $token]);
    }

    public function showForm($token)
    {
        $assessment = Assessment::where('token', $token)->firstOrFail();
        
        // Pastikan sudah consent
        if (!$assessment->consent) {
            return redirect()->route('kuesioner.consent', ['token' => $token]);
        }

        if ($assessment->status !== 'draft') {
            return redirect()->route('kuesioner.selesai');
        }

        // Ambil item kuesioner dan acak urutannya untuk frontend, tapi sertakan display_order
        $items = ItemMaster::orderBy('display_order')->get();

        return Inertia::render('Kuesioner/Form', [
            'assessment' => $assessment,
            'items' => $items
        ]);
    }

    public function submitForm(Request $request, $token, ScoringEngine $scorer, CredibilityEngine $credibility, DecisionEngine $decision)
    {
        $assessment = Assessment::where('token', $token)->firstOrFail();
        
        if ($assessment->status !== 'draft') {
            return redirect()->route('kuesioner.selesai');
        }

        $validated = $request->validate([
            'responses' => 'required|array',
            'responses.*.item_code' => 'required|exists:item_master,item_code',
            'responses.*.raw_value' => 'required|integer|min:1|max:7',
        ]);

        DB::beginTransaction();
        try {
            // 1. Simpan jawaban
            foreach ($validated['responses'] as $index => $resp) {
                $assessment->responses()->create([
                    'item_code' => $resp['item_code'],
                    'raw_value' => $resp['raw_value'],
                    'display_order' => $index + 1
                ]);
            }

            $assessment->update([
                'submit_time' => now(),
                'status' => 'submitted'
            ]);

            // 2. Jalankan Scoring & Engine
            $scorer->calculate($assessment);
            
            $params = CalibrationParameter::where('model_version_id', $assessment->model_version_id)->first();
            $credibility->evaluate($assessment, $params);
            
            $decision->generateDecision($assessment);

            DB::commit();
            return redirect()->route('kuesioner.selesai');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal memproses jawaban: ' . $e->getMessage()]);
        }
    }

    public function selesai()
    {
        return Inertia::render('Kuesioner/Selesai', [
            'message' => 'Terima kasih, jawaban Anda telah berhasil disimpan.'
        ]);
    }
}
