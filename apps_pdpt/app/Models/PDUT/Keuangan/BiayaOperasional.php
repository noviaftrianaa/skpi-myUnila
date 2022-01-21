<?php

namespace App\Models\PDUT\Keuangan;

use Illuminate\Database\Eloquent\Model;

class BiayaOperasional extends Model
{
    protected $table = 'keuangan.biaya_operasional';
    protected $primaryKey = 'id_bo';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_bo',	'id_tahun_anggaran',	'id_jns_keuangan',	'id_sms',	'sumber',	'total_biaya',	'tgl_operasional',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}