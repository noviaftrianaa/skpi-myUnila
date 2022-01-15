<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;

class RencanaAjar extends AbstractionModel
{
    protected $table = 'pdrd.rencana_ajar';
    protected $primaryKey = 'id_renc_ajar';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_renc_ajar',	'id_mk',	'pertemuan',	'materi_indonesia',	'materi_inggris',	'id_creator',	'id_updater',	'soft_delete',
    ];
}