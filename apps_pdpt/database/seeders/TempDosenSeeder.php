<?php

namespace Database\Seeders;

use App\Models\PDUT\Temp_iku\TempDosen;
use App\Models\PDUT\Temp_iku\TempDosenPengsert;
use App\Models\PDUT\Temp_iku\TempDosenPraktisi;
use App\Models\PDUT\Temp_iku\TempDosenTridharma;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Seeder;

class TempDosenSeeder extends Seeder
{
    public function run()
    {
        $this->dosen();
        // $this->penghargaan();
        // $this->sertifikat();
        // $this->penelitian();
        // $this->pengabdian();
        // $this->pengajaran();
        // $this->praktisi();
    }

    public function dosen()
    {
        $query = "SELECT
                sdm.id_sdm AS id_dsn,
                sdm.nm_sdm AS nm,
                sdm.tmpt_lahir AS tmp_lhr,
                sdm.tgl_lahir AS tgl_lhr,
                datediff(MONTH, sdm.tgl_lahir, getdate()) / 12 - case
                    when month(sdm.tgl_lahir) = month(getdate())
                    and day(sdm.tgl_lahir) > day(getdate()) then 1
                    else 0
                end as usia,
                sdm.jk,
                sdm.nidn,
                iks.nm_ikatan_kerja AS ikt_kerja,
                fak.nm_lemb AS fakultas,
                prodi.nm_lemb AS prodi,
                jp.nm_jenj_didik AS jenj_lulusan
                --     jsdm.nm_jns_sdm AS jenis_sdm,
            FROM
                pdrd.sdm AS sdm
            JOIN pdrd.reg_ptk AS ptk ON ptk.id_sdm = sdm.id_sdm
                AND ptk.soft_delete = 0
                --         AND ptk.id_ikatan_kerja = 'A'
                AND ptk.id_jns_keluar IS NULL
                AND (
                    ptk.tgl_ptk_keluar IS NULL
                    OR ptk.tgl_ptk_keluar > GETDATE()
                )
            JOIN ref.status_kepegawaian AS skep ON skep.id_stat_pegawai = ptk.id_stat_pegawai
            JOIN pdrd.keaktifan_ptk AS aktfptk ON aktfptk.id_reg_ptk = ptk.id_reg_ptk
                AND aktfptk.soft_delete = 0
                AND aktfptk.a_sp_homebase = 1
                AND aktfptk.id_thn_ajaran = 2021
            LEFT JOIN ref.jenis_sdm AS jsdm ON jsdm.id_jns_sdm = sdm.id_jns_sdm
            LEFT JOIN ref.status_keaktifan_pegawai AS aktf ON aktf.id_stat_aktif = sdm.id_stat_aktif
            LEFT JOIN pdrd.sms AS prodi ON prodi.id_sms = ptk.id_sms
            LEFT JOIN pdrd.sms AS fak ON fak.id_sms = prodi.id_induk_sms
            JOIN ref.jenjang_pendidikan AS jp ON jp.id_jenj_didik = prodi.id_jenj_didik
                --     AND jp.id_jenj_didik IN (40, 41)
            LEFT JOIN ref.ikatan_kerja_sdm AS iks ON iks.id_ikatan_kerja = ptk.id_ikatan_kerja
            WHERE
                sdm.id_jns_sdm = 12
                AND sdm.id_stat_aktif IN (1, 24, 25, 27)
                --     AND LEFT(sdm.nidn,2) IN (88,89)
                AND sdm.soft_delete = 0
            ORDER BY
                sdm.nidn DESC";

        $data = DB::select($query);

        foreach ($data as $each_data) {
            TempDosen::updateOrInsert([
                'id_dsn' => $each_data->id_dsn
            ], [
                'id_iku3_dsn' => guid(),
                'nm' => $each_data->nm,
                'tmp_lhr' => $each_data->tmp_lhr,
                'tgl_lhr' => $each_data->tgl_lhr,
                'usia' => $each_data->usia,
                'jk' => $each_data->jk,
                'nidn' => $each_data->nidn,
                'nidk' => NULL, //$each_data->nidk,
                'ikt_kerja' => $each_data->ikt_kerja,
                'fakultas' => $each_data->fakultas,
                'jurusan' => NULL, //$each_data->jurusan,
                'prodi' => $each_data->prodi,
                'jenj_lulusan' => $each_data->jenj_lulusan,
                'pt_lulusan' => NULL, //$each_data->pt_lulusan,
                'last_sync' => currDateTime()
            ]);
        }
    }

