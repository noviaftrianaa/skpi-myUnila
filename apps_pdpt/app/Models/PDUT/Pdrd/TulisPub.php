<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class TulisPub extends AbstractionModel
{
    protected $table = 'pdrd.tulis_pub';
    protected $primaryKey = 'a_corr_author';
    protected $fillable = [
    	'a_corr_author',		'afiliasi',		'id_afiliasi',		'id_creator',		'id_katgiat',		'id_orang',		'id_pd',		'id_publikasi',		'id_sdm',		'id_tulis_pub',		'id_updater',		'jns_afiliasi',		'jns_penulis',		'nipd',		'nm_pd',		'peran_tulis',		'soft_delete',		'urutan2',
    ];
}
