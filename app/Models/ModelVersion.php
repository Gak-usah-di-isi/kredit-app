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
}
