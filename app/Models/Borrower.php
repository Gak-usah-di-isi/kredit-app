<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Borrower extends Model
{
    use HasFactory;

    protected $fillable = [
        'branch_id', 'name', 'nik', 'cif', 'phone', 'address', 'demography_json'
    ];
    
    protected $casts = [
        'demography_json' => 'array'
    ];
    
    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}
