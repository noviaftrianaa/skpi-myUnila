<?php

namespace App\Models\PDUT\Logger;

use Illuminate\Database\Eloquent\Model;

class LogPengguna extends Model
{
    protected $table = 'logger.log_pengguna';
    protected $primaryKey = 'id_log_pengguna';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_log_pengguna',	'id_pengguna',	'id_aplikasi',	'count_login',	'ip_address',	'ket',	'waktu_login',	'waktu_logout',
    ];
}