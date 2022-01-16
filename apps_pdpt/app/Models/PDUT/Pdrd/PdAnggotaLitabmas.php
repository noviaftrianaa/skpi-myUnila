<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class PdAnggotaLitabmas extends Model
{
    protected $table = 'pdrd.pd_anggota_litabmas';
    protected $primaryKey = 'id_pd_ang_litabmas';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_pd_ang_litabmas',	'id_litabmas',	'id_pd',	'peran_litabmas',	'stat_aktif',	'nm_pd',	'nipd',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}