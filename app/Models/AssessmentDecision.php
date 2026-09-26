<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssessmentDecision extends Model
{
    use HasFactory;

    protected $fillable = [
        'assessment_id', 'pfr_category', 'ssr_category', 'credibility_status',
        'final_recommendation', 'auto_narrative', 'officer_note', 
        'officer_note_by', 'officer_note_at',
        'approver_decision', 'approver_note', 'approver_id', 'approved_at'
    ];
    
    protected $casts = [
        'officer_note_at' => 'datetime',
        'approved_at' => 'datetime',
    ];
    
    public function notedBy()
    {
        return $this->belongsTo(User::class, 'officer_note_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approver_id');
    }

    public function assessment()
    {
        return $this->belongsTo(Assessment::class);
    }
}
