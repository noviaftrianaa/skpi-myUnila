<?php

namespace App\Models\PDUT\Pdrd;

use Illuminate\Database\Eloquent\Model;

class RegPd extends Model
{
    protected $table = 'pdrd.reg_pd';
    protected $primaryKey = 'id_reg_pd';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_reg_pd',	'id_sp',	'id_sms',	'id_pd',	'id_jns_daftar',	'id_jalur_daftar',	'id_pembiayaan',	'id_smt',	'tgl_masuk_sp',	'nipd',	'id_semester_masuk',	'id_pt_asal',	'nm_pt_asal',	'id_prodi_asal',	'nm_prodi_asal',	'id_jns_keluar',	'tgl_keluar',	'ket',	'skhun',	'no_peserta_ujian',	'no_seri_ijazah',	'asal_data_ijazah',	'bidang_mayor',	'bidang_minor',	'sks_diakui',	'jalur_skripsi',	'judul_skripsi',	'bln_awal_bimbingan',	'bln_akhir_bimbingan',	'sk_yudisium',	'tgl_sk_yudisium',	'ipk',	'sert_prof',	'a_pindah_mhs_asing',	'biaya_masuk_kuliah',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}