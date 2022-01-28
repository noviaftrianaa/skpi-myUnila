<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule as ValidationRule;

class SdmDosenController extends Controller
{
    public function list(Request $request)
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

        $page = 1;
        $count = 10;
        $sortby = "ASC";

        if (!empty($request->sortby)) {
            $sortby = $request->sortby;
        }
        if (!empty($request->page)) {
            $page = $request->page;
        }
        if (!empty($request->count)) {
            if ($request->count > 50) {
                $count = 50;
            } else {
                $count = $request->count;
            }
        }

        try {
            $dosen = DB::select("
            DECLARE @PageNumber AS INT DECLARE @RowsOfPage AS INT
            SET @PageNumber = ?
            SET @RowsOfPage = ?
            SELECT sdm.id_sdm, sdm.nm_sdm AS nama_sdm, sdm.jk, sdm.nidn, sdm.nip, aktf.nm_stat_aktif AS nama_status_aktif, skep.nm_stat_pegawai AS nama_status_pegawai, jsdm.nm_jns_sdm AS jenis_sdm
            FROM pdrd.sdm AS sdm
            JOIN pdrd.reg_ptk AS ptk ON ptk.id_sdm = sdm.id_sdm AND ptk.soft_delete = 0 AND ptk.id_jns_keluar IS NULL AND ( ptk.tgl_ptk_keluar IS NULL OR ptk.tgl_ptk_keluar > GETDATE() )
            JOIN ref.status_kepegawaian AS skep ON skep.id_stat_pegawai = ptk.id_stat_pegawai
            JOIN pdrd.keaktifan_ptk AS aktfptk ON aktfptk.id_reg_ptk = ptk.id_reg_ptk AND aktfptk.soft_delete = 0 AND aktfptk.a_sp_homebase = 1 AND aktfptk.id_thn_ajaran = '" . get_tahun_keaktifan() . "'
            LEFT JOIN ref.jenis_sdm AS jsdm ON jsdm.id_jns_sdm = sdm.id_jns_sdm
            LEFT JOIN ref.status_keaktifan_pegawai AS aktf ON aktf.id_stat_aktif = sdm.id_stat_aktif
            WHERE sdm.id_jns_sdm = 12
            ORDER BY sdm.nm_sdm " . $sortby . "
            OFFSET (@PageNumber -1) * @RowsOfPage ROWS FETCH NEXT @RowsOfPage ROWS ONLY
            ", [$page, $count]);
        } catch (\Throwable $th) {
            return WrapResponse(['page' => $page, 'count' => $count, 'data' => ''], 'Daftar SDM Dosen', FALSE);
        }

        return WrapResponse(['page' => $page, 'count' => $count, 'data' => $dosen], 'Daftar SDM Dosen', TRUE);
    }

    public function detail(Request $request)
    {
        InputValidator([
            'id_sdm' => 'required|uuid'
        ], [
            'id_sdm.required'  => 'input id_sdm harus diisi',
            'id_sdm.uuid'  => 'input id_sdm harus berupa UUID yang valid'
        ]);

        try {
            $detail = DB::select("SELECT TOP 1
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
            -- sdm.stat_kawin,
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
            WHERE sdm.id_jns_sdm = 12 AND sdm.id_sdm = ?", [$request->id_sdm]);

            if (empty($detail)) {
                return WrapResponse([], 'tidak ada detail dosen yang ditampilkan', FALSE);
            }

            $data['profil'] = [
                'nidn' => $detail[0]->nidn,
                'nama' => $detail[0]->nm_sdm,
                'tempat_lahir' => $detail[0]->tmpt_lahir,
                'tanggal_lahir' => $detail[0]->tgl_lahir,
                'nama_ibu_kandung' => ''
            ];
            $data['kependudukan'] = [
                'nik' => $detail[0]->nik,
                'agama' => $detail[0]->nm_agama,
                'kewarganegaraan' => $detail[0]->nm_negara,
            ];
            $data['keluarga'] = [
                'status_perkawinan' => $detail[0]->stat_kawin,
                'nama_suami_istri' => $detail[0]->nm_suami_istri,
                'nip_suami_istri' => $detail[0]->nip_suami_istri,
                'pekerjaan_suami_istri' => $detail[0]->pekerjaan_suami_istri,
                'terhitung_pns_suami_istri' => ''
            ];
            $data['bidang_keilmuan'] = [
                'bidang_keilmuan' => ''
            ];
            $data['alamat_kontak'] = [
                'email' => $detail[0]->email,
                'alamat' => '',
                'rt' => '',
                'rw' => '',
                'dusun' => '',
                'kelurahan' => $detail[0]->nidn,
                'kota' => $detail[0]->kabupaten,
                'provinsi' => $detail[0]->provinsi,
                'kode_pos' => '',
                'telpon_rumah' => $detail[0]->no_tel_rmh,
                'telpon_hp' => $detail[0]->no_hp
            ];
            $data['kepegawaian'] = [
                'program_studi' => $detail[0]->prodi,
                'nip' => $detail[0]->nip,
                'status_kepagawaian' => $detail[0]->nm_jns_sdm,
                'status_keaktifan' => $detail[0]->nm_stat_aktif,
                'sk_cpns' => $detail[0]->sk_cpns,
                'tgl_sk_cpns' => $detail[0]->tgl_sk_cpns,
                'sk_tmmd' => $detail[0]->sk_angkat,
                'tgl_sk_tmmd' => $detail[0]->tmt_sk_angkat,
                'pangkat_golongan' => '',
                'sumber_gaji' => $detail[0]->nm_sumber_gaji,
            ];
            $data['lain_lain'] = [
                'npwp' => $detail[0]->npwp,
                'nama_npwp' => $detail[0]->nm_wp,
                'sinta_id' => ''
            ];

        } catch (\Throwable $th) {
            return WrapResponse([], 'gagal mendapatkan detail dosen berdasarkan id_sdm', FALSE);
        }
        return WrapResponse(['data' => $data], 'detail dosen berdasarkan id_sdm', TRUE);
    }
}