    public function penghargaan()
    {
        $query = "";
        $data = DB::select($query);

        foreach ($data as $each_data) {
            TempDosenPengsert::updateOrInsert([
                'id_dsn' => $each_data->id_dsn,
                'id_penghargaan' => $each_data->id_penghargaan
            ], [
                'id_iku3_dsn_pengsert' => guid(),
                'id_sertifikasi' => NULL,
                'nm' => $each_data->nm,
                'jns' => $each_data->jns,
                'tkt' => $each_data->tkt,
                'lemb' => $each_data->lemb,
                'tgl' => $each_data->tgl,
                'thn' => $each_data->thn,
                'last_sync' => currDateTime()
            ]);
        }
    }

    public function sertifikat()
    {
        $query = "";
        $data = DB::select($query);

        foreach ($data as $each_data) {
            TempDosenPengsert::updateOrInsert([
                'id_dsn' => $each_data->id_dsn,
                'id_sertifikasi' => $each_data->id_sertifikasi
            ], [
                'id_iku3_dsn_pengsert' => guid(),
                'id_penghargaan' => NULL,
                'nm' => $each_data->nm,
                'jns' => $each_data->jns,
                'tkt' => $each_data->tkt,
                'lemb' => $each_data->lemb,
                'tgl' => $each_data->tgl,
                'thn' => $each_data->thn,
                'last_sync' => currDateTime()
            ]);
        }
    }

    public function penelitian()
    {
        $query = "";
        $data = DB::select($query);

        foreach ($data as $each_data) {
            TempDosenTridharma::updateOrInsert([
                'id_dsn' => $each_data->id_dsn,
                'id_peneltian' => $each_data->id_peneltian
            ], [
                'id_iku3_dsn_tridharma' => guid(),
                'id_pengabdian' => NULL,
                'id_pengajaran' => NULL,
                'nm_kegiatan' => $each_data->nm_kegiatan,
                'wkt_awal_kegiatan' => $each_data->wkt_awal_kegiatan,
                'wkt_akhir_kegiatan' => $each_data->wkt_akhir_kegiatan,
                'tmp_kegiatan' => $each_data->tmp_kegiatan,
                'last_sync' => currDateTime(),
            ]);
        }
    }

    public function pengabdian()
    {
        $query = "";
        $data = DB::select($query);

        foreach ($data as $each_data) {
            TempDosenTridharma::updateOrInsert([
                'id_dsn' => $each_data->id_dsn,
                'id_pengabdian' => $each_data->id_pengabdian
            ], [
                'id_iku3_dsn_tridharma' => guid(),
                'id_peneltian' => NULL,
                'id_pengajaran' => NULL,
                'nm_kegiatan' => $each_data->nm_kegiatan,
                'wkt_awal_kegiatan' => $each_data->wkt_awal_kegiatan,
                'wkt_akhir_kegiatan' => $each_data->wkt_akhir_kegiatan,
                'tmp_kegiatan' => $each_data->tmp_kegiatan,
                'last_sync' => currDateTime()
            ]);
        }
    }

    public function pengajaran()
    {
        $query = "";
        $data = DB::select($query);

        foreach ($data as $each_data) {
            TempDosenTridharma::updateOrInsert([
                'id_dsn' => $each_data->id_dsn,
                'id_pengajaran' => $each_data->id_pengajaran
            ], [
                'id_iku3_dsn_tridharma' => guid(),
                'id_peneltian' => NULL,
                'id_pengabdian' => NULL,
                'nm_kegiatan' => $each_data->nm_kegiatan,
                'wkt_awal_kegiatan' => $each_data->wkt_awal_kegiatan,
                'wkt_akhir_kegiatan' => $each_data->wkt_akhir_kegiatan,
                'tmp_kegiatan' => $each_data->tmp_kegiatan,
                'last_sync' => currDateTime()
            ]);
        }
    }

    public function praktisi()
    {
        $query = "";
        $data = DB::select($query);

        foreach ($data as $each_data) {
            TempDosenPraktisi::updateOrInsert([
                'id_dsn' => $each_data->id_dsn,
                'id_praktisi' => $each_data->id_praktisi
            ], [
                'id_iku3_dsn_praktisi' => guid(),
                'nm_institusi' => $each_data->nm_institusi,
                'tkt_institusi' => $each_data->tkt_institusi,
                'tmp_penugasan' => $each_data->tmp_penugasan,
                'wkt_awal_penugasan' => $each_data->wkt_awal_penugasan,
                'wkt_akhir_penugasan' => $each_data->wkt_akhir_penugasan,
                'last_sync' => currDateTime()
            ]);
        }
    }
}
