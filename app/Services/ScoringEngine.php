<?php

namespace App\Services;

use App\Models\Assessment;
use App\Models\AssessmentScore;

class ScoringEngine
{
    /**
     * Hitung PFR_raw, SSR_raw, SD_raw lalu konversi ke 0-100 dan hitung Overall SOPI
     */
    public function calculate(Assessment $assessment)
    {
        $responses = $assessment->responses()->with('itemMaster')->get();
        
        $pfrItems = [];
        $ssrItems = [];
        $sdItems = [];

        foreach ($responses as $response) {
            $dimension = $response->itemMaster->dimension ?? null;
            if (!$dimension) {
                // If direct relation is missing, infer from item_code prefix (fallback)
                if (str_starts_with($response->item_code, 'SD')) $dimension = 'SD';
                else if (in_array($response->item_code, ['X11','X12','X15','X21','X31','X34','X41'])) $dimension = 'PFR';
                else $dimension = 'SSR';
            }

            if ($dimension === 'PFR') {
                $pfrItems[] = $response->raw_value;
            } elseif ($dimension === 'SSR') {
                $ssrItems[] = $response->raw_value;
            } elseif ($dimension === 'SD') {
                $sdItems[] = $response->raw_value;
            }
        }

        $pfrRaw = count($pfrItems) > 0 ? array_sum($pfrItems) / count($pfrItems) : 0;
        $ssrRaw = count($ssrItems) > 0 ? array_sum($ssrItems) / count($ssrItems) : 0;
        $sdRaw = count($sdItems) > 0 ? array_sum($sdItems) / count($sdItems) : 0;

        $pfr100 = (($pfrRaw - 1) / 6) * 100;
        $ssr100 = (($ssrRaw - 1) / 6) * 100;
        $sd100 = (($sdRaw - 1) / 6) * 100;

        $overallSopi = ($pfr100 + $ssr100) / 2;

        return AssessmentScore::updateOrCreate(
            ['assessment_id' => $assessment->id],
            [
                'pfr_raw' => round($pfrRaw, 4),
                'ssr_raw' => round($ssrRaw, 4),
                'sd_raw' => round($sdRaw, 4),
                'pfr_100' => round($pfr100, 4),
                'ssr_100' => round($ssr100, 4),
                'sd_100' => round($sd100, 4),
                'overall_sopi_100' => round($overallSopi, 4)
            ]
        );
    }
}
