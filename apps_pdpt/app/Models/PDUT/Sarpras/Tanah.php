<?php

namespace App\Models\PDUT\Sarpras;

use Illuminate\Database\Eloquent\Model;

class Tanah extends Model
{
    protected $table = 'sarpras.tanah';
    protected $primaryKey = 'id_tanah';
    public $timestamps = false;
    public $incrementing = false;
    protected $fillable = [
	'id_tanah',	'id_stat_milik_sarpras',	'id_sms',	'id_jns_prasarana',	'id_hapus_buku',	'kd_kl',	'kd_satker',	'kd_brg',	'nup',	'kode_eselon1',	'nama_eselon1',	'kode_sub_satker',	'nama_sub_satker',	'panjang',	'lebar',	'luas',	'alamat',	'lintang',	'bujur',	'bmn_satker',	'bmn_kd_barang',	'bmn_nup',	'nm_prasarana',	'spesifikasi',	'tgl_perolehan',	'thn_produksi',	'nilai_perolehan',	'nilai_buku',	'merk',	'kd_kab_kota',	'nm_kab_kota',	'kd_prov',	'nm_prov',	'penggunaan',	'kondisi',	'no_dok_kepemilikan',	'dok_kepemilikan',	'jns_dok_kepemilikan',	'tgl_hapus_buku',	'asal_data',	'tgl_mutasi_keluar',	'batas',	'ket_tanah',	'create_date',	'id_creator',	'last_update',	'id_updater',	'soft_delete',	'last_sync',
    ];
}