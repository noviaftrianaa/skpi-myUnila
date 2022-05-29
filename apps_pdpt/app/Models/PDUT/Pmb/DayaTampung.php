<?php

namespace App\Models\PDUT\Pmb;

use Illuminate\Database\Eloquent\Model;

class DayaTampung extends Model
{
    protected $table = 'pmb.daya_tampung';
    protected $primaryKey = 'id_daya_tampung';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
        'id_daya_tampung',
        'id_periode_pmb',
        'id_smt',
        'id_sms',
        'target_mhs_baru',
        'calon_ikut_seleksi',
        'calon_pilihan_1',
        'calon_pilihan_2',
        'calon_pilihan_3',
        'ketetatan_statistik',
        'ketetatan_probabilitas',
        'calon_lulus_seleksi',
        'daftar_sbg_mhs',
        'pst_undur_diri',
        'tgl_awal_kul',
        'tgl_akhir_kul',
        'create_date',
        'id_creator',
        'last_update',
        'id_updater',
        'soft_delete',
        'last_sync',
    ];
}
