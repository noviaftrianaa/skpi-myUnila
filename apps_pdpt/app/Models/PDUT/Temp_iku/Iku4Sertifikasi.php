<?php

namespace App\Models\PDUT\Temp_iku;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Iku4Sertifikasi extends Model
{
    use HasFactory;
    protected $table = 'temp_iku.iku4sertifikasi';
    protected $primaryKey = 'id_sertifikasi';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'id_sertifikasi',
        'id_rwy_sert',
        'id_sdm',
        'nm_jns_sert',
        'nm_bid_studi',
        'sk_sert',
        'thn_sert',
        'no_peserta',
        'nrg',
        'last_sync',
    ];
}
