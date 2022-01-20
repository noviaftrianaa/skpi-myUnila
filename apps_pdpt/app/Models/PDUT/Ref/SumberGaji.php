<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class SumberGaji extends Model
{
    protected $table = 'ref.sumber_gaji';
    protected $primaryKey = 'id_sumber_gaji';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_sumber_gaji',	'create_date',	'last_update',	'expired_date',	'last_sync',	'nm_sumber_gaji',
    ];
}