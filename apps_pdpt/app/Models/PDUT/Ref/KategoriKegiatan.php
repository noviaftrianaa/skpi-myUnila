<?php

namespace App\Models\PDUT\Ref;

use Illuminate\Database\Eloquent\Model;

class KategoriKegiatan extends Model
{
    protected $table = 'ref.kategori_kegiatan';
    protected $primaryKey = 'id_katgiat';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_katgiat',	'id_induk_katgiat',	'id_jns_sdm',	'kode_kat_pak',	'kode_kat_bkd',	'nm_kat',	'kat_unsur',	'teks_judul',	'teks_sk',	'teks_tgl_sk',	'teks_lokasi',	'level_kat',	'sks_bkd',	'ak',	'ak_maks',	'satuan_nilai',	'ket',	'a_aktif',	'a_anak_bimb',	'a_judul',	'a_sk',	'a_peer_review',	'acuan_waktu',	'u_bkd',	'u_pak',	'create_date',	'last_update',	'expired_date',	'last_sync',
    ];
}