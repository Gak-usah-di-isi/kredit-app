<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssessmentResponse extends Model
{
    use HasFactory;

    protected $fillable = [
        'assessment_id', 'item_code', 'raw_value', 'display_order'
    ];

    public function itemMaster()
    {
        return $this->belongsTo(ItemMaster::class, 'item_code', 'item_code');
    }
}
