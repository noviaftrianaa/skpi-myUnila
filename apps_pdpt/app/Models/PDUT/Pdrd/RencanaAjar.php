<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class RencanaAjar extends AbstractionModel
{
    protected $table = 'pdrd.rencana_ajar';
    protected $primaryKey = 'id_creator';
    protected $fillable = [
    	'id_creator',		'id_mk',		'id_renc_ajar',		'id_updater',		'materi_indonesia',		'materi_inggris',		'pertemuan',		'soft_delete',
    ];
}
