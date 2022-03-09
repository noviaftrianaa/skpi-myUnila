<?php

namespace App\Models\PDUT\Temp_iku;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Iku3Tridharma extends Model
{
    use HasFactory;
    protected $table = 'temp_iku.iku3tridharma';
    protected $primaryKey = 'id_tridharma';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'id_tridharma',
        'id_sms',
        'id_sdm',
        'id_thn_laks',
        'id_litabmas',
        'thn_laks_ke',
        'peran_litabmas',
        'jns_litabmas',
        'nm_kat',
        'nm_skim',
        'afiliasi',
        'nm_kel_bidang',
        'sk_tugas',
        'tgl_sk_tugas',
        'lama_kegiatan',
        'judul_litabmas',
        'lokasi_kegiatan',
        'last_sync',
    ];
}
