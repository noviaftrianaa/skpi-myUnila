<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule as ValidationRule;

class SdmController extends Controller
{
    protected $request;

    public function __construct(Request $request)
    {
        $this->request = $request;
    }

    public function daftar()
    {
        InputValidator([
            'id_jns_sdm' => 'required|numeric',
            'page' => 'numeric|min:1',
            'limit'    => 'numeric|min:1|max:50',
            'sort_by' => ['alpha', ValidationRule::in(['ASC', 'asc', 'DESC', 'desc'])]
        ]);

        $id_jns_sdm = $this->request->input('id_jns_sdm');
        $sort = "ASC";
        $sort = $this->request->input('sort_by');

        $query = "
                SELECT
                    ptk.id_reg_ptk,
                    sdm.id_sdm,
                    prodi.id_fak_unila AS id_fakultas,
                    prodi.id_jur_unila AS id_jurusan,
                    prodi.id_sms AS id_prodi,
                    sdm.nm_sdm,
                    aktfptk.id_thn_ajaran,
                    CASE
                    sdm.jk
                    WHEN 'L' THEN 'Laki-Laki'
                    WHEN 'P' THEN 'Perempuan'
                    END AS jk,
                    CONCAT(sdm.tmpt_lahir, ', ', sdm.tgl_lahir) AS ttgl_lahir,
                    sdm.nidn,
                    sdm.nip,
                    aktf.nm_stat_aktif,
                    skep.nm_stat_pegawai,
                    iks.nm_ikatan_kerja,
                    jsdm.nm_jns_sdm,
                    fak.nm_lemb AS fakultas,
                    jur.nm_lemb AS jurusan,
                    CONCAT(prodi.nm_lemb, ' (', jp.nm_jenj_didik, ')') AS prodi,
                    sdm.create_date,
                    sdm.last_update
                FROM pdrd.sdm AS sdm
                JOIN pdrd.reg_ptk AS ptk ON ptk.id_sdm = sdm.id_sdm
                    AND ptk.soft_delete = 0
                    AND ptk.id_jns_keluar IS NULL
                    AND (
                        ptk.tgl_ptk_keluar IS NULL
                        OR ptk.tgl_ptk_keluar > GETDATE()
                    )
                LEFT JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = ptk.id_sms
                AND prodi.soft_delete = 0
                LEFT JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prodi.id_fak_unila
                AND fak.soft_delete = 0
                LEFT JOIN pdrd.sms AS jur WITH(NOLOCK) ON jur.id_sms = prodi.id_jur_unila
                AND jur.soft_delete = 0
                LEFT JOIN ref.jenjang_pendidikan AS jp WITH(NOLOCK) ON jp.id_jenj_didik = prodi.id_jenj_didik
                JOIN ref.status_kepegawaian AS skep ON skep.id_stat_pegawai = ptk.id_stat_pegawai
                JOIN pdrd.keaktifan_ptk AS aktfptk ON aktfptk.id_reg_ptk = ptk.id_reg_ptk
                    AND aktfptk.soft_delete = 0
                    AND aktfptk.a_sp_homebase = 1
                    AND aktfptk.id_thn_ajaran = '" . get_tahun_keaktifan() . "'
                LEFT JOIN ref.jenis_sdm AS jsdm ON jsdm.id_jns_sdm = sdm.id_jns_sdm
                LEFT JOIN ref.status_keaktifan_pegawai AS aktf ON aktf.id_stat_aktif = sdm.id_stat_aktif
                LEFT JOIN ref.ikatan_kerja_sdm AS iks WITH(NOLOCK) ON iks.id_ikatan_kerja = ptk.id_ikatan_kerja
                WHERE sdm.id_jns_sdm = '" . $id_jns_sdm . "' AND sdm.soft_delete = 0
                ORDER BY sdm.nm_sdm " . $sort . " ";

        $pagination = CustomPagination($query);
        $query = $pagination['query'];

        $sdms = DB::select($query);
        if (empty($sdms)) {
            return WrapResponse(['data' => null], 'tidak ada daftar SDM yang ditampilkan', FALSE);
        }

        $data = [];
        foreach ($sdms as $value) {
            $data[] = [
                'id_reg_ptk' => $value->id_reg_ptk,
                'id_sdm' => $value->id_sdm,
                'id_fakultas' => $value->id_fakultas,
                'id_jurusan' => $value->id_jurusan,
                'id_prodi' => $value->id_prodi,
                'tahun_ajaran' => $value->id_thn_ajaran,
                'nama_sdm' => $value->nm_sdm,
                'jenis_kelamin' => $value->jk,
                'tmpt_tgl_lahir' => $value->ttgl_lahir,
                'nidn' => $value->nidn,
                'nip' => $value->nip,
                'status_keaktifan' => $value->nm_stat_aktif,
                'status_pegawai' => $value->nm_stat_pegawai,
                'ikatan_kerja' => $value->nm_ikatan_kerja,
                'fakultas' => $value->fakultas,
                'jurusan' => $value->jurusan,
                'prodi' => $value->prodi,
                'waktu_data_ditambahkan' => $value->create_date,
                'terakhir_diubah' => $value->last_update
            ];
        }

        return WrapResponse(['data' => $data], 'daftar SDM', TRUE);
    }

