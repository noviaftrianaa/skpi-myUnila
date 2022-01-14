<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class AkredSp extends AbstractionModel
{
    protected $table = 'pdrd.akred_sp';
    protected $primaryKey = 'asal_data';
    protected $fillable = [
    	'asal_data',		'id_akred',		'id_akred_sp',		'id_creator',		'id_lemb_akred',		'id_sp',		'id_updater',		'sk_akred_sp',		'soft_delete',		'tgl_sk_akred_sp',		'tst_sk_akred_sp',
    ];
}
