<?php

namespace App\Models\PDUT\Dashboard;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetailIku1 extends Model
{
    protected $table = 'dashboard.detail_iku_1';
    protected $primaryKey = 'id_detail_iku_1';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
        'id_detail_iku_1',
        'id_sms',
        'id_tahun_anggaran',
        'total_bekerja',
        'total_tidak_bekerja',
        'total_wirausaha',
        'total_studi',
        'total_lulusan',
        'total_per_kategori',
        'persentase_iku',
        'create_date',
        'last_update',
        'expired_date',
        'last_sync'
    ];
}
