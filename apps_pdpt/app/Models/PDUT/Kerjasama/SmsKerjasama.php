<?php

namespace App\Models\PDUT\Kerjasama;

use Illuminate\Database\Eloquent\Model;

class SmsKerjasama extends Model
{
    protected $table = 'kerjasama.sms_kerjasama';
    protected $primaryKey = 'id_sms_kerjasama';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_sms_kerjasama',	'id_tingkat_kerjasama',	'id_sumber_dana',	'id_stat_kerjasama',	'id_sms',	'id_mou',	'id_bid_kerjasama',	'id_kriteria_mitra',	'id_bntk_giat_kerjasama',	'hsl_prod_brg',	'hsl_prod_jasa',	'omzet_barang_per_bulan',	'omzet_jasa_per_bulan',	'prestasi_penghargaan',	'pangsa_psr_brg',	'pangsa_psr_jasa',	'besaran_kerjasama',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}