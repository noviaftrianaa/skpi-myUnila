<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule as ValidationRule;
use App\Models\PDUT\Pdrd\Sdm;

class SdmTendikController extends Controller
{
    protected $request;
    protected $sdm;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->sdm = new Sdm();
    }

    public function list()
    {
        InputValidator([
            'page' => 'numeric|min:1',
            'count'    => 'numeric|min:1|max:50',
            'sortby' => ['alpha', ValidationRule::in(['ASC', 'asc', 'DESC', 'desc'])]
        ], [
            'page.numeric'  => 'input page hanya berupa angka',
            'page.min'      => 'input count hanya berupa angka minimal 1',
            'count.numeric' => 'input count hanya berupa angka',
            'count.min'     => 'input count hanya berupa angka minimal 1',
            'count.max'     => 'input count hanya berupa angka tidak boleh lebih dari 50',
            'sortby.alpha'  => 'input sortby penyortiran tidak sesuai',
            'sortby.in'     => 'input sortby penyortiran hanya ASC,asc atau DESC,desc'
        ]);

        $sortby = "ASC";
        $sortby = $this->request->input('sortby');

        if (!empty($sortby)) {
            $sortby = $sortby;
        }

        try {
            $query = "
                SELECT
                    sdm.id_sdm,
                    sdm.nm_sdm AS nama_sdm,
                    sdm.jk,
                    sdm.nidn,
                    sdm.nip,
                    aktf.nm_stat_aktif AS nama_status_aktif,
                    skep.nm_stat_pegawai AS nama_status_pegawai,
                    jsdm.nm_jns_sdm AS jenis_sdm,
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
                JOIN ref.status_kepegawaian AS skep ON skep.id_stat_pegawai = ptk.id_stat_pegawai
                JOIN pdrd.keaktifan_ptk AS aktfptk ON aktfptk.id_reg_ptk = ptk.id_reg_ptk
                    AND aktfptk.soft_delete = 0
                    AND aktfptk.a_sp_homebase = 1
                    AND aktfptk.id_thn_ajaran = '" . get_tahun_keaktifan() . "'
                LEFT JOIN ref.jenis_sdm AS jsdm ON jsdm.id_jns_sdm = sdm.id_jns_sdm
                LEFT JOIN ref.status_keaktifan_pegawai AS aktf ON aktf.id_stat_aktif = sdm.id_stat_aktif
                WHERE sdm.id_jns_sdm = 13 AND sdm.soft_delete = 0
                ORDER BY sdm.nm_sdm " . $sortby . " ";

            $pagination = CustomPagination($query);
            $query = $pagination['query'];

            $sdms = DB::select($query);
            if (empty($sdms)) {
                return WrapResponse(['data' => null], 'tidak ada daftar tendik yang ditampilkan', FALSE);
            }

            $data = [];
            foreach ($sdms as $value) {
                $data[] = [
                    'id_sdm' => $value->id_sdm,
                    'nama_sdm' => $value->nama_sdm,
                    'jk' => $value->jk,
                    'nidn' => $value->nidn,
                    'nip' => $value->nip,
                    'nama_status_aktif' => $value->nama_status_aktif,
                    'nama_status_pegawai' => $value->nama_status_pegawai,
                    'jenis_sdm' => $value->jenis_sdm,
                    'waktu_data_ditambahkan' => $value->create_date,
                    'terakhir_diubah' => $value->last_update
                ];
            }
        } catch (\Throwable $th) {
            return WrapResponse(['data' => null], 'gagal mendapatkan daftar tendik', FALSE);
        }
        return WrapResponse(['data' => $data], 'daftar tendik', TRUE);
    }

    public function detail()
    {
        InputValidator([
            'id_sdm' => 'required|uuid'
        ], [
            'id_sdm.required'  => 'input id_sdm harus diisi',
            'id_sdm.uuid'  => 'input id_sdm harus berupa UUID yang valid'
        ]);

        $id_sdm = $this->request->input('id_sdm');

        try {
            $query = "SELECT TOP 1
                -- PROFIL
                -- sdm.id_blob,
                sdm.id_sdm,
                sdm.nidn,
                sdm.nm_sdm,
                CASE sdm.jk WHEN 'L' THEN 'Laki-laki' WHEN 'P' THEN 'Perempuan' END AS jk,
                sdm.tmpt_lahir,
                sdm.tgl_lahir,
                -- sdm.nm_ibu_kandung,
                -- KEPENDUDUKAN
                sdm.nik,
                ag.nm_agama,
                kwg.nm_negara,
                -- KELUARGA
                CASE sdm.stat_kawin WHEN '0' THEN 'Belum Kawin' WHEN '1' THEN 'Kawin' END AS stat_kawin,
                sdm.nm_suami_istri,
                sdm.nip_suami_istri,
                pk.nm_pekerjaan AS pekerjaan_suami_istri,
                -- sdm.tgl_sk_cpns_suami_istri
                -- BIDANG KEILMUAN
                -- ALAMAT & KONTAK
                sdm.email,
                --  sdm.jln,
                --  sdm.rt,
                --  sdm.rw,
                --  sdm.nm_dsn,
                --  sdm.ds_kel,
                kab.nm_wil AS kabupaten,
                prov.nm_wil AS provinsi,
                --  sdm.kode_pos,
                sdm.no_tel_rmh,
                sdm.no_hp,
                -- KEPEGAIWAIAN
                prodi.nm_lemb AS prodi,
                jur.nm_jur AS jurusan,
                fak.nm_lemb AS fakultas,
                sdm.nip,
                jp.nm_jns_sdm,
                skp.nm_stat_aktif,
                sdm.sk_cpns,
                sdm.tgl_sk_cpns,
                sdm.sk_angkat,
                sdm.tmt_sk_angkat,
                sg.nm_sumber_gaji,
                sdm.niy_nigk,
                sdm.nuptk,
                rp.tmt_srt_tgs,
                lp.nm_lemb_angkat,
                -- LAIN-LAIN
                sdm.npwp,
                sdm.nm_wp
                -- sdm.sinta_id,
                FROM pdrd.sdm AS sdm
                --  LEFT JOIN dok.large_object as lo on lo.id_blob = sdm.id_blob
                LEFT JOIN ref.jenis_sdm AS jp ON jp.id_jns_sdm = sdm.id_jns_sdm
                LEFT JOIN ref.agama AS ag ON ag.id_agama = sdm.id_agama
                LEFT JOIN ref.wilayah AS kab ON kab.id_wil = sdm.id_wil
                LEFT JOIN ref.status_keaktifan_pegawai AS skp ON skp.id_stat_aktif = sdm.id_stat_aktif
                LEFT JOIN ref.lembaga_pengangkat AS lp ON lp.id_lemb_angkat = sdm.id_lemb_angkat
                LEFT JOIN ref.keahlian_lab AS kl ON kl.id_keahlian_lab = sdm.id_keahlian_lab
                LEFT JOIN ref.sumber_gaji AS sg ON sg.id_sumber_gaji = sdm.id_sumber_gaji
                LEFT JOIN ref.pekerjaan AS pk ON pk.id_pekerjaan = sdm.id_pekerjaan_suami_istri
                LEFT JOIN ref.wilayah AS prov ON prov.id_wil = kab.id_induk_wilayah
                LEFT JOIN ref.negara AS kwg ON kwg.id_negara = sdm.kewarganegaraan
                LEFT JOIN pdrd.reg_ptk AS rp ON rp.id_sdm = sdm.id_sdm
                LEFT JOIN pdrd.sms AS prodi ON prodi.id_sms = rp.id_sms
                LEFT JOIN pdrd.sms AS fak ON fak.id_sms = prodi.id_induk_sms
                LEFT JOIN ref.jurusan AS jur ON jur.id_jur = prodi.id_jur
                LEFT JOIN ref.status_kepegawaian AS sk ON rp.id_stat_pegawai = sk.id_stat_pegawai
                WHERE sdm.id_jns_sdm = 13 AND sdm.soft_delete = 0
                AND sdm.id_sdm = '" . $id_sdm . "' ";

            $sdms = DB::select($query);
            if (empty($sdms)) {
                return WrapResponse(['data' => null], 'tidak ada detail tendik yang ditampilkan', FALSE);
            }

            $data = [];
            foreach ($sdms as $value) {
                $data['profil'] = [
                    'nidn' => $value->nidn,
                    'nama' => $value->nm_sdm,
                    'tempat_lahir' => $value->tmpt_lahir,
                    'tanggal_lahir' => $value->tgl_lahir,
                    'nama_ibu_kandung' => ''
                ];
                $data['kependudukan'] = [
                    'nik' => $value->nik,
                    'agama' => $value->nm_agama,
                    'kewarganegaraan' => $value->nm_negara,
                ];
                $data['keluarga'] = [
                    'status_perkawinan' => $value->stat_kawin,
                    'nama_suami_istri' => $value->nm_suami_istri,
                    'nip_suami_istri' => $value->nip_suami_istri,
                    'pekerjaan_suami_istri' => $value->pekerjaan_suami_istri,
                    'terhitung_pns_suami_istri' => ''
                ];
                $data['bidang_keilmuan'] = [
                    'bidang_keilmuan' => ''
                ];
                $data['alamat_kontak'] = [
                    'email' => $value->email,
                    'alamat' => '',
                    'rt' => '',
                    'rw' => '',
                    'dusun' => '',
                    'kelurahan' => $value->nidn,
                    'kota' => $value->kabupaten,
                    'provinsi' => $value->provinsi,
                    'kode_pos' => '',
                    'telpon_rumah' => $value->no_tel_rmh,
                    'telpon_hp' => $value->no_hp
                ];
                $data['kepegawaian'] = [
                    'program_studi' => $value->prodi,
                    'nip' => $value->nip,
                    'status_kepagawaian' => $value->nm_jns_sdm,
                    'status_keaktifan' => $value->nm_stat_aktif,
                    'sk_cpns' => $value->sk_cpns,
                    'tgl_sk_cpns' => $value->tgl_sk_cpns,
                    'sk_tmmd' => $value->sk_angkat,
                    'tgl_sk_tmmd' => $value->tmt_sk_angkat,
                    'pangkat_golongan' => '',
                    'sumber_gaji' => $value->nm_sumber_gaji,
                ];
                $data['lain_lain'] = [
                    'npwp' => $value->npwp,
                    'nama_npwp' => $value->nm_wp,
                    'sinta_id' => ''
                ];
            }
        } catch (\Throwable $th) {
            return WrapResponse(['data' => null], 'gagal mendapatkan detail tendik', FALSE);
        }
        return WrapResponse(['data' => $data], 'detail tendik', TRUE);
    }
}
