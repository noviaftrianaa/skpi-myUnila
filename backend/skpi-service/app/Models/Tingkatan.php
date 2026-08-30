<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tingkatan extends Model
{
    protected $table = 'tingkatan';

    protected $fillable = [
        'nama'
    ];

    public function prestasi(): HasMany
    {
        return $this->hasMany(Prestasi::class, 'tingkatan_id');
    }

    public function bobot(): HasMany
    {
        return $this->hasMany(BobotSkp::class, 'tingkatan_id');
    }
}
