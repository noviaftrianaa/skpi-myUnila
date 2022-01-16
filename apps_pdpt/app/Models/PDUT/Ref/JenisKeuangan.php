<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class JenisKeuangan extends Model
{
    protected $table = 'ref.jenis_keuangan';
    protected $primaryKey = 'id_jns_keuangan';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jns_keuangan',	'nm_jns_keuangan',	'a_pengeluaran',	'a_pemasukan',	'create_date',	'last_update',	'expired_date',	'last_sync',
    ];
}