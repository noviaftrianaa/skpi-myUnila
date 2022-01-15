<?php

namespace App\Models\PDUT\Dok;

use App\Models\AbstractionModel;

class DokNilaiTes extends AbstractionModel
{
    protected $table = 'dok.dok_nilai_tes';
    protected $primaryKey = 'id_nilai_tes';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_nilai_tes',	'id_dok',	'id_creator',	'id_updater',	'soft_delete',
    ];
}