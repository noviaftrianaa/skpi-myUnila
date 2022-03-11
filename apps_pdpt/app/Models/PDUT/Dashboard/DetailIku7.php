<?php

namespace App\Models\PDUT\Dashboard;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DetailIku7 extends Model
{
    protected $table = 'dashboard.detail_iku_7';
    protected $primaryKey = 'id_detail_iku_7';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
        'id_detail_iku_7',
        'id_sms',
        'id_tahun_anggaran',
        'total_mk_case_method',
        'total_mk_team_base_project',
        'create_date',
        'last_update',
        'expired_date',
        'last_sync'
    ];
}
