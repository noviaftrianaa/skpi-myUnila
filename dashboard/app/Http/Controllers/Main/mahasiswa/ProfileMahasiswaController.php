<?php

namespace App\Http\Controllers\Main\mahasiswa;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProfileMahasiswaController extends Controller
{
    private string $path_view = 'content.main.mahasiswa.';
    private string $id_pd_auth;


    public function index(){
        $this->id_pd_auth = \Auth::user()->id_pd_pengguna;

        $q = "
                SELECT
                peserta.nm_pd,
                peserta.jk,
                peserta.nisn,
                peserta.nik,
                peserta.tmpt_lahir,
                peserta.tgl_lahir,
                peserta.jln,
                peserta.rt,
                peserta.rw,
                peserta.nm_dsn,
                peserta.ds_kel,
                peserta.kode_pos,
                peserta.id_kewarganegaraan,
                peserta.id_agama,
                peserta.email AS email_pribadi,
                peserta.tlpn_hp,
                reg_pd.nipd,
                reg_pd.tgl_masuk_sp,
                smst.nm_smt,
                jlr.nm_jalur_daftar,
                jenj.nm_jenj_didik,
                man_pen.email AS email_kampus,
                sms.nm_lemb,
                agama.nm_agama,
                negara.nm_negara,
                sts_mhs.nm_stat_mhs
                FROM
                pdrd.peserta_didik AS peserta
                JOIN pdrd.reg_pd WITH (NOLOCK) ON reg_pd.id_pd = peserta.id_pd
                    AND reg_pd.soft_delete = 0
                JOIN pdrd.sms WITH (NOLOCK) ON sms.id_sms = reg_pd.id_sms
                    AND sms.soft_delete = 0
                JOIN ref.jenjang_pendidikan AS jenj WITH (NOLOCK) ON jenj.id_jenj_didik = sms.id_jenj_didik
                JOIN ref.semester AS smst WITH (NOLOCK) ON smst.id_smt = reg_pd.id_semester_masuk AND smst.expired_date IS NULL
                JOIN ref.agama AS agama WITH (NOLOCK) ON peserta.id_agama = agama.id_agama
                JOIN ref.negara AS negara WITH (NOLOCK) ON negara.id_negara = peserta.id_kewarganegaraan
                JOIN ref.status_mahasiswa AS sts_mhs ON sts_mhs.id_stat_mhs = peserta.id_stat_mhs
                LEFT JOIN man_akses.pengguna AS man_pen ON man_pen.id_pd_pengguna = peserta.id_pd AND man_pen.soft_delete = 0
                LEFT JOIN ref.jalur_daftar AS jlr WITH (NOLOCK) ON jlr.id_jalur_daftar = reg_pd.id_jalur_daftar
                WHERE
                peserta.soft_delete = 0 AND peserta.id_pd = ?
        ";

        $profile = \DB::selectOne($q, [$this->id_pd_auth]);

        $judul = "Halaman Profile ".$profile->nm_pd;


        // dd($profile);

        return view($this->path_view.'profile_mhs.index', compact(
            'judul',
            'profile',
        ));
    }


    public function SemesterMahasiswa(){
        $this->id_pd_auth = \Auth::user()->id_pd_pengguna;

            $q = "
                SELECT
                pd.id_pd,
                pd.nm_pd,
                trpd.nipd,
                smt.nm_smt,
                tsms.nm_lemb,
                pem.nm_pembiayaan,
                stm.nm_stat_mhs,
                kmhs.id_smt,
                kmhs.ips,
                kmhs.sks_semester,
                kmhs.ipk,
                kmhs.total_sks,
                kmhs.biaya_smt
                FROM
                pdrd.peserta_didik AS pd
                JOIN pdrd.reg_pd AS trpd ON trpd.id_pd= pd.id_pd
                AND trpd.soft_delete= 0 
                JOIN pdrd.kuliah_mhs AS kmhs ON kmhs.id_reg_pd= trpd.id_reg_pd
                AND kmhs.soft_delete= 0
                JOIN ref.semester AS smt ON smt.id_smt= kmhs.id_smt
                LEFT JOIN ref.pembiayaan AS pem ON pem.id_pembiayaan= kmhs.id_pembiayaan
                JOIN ref.status_mahasiswa AS stm ON stm.id_stat_mhs= kmhs.id_stat_mhs
                JOIN pdrd.sms AS tsms ON tsms.id_sms= trpd.id_sms
                AND tsms.soft_delete= 0
                WHERE
                pd.soft_delete= 0
                AND pd.id_pd= ?;

            ";

        $semester = \DB::select($q, [$this->id_pd_auth]);

        return \DataTables::of($semester)
        ->addColumn('action', function ($row) {
            // Tambahkan tombol aksi jika diperlukan
            return '<button class="btn btn-sm btn-primary btn-khs" data-id-smt="' . $row->id_smt . '" data-bs-dismiss="modal" ><i class="fa-solid fa-eye"></i></button>';
        })
        ->rawColumns(['action'])
        ->make(true);

    }

    public function KHSMahasiswa(Request $request){
        $this->id_pd_auth = \Auth::user()->id_pd_pengguna;


        $id_smt = $request->input('id_smt');
        $q= "
            SELECT
                smt.nm_smt,
                CONCAT(tsms.nm_lemb,' (',tj.nm_jenj_didik,')') AS nm_prodi,
                mk.kode_mk,
                mk.nm_mk,
                mk.jns_mk,
                mk.kel_mk,
                kk.sks_mk,
                kk.nm_kls,
                nilai.nilai_angka,
                nilai.nilai_huruf,
                nilai.nilai_indeks
            FROM pdrd.peserta_didik AS pd
            JOIN pdrd.reg_pd AS trpd ON trpd.id_pd=pd.id_pd AND trpd.soft_delete=0
            JOIN pdrd.nilai_smt_mhs AS nilai ON nilai.id_reg_pd=trpd.id_reg_pd AND nilai.soft_delete=0
            JOIN pdrd.kelas_kuliah AS kk ON kk.id_kls=nilai.id_kls AND kk.soft_delete=0 AND kk.id_smt= ?
            JOIN pdrd.sms AS tsms ON tsms.id_sms=kk.id_sms AND tsms.soft_delete=0
            JOIN pdrd.matkul AS mk ON mk.id_mk=kk.id_mk AND mk.soft_delete=0
            JOIN ref.semester AS smt ON smt.id_smt=kk.id_smt
            JOIN ref.jenjang_pendidikan AS tj ON tj.id_jenj_didik=tsms.id_jenj_didik
            WHERE pd.soft_delete=0
            AND pd.id_pd= ?;
        ";

        $khs = \DB::select($q, [$id_smt,$this->id_pd_auth ]);
        // dd($khs);
        return \DataTables::of($khs)
        ->make(true);
    }


}
