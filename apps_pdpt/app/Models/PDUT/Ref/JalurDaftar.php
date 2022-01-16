<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class JalurDaftar extends Model
{
    protected $table = 'ref.jalur_daftar';
    protected $primaryKey = 'id_jalur_daftar';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_jalur_daftar',	'nm_jalur_daftar',	'create_date',	'last_update',	'expired_date',	'last_sync',
    ];
}