<?php

namespace App\Models\Sikep;

use Illuminate\Database\Eloquent\Model;

class Golongan extends Model
{
    protected $table = 'sikep.golongan';
    protected $primaryKey = 'id_gol';
    public $timestamps = false;
    public $incrementing = false;

    protected $fillable = [
        'id_gol',
        'kd_gol',
        'nm_gol',
        'nm_pangkat',
        'deskripsi',

        'id_creator',
        'id_updater',
        'create_date',
        'last_update',
        'last_sync',
        'soft_delete',
    ];
}
