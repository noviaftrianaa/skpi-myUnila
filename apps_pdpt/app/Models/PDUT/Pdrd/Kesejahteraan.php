<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;

class Kesejahteraan extends AbstractionModel
{
    protected $table = 'pdrd.kesejahteraan';
    protected $primaryKey = 'id_kesejahteraan';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_kesejahteraan',	'id_sdm',	'id_jns_sejahtera',	'nm_kesejahteraan',	'penyelenggara',	'dari_thn',	'sampai_thn',	'stat',	'no_peserta',	'id_creator',	'id_updater',	'soft_delete',
    ];
}