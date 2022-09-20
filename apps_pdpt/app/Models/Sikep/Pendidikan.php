<?php

namespace App\Models\Sikep;

use Illuminate\Database\Eloquent\Model;

class Pendidikan extends Model
{
    protected $table = 'sikep.pendidikan';
    protected $primaryKey = 'id_pend';
    public $timestamps = false;
    public $incrementing = false;

    protected $fillable = [
        'id_pend',
        'nm_pend',

        'id_creator',
        'id_updater',
        'create_date',
        'last_update',
        'last_sync',
        'soft_delete',
    ];
}
