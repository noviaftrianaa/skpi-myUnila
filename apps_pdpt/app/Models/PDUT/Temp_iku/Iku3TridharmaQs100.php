<?php

namespace App\Models\PDUT\Temp_iku;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Iku3TridharmaQs100 extends Model
{
    use HasFactory;
    protected $table = 'temp_iku.iku3_tridharma_qs100';
    protected $primaryKey = 'id_iku3_tridharma_qs100';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'id_iku3_tridharma_qs100',
        'id_detasering',
        'id_sdm',
        'kategori_kegiatan',
        'perguruan_tinggi_sasaran',
        'tanggal_mulai',
        'tanggal_selesai',
        'bidang_tugas',
        'deskripsi_kegiatan',
        'metode_pelaksanaan',
        'nomor_sk_penugasan',
        'tanggal_sk_penugasan',
        'last_sync'
    ];
}
