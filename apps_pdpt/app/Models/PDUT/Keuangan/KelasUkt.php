<?php

namespace App\Models\PDUT\Keuangan;

use Illuminate\Database\Eloquent\Model;

class KelasUkt extends Model
{
    protected $table = 'keuangan.kelas_ukt';
    protected $primaryKey = 'id_kelas_ukt';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
        'id_kelas_ukt',
        'nm_kelas_ukt',
        'nominal_ukt',
        'create_date',
        'id_creator',
        'last_update',
        'id_updater',
        'soft_delete',
        'last_sync'
    ];
}
