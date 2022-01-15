<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class JenisHapusBuku extends AbstractionModel
{
    protected $table = 'ref.jenis_hapus_buku';
    protected $primaryKey = 'id_hapus_buku';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_hapus_buku',	'ket_hapus_buku',
    ];
}