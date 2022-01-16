<?php
namespace App\Models\PDUT\Pdrd;
<<<<<<< HEAD
use App\Models\AbstractionModel;
=======

use Illuminate\Database\Eloquent\Model;
>>>>>>> 29b92362a86c20d3c55cf8d71ca9cb24b5d28045

class Publikasi extends Model
{
    protected $table = 'pdrd.publikasi';
    protected $primaryKey = 'id_publikasi';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
<<<<<<< HEAD
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
	'id_creator',
	'id_updater',
	'soft_delete',
=======
	'id_publikasi',	'id_jns_pub',	'judul',	'judul_chapter',	'judul_asli',	'abstrak',	'nama_jurnal',	'laman_jurnal',	'tgl_terbit',	'edisi',	'impact_jurnal',	'vol',	'no',	'hal',	'jml_hal',	'penerbit',	'kota',	'a_seminar',	'a_prosiding',	'dimensi',	'bahasa',	'no_paten',	'pemberi_paten',	'doi',	'isbn',	'issn',	'e_issn',	'url',	'ket',	'pengguna_produk_jasa',	'a_komersialisasi',	'stat_impor_sinta',	'quartile',	'id_kat_capaian',	'id_media_pub',	'id_litabmas',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
>>>>>>> 29b92362a86c20d3c55cf8d71ca9cb24b5d28045
    ];
}

