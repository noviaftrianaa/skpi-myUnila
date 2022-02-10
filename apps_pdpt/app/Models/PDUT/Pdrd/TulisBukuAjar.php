<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class TulisBukuAjar extends Model
{
    protected $table = 'pdrd.tulis_buku_ajar';
    protected $primaryKey = 'id_tulis_buku_ajar';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_tulis_buku_ajar',	'id_katgiat',	'id_buku_ajar',	'id_sdm',	'id_pd',	'id_orang',	'urutan',	'afiliasi',	'peran_tulis',	'jns_penulis',	'nm_pd',	'nipd',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}