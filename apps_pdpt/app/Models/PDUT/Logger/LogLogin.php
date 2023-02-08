<?php

namespace App\Models\PDUT\Logger;

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
	'waktu_login',
	'waktu_logout',
	'ip_address',
	'browser',
	'os',
	'a_sesi_aktif',
    ];

	public function pengguna()
	{
		return $this->belongsTo('App\Models\PDUT\Man_akses\Pengguna','id_pengguna','id_pengguna');
	}
}