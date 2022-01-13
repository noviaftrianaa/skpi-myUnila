<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class Prestasi extends AbstractionModel
{
    protected $table = 'pdrd.prestasi';
    protected $primaryKey = 'id_creator';
    protected $fillable = [
    	'id_creator',		'id_jenis_prestasi',		'id_pd',		'id_prestasi',		'id_sp',		'id_tkt_prestasi',		'id_updater',		'nm_prestasi',		'penyelenggara',		'peringkat',		'soft_delete',		'thn_prestasi',
    ];
}
