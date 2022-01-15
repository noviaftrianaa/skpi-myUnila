<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class JenisPendaftaran extends AbstractionModel
{
    protected $table = 'ref.jenis_pendaftaran';
    protected $primaryKey = 'id_jns_daftar';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jns_daftar',	'nm_jns_daftar',	'u_daftar_sekolah',	'u_daftar_rombel',
    ];
}