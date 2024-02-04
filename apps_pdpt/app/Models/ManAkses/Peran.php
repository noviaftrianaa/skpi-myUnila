<?php

namespace App\Models\ManAkses;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Peran extends Model
{
    use HasFactory;

    protected $table = 'man_akses.peran';
    protected $primaryKey = 'id_peran';
    public $timestamps = false;
    public $incrementing = false;

    protected $hidden = [
        'tgl_create',
        'last_update',
        'soft_delete',
        'id_updater',
        'last_sync'
    ];
}
