<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class KelompokBidang extends Model
{
    protected $table = 'ref.kelompok_bidang';
    protected $primaryKey = 'id_kel_bidang';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_kel_bidang',	'kode_kel_bidang',	'nm_kel_bidang',	'u_sma',	'u_smk',	'u_pt',	'u_iptek',	'u_kepakaran',	'kat_kel',	'ket_kel_bidang',	'a_leaf_node',	'id_induk_bidang',	'create_date',	'last_update',
    ];
}