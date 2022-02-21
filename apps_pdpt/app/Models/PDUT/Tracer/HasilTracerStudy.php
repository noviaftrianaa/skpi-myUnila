<?php

namespace App\Models\PDUT\Tracer;

use Illuminate\Database\Eloquent\Model;

class HasilTracerStudy extends Model
{
    protected $table = 'tracer.hasil_tracer_study';
    protected $primaryKey = 'id_hasil_tracer_study';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
        'id_hasil_tracer_study',
        'id_thn_ajaran',
        'id_bid_kerja',
        'id_wil',
        'id_reg_pd',
        'id_smt',
        'id_jns_jalur_kerja',
        'wkt_pengisian',
        'wkt_tunggu',
        'status_lulusan',
        'a_kerja_sblm_lulus',
        'jns_tmpt_bekerja',
        'level_perusahaan',
        'nm_tmpt_bekerja',
        'income_per_bln',
        'status_jabatan',
        'total_instansi_dilamar',
        'hub_bidang_kerja',
        'tkt_kesesuaian',
        'alasan_tidak_sesuai',
        'nm_pt_lnjt',
        'nm_prodi_lnjt',
        'wkt_masuk',
        'ket',
        'create_date',
        'id_creator',
        'last_update',
        'id_updater',
        'soft_delete',
        'last_sync'
    ];
}
