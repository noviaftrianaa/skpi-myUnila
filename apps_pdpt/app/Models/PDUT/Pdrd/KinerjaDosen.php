<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class KinerjaDosen extends Model
{
    protected $table = 'pdrd.kinerja_dosen';
    protected $primaryKey = 'id_reg_ptk';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_reg_ptk',	'id_smt',	'id_jabfung',	'stat_tugas',	'stat_belajar',	'masa_laks_tgs_awal',	'masa_laks_tgs_akhir',	'sks_total',	'sks_kinerja',	'sks_lebih',	'sks_kinerja_didik',	'sks_kinerja_ajar',	'sks_kinerja_lit',	'sks_kinerja_pengmas',	'sks_kinerja_penunjang',	'sks_kinerja_tambahan',	'sks_lebih_didik',	'sks_lebih_ajar',	'sks_lebih_lit',	'sks_lebih_pengmas',	'sks_lebih_tunjang',	'sks_lebih_tambahan',	'ewmp',	'simpulan_asesor',	'stat_kewajiban',	'penilai_1',	'penilai_2',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}