<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PrestasiPembimbing extends Model
{
    protected $table = 'prestasi_pembimbing';

    protected $fillable = [
        'prestasi_id',
        'nidn',
        'nama_dosen'
    ];

    public function prestasi(): BelongsTo
    {
        return $this->belongsTo(Prestasi::class, 'prestasi_id');
    }
}
