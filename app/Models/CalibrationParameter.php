<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CalibrationParameter extends Model
{
    use HasFactory;

    protected $fillable = [
        'model_version_id', 'pfr_p25', 'pfr_p75', 'ssr_p25', 'ssr_p75',
        'sd_p75', 'sd_p90', 'straightline_threshold', 'low_variability_threshold', 'is_active'
    ];
    
    public function modelVersion()
    {
        return $this->belongsTo(ModelVersion::class);
    }
}
