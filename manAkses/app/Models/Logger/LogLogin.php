<?php

namespace App\Models\Logger;

use Illuminate\Database\Eloquent\Model;

class LogLogin extends Model
{
    protected $table = 'logger.log_login';
    protected $primaryKey = 'id_log_login';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
        'id_log_login',
        'id_aplikasi',
        'id_pengguna',
        'username',
        'email',
        'status',
        'ip_address',
        'user_agent',
        'browser',
        'os',
        'a_sesi_aktif',
        'waktu_login',
    ];
}
