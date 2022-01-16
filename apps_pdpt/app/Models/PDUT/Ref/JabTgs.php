<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class JabTgs extends AbstractionModel
{
    protected $table = 'ref.jab_tgs';
    protected $primaryKey = 'id_jab_tgs';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jab_tgs',	'id_kel_prof',	'nm_jab_tgs',	'a_jab_utama_sek',	'a_jab_utama_pt',	'a_jab_utama_lpnk',	'a_jab_utama_lpk',	'jml_jam_diakui',
    ];
}