<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class SkimKegiatan extends AbstractionModel
{
    protected $table = 'ref.skim_kegiatan';
    protected $primaryKey = 'id_skim';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_skim',	'id_jenj_didik',	'nm_skim',	'nm_singkat_skim',	'kd_skim',	'tst_skim',	'jml_min_personil',	'jml_maks_personil',	'jml_maks_keikutsertaan',	'jml_maks_sbg_ketua',	'dana_min_thn_berjalan',	'dana_maks_thn_berjalan',	'ket_skim',	'deviasi_nilai',	'passing_grade',
    ];
}