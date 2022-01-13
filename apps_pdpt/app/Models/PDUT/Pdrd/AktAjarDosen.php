<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class AktAjarDosen extends AbstractionModel
{
    protected $table = 'pdrd.akt_ajar_dosen';
    protected $primaryKey = 'id_ajar';
    protected $fillable = [
    	'id_ajar',		'id_creator',		'id_jns_eval',		'id_katgiat',		'id_kls',		'id_reg_ptk',		'id_subst',		'id_updater',		'jml_mhs',		'jml_tm_real',		'jml_tm_renc',		'katgiat_ajar_id_katgiat',		'sks_prak_lap_subst',		'sks_prak_subst',		'sks_sim_subst',		'sks_subst_tot',		'sks_tm_subst',		'soft_delete',
    ];
}
