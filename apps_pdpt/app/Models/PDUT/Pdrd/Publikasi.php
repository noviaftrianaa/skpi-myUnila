<?php

namespace App\Models\PDUT\Pdrd;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class Publikasi extends AbstractionModel
{
    protected $table = 'pdrd.publikasi';
    protected $primaryKey = 'id_publikasi';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_publikasi',
	'id_jns_pub',
	'judul',
	'judul_chapter',
	'judul_asli',
	'abstrak',
	'nama_jurnal',
	'laman_jurnal',
	'tgl_terbit',
	'edisi',
	'impact_jurnal',
	'vol',
	'no',
	'hal',
	'jml_hal',
	'penerbit',
	'kota',
	'a_seminar',
	'a_prosiding',
	'dimensi',
	'bahasa',
	'no_paten',
	'pemberi_paten',
	'doi',
	'isbn',
	'issn',
	'e_issn',
	'url',
	'ket',
	'pengguna_produk_jasa',
	'a_komersialisasi',
	'stat_impor_sinta',
	'quartile',
	'id_kat_capaian',
	'id_media_pub',
	'id_litabmas',
	'create_date',
	'id_creator',
	'last_update',
	'id_updater',
	'soft_delete',
	'last_sync',
    ];
}
