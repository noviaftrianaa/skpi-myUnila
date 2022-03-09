<?php

namespace App\Models\PDUT\Temp_iku;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Iku3Praktisi extends Model
{
    use HasFactory;
    protected $table = 'temp_iku.iku3praktisi';
    protected $primaryKey = 'id_praktisi';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'id_praktisi',
        'id_sms',
        'id_sdm',
        'id_rwy_kerja',
        'jns_pkrj',
        'bid_usaha',
        'area_kerja',
        'nm_jabatan',
        'instansi',
        'divisi',
        'desk_kerja',
        'tgl_mulai',
        'tgl_selesai',
        'lama_bekerja',
        'last_sync',
    ];
}
