<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class JenisKepanitiaan extends AbstractionModel
{
    protected $table = 'ref.jenis_kepanitiaan';
    protected $primaryKey = 'id_jns_panitia';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jns_panitia',	'nm_jns_panitia',
    ];
}