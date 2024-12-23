<?php

namespace Database\Seeders;

use App\Models\Pdrd\AktAjarDosen;
use App\Models\Pdrd\KelasKuliah;
use App\Models\Pdrd\KuliahMhs;
use App\Models\Pdrd\Litabmas;
use App\Models\Pdrd\Matkul;
use App\Models\Pdrd\NilaiSmtMhs;
use App\Models\Pdrd\PesertaDidik;
use App\Models\Pdrd\Publikasi;
use App\Models\Pdrd\RegPd;
use App\Models\Pdrd\SdmAnggotaLitabmas;
use App\Models\Pdrd\TulisPub;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CleaningMahasiswaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        ini_set('memory_limit',-1);
        #get_matkul_temp_baru
        $get_update_matkul = DB::SELECT("
            SELECT
                DISTINCT mk_new.*
            FROM temp.matkul_temp AS mk_new
            LEFT JOIN pdrd.matkul AS mk_old ON mk_old.id_mk=mk_new.id_mk
            WHERE mk_new.last_update>mk_old.last_update
        ");
        $total_update_get_matkul = count($get_update_matkul);
        if ($total_update_get_matkul>0) {
            foreach ($get_update_matkul AS $no_matkul_update=>$each_get_matkul_update) {
                echo "Mengupdate data matkul ".($no_matkul_update+1)." dari ".$total_update_get_matkul;
                $input = (array) $each_get_matkul_update;
                $cari_mk = Matkul::find($input['id_mk']);
                if (!is_null($cari_mk)) {
                    unset($input['id_mk']);
                    $input['last_sync'] = currDateTime();
                    $cari_mk->update($input);
                    echo " (berhasil update)\n";
                } else {
                    echo " (gagal update)\n";
                }
            }
        }
        $get_insert_matkul = DB::SELECT("
            SELECT
                DISTINCT rpd_new.*
            FROM temp.matkul_temp AS rpd_new
            LEFT JOIN pdrd.matkul AS rpd_old ON rpd_old.id_mk=rpd_new.id_mk
            WHERE (rpd_old.id_mk IS NULL)
        ");
        $total_insert_get_matkul = count($get_insert_matkul);
        if ($total_insert_get_matkul>0) {
            foreach ($get_insert_matkul AS $no_matkul_insert=>$each_get_matkul_insert) {
                echo "Menambahkan data matkul ".($no_matkul_insert+1)." dari ".$total_insert_get_matkul;
                $input = (array) $each_get_matkul_insert;
                $cari_mk = Matkul::find($input['id_mk']);
                if (is_null($cari_mk)) {
                    $input['last_sync'] = currDateTime();
                    $data_matkul = new Matkul();
                    $data_matkul->fill($input)->save();
                    echo " (berhasil menambahkan)\n";
                } else {
                    echo " (gagal menambahkan)\n";
                }
            }
        }

        #get_kelas_kuliah_temp_baru
        $get_update_kelas_kuliah = DB::SELECT("
            SELECT
                DISTINCT kk_new.*
            FROM temp.kelas_kuliah_temp AS kk_new
            LEFT JOIN pdrd.kelas_kuliah AS kk_old ON kk_old.id_kls=kk_new.id_kls
            WHERE kk_new.last_update>kk_old.last_update
        ");
        $total_update_get_kelas_kuliah = count($get_update_kelas_kuliah);
        if ($total_update_get_kelas_kuliah>0) {
            foreach ($get_update_kelas_kuliah AS $no_kelas_kuliah_update=>$each_get_kelas_kuliah_update) {
                echo "Mengupdate data kelas_kuliah ".($no_kelas_kuliah_update+1)." dari ".$total_update_get_kelas_kuliah;
                $input = (array) $each_get_kelas_kuliah_update;
                $cari_kls = KelasKuliah::find($input['id_kls']);
                if (!is_null($cari_kls)) {
                    unset($input['id_kls']);
                    $input['last_sync'] = currDateTime();
                    $cari_kls->update($input);
                    echo " (berhasil update)\n";
                } else {
                    echo " (gagal update)\n";
                }
            }
        }
        $get_insert_kelas_kuliah = DB::SELECT("
            SELECT
                DISTINCT rpd_new.*
            FROM temp.kelas_kuliah_temp AS rpd_new
            LEFT JOIN pdrd.kelas_kuliah AS rpd_old ON rpd_old.id_kls=rpd_new.id_kls
            WHERE (rpd_old.id_kls IS NULL)
        ");
        $total_insert_get_kelas_kuliah = count($get_insert_kelas_kuliah);
        if ($total_insert_get_kelas_kuliah>0) {
            foreach ($get_insert_kelas_kuliah AS $no_kelas_kuliah_insert=>$each_get_kelas_kuliah_insert) {
                echo "Menambahkan data kelas_kuliah ".($no_kelas_kuliah_insert+1)." dari ".$total_insert_get_kelas_kuliah;
                $input = (array) $each_get_kelas_kuliah_insert;
                $cari_kelas_kuliah = KelasKuliah::find($input['id_kls']);
                if (is_null($cari_kelas_kuliah)) {
                    $input['last_sync'] = currDateTime();
                    $data_kelas_kuliah = new KelasKuliah();
                    $data_kelas_kuliah->fill($input)->save();
                    echo " (berhasil menambahkan)\n";
                } else {
                    echo " (gagal menambahkan)\n";
                }
            }
        }

        #get_pd_temp_baru
        $get_update_pd = DB::SELECT("
            SELECT
                DISTINCT rpd_new.*
            FROM temp.peserta_didik_temp AS rpd_new
            LEFT JOIN pdrd.peserta_didik AS rpd_old ON rpd_old.id_pd=rpd_new.id_pd
            WHERE rpd_new.last_update>rpd_old.last_update
        ");
        $total_update_get_pd = count($get_update_pd);
        if ($total_update_get_pd>0) {
            foreach ($get_update_pd AS $no_pd_update=>$each_get_pd_update) {
                echo "Mengupdate data pd ".($no_pd_update+1)." dari ".$total_update_get_pd;
                $input = (array) $each_get_pd_update;
                $cari_pd = PesertaDidik::find($input['id_pd']);
                if (!is_null($cari_pd)) {
                    unset($input['id_pd']);
                    $input['last_sync'] = currDateTime();
                    $cari_pd->update($input);
                    echo " (berhasil update)\n";
                } else {
                    echo " (gagal update)\n";
                }
            }
        }
        $get_insert_pd = DB::SELECT("
            SELECT
                DISTINCT rpd_new.*
            FROM temp.peserta_didik_temp AS rpd_new
            LEFT JOIN pdrd.peserta_didik AS rpd_old ON rpd_old.id_pd=rpd_new.id_pd
            WHERE (rpd_old.id_pd IS NULL)
        ");
        $total_insert_get_pd = count($get_insert_pd);
        if ($total_insert_get_pd>0) {
            foreach ($get_insert_pd AS $no_pd_insert=>$each_get_pd_insert) {
                echo "Menginsert data pd ".($no_pd_insert+1)." dari ".$total_insert_get_pd;
                $input = (array) $each_get_pd_insert;
                $cari_pd = PesertaDidik::find($input['id_pd']);
                if (is_null($cari_pd)) {
                    $input['last_sync'] = currDateTime();
                    $data_pd = new PesertaDidik();
                    $data_pd->fill($input)->save();
                    echo " (berhasil menambahkan)\n";
                } else {
                    echo " (gagal update)\n";
                }
            }
        }

        #get_reg_pd_temp_baru
        $get_update_reg_pd = DB::SELECT("
            SELECT
                DISTINCT rpd_new.*
            FROM temp.reg_pd_temp AS rpd_new
            LEFT JOIN pdrd.reg_pd AS rpd_old ON rpd_old.id_reg_pd=rpd_new.id_reg_pd
            WHERE rpd_new.last_update>rpd_old.last_update
        ");
        $total_update_get_reg_pd = count($get_update_reg_pd);
        if ($total_update_get_reg_pd>0) {
            foreach ($get_update_reg_pd AS $no_reg_pd_update=>$each_get_reg_pd_update) {
                echo "Mengupdate data reg_pd ".($no_reg_pd_update+1)." dari ".$total_update_get_reg_pd;
                $input = (array) $each_get_reg_pd_update;
                $cari_reg_pd = RegPd::find($input['id_reg_pd']);
                if (!is_null($cari_reg_pd)) {
                    unset($input['id_reg_pd']);
                    $input['last_sync'] = currDateTime();
                    $cari_reg_pd->update($input);
                    echo " (berhasil update)\n";
                } else {
                    echo " (gagal update)\n";
                }
            }
        }
        $get_insert_reg_pd = DB::SELECT("
            SELECT
                DISTINCT rpd_new.*
            FROM temp.reg_pd_temp AS rpd_new
            LEFT JOIN pdrd.reg_pd AS rpd_old ON rpd_old.id_reg_pd=rpd_new.id_reg_pd
            WHERE (rpd_old.id_reg_pd IS NULL)
        ");
        $total_insert_get_reg_pd = count($get_insert_reg_pd);
        if ($total_insert_get_reg_pd>0) {
            foreach ($get_insert_reg_pd AS $no_reg_pd_insert=>$each_get_reg_pd_insert) {
                echo "Menginsert data reg_pd ".($no_reg_pd_insert+1)." dari ".$total_insert_get_reg_pd;
                $input = (array) $each_get_reg_pd_insert;
                $cari_reg_pd = RegPd::find($input['id_reg_pd']);
                if (is_null($cari_reg_pd)) {
                    $input['last_sync'] = currDateTime();
                    $data_reg_pd = new RegPd();
                    $data_reg_pd->fill($input)->save();
                    echo " (berhasil menambahkan)\n";
                } else {
                    echo " (gagal update)\n";
                }
            }
        }

        #kuliah_mhs
        $get_update_kuliah_mhs = DB::SELECT("
            SELECT
                DISTINCT rpd_new.*
            FROM temp.kuliah_mhs_temp AS rpd_new
            LEFT JOIN pdrd.kuliah_mhs AS rpd_old ON rpd_old.id_reg_pd=rpd_new.id_reg_pd
                AND rpd_old.id_smt=rpd_new.id_smt
            WHERE rpd_new.last_update>rpd_old.last_update
        ");
        $total_update_get_kuliah_mhs = count($get_update_kuliah_mhs);
        if ($total_update_get_kuliah_mhs>0) {
            foreach ($get_update_kuliah_mhs AS $no_kuliah_mhs_update=>$each_get_kuliah_mhs_update) {
                echo "Mengupdate data kuliah_mhs ".($no_kuliah_mhs_update+1)." dari ".$total_update_get_kuliah_mhs;
                $input = (array) $each_get_kuliah_mhs_update;
                $cari_kuliah_mhs = KuliahMhs::where('id_reg_pd',$input['id_reg_pd'])
                    ->where('id_smt',$input['id_smt'])->first();
                if (!is_null($cari_kuliah_mhs)) {
                    unset($input['id_reg_pd']);
                    unset($input['id_smt']);
                    $input['last_sync'] = currDateTime();
                    KuliahMhs::where('id_reg_pd',$cari_kuliah_mhs->id_reg_pd)
                        ->where('id_smt',$cari_kuliah_mhs->id_smt)->update($input);
                    echo " (berhasil update)\n";
                } else {
                    echo " (gagal update)\n";
                }
            }
        }

        $get_insert_kuliah_mhs = DB::SELECT("
            SELECT
                DISTINCT rpd_new.*
            FROM temp.kuliah_mhs_temp AS rpd_new
            LEFT JOIN pdrd.kuliah_mhs AS rpd_old ON rpd_old.id_reg_pd=rpd_new.id_reg_pd
                AND rpd_old.id_smt=rpd_new.id_smt
            WHERE (rpd_old.id_reg_pd IS NULL AND rpd_old.id_smt IS NULL)
        ");
        $total_insert_get_kuliah_mhs = count($get_insert_kuliah_mhs);
        if ($total_insert_get_kuliah_mhs>0) {
            foreach ($get_insert_kuliah_mhs AS $no_kuliah_mhs_insert=>$each_get_kuliah_mhs_insert) {
                echo "Menambahkan data kuliah_mhs ".($no_kuliah_mhs_insert+1)." dari ".$total_insert_get_kuliah_mhs;
                $input = (array) $each_get_kuliah_mhs_insert;
                $cari_kuliah_mhs = KuliahMhs::where('id_reg_pd',$input['id_reg_pd'])
                    ->where('id_smt',$input['id_smt'])->first();
                if (is_null($cari_kuliah_mhs)) {
                    $input['last_sync'] = currDateTime();
                    $data_kuliah = new KuliahMhs();
                    $data_kuliah->fill($input)->save();
                    echo " (berhasil menambahkan)\n";
                } else {
                    echo " (gagal menambahkan)\n";
                }
            }
        }

        #nilai_kelas_mhs
        $get_update_nilai_smt_mhs = DB::SELECT("
            SELECT
                DISTINCT rpd_new.*
            FROM temp.nilai_smt_mhs_temp AS rpd_new
            LEFT JOIN pdrd.nilai_smt_mhs AS rpd_old ON rpd_old.id_reg_pd=rpd_new.id_reg_pd
                AND rpd_old.id_kls=rpd_new.id_kls
            WHERE rpd_new.last_update>rpd_old.last_update
        ");
        $total_update_get_nilai_smt_mhs = count($get_update_nilai_smt_mhs);
        if ($total_update_get_nilai_smt_mhs>0) {
            foreach ($get_update_nilai_smt_mhs AS $no_nilai_smt_mhs_update=>$each_get_nilai_smt_mhs_update) {
                echo "Mengupdate data nilai_smt_mhs ".($no_nilai_smt_mhs_update+1)." dari ".$total_update_get_nilai_smt_mhs;
                $input = (array) $each_get_nilai_smt_mhs_update;
                $cari_nilai_smt_mhs = NilaiSmtMhs::where('id_reg_pd',$input['id_reg_pd'])
                    ->where('id_kls',$input['id_kls'])->first();
                if (!is_null($cari_nilai_smt_mhs)) {
                    unset($input['id_reg_pd']);
                    unset($input['id_kls']);
                    $input['last_sync'] = currDateTime();
                    NilaiSmtMhs::where('id_reg_pd',$cari_nilai_smt_mhs->id_reg_pd)
                        ->where('id_kls',$cari_nilai_smt_mhs->id_kls)->update($input);
                    echo " (berhasil update)\n";
                } else {
                    echo " (gagal update)\n";
                }
            }
        }
        $get_insert_nilai_smt_mhs = DB::SELECT("
            SELECT
                DISTINCT rpd_new.*
            FROM temp.nilai_smt_mhs_temp AS rpd_new
            LEFT JOIN pdrd.nilai_smt_mhs AS rpd_old ON rpd_old.id_reg_pd=rpd_new.id_reg_pd
                AND rpd_old.id_kls=rpd_new.id_kls
            WHERE (rpd_old.id_reg_pd IS NULL AND rpd_old.id_kls IS NULL)
        ");
        $total_insert_get_nilai_smt_mhs = count($get_insert_nilai_smt_mhs);
        if ($total_insert_get_nilai_smt_mhs>0) {
            foreach ($get_insert_nilai_smt_mhs AS $no_nilai_smt_mhs_insert=>$each_get_nilai_smt_mhs_insert) {
                echo "Menambahkan data nilai_smt_mhs ".($no_nilai_smt_mhs_insert+1)." dari ".$total_insert_get_nilai_smt_mhs;
                $input = (array) $each_get_nilai_smt_mhs_insert;
                $cari_nilai_smt_mhs = NilaiSmtMhs::where('id_reg_pd',$input['id_reg_pd'])
                    ->where('id_kls',$input['id_kls'])->first();
                if (is_null($cari_nilai_smt_mhs)) {
                    $input['last_sync'] = currDateTime();
                    $data_kuliah = new NilaiSmtMhs();
                    $data_kuliah->fill($input)->save();
                    echo " (berhasil menambahkan)\n";
                } else {
                    echo " (gagal menambahkan)\n";
                }
            }
        }

        #akt_ajar_dosen
        $get_update_akt_ajar_dosen = DB::SELECT("
            SELECT
                DISTINCT rpd_new.*
            FROM temp.akt_ajar_dosen_temp AS rpd_new
            LEFT JOIN pdrd.akt_ajar_dosen AS rpd_old ON rpd_old.id_ajar=rpd_new.id_ajar
            WHERE rpd_new.last_update>rpd_old.last_update
        ");
        $total_update_get_akt_ajar_dosen = count($get_update_akt_ajar_dosen);
        if ($total_update_get_akt_ajar_dosen>0) {
            foreach ($get_update_akt_ajar_dosen AS $no_akt_ajar_dosen_update=>$each_get_akt_ajar_dosen_update) {
                echo "Mengupdate data akt_ajar_dosen ".($no_akt_ajar_dosen_update+1)." dari ".$total_update_get_akt_ajar_dosen;
                $input = (array) $each_get_akt_ajar_dosen_update;
                $cari_akt_ajar_dosen = AktAjarDosen::where('id_ajar',$input['id_ajar'])->first();
                if (!is_null($cari_akt_ajar_dosen)) {
                    unset($input['id_ajar']);
                    $input['last_sync'] = currDateTime();
                    AktAjarDosen::where('id_ajar',$cari_akt_ajar_dosen->id_ajar)->update($input);
                    echo " (berhasil update)\n";
                } else {
                    echo " (gagal update)\n";
                }
            }
        }
        $get_insert_akt_ajar_dosen = DB::SELECT("
            SELECT
                DISTINCT akt_ajar_dosen_new.*
            FROM temp.akt_ajar_dosen_temp AS akt_ajar_dosen_new
            LEFT JOIN pdrd.akt_ajar_dosen AS akt_ajar_dosen_old ON akt_ajar_dosen_old.id_ajar=akt_ajar_dosen_new.id_ajar
            WHERE (akt_ajar_dosen_old.id_ajar IS NULL)
        ");
        $total_insert_get_akt_ajar_dosen = count($get_insert_akt_ajar_dosen);
        if ($total_insert_get_akt_ajar_dosen>0) {
            foreach ($get_insert_akt_ajar_dosen AS $no_akt_ajar_dosen_insert=>$each_get_akt_ajar_dosen_insert) {
                echo "Menambahkan data akt_ajar_dosen ".($no_akt_ajar_dosen_insert+1)." dari ".$total_insert_get_akt_ajar_dosen;
                $input = (array) $each_get_akt_ajar_dosen_insert;
                $cari_akt_ajar_dosen = AktAjarDosen::where('id_ajar',$input['id_ajar'])->first();
                if (is_null($cari_akt_ajar_dosen)) {
                    $input['last_sync'] = currDateTime();
                    $data_kuliah = new AktAjarDosen();
                    $data_kuliah->fill($input)->save();
                    echo " (berhasil menambahkan)\n";
                } else {
                    echo " (gagal menambahkan)\n";
                }
            }
        }

        #litabmas
        $get_update_litabmas = DB::SELECT("
            SELECT
                DISTINCT rpd_new.*
            FROM temp.litabmas_temp AS rpd_new
            LEFT JOIN pdrd.litabmas AS rpd_old ON rpd_old.id_ajar=rpd_new.id_ajar
            WHERE rpd_new.last_update>rpd_old.last_update
        ");
        $total_update_get_litabmas = count($get_update_litabmas);
        if ($total_update_get_litabmas>0) {
            foreach ($get_update_litabmas AS $no_litabmas_update=>$each_get_litabmas_update) {
                echo "Mengupdate data litabmas ".($no_litabmas_update+1)." dari ".$total_update_get_litabmas;
                $input = (array) $each_get_litabmas_update;
                $cari_litabmas = Litabmas::where('id_litabmas',$input['id_litabmas'])->first();
                if (!is_null($cari_litabmas)) {
                    unset($input['id_litabmas']);
                    $input['last_sync'] = currDateTime();
                    Litabmas::where('id_litabmas',$cari_litabmas->id_litabmas)->update($input);
                    echo " (berhasil update)\n";
                } else {
                    echo " (gagal update)\n";
                }
            }
        }
        $get_insert_litabmas = DB::SELECT("
            SELECT
                DISTINCT litabmas_new.*
            FROM temp.litabmas_temp AS litabmas_new
            LEFT JOIN pdrd.litabmas AS litabmas_old ON litabmas_old.id_litabmas=litabmas_new.id_litabmas
            WHERE (litabmas_old.id_litabmas IS NULL)
        ");
        $total_insert_get_litabmas = count($get_insert_litabmas);
        if ($total_insert_get_litabmas>0) {
            foreach ($get_insert_litabmas AS $no_litabmas_insert=>$each_get_litabmas_insert) {
                echo "Menambahkan data litabmas ".($no_litabmas_insert+1)." dari ".$total_insert_get_litabmas;
                $input = (array) $each_get_litabmas_insert;
                $cari_litabmas = Litabmas::where('id_litabmas',$input['id_litabmas'])->first();
                if (is_null($cari_litabmas)) {
                    $input['last_sync'] = currDateTime();
                    $data_litabmas = new Litabmas();
                    $data_litabmas->fill($input)->save();
                    echo " (berhasil menambahkan)\n";
                } else {
                    echo " (gagal menambahkan)\n";
                }
            }
        }

        #sdm_anggota_litabmas
        $get_update_sdm_anggota_litabmas = DB::SELECT("
            SELECT
                DISTINCT rpd_new.*
            FROM temp.sdm_anggota_litabmas_temp AS rpd_new
            LEFT JOIN pdrd.sdm_anggota_litabmas AS rpd_old ON rpd_old.id_litabmas=rpd_new.id_litabmas
                AND rpd_old.id_sdm=rpd_new.id_sdm
            WHERE rpd_new.last_update>rpd_old.last_update
        ");
        $total_update_get_sdm_anggota_litabmas = count($get_update_sdm_anggota_litabmas);
        if ($total_update_get_sdm_anggota_litabmas>0) {
            foreach ($get_update_sdm_anggota_litabmas AS $no_sdm_anggota_litabmas_update=>$each_get_sdm_anggota_litabmas_update) {
                echo "Mengupdate data sdm_anggota_litabmas ".($no_sdm_anggota_litabmas_update+1)." dari ".$total_update_get_sdm_anggota_litabmas;
                $input = (array) $each_get_sdm_anggota_litabmas_update;
                $cari_sdm_anggota_litabmas = SdmAnggotaLitabmas::where('id_litabmas',$input['id_litabmas'])
                    ->where('id_sdm',$input['id_sdm'])->first();
                if (!is_null($cari_sdm_anggota_litabmas)) {
                    unset($input['id_litabmas']);
                    unset($input['id_sdm']);
                    $input['last_sync'] = currDateTime();
                    SdmAnggotaLitabmas::where('id_litabmas',$cari_sdm_anggota_litabmas->id_litabmas)
                        ->where('id_sdm',$input['id_sdm'])->update($input);
                    echo " (berhasil update)\n";
                } else {
                    echo " (gagal update)\n";
                }
            }
        }
        $get_insert_sdm_anggota_litabmas = DB::SELECT("
            SELECT
                DISTINCT sdm_anggota_litabmas_new.*
            FROM temp.sdm_anggota_litabmas_temp AS sdm_anggota_litabmas_new
            LEFT JOIN pdrd.sdm_anggota_litabmas AS sdm_anggota_litabmas_old ON sdm_anggota_litabmas_old.id_litabmas=sdm_anggota_litabmas_new.id_litabmas
                AND sdm_anggota_litabmas_old.id_sdm=sdm_anggota_litabmas_new.id_sdm
            WHERE (sdm_anggota_litabmas_old.id_litabmas IS NULL AND sdm_anggota_litabmas_old.id_sdm IS NULL)
        ");
        $total_insert_get_sdm_anggota_litabmas = count($get_insert_sdm_anggota_litabmas);
        if ($total_insert_get_sdm_anggota_litabmas>0) {
            foreach ($get_insert_sdm_anggota_litabmas AS $no_sdm_anggota_litabmas_insert=>$each_get_sdm_anggota_litabmas_insert) {
                echo "Menambahkan data sdm_anggota_litabmas ".($no_sdm_anggota_litabmas_insert+1)." dari ".$total_insert_get_sdm_anggota_litabmas;
                $input = (array) $each_get_sdm_anggota_litabmas_insert;
                $cari_sdm_anggota_litabmas = SdmAnggotaLitabmas::where('id_litabmas',$input['id_litabmas'])
                    ->where('id_sdm',$input['id_sdm'])->first();
                if (is_null($cari_sdm_anggota_litabmas)) {
                    $input['last_sync'] = currDateTime();
                    $data_sdm_anggota_litabmas = new SdmAnggotaLitabmas();
                    $data_sdm_anggota_litabmas->fill($input)->save();
                    echo " (berhasil menambahkan)\n";
                } else {
                    echo " (gagal menambahkan)\n";
                }
            }
        }

        #publikasi
        $get_update_publikasi = DB::SELECT("
            SELECT
                DISTINCT rpd_new.*
            FROM temp.publikasi_temp AS rpd_new
            LEFT JOIN pdrd.publikasi AS rpd_old ON rpd_old.id_publikasi=rpd_new.id_publikasi
            WHERE rpd_new.last_update>rpd_old.last_update
        ");
        $total_update_get_publikasi = count($get_update_publikasi);
        if ($total_update_get_publikasi>0) {
            foreach ($get_update_publikasi AS $no_publikasi_update=>$each_get_publikasi_update) {
                echo "Mengupdate data publikasi ".($no_publikasi_update+1)." dari ".$total_update_get_publikasi;
                $input = (array) $each_get_publikasi_update;
                $cari_publikasi = Publikasi::where('id_publikasi',$input['id_publikasi'])->first();
                if (!is_null($cari_publikasi)) {
                    unset($input['id_publikasi']);
                    $input['last_sync'] = currDateTime();
                    Publikasi::where('id_publikasi',$cari_publikasi->id_publikasi)->update($input);
                    echo " (berhasil update)\n";
                } else {
                    echo " (gagal update)\n";
                }
            }
        }
        $get_insert_publikasi = DB::SELECT("
            SELECT
                DISTINCT publikasi_new.*
            FROM temp.publikasi_temp AS publikasi_new
            LEFT JOIN pdrd.publikasi AS publikasi_old ON publikasi_old.id_publikasi=publikasi_new.id_publikasi
            WHERE (publikasi_old.id_publikasi IS NULL)
        ");
        $total_insert_get_publikasi = count($get_insert_publikasi);
        if ($total_insert_get_publikasi>0) {
            foreach ($get_insert_publikasi AS $no_publikasi_insert=>$each_get_publikasi_insert) {
                echo "Menambahkan data publikasi ".($no_publikasi_insert+1)." dari ".$total_insert_get_publikasi;
                $input = (array) $each_get_publikasi_insert;
                $cari_publikasi = Publikasi::where('id_publikasi',$input['id_publikasi'])->first();
                if (is_null($cari_publikasi)) {
                    $input['last_sync'] = currDateTime();
                    $data_publikasi = new Publikasi();
                    $data_publikasi->fill($input)->save();
                    echo " (berhasil menambahkan)\n";
                } else {
                    echo " (gagal menambahkan)\n";
                }
            }
        }

        #tulis_pub
        $get_update_tulis_pub = DB::SELECT("
            SELECT
                DISTINCT rpd_new.*
            FROM temp.tulis_pub_temp AS rpd_new
            LEFT JOIN pdrd.tulis_pub AS rpd_old ON rpd_old.id_tulis_pub=rpd_new.id_tulis_pub
            WHERE rpd_new.last_update>rpd_old.last_update
        ");
        $total_update_get_tulis_pub = count($get_update_tulis_pub);
        if ($total_update_get_tulis_pub>0) {
            foreach ($get_update_tulis_pub AS $no_tulis_pub_update=>$each_get_tulis_pub_update) {
                echo "Mengupdate data tulis_pub ".($no_tulis_pub_update+1)." dari ".$total_update_get_tulis_pub;
                $input = (array) $each_get_tulis_pub_update;
                $cari_tulis_pub = TulisPub::where('id_tulis_pub',$input['id_tulis_pub'])->first();
                if (!is_null($cari_tulis_pub)) {
                    unset($input['id_tulis_pub']);
                    $input['last_sync'] = currDateTime();
                    TulisPub::where('id_tulis_pub',$cari_tulis_pub->id_tulis_pub)->update($input);
                    echo " (berhasil update)\n";
                } else {
                    echo " (gagal update)\n";
                }
            }
        }
        $get_insert_tulis_pub = DB::SELECT("
            SELECT
                DISTINCT tulis_pub_new.*
            FROM temp.tulis_pub_temp AS tulis_pub_new
            LEFT JOIN pdrd.tulis_pub AS tulis_pub_old ON tulis_pub_old.id_tulis_pub=tulis_pub_new.id_tulis_pub
            WHERE (tulis_pub_old.id_tulis_pub IS NULL)
        ");
        $total_insert_get_tulis_pub = count($get_insert_tulis_pub);
        if ($total_insert_get_tulis_pub>0) {
            foreach ($get_insert_tulis_pub AS $no_tulis_pub_insert=>$each_get_tulis_pub_insert) {
                echo "Menambahkan data tulis_pub ".($no_tulis_pub_insert+1)." dari ".$total_insert_get_tulis_pub;
                $input = (array) $each_get_tulis_pub_insert;
                $cari_tulis_pub = TulisPub::where('id_tulis_pub',$input['id_tulis_pub'])->first();
                if (is_null($cari_tulis_pub)) {
                    $input['last_sync'] = currDateTime();
                    $data_tulis_pub = new TulisPub();
                    $data_tulis_pub->fill($input)->save();
                    echo " (berhasil menambahkan)\n";
                } else {
                    echo " (gagal menambahkan)\n";
                }
            }
        }
    }
}
