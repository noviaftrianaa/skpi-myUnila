<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class AktMhs extends AbstractionModel
{
    protected $table = 'pdrd.akt_mhs';
    protected $primaryKey = 'a_komunal';
    protected $fillable = [
    	'a_komunal',		'id_akt_mhs',		'id_creator',		'id_jns_akt_mhs',		'id_sms',		'id_smt',		'id_updater',		'judul_akt_mhs',		'ket_akt',		'lokasi_kegiatan',		'sk_tugas',		'soft_delete',		'tgl_sk_tugas',
    ];
}
