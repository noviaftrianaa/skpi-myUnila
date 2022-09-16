<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class BidangKerjasama extends Model
{
    protected $table = 'ref.bidang_kerjasama';
    protected $primaryKey = 'id_bid_kerjasama';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_bid_kerjasama',	'nm_bid_kerjasama',	'create_date',	'last_update',	'expired_date',	'last_sync',
    ];
}