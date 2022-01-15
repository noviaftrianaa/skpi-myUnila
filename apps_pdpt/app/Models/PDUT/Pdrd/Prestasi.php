<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;

class Prestasi extends AbstractionModel
{
    protected $table = 'pdrd.prestasi';
    protected $primaryKey = 'id_prestasi';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_prestasi',	'id_jenis_prestasi',	'nm_prestasi',	'thn_prestasi',	'penyelenggara',	'peringkat',	'id_sp',	'id_pd',	'id_tkt_prestasi',	'id_creator',	'id_updater',	'soft_delete',
    ];
}