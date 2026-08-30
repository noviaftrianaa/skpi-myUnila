<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Prestasi extends Model
{
    use HasFactory;

    protected $table = 'prestasi';

    protected $fillable = [
        'nim',
        'kategori_id',
        'tingkatan_id',
        'kategori_detail_id',
        'judul_kegiatan',
        'tahun',
        'nomor_sertifikat',
        'tanggal_sertifikat',
        'tautan_sertifikat',
        'bobot',
        'status',
    ];

    /**
     * Relasi ke kategori kegiatan
     */
    public function kategori()
    {
        return $this->belongsTo(KategoriKegiatan::class, 'kategori_id');
    }

    /**
     * Relasi ke tingkatan
     */
    public function tingkatan()
    {
        return $this->belongsTo(Tingkatan::class, 'tingkatan_id');
    }

    /**
     * Relasi ke kategori detail
     */
    public function kategoriDetail()
    {
        return $this->belongsTo(KategoriDetail::class, 'kategori_detail_id');
    }
}