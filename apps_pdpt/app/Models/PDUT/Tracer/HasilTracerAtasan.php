<?php

namespace App\Models\PDUT\Tracer;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HasilTracerAtasan extends Model
{
    protected $table = 'tracer.hasil_tracer_atasan';
    protected $primaryKey = 'id_hasil_tracer_atasan';
    public $timestamps = false;
    public $incrementing = false;


    protected $fillable = [
        'id_hasil_tracer_atasan',
        'id_hasil_tracer_study',
        'id_negara',
        'id_wil',
        'email_atasan',
        'nm_atasan',
        'jabatan_atasan',
        'nm_tmpt_bekerja',
        'bidang_tempat_bekerja',
        'saran',
        'harapan',
        'create_date',
        'id_creator',
        'last_update',
        'id_updater',
        'soft_delete',
        'last_sync'
    ];
}
