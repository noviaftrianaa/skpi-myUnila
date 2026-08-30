<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PrestasiAnggota extends Model
{
    protected $table = 'prestasi_anggota';

    protected $fillable = [
        'prestasi_id',
        'nim',
        'nama'
    ];

    public function prestasi(): BelongsTo
    {
        return $this->belongsTo(Prestasi::class, 'prestasi_id');
    }
}
