<?php

namespace App\Models\PDUT\Temp_iku;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TempDosenTridharma extends Model
{
    use HasFactory;
    protected $table = 'temp_iku.iku3_dsn_tridharma';
    protected $primaryKey = 'id_iku3_dsn_tridharma';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'id_iku3_dsn_tridharma',
        'id_dsn',
        'id_peneltian',
        'id_pengabdian',
        'id_pengajaran',
        'nm_kegiatan',
        'wkt_awal_kegiatan',
        'wkt_akhir_kegiatan',
        'tmp_kegiatan',
        'last_sync',
    ];
}
