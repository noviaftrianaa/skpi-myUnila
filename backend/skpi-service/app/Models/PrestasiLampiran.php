<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PrestasiLampiran extends Model
{
    protected $table = 'prestasi_lampiran';

    protected $fillable = [
        'prestasi_id',
        'jenis_dokumen',
        'nama_file',
        'nama_file_storage',
        'path_file',
        'mime_type',
        'ukuran_file'
    ];

    protected $casts = [
        'ukuran_file' => 'integer'
    ];

    public function prestasi(): BelongsTo
    {
        return $this->belongsTo(Prestasi::class, 'prestasi_id');
    }
}
