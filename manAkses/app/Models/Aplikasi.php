<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Aplikasi extends Model
{
    protected $table = 'man_akses.aplikasi';
    protected $primaryKey = 'id_aplikasi';
    protected $fillable = ['id_organisasi','nm_aplikasi','ket_aplikasi','token_aplikasi','app_key','url','a_generate_menu','tgl_create','last_update','expired_date','last_sync'];
    public $timestamps = false;
    public $incrementing = false;
}
