<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MasterOpinion extends Model
{
    use HasFactory;

    protected $table = 'master_opinions';

    protected $fillable = [
        'code',
        'category',
        'title',
        'narrative',
        'description',
    ];
}
