<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AksesTableAplikasi extends Model
{
  protected $table = 'man_akses.akses_table_aplikasi';
  protected $keyType = 'string';
  protected $fillable = [
    'id_akses_table_app',
    'id_table_app',
    'id_aplikasi',
    'a_boleh_get',
    'a_boleh_insert',
    'a_boleh_show',
    'a_boleh_delete',
    'a_boleh_update',
    'a_aktif',
    'tgl_create',
    'last_update',
    'soft_delete',
    'last_sync',
    'id_updater',
  ];
  public $timestamps = false;
  public $incrementing = false;

  public function table_aplikasi()
  {
    return $this->belongsTo('App\Models\TableAplikasi', 'id_table_app', 'id_table_app');
  }

  public function aplikasi()
  {
    return $this->belongsTo('App\Models\Aplikasi', 'id_aplikasi', 'id_aplikasi');
  }
}
