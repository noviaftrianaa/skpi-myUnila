<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class Anak extends AbstractionModel
{
    protected $table = 'pdrd.anak';
    protected $primaryKey = 'id_anak';
    protected $fillable = [
    	'id_anak',		'id_creator',		'id_jenj_didik',		'id_sdm',		'id_stat_anak',		'id_updater',		'jk',		'nisn',		'nm_anak',		'soft_delete',		'tgl_lahir',		'thn_masuk',		'tmpt_lahir',
    ];
}
