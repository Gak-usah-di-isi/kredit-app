<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssessmentScore extends Model
{
    use HasFactory;

    protected $fillable = [
        'assessment_id', 'pfr_raw', 'ssr_raw', 'sd_raw', 
        'pfr_100', 'ssr_100', 'sd_100', 'overall_sopi_100'
    ];
}
