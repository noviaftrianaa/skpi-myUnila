<?php

namespace App\Models\PDUT\Temp_iku;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TempIku7 extends Model
{
    protected $table = 'temp_iku.matkul';
    protected $primaryKey = 'id_temp_matkul';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
        'id_temp_matkul',
        'id_mk',
        'id_thn_ajaran',
        'nm_prodi',
        'nm_fakultas',
        'nm_mk',
        'sks_mk',
        'nm_dosen',
        'nidn',
        'status_iku',
        'create_date',
        'id_creator',
        'last_update',
        'id_updater',
        'soft_delete',
        'last_sync	'
    ];
}
