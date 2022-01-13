<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class KeaktifanPtk extends AbstractionModel
{
    protected $table = 'pdrd.keaktifan_ptk';
    protected $primaryKey = 'a_aktif_bln_1';
    protected $fillable = [
    	'a_aktif_bln_1',		'a_aktif_bln_10',		'a_aktif_bln_11',		'a_aktif_bln_12',		'a_aktif_bln_2',		'a_aktif_bln_3',		'a_aktif_bln_4',		'a_aktif_bln_5',		'a_aktif_bln_6',		'a_aktif_bln_7',		'a_aktif_bln_8',		'a_aktif_bln_9',		'a_sp_homebase',		'id_creator',		'id_reg_ptk',		'id_thn_ajaran',		'id_updater',		'soft_delete',
    ];
}
