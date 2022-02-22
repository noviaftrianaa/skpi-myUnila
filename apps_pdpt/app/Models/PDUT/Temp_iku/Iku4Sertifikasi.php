<?php

namespace App\Models\PDUT\Temp_iku;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Iku4Sertifikasi extends Model
{
    use HasFactory;
    protected $table = 'temp_iku.iku4_sertifikasi';
    protected $primaryKey = 'id_iku4_sertifikasi';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'id_iku3_sertifikasi',
        'id_rwy_sert',
        'id_sdm',
        'jenis_sertifikasi',
        'bidang_studi',
        'no_sk_sertifikasi',
        'tahun_sertifikasi',
        'nomor_peserta',
        'nomor_registras',
        'last_sync',
    ];
}
