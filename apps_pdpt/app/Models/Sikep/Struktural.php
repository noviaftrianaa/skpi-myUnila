<?php

namespace App\Models\Sikep;

use Illuminate\Database\Eloquent\Model;

class Struktural extends Model
{
    protected $table = 'sikep.jabstruk';
    protected $primaryKey = 'id_jabstruk';
    public $timestamps = false;
    public $incrementing = false;

    protected $fillable = [
        'id_jabstruk',
        'kd_jabstruk',
        'nm_jabstruk',

        'id_creator',
        'id_updater',
        'create_date',
        'last_update',
        'last_sync',
        'soft_delete',
    ];
}
