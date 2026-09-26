<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssessmentFlag extends Model
{
    use HasFactory;

    protected $fillable = [
        'assessment_id', 'sd_flag', 'identical_answer_ratio', 
        'straightline_flag', 'response_sd', 'low_variability_flag',
        'completion_time_sec', 'timing_flag'
    ];
    
    protected $casts = [
        'straightline_flag' => 'boolean',
        'low_variability_flag' => 'boolean',
        'timing_flag' => 'boolean'
    ];
}
