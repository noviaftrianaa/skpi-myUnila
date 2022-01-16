<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;

class PdAnggotaLitabmas extends AbstractionModel
{
    protected $table = 'pdrd.pd_anggota_litabmas';
    protected $primaryKey = 'id_pd_ang_litabmas';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_pd_ang_litabmas',	'id_litabmas',	'id_pd',	'peran_litabmas',	'stat_aktif',	'nm_pd',	'nipd',	'id_creator',	'id_updater',	'soft_delete',
    ];
}