<?php

namespace App\Models\PDUT\Logger;

use Illuminate\Database\Eloquent\Model;

class SyncNilaiFeeder extends Model
{
    protected $table = 'logger.sync_nilai_feeder';
    protected $primaryKey = 'id_prodi';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_prodi',	'id_kelas',	'status',	'wkt_mulai',	'wkt_selesai',	'kode',
    ];
}