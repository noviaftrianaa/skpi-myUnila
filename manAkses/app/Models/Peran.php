<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Peran extends Model
{
    protected $table = 'man_akses.peran';
    protected $fillable = ['id_peran','nm_peran','a_perlu_sk','tgl_create','last_update','expired_date','last_sync'];
    public $timestamps = false;
    public $incrementing = false;
}
