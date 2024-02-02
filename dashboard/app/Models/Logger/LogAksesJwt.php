<?php

namespace App\Models\Logger;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LogAksesJwt extends Model
{
  protected $table = 'logger.log_akses_jwt';
  protected $primaryKey = 'id_log_akses_jwt';
  public $timestamps = false;
  public $incrementing = false;
  protected $fillable = [
    'id_log_akses_jwt',
    'id_log_jwt',
    'id_log_jwt1',
    'menu_akses',
    'method',
    'request_list',
    'waktu_akses',
    'a_berhasil',
    'ket',
    'hasil_akses',
  ];
}
