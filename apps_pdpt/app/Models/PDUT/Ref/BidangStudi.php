<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class BidangStudi extends Model
{
    protected $table = 'ref.bidang_studi';
    protected $primaryKey = 'id_bid_studi';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_bid_studi',	'id_induk_bidang_studi',	'kode_bid_studi',	'nm_bid_studi',	'a_kel',	'a_jenj_paud',	'a_jenj_tk',	'a_jenj_sd',	'a_jenj_smp',	'a_jenj_sma',	'a_jenj_tinggi',	'create_date',	'last_update',	'expired_date',	'last_sync',
    ];
}