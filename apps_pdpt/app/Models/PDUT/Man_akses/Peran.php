<?php

namespace App\Models\PDUT\Man_akses;

use Illuminate\Database\Eloquent\Model;

class Peran extends Model
{
    protected $table = 'man_akses.peran';
    protected $primaryKey = 'id_peran';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
        'id_peran',
        'nm_peran',
        'a_perlu_sk',
        'tgl_create',
        'last_update',
        'expired_date',
        'last_sync',
    ];
    protected $hidden = [
        'tgl_create',
        'last_update',
        'expired_date',
        'last_sync'
    ];
}
