<?php

namespace App\Http\Controllers\Dashboard\WR\WakilRektor3;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Ref\TahunAjaran;
use App\Models\Repositories\Report;
use Illuminate\Http\Request;
use DataTables;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProfilMahasiswaController extends Controller
{
    public function index($id, Request $request)
    {
        $id_reg_pd = \Crypt::decrypt($id);
        $side_active = 'dashboard.profil_mahasiswa';


        $profil_mahasiswa = collect(DB::SELECT("
         SELECT
             reg.id_reg_pd,
             reg.nipd AS npm,
             pd.nm_pd,
             CASE
                 WHEN pd.jk = 'L' THEN 'Laki-laki'
                 ELSE 'Perempuan'
             END AS jenis_kelamin,
             CONCAT(pd.tmpt_lahir, ', ', pd.tgl_lahir) AS ttgl_lahir,
             ag.nm_agama,
             neg.nm_negara,
             pd.email,
             pd.jln,
             pd.tlpn_hp,
             sp.nm_lemb AS asal_pt,
             fak.nm_lemb AS fakultas,
             jur.nm_lemb AS jurusan,
             CONCAT(sms.nm_lemb, ' (', jenjang.nm_jenj_didik, ')') AS nm_prodi,
             jada.nm_jalur_daftar,
             ts.id_thn_ajaran AS angkatan,
             kul.ips,
             kul.ipk,
             kuliah.smt_skrng,
             kul.total_sks,
             stat.nm_stat_mhs,
             pd.create_date AS waktu_data_ditambahkan,
             pd.last_update AS terakhir_diubah
         FROM
             pdrd.peserta_didik AS pd WITH(NOLOCK)
             JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_pd = pd.id_pd
             AND reg.soft_delete = 0
             LEFT JOIN (
                 SELECT
                     MAX(id_smt) as smt,
                     COUNT(*) as smt_skrng,
                     id_reg_pd
                 FROM
                     pdrd.kuliah_mhs WITH(NOLOCK)
                 WHERE
                     soft_delete = 0
                 GROUP BY
                     id_reg_pd
             ) AS kuliah ON kuliah.id_reg_pd = reg.id_reg_pd
             JOIN pdrd.kuliah_mhs AS kul WITH(NOLOCK) ON kul.id_smt = kuliah.smt
             AND kul.id_reg_pd = kuliah.id_reg_pd
             AND kul.soft_delete = 0
             JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = reg.id_sms
             AND sms.soft_delete = 0
             LEFT JOIN pdrd.sms AS jur WITH(NOLOCK) ON jur.id_sms = sms.id_jur_unila
             AND jur.soft_delete = 0
             JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = sms.id_fak_unila
             AND fak.soft_delete = 0
             JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik = sms.id_jenj_didik
             AND jenjang.expired_date IS NULL
             JOIN ref.semester AS ts WITH(NOLOCK) ON ts.id_smt = reg.id_semester_masuk
             AND ts.expired_date IS NULL
             JOIN ref.agama AS ag WITH(NOLOCK) ON ag.id_agama = pd.id_agama
             AND ag.expired_date IS NULL
             JOIN ref.negara AS neg ON neg.id_negara = pd.id_kewarganegaraan
             AND neg.expired_date IS NULL
             AND ag.expired_date IS NULL
             JOIN ref.status_mahasiswa AS stat ON stat.id_stat_mhs = kul.id_stat_mhs
             AND stat.expired_date IS NULL
             JOIN ref.jalur_daftar AS jada ON jada.id_jalur_daftar = reg.id_jalur_daftar
             AND jada.expired_date IS NULL
             JOIN pdrd.satuan_pendidikan AS sp ON sp.id_sp = reg.id_sp
             AND sp.soft_delete = 0
         WHERE
             pd.soft_delete = 0
             AND reg.id_reg_pd = '" . $id_reg_pd . "'
     "))->first();


        $status_ukt =  DB::SELECT("
         SELECT
             reg.id_pd,
             reg.id_reg_pd,
             ts.nm_smt AS periode,
             ukt.fk_kelas_ukt,
             ukt.total_tagihan,
             ukt.fk_flag_bayar,
             ukt.fk_nama_semester
         FROM
             keuangan.temp_ukt_mhs as ukt WITH(NOLOCK)
             JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_reg_pd = ukt.id_reg_pd
             AND reg.soft_delete = 0
             JOIN ref.semester AS ts WITH(NOLOCK) ON ts.id_smt = ukt.id_smt
             AND ts.expired_date IS NULL
         WHERE
             reg.id_reg_pd = '" . $id_reg_pd . "'
         ORDER BY fk_nama_semester ASC
     ");


    $status_semester =  DB::SELECT("
        SELECT
            reg.id_pd,
            reg.id_reg_pd,
            ts.nm_smt AS periode,
            sm.nm_stat_mhs,
            kul.id_smt,
            kul.sks_semester,
            kul.ips,
            kul.ipk,
            kul.total_sks AS sks_lulus
            FROM
            pdrd.kuliah_mhs as kul WITH(NOLOCK)
            JOIN pdrd.reg_pd AS reg WITH(NOLOCK)ON reg.id_reg_pd = kul.id_reg_pd
            AND reg.soft_delete = 0
            JOIN ref.semester AS ts WITH(NOLOCK)ON ts.id_smt = kul.id_smt
            AND ts.expired_date IS NULL
            JOIN ref.status_mahasiswa AS sm WITH(NOLOCK)ON sm.id_stat_mhs = kul.id_stat_mhs
            AND sm.expired_date IS NULL
            WHERE
            kul.soft_delete = 0
            AND kul.id_reg_pd = '" . $id_reg_pd . "'
            ORDER BY id_smt ASC
     ");

    $rwy_aktivitas =  DB::SELECT("
        SELECT
            jns_akt.nm_jns_akt_mhs,
            akt.judul_akt_mhs,
            smt.nm_smt,
            ang.last_sync
        FROM
            pdrd.anggota_akt_mhs AS ang WITH(NOLOCK)
            JOIN pdrd.akt_mhs AS akt WITH(NOLOCK)ON akt.id_akt_mhs = ang.id_akt_mhs
            AND akt.soft_delete = 0
            JOIN ref.semester AS smt WITH(NOLOCK)ON smt.id_smt = akt.id_smt
            AND smt.expired_date IS NULL
            JOIN ref.jenis_akt_mhs AS jns_akt WITH(NOLOCK)ON jns_akt.id_jns_akt_mhs = akt.id_jns_akt_mhs
            AND jns_akt.expired_date IS NULL
            JOIN pdrd.reg_pd AS reg WITH(NOLOCK)ON reg.id_reg_pd = ang.id_reg_pd
            AND reg.soft_delete = 0
        WHERE
            ang.soft_delete = 0
            AND ang.id_reg_pd = '" . $id_reg_pd . "'
        ORDER BY nm_jns_akt_mhs,
            judul_akt_mhs,
            nm_smt ASC
     ");


        return view('dashboard.mahasiswa_profil', compact('profil_mahasiswa',  'side_active', 'status_ukt', 'status_semester', 'rwy_aktivitas'));
    }
}
