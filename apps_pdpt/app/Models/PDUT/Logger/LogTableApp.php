<?php

namespace App\Models\PDUT\Logger;

use Illuminate\Database\Eloquent\Model;

class LogTableApp extends Model
{
    protected $table = 'logger.log_table_app';
    protected $primaryKey = 'id_log_table_app';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_log_table_app',	'id_aplikasi',	'id_pengguna',	'id_table_app',	'waktu_mulai',	'keterangan',
    ];
}