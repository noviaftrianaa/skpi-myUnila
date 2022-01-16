<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class Pembiayaan extends Model
{
    protected $table = 'ref.pembiayaan';
    protected $primaryKey = 'id_pembiayaan';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_pembiayaan',	'nm_pembiayaan',	'create_date',	'last_update',	'expired_date',	'last_sync',
    ];
}