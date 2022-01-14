<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class Kepanitiaan extends AbstractionModel
{
    protected $table = 'pdrd.kepanitiaan';
    protected $primaryKey = 'id_creator';
    protected $fillable = [
    	'id_creator',		'id_jns_panitia',		'id_panitia',		'id_updater',		'instansi',		'nm_panitia',		'sk_tugas',		'soft_delete',		'tkt_panitia',		'tmt_sk_tugas',		'tst_sk_tugas',
    ];
}
