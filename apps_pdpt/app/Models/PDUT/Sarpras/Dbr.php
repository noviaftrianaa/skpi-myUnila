<?php

namespace App\Models\PDUT\Sarpras;

use Illuminate\Database\Eloquent\Model;

class Dbr extends Model
{
    protected $table = 'sarpras.dbr';
    protected $primaryKey = 'id_ruang';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
        'id_ruang',
        'id_alat',
        'create_date',
        'id_creator',
        'last_update',
        'id_updater',
        'soft_delete',
        'last_sync',
    ];
}
