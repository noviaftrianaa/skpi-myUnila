<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class TahunAnggaran extends AbstractionModel
{
    protected $table = 'ref.tahun_anggaran';
    protected $primaryKey = 'id_tahun_anggaran';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_tahun_anggaran',	'nm_tahun_anggaran',	'a_periode_aktif',	'tgl_mulai',	'tgl_selesai',
    ];
}