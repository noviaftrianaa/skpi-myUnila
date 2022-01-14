<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class Publikasi extends AbstractionModel
{
    protected $table = 'pdrd.publikasi';
    protected $primaryKey = 'a_komersialisasi';
    protected $fillable = [
    	'a_komersialisasi',		'a_prosiding',		'a_seminar',		'abstrak',		'bahasa',		'dimensi',		'doi',		'e_issn',		'edisi',		'hal',		'id_creator',		'id_jns_pub',		'id_kat_capaian',		'id_litabmas',		'id_media_pub',		'id_publikasi',		'id_updater',		'impact_jurnal',		'isbn',		'issn',		'jml_hal',		'judul',		'judul_asli',		'judul_chapter',		'ket',		'kota',		'laman_jurnal',		'nama_jurnal',		'no',		'no_paten',		'pemberi_paten',		'penerbit',		'pengguna_produk_jasa',		'quartile',		'soft_delete',		'stat_impor_sinta',		'tgl_terbit',		'url',		'vol',
    ];
}
