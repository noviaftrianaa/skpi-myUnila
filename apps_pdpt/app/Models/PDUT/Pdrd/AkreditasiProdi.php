<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class AkreditasiProdi extends AbstractionModel
{
    protected $table = 'pdrd.akreditasi_prodi';
    protected $primaryKey = 'asal_data';
    protected $fillable = [
    	'asal_data',		'id_akred',		'id_akreditasi_prodi',		'id_creator',		'id_lemb_akred',		'id_sms',		'id_updater',		'sk_akreditasi_prodi',		'soft_delete',		'tanggal_sk_akreditasi_prodi',		'tst_sk_akreditasi_prodi',
    ];
}
