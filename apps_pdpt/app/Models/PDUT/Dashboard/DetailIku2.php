<?php

namespace App\Models\PDUT\Dashboard;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetailIku2 extends Model
{
    protected $table = 'dashboard.detail_iku_2';
    protected $primaryKey = 'id_detail_iku_2';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
        'id_detail_iku_2',
        'id_sms',
        'id_tahun_anggaran',
        'total_mahasiswa',
        'total_tidak_masuk_kategori',
        'total_mbkm',
        'total_prestasi',
        'total_lebih_20sks',
        'total_luar_pt',
        'total_dalam_pt',
        'total_nasional_1',
        'total_nasional_2',
        'total_nasional_3',
        'total_internasional_1',
        'total_internasional_2',
        'total_internasional_3',
        'create_date',
        'last_update',
        'expired_date',
        'last_sync'
    ];
}
