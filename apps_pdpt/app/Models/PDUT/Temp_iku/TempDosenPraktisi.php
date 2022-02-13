<?php

namespace App\Models\PDUT\Temp_iku;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TempDosenPraktisi extends Model
{
    use HasFactory;
    protected $table = 'temp_iku.iku3_dsn_praktisi';
    protected $primaryKey = 'id_iku3_dsn_praktisi';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'id_iku3_dsn_praktisi',
        'id_dsn',
        'id_praktisi',
        'nm_institusi',
        'tkt_institusi',
        'tmp_penugasan',
        'wkt_awal_penugasan',
        'wkt_akhir_penugasan',
        'last_sync'
    ];
}
