<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class TulisPub extends Model
{
    protected $table = 'pdrd.tulis_pub';
    protected $primaryKey = 'id_tulis_pub';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_tulis_pub',	'id_publikasi',	'id_sdm',	'id_katgiat',	'id_pd',	'id_orang',	'urutan',	'afiliasi',	'peran_tulis',	'jns_penulis',	'a_corr_author',	'nm_pd',	'nipd',	'id_afiliasi',	'jns_afiliasi',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}