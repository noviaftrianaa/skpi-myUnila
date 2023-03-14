<?php

namespace App\Models\Temp;


use Illuminate\Database\Eloquent\Model;

class Aplikasi extends Model
{
    protected $table = 'temp.aplikasi';
    protected $primaryKey = 'id_aplikasi';
    public $timestamps = false;
    public $incrementing = false;

    protected $fillable = [
        'id_aplikasi',
        'nm_aplikasi',
        'url',
        'teknologi',
        'administrator',
        'nm_pengguna',
        'nm_lemb',
        'a_internal',
        'create_date',
        'last_update',
        'last_sync',
        'soft_delete',
    ];
}
