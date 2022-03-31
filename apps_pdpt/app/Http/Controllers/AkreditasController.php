<?php

namespace App\Http\Controllers;

use App\Models\PDUT\Pdrd\AkreditasiProdi;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use stdClass;

class AkreditasController extends Controller
{
    protected $id_prodi;
    private $id_sp;

    public function __construct()
    {
        $this->id_prodi = Cache::get('setProdi');
        $this->id_sp = 'e2b705a7-173e-464a-9fac-509128709515';
    }

    public function akreditasi()
    {
        $sp = collect(DB::SELECT("
            SELECT
                tsp.id_sp,
                tsp.nm_lemb,
                tsp.npsn,
                ak.sk_akred_sp,
                ak.tgl_sk_akred_sp,
                ak.tst_sk_akred_sp,
                tni.nm_akred
            FROM pdrd.satuan_pendidikan AS tsp
            JOIN pdrd.akred_sp AS ak ON ak.id_sp=tsp.id_sp
            JOIN ref.nilai_akred AS tni ON tni.id_akred=ak.id_akred
            WHERE tsp.id_sp = '" . $this->id_sp . "'
            AND tsp.soft_delete=0
        "));

        $sp_all = $sp->unique()->all();
        $sp_first = $sp->first();

        $sp = new stdClass;
        $sp->all = $sp_all;
        $sp->first = $sp_first;

        $data_akred = DB::SELECT("
            SELECT tni.nm_akred, COUNT(tprodi.id_sms) AS total_akreditasi
            FROM pdrd.sms AS tprodi
            JOIN ref.jenjang_pendidikan AS tjenj ON tjenj.id_jenj_didik=tprodi.id_jenj_didik
            LEFT JOIN (
                    SELECT id_sms, MAX(tst_sk_akreditasi_prodi) AS max_tst FROM pdrd.akreditasi_prodi
                    WHERE soft_delete=0
                    GROUP BY id_sms
            ) AS tap ON tap.id_sms=tprodi.id_sms
            LEFT JOIN pdrd.akreditasi_prodi AS akred ON akred.id_sms=tprodi.id_sms
                AND akred.tst_sk_akreditasi_prodi=tap.max_tst AND akred.soft_delete=0
            LEFT JOIN ref.nilai_akred AS tni ON tni.id_akred=akred.id_akred
            WHERE tprodi.soft_delete=0
                AND tprodi.stat_prodi='A'
                AND tprodi.id_jns_sms = 3
            AND tprodi.id_sp ='" . $this->id_sp . "'
            GROUP BY tni.nm_akred
            ORDER BY tni.nm_akred ASC
        ");

        $list_akreditasi = [];
        $total = ['belum' => 0, 'sudah' => 0];
        $akred = [];
        foreach ($data_akred as $each_akred) {
            if (is_null($each_akred->nm_akred) || in_array($each_akred->nm_akred, ['Tidak Terakreditasi', 'Belum Terakreditasi'])) {
                $total['belum'] += $each_akred->total_akreditasi;
            } else {
                $total['sudah'] += $each_akred->total_akreditasi;
            }
            $list_akreditasi[] = is_null($each_akred->nm_akred) ? 'Tidak ada akreditasi' : $each_akred->nm_akred;
            $akred[is_null($each_akred->nm_akred) ? 'Tidak ada akreditasi' : $each_akred->nm_akred] = $each_akred->total_akreditasi;
        }

        $last_sync = AkreditasiProdi::where('soft_delete', 0)->orderBy('last_sync', 'DESC')->first();
        $akred = json_encode($akred);

        $pageName  =  'Rekap Akreditasi';
        $judul_layout = 'Akreditasi';
        $side_active = 'akreditasi';

        return view('dashboard.akreditasi.index_akreditasi', compact(
            'pageName',
            'judul_layout',
            'side_active',
            'akred', 
            'sp', 
            'list_akreditasi', 
            'last_sync', 
            'total'
        ));
    }

    public function detail_akreditasi_prodi($id_prodi)
    {
        $id_prodi = Crypt::decrypt($id_prodi);
        $this->setProdi($id_prodi);

        $detail_prodi = Cache::remember(__FUNCTION__ . '-detail_prodi-' . $id_prodi, rand(5, 10), function () use ($id_prodi) {
            $query = "
                select
                    sms.id_sms as id_prodi,
                    sms.nm_lemb as prodi,
                    jp.nm_jenj_didik as jenjang_pendidikan,
                    takred.sk_akreditasi_prodi,
                    takred.tanggal_sk_akreditasi_prodi,
                    takred.tst_sk_akreditasi_prodi,
                    tn.nm_akred
                from
                    pdrd.sms as sms
                    join ref.jenjang_pendidikan as jp on jp.id_jenj_didik = sms.id_jenj_didik
                    LEFT JOIN (
                        SELECT
                            id_sms,
                            MAX(tst_sk_akreditasi_prodi) AS max_tst
                        FROM
                            pdrd.akreditasi_prodi
                        WHERE
                            soft_delete = 0
                        GROUP BY
                            id_sms
                    ) AS tap ON tap.id_sms = sms.id_sms
                    LEFT JOIN pdrd.akreditasi_prodi AS takred ON takred.id_sms = sms.id_sms
                    AND takred.soft_delete = 0
                    AND takred.tst_sk_akreditasi_prodi = tap.max_tst
                    LEFT JOIN ref.nilai_akred AS tn ON tn.id_akred = takred.id_akred
                WHERE
                    sms.id_sms = ?
            ";
            return collect(DB::select(DB::raw($query), [$id_prodi]))->first();
        });

        $detail_akred = Cache::remember(__FUNCTION__ . '-detail_akred-' . $id_prodi, rand(5, 10), function () use ($id_prodi) {
            $query = "
                SELECT
                    ap.id_sms,
                    rna.nm_akred,
                    ap.tanggal_sk_akreditasi_prodi,
                    ap.tst_sk_akreditasi_prodi,
                    ap.sk_akreditasi_prodi
                FROM
                    pdrd.akreditasi_prodi AS ap
                    JOIN ref.nilai_akred AS rna ON rna.id_akred = ap.id_akred
                    AND rna.expired_date IS NULL
                where
                    ap.id_sms = ?
                ORDER BY
                    tanggal_sk_akreditasi_prodi ASC
            ";
            $result = DB::select(DB::raw($query), [$id_prodi]);

            $rearange = [];
            foreach ($result as $value) {
                $akred = match ($value->nm_akred) {
                    'Unggul' => 5,
                    'Baik Sekali' => 4,
                    'Baik' => 3,
                    'A' => 2,
                    'B' => 1,
                    'C' => 0,
                };
                $rearange[date('Y', strtotime($value->tanggal_sk_akreditasi_prodi))] = [
                    $value->nm_akred,
                    $akred,
                    $value->sk_akreditasi_prodi,
                    $value->tanggal_sk_akreditasi_prodi,
                    $value->tst_sk_akreditasi_prodi
                ];
            }

            return $rearange;
        });

        $detail_akred_all = collect($detail_akred)->sortKeysDesc()->all();

        $detail_akred = json_encode($detail_akred);

        $rank_akred = [
            'Unggul',
            'Baik Sekali',
            'Baik',
            'A',
            'B',
            'C',
        ];
        $rank_akred = array_reverse($rank_akred);
        $rank_akred = json_encode($rank_akred);

        $list_kriteria = [];
        for ($i = 1; $i < 10; $i++) {
            $list_kriteria[] = 'Kriteria ' . $i;
        }

        $kriteria1['Visi, Misi, Tujuan, dan Strategi'] = [
            'Latar Belakang' => \Faker\Factory::create()->paragraphs(9, true),
            'Kebijakan' => \Faker\Factory::create()->paragraphs(9, true),
            'Strategi Pencapaian VMTS' => \Faker\Factory::create()->paragraphs(9, true),
            'Indikator Kinerja Utama (IKU)' => \Faker\Factory::create()->paragraphs(9, true),
            'Indikator Kinerja Tambahan (IKT)' => \Faker\Factory::create()->paragraphs(9, true),
            'Evaluasi Capaian VMTS' => \Faker\Factory::create()->paragraphs(9, true),
            'Kesimpulan Hasil Evaluasi Ketercapaian VMTS dan Tindaklanjut' => \Faker\Factory::create()->paragraphs(9, true)
        ];

        $kriteria2['Tata Pamong, Tata Kelola dan Kerjasama'] = [
            // 'Latar Belakang' => \Faker\Factory::create()->paragraphs(9, true),
            // 'Kebijakan' => \Faker\Factory::create()->paragraphs(9, true),
            // 'Strategi Pencapaian Standar' => \Faker\Factory::create()->paragraphs(9, true),
            'Indikator Kinerja Utama (IKU)' => [
                'Sistem Tata Pamong' => \Faker\Factory::create()->paragraphs(9, true),
                'Kepemimpinan' => \Faker\Factory::create()->paragraphs(9, true),
                'Sistem Penjamin Mutu' => \Faker\Factory::create()->paragraphs(9, true),
                // 'Kerjasama' => 'dashboard.akreditasi.tables.table_1_kerjasama'
                'Kerjasama' => 'dashboard.akreditasi.kerjasama'
            ],
            'Indikator Kinerja Tambahan (IKT)' => \Faker\Factory::create()->paragraphs(9, true),
            'Evaluasi Capaian Kinerja' => \Faker\Factory::create()->paragraphs(9, true),
            'Penjaminan Mutu Tata Pamong, Tata Kelola, dan Kerjasama' => \Faker\Factory::create()->paragraphs(9, true),
            'Kepuasan Pengguna' => \Faker\Factory::create()->paragraphs(9, true),
            'Simpulan Hasil Evaluasi dan Tindak lanjut' => \Faker\Factory::create()->paragraphs(9, true),
        ];

        $kriteria3['Mahasiswa'] = [
            // 'Latar Belakang' => \Faker\Factory::create()->paragraphs(9, true),
            // 'Kebijakan' => \Faker\Factory::create()->paragraphs(9, true),
            // 'Strategi Pencapaian Standar' => \Faker\Factory::create()->paragraphs(9, true),
            'Indikator Kinerja Utama (IKU)' => [
                'Kualitas Input Mahasiswa' => 'dashboard.akreditasi.kualitas_input_mahasiswa',
                'Daya Tarik Program Studi' => \Faker\Factory::create()->paragraphs(9, true),
                'Layanan Kemahasiswaan' => \Faker\Factory::create()->paragraphs(9, true)
            ],
            'Indikator Kinerja Tambahan (IKT)' => \Faker\Factory::create()->paragraphs(9, true),
            'Evaluasi Capaian Kinerja' => \Faker\Factory::create()->paragraphs(9, true),
            'Penjaminan Mutu Mahasiswa' => \Faker\Factory::create()->paragraphs(9, true),
            'Kepuasan Pengguna' => \Faker\Factory::create()->paragraphs(9, true),
            'Simpulan Hasil Evaluasi dan Tindak lanjut' => \Faker\Factory::create()->paragraphs(9, true),
        ];

        $kriteria4['Sumber Daya Manusia'] = [
            // 'Latar Belakang' => \Faker\Factory::create()->paragraphs(9, true),
            // 'Kebijakan' => \Faker\Factory::create()->paragraphs(9, true),
            // 'Strategi Pencapaian Standar' => \Faker\Factory::create()->paragraphs(9, true),
            'Indikator Kinerja Utama (IKU)' => [
                'Profil Dosen' => 'dashboard.akreditasi.profil_dosen',
                'Kinerja Dosen' => 'dashboard.akreditasi.kinerja_dosen',
                'Pengembangan Dosen' => \Faker\Factory::create()->paragraphs(9, true),
                'Tenaga Pendidik' => \Faker\Factory::create()->paragraphs(9, true)
            ],
            'Indikator Kinerja Tambahan (IKT)' => \Faker\Factory::create()->paragraphs(9, true),
            'Evaluasi Capaian Kinerja' => \Faker\Factory::create()->paragraphs(9, true),
            'Penjaminan Mutu SDM' => \Faker\Factory::create()->paragraphs(9, true),
            'Kepuasan Pengguna' => \Faker\Factory::create()->paragraphs(9, true),
            'Simpulan Hasil Evaluasi dan Tindak lanjut' => \Faker\Factory::create()->paragraphs(9, true),
        ];

        $kriteria5['Keuangan, Sarana, dan Prasarana'] = [
            // 'Latar Belakang' => \Faker\Factory::create()->paragraphs(9, true),
            // 'Kebijakan' => \Faker\Factory::create()->paragraphs(9, true),
            // 'Strategi Pencapaian Standar' => \Faker\Factory::create()->paragraphs(9, true),
            'Indikator Kinerja Utama (IKU)' => [
                'Keuangan' => \Faker\Factory::create()->paragraphs(9, true),
                'Sarana' => \Faker\Factory::create()->paragraphs(9, true),
                'Prasarana' => \Faker\Factory::create()->paragraphs(9, true)
            ],
            'Indikator Kinerja Tambahan (IKT)' => \Faker\Factory::create()->paragraphs(9, true),
            'Evaluasi Capaian Kinerja' => \Faker\Factory::create()->paragraphs(9, true),
            'Penjaminan Mutu Keuangan, Sarana, dan Prasarana' => \Faker\Factory::create()->paragraphs(9, true),
            'Kepuasan Pengguna' => \Faker\Factory::create()->paragraphs(9, true),
            'Simpulan Hasil Evaluasi dan Tindak lanjut' => \Faker\Factory::create()->paragraphs(9, true),
        ];

        $kriteria6['Pendidikan'] = [
            // 'Latar Belakang' => \Faker\Factory::create()->paragraphs(9, true),
            // 'Kebijakan' => \Faker\Factory::create()->paragraphs(9, true),
            // 'Strategi Pencapaian Standar' => \Faker\Factory::create()->paragraphs(9, true),
            'Indikator Kinerja Utama (IKU)' => [
                'Kurikulum' => \Faker\Factory::create()->paragraphs(9, true),
                'Pembelajaran' => \Faker\Factory::create()->paragraphs(9, true),
                'Suasana Akademik' => \Faker\Factory::create()->paragraphs(9, true)
            ],
            'Indikator Kinerja Tambahan (IKT)' => \Faker\Factory::create()->paragraphs(9, true),
            'Evaluasi Capaian Kinerja' => \Faker\Factory::create()->paragraphs(9, true),
            'Penjaminan Mutu Pendidikan' => \Faker\Factory::create()->paragraphs(9, true),
            'Kepuasan Pengguna' => \Faker\Factory::create()->paragraphs(9, true),
            'Simpulan Hasil Evaluasi dan Tindak lanjut' => \Faker\Factory::create()->paragraphs(9, true),
        ];

        $kriteria7['Penelitian'] = [
            // 'Latar Belakang' => \Faker\Factory::create()->paragraphs(9, true),
            // 'Kebijakan' => \Faker\Factory::create()->paragraphs(9, true),
            // 'Strategi Pencapaian Standar' => \Faker\Factory::create()->paragraphs(9, true),
            'Indikator Kinerja Utama (IKU)' => [
                'Relevansi Penelitian' => \Faker\Factory::create()->paragraphs(9, true),
                'Keterlibatan Mahasiswa dalam Penelitian' => \Faker\Factory::create()->paragraphs(9, true)
            ],
            'Indikator Kinerja Tambahan (IKT)' => \Faker\Factory::create()->paragraphs(9, true),
            'Evaluasi Capaian Kinerja' => \Faker\Factory::create()->paragraphs(9, true),
            'Penjaminan Mutu Proses Penelitian' => \Faker\Factory::create()->paragraphs(9, true),
            'Kepuasan Pengguna' => \Faker\Factory::create()->paragraphs(9, true),
            'Simpulan Hasil Evaluasi dan Tindak lanjut' => \Faker\Factory::create()->paragraphs(9, true),
        ];

        $kriteria8['Pengabdian kepada Masyarakat'] = [
            // 'Latar Belakang' => \Faker\Factory::create()->paragraphs(9, true),
            // 'Kebijakan' => \Faker\Factory::create()->paragraphs(9, true),
            // 'Strategi Pencapaian Standar' => \Faker\Factory::create()->paragraphs(9, true),
            'Indikator Kinerja Utama (IKU)' => [
                'Relevansi Pengabdian kepada Masyarakat' => \Faker\Factory::create()->paragraphs(9, true),
                'Keterlibatan Mahasiswa dalam PkM' => \Faker\Factory::create()->paragraphs(9, true)
            ],
            'Indikator Kinerja Tambahan (IKT)' => \Faker\Factory::create()->paragraphs(9, true),
            'Evaluasi Capaian Kinerja' => \Faker\Factory::create()->paragraphs(9, true),
            'Penjaminan Mutu PkM' => \Faker\Factory::create()->paragraphs(9, true),
            'Kepuasan Pengguna' => \Faker\Factory::create()->paragraphs(9, true),
            'Simpulan Hasil Evaluasi dan Tindak lanjut' => \Faker\Factory::create()->paragraphs(9, true),
        ];

        $kriteria9['Luaran dan Capaian Tridharma'] = [
            // 'Latar Belakang' => \Faker\Factory::create()->paragraphs(9, true),
            'Indikator Kinerja Utama (IKU)' => [
                'Luaran Dharma Pendidikan' => \Faker\Factory::create()->paragraphs(9, true),
                'Luaran Dharma Penelitian dan Pengabdian kepada Masyarakat' => \Faker\Factory::create()->paragraphs(9, true)
            ],
            'Indikator Kinerja Tambahan (IKT)' => \Faker\Factory::create()->paragraphs(9, true),
            'Evaluasi Capaian Kinerja' => \Faker\Factory::create()->paragraphs(9, true),
            'Penjaminan Mutu Luaran' => \Faker\Factory::create()->paragraphs(9, true),
            'Kepuasan Pengguna' => \Faker\Factory::create()->paragraphs(9, true),
            'Simpulan Hasil Evaluasi dan Tindak lanjut' => \Faker\Factory::create()->paragraphs(9, true),
        ];

        $kriteria = [];
        for ($i = 1; $i < 10; $i++) {
            $kriteria["kriteria_$i"] = eval('return $kriteria' . $i . ';');
        }

        $pageName  = $judul_layout = 'Detail Akreditasi '.$detail_prodi->prodi;
        $side_active = 'akreditasi';

        return view('dashboard.akreditasi.detail_akreditasi', compact(
            'pageName',
            'judul_layout',
            'side_active',
            'detail_prodi', 
            'detail_akred', 
            'detail_akred_all', 
            'rank_akred', 
            'list_kriteria', 
            'kriteria'
        ));
    }

    public function setProdi($id_prodi)
    {
        Cache::put('setProdi', $id_prodi);
    }

    public function kerjasama($jenis_kerjasama = '')
    {
        $kerjasama = match (strtolower($jenis_kerjasama)) {
            'pendidikan' => $this->kerjasama_pendidikan(),
            'penelitian' => $this->kerjasama_penelitian(),
            'pengabdian' => $this->kerjasama_pengabdian(),
        };

        return $kerjasama;
    }

    public function kerjasama_pendidikan()
    {

        return view('dashboard.akreditasi.tables.tabel_1_kerjasama_pendidikan')->with('judul', 'Pendidikan');
    }

    public function kerjasama_penelitian()
    {
        return view('dashboard.akreditasi.tables.tabel_1_kerjasama_penelitian')->with('judul', 'Penelitian');
    }

    public function kerjasama_pengabdian()
    {
        return view('dashboard.akreditasi.tables.tabel_1_kerjasama_pengabdian')->with('judul', 'Pengabdian');
    }

    public function seleksi_mahasiswa()
    {
        return view('dashboard.akreditasi.tables.tabel_2_seleksi_mahasiswa')->with('judul', 'Seleksi Mahasiswa');
    }

    public function mahasiswa_asing()
    {
        return view('dashboard.akreditasi.tables.tabel_2_mahasiswa_asing')->with('judul', 'Mahasiswa Asing');
    }

    public function dosen_tetap()
    {
        return view('dashboard.akreditasi.tables.tabel_3_dosen_tetap')->with('judul', 'Dosen Tetap');
    }

    public function dosen_pembimbing_utama_tugas_akhir()
    {
        return view('dashboard.akreditasi.tables.tabel_3_dosen_pembimbing_utama')->with('judul', 'Dosen Pembimbing Utama Tugas Akhir');
    }

    public function eewmp_dosen_tetap()
    {
        return view('dashboard.akreditasi.tables.tabel_3_eewmp_dosen_tetap')->with('judul', 'Ekuivalen Waktu Mengajar Penuh (EWMP) Dosen Tetap');
    }

    public function dosen_tidak_tetap()
    {
        return view('dashboard.akreditasi.tables.tabel_3_dosen_tidak_tetap')->with('judul', 'Dosen Tidak Tetap');
    }

    public function dosen_praktisi_industri()
    {
        return view('dashboard.akreditasi.tables.tabel_3_dosen_praktisi_industri')->with('judul', 'Dosen Praktisi / Industri');
    }

    public function rekognisi_dtps()
    {
        return view('dashboard.akreditasi.tables.tabel_3_rekognisi_dtps')->with('judul', 'Pengakuan / Rekognisi DTPS');
    }

    public function penelitian_dtps()
    {
        return view('dashboard.akreditasi.tables.tabel_3_penelitian_dtps')->with('judul', 'Penelitian DTPS');
    }

    public function pkm_dtps()
    {
        return view('dashboard.akreditasi.tables.tabel_3_pkm_dtps')->with('judul', 'Pengabdian kepada Masyarakat (PkM) DTPS');
    }

    public function publikasi_dtps()
    {
        return view('dashboard.akreditasi.tables.tabel_3_publikasi_dtps')->with('judul', 'Publikasi Ilmiah DTPS');
    }

    public function karya_ilmiah_disitasi()
    {
        return view('dashboard.akreditasi.tables.tabel_3_karya_ilmiah_disitasi')->with('judul', 'Karya Ilmiah DTPS yang Disitasi dalam 3 Tahun Terakhir');
    }

    public function luaran_penelitian_pkm_dtps()
    {
        return view('dashboard.akreditasi.tables.tabel_3_luaran_penelitian_pkm_dtps')->with('judul', 'Luaran Penelitian/PkM Lainnya oleh DTPS');
    }
}
