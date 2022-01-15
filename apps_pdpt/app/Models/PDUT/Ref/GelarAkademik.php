<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class GelarAkademik extends AbstractionModel
{
    protected $table = 'ref.gelar_akademik';
    protected $primaryKey = 'id_gelar_akad';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_gelar_akad',	'singkat_gelar',	'nm_gelar_akad',	'posisi_gelar',
    ];
}