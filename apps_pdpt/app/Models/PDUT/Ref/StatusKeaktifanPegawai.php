<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class StatusKeaktifanPegawai extends AbstractionModel
{
    protected $table = 'ref.status_keaktifan_pegawai';
    protected $primaryKey = 'id_stat_aktif';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_stat_aktif',	'nm_stat_aktif',
    ];
}