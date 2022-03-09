<?php

namespace App\Models\PDUT\Temp_iku;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Iku4Pendidikan extends Model
{
    use HasFactory;
    protected $table = 'temp_iku.iku4pendidikan';
    protected $primaryKey = 'id_pendidikan';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'id_pendidikan',
        'id_sms',
        'id_sdm',
        'id_rwy_didik_formal',
        'nm_jenj_didik',
        'prodi',
        'nm_gelar_akad',
        'nm_bid_studi',
        'nm_sp_formal',
        'thn_masuk',
        'thn_lulus',
        'last_sync',
    ];
}
