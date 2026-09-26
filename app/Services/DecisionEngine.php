<?php

namespace App\Services;

use App\Models\Assessment;
use App\Models\AssessmentDecision;
use App\Models\CalibrationParameter;

class DecisionEngine
{
    public function generateDecision(Assessment $assessment)
    {
        $score = $assessment->score;
        $flag = $assessment->flag;
        $params = CalibrationParameter::where('model_version_id', $assessment->model_version_id)->first();

        if (!$score || !$flag || !$params) {
            throw new \Exception("Score, Flags, and Params are required for decision making.");
        }

        // Determine Dimension Categories (Dimension-Gated)
        $pfrCategory = $this->categorizeDimension($score->pfr_100, $params->pfr_p25, $params->pfr_p75);
        $ssrCategory = $this->categorizeDimension($score->ssr_100, $params->ssr_p25, $params->ssr_p75);

        // Kredibilitas bermasalah jika SD Flag Elevated/High, Straightlining terdeteksi, atau Variabilitas Rendah
        $hasCredibilityIssue = in_array($flag->sd_flag, ['Elevated', 'High']) 
            || $flag->straightline_flag 
            || $flag->low_variability_flag;

        // Determine Final Recommendation
        $finalRec = '';
        $narrative = '';

        if ($pfrCategory === 'Concern' && $ssrCategory === 'Concern') {
            $finalRec = 'CONCERN - HIGH PRIORITY REVIEW';
            $narrative = "Kapasitas finansial dan keberlanjutan berada di bawah standar minimum (Concern). Risiko tinggi terdeteksi pada kedua area.";
        } elseif ($pfrCategory === 'Concern' || $ssrCategory === 'Concern') {
            $finalRec = 'CONCERN';
            $dim = $pfrCategory === 'Concern' ? 'Keuangan' : 'Keberlanjutan';
            $narrative = "Risiko terdeteksi pada profil {$dim} (Concern). Disarankan review mendalam terkait area tersebut.";
        } elseif ($pfrCategory === 'Review' || $ssrCategory === 'Review') {
            if ($hasCredibilityIssue) {
                $finalRec = 'ENHANCED REVIEW';
                $reasons = [];
                if (in_array($flag->sd_flag, ['Elevated', 'High'])) $reasons[] = "Social Desirability {$flag->sd_flag}";
                if ($flag->straightline_flag) $reasons[] = "pola jawaban seragam";
                if ($flag->low_variability_flag) $reasons[] = "variasi jawaban rendah";
                $reasonText = implode(', ', $reasons);
                $narrative = "Profil berada di area Review, disertai flag kredibilitas ({$reasonText}). Verifikasi intensif diperlukan.";
            } else {
                $finalRec = 'REVIEW';
                $narrative = "Profil berada di area rata-rata (Review). Tidak ada masalah serius yang terlihat.";
            }
        } elseif ($pfrCategory === 'Supportive' && $ssrCategory === 'Supportive') {
            if ($hasCredibilityIssue) {
                $finalRec = 'REVIEW - RESPONSE VERIFICATION';
                $reasons = [];
                if (in_array($flag->sd_flag, ['Elevated', 'High'])) $reasons[] = "Social Desirability {$flag->sd_flag}";
                if ($flag->straightline_flag) $reasons[] = "pola jawaban seragam";
                if ($flag->low_variability_flag) $reasons[] = "variasi jawaban rendah";
                $reasonText = implode(', ', $reasons);
                $narrative = "Profil sangat baik (Supportive), namun flag kredibilitas terdeteksi ({$reasonText}). Disarankan verifikasi atas validitas respon.";
            } else {
                $finalRec = 'SUPPORTIVE';
                $narrative = "Profil optimal (Supportive) pada semua dimensi. Kredibilitas jawaban baik.";
            }
        }

        return AssessmentDecision::updateOrCreate(
            ['assessment_id' => $assessment->id],
            [
                'pfr_category' => $pfrCategory,
                'ssr_category' => $ssrCategory,
                'credibility_status' => $flag->sd_flag,
                'final_recommendation' => $finalRec,
                'auto_narrative' => $narrative,
            ]
        );
    }

    private function categorizeDimension($score, $p25, $p75)
    {
        if ($score >= $p75) return 'Supportive';
        if ($score >= $p25) return 'Review';
        return 'Concern';
    }
}
