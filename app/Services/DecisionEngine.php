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
        $credibilityStatus = $hasCredibilityIssue ? 'Elevated/High' : 'Normal';

        // Determine Final Recommendation (Excel formula E57)
        $finalRec = '';
        if ($pfrCategory === 'Concern' && $ssrCategory === 'Concern') {
            $finalRec = 'CONCERN - HIGH PRIORITY REVIEW';
        } elseif ($pfrCategory === 'Concern' || $ssrCategory === 'Concern') {
            $finalRec = 'CONCERN';
        } elseif ($pfrCategory === 'Supportive' && $ssrCategory === 'Supportive') {
            $finalRec = ($credibilityStatus === 'Normal') ? 'SUPPORTIVE' : 'REVIEW - RESPONSE VERIFICATION';
        } else {
            // Salah satu atau kedua Review (tanpa Concern)
            $finalRec = ($credibilityStatus === 'Normal') ? 'REVIEW' : 'ENHANCED REVIEW';
        }

        // Auto Narrative persis sesuai rumus Excel E63
        $narrative = self::getRecommendationNarrative($finalRec);

        return AssessmentDecision::updateOrCreate(
            ['assessment_id' => $assessment->id],
            [
                'pfr_category' => $pfrCategory,
                'ssr_category' => $ssrCategory,
                'credibility_status' => $credibilityStatus,
                'final_recommendation' => $finalRec,
                'auto_narrative' => $narrative,
            ]
        );
    }

    public static function getRecommendationNarrative(string $finalRec): string
    {
        if ($finalRec === 'SUPPORTIVE') {
            return "Profil psikometrik menunjukkan tingkat prudent financial responsibility dan stakeholder & sustainability responsibility yang tinggi. Tidak terdapat flag kredibilitas respons yang material. Hasil ini mendukung proses asesmen untuk dilanjutkan sesuai SOP BPR.";
        }

        if (in_array($finalRec, ['CONCERN', 'CONCERN - HIGH PRIORITY REVIEW'])) {
            return "Ditemukan skor rendah pada salah satu atau lebih dimensi psikometrik. Hasil ini bukan penolakan otomatis, namun menjadi sinyal untuk pendalaman lebih lanjut pada proses asesmen kredit.";
        }

        // REVIEW, ENHANCED REVIEW, REVIEW - RESPONSE VERIFICATION
        return "Profil psikometrik secara umum memadai, namun terdapat satu atau lebih aspek yang memerlukan verifikasi tambahan. Petugas disarankan melakukan klarifikasi melalui wawancara dan dokumentasi pendukung sebelum mengambil keputusan kredit.";
    }

    public static function getPfrNarrative(string $category): string
    {
        return match ($category) {
            'Concern' => "Skor PFR (Prudent Financial Responsibility) di bawah ambang minimum - kehati-hatian dan tanggung jawab finansial nasabah masih rendah. Disarankan pendalaman lebih lanjut pada pengelolaan keuangan nasabah.",
            'Review' => "Skor PFR berada pada kisaran menengah - kehati-hatian finansial cukup memadai namun belum kuat. Perlu verifikasi tambahan sebelum disimpulkan.",
            'Supportive' => "Skor PFR tinggi - nasabah menunjukkan kehati-hatian dan tanggung jawab finansial yang kuat, mendukung proses asesmen kredit.",
            default => "-"
        };
    }

    public static function getSsrNarrative(string $category): string
    {
        return match ($category) {
            'Concern' => "Skor SSR (Stakeholder & Sustainability Responsibility) di bawah ambang minimum - orientasi terhadap keberlanjutan dan tanggung jawab ke komunitas/lingkungan masih rendah.",
            'Review' => "Skor SSR berada pada kisaran menengah - orientasi keberlanjutan cukup, namun belum konsisten kuat.",
            'Supportive' => "Skor SSR tinggi - nasabah menunjukkan orientasi kuat terhadap keberlanjutan dan tanggung jawab ke pemangku kepentingan.",
            default => "-"
        };
    }

    public static function getSdNarrative(string $flag): string
    {
        return match ($flag) {
            'High' => "Skor Social Desirability sangat tinggi (>= ambang High) - indikasi kuat jawaban bias ke arah citra diri yang ideal. Skor PFR/SSR sebaiknya tidak diandalkan sepenuhnya tanpa klarifikasi langsung ke nasabah.",
            'Elevated' => "Skor Social Desirability cukup tinggi (di atas ambang Elevated) - ada kecenderungan menjawab secara terlalu ideal/positif. Perlu diverifikasi agar skor SOPI tidak bias.",
            default => "Pola jawaban terhadap item kontrol Social Desirability wajar, tidak ada indikasi jawaban yang terlalu ideal secara sosial."
        };
    }

    public static function getCredibilityNarrative(string $status): string
    {
        if ($status === 'Normal') {
            return "Tidak ditemukan flag kredibilitas - pola jawaban, variasi jawaban, dan Social Desirability berada dalam batas wajar.";
        }
        return "Ditemukan satu atau lebih flag kredibilitas (Social Desirability tinggi, pola jawaban seragam/straightlining, dan/atau variasi jawaban terlalu rendah). Skor PFR/SSR perlu dibaca hati-hati dan disertai klarifikasi langsung ke nasabah.";
    }

    private function categorizeDimension($score, $p25, $p75)
    {
        if ($score >= $p75) return 'Supportive';
        if ($score >= $p25) return 'Review';
        return 'Concern';
    }
}
