<?php

namespace App\Models\Logger;

use Illuminate\Database\Eloquent\Model;

class LogJwt extends Model
{
    protected $table = 'logger.log_jwt';
    protected $primaryKey = 'id_log_jwt';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
        'id_log_jwt',
        'id_pengguna',
        'id_aplikasi',
        'token_value',
        'url',
        'ip_address',
        'waktu_create',
        'waktu_expired',
    ];
}
