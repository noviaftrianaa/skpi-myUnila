<?php

namespace Database\Seeders;


use App\Models\PDUT\Kerjasama\Mou;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Rap2hpoutre\FastExcel\FastExcel;

class MouSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $this->importDataMou();
        // $this->importDataReMatkul();
        // $this->tempIku();
        // $this->totalDashboard();
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

    public function importDataMou()
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

        $file_path = storage_path('uploads/IKU6.xlsx');
        $data_mou = (new FastExcel)->configureCsv(';', '#', 'gbk')->sheet(1)->import($file_path, function ($each_data) {

            $id_sp = 'E2B705A7-173E-464A-9FAC-509128709515';

            //tambah mou
            $mou = Mou::create([
                'id_mou'=> guid(),
                'id_sp'=> $each_data['id_sp'],
                'id_dudi'=> NULL,
                'sk_mou'=>  $each_data['sk_mou'],         
                'judul_mou'=>  $each_data['judul_mou'],       
                'uraian_mou'=>  $each_data['uraian_mou'],          
                'tgl_mulai'=>  $each_data['tgl_mulai'],             
                'tgl_selesai'=>  $each_data['tgl_selesai'],             
                'nm_dudi'=>  NULL,      
                'npwp_dudi'=>  NULL,         
                'nm_bu'=>  NULL,       
                'tel_kantor'=>  NULL,     
                'fax'=> NULL,
                'cp'=>  NULL,    
                'tel_cp'=>  NULL,
                'jab_cp'=>  NULL,
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

