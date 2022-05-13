<?php

namespace App\Models\PDUT\Temp_iku;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Iku8ProdiAkreditasiIntern extends Model
{
   protected $table = 'temp_iku.prodi_intern';
   protected $primarykey = 'id_prodi_intern';
   public $timestamps = false;
   public $incrementing = false;
   protected $fillable = [
       'id_prodi_intern',
       'id_sms',
       'id_akreditasi_prodi',
       'id_lemb_akred',
       'nm_fakultas',
       'nm_prodi',
       'nm_lemb',
       'ms_berlaku_akred',
       'create_date',
       'id_creator',
       'last_update',
       'id_updater',
       'soft_delete',
       'last_sync'
   ];
}
