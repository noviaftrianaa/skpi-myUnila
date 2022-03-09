<?php

namespace App\Models\PDUT\Temp_iku;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Iku3TridharmaQs100 extends Model
{
    use HasFactory;
    protected $table = 'temp_iku.iku3tridharma_qs100';
    protected $primaryKey = 'id_qs100';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'id_qs100',
        'id_sms',
        'id_sdm',
        'id_detasering',
        'nm_kat',
        'pt_sasaran',
        'tgl_mulai',
        'tgl_selesai',
        'bid_tgs',
        'desk_keg',
        'metode_laks',
        'sk_tugas',
        'tgl_sk_tugas',
        'last_sync',
    ];
}
