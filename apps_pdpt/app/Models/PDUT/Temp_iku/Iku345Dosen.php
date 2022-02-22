<?php

namespace App\Models\PDUT\Temp_iku;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Iku345Dosen extends Model
{
    use HasFactory;
    protected $table = 'temp_iku.iku345_dosen';
    protected $primaryKey = 'id_iku345_dosen';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'id_iku345_dosen',
        'id_sdm',
        'id_rwy_didik_formal',
        'tahun_ajaran',
        'ikatan_kerja',
        'status_aktif',
        'nama',
        'jenkel',
        'usia',
        'nidn',
        'nidk',
        'asal_fakultas',
        'asal_jurusan',
        'asal_prodi',
        'jenjang_studi',
        'gelar_akademik',
        'bidang_studi',
        'perguruan_tinggi',
        'program_studi',
        'tahun_masuk',
        'tahun_lulus',
        'last_sync'
    ];
}
