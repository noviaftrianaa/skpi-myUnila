<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class Kesejahteraan extends AbstractionModel
{
    protected $table = 'pdrd.kesejahteraan';
    protected $primaryKey = 'dari_thn';
    protected $fillable = [
    	'dari_thn',		'id_creator',		'id_jns_sejahtera',		'id_kesejahteraan',		'id_sdm',		'id_updater',		'nm_kesejahteraan',		'no_peserta',		'penyelenggara',		'sampai_thn',		'soft_delete',		'stat',
    ];
}
