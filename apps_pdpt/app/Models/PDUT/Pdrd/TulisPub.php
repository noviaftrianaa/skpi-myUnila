<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;

class TulisPub extends AbstractionModel
{
    protected $table = 'pdrd.tulis_pub';
    protected $primaryKey = 'id_tulis_pub';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_tulis_pub',	'id_publikasi',	'id_sdm',	'id_katgiat',	'id_pd',	'id_orang',	'urutan2',	'afiliasi',	'peran_tulis',	'jns_penulis',	'a_corr_author',	'nm_pd',	'nipd',	'id_afiliasi',	'jns_afiliasi',	'id_creator',	'id_updater',	'soft_delete',
    ];
}