<?php

namespace App\Models\PDUT\Temp_iku;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TempDosenPengsert extends Model
{
    use HasFactory;
    protected $table = 'temp_iku.iku3_dsn_pengsert';
    protected $primaryKey = 'id_iku3_dsn_pengsert';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'id_iku3_dsn_pengsert',
        'id_dsn',
        'id_penghargaan',
        'id_sertifikasi',
        'nm',
        'jns',
        'tkt',
        'lemb',
        'tgl',
        'thn',
        'last_sync'
    ];
}
