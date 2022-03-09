<?php

namespace App\Models\PDUT\Temp_iku;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Iku3Dosen extends Model
{
    use HasFactory;
    protected $table = 'temp_iku.iku3dosen';
    protected $primaryKey = 'id_dosen';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'id_dosen',
        'id_sdm',
        'id_sms',
        'id_thn_ajaran',
        'nm_ikatan_kerja',
        'nm_stat_aktif',
        'nm_sdm',
        'jk',
        'usia',
        'nidn',
        'nidk',
        'fakultas',
        'jurusan',
        'prodi',
        'c3_penelitian',
        'c3_pengabdian',
        'c3_qs100',
        'c3_praktisi',
        'c4_s3',
        'c4_sertifikasi',
        'c4_praktisi',
        'last_sync',
    ];
}
