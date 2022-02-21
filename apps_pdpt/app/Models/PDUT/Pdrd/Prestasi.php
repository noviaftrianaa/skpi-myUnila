<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class Prestasi extends Model
{
    protected $table = 'pdrd.prestasi';
    protected $primaryKey = 'id_prestasi';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_prestasi',
	'id_jenis_prestasi',
	'id_akt_mhs',
	'nm_prestasi',
	'thn_prestasi',
	'penyelenggara',
	'peringkat',
	'id_sp',
	'id_pd',
	'id_tkt_prestasi',
	'create_date',
	'id_creator',
	'last_update',
	'id_updater',
	'soft_delete',
	'last_sync',
    ];
}
