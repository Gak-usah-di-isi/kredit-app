<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Assessment extends Model
{
    use HasFactory;

    protected $fillable = [
        'borrower_id', 'officer_id', 'branch_id', 'model_version_id', 
        'token', 'status', 'start_time', 'submit_time'
    ];
    
    protected $casts = [
        'start_time' => 'datetime',
        'submit_time' => 'datetime'
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($assessment) {
            if (empty($assessment->token)) {
                $assessment->token = Str::random(32);
            }
        });
    }
    
    public function borrower()
    {
        return $this->belongsTo(Borrower::class);
    }
    
    public function officer()
    {
        return $this->belongsTo(User::class, 'officer_id');
    }
    
    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
    
    public function responses()
    {
        return $this->hasMany(AssessmentResponse::class);
    }
    
    public function score()
    {
        return $this->hasOne(AssessmentScore::class);
    }
    
    public function flag()
    {
        return $this->hasOne(AssessmentFlag::class);
    }
    
    public function decision()
    {
        return $this->hasOne(AssessmentDecision::class);
    }
    
    public function consent()
    {
        return $this->hasOne(ConsentLog::class);
    }
}
