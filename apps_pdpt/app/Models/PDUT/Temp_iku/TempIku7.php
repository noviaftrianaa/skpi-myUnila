<?php

namespace App\Models\PDUT\Temp_iku;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TempKelas_Kp extends Model
{
    protected $table = 'temp_iku.kelas_kp';
    protected $primaryKey = 'id_mk';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
        'id_mk',
        'id_sdm',
        'id_sms',
        'nm_sdm',
        'nidn',
        'nm_mk',
        'nm_fakultas',
        'nm_prodi',
        'kode_prodi',
        'create_date',
        'id_creator',
        'last_update',
        'id_updater',
        'soft_delete',
        'last_sync	'
    ];
}