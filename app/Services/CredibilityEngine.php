<?php

namespace App\Services;

use App\Models\Assessment;
use App\Models\AssessmentFlag;
use App\Models\CalibrationParameter;

class CredibilityEngine
{
    public function evaluate(Assessment $assessment, CalibrationParameter $params)
    {
        $responses = $assessment->responses()->get();
        $score = $assessment->score;

        if (!$score) {
            throw new \Exception("Score must be calculated before credibility evaluation.");
        }

        // 1. SD Flag
        $sdFlag = 'Normal';
        if ($score->sd_100 >= $params->sd_p90) {
            $sdFlag = 'High';
        } elseif ($score->sd_100 >= $params->sd_p75) {
            $sdFlag = 'Elevated';
        }

        // 2. Straightlining & Low Variability
        $allValues = $responses->pluck('raw_value')->toArray();
        $totalItems = count($allValues);
        
        $identicalAnswerRatio = 0;
        $straightlineFlag = false;
        $responseSd = 0;
        $lowVariabilityFlag = false;

        if ($totalItems > 0) {
            // Straightlining
            $valueCounts = array_count_values($allValues);
            $maxCount = max($valueCounts);
            $identicalAnswerRatio = $maxCount / $totalItems;
            
            if ($identicalAnswerRatio >= $params->straightline_threshold) {
                $straightlineFlag = true;
            }

            // Standard Deviation
            $mean = array_sum($allValues) / $totalItems;
            $variance = 0;
            foreach ($allValues as $val) {
                $variance += pow($val - $mean, 2);
            }
            $variance /= $totalItems;
            $responseSd = sqrt($variance);

            if ($params->low_variability_threshold !== null && $responseSd < $params->low_variability_threshold) {
                $lowVariabilityFlag = true;
            }
        }

        // 3. Timing Flag (if available)
        $completionTime = null;
        $timingFlag = false;
        if ($assessment->start_time && $assessment->submit_time) {
            $completionTime = (int) abs($assessment->start_time->diffInSeconds($assessment->submit_time));
            // Example hardcoded threshold for timing: less than 17 seconds (1 sec/item)
            if ($completionTime < 17) {
                $timingFlag = true;
            }
        }

        return AssessmentFlag::updateOrCreate(
            ['assessment_id' => $assessment->id],
            [
                'sd_flag' => $sdFlag,
                'identical_answer_ratio' => round($identicalAnswerRatio, 4),
                'straightline_flag' => $straightlineFlag,
                'response_sd' => round($responseSd, 4),
                'low_variability_flag' => $lowVariabilityFlag,
                'completion_time_sec' => $completionTime,
                'timing_flag' => $timingFlag
            ]
        );
    }
}
