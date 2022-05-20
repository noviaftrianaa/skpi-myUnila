<?php

namespace App\Models\PDUT\Logger;

use Illuminate\Database\Eloquent\Model;

class LogAkses extends Model
{
    protected $table = 'logger.log_akses';
    protected $primaryKey = 'id_log_akses';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_log_akses',	'id_role_pengguna',	'id_log_login',	'menu_akses',	'method',	'request_list',	'waktu_akses',	'a_berhasil',	'ket',
    ];
}