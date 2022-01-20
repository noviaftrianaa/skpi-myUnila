<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class BidangPekerjaan extends Model
{
    protected $table = 'ref.bidang_pekerjaan';
    protected $primaryKey = 'id_bid_kerja';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_bid_kerja',	'nm_bid_kerja',	'create_date',	'last_update',	'expired_date',	'last_sync',
    ];
}