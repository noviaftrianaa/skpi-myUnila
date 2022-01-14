<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class NilaiTes extends AbstractionModel
{
    protected $table = 'pdrd.nilai_tes';
    protected $primaryKey = 'id_creator';
    protected $fillable = [
    	'id_creator',		'id_jns_tes',		'id_nilai_tes',		'id_sdm',		'id_updater',		'nm_nilai_tes',		'penyelenggara',		'skor',		'soft_delete',		'tgl_tes',		'thn',
    ];
}
