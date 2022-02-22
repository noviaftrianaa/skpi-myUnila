<?php

namespace App\Models\PDUT\Temp_iku;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Iku3Praktisi extends Model
{
    use HasFactory;
    protected $table = 'temp_iku.iku3_praktisi';
    protected $primaryKey = 'id_iku3_praktisi';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'id_iku3_praktisi',
        'id_rwy_kerja',
        'id_sdm',
        'bidang_usaha',
        'jenis_pekerjaan',
        'jabatan',
        'instansi',
        'divisi',
        'deskripsi_kerja',
        'mulai_bekerja',
        'selesai_bekerja',
        'lama_bekerja',
        'area_pekerjaan',
        'last_sync'
    ];
}
