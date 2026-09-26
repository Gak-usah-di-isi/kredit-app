<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ModelVersion extends Model
{
    use HasFactory;

    protected $fillable = [
        'version', 'description', 'status', 'released_at'
    ];
    
    protected $casts = [
        'released_at' => 'date'
    ];

    public function calibrationParameters()
    {
        return $this->hasMany(CalibrationParameter::class);
    }

    public function calibrationParameter()
    {
        return $this->hasOne(CalibrationParameter::class);
    }
}
