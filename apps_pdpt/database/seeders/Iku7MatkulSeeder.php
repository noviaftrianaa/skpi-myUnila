<?php

namespace Database\Seeders;


use App\Models\PDUT\Dashboard\DetailIku7;
use App\Models\PDUT\Pdrd\AktAjarDosen;
use App\Models\PDUT\Pdrd\KelasKuliah;
use App\Models\PDUT\Pdrd\KurikulumSp;
use App\Models\PDUT\Pdrd\Matkul;
use App\Models\PDUT\Pdrd\MatkulKurikulum;
use App\Models\PDUT\Pdrd\ReMk;
use App\Models\PDUT\Temp_iku\Iku7Matkul;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Rap2hpoutre\FastExcel\FastExcel;

class Iku7MatkulSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // $this->importDataMatkul();
        // $this->importDataReMatkul();
        $this->tempIku();
        $this->totalDashboard();
    }

    public function tempIku()
    {
        $temp_iku7 = DB::SELECT("
            SELECT
                DISTINCT mk.id_mk,
                smt.id_thn_ajaran,
                CONCAT(sms.nm_lemb, ' (', jenjang.nm_jenj_didik, ')') AS nm_prodi,
                fak.nm_lemb AS nm_fakultas,
                mk.nm_mk,
                mk.sks_mk,
                sdm.nm_sdm AS nm_dosen,
                sdm.nidn,
                CASE
                    WHEN re_mk.id_mk = re_mk.id_mk THEN 1
                    ELSE 0
                END AS status_iku
            FROM
                pdrd.re_mk AS re_mk WITH(NOLOCK)
                LEFT JOIN pdrd.matkul AS mk WITH(NOLOCK) ON mk.id_mk = re_mk.id_mk
                AND mk.soft_delete = 0
                LEFT JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = mk.id_sms
                AND sms.soft_delete = 0
                LEFT JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = sms.id_induk_sms
                AND fak.soft_delete = 0
                LEFT JOIN pdrd.kelas_kuliah AS kk WITH(NOLOCK) ON kk.id_sms = sms.id_sms
                AND kk.soft_delete = 0
                JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.nm_jenj_didik IN ('D2', 'D3', 'D4', 'S1')
                AND jenjang.expired_date IS NULL
                JOIN ref.semester AS smt ON smt.id_smt = kk.id_smt
                AND smt.expired_date IS NULL
                LEFT JOIN pdrd.akt_ajar_dosen AS akt_dosen WITH(NOLOCK) ON akt_dosen.id_kls = kk.id_kls
                AND akt_dosen.soft_delete = 0
                LEFT JOIN pdrd.reg_ptk AS ptk WITH(NOLOCK) ON ptk.id_reg_ptk = akt_dosen.id_reg_ptk
                AND ptk.soft_delete = 0
                LEFT JOIN pdrd.sdm AS sdm WITH(NOLOCK) ON sdm.id_sdm = ptk.id_sdm
            WHERE
                re_mk.komponen_evaluasi IN ('AKP', 'HSP')
                AND re_mk.soft_delete = 0
            UNION
            SELECT
                mk.id_mk,
                smt.id_thn_ajaran,
                CONCAT(sms.nm_lemb, ' (', jenjang.nm_jenj_didik, ')') AS nm_prodi,
                fak.nm_lemb AS nm_fakultas,
                mk.nm_mk,
                mk.sks_mk,
                sdm.nm_sdm AS nm_dosen,
                sdm.nidn,
                CASE
                    WHEN mk.id_mk = mk.id_mk THEN 0
                    ELSE 0
                END AS status_iku
            FROM
                pdrd.matkul AS mk WITH(NOLOCK)
                LEFT JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = mk.id_sms
                AND sms.soft_delete = 0
                LEFT JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = sms.id_induk_sms
                AND fak.soft_delete = 0
                JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.nm_jenj_didik IN ('D2', 'D3', 'D4', 'S1')
                AND jenjang.expired_date IS NULL
                LEFT JOIN pdrd.kelas_kuliah AS kk WITH(NOLOCK) ON kk.id_sms = sms.id_sms
                AND kk.soft_delete = 0
                JOIN ref.semester AS smt ON smt.id_smt = kk.id_smt
                AND smt.expired_date IS NULL
                LEFT JOIN pdrd.akt_ajar_dosen AS akt_dosen WITH(NOLOCK) ON akt_dosen.id_kls = kk.id_kls
                AND akt_dosen.soft_delete = 0
                LEFT JOIN pdrd.reg_ptk AS ptk WITH(NOLOCK) ON ptk.id_reg_ptk = akt_dosen.id_reg_ptk
                AND ptk.soft_delete = 0
                LEFT JOIN pdrd.sdm AS sdm WITH(NOLOCK) ON sdm.id_sdm = ptk.id_sdm
            WHERE
                NOT EXISTS (
                    SELECT
                        re_mk.id_mk
                    FROM
                        pdrd.re_mk AS re_mk WITH(NOLOCK)
                    WHERE
                        re_mk.id_mk = mk.id_mk
                        AND re_mk.soft_delete = 0
                )
                AND mk.soft_delete = 0
            ");

        foreach ($temp_iku7 as $each_data) {
            Iku7Matkul::updateOrInsert([
                'id_mk' => $each_data->id_mk,
                'id_thn_ajaran' => $each_data->id_thn_ajaran,
                'nm_mk' => $each_data->nm_mk,
                'sks_mk' => $each_data->sks_mk
            ], [
                'id_temp_matkul' => guid(),
                'nm_prodi' => $each_data->nm_prodi,
                'nm_fakultas' => $each_data->nm_fakultas,
                'nm_dosen' => $each_data->nm_dosen,
                'nidn' => $each_data->nidn,
                'status_iku' => $each_data->status_iku,
                'last_sync' => currDateTime(),
            ]);
        }

        echo " Data temp_iku7 berhasil diperbaharui\n";
    }

    public function totalDashboard()
    {
        $total_dashboard7 = DB::SELECT("
            SELECT
                DISTINCT mk.nm_prodi,
                sms.id_sms,
                mk.id_thn_ajaran,
                (
                    SELECT
                        DISTINCT COUNT(re_mk.id_mk)
                    FROM
                        pdrd.re_mk AS re_mk WITH(NOLOCK)
                    WHERE
                        re_mk.komponen_evaluasi = 'AKP'
                        AND re_mk.soft_delete = 0
                ) AS total_mk_case_method,
                (
                    SELECT
                        DISTINCT COUNT(re_mk.id_mk)
                    FROM
                        pdrd.re_mk AS re_mk WITH(NOLOCK)
                    WHERE
                        re_mk.komponen_evaluasi = 'HSP'
                        AND re_mk.soft_delete = 0
                ) AS total_mk_team_base_project
            FROM
                temp_iku.matkul AS mk
                LEFT JOIN pdrd.kelas_kuliah as kk WITH(NOLOCK) ON kk.id_mk = mk.id_mk
                AND kk.soft_delete = 0
                JOIN ref.semester AS smt ON smt.id_smt = kk.id_smt
                AND smt.id_thn_ajaran = mk.id_thn_ajaran
                AND smt.expired_date IS NULL
                JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = kk.id_sms
                AND sms.soft_delete = 0
            ORDER BY
                mk.nm_prodi ASC
        ");

        foreach ($total_dashboard7 as $each_data) {
            DetailIku7::updateOrInsert([
                'id_sms' => $each_data->id_sms,
                'id_tahun_anggaran' => $each_data->id_thn_ajaran,
            ], [
                'id_detail_iku_7' => guid(),
                'total_mk_case_method' => $each_data->total_mk_case_method,
                'total_mk_team_base_project' => $each_data->total_mk_team_base_project,
                'create_date' => currDateTime(),
                'last_update' => currDateTime(),
                'expired_date' => currDateTime(),
                'last_sync' => currDateTime()
            ]);
        }

        echo " Data Dashboard iku 7 berhasil diperbaharui\n";
    }

    public function importDataMatkul()
    {
        //tambah kurikulum sp
        //     $kurkul = KurikulumSp::create([
        //         'id_kurikulum_sp' => guid(),
        //         'id_jenj_didik' => 30,
        //         'nm_kurikulum_sp' => 'Kurikulum 2021',
        //         'jmlh_smt_normal' => NULL,
        //         'a_digunakan' => 1,
        //         'jmlh_sks_lulus' => NULL,
        //         'jmlh_sks_wajib' => NULL,
        //         'jmlh_sks_pilihan' => NULL,
        //         'create_date' => currDateTime(),
        //         'id_creator' => guid(),
        //         'last_update' => currDateTime(),
        //         'id_updater' => guid(),
        //         'soft_delete' => 0,
        //         'last_sync' => currDateTime()
        // ]);

        $file_path = storage_path('uploads/detailMk.xlsx');
        $data_matkul = (new FastExcel)->configureCsv(';', '#', 'gbk')->sheet(1)->import($file_path, function ($each_data) {

            $id_kurkul_sp = '79eeba32-4967-4f71-9254-05fd18174a78';

            //tambah mata kuliah
            $matkul = Matkul::create([
                'id_mk' => guid(),
                'id_sms' => $each_data['id_sms'],
                'kode_mk' => $each_data['kode_mk'],
                'nm_mk' => $each_data['nm_mk'],
                'sks_mk' => $each_data['sks_mk'],
                'id_jenj_didik' => 30,
                'sks_tm' => NULL,
                'sks_prak' => NULL,
                'sks_prak_lap' => NULL,
                'sks_sim' => NULL,
                'jns_mk' => NULL,
                'kel_mk' => NULL,
                'metode_pelaksanaan_kuliah' => NULL,
                'a_sap' => NULL,
                'a_silabus' => NULL,
                'a_bahan_ajar' => NULL,
                'acara_prak' => NULL,
                'a_diktat' => NULL,
                'tgl_mulai_efektif' => NULL,
                'tgl_akhir_efektif' => NULL,
                'create_date' => currDateTime(),
                'id_creator' => guid(),
                'last_update' => currDateTime(),
                'id_updater' => guid(),
                'soft_delete' => 0,
                'last_sync' => currDateTime()
            ]);

            //tambah kurikulum mk
            $kurkul_matkul = MatkulKurikulum::create([
                'id_kurikulum_sp' => $id_kurkul_sp,
                'id_mk' => $matkul->id_mk,
                'smt' => 4,
                'sks_mk' => $matkul->sks_mk,
                'sks_tm' => NULL,
                'sks_prak' => NULL,
                'sks_prak_lap' => NULL,
                'sks_sim' => NULL,
                'a_wajib' => NULL,
                'create_date' => currDateTime(),
                'id_creator' => guid(),
                'last_update' => currDateTime(),
                'id_updater' => guid(),
                'soft_delete' => 0,
                'last_sync' => currDateTime()
            ]);

            //tambah kelas kuliah
            $kelas_kuliah = KelasKuliah::create([
                'id_smt' => $each_data['id_smt'],
                'id_mk' => $matkul->id_mk,
                'id_sms' => $matkul->id_sms,
                'sks_mk' => $matkul->sks,
                'nm_kls' => $each_data['nm_kls'],
                'id_kls' => guid(),
                'sks_tm' => NULL,
                'sks_prak' => NULL,
                'sks_prak_lap' => NULL,
                'sks_sim' => NULL,
                'bahasan_case' => NULL,
                'a_selenggara_pditt' => 0,
                'a_pengguna_pditt' => 0,
                'kuota_pditt' => 40,
                'kode_vclass' => NULL,
                'url_vclass' => NULL,
                'create_date' => currDateTime(),
                'id_creator' => guid(),
                'last_update' => currDateTime(),
                'id_updater' => guid(),
                'soft_delete' => 0,
                'last_sync' => currDateTime()
            ]);

            $sdm = DB::SELECT("
                SELECT
                    sdm.id_sdm,
                    ptk.id_reg_ptk
                FROM
                    pdrd.sdm AS sdm WITH(NOLOCK)
                    JOIN pdrd.reg_ptk AS ptk WITH(NOLOCK) ON ptk.id_sdm = sdm.id_sdm
                    AND ptk.soft_delete = 0
                WHERE
                    sdm.nidn = ?
                    AND sdm.soft_delete = 0
            ", [$each_data['nidn']]);


            //tambah aktivitas ajar dosen
            $aktvitas_ajar = AktAjarDosen::create([
                'id_ajar' => guid(),
                'id_reg_ptk' => $sdm[0]->id_reg_ptk,
                'id_subst' => NULL,
                'id_katgiat' => 110100,
                'katgiat_ajar_id_katgiat' => 110100,
                'id_jns_eval' => 1,
                'id_kls' => $kelas_kuliah->id_kls,
                'sks_subst_tot' => 3,
                'sks_tm_subst' => 3,
                'sks_prak_subst' => 3,
                'sks_prak_lap_subst' => 3,
                'sks_sim_subst' => 3,
                'jml_tm_renc' => 3,
                'jml_tm_real' => NULL,
                'jml_mhs' => NULL,
                'create_date' => currDateTime(),
                'id_creator' => guid(),
                'last_update' => currDateTime(),
                'id_updater' => guid(),
                'soft_delete' => 0,
                'last_sync' => currDateTime()
            ]);

            echo " Data berhasil ditambah\n";
        });
    }

    public function importDataReMatkul()
    {

        $file_path = storage_path('uploads/detailMk.xlsx');
        $data_matkul = (new FastExcel)->configureCsv(';', '#', 'gbk')->sheet(2)->import($file_path, function ($each_data) {

            $matkul = DB::SELECT("
                SELECT
                    mk.id_mk
                FROM
                    pdrd.matkul AS mk
                WHERE
                    mk.kode_mk = ?
                    AND mk.soft_delete = 0
            ", [$each_data['kode_mk']]);

            //tambah re_mk
            $data_remk = ReMk::updateOrInsert([
                'id_mk' => $matkul[0]->id_mk,
                'komponen_evaluasi' => $each_data['komponen_evaluasi'],
                'desk_indo' => $each_data['desk_indo'],
                'bobot_evaluasi' => $each_data['bobot_evaluasi'] ? $each_data['bobot_evaluasi'] : NULL,
            ], [
                'id_basis_evaluasi' => 1,
                'desk_ing' => $each_data['desk_ing'] ? $each_data['desk_ing'] : NULL,
                'create_date' => currDateTime(),
                'id_creator' => guid(),
                'last_update' => currDateTime(),
                'id_updater' => guid(),
                'soft_delete' => 0,
                'last_sync' => currDateTime()
            ]);

            echo " Data berhasil diperbaharui\n";
        });
    }
}
