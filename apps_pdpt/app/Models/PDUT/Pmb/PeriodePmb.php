<?php

namespace App\Models\PDUT\Pmb;

use Illuminate\Database\Eloquent\Model;

class PeriodePmb extends Model
{
    protected $table = 'pmb.periode_pmb';
    protected $primaryKey = 'id_periode_pmb';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
        'id_periode_pmb',
        'id_pembiayaan',
        'id_jenj_didik',
        'id_jns_daftar',
        'id_thn_ajaran',
        'id_jalur_daftar',
        'nm_periode_pmb',
        'gelombang',
        'smt',
        'a_internal',
        'create_date',
        'id_creator',
        'last_update',
        'id_updater',
        'soft_delete',
        'last_sync',
    ];
}
