<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class Smi extends AbstractionModel
{
    protected $table = 'pdrd.smi';
    protected $primaryKey = 'habis_masa_laku';
    protected $fillable = [
    	'habis_masa_laku',		'id_creator',		'id_smi',		'id_updater',		'kode_smi',		'singkatan',		'sk_selenggara',		'soft_delete',		'tgl_berdiri',		'tgl_sk_selenggara',		'tmt_sk_selenggara',		'tst_sk_selenggara',
    ];
}
