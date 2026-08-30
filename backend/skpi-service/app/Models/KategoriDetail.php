<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KategoriDetail extends Model
{
    protected $table = 'kategori_detail';

    protected $fillable = [
        'kategori_id',
        'nama'
    ];

    public function kategori(): BelongsTo
    {
        return $this->belongsTo(KategoriKegiatan::class,'kategori_id');
    }

    public function prestasi(): HasMany
    {
        return $this->hasMany(Prestasi::class,'kategori_detail_id');
    }

    public function bobot(): HasMany
    {
        return $this->hasMany(BobotSkp::class,'kategori_detail_id');
    }
}
