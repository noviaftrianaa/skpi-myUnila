<?php

namespace App\Models\PDUT\Dashboard;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetailIku4 extends Model
{
    protected $table = 'dashboard.detail_iku_4';
    protected $primaryKey = 'id_detail_iku_4';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
        'id_detail_iku_4',
        'id_sms',
        'id_tahun_anggaran',
        'total_dosen_nidn',
        'total_dosen_nidk',
        'total_dosen_s3',
        'total_dosen_praktisi',
        'total_dosen_tersertifikasi',
        'create_date',
        'last_update',
        'expired_date',
        'last_sync'
    ];
}
