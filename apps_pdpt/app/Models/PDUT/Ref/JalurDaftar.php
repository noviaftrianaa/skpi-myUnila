<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class JalurDaftar extends AbstractionModel
{
    protected $table = 'ref.jalur_daftar';
    protected $primaryKey = 'id_jalur_daftar';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jalur_daftar',	'nm_jalur_daftar',
    ];
}