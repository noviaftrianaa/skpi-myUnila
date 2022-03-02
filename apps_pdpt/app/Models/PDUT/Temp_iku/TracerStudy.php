<?php

namespace App\Models\PDUT\Temp_iku;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TracerStudy extends Model
{
    protected $table = 'temp_iku.tracer_study';
    protected $primaryKey = 'id_tracer_study';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
        'id_tracer_study',
        'id_pd',
        'id_thn_ajaran',
        'nm_alumni',
        'nm_fakultas',
        'nm_prodi',
        'tgl_wisuda',
        'status_lulusan',
        'nm_tmpt_bekerja',
        'level_perusahaan',
        'nm_bid_kerja',
        'wkt_tunggu',
        'a_kerja_sblm_lulus',
        'income_per_bln',
        'status_jabatan',
        'nm_pt_lnjt',
        'nm_prodi_lnjt',
        'wkt_masuk',
        'nm_wil',
        'status_iku',
        'create_date',
        'id_creator',
        'last_update',
        'id_updater',
        'soft_delete',
        'last_sync	'
    ];
}
