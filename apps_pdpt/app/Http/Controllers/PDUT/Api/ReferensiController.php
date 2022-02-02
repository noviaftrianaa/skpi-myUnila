<?php

namespace App\Http\Controllers\PDUT\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReferensiController extends Controller
{
   
    public function wilayah(Request $request)
    {

        $listdata = DB::SELECT("
            SELECT
                wil.id_wil, wil.id_negara, wil.nm_wil, level.nm_level_wilayah, wil.asal_wil, wil.kode_bps,
                wil.kode_dagri, wil.kode_keu, wil.id_induk_wilayah, wil.id_level_wil, wil.create_date, wil.last_update
                FROM ref.wilayah AS wil WITH(NOLOCK)
                JOIN ref.level_wilayah AS level WITH(NOLOCK) ON level.id_level_wil = wil.id_level_wil
                    AND level.expired_date IS NULL
                WHERE wil.expired_date IS NULL
        ");

        foreach ($listdata as $each_data) {
            $data[] = [
                'id_wil' => $each_data->id_wil,
                'id_negara' => $each_data->id_negara,
                'nm_wil' => $each_data->nm_wil,
                'asal_wil' => $each_data->asal_wil,
                'kode_bps' => $each_data->kode_bps,
                'kode_dagri' => $each_data->kode_dagri,
                'kode_keu' => $each_data->kode_keu,
                'id_level_wil' => $each_data->id_level_wil,
                'id_induk_wilayah' => $each_data->id_induk_wilayah,
                'nm_level_wilayah' => $each_data->nm_level_wilayah,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function tse(Request $request)
    {
        $listdata = DB::table('ref.tse')->select('id_tse', 'kode_tse', 'nm_tse', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_tse' => $each_data->id_tse,
                'kode_tse' => $each_data->kode_tse,
                'nm_tse' => $each_data->nm_tse,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function tingkat_prestasi(Request $request)
    {
        $listdata = DB::table('ref.tingkat_prestasi')->select('id_tkt_prestasi', 'nm_tkt_prestasi', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_tkt_prestasi' => $each_data->id_tkt_prestasi,
                'nm_tkt_prestasi' => $each_data->nm_tkt_prestasi,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function tingkat_penghargaan(Request $request)
    {
        $listdata = DB::table('ref.tingkat_penghargaan')->select('id_tkt_penghargaan', 'nm_tkt_penghargaan', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_tkt_penghargaan' => $each_data->id_tkt_penghargaan,
                'nm_tkt_penghargaan' => $each_data->nm_tkt_penghargaan,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function tahun_anggaran(Request $request)
    {
        $listdata = DB::table('ref.tahun_anggaran')->select('id_tahun_anggaran', 'nm_tahun_anggaran', 'a_periode_aktif', 'tgl_mulai', 'tgl_selesai', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_tahun_anggaran' => $each_data->id_tahun_anggaran,
                'nm_tahun_anggaran' => $each_data->nm_tahun_anggaran,
                'a_periode_aktif' => $each_data->a_periode_aktif,
                'tgl_mulai' => $each_data->tgl_mulai,
                'tgl_selesai' => $each_data->tgl_selesai,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function tahun_ajaran(Request $request)
    {
        $listdata = DB::table('ref.tahun_ajaran')->select('id_thn_ajaran', 'nm_thn_ajaran', 'a_periode_aktif', 'tgl_mulai', 'tgl_selesai', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_thn_ajaran' => $each_data->id_thn_ajaran,
                'nm_thn_ajaran' => $each_data->nm_thn_ajaran,
                'a_periode_aktif' => $each_data->a_periode_aktif,
                'tgl_mulai' => $each_data->tgl_mulai,
                'tgl_selesai' => $each_data->tgl_selesai,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function sumber_listrik(Request $request)
    {
        $listdata = DB::table('ref.sumber_listrik')->select('id_sumber_listrik', 'create_date', 'last_update', 'nm_sumber_listrik')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_sumber_listrik' => $each_data->id_sumber_listrik,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
                'nm_sumber_listrik' => $each_data->nm_sumber_listrik,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
    
    public function sumber_gaji(Request $request)
    {
        $listdata = DB::table('ref.sumber_gaji')->select('id_sumber_gaji', 'create_date', 'last_update', 'nm_sumber_gaji')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_sumber_gaji' => $each_data->id_sumber_gaji,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
                'nm_sumber_gaji' => $each_data->nm_sumber_gaji,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
  
    public function sumber_dana(Request $request)
    {
        $listdata = DB::table('ref.sumber_dana')->select('id_sumber_dana', 'nm_sumber_dana', 'u_blockgrant', 'u_beasiswa', 'u_lit', 'u_unit_usaha', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_sumber_dana' => $each_data->id_sumber_dana,
                'nm_sumber_dana' => $each_data->nm_sumber_dana,
                'u_blockgrant' => $each_data->u_blockgrant,
                'u_beasiswa' => $each_data->u_beasiswa,
                'u_lit' => $each_data->u_lit,
                'u_unit_usaha' => $each_data->u_unit_usaha,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function sumber_air(Request $request)
    {
        $listdata = DB::table('ref.sumber_air')->select('id_sumber_air', 'create_date', 'last_update', 'nm_sumber_air')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_sumber_air' => $each_data->id_sumber_air,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
                'nm_sumber_air' => $each_data->nm_sumber_air,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
    
    public function status_milik_sarpras(Request $request)
    {
        $listdata = DB::table('ref.status_milik_sarpras')->select('id_stat_milik_sarpras', 'nm_stat_milik_sarpras', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_stat_milik_sarpras' => $each_data->id_stat_milik_sarpras,
                'nm_stat_milik_sarpras' => $each_data->nm_stat_milik_sarpras,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function status_mahasiswa(Request $request)
    {
        $listdata = DB::table('ref.status_mahasiswa')->select('id_stat_mhs', 'nm_stat_mhs', 'ket_stat_mhs', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_stat_mhs' => $each_data->id_stat_mhs,
                'nm_stat_mhs' => $each_data->nm_stat_mhs,
                'ket_stat_mhs' => $each_data->ket_stat_mhs,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
    
    public function status_kepemilikan(Request $request)
    {
        $listdata = DB::table('ref.status_kepemilikan')->select('id_stat_milik', 'nm_stat_milik', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_stat_milik' => $each_data->id_stat_milik,
                'nm_stat_milik' => $each_data->nm_stat_milik,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function status_kepegawaian(Request $request)
    {
        $listdata = DB::table('ref.status_kepegawaian')->select('id_stat_pegawai', 'nm_stat_pegawai', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_stat_pegawai' => $each_data->id_stat_pegawai,
                'nm_stat_pegawai' => $each_data->nm_stat_pegawai,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function status_keaktifan_pegawai(Request $request)
    {
        $listdata = DB::table('ref.status_keaktifan_pegawai')->select('id_stat_aktif', 'nm_stat_aktif', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_stat_aktif' => $each_data->id_stat_aktif,
                'nm_stat_aktif' => $each_data->nm_stat_aktif,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
    
    public function status_anak(Request $request)
    {
        $listdata = DB::table('ref.status_anak')->select('id_stat_anak', 'nm_stat_anak', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_stat_anak' => $each_data->id_stat_anak,
                'nm_stat_anak' => $each_data->nm_stat_anak,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function skim_kegiatan(Request $request)
    {
        $listdata = DB::table('ref.skim_kegiatan')->select('id_skim', 'id_jenj_didik', 'nm_skim', 'nm_singkat_skim', 'kd_skim', 'tst_skim', 'jml_min_personil', 'jml_maks_personil', 'jml_maks_keikutsertaan', 'jml_maks_sbg_ketua', 'dana_min_thn_berjalan', 'dana_maks_thn_berjalan', 'ket_skim', 'deviasi_nilai', 'passing_grade', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_skim' => $each_data->id_skim,
                'id_jenj_didik' => $each_data->id_jenj_didik,
                'nm_skim' => $each_data->nm_skim,
                'nm_singkat_skim' => $each_data->nm_singkat_skim,
                'kd_skim' => $each_data->kd_skim,
                'tst_skim' => $each_data->tst_skim,
                'jml_min_personil' => $each_data->jml_min_personil,
                'jml_maks_personil' => $each_data->jml_maks_personil,
                'jml_maks_keikutsertaan' => $each_data->jml_maks_keikutsertaan,
                'jml_maks_sbg_ketua' => $each_data->jml_maks_sbg_ketua,
                'dana_min_thn_berjalan' => $each_data->dana_min_thn_berjalan,
                'dana_maks_thn_berjalan' => $each_data->dana_maks_thn_berjalan,
                'ket_skim' => $each_data->ket_skim,
                'deviasi_nilai' => $each_data->deviasi_nilai,
                'passing_grade' => $each_data->passing_grade,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function semester(Request $request)
    {
        $listdata = DB::table('ref.semester')->select('id_smt', 'id_thn_ajaran', 'nm_smt', 'smt', 'a_periode_aktif', 'tgl_mulai', 'tgl_selesai', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_smt' => $each_data->id_smt,
                'id_thn_ajaran' => $each_data->id_thn_ajaran,
                'nm_smt' => $each_data->nm_smt,
                'smt' => $each_data->smt,
                'a_periode_aktif' => $each_data->a_periode_aktif,
                'tgl_mulai' => $each_data->tgl_mulai,
                'tgl_selesai' => $each_data->tgl_selesai,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function satuan(Request $request)
    {
        $listdata = DB::table('ref.satuan')->select('kd_satuan', 'nm_satuan', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'kd_satuan' => $each_data->kd_satuan,
                'nm_satuan' => $each_data->nm_satuan,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
    
    public function peta_katgiat_jnspub(Request $request)
    {
        $listdata = DB::table('ref.peta_katgiat_jnspub')->select('id_katgiat', 'id_jns_pub', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_katgiat' => $each_data->id_katgiat,
                'id_jns_pub' => $each_data->id_jns_pub,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
    
    public function peta_katgiat_jnsdok(Request $request)
    {
        $listdata = DB::table('ref.peta_katgiat_jnsdok')->select('id_katgiat', 'id_jns_dok', 'a_wajib', 'no_urut', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_katgiat' => $each_data->id_katgiat,
                'id_jns_dok' => $each_data->id_jns_dok,
                'a_wajib' => $each_data->a_wajib,
                'no_urut' => $each_data->no_urut,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function peta_katgiat_jabfung(Request $request)
    {
        $listdata = DB::table('ref.peta_katgiat_jabfung')->select('id_katgiat', 'id_jabfung', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_katgiat' => $each_data->id_katgiat,
                'id_jabfung' => $each_data->id_jabfung,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
    
    public function penghasilan(Request $request)
    {
        $listdata = DB::table('ref.penghasilan')->select('id_penghasilan', 'nm_penghasilan', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_penghasilan' => $each_data->id_penghasilan,
                'nm_penghasilan' => $each_data->nm_penghasilan,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
    
    public function pembiayaan(Request $request)
    {
        $listdata = DB::table('ref.pembiayaan')->select('id_pembiayaan', 'nm_pembiayaan', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_pembiayaan' => $each_data->id_pembiayaan,
                'nm_pembiayaan' => $each_data->nm_pembiayaan,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
    
    public function pekerjaan(Request $request)
    {
        $listdata = DB::table('ref.pekerjaan')->select('id_pekerjaan', 'nm_pekerjaan', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_pekerjaan' => $each_data->id_pekerjaan,
                'nm_pekerjaan' => $each_data->nm_pekerjaan,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function pangkat_golongan(Request $request)
    {
        $listdata = DB::table('ref.pangkat_golongan')->select('id_pangkat_gol', 'kode_gol', 'nm_pangkat', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_pangkat_gol' => $each_data->id_pangkat_gol,
                'kode_gol' => $each_data->kode_gol,
                'nm_pangkat' => $each_data->nm_pangkat,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function nilai_akred(Request $request)
    {
        $listdata = DB::table('ref.nilai_akred')->select('id_akred', 'nm_akred', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_akred' => $each_data->id_akred,
                'nm_akred' => $each_data->nm_akred,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }

    public function negara(Request $request)
    {
        $listdata = DB::table('ref.negara')->select('id_negara', 'nm_negara', 'a_ln', 'benua', 'create_date', 'last_update')->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_negara' => $each_data->id_negara,
                'nm_negara' => $each_data->nm_negara,
                'a_ln' => $each_data->a_ln,
                'benua' => $each_data->benua,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function media_publikasi(Request $request)
    {
        $listdata = DB::table('ref.media_publikasi')->select('id_media_pub', 'id_jns_media', 'id_kel_bidang', 'id_sp', 'id_negara', 'nm_media_pub', 'bentuk_media_pub', 'grade_sinta', 'jns_penerbit', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_media_pub' => $each_data->id_media_pub,
                'id_jns_media' => $each_data->id_jns_media,
                'id_kel_bidang' => $each_data->id_kel_bidang,
                'id_sp' => $each_data->id_sp,
                'id_negara' => $each_data->id_negara,
                'nm_media_pub' => $each_data->nm_media_pub,
                'bentuk_media_pub' => $each_data->bentuk_media_pub,
                'grade_sinta' => $each_data->grade_sinta,
                'jns_penerbit' => $each_data->jns_penerbit,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
  
    public function level_wilayah(Request $request)
    {
        $listdata = DB::table('ref.level_wilayah')->select('id_level_wil', 'nm_level_wilayah', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_level_wil' => $each_data->id_level_wil,
                'nm_level_wilayah' => $each_data->nm_level_wilayah,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function lembaga_pengangkat(Request $request)
    {
        $listdata = DB::table('ref.lembaga_pengangkat')->select('id_lemb_angkat', 'nm_lemb_angkat', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_lemb_angkat' => $each_data->id_lemb_angkat,
                'nm_lemb_angkat' => $each_data->nm_lemb_angkat,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function lembaga_akred(Request $request)
    {
        $listdata = DB::table('ref.lembaga_akred')->select('id_lemb_akred', 'nm_lemb', 'jln', 'rt', 'rw', 'nm_dsn', 'ds_kel', 'kode_pos', 'lintang', 'bujur', 'no_tel', 'no_fax', 'email', 'website', 'kd_kl', 'kd_satker', 'tgl_mulai_beroperasi', 'ket', 'target_akred', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_lemb_akred' => $each_data->id_lemb_akred,
                'nm_lemb' => $each_data->nm_lemb,
                'jln' => $each_data->jln,
                'rt' => $each_data->rt,
                'rw' => $each_data->rw,
                'nm_dsn' => $each_data->nm_dsn,
                'ds_kel' => $each_data->ds_kel,
                'kode_pos' => $each_data->kode_pos,
                'lintang' => $each_data->lintang,
                'bujur' => $each_data->bujur,
                'no_tel' => $each_data->no_tel,
                'no_fax' => $each_data->no_fax,
                'email' => $each_data->email,
                'website' => $each_data->website,
                'kd_kl' => $each_data->kd_kl,
                'kd_satker' => $each_data->kd_satker,
                'tgl_mulai_beroperasi' => $each_data->tgl_mulai_beroperasi,
                'ket' => $each_data->ket,
                'target_akred' => $each_data->target_akred,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function kelompok_usaha(Request $request)
    {
        $listdata = DB::table('ref.kelompok_usaha')->select('id_kel_usaha', 'nm_kel_usaha', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_kel_usaha' => $each_data->id_kel_usaha,
                'nm_kel_usaha' => $each_data->nm_kel_usaha,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
  
    public function kelompok_profesi(Request $request)
    {
        $listdata = DB::table('ref.kelompok_profesi')->select('id_kel_prof', 'nm_kel_prof', 'ket_kel_prof', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_kel_prof' => $each_data->id_kel_prof,
                'nm_kel_prof' => $each_data->nm_kel_prof,
                'ket_kel_prof' => $each_data->ket_kel_prof,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
    
    public function kelompok_bidang(Request $request)
    {
        $listdata = DB::table('ref.kelompok_bidang')->select('id_kel_bidang', 'kode_kel_bidang', 'nm_kel_bidang', 'u_sma', 'u_smk', 'u_pt', 'u_iptek', 'u_kepakaran', 'kat_kel', 'ket_kel_bidang', 'a_leaf_node', 'id_induk_bidang', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_kel_bidang' => $each_data->id_kel_bidang,
                'kode_kel_bidang' => $each_data->kode_kel_bidang,
                'nm_kel_bidang' => $each_data->nm_kel_bidang,
                'u_sma' => $each_data->u_sma,
                'u_smk' => $each_data->u_smk,
                'u_pt' => $each_data->u_pt,
                'u_iptek' => $each_data->u_iptek,
                'u_kepakaran' => $each_data->u_kepakaran,
                'kat_kel' => $each_data->kat_kel,
                'ket_kel_bidang' => $each_data->ket_kel_bidang,
                'a_leaf_node' => $each_data->a_leaf_node,
                'id_induk_bidang' => $each_data->id_induk_bidang,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
    
    public function kebutuhan_khusus(Request $request)
    {
        $listdata = DB::table('ref.kebutuhan_khusus')->select('id_kk', 'nm_kk', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_kk' => $each_data->id_kk,
                'nm_kk' => $each_data->nm_kk,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function keahlian_lab(Request $request)
    {
        $listdata = DB::table('ref.keahlian_lab')->select('id_keahlian_lab', 'nm_keahlian_lab', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_keahlian_lab' => $each_data->id_keahlian_lab,
                'nm_keahlian_lab' => $each_data->nm_keahlian_lab,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function kbli(Request $request)
    {
        $listdata = DB::table('ref.kbli')->select('id_kbli', 'id_induk_kbli', 'kategori', 'kode', 'judul', 'lv_kbli', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_kbli' => $each_data->id_kbli,
                'id_induk_kbli' => $each_data->id_induk_kbli,
                'kategori' => $each_data->kategori,
                'kode' => $each_data->kode,
                'judul' => $each_data->judul,
                'lv_kbli' => $each_data->lv_kbli,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function kategori_tabel(Request $request)
    {
        $listdata = DB::table('ref.kategori_tabel')->select('id_kat_tabel', 'id_katgiat', 'nm_schema', 'nm_tbl', 'konfig_kolom', 'ket', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_kat_tabel' => $each_data->id_kat_tabel,
                'id_katgiat' => $each_data->id_katgiat,
                'nm_schema' => $each_data->nm_schema,
                'nm_tbl' => $each_data->nm_tbl,
                'konfig_kolom' => $each_data->konfig_kolom,
                'ket' => $each_data->ket,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function kategori_kegiatan(Request $request)
    {
        $listdata = DB::table('ref.kategori_kegiatan')->select('id_katgiat', 'id_induk_katgiat', 'id_jns_sdm', 'kode_kat_pak', 'kode_kat_bkd', 'nm_kat', 'kat_unsur', 'teks_judul', 'teks_sk', 'teks_tgl_sk', 'teks_lokasi', 'level_kat', 'sks_bkd', 'ak', 'ak_maks', 'satuan_nilai', 'ket', 'a_aktif', 'a_anak_bimb', 'a_judul', 'a_sk', 'a_peer_review', 'acuan_waktu', 'u_bkd', 'u_pak', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_katgiat' => $each_data->id_katgiat,
                'id_induk_katgiat' => $each_data->id_induk_katgiat,
                'id_jns_sdm' => $each_data->id_jns_sdm,
                'kode_kat_pak' => $each_data->kode_kat_pak,
                'kode_kat_bkd' => $each_data->kode_kat_bkd,
                'nm_kat' => $each_data->nm_kat,
                'kat_unsur' => $each_data->kat_unsur,
                'teks_judul' => $each_data->teks_judul,
                'teks_sk' => $each_data->teks_sk,
                'teks_tgl_sk' => $each_data->teks_tgl_sk,
                'teks_lokasi' => $each_data->teks_lokasi,
                'level_kat' => $each_data->level_kat,
                'sks_bkd' => $each_data->sks_bkd,
                'ak' => $each_data->ak,
                'ak_maks' => $each_data->ak_maks,
                'satuan_nilai' => $each_data->satuan_nilai,
                'ket' => $each_data->ket,
                'a_aktif' => $each_data->a_aktif,
                'a_anak_bimb' => $each_data->a_anak_bimb,
                'a_judul' => $each_data->a_judul,
                'a_sk' => $each_data->a_sk,
                'a_peer_review' => $each_data->a_peer_review,
                'acuan_waktu' => $each_data->acuan_waktu,
                'u_bkd' => $each_data->u_bkd,
                'u_pak' => $each_data->u_pak,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function kategori_capaian_luaran(Request $request)
    {
        $listdata = DB::table('ref.kategori_capaian_luaran')->select('id_kat_capaian', 'nm_kat_capaian', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_kat_capaian' => $each_data->id_kat_capaian,
                'nm_kat_capaian' => $each_data->nm_kat_capaian,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function jurusan(Request $request)
    {
        $listdata = DB::table('ref.jurusan')->select('id_jur', 'nm_jur', 'nm_intl_jur', 'u_sma', 'u_smk', 'u_pt', 'u_slb', 'id_induk_jurusan', 'id_jenj_didik', 'id_kel_bidang', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jur' => $each_data->id_jur,
                'nm_jur' => $each_data->nm_jur,
                'nm_intl_jur' => $each_data->nm_intl_jur,
                'u_sma' => $each_data->u_sma,
                'u_smk' => $each_data->u_smk,
                'u_pt' => $each_data->u_pt,
                'u_slb' => $each_data->u_slb,
                'id_induk_jurusan' => $each_data->id_induk_jurusan,
                'id_jenj_didik' => $each_data->id_jenj_didik,
                'id_kel_bidang' => $each_data->id_kel_bidang,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function jenjang_pendidikan(Request $request)
    {
        $listdata = DB::table('ref.jenjang_pendidikan')->select('id_jenj_didik', 'nm_jenj_didik', 'u_jenj_lemb', 'u_jenj_org', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jenj_didik' => $each_data->id_jenj_didik,
                'nm_jenj_didik' => $each_data->nm_jenj_didik,
                'u_jenj_lemb' => $each_data->u_jenj_lemb,
                'u_jenj_org' => $each_data->u_jenj_org,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function jenis_tunjangan(Request $request)
    {
        $listdata = DB::table('ref.jenis_tunjangan')->select('id_jns_tunj', 'nm_jns_tunj', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jns_tunj' => $each_data->id_jns_tunj,
                'nm_jns_tunj' => $each_data->nm_jns_tunj,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function jenis_tinggal(Request $request)
    {
        $listdata = DB::table('ref.jenis_tinggal')->select('id_jns_tinggal', 'nm_jns_tinggal', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jns_tinggal' => $each_data->id_jns_tinggal,
                'nm_jns_tinggal' => $each_data->nm_jns_tinggal,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function jenis_tes(Request $request)
    {
        $listdata = DB::table('ref.jenis_tes')->select('id_jns_tes', 'nm_jns_tes', 'ket', 'nilai_maks', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jns_tes' => $each_data->id_jns_tes,
                'nm_jns_tes' => $each_data->nm_jns_tes,
                'ket' => $each_data->ket,
                'nilai_maks' => $each_data->nilai_maks,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
    
    public function jenis_subst(Request $request)
    {
        $listdata = DB::table('ref.jenis_subst')->select('id_jns_subst', 'nm_jns_subst', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jns_subst' => $each_data->id_jns_subst,
                'nm_jns_subst' => $each_data->nm_jns_subst,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function jenis_sms(Request $request)
    {
        $listdata = DB::table('ref.jenis_sms')->select('id_jns_sms', 'nm_jns_sms', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jns_sms' => $each_data->id_jns_sms,
                'nm_jns_sms' => $each_data->nm_jns_sms,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
    
    public function jenis_sert(Request $request)
    {
        $listdata = DB::table('ref.jenis_sert')->select('id_jns_sert', 'nm_jns_sert', 'u_prof_guru', 'u_kepsek', 'u_laboran', 'u_prof_dosen', 'u_lembaga', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jns_sert' => $each_data->id_jns_sert,
                'nm_jns_sert' => $each_data->nm_jns_sert,
                'u_prof_guru' => $each_data->u_prof_guru,
                'u_kepsek' => $each_data->u_kepsek,
                'u_laboran' => $each_data->u_laboran,
                'u_prof_dosen' => $each_data->u_prof_dosen,
                'u_lembaga' => $each_data->u_lembaga,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function jenis_sdm(Request $request)
    {
        $listdata = DB::table('ref.jenis_sdm')->select('id_jns_sdm', 'nm_jns_sdm', 'a_guru_kelas', 'a_guru_mapel', 'a_guru_bk', 'a_guru_inklusi', 'a_pengawas_sp', 'a_pengawas_plb', 'a_pengawas_mapel', 'a_pengawas_bid', 'a_tas', 'a_formal', 'a_dosen', 'a_peneliti', 'a_perekayasa', 'a_pranata_1', 'a_pranata_2', 'a_pranata_3', 'a_pranata_4', 'a_pranata_5', 'a_pranata_6', 'a_pranata_7', 'a_pranata_8', 'a_pranata_9', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jns_sdm' => $each_data->id_jns_sdm,
                'nm_jns_sdm' => $each_data->nm_jns_sdm,
                'a_guru_kelas' => $each_data->a_guru_kelas,
                'a_guru_mapel' => $each_data->a_guru_mapel,
                'a_guru_bk' => $each_data->a_guru_bk,
                'a_guru_inklusi' => $each_data->a_guru_inklusi,
                'a_pengawas_sp' => $each_data->a_pengawas_sp,
                'a_pengawas_plb' => $each_data->a_pengawas_plb,
                'a_pengawas_mapel' => $each_data->a_pengawas_mapel,
                'a_pengawas_bid' => $each_data->a_pengawas_bid,
                'a_tas' => $each_data->a_tas,
                'a_formal' => $each_data->a_formal,
                'a_dosen' => $each_data->a_dosen,
                'a_peneliti' => $each_data->a_peneliti,
                'a_perekayasa' => $each_data->a_perekayasa,
                'a_pranata_1' => $each_data->a_pranata_1,
                'a_pranata_2' => $each_data->a_pranata_2,
                'a_pranata_3' => $each_data->a_pranata_3,
                'a_pranata_4' => $each_data->a_pranata_4,
                'a_pranata_5' => $each_data->a_pranata_5,
                'a_pranata_6' => $each_data->a_pranata_6,
                'a_pranata_7' => $each_data->a_pranata_7,
                'a_pranata_8' => $each_data->a_pranata_8,
                'a_pranata_9' => $each_data->a_pranata_9,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
    
    public function jenis_sarana(Request $request)
    {
        $listdata = DB::table('ref.jenis_sarana')->select('id_jns_sarana', 'nm_jns_sarana', 'kel', 'a_penempatan', 'ket', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jns_sarana' => $each_data->id_jns_sarana,
                'nm_jns_sarana' => $each_data->nm_jns_sarana,
                'kel' => $each_data->kel,
                'a_penempatan' => $each_data->a_penempatan,
                'ket' => $each_data->ket,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function jenis_publikasi(Request $request)
    {
        $listdata = DB::table('ref.jenis_publikasi')->select('id_jns_pub', 'nm_jns_pub', 'a_pub_prestasi', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jns_pub' => $each_data->id_jns_pub,
                'nm_jns_pub' => $each_data->nm_jns_pub,
                'a_pub_prestasi' => $each_data->a_pub_prestasi,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function jenis_prestasi(Request $request)
    {
        $listdata = DB::table('ref.jenis_prestasi')->select('id_jenis_prestasi', 'nm_jenis_prestasi', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jenis_prestasi' => $each_data->id_jenis_prestasi,
                'nm_jenis_prestasi' => $each_data->nm_jenis_prestasi,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function jenis_prasarana(Request $request)
    {
        $listdata = DB::table('ref.jenis_prasarana')->select('id_jns_prasarana', 'nm_jns_prasarana', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jns_prasarana' => $each_data->id_jns_prasarana,
                'nm_jns_prasarana' => $each_data->nm_jns_prasarana,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
    
    public function jenis_penghargaan(Request $request)
    {
        $listdata = DB::table('ref.jenis_penghargaan')->select('id_jns_penghargaan', 'nm_jns_penghargaan', 'u_sdm', 'u_lembaga', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jns_penghargaan' => $each_data->id_jns_penghargaan,
                'nm_jns_penghargaan' => $each_data->nm_jns_penghargaan,
                'u_sdm' => $each_data->u_sdm,
                'u_lembaga' => $each_data->u_lembaga,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
    
    public function jenis_penelitian(Request $request)
    {
        $listdata = DB::table('ref.jenis_penelitian')->select('id_jns_lit', 'nm_jns_lit', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jns_lit' => $each_data->id_jns_lit,
                'nm_jns_lit' => $each_data->nm_jns_lit,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function jenis_pendaftaran(Request $request)
    {
        $listdata = DB::table('ref.jenis_pendaftaran')->select('id_jns_daftar', 'nm_jns_daftar', 'u_daftar_sekolah', 'u_daftar_rombel', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jns_daftar' => $each_data->id_jns_daftar,
                'nm_jns_daftar' => $each_data->nm_jns_daftar,
                'u_daftar_sekolah' => $each_data->u_daftar_sekolah,
                'u_daftar_rombel' => $each_data->u_daftar_rombel,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
    
    public function jenis_media_pub(Request $request)
    {
        $listdata = DB::table('ref.jenis_media_pub')->select('id_jns_media', 'nm_jns_media', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jns_media' => $each_data->id_jns_media,
                'nm_jns_media' => $each_data->nm_jns_media,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function jenis_lembaga(Request $request)
    {
        $listdata = DB::table('ref.jenis_lembaga')->select('id_jns_lemb', 'nm_jns_lemb', 'a_sp', 'a_lemb_akred', 'a_pengelola_pendidikan', 'a_sms', 'a_tmpt_pengawas', 'a_lemb_iptek', 'a_smi', 'sort', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jns_lemb' => $each_data->id_jns_lemb,
                'nm_jns_lemb' => $each_data->nm_jns_lemb,
                'a_sp' => $each_data->a_sp,
                'a_lemb_akred' => $each_data->a_lemb_akred,
                'a_pengelola_pendidikan' => $each_data->a_pengelola_pendidikan,
                'a_sms' => $each_data->a_sms,
                'a_tmpt_pengawas' => $each_data->a_tmpt_pengawas,
                'a_lemb_iptek' => $each_data->a_lemb_iptek,
                'a_smi' => $each_data->a_smi,
                'sort' => $each_data->sort,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function jenis_keuangan(Request $request)
    {
        $listdata = DB::table('ref.jenis_keuangan')->select('id_jns_keuangan', 'nm_jns_keuangan', 'a_pengeluaran', 'a_pemasukan', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jns_keuangan' => $each_data->id_jns_keuangan,
                'nm_jns_keuangan' => $each_data->nm_jns_keuangan,
                'a_pengeluaran' => $each_data->a_pengeluaran,
                'a_pemasukan' => $each_data->a_pemasukan,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function jenis_kesejahteraan(Request $request)
    {
        $listdata = DB::table('ref.jenis_kesejahteraan')->select('id_jns_sejahtera', 'nm_jns_sejahtera', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jns_sejahtera' => $each_data->id_jns_sejahtera,
                'nm_jns_sejahtera' => $each_data->nm_jns_sejahtera,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function jenis_kepanitiaan(Request $request)
    {
        $listdata = DB::table('ref.jenis_kepanitiaan')->select('id_jns_panitia', 'nm_jns_panitia', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jns_panitia' => $each_data->id_jns_panitia,
                'nm_jns_panitia' => $each_data->nm_jns_panitia,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function jenis_keluar(Request $request)
    {
        $listdata = DB::table('ref.jenis_keluar')->select('id_jns_keluar', 'ket_keluar', 'a_pd', 'a_ptk', 'a_sdm_iptek', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jns_keluar' => $each_data->id_jns_keluar,
                'ket_keluar' => $each_data->ket_keluar,
                'a_pd' => $each_data->a_pd,
                'a_ptk' => $each_data->a_ptk,
                'a_sdm_iptek' => $each_data->a_sdm_iptek,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
    
    public function jenis_jalur_pekerjaan(Request $request)
    {
        $listdata = DB::table('ref.jenis_jalur_pekerjaan')->select('id_jns_jalur_kerja', 'nm_jns_jalur_kerja', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jns_jalur_kerja' => $each_data->id_jns_jalur_kerja,
                'nm_jns_jalur_kerja' => $each_data->nm_jns_jalur_kerja,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function jenis_hapus_buku(Request $request)
    {
        $listdata = DB::table('ref.jenis_hapus_buku')->select('id_hapus_buku', 'ket_hapus_buku', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_hapus_buku' => $each_data->id_hapus_buku,
                'ket_hapus_buku' => $each_data->ket_hapus_buku,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
    
    public function jenis_evaluasi(Request $request)
    {
        $listdata = DB::table('ref.jenis_evaluasi')->select('id_jns_eval', 'nm_jns_eval', 'ket_jns_eval', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jns_eval' => $each_data->id_jns_eval,
                'nm_jns_eval' => $each_data->nm_jns_eval,
                'ket_jns_eval' => $each_data->ket_jns_eval,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
  
    public function jenis_dokumen(Request $request)
    {
        $listdata = DB::table('ref.jenis_dokumen')->select('id_jns_dok', 'nm_jns_dok', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jns_dok' => $each_data->id_jns_dok,
                'nm_jns_dok' => $each_data->nm_jns_dok,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function jenis_diklat(Request $request)
    {
        $listdata = DB::table('ref.jenis_diklat')->select('id_jns_diklat', 'nm_jns_diklat', 'u_guru', 'u_dosen', 'u_tendik', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jns_diklat' => $each_data->id_jns_diklat,
                'nm_jns_diklat' => $each_data->nm_jns_diklat,
                'u_guru' => $each_data->u_guru,
                'u_dosen' => $each_data->u_dosen,
                'u_tendik' => $each_data->u_tendik,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function jenis_beasiswa(Request $request)
    {
        $listdata = DB::table('ref.jenis_beasiswa')->select('id_jns_beasiswa', 'id_sumber_dana', 'nm_jns_beasiswa', 'u_pd', 'u_ptk', 'u_non_ca', 'kat_beasiswa', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jns_beasiswa' => $each_data->id_jns_beasiswa,
                'id_sumber_dana' => $each_data->id_sumber_dana,
                'nm_jns_beasiswa' => $each_data->nm_jns_beasiswa,
                'u_pd' => $each_data->u_pd,
                'u_ptk' => $each_data->u_ptk,
                'u_non_ca' => $each_data->u_non_ca,
                'kat_beasiswa' => $each_data->kat_beasiswa,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function jenis_bahan_ajar(Request $request)
    {
        $listdata = DB::table('ref.jenis_bahan_ajar')->select('id_jns_bhn_ajar', 'nm_jns_bhn_ajar', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jns_bhn_ajar' => $each_data->id_jns_bhn_ajar,
                'nm_jns_bhn_ajar' => $each_data->nm_jns_bhn_ajar,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
    
    public function jenis_akt_mhs(Request $request)
    {
        $listdata = DB::table('ref.jenis_akt_mhs')->select('id_jns_akt_mhs', 'nm_jns_akt_mhs', 'ket_jns_akt_mhs', 'a_kegiatan_kampus_merdeka', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jns_akt_mhs' => $each_data->id_jns_akt_mhs,
                'nm_jns_akt_mhs' => $each_data->nm_jns_akt_mhs,
                'ket_jns_akt_mhs' => $each_data->ket_jns_akt_mhs,
                'a_kegiatan_kampus_merdeka' => $each_data->a_kegiatan_kampus_merdeka,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
    
    public function jalur_daftar(Request $request)
    {
        $listdata = DB::table('ref.jalur_daftar')->select('id_jalur_daftar', 'nm_jalur_daftar', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jalur_daftar' => $each_data->id_jalur_daftar,
                'nm_jalur_daftar' => $each_data->nm_jalur_daftar,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function jabfung(Request $request)
    {
        $listdata = DB::table('ref.jabfung')->select('id_jabfung', 'id_kel_prof', 'nm_jabfung', 'angka_kredit', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jabfung' => $each_data->id_jabfung,
                'id_kel_prof' => $each_data->id_kel_prof,
                'nm_jabfung' => $each_data->nm_jabfung,
                'angka_kredit' => $each_data->angka_kredit,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function jab_tgs(Request $request)
    {
        $listdata = DB::table('ref.jab_tgs')->select('id_jab_tgs', 'id_kel_prof', 'nm_jab_tgs', 'a_jab_utama_sek', 'a_jab_utama_pt', 'a_jab_utama_lpnk', 'a_jab_utama_lpk', 'jml_jam_diakui', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_jab_tgs' => $each_data->id_jab_tgs,
                'id_kel_prof' => $each_data->id_kel_prof,
                'nm_jab_tgs' => $each_data->nm_jab_tgs,
                'a_jab_utama_sek' => $each_data->a_jab_utama_sek,
                'a_jab_utama_pt' => $each_data->a_jab_utama_pt,
                'a_jab_utama_lpnk' => $each_data->a_jab_utama_lpnk,
                'a_jab_utama_lpk' => $each_data->a_jab_utama_lpk,
                'jml_jam_diakui' => $each_data->jml_jam_diakui,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function ikatan_kerja_sdm(Request $request)
    {
        $listdata = DB::table('ref.ikatan_kerja_sdm')->select('id_ikatan_kerja', 'nm_ikatan_kerja', 'ket_ikatan_kerja', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_ikatan_kerja' => $each_data->id_ikatan_kerja,
                'nm_ikatan_kerja' => $each_data->nm_ikatan_kerja,
                'ket_ikatan_kerja' => $each_data->ket_ikatan_kerja,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
    
    public function gelar_akademik(Request $request)
    {
        $listdata = DB::table('ref.gelar_akademik')->select('id_gelar_akad', 'singkat_gelar', 'nm_gelar_akad', 'posisi_gelar', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_gelar_akad' => $each_data->id_gelar_akad,
                'singkat_gelar' => $each_data->singkat_gelar,
                'nm_gelar_akad' => $each_data->nm_gelar_akad,
                'posisi_gelar' => $each_data->posisi_gelar,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
    
    public function fungsi_lab(Request $request)
    {
        $listdata = DB::table('ref.fungsi_lab')->select('id_fungsi_lab', 'nm_fungsi_lab', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_fungsi_lab' => $each_data->id_fungsi_lab,
                'nm_fungsi_lab' => $each_data->nm_fungsi_lab,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function bidang_usaha(Request $request)
    {
        $listdata = DB::table('ref.bidang_usaha')->select('id_bu', 'nm_bu', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_bu' => $each_data->id_bu,
                'nm_bu' => $each_data->nm_bu,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }

    public function bidang_studi(Request $request)
    {
        $listdata = DB::table('ref.bidang_studi')->select('id_bid_studi', 'id_induk_bidang_studi', 'kode_bid_studi', 'nm_bid_studi', 'a_kel', 'a_jenj_paud', 'a_jenj_tk', 'a_jenj_sd', 'a_jenj_smp', 'a_jenj_sma', 'a_jenj_tinggi', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_bid_studi' => $each_data->id_bid_studi,
                'id_induk_bidang_studi' => $each_data->id_induk_bidang_studi,
                'kode_bid_studi' => $each_data->kode_bid_studi,
                'nm_bid_studi' => $each_data->nm_bid_studi,
                'a_kel' => $each_data->a_kel,
                'a_jenj_paud' => $each_data->a_jenj_paud,
                'a_jenj_tk' => $each_data->a_jenj_tk,
                'a_jenj_sd' => $each_data->a_jenj_sd,
                'a_jenj_smp' => $each_data->a_jenj_smp,
                'a_jenj_sma' => $each_data->a_jenj_sma,
                'a_jenj_tinggi' => $each_data->a_jenj_tinggi,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function bidang_pekerjaan(Request $request)
    {
        $listdata = DB::table('ref.bidang_pekerjaan')->select('id_bid_kerja', 'nm_bid_kerja', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_bid_kerja' => $each_data->id_bid_kerja,
                'nm_bid_kerja' => $each_data->nm_bid_kerja,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function bentuk_pendidikan(Request $request)
    {
        $listdata = DB::table('ref.bentuk_pendidikan')->select('id_bp', 'nm_bp', 'a_jenj_paud', 'a_jenj_tk', 'a_jenj_sd', 'a_jenj_smp', 'a_jenj_sma', 'a_jenj_tinggi', 'dir_bina', 'a_aktif', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_bp' => $each_data->id_bp,
                'nm_bp' => $each_data->nm_bp,
                'a_jenj_paud' => $each_data->a_jenj_paud,
                'a_jenj_tk' => $each_data->a_jenj_tk,
                'a_jenj_sd' => $each_data->a_jenj_sd,
                'a_jenj_smp' => $each_data->a_jenj_smp,
                'a_jenj_sma' => $each_data->a_jenj_sma,
                'a_jenj_tinggi' => $each_data->a_jenj_tinggi,
                'dir_bina' => $each_data->dir_bina,
                'a_aktif' => $each_data->a_aktif,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
    
    public function basis_evaluasi(Request $request)
    {
        $listdata = DB::table('ref.basis_evaluasi')->select('id_basis_evaluasi', 'nm_basis_evaluasi', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_basis_evaluasi' => $each_data->id_basis_evaluasi,
                'nm_basis_evaluasi' => $each_data->nm_basis_evaluasi,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
   
    public function agama(Request $request)
    {
        $listdata = DB::table('ref.agama')->select('id_agama', 'nm_agama', 'create_date', 'last_update')->limit(50)->get();
        foreach ($listdata as $each_data) {
            $data[] = [
                'id_agama' => $each_data->id_agama,
                'nm_agama' => $each_data->nm_agama,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update,
            ];
        }
        return WrapResponse(compact('data'), 'sukses');
    }
}
