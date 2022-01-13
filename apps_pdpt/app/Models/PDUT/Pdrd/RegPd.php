<?php

namespace App\Models\PDUT\Ref;

use App\Models\AbstractionModel;
use Illuminate\Database\Eloquent\Model;

class RegPd extends AbstractionModel
{
    protected $table = 'pdrd.reg_pd';
    protected $primaryKey = 'a_pindah_mhs_asing';
    protected $fillable = [
    	'a_pindah_mhs_asing',		'asal_data_ijazah',		'biaya_masuk_kuliah',		'bidang_mayor',		'bidang_minor',		'bln_akhir_bimbingan',		'bln_awal_bimbingan',		'id_creator',		'id_jalur_daftar',		'id_jns_daftar',		'id_jns_keluar',		'id_pd',		'id_pembiayaan',		'id_prodi_asal',		'id_pt_asal',		'id_reg_pd',		'id_semester_masuk',		'id_sms',		'id_smt',		'id_sp',		'id_updater',		'ipk',		'jalur_skripsi',		'judul_skripsi',		'ket',		'nipd',		'nm_prodi_asal',		'nm_pt_asal',		'no_peserta_ujian',		'no_seri_ijazah',		'sert_prof',		'sk_yudisium',		'skhun',		'sks_diakui',		'soft_delete',		'tgl_keluar',		'tgl_masuk_sp',		'tgl_sk_yudisium',
    ];
}
