<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class JenisKesejahteraan extends AbstractionModel
{
    protected $table = 'ref.jenis_kesejahteraan';
    protected $primaryKey = 'id_jns_sejahtera';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jns_sejahtera',	'nm_jns_sejahtera',
    ];
}