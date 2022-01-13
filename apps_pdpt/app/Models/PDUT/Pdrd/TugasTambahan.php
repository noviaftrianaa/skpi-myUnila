<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class TugasTambahan extends AbstractionModel
{
    protected $table = 'pdrd.tugas_tambahan';
    protected $primaryKey = 'id_creator';
    protected $fillable = [
    	'id_creator',		'id_jab_tgs',		'id_katgiat',		'id_sdm',		'id_sms',		'id_sp',		'id_tgs_tambah',		'id_updater',		'jml_jam',		'sk_tugas_tambah',		'soft_delete',		'tmt_sk_tambah',		'tst_sk_tambah',
    ];
}
