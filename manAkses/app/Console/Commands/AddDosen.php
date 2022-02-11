<?php

namespace App\Console\Commands;
use DB;

use Illuminate\Console\Command;

class AddDosen extends Command
{
    protected $signature = 'add:dosen';

    protected $description = 'Seeder Dosen Data From Pdrd to ManAkses';

    public function __construct()
    {
        parent::__construct();
    }

    public function handle()
    {
        $query = "
        SELECT
            sdm.id_sdm,
            sdm.nm_sdm AS nama_sdm,
            sdm.email AS email,
            sdm.tgl_lahir,
            sdm.tmpt_lahir,
            sdm.jk
        FROM
            pdrd.sdm AS sdm
            JOIN pdrd.reg_ptk AS ptk ON ptk.id_sdm = sdm.id_sdm
            AND ptk.soft_delete = 0
            AND ptk.id_ikatan_kerja = 'A'
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
            LEFT JOIN ref.jenjang_pendidikan AS jp ON jp.id_jenj_didik = prodi.id_jenj_didik
            LEFT JOIN ref.ikatan_kerja_sdm AS iks ON iks.id_ikatan_kerja = ptk.id_ikatan_kerja
        WHERE
            sdm.id_jns_sdm = 12
            AND sdm.id_stat_aktif IN (1, 24, 25, 27)
            AND LEFT(sdm.nidn, 2) IN (00, 87)
            AND sdm.soft_delete = 0
            AND sdm.email IS NOT NULL
            AND sdm.email <> ''
        ORDER BY
            sdm.nidn DESC
        ";

        $listDosen = DB::select(DB::raw($query));
        if (!$listDosen || empty($listDosen)) {
            $this->error('Failed Query List Dosen!');
            exit();
        }

        try {
            $this->info('Run Seeding Data Dosen');

            $bar = $this->output->createProgressBar(count($listDosen));
            $bar->start();

            foreach ($listDosen as $dosen) {
                DB::table('man_akses.pengguna')->insert([
                    'id_pengguna' => guid(),
                    'username' => $dosen->email,
                    'password' => sha1('unilajaya'),
                    'nm_pengguna' => explode('@', $dosen->email)[0],
                    'tempat_lahir' => $dosen->tmpt_lahir,
                    'tgl_lahir' => $dosen->tgl_lahir,
                    'jenis_kelamin' => $dosen->jk,
                    'alamat' => NULL,
                    'no_tel' => NULL,
                    'no_hp' => NULL,
                    'approval_pengguna' => 1,
                    'a_aktif' => 1,
                    'tgl_ganti_pwd' => NULL,
                    'id_sdm_pengguna' => $dosen->id_sdm,
                    'id_pd_pengguna' => NULL,
                    'id_calon_pd_pengguna' => NULL,
                    'token_reg' => NULL,
                    'jabatan' => NULL,
                    'provider' => NULL,
                    'disable' => 0,
                    'tgl_create' => currDateTime(),
                    'last_update' => currDateTime(),
                    'soft_delete' => 0,
                    'last_sync' => currDateTime(),
                    'id_updater' => '7c999853-1002-4363-b2fd-c8b37f3eb23e'
                ]);

                $bar->advance();
            }

            $bar->finish();

            $this->info(PHP_EOL.'Success Seeding Data Dosen');
            exit();
        } catch (Exception $e) {
            Log::error($e->getMessage());
            $this->error('Failed Seeding Data Dosen!');
            exit();
        }
    }
}
