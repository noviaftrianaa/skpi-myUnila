<?php

namespace Database\Seeders;


use App\Models\PDUT\Dashboard\DetailIku7;
use App\Models\PDUT\Pdrd\AktAjarDosen;
use App\Models\PDUT\Pdrd\KelasKuliah;
use App\Models\PDUT\Pdrd\KurikulumSp;
use App\Models\PDUT\Pdrd\Matkul;
use App\Models\PDUT\Pdrd\MatkulKurikulum;
use App\Models\PDUT\Pdrd\ReMk;
use App\Models\PDUT\Ref\BasisEvaluasi;
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
        //$this->importDataMatkul();
        //$this->importDataReMatkul();
        //$this->tempIku();
        //$this->totalDashboard();
        $this->importDataBasisEvaluasi();
    }

    public function tempIku()
    {
        $temp_iku7 = DB::SELECT("
            SELECT
                DISTINCT mk.id_mk,
                smt.id_thn_ajaran,
                fak.nm_lemb AS nm_fakultas,
                CONCAT(sms.nm_lemb, ' (', jenjang.nm_jenj_didik, ')') AS nm_prodi,
                mk.nm_mk,
                mk.sks_mk,
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
                JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.nm_jenj_didik IN ('D2', 'D3', 'D4', 'S1')
                AND jenjang.expired_date IS NULL
                LEFT JOIN pdrd.kelas_kuliah AS kk WITH(NOLOCK) ON kk.id_mk = mk.id_mk
                AND kk.soft_delete = 0
                JOIN ref.semester AS smt ON smt.id_smt = kk.id_smt
                AND smt.id_thn_ajaran >= YEAR(GETDATE()) -3
                AND smt.expired_date IS NULL
            WHERE
                re_mk.komponen_evaluasi IN ('AKP', 'HSP')
                AND re_mk.soft_delete = 0
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
                'nm_dosen' => $each_data->nm_fakultas,
                'nidn' => NULL,
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



    public function importDataReMatkul()
    {



        $file_path = storage_path('uploads/re_mk.xlsx');
        $data_matkul = (new FastExcel)->configureCsv(';', '#', 'gbk')->sheet(1)->import($file_path, function ($each_data) {

            // $matkul = DB::SELECT("
            //     SELECT
            //         mk.id_mk
            //     FROM
            //         pdrd.matkul AS mk
            //     WHERE
            //         mk.kode_mk = ?
            //         AND mk.soft_delete = 0
            // ", [$each_data['kode_mk']]);

            $id_creator = '26004417-6e92-463c-bf35-f741817121dc';
            // tambah re_mk
            $data_remk = ReMk::create([
                'id_basis_evaluasi' => $each_data['id_evaluasi_mk'],
                'id_mk' => $each_data['id_mk'],
                'komponen_evaluasi' => $each_data['komponen_evaluasi'] ? $each_data['komponen_evaluasi'] : NULL,
                'desk_indo' => $each_data['desk_indo'],
                'bobot_evaluasi' => $each_data['bobot_evaluasi'] ? $each_data['bobot_evaluasi'] : NULL,
                'desk_ing' => NULL,
                'create_date' => currDateTime(),
                'id_creator' => $id_creator,
                'last_update' => currDateTime(),
                'soft_delete' => 0,
                'last_sync' => currDateTime()
            ]);

            echo " Data berhasil diperbaharui\n";
        });
    }

    public function importDataBasisEvaluasi()
    {

        $file_path = storage_path('uploads/basisEvaluasi.xlsx');
        $data_basis_evaluasi = (new FastExcel)->configureCsv(';', '#', 'gbk')->sheet(2)->import($file_path, function ($each_data) {

            $basis_evaluasi = BasisEvaluasi::create([
                'id_basis_evaluasi' => $each_data['id_basis_evaluasi'],
                'nm_basis_evaluasi' => $each_data['nm_basis_evaluasi'],
                'create_date' => currDateTime(),
                'last_update' => currDateTime(),
                'expired_date' => currDateTime(),
                'last_sync' => currDateTime()
            ]);
            echo " Data berhasil diperbaharui\n";
        });
    }
}
