<?php

namespace App\Models\PDUT\Tracer;

use Illuminate\Database\Eloquent\Factories\HasFactory;
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
        'id_wil',
        'id_reg_pd',
        'id_smt',
        'wkt_pengisian',
        'wkt_tunggu',
        'status_lulusan',
        'jns_tmpt_bekerja',
        'nm_tmpt_bekerja',
        'income_per_bln',
        'create_date',
        'id_creator',
        'last_update',
        'id_updater',
        'soft_delete',
        'last_sync'
    ];
}
