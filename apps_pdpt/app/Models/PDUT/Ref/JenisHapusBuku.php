<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class JenisHapusBuku extends Model
{
    protected $table = 'ref.jenis_hapus_buku';
    protected $primaryKey = 'id_hapus_buku';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_hapus_buku',	'ket_hapus_buku',	'create_date',	'last_update',
    ];
}