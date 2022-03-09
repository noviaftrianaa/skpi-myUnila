<?php

namespace Database\Seeders;

use App\Models\PDUT\Dashboard\DetailIku4;
use App\Models\PDUT\Temp_iku\iku3dosen;
use App\Models\PDUT\Temp_iku\Iku4Pendidikan;
use App\Models\PDUT\Temp_iku\Iku4Sertifikasi;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class Iku4MengajarDalamKampusSeeder extends Seeder
{
    public function run($tahun = 2021, $conn = 1)
    {
        $this->pendidikan($tahun, $conn);
        $this->sertifikasi($tahun, $conn);
        $this->iku($tahun, $conn);
        $this->dashboard($tahun, $conn);
    }

    public function pendidikan($tahun, $conn)
    {
        $sql = "
            SELECT
                ptk.id_sms,
                pend.id_sdm,
                pend.id_rwy_didik_formal,
                jenj.nm_jenj_didik,
                CASE
                    WHEN pend.id_sms IS NULL THEN pend.fak
                    ELSE sms.nm_lemb
                END AS prodi,
                gelak.nm_gelar_akad,
                bid.nm_bid_studi,
                pend.nm_sp_formal,
                pend.thn_masuk,
                pend.thn_lulus
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
                LEFT JOIN pdrd.reg_ptk AS ptk WITH(NOLOCK) ON ptk.id_sdm = pend.id_sdm AND ptk.soft_delete = 0
            WHERE
                pend.soft_delete = 0
            ORDER BY
                thn_lulus DESC
        ";

        if ($conn == 1) {
            $data = DB::connection('sqlsrv_live')->select($sql);
        } else {
            $data = DB::select($sql);
        }

        foreach ($data as $each_data) {
            Iku4Pendidikan::updateOrInsert([
                'id_rwy_didik_formal' => $each_data->id_rwy_didik_formal,
            ], [
                'id_sms' => $each_data->id_sms,
                'id_sdm' => $each_data->id_sdm,
                'id_pendidikan' => guid(),
                'nm_jenj_didik' => $each_data->nm_jenj_didik,
                'prodi' => $each_data->prodi,
                'nm_gelar_akad' => $each_data->nm_gelar_akad,
                'nm_bid_studi' => $each_data->nm_bid_studi,
                'nm_sp_formal' => $each_data->nm_sp_formal,
                'thn_masuk' => $each_data->thn_masuk,
                'thn_lulus' => $each_data->thn_lulus,
                'last_sync' => currDateTime(),
            ]);
        }
    }

    public function sertifikasi($tahun, $conn)
    {
        $sql = "
            SELECT
                sert.id_rwy_sert,
                sert.id_sdm,
                sert.id_jns_sert,
                jsert.nm_jns_sert,
                bids.nm_bid_studi,
                sert.sk_sert,
                sert.thn_sert,
                sert.no_peserta,
                sert.nrg
            FROM
                pdrd.rwy_sertifikasi AS sert WITH(NOLOCK)
                LEFT JOIN ref.jenis_sert AS jsert WITH(NOLOCK) ON sert.id_jns_sert = jsert.id_jns_sert
                AND jsert.expired_date IS NULL
                LEFT JOIN ref.bidang_studi AS bids WITH(NOLOCK) ON sert.id_bid_studi = bids.id_bid_studi
                AND bids.expired_date IS NULL
            WHERE
                sert.soft_delete = 0
                AND sert.thn_sert = '".$tahun."'
        ";

        if ($conn == 1) {
            $data = DB::connection('sqlsrv_live')->select($sql);
        } else {
            $data = DB::select($sql);
        }

        foreach ($data as $each_data) {
            Iku4Sertifikasi::updateOrInsert([
                'id_rwy_sert' => $each_data->id_rwy_sert,
            ], [
                'id_sertifikasi' => guid(),
                'id_sdm' => $each_data->id_sdm,
                'nm_jns_sert' => $each_data->nm_jns_sert,
                'nm_bid_studi' => $each_data->nm_bid_studi,
                'sk_sert' => $each_data->sk_sert,
                'thn_sert' => $each_data->thn_sert,
                'no_peserta' => $each_data->no_peserta,
                'nrg' => $each_data->nrg,
                'last_sync' => currDateTime(),
            ]);
        }
    }

    public function iku($tahun, $conn)
    {
        $s_dosen = "
            SELECT
                dosen.id_sdm,
                dosen.nidk,
                dosen.nm_ikatan_kerja
            FROM
                temp_iku.iku3dosen AS dosen
            WHERE
                dosen.id_thn_ajaran = " . $tahun . "
        ";
        $d_dosen = DB::select($s_dosen);

        foreach ($d_dosen as $each_data) {
            $s_s3 = "
                SELECT
                    COUNT(pend.id_sdm) AS jumlah
                FROM
                    temp_iku.iku4pendidikan AS pend
                WHERE
                    pend.id_sdm = '" . $each_data->id_sdm . "'
                    AND pend.nm_jenj_didik IN('S3', 'S3 Terapan')
            ";
            $d_s3 = DB::select($s_s3);
            $s3 = $d_s3[0]->jumlah;

            if($s3 == 0){
                $s_sertifikasi = "
                    SELECT
                        COUNT(sert.id_sdm) AS jumlah
                    FROM
                        temp_iku.iku4sertifikasi AS sert
                    WHERE
                        sert.id_sdm = '" . $each_data->id_sdm . "'
                        AND sert.nm_jns_sert = 'Sertifikasi Profesi'
                        AND sert.thn_sert = '".$tahun."'
                ";
                $d_sertifikasi = DB::select($s_sertifikasi);
                $sertifikasi = $d_sertifikasi[0]->jumlah;
            } else {
                $sertifikasi = 0;
            }

            if(!empty($each_data->nidk) && ($each_data->nm_ikatan_kerja = 'Dosen dengan Perjanjian Kerja' || $each_data->nm_ikatan_kerja = 'Dosen Tidak Tetap')){
                $s_pengalaman_kerja = "
                    SELECT
                        COUNT(praktisi.id_sdm) AS jumlah
                    FROM
                        temp_iku.iku3praktisi AS praktisi
                        WHERE praktisi.id_sdm = '" . $each_data->id_sdm . "'
                ";
                $d_pengalaman_kerja = DB::select($s_pengalaman_kerja);
                $pengalaman_kerja = $d_pengalaman_kerja[0]->jumlah;
            } else {
                $pengalaman_kerja = 0;
            }

            iku3dosen::where('id_sdm', $each_data->id_sdm)->update([
                'c4_s3' => $s3,
                'c4_sertifikasi' => $sertifikasi,
                'c4_praktisi' => $pengalaman_kerja,
                'last_sync' => currDateTime(),
            ]);
        }
    }

    public function dashboard($tahun, $conn)
    {
        $sql = "
            SELECT
                dosen.id_sms,
                dosen.id_thn_ajaran AS id_tahun_anggaran,
                (SELECT COUNT(nidk) FROM temp_iku.iku3dosen WHERE nidk IS NOT NULL AND id_sms = dosen.id_sms) AS total_dosen_nidk,
                (SELECT COUNT(nidn) FROM temp_iku.iku3dosen WHERE nidn IS NOT NULL AND id_sms = dosen.id_sms) AS total_dosen_nidn,
                (SELECT COUNT(c4_s3) FROM temp_iku.iku3dosen WHERE c4_s3 != 0 AND id_sms = dosen.id_sms) AS total_dosen_s3,
                (SELECT COUNT(c4_praktisi) FROM temp_iku.iku3dosen WHERE c4_praktisi != 0 AND id_sms = dosen.id_sms) AS total_dosen_praktisi,
                (SELECT COUNT(c4_sertifikasi) FROM temp_iku.iku3dosen WHERE c4_sertifikasi != 0 AND id_sms = dosen.id_sms) AS total_dosen_tersertifikasi
            FROM
                temp_iku.iku3dosen AS dosen WITH(NOLOCK)
                WHERE dosen.soft_delete = 0
                AND dosen.id_thn_ajaran = '" . $tahun . "'
            GROUP BY
                dosen.id_sms, dosen.id_thn_ajaran
        ";
        $data = DB::select($sql);

        foreach ($data as $each_data) {
            DetailIku4::updateOrInsert([
                'id_sms' => $each_data->id_sms,
                'id_tahun_anggaran' => $each_data->id_tahun_anggaran,
            ], [
                'id_detail_iku_4' => guid(),
                'total_dosen_nidk' => $each_data->total_dosen_nidk,
                'total_dosen_nidn' => $each_data->total_dosen_nidn,
                'total_dosen_s3' => $each_data->total_dosen_s3,
                'total_dosen_praktisi' => $each_data->total_dosen_praktisi,
                'total_dosen_tersertifikasi' => $each_data->total_dosen_tersertifikasi,
                'create_date' => currDateTime(),
                'last_sync' => currDateTime(),
            ]);
        }
    }
}