    public function daftar_id()
    {
        InputValidator([
            'id_jns_sdm' => 'required|numeric',
            'id_sms' => 'required|uuid',
            'page' => 'numeric|min:1',
            'limit'    => 'numeric|min:1|max:50',
            'sort_by' => ['alpha', ValidationRule::in(['ASC', 'asc', 'DESC', 'desc'])]
        ]);

        $id_jns_sdm = $this->request->input('id_jns_sdm');
        $id_sms = $this->request->input('id_sms');

        $sort = "ASC";
        $sort = $this->request->input('sort_by');

        $query = "
        SELECT
            pt.id_reg_ptk,
            sdm.id_sdm,
            prodi.id_fak_unila AS id_fakultas,
            prodi.id_jur_unila AS id_jurusan,
            prodi.id_sms AS id_prodi,
            sdm.nm_sdm,
            aktfptk.id_thn_ajaran,
            CASE
            sdm.jk
            WHEN 'L' THEN 'Laki-Laki'
            WHEN 'P' THEN 'Perempuan'
            END AS jk,
            CONCAT(sdm.tmpt_lahir, ', ', sdm.tgl_lahir) AS ttgl_lahir,
            sdm.nidn,
            sdm.nip,
            aktf.nm_stat_aktif,
            skep.nm_stat_pegawai,
            iks.nm_ikatan_kerja,
            jsdm.nm_jns_sdm,
            fak.nm_lemb AS fakultas,
            jur.nm_lemb AS jurusan,
            CONCAT(prodi.nm_lemb, ' (', jp.nm_jenj_didik, ')') AS prodi,
            sdm.create_date,
            sdm.last_update
        FROM pdrd.sdm AS sdm
        JOIN pdrd.reg_ptk AS ptk ON ptk.id_sdm = sdm.id_sdm
            AND ptk.soft_delete = 0
            AND ptk.id_jns_keluar IS NULL
            AND (
                ptk.tgl_ptk_keluar IS NULL
                OR ptk.tgl_ptk_keluar > GETDATE()
            )
        LEFT JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = ptk.id_sms
        AND prodi.soft_delete = 0
        LEFT JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prodi.id_fak_unila
        AND fak.soft_delete = 0
        LEFT JOIN pdrd.sms AS jur WITH(NOLOCK) ON jur.id_sms = prodi.id_jur_unila
        AND jur.soft_delete = 0
        LEFT JOIN ref.jenjang_pendidikan AS jp WITH(NOLOCK) ON jp.id_jenj_didik = prodi.id_jenj_didik
        JOIN ref.status_kepegawaian AS skep ON skep.id_stat_pegawai = ptk.id_stat_pegawai
        JOIN pdrd.keaktifan_ptk AS aktfptk ON aktfptk.id_reg_ptk = ptk.id_reg_ptk
            AND aktfptk.soft_delete = 0
            AND aktfptk.a_sp_homebase = 1
            AND aktfptk.id_thn_ajaran = '" . get_tahun_keaktifan() . "'
        LEFT JOIN ref.jenis_sdm AS jsdm ON jsdm.id_jns_sdm = sdm.id_jns_sdm
        LEFT JOIN ref.status_keaktifan_pegawai AS aktf ON aktf.id_stat_aktif = sdm.id_stat_aktif
        LEFT JOIN ref.ikatan_kerja_sdm AS iks WITH(NOLOCK) ON iks.id_ikatan_kerja = ptk.id_ikatan_kerja
        WHERE sdm.id_jns_sdm = '" . $id_jns_sdm . "' AND sdm.soft_delete = 0 AND
        (prodi.id_sms = '" . $id_sms . "' OR prodi.id_fak_unila = '" . $id_sms . "' OR prodi.id_jur_unila = '" . $id_sms . "')
        ORDER BY sdm.nm_sdm " . $sort . " ";

        $pagination = CustomPagination($query);
        $query = $pagination['query'];

        $sdms = DB::select($query);
        if (empty($sdms)) {
            return WrapResponse(['data' => null], 'tidak ada daftar SDM yang ditampilkan', FALSE);
        }

        $data = [];
        foreach ($sdms as $value) {
            $data[] = [
                'id_reg_ptk' => $value->id_reg_ptk,
                'id_sdm' => $value->id_sdm,
                'id_fakultas' => $value->id_fakultas,
                'id_jurusan' => $value->id_jurusan,
                'id_prodi' => $value->id_prodi,
                'tahun_ajaran' => $value->id_thn_ajaran,
                'nama_sdm' => $value->nm_sdm,
                'jenis_kelamin' => $value->jk,
                'tmpt_tgl_lahir' => $value->ttgl_lahir,
                'nidn' => $value->nidn,
                'nip' => $value->nip,
                'status_keaktifan' => $value->nm_stat_aktif,
                'status_pegawai' => $value->nm_stat_pegawai,
                'ikatan_kerja' => $value->nm_ikatan_kerja,
                'fakultas' => $value->fakultas,
                'jurusan' => $value->jurusan,
                'prodi' => $value->prodi,
                'waktu_data_ditambahkan' => $value->create_date,
                'terakhir_diubah' => $value->last_update
            ];
        }

        return WrapResponse(['data' => $data], 'daftar SDM berdasarkan ID', TRUE);
    }

