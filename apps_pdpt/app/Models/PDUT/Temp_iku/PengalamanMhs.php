<?php

namespace App\Models\PDUT\Temp_iku;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PengalamanMhs extends Model
{
    protected $table = 'temp_iku.pengalaman_mhs';
    protected $primaryKey = 'id_pengalaman_mhs';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
        'id_pengalaman_mhs',
        'id_pd',
        'id_thn_ajaran',
        'nm_mhs',
        'nm_fakultas',
        'nm_prodi',
        'stat_kegiatan',
        'nm_kegiatan',
        'nm_aktivitas',
        'nm_lokasi',
        'kat_kegiatan',
        'sks_mk',
        'peringkat',
        'nidn',
        'nm_pembimbing',
        'create_date',
        'id_creator',
        'last_update',
        'id_updater',
        'soft_delete',
        'last_sync'
    ];
}
