<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KategoriKegiatan extends Model
{
    protected $table = 'kategori_kegiatan';

    protected $fillable = [
        'nama',
        'deskripsi',
        'is_prestasi'
    ];

    protected $casts = [
        'is_prestasi' => 'boolean',
    ];

    public function prestasi(): HasMany
    {
        return $this->hasMany(Prestasi::class, 'kategori_id');
    }

    public function detail(): HasMany
    {
        return $this->hasMany(KategoriDetail::class, 'kategori_id');
    }

    public function bobot(): HasMany
    {
        return $this->hasMany(BobotSkp::class, 'kategori_id');
    }
}
