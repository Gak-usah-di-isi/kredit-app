<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OutcomeMonitoring extends Model
{
    use HasFactory;

    protected $fillable = [
        'assessment_id',
        'collectibility_status',
        'dpd_days',
        'is_npl',
        'outstanding_balance',
        'monitoring_date',
        'notes',
        'recorded_by',
    ];

    protected $casts = [
        'monitoring_date' => 'date',
        'is_npl' => 'boolean',
        'outstanding_balance' => 'decimal:2',
    ];

    public function assessment()
    {
        return $this->belongsTo(Assessment::class);
    }

    public function recorder()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
