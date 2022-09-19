<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class StatusMahasiswa extends Model
{
    protected $table = 'ref.status_mahasiswa';
    protected $primaryKey = 'id_stat_mhs';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_stat_mhs',	'nm_stat_mhs',	'ket_stat_mhs',	'create_date',	'last_update',
    ];
}