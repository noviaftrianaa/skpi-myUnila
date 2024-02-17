<?php

namespace App\Models\Sync;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KelompokTabelAplikasi extends AbstractionModel
{
    use HasFactory;

  protected $keyType = 'string';
  protected $table = 'man_akses.kelompok_tabel_aplikasi';
  protected $primaryKey = 'id_kel_table_app';
  protected $fillable = [
    'id_kel_table_app',
    'id_table_app',
    'id_induk_kel_table_app',
    'tgl_create',
    'last_update',
    'expired_date',
    'last_sync',
    'url',
    'method',
    'enpoint',
    'level'
  ];
  public $timestamps = false;
  public $incrementing = false;
}
