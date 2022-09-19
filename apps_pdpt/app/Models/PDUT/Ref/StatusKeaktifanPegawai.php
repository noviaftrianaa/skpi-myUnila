<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class StatusKeaktifanPegawai extends Model
{
    protected $table = 'ref.status_keaktifan_pegawai';
    protected $primaryKey = 'id_stat_aktif';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_stat_aktif',	'nm_stat_aktif',	'create_date',	'last_update',
    ];
}