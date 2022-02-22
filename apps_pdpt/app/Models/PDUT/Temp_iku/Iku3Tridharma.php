<?php

namespace App\Models\PDUT\Temp_iku;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Iku3Tridharma extends Model
{
    use HasFactory;
    protected $table = 'temp_iku.iku3_tridharma';
    protected $primaryKey = 'id_iku3_tridharma';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'id_iku3_tridharma',
        'id_litabmas',
        'id_sdm',
        'tahun_anggaran',
        'jenis_kegiatan',
        'kategori_kegiatan',
        'keaktifan_kegiatan',
        'skim_kegiatan',
        'afiliasi',
        'kelompok_bidang',
        'nomor_sk_penugasan',
        'tanggal_sk_penugasan',
        'lama_kegiatan',
        'judul_kegiatan',
        'lokasi_kegiatan',
        'tahun_pelaksanaan_ke',
        'peran_kegiatan_dosen',
        'keaktifan_kegiatan_dosen',
        'last_sync'
    ];
}
