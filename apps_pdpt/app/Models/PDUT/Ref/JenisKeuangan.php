<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;

class JenisKeuangan extends AbstractionModel
{
    protected $table = 'ref.jenis_keuangan';
    protected $primaryKey = 'id_jns_keuangan';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jns_keuangan',	'nm_jns_keuangan',	'a_pengeluaran',	'a_pemasukan',
    ];
}