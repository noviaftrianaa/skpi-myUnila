<?php

namespace App\Models\ManAkses;

use Illuminate\Database\Eloquent\Model;

class AccessToken extends Model
{
    protected $table = 'man_akses.access_token';
    protected $primaryKey = 'id_token';
    public $timestamps = false;
    public $incrementing = false;

    protected $fillable = [
        'id_token',
        'waktu_create',
        'waktu_expired',
        'keterangan',
        'token_value',
        'is_seq_uri',
        'is_reg_user',
        'base_url',
    ];
}
