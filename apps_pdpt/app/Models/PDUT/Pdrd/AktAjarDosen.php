<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;

class AktAjarDosen extends AbstractionModel
{
    protected $table = 'pdrd.akt_ajar_dosen';
    protected $primaryKey = 'id_ajar';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_ajar',	'id_reg_ptk',	'id_subst',	'id_katgiat',	'katgiat_ajar_id_katgiat',	'id_jns_eval',	'id_kls',	'sks_subst_tot',	'sks_tm_subst',	'sks_prak_subst',	'sks_prak_lap_subst',	'sks_sim_subst',	'jml_tm_renc',	'jml_tm_real',	'jml_mhs',	'id_creator',	'id_updater',	'soft_delete',
    ];
}