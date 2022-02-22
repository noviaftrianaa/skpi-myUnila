<?php

namespace Database\Seeders;

use App\Models\PDUT\Temp_iku\Iku345Dosen;
use DB;
use Illuminate\Database\Seeder;

class Iku345DosenSeeder extends Seeder
{
    public function run()
    {
        $this->dosen();
    }

    public function dosen()
    {
        $sql_dosen = "
            SELECT
                sdm.id_sdm,
                aktfptk.id_thn_ajaran AS tahun_ajaran,
                iks.nm_ikatan_kerja AS ikatan_kerja,
                stat.nm_stat_aktif AS status_aktif,
                sdm.nm_sdm AS nama,
                CASE
                    sdm.jk
                    WHEN 'L' THEN 'Laki-Laki'
                    WHEN 'P' THEN 'Perempuan'
                END jenkel,
                datediff(MONTH, sdm.tgl_lahir, getdate()) / 12 - CASE
                    WHEN month(sdm.tgl_lahir) = month(getdate())
                    AND day(sdm.tgl_lahir) > day(getdate()) THEN 1
                    ELSE 0
                END AS usia,
                (
                    SELECT
                        sdm.nidn
                    WHERE
                        LEFT(sdm.nidn, 2) IN (88, 89)
                ) AS nidn,
                (
                    SELECT
                        sdm.nidn
                    WHERE
                        LEFT(sdm.nidn, 2) IN (00, 87)
                ) AS nidk,
                fak.nm_lemb AS asal_fakultas,
                jur.nm_jur AS asal_jurusan,
                jp.nm_jenj_didik AS asal_jenjang_pendidikan,
                prodi.nm_lemb AS asal_prodi
            FROM
                pdrd.sdm AS sdm WITH(NOLOCK)
                JOIN pdrd.reg_ptk AS ptk WITH(NOLOCK) ON ptk.id_sdm = sdm.id_sdm
                AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL
                AND (
                    ptk.tgl_ptk_keluar IS NULL
                    OR ptk.tgl_ptk_keluar > GETDATE()
                )
                JOIN ref.status_kepegawaian AS skep WITH(NOLOCK) ON skep.id_stat_pegawai = ptk.id_stat_pegawai
                JOIN pdrd.keaktifan_ptk AS aktfptk WITH(NOLOCK) ON aktfptk.id_reg_ptk = ptk.id_reg_ptk
                AND aktfptk.soft_delete = 0
                AND aktfptk.a_sp_homebase = 1
                AND aktfptk.id_thn_ajaran = '" . get_tahun_keaktifan() . "'
                LEFT JOIN ref.jenis_sdm AS jsdm WITH(NOLOCK) ON jsdm.id_jns_sdm = sdm.id_jns_sdm
                AND jsdm.expired_date IS NULL
                LEFT JOIN ref.status_keaktifan_pegawai AS aktf WITH(NOLOCK) ON aktf.id_stat_aktif = sdm.id_stat_aktif
                AND aktf.expired_date IS NULL
                LEFT JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = ptk.id_sms
                AND prodi.soft_delete = 0
                LEFT JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prodi.id_induk_sms
                AND fak.soft_delete = 0
                LEFT JOIN ref.jurusan AS jur WITH(NOLOCK) ON jur.id_jur = prodi.id_jur
                AND jur.expired_date IS NULL
                LEFT JOIN ref.jenjang_pendidikan AS jp WITH(NOLOCK) ON jp.id_jenj_didik = prodi.id_jenj_didik
                AND jp.expired_date IS NULL
                LEFT JOIN ref.ikatan_kerja_sdm AS iks WITH(NOLOCK) ON iks.id_ikatan_kerja = ptk.id_ikatan_kerja
                AND iks.expired_date IS NULL
                LEFT JOIN ref.status_keaktifan_pegawai AS stat WITH(NOLOCK) ON stat.id_stat_aktif = sdm.id_stat_aktif
                AND stat.expired_date IS NULL
            WHERE
                sdm.soft_delete = 0
        ";
        // $data_dosen = DB::select($sql_dosen);
        $data_dosen = DB::connection('sqlsrv_live')->select($sql_dosen);
        $no = 1;

        foreach ($data_dosen as $each_data) {
            Iku345Dosen::updateOrInsert([
                'id_sdm' => $each_data->id_sdm
            ], [
                'id_iku345_dosen' => guid(),
                'tahun_ajaran' => $each_data->tahun_ajaran,
                'ikatan_kerja' => $each_data->ikatan_kerja,
                'status_aktif' => $each_data->status_aktif,
                'nama' => $each_data->nama,
                'jenkel' => $each_data->jenkel,
                'usia' => $each_data->usia,
                'nidn' => $each_data->nidn,
                'nidk' => $each_data->nidk,
                'asal_fakultas' => $each_data->asal_fakultas,
                'asal_jurusan' => $each_data->asal_jurusan,
                'asal_jenjang_pendidikan' => $each_data->asal_jenjang_pendidikan,
                'asal_prodi' => $each_data->asal_prodi
            ]);

            $sql_pendidikan = "
                SELECT
                    TOP 1
                    pend.id_rwy_didik_formal,
                    jenj.nm_jenj_didik AS jenjang_studi,
                    CASE
                        WHEN pend.id_sms IS NULL THEN pend.fak
                        ELSE sms.nm_lemb
                    END AS program_studi,
                    gelak.nm_gelar_akad AS gelar_akademik,
                    bid.nm_bid_studi AS bidang_studi,
                    pend.nm_sp_formal AS perguruan_tinggi,
                    pend.thn_masuk AS tahun_masuk,
                    pend.thn_lulus AS tahun_lulus
                FROM
                    pdrd.rwy_pend_formal AS pend WITH(NOLOCK)
                    LEFT JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON pend.id_jenj_didik = jenj.id_jenj_didik
                    AND jenj.expired_date IS NULL
                    LEFT JOIN ref.bidang_studi AS bid WITH(NOLOCK) ON pend.id_bid_studi = bid.id_bid_studi
                    AND bid.expired_date IS NULL
                    LEFT JOIN ref.gelar_akademik AS gelak WITH(NOLOCK) ON pend.id_gelar_akad = gelak.id_gelar_akad
                    AND gelak.expired_date IS NULL
                    LEFT JOIN pdrd.sms AS sms WITH(NOLOCK) ON pend.id_sms = sms.id_sms
                    AND sms.soft_delete = 0
                WHERE
                    pend.soft_delete = 0
                    AND pend.id_sdm = '" . $each_data->id_sdm . "'
                ORDER BY
                    thn_lulus DESC
            ";
            // $data_pendidikan = DB::select($sql_pendidikan);
            $data_pendidikan = DB::connection('sqlsrv_live')->select($sql_pendidikan);

            if (!empty($data_pendidikan)) {
                Iku345Dosen::where('id_sdm', $each_data->id_sdm)->update([
                    'id_rwy_didik_formal' => $data_pendidikan[0]->id_rwy_didik_formal,
                    'jenjang_studi' => $data_pendidikan[0]->jenjang_studi,
                    'program_studi' => $data_pendidikan[0]->program_studi,
                    'gelar_akademik' => $data_pendidikan[0]->gelar_akademik,
                    'bidang_studi' => $data_pendidikan[0]->bidang_studi,
                    'perguruan_tinggi' => $data_pendidikan[0]->perguruan_tinggi,
                    'tahun_masuk' => $data_pendidikan[0]->tahun_masuk,
                    'tahun_lulus' => $data_pendidikan[0]->tahun_lulus,
                    'last_sync' => currDateTime()
                ]);
            }

            echo '*) sync dosen ke-' . $no++ . ' | ' . $each_data->id_sdm . ' | ' . $each_data->asal_prodi . "\n";
            $no++;
        }
    }
}
