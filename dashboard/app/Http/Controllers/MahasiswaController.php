<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MahasiswaController extends Controller
{
    public function __construct()
    {
        $this->basepath = 'mahasiswa';
    }

    /**
     * Display a listing of the resource.
     */
    public function index($id)
    {
        $pageConfigs = ['myLayout' => 'horizontal'];
        $profil = DB::SELECT("
            SELECT
                pd.*,
                reg.nipd,
                reg.tgl_keluar,
                sms.nm_lemb AS prodi,
                jur.nm_lemb AS jur,
                fak.nm_lemb AS fak,
                status.nm_stat_mhs,
                jenjang.nm_jenj_didik,
                reg.id_jns_keluar,
                jenis.ket_keluar
            FROM
                pdrd.peserta_didik AS pd
                JOIN pdrd.reg_pd AS reg ON reg.id_pd=pd.id_pd AND reg.soft_delete=0
                JOIN ref.status_mahasiswa AS status ON status.id_stat_mhs=pd.id_stat_mhs AND status.expired_date IS NULL
                JOIN pdrd.sms AS sms ON sms.id_sms=reg.id_sms AND sms.soft_delete=0
                JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik=sms.id_jenj_didik AND jenjang.expired_date IS NULL
                LEFT JOIN pdrd.sms AS jur ON jur.id_sms=sms.id_jur_unila AND jur.soft_delete=0
                LEFT JOIN pdrd.sms AS fak ON fak.id_sms=sms.id_fak_unila AND fak.soft_delete=0
                LEFT JOIN ref.jenis_keluar AS jenis ON jenis.id_jns_keluar=reg.id_jns_keluar AND jenis.expired_date IS NULL
            WHERE
                pd.soft_delete=0
                AND pd.id_pd='".$id."'
        ")[0];

        $pendidikan = $this->pendidikan($id);
        $mk = $this->mk($id);
        $aktivitas = $this->aktivitas($id);
        $prestasi = $this->prestasi($id);

        return view('content.pages.mahasiswa.detail', [
          'pageConfigs' => $pageConfigs,
          'profil' => $profil,
          'pendidikan' => $pendidikan,
          'mk' => $mk,
          'aktivitas' => $aktivitas,
          'prestasi' => $prestasi
        ]);
    }

    private function pendidikan($id)
    {
      $data = [];

      return $data;
    }

    public function semester($id)
    {
      $data = DB::SELECT("
        SELECT
          kmh.id_smt,
          status.nm_stat_mhs,
          kmh.sks_semester,
          sms.nm_lemb AS prodi
        FROM
          pdrd.reg_pd AS reg
          JOIN pdrd.kuliah_mhs AS kmh ON kmh.id_reg_pd=reg.id_reg_pd AND kmh.soft_delete=0
          JOIN ref.status_mahasiswa AS status ON status.id_stat_mhs=kmh.id_stat_mhs AND status.expired_date IS NULL
          JOIN pdrd.sms AS sms ON sms.id_sms=reg.id_sms AND sms.soft_delete=0
        WHERE
          reg.soft_delete=0
          AND reg.id_pd='".$id."'
        ORDER BY
          kmh.id_smt DESC
      ");

      return \DataTables::of($data)
        ->addIndexColumn()
        ->make(true);
    }

    public function mk($id)
    {
      $data = DB::SELECT("
        SELECT
          kk.id_smt,
          mk.kode_mk,
          mk.nm_mk,
          mk.jns_mk,
          mk.sks_mk,
          sms.nm_lemb AS prodi,
          (
            SELECT
              kuliah.id_stat_mhs
            FROM
              pdrd.kuliah_mhs AS kuliah
            WHERE
              kuliah.soft_delete=0
              AND kuliah.id_smt=kk.id_smt
              AND kuliah.id_reg_pd=reg.id_reg_pd
          ) AS id_stat_mhs
        FROM
          pdrd.reg_pd AS reg
          JOIN pdrd.nilai_smt_mhs AS nilai ON nilai.id_reg_pd=reg.id_reg_pd AND nilai.soft_delete=0
          JOIN pdrd.kelas_kuliah AS kk ON kk.id_kls=nilai.id_kls AND kk.soft_delete=0
          JOIN pdrd.matkul AS mk ON mk.id_mk=kk.id_mk AND mk.soft_delete=0
          JOIN pdrd.sms AS sms ON sms.id_sms=kk.id_sms AND sms.soft_delete=0
        WHERE
          reg.soft_delete=0
          AND reg.id_pd='".$id."'
        ORDER BY
          kk.id_smt DESC,
          mk.nm_mk ASC
      ");

      return \DataTables::of($data)
        ->addIndexColumn()
        ->editColumn('id_smt', function($data) {
          return substr($data->id_smt, 4, 1) == 1 ? substr($data->id_smt, 0, 4) . " Ganjil" : substr($data->id_smt, 0, 4) . " Genap";
        })
        ->editColumn('id_stat_mhs', function($data) {
          return $data->id_stat_mhs=='M' ? 'MBKM' : 'Reguler';
        })
        ->make(true);
    }

    public function aktivitas($id)
    {
      $data = DB::SELECT("
        SELECT
          akt.id_smt,
          jenis.nm_jns_akt_mhs,
          akt.judul_akt_mhs,
          akt.lokasi_kegiatan,
          akt.sk_tugas,
          akt.tgl_sk_tugas,
          sms.nm_lemb
        FROM
          pdrd.reg_pd AS reg
          JOIN pdrd.anggota_akt_mhs AS ang ON ang.id_reg_pd=reg.id_reg_pd AND ang.soft_delete=0
          JOIN pdrd.akt_mhs AS akt ON akt.id_akt_mhs=ang.id_akt_mhs AND akt.soft_delete=0
          JOIN ref.jenis_akt_mhs AS jenis ON jenis.id_jns_akt_mhs=akt.id_jns_akt_mhs AND jenis.expired_date IS NULL
          LEFT JOIN pdrd.sms AS sms ON sms.id_sms=akt.id_sms AND sms.soft_delete=0
        WHERE
          reg.soft_delete=0
          AND reg.id_pd='".$id."'
        ORDER BY
          akt.id_smt DESC,
          akt.id_jns_akt_mhs ASC,
          akt.judul_akt_mhs
      ");

      return \DataTables::of($data)
        ->addIndexColumn()
        ->editColumn('id_smt', function($data) {
          return substr($data->id_smt, 4, 1) == 1 ? substr($data->id_smt, 0, 4) . " Ganjil" : substr($data->id_smt, 0, 4) . " Genap";
        })
        ->editColumn('tgl_sk_tugas', function($data) {
          return TglIndonesia($data->tgl_sk_tugas);
        })
        ->make(true);
    }

    public function prestasi($id)
    {
      $data = DB::SELECT("
        SELECT
          jns.nm_jenis_prestasi,
          ps.nm_prestasi,
          ps.peringkat,
          ps.penyelenggara,
          ps.thn_prestasi,
          tkt.nm_tkt_prestasi
        FROM
          pdrd.prestasi AS ps
          JOIN pdrd.akt_mhs AS akt ON akt.id_akt_mhs=ps.id_akt_mhs AND akt.soft_delete=0
          JOIN ref.jenis_prestasi AS jns ON jns.id_jenis_prestasi=ps.id_jenis_prestasi AND jns.expired_date IS NULL
          LEFT JOIN pdrd.satuan_pendidikan AS sp ON sp.id_sp=ps.id_sp AND sp.soft_delete=0
          LEFT JOIN ref.tingkat_prestasi AS tkt ON tkt.id_tkt_prestasi=ps.id_tkt_prestasi AND tkt.expired_date IS NULL
        WHERE
          ps.soft_delete=0
          AND ps.id_pd='".$id."'
        ORDER BY
          ps.thn_prestasi DESC
      ");

      return \DataTables::of($data)
        ->addIndexColumn()
        ->make(true);
    }
}
