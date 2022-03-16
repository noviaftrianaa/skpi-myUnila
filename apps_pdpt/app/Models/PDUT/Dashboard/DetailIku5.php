<?php

namespace App\Models\PDUT\Dashboard;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetailIku5 extends Model
{
    protected $table = 'dashboard.detail_iku_5';
    protected $primaryKey = 'id_detail_iku_5';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
        'id_detail_iku_5',
        'id_sms',
        'id_tahun_anggaran',
        'total_dosen_tetap',
        'total_luaran_kti',
        'total_luaran_karya_terapan',
        'total_luaran_karya_seni',
        'total_luaran_paten',
        'create_date',
        'last_update',
        'expired_date',
        'last_sync'
    ];
}
