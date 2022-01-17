<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class BidangUsaha extends Model
{
    protected $table = 'ref.bidang_usaha';
    protected $primaryKey = 'id_bu';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_bu',	'nm_bu',	'create_date',	'last_update',	'expired_date',	'last_sync',
    ];
}