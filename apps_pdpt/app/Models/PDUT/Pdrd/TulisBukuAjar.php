<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class TulisBukuAjar extends AbstractionModel
{
    protected $table = 'pdrd.tulis_buku_ajar';
    protected $primaryKey = 'afiliasi';
    protected $fillable = [
    	'afiliasi',		'id_buku_ajar',		'id_creator',		'id_katgiat',		'id_orang',		'id_pd',		'id_sdm',		'id_tulis_buku_ajar',		'id_updater',		'jns_penulis',		'nipd',		'nm_pd',		'peran_tulis',		'soft_delete',		'urutan2',
    ];
}
