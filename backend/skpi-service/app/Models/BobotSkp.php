<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BobotSkp extends Model
{
    protected $table = 'bobot_skp';

    protected $fillable = [
        'kategori_id',
        'tingkatan_id',
        'kategori_detail_id',
        'bobot'
    ];

    public function kategori(): BelongsTo
    {
        return $this->belongsTo(KategoriKegiatan::class,'kategori_id');
    }

    public function tingkatan(): BelongsTo
    {
        return $this->belongsTo(Tingkatan::class,'tingkatan_id');
    }

    public function detail(): BelongsTo
    {
        return $this->belongsTo(KategoriDetail::class,'kategori_detail_id');
    }
}
