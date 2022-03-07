<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class KeaktifanPtk extends AbstractionModel
{
    protected $table = 'pdrd.keaktifan_ptk';
    protected $primaryKey = 'id_reg_ptk';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_reg_ptk',
	'id_thn_ajaran',
	'a_sp_homebase',
	'a_aktif_bln_1',
	'a_aktif_bln_2',
	'a_aktif_bln_3',
	'a_aktif_bln_4',
	'a_aktif_bln_5',
	'a_aktif_bln_6',
	'a_aktif_bln_7',
	'a_aktif_bln_8',
	'a_aktif_bln_9',
	'a_aktif_bln_10',
	'a_aktif_bln_11',
	'a_aktif_bln_12',
	'create_date',
	'id_creator',
	'last_update',
	'id_updater',
	'soft_delete',
	'last_sync',
    ];
}
