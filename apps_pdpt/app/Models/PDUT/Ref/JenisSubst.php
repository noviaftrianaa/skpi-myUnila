<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class JenisSubst extends AbstractionModel
{
    protected $table = 'ref.jenis_subst';
    protected $primaryKey = 'id_jns_subst';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jns_subst',	'nm_jns_subst',
    ];
}