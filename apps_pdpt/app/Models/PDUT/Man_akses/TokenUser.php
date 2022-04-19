<?php

namespace App\Models\PDUT\Man_akses;

use Illuminate\Database\Eloquent\Model;

class TokenUser extends Model
{
    protected $table = 'man_akses.token_user';
    protected $primaryKey = 'id_token_user';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_token_user',	'id_token',	'passkey',	'meta_user',	'wkt_create',	'wkt_digunakan',	'user_id',	'user_origin',
    ];
}