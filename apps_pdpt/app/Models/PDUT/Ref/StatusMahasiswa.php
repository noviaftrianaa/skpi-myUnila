<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class StatusMahasiswa extends AbstractionModel
{
    protected $table = 'ref.status_mahasiswa';
    protected $primaryKey = 'id_stat_mhs';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_stat_mhs',	'nm_stat_mhs',	'ket_stat_mhs',
    ];
}