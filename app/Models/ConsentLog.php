<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConsentLog extends Model
{
    use HasFactory;

    protected $table = 'consent_log';
    
    protected $fillable = [
        'assessment_id', 'ip_address', 'user_agent', 'agreed_at'
    ];
    
    protected $casts = [
        'agreed_at' => 'datetime'
    ];
}