    public function detail()
    {
        InputValidator([
            'id_jns_sdm' => 'required|numeric',
            'id_sdm' => 'required|uuid'
        ]);

        $id_sdm = $this->request->input('id_sdm');
        $id_jns_sdm = $this->request->input('id_jns_sdm');

        $q_sdm = "
            SELECT
                ptk.id_reg_ptk,
                sdm.id_sdm,
                prodi.id_fak_unila AS id_fakultas,
                prodi.id_jur_unila AS id_jurusan,
                prodi.id_sms AS id_prodi,
                sdm.nm_sdm,
                aktfptk.id_thn_ajaran,
                CASE
                    sdm.jk
                    WHEN 'L' THEN 'Laki-Laki'
                    WHEN 'P' THEN 'Perempuan'
                END AS jk,
                CONCAT(sdm.tmpt_lahir, ', ', sdm.tgl_lahir) AS ttgl_lahir,
                sdm.nidn,
                sdm.nip,
                aktf.nm_stat_aktif,
                skep.nm_stat_pegawai,
                iks.nm_ikatan_kerja,
                jsdm.nm_jns_sdm,
                fak.nm_lemb AS fakultas,
                jur.nm_lemb AS jurusan,
                CONCAT(prodi.nm_lemb, ' (', jp.nm_jenj_didik, ')') AS prodi,
                ptk.no_srt_tgs,
                ptk.tgl_srt_tgs,
                ptk.tmt_srt_tgs,
                ptk.id_stat_pegawai,
                ptk.id_ikatan_kerja,
                sdm.create_date,
                sdm.last_update
            FROM
                pdrd.sdm AS sdm
                JOIN pdrd.reg_ptk AS ptk ON ptk.id_sdm = sdm.id_sdm
                AND ptk.soft_delete = 0
                AND ptk.id_jns_keluar IS NULL
                AND (
                    ptk.tgl_ptk_keluar IS NULL
                    OR ptk.tgl_ptk_keluar > GETDATE()
                )
                LEFT JOIN pdrd.sms AS prodi WITH(NOLOCK) ON prodi.id_sms = ptk.id_sms
                AND prodi.soft_delete = 0
                LEFT JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = prodi.id_fak_unila
                AND fak.soft_delete = 0
                LEFT JOIN pdrd.sms AS jur WITH(NOLOCK) ON jur.id_sms = prodi.id_jur_unila
                AND jur.soft_delete = 0
                LEFT JOIN ref.jenjang_pendidikan AS jp WITH(NOLOCK) ON jp.id_jenj_didik = prodi.id_jenj_didik
                JOIN ref.status_kepegawaian AS skep ON skep.id_stat_pegawai = ptk.id_stat_pegawai
                JOIN pdrd.keaktifan_ptk AS aktfptk ON aktfptk.id_reg_ptk = ptk.id_reg_ptk
                AND aktfptk.soft_delete = 0
                AND aktfptk.a_sp_homebase = 1
                AND aktfptk.id_thn_ajaran = '" . get_tahun_keaktifan() . "'
                LEFT JOIN ref.jenis_sdm AS jsdm ON jsdm.id_jns_sdm = sdm.id_jns_sdm
                LEFT JOIN ref.status_keaktifan_pegawai AS aktf ON aktf.id_stat_aktif = sdm.id_stat_aktif
                LEFT JOIN ref.ikatan_kerja_sdm AS iks WITH(NOLOCK) ON iks.id_ikatan_kerja = ptk.id_ikatan_kerja
            WHERE
                sdm.id_sdm = '" . $id_sdm . "'
                AND sdm.id_jns_sdm = '" . $id_jns_sdm . "'
                AND sdm.soft_delete = 0
        ";

        $q_pend = "
            SELECT
                pend.id_rwy_didik_formal,
                jenj.nm_jenj_didik,
                CASE
                    WHEN pend.id_sms IS NULL THEN pend.fak
                    ELSE sms.nm_lemb
                END AS prodi,
                gelak.singkat_gelar,
                bid.nm_bid_studi,
                pend.nm_sp_formal,
                pend.thn_masuk,
                pend.thn_lulus,
                pend.create_date,
                pend.last_update
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
                pend.id_sdm = '" . $id_sdm . "'
                AND pend.soft_delete = 0
            ORDER BY
                thn_lulus DESC
        ";

        $q_fungsi = "
            SELECT
                fungs.id_rwy_jabfung,
                jab.nm_jabfung,
                kelbid.nm_kel_bidang,
                fungs.sk_jabfung,
                fungs.tmt_sk_jabfung,
                fungs.angka_kredit,
                fungs.lebih_ajar,
                fungs.lebih_lit,
                fungs.lebih_pengmas,
                fungs.lebih_tunjang,
                fungs.bidang_ilmu,
                fungs.create_date,
                fungs.last_update
            FROM
                pdrd.rwy_fungsional AS fungs WITH(NOLOCK)
                LEFT JOIN ref.jabfung AS jab WITH(NOLOCK) ON fungs.id_jabfung = jab.id_jabfung
                AND jab.expired_date IS NULL
                LEFT JOIN ref.kelompok_bidang AS kelbid WITH(NOLOCK) ON fungs.id_kel_bidang = kelbid.id_kel_bidang
                AND kelbid.expired_date IS NULL
            WHERE
                fungs.soft_delete = 0
                AND fungs.id_sdm = '" . $id_sdm . "'
            ORDER BY fungs.tmt_sk_jabfung DESC
        ";

        $q_pangk = "
            SELECT
                pang.id_rwy_pangkat,
                pangol.nm_pangkat,
                pangol.kode_gol,
                pang.sk_pangkat,
                pang.tgl_sk_pangkat,
                pang.tmt_sk_pangkat,
                pang.masa_kerja_gol_thn,
                pang.masa_kerja_gol_bln,
                pang.create_date,
                pang.last_update
            FROM
                pdrd.rwy_kepangkatan AS pang WITH(NOLOCK)
                LEFT JOIN ref.pangkat_golongan AS pangol WITH(NOLOCK) ON pang.id_pangkat_gol = pangol.id_pangkat_gol
                AND pangol.expired_date IS NULL
                WHERE pang.soft_delete = 0
                AND pang.id_sdm = '" . $id_sdm . "'
            ORDER BY pang.tmt_sk_pangkat DESC
        ";

        $d_sdm = DB::select($q_sdm);
        if (!empty($d_sdm)) {
            foreach ($d_sdm as $value) {
                $data_sdm[] = [
                    'id_reg_ptk' => $value->id_reg_ptk,
                    'id_sdm' => $value->id_sdm,
                    'id_fakultas' => $value->id_fakultas,
                    'id_jurusan' => $value->id_jurusan,
                    'id_prodi' => $value->id_prodi,
                    'tahun_ajaran' => $value->id_thn_ajaran,
                    'nama_sdm' => $value->nm_sdm,
                    'jenis_kelamin' => $value->jk,
                    'tmpt_tgl_lahir' => $value->ttgl_lahir,
                    'nidn' => $value->nidn,
                    'nip' => $value->nip,
                    'status_keaktifan' => $value->nm_stat_aktif,
                    'status_pegawai' => $value->nm_stat_pegawai,
                    'ikatan_kerja' => $value->nm_ikatan_kerja,
                    'fakultas' => $value->fakultas,
                    'jurusan' => $value->jurusan,
                    'prodi' => $value->prodi,
                    'no_srt_tgs' => $value->no_srt_tgs,
                    'tgl_srt_tgs' => $value->tgl_srt_tgs,
                    'tmt_srt_tgs' => $value->tmt_srt_tgs,
                    'id_stat_pegawai' => $value->id_stat_pegawai,
                    'id_ikatan_kerja' => $value->id_ikatan_kerja,
                    'waktu_data_ditambahkan' => $value->create_date,
                    'terakhir_diubah' => $value->last_update
                ];
            }
        } else {
            return WrapResponse(['data' => null], 'tidak ada daftar SDM yang ditampilkan', FALSE);
        }

        $q_aktifptk = "
            SELECT
                kp.id_thn_ajaran,
                kp.a_sp_homebase,
                kp.a_aktif_bln_1,
                kp.a_aktif_bln_2,
                kp.a_aktif_bln_3,
                kp.a_aktif_bln_4,
                kp.a_aktif_bln_5,
                kp.a_aktif_bln_6,
                kp.a_aktif_bln_7,
                kp.a_aktif_bln_8,
                kp.a_aktif_bln_9,
                kp.a_aktif_bln_10,
                kp.a_aktif_bln_11,
                kp.a_aktif_bln_12,
                kp.create_date,
                kp.last_update
            FROM
                pdrd.keaktifan_ptk kp
            WHERE
                kp.soft_delete = 0
                AND kp.id_reg_ptk = '" . $d_sdm[0]->id_reg_ptk . "'";

        $d_aktifptk = DB::select($q_aktifptk);
        if (!empty($d_aktifptk)) {
            foreach ($d_aktifptk as $value) {
                $data_aktifptk[] = [
                    'id_thn_ajaran' => $value->id_thn_ajaran,
                    'a_sp_homebase' => $value->a_sp_homebase,
                    'a_aktif_bln_1' => $value->a_aktif_bln_1,
                    'a_aktif_bln_2' => $value->a_aktif_bln_2,
                    'a_aktif_bln_3' => $value->a_aktif_bln_3,
                    'a_aktif_bln_4' => $value->a_aktif_bln_4,
                    'a_aktif_bln_5' => $value->a_aktif_bln_5,
                    'a_aktif_bln_6' => $value->a_aktif_bln_6,
                    'a_aktif_bln_7' => $value->a_aktif_bln_7,
                    'a_aktif_bln_8' => $value->a_aktif_bln_8,
                    'a_aktif_bln_9' => $value->a_aktif_bln_9,
                    'a_aktif_bln_10' => $value->a_aktif_bln_10,
                    'a_aktif_bln_11' => $value->a_aktif_bln_11,
                    'a_aktif_bln_12' => $value->a_aktif_bln_12,
                    'waktu_data_ditambahkan' => $value->create_date,
                    'terakhir_diubah' => $value->last_update
                ];
            }
        } else {
            $data_aktifptk = null;
        }

        $d_pend = DB::select($q_pend);
        if (!empty($d_pend)) {
            foreach ($d_pend as $value) {
                $data_pend[] = [
                    'id_rwy_didik_formal' => $value->id_rwy_didik_formal,
                    'jenjang_pendidikan' => $value->nm_jenj_didik,
                    'prodi' => $value->prodi,
                    'gelar_akademik' => $value->singkat_gelar,
                    'bidang_studi' => $value->nm_bid_studi,
                    'nama_sp' => $value->nm_sp_formal,
                    'tahun_masuk' => $value->thn_masuk,
                    'tahun_lulus' => $value->thn_lulus,
                    'waktu_data_ditambahkan' => $value->create_date,
                    'terakhir_diubah' => $value->last_update
                ];
            }
        } else {
            $data_pend = null;
        }

        $d_fungsi = DB::select($q_fungsi);
        if (!empty($d_fungsi)) {
            foreach ($d_fungsi as $value) {
                $data_fungsi[] = [
                    'id_rwy_jabfung' => $value->id_rwy_jabfung,
                    'jabfung' => $value->nm_jabfung,
                    'kel_bidang' => $value->nm_kel_bidang,
                    'sk_jabfung' => $value->sk_jabfung,
                    'tmt_sk_jabfung' => $value->tmt_sk_jabfung,
                    'angka_kredit' => $value->angka_kredit,
                    'lebih_ajar' => $value->lebih_ajar,
                    'lebih_lit' => $value->lebih_lit,
                    'lebih_pengmas' => $value->lebih_pengmas,
                    'lebih_tunjang' => $value->lebih_tunjang,
                    'bidang_ilmu' => $value->bidang_ilmu,
                    'waktu_data_ditambahkan' => $value->create_date,
                    'terakhir_diubah' => $value->last_update
                ];
            }
        } else {
            $data_fungsi = null;
        }

        $d_pngk = DB::select($q_pangk);
        if (!empty($d_pngk)) {
            foreach ($d_pngk as $value) {
                $data_pangk[] = [
                    'id_rwy_pangkat' => $value->id_rwy_pangkat,
                    'nm_pangkat' => $value->nm_pangkat,
                    'kode_gol' => $value->kode_gol,
                    'sk_pangkat' => $value->sk_pangkat,
                    'tgl_sk_pangkat' => $value->tgl_sk_pangkat,
                    'tmt_sk_pangkat' => $value->tmt_sk_pangkat,
                    'masa_kerja_gol_thn' => $value->masa_kerja_gol_thn,
                    'masa_kerja_gol_bln' => $value->masa_kerja_gol_bln,
                    'waktu_data_ditambahkan' => $value->create_date,
                    'terakhir_diubah' => $value->last_update
                ];
            }
        } else {
            $data_pangk = null;
        }

        $data = [
            'sdm' => $data_sdm,
            'keaktifan_ptk' => $data_aktifptk,
            'pendidikan' => $data_pend,
            'fungsional' => $data_fungsi,
            'kepangkatan' => $data_pangk
        ];

        return WrapResponse(['data' => $data], 'detail SDM', TRUE);
    }
}
