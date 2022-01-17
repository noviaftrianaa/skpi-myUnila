<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class Penghasilan extends Model
{
    protected $table = 'ref.penghasilan';
    protected $primaryKey = 'id_penghasilan';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_penghasilan',	'nm_penghasilan',	'create_date',	'last_update',	'expired_date',	'last_sync',
    ];
}