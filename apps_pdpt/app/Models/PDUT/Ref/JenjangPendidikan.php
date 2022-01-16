<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class JenjangPendidikan extends AbstractionModel
{
    protected $table = 'ref.jenjang_pendidikan';
    protected $primaryKey = 'id_jenj_didik';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jenj_didik',	'nm_jenj_didik',	'u_jenj_lemb',	'u_jenj_org',
    ];
}