<?php

namespace App\Models\Sikep;

use Illuminate\Database\Eloquent\Model;

class Fungsional extends Model
{
    protected $table = 'sikep.jabfung';
    protected $primaryKey = 'id_jabfung';
    public $timestamps = false;
    public $incrementing = false;

    protected $fillable = [
        'id_jabfung',
        'nm_jabfung',
        'kum',
        'ispak',
        'id_gol',
        'tipe',
        'grade',

        'id_creator',
        'id_updater',
        'create_date',
        'last_update',
        'last_sync',
        'soft_delete',
    ];
}
