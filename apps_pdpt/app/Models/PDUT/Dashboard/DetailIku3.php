<?php

namespace App\Models\PDUT\Dashboard;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetailIku3 extends Model
{
    protected $table = 'dashboard.detail_iku_3';
    protected $primaryKey = 'id_detail_iku_3';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
        'id_detail_iku_3',
        'id_sms',
        'id_tahun_anggaran',
        'total_dosen_nidk',
        'total_dosen_nidn',
        'total_diklat_qs100',
        'total_dosen_praktisi',
        'total_dosen_tridharma',
        'create_date',
        'last_update',
        'expired_date',
        'last_sync'
    ];
}
