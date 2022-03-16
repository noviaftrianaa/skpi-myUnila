<?php

namespace App\Models\PDUT\Temp_iku;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Iku5Dosen extends Model
{
    use HasFactory;
    protected $table = 'temp_iku.iku5dosen';
    protected $primaryKey = 'id_dosen';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'id_dosen',
        'id_sms',
        'id_sdm',
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
        'c_dosen_kar_tul_sas',
        'c_dosen_karya_terapan',
        'c_dosen_karya_seni',
        'c_dosen_kti',
        'c_dosen_penelitian',
        'c_dosen_pengabdian',
        'c_dosen_pengem_invensi_mitra',
        'c_dosen_preserv',
        'c_dosen_rekog',
        'last_sync',
    ];
}
