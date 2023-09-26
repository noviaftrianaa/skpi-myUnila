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
    protected $db_name;
    private $id_sp;

    public function __construct()
    {
        $this->id_prodi = Cache::get('setProdi');
        $this->id_sp = 'e2b705a7-173e-464a-9fac-509128709515';
        $this->db_name = 'myunila_local';
    }

    public function index()
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
            JOIN pdrd.akred_sp AS ak ON ak.id_sp=tsp.id_sp AND ak.soft_delete=0
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

        

        // $list_kriteria = [];
        // for ($i = 1; $i < 10; $i++) {
        //     $list_kriteria[] = 'Kriteria ' . $i;
        // }

        // $kriteria1['Visi, Misi, Tujuan, dan Strategi'] = [
        //     '1-1' => \Faker\Factory::create()->paragraphs(9, true),
        //     '1-2' => \Faker\Factory::create()->paragraphs(9, true),
        //     '1-3' => \Faker\Factory::create()->paragraphs(9, true),
        // ];

        // $kriteria2['Tata Pamong, Tata Kelola dan Kerjasama'] = [
        //     // 'Latar Belakang' => \Faker\Factory::create()->paragraphs(9, true),
        //     // 'Kebijakan' => \Faker\Factory::create()->paragraphs(9, true),
        //     // 'Strategi Pencapaian Standar' => \Faker\Factory::create()->paragraphs(9, true),
        //     '2a' => \Faker\Factory::create()->paragraphs(9, true),
        //         // 'Sistem Tata Pamong' => \Faker\Factory::create()->paragraphs(9, true),
        //         // 'Kepemimpinan' => \Faker\Factory::create()->paragraphs(9, true),
        //         // 'Sistem Penjamin Mutu' => \Faker\Factory::create()->paragraphs(9, true),
        //         // // 'Kerjasama' => 'dashboard.akreditasi.tables.table_1_kerjasama'
        //         // 'Kerjasama' => 'dashboard.akreditasi.kerjasama'
        //     '2b' => \Faker\Factory::create()->paragraphs(9, true),
        // ];

        // $kriteria3['Mahasiswa'] = [
        //     // 'Latar Belakang' => \Faker\Factory::create()->paragraphs(9, true),
        //     // 'Kebijakan' => \Faker\Factory::create()->paragraphs(9, true),
        //     // 'Strategi Pencapaian Standar' => \Faker\Factory::create()->paragraphs(9, true),
        //     '3a' => [
        //         '3a1' => \Faker\Factory::create()->paragraphs(9, true),
        //         '3a2' => \Faker\Factory::create()->paragraphs(9, true),
        //         '3a3' => \Faker\Factory::create()->paragraphs(9, true),
        //         '3a4' => \Faker\Factory::create()->paragraphs(9, true),
        //         '3a5' => \Faker\Factory::create()->paragraphs(9, true),
        //     ],
        //     '3b' => [
        //         '3b1' => \Faker\Factory::create()->paragraphs(9, true),
        //         '3b2' => \Faker\Factory::create()->paragraphs(9, true),
        //         '3b3' => \Faker\Factory::create()->paragraphs(9, true),
        //         '3b4' => \Faker\Factory::create()->paragraphs(9, true),
        //     ],
        //     'Evaluasi Capaian Kinerja' => \Faker\Factory::create()->paragraphs(9, true),
        //     'Penjaminan Mutu Mahasiswa' => \Faker\Factory::create()->paragraphs(9, true),
        //     'Kepuasan Pengguna' => \Faker\Factory::create()->paragraphs(9, true),
        //     'Simpulan Hasil Evaluasi dan Tindak lanjut' => \Faker\Factory::create()->paragraphs(9, true),
        // ];

        // $kriteria4['Sumber Daya Manusia'] = [
        //     // 'Latar Belakang' => \Faker\Factory::create()->paragraphs(9, true),
        //     // 'Kebijakan' => \Faker\Factory::create()->paragraphs(9, true),
        //     // 'Strategi Pencapaian Standar' => \Faker\Factory::create()->paragraphs(9, true),
        //     'Indikator Kinerja Utama (IKU)' => [
        //         'Profil Dosen' => 'dashboard.akreditasi.profil_dosen',
        //         'Kinerja Dosen' => 'dashboard.akreditasi.kinerja_dosen',
        //         'Pengembangan Dosen' => \Faker\Factory::create()->paragraphs(9, true),
        //         'Tenaga Pendidik' => \Faker\Factory::create()->paragraphs(9, true)
        //     ],
        //     'Indikator Kinerja Tambahan (IKT)' => \Faker\Factory::create()->paragraphs(9, true),
        //     'Evaluasi Capaian Kinerja' => \Faker\Factory::create()->paragraphs(9, true),
        //     'Penjaminan Mutu SDM' => \Faker\Factory::create()->paragraphs(9, true),
        //     'Kepuasan Pengguna' => \Faker\Factory::create()->paragraphs(9, true),
        //     'Simpulan Hasil Evaluasi dan Tindak lanjut' => \Faker\Factory::create()->paragraphs(9, true),
        // ];

        // $kriteria5['Keuangan, Sarana, dan Prasarana'] = [
        //     // 'Latar Belakang' => \Faker\Factory::create()->paragraphs(9, true),
        //     // 'Kebijakan' => \Faker\Factory::create()->paragraphs(9, true),
        //     // 'Strategi Pencapaian Standar' => \Faker\Factory::create()->paragraphs(9, true),
        //     'Indikator Kinerja Utama (IKU)' => [
        //         'Keuangan' => \Faker\Factory::create()->paragraphs(9, true),
        //         'Sarana' => \Faker\Factory::create()->paragraphs(9, true),
        //         'Prasarana' => \Faker\Factory::create()->paragraphs(9, true)
        //     ],
        //     'Indikator Kinerja Tambahan (IKT)' => \Faker\Factory::create()->paragraphs(9, true),
        //     'Evaluasi Capaian Kinerja' => \Faker\Factory::create()->paragraphs(9, true),
        //     'Penjaminan Mutu Keuangan, Sarana, dan Prasarana' => \Faker\Factory::create()->paragraphs(9, true),
        //     'Kepuasan Pengguna' => \Faker\Factory::create()->paragraphs(9, true),
        //     'Simpulan Hasil Evaluasi dan Tindak lanjut' => \Faker\Factory::create()->paragraphs(9, true),
        // ];

        // $kriteria6['Pendidikan'] = [
        //     // 'Latar Belakang' => \Faker\Factory::create()->paragraphs(9, true),
        //     // 'Kebijakan' => \Faker\Factory::create()->paragraphs(9, true),
        //     // 'Strategi Pencapaian Standar' => \Faker\Factory::create()->paragraphs(9, true),
        //     'Indikator Kinerja Utama (IKU)' => [
        //         'Kurikulum' => \Faker\Factory::create()->paragraphs(9, true),
        //         'Pembelajaran' => \Faker\Factory::create()->paragraphs(9, true),
        //         'Suasana Akademik' => \Faker\Factory::create()->paragraphs(9, true)
        //     ],
        //     'Indikator Kinerja Tambahan (IKT)' => \Faker\Factory::create()->paragraphs(9, true),
        //     'Evaluasi Capaian Kinerja' => \Faker\Factory::create()->paragraphs(9, true),
        //     'Penjaminan Mutu Pendidikan' => \Faker\Factory::create()->paragraphs(9, true),
        //     'Kepuasan Pengguna' => \Faker\Factory::create()->paragraphs(9, true),
        //     'Simpulan Hasil Evaluasi dan Tindak lanjut' => \Faker\Factory::create()->paragraphs(9, true),
        // ];

        // $kriteria7['Penelitian'] = [
        //     // 'Latar Belakang' => \Faker\Factory::create()->paragraphs(9, true),
        //     // 'Kebijakan' => \Faker\Factory::create()->paragraphs(9, true),
        //     // 'Strategi Pencapaian Standar' => \Faker\Factory::create()->paragraphs(9, true),
        //     'Indikator Kinerja Utama (IKU)' => [
        //         'Relevansi Penelitian' => \Faker\Factory::create()->paragraphs(9, true),
        //         'Keterlibatan Mahasiswa dalam Penelitian' => \Faker\Factory::create()->paragraphs(9, true)
        //     ],
        //     'Indikator Kinerja Tambahan (IKT)' => \Faker\Factory::create()->paragraphs(9, true),
        //     'Evaluasi Capaian Kinerja' => \Faker\Factory::create()->paragraphs(9, true),
        //     'Penjaminan Mutu Proses Penelitian' => \Faker\Factory::create()->paragraphs(9, true),
        //     'Kepuasan Pengguna' => \Faker\Factory::create()->paragraphs(9, true),
        //     'Simpulan Hasil Evaluasi dan Tindak lanjut' => \Faker\Factory::create()->paragraphs(9, true),
        // ];

        // $kriteria8['Pengabdian kepada Masyarakat'] = [
        //     // 'Latar Belakang' => \Faker\Factory::create()->paragraphs(9, true),
        //     // 'Kebijakan' => \Faker\Factory::create()->paragraphs(9, true),
        //     // 'Strategi Pencapaian Standar' => \Faker\Factory::create()->paragraphs(9, true),
        //     'Indikator Kinerja Utama (IKU)' => [
        //         'Relevansi Pengabdian kepada Masyarakat' => \Faker\Factory::create()->paragraphs(9, true),
        //         'Keterlibatan Mahasiswa dalam PkM' => \Faker\Factory::create()->paragraphs(9, true)
        //     ],
        //     'Indikator Kinerja Tambahan (IKT)' => \Faker\Factory::create()->paragraphs(9, true),
        //     'Evaluasi Capaian Kinerja' => \Faker\Factory::create()->paragraphs(9, true),
        //     'Penjaminan Mutu PkM' => \Faker\Factory::create()->paragraphs(9, true),
        //     'Kepuasan Pengguna' => \Faker\Factory::create()->paragraphs(9, true),
        //     'Simpulan Hasil Evaluasi dan Tindak lanjut' => \Faker\Factory::create()->paragraphs(9, true),
        // ];

        // $kriteria9['Luaran dan Capaian Tridharma'] = [
        //     // 'Latar Belakang' => \Faker\Factory::create()->paragraphs(9, true),
        //     'Indikator Kinerja Utama (IKU)' => [
        //         'Luaran Dharma Pendidikan' => \Faker\Factory::create()->paragraphs(9, true),
        //         'Luaran Dharma Penelitian dan Pengabdian kepada Masyarakat' => \Faker\Factory::create()->paragraphs(9, true)
        //     ],
        //     'Indikator Kinerja Tambahan (IKT)' => \Faker\Factory::create()->paragraphs(9, true),
        //     'Evaluasi Capaian Kinerja' => \Faker\Factory::create()->paragraphs(9, true),
        //     'Penjaminan Mutu Luaran' => \Faker\Factory::create()->paragraphs(9, true),
        //     'Kepuasan Pengguna' => \Faker\Factory::create()->paragraphs(9, true),
        //     'Simpulan Hasil Evaluasi dan Tindak lanjut' => \Faker\Factory::create()->paragraphs(9, true),
        // ];

        // $kriteria = [];
        // for ($i = 1; $i < 10; $i++) {
        //     $kriteria["kriteria_$i"] = eval('return $kriteria' . $i . ';');
        // }

        $pageName  = $judul_layout = 'Detail Akreditasi'.$detail_prodi->prodi;
        $side_active = 'akreditasi';

        /*All Kriteria in here*/

        /*Kriteria 1*/
        $kerjasama = $this->kerjasama($detail_prodi->prodi);

        /*Kriteria 2*/
        //Seleksi Mahasiswa Baru
        //Count Mahasiswa each year
        $jml_mhs = [
            '22' => 0,
            '21' => 0,
            '20' => 0,
            '19' => 0,
            '18' => 0,
        ];

        $jml_mhs_tf = [
            '22' => 0,
            '21' => 0,
            '20' => 0,
            '19' => 0,
            '18' => 0,
        ];

        foreach ($this->mahasiswa($detail_prodi->prodi) as $mhs){
            if($mhs->nm_jalur_daftar != 'Program Internasional'){
                $prefix = substr($mhs->npm, 0, 2);
                if (array_key_exists($prefix, $jml_mhs)) {
                    $jml_mhs[$prefix]++;
                }
            } else {
                $prefix = substr($mhs->npm, 0, 2);
                if (array_key_exists($prefix, $jml_mhs_tf)) {
                    $jml_mhs_tf[$prefix]++;
                }
            }
        }
        $total_mhs = array_sum($jml_mhs) + array_sum($jml_mhs_tf);

        //Mahasiswa Asing
        $jml_mhs_as_ft = [
            '2022' => 0,
            '2021' => 0,
            '2020' => 0,
            '2019' => 0,
            '2018' => 0,
        ];

        $jml_mhs_as_pt = [
            '2022' => 0,
            '2021' => 0,
            '2020' => 0,
            '2019' => 0,
            '2018' => 0,
        ];
        
        foreach ($this->mahasiswa_asing($detail_prodi->prodi) as $item) {
            $semester = $item->semester;
            $mahasiswa_Fulltime = $item->mahasiswa_Fulltime;
            $mahasiswa_Parttime = $item->mahasiswa_Parttime;

            if (array_key_exists($semester, $jml_mhs_as_ft)) {
                $jml_mhs_as_ft[$semester] += $mahasiswa_Fulltime;
            }
            if (array_key_exists($semester, $jml_mhs_as_pt)) {
                $jml_mhs_as_pt[$semester] += $mahasiswa_Parttime;
            }
        }

        /*Kriteria 3*/
        //Dosen Tetap
        $dosen_tetap = $this->dosen_tetap($detail_prodi->prodi, $detail_prodi->jenjang_pendidikan);

        $list_dosen_tetap = [];
        foreach ($dosen_tetap as $dt){
            $list_dosen_tetap[] = $dt->nama;
        }

        //Bimbingan Tugas Akhir
        $bimbingan = $this->dosen_pembimbing_utama_tugas_akhir($detail_prodi->prodi);

        //Dosen Tidak Tetap
        $dosen_taktetap = $this->dosen_tidak_tetap($detail_prodi->prodi, $detail_prodi->jenjang_pendidikan);

        //rekognisi
        $rekognisi =  $this->rekognisi_dtps()->filter(function ($item) use ($list_dosen_tetap) {
            return in_array($item->nm_sdm, $list_dosen_tetap);
        });
        
        //DTPS
        $penelitian_dtps = $this->penelitian_dtps();

        //PKM DTPS
        $pkm_dtps = $this->pkm_dtps();

        //Publikasi DTPS
        $pub_dtps = $this->publikasi_dtps();

        //Karya Ilmiah Disitasi
        $string = "'" . implode("','", $list_dosen_tetap) . "'";
        $kid = $this->karya_ilmiah_disitasi($string);
        
        //Luaran PKM DTPS -> Paten
        $paten = $this->paten();

        //HKI
        $hak_cipta = $this->hak_cipta();

        //Teknologi Karya
        $teknologi_karya = $this->teknologi_karya();

        //Luaran Buku
        $luaran_buku = $this->book();

        /*Kriteria 6*/
        //Penelitian DTPS Mahasiswa
        $penelitian_dtps_mahasiswa = $this->penelitian_dtps_mahasiswa($string);

        /*Kriteria 7*/
        //PKM DTPS Mahasiswa
        $pkm_dtps_mhs = $this->pkm_dtps_mhs($string);

        /*Kriteria 8*/
        //IPK
        $ipk_mhs = $this->ipk_mhs($id_prodi);

        //Prestasi Akademik-NonAka Mahasiswa
        $prestasi_mhs = $this->prestasi_mhs($id_prodi);

        //Waktu Tunggu Lulusan D3
        $waktu_tunggu_d3 = $this->waktu_tunggu_lulusan_d3($id_prodi);

        //Waktu Tunggu Lulusan S1
        $waktu_tunggu_s1 = $this->waktu_tunggu_lulusan_s1($id_prodi);

        //Kesesuaian Lulusan
        $kesesuaian_lulus = $this->kesesuaian_lulusan();

        //Tempat Kerja Lulusan
        $tpt_kerja_lulus = $this->tempat_kerja_lulusan($id_prodi);

        //Publikasi Ilmiah Mahasiswa
        $pims = $this->publikasi_ilmiah_mhs();

        //Karya Ilmiah Disitasi Mahasiswa
        $karya_ilmiah_disitasi_mhs = $this->karya_ilmiah_disitasi_mhs($id_prodi);

        //Luaren Penelitian Paten Mahasiswa
        $paten_mhs = $this->paten_mhs();

        //Luaren Penelitian HKI Mahasiswa
        $hak_cipta_mhs = $this->hak_cipta_mhs($id_prodi);

        //Luaran Teknologi Karya Mahasiswa
        $teknologi_karya_mhs = $this->teknologi_karya_mhs($id_prodi);

        //Luaran Buku Mahasiswa
        $luaran_buku_mhs = $this->book_mhs($id_prodi);

        return view('dashboard.akreditasi.detail_akreditasi', compact(
            'pageName',
            'judul_layout',
            'side_active',
            'detail_prodi',
            'detail_akred',
            'detail_akred_all',
            'rank_akred',
            'kerjasama',
            'jml_mhs',
            'jml_mhs_tf',
            'total_mhs',
            'jml_mhs_as_ft',
            'jml_mhs_as_pt',
            'dosen_tetap',
            'bimbingan',
            'dosen_taktetap',
            'rekognisi',
            'penelitian_dtps',
            'pkm_dtps',
            'pub_dtps',
            'kid',
            'paten',
            'hak_cipta',
            'teknologi_karya',
            'luaran_buku',
            'penelitian_dtps_mahasiswa',
            'pkm_dtps_mhs',
            'ipk_mhs',
            'prestasi_mhs',
            'waktu_tunggu_d3',
            'waktu_tunggu_s1',
            'kesesuaian_lulus',
            'tpt_kerja_lulus',
            'pims',
            'karya_ilmiah_disitasi_mhs',
            'paten_mhs',
            'hak_cipta_mhs',
            'teknologi_karya_mhs',
            'luaran_buku_mhs'
        ));
    }

    public function setProdi($id_prodi)
    {
        Cache::put('setProdi', $id_prodi);
    }

    //Funtion Finish cause Exist in queries
    public function kerjasama($str)
    {
        $query = "
            SELECT distinct kerjasama.[id_sms_kerjasama],
                tingkat.nm_tingkat_kerjasama
                ,judul.nm_dudi as instansi
                ,judul.judul_mou
                ,year(judul.tgl_selesai) as tahun_berakhir
                ,DATEDIFF(DAY, judul.tgl_mulai, judul.tgl_selesai)as durasi_hari

            FROM $this->db_name.[kerjasama].[sms_kerjasama] as kerjasama
            left join kerjasama.mou as judul on judul.id_mou = kerjasama.id_mou
            left join pdrd.sms as prodi on prodi.id_sms = kerjasama.id_sms
            left join ref.tingkat_kerjasama as tingkat on tingkat.id_tingkat_kerjasama = kerjasama.id_tingkat_kerjasama
            left join pdrd.satuan_pendidikan as satuan on satuan.id_sp = judul.id_sp

            where prodi.nm_lemb = '$str'

            order by judul.judul_mou"
        ; 
        return collect(DB::select(DB::raw($query)));
    }

    public function mahasiswa($str)
    {
        $query = "
                declare @ts INT, @pengurang INT;
                set @ts = 2023;
                set @pengurang = 1;
            SELECT distinct
                reg.nipd AS npm,
                jd.nm_jalur_daftar,
                pd.nm_pd as nama
            FROM
                pdrd.peserta_didik AS pd WITH(NOLOCK)
                JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON reg.id_pd = pd.id_pd
                AND reg.id_jns_keluar IS NULL
                AND reg.soft_delete = 0
                JOIN ref.semester AS smt WITH(NOLOCK) ON smt.id_smt = reg.id_semester_masuk
                AND smt.expired_date IS NULL
                JOIN pdrd.kuliah_mhs AS kul WITH(NOLOCK) ON kul.id_reg_pd = reg.id_reg_pd
                AND kul.soft_delete = 0
                JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
                JOIN pdrd.sms AS fak WITH(NOLOCK) ON fak.id_sms = sms.id_fak_unila
                AND fak.soft_delete = 0
                JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik = sms.id_jenj_didik
                AND jenjang.expired_date IS NULL
                JOIN ref.semester AS ts WITH(NOLOCK) ON ts.id_smt = kul.id_smt
                AND ts.expired_date IS NULL
                JOIN ref.status_mahasiswa AS sm WITH(NOLOCK) ON sm.id_stat_mhs = kul.id_stat_mhs
                AND sm.expired_date IS NULL
                JOIN ref.jenis_pendaftaran AS jp WITH(NOLOCK) ON jp.id_jns_daftar = reg.id_jns_daftar
                AND jp.expired_date IS NULL
                JOIN ref.jalur_daftar AS jd WITH(NOLOCK) ON jd.id_jalur_daftar = reg.id_jalur_daftar
                AND jd.expired_date IS NULL
            WHERE
                pd.soft_delete = 0
                and ts.id_thn_ajaran = (@ts - @pengurang)
                and sms.nm_lemb = '$str'
        ";
        return collect(DB::select(DB::raw($query)));
    }

    public function mahasiswa_asing($str)
    {
        $query = "
            SELECT 
                count(reg.nipd) as mahasiswa_asing,
                left(kuliah.id_smt,4) as semester,
                (select 
                    count(reg.nipd)
                from $this->db_name.[pdrd].[reg_pd] as reg
                    left join $this->db_name.pdrd.peserta_didik as nationality on nationality.id_pd = reg.id_pd
                    left join $this->db_name.pdrd.kuliah_mhs as kuliah1 on kuliah1.id_reg_pd = reg.id_reg_pd
                    left join $this->db_name.pdrd.sms as prodi1 on prodi1.id_sms = reg.id_sms
                where nationality.id_kewarganegaraan != 'ID' 
                    and kuliah1.id_stat_mhs = 'A'
                    and left(kuliah1.id_smt,4) = left(kuliah.id_smt,4)
                    and prodi1.nm_lemb = prodi.nm_lemb
                ) as mahasiswa_Fulltime,
                (select 
                    count(reg.nipd)
                from $this->db_name.[pdrd].[reg_pd] as reg
                    left join $this->db_name.pdrd.peserta_didik as nationality on nationality.id_pd = reg.id_pd
                    left join $this->db_name.pdrd.kuliah_mhs as kuliah1 on kuliah1.id_reg_pd = reg.id_reg_pd
                    left join $this->db_name.pdrd.sms as prodi1 on prodi1.id_sms = reg.id_sms
                where nationality.id_kewarganegaraan != 'ID' 
                    and kuliah1.id_stat_mhs in ('D' , 'K')
                    and left(kuliah1.id_smt,4) = left(kuliah.id_smt,4)
                    and prodi1.nm_lemb = prodi.nm_lemb
                ) as mahasiswa_Parttime
            
            FROM $this->db_name.[pdrd].[reg_pd] as reg
                left join $this->db_name.pdrd.peserta_didik as nationality on nationality.id_pd = reg.id_pd
                left join $this->db_name.pdrd.sms as prodi on prodi.id_sms = reg.id_sms
                left join $this->db_name.pdrd.kuliah_mhs as kuliah on kuliah.id_reg_pd = reg.id_reg_pd

            WHERE nationality.id_kewarganegaraan != 'ID' and kuliah.id_smt is not null
                and left(kuliah.id_smt,4) in (2023,2022,2021,2020,2019.2018)
                and nm_lemb = '$str'
            group by prodi.nm_lemb,  left(kuliah.id_smt,4)
            order by semester
        ";
        return collect(DB::select(DB::raw($query)));
    }

    public function dosen_tetap($str1, $str2)
    {
        $query = "
            SELECT distinct
                nama.nm_sdm as nama
                ,nama.nidn as nidn
                ,prodi.nm_lemb
                ,nm_jenj.nm_jenj_didik 
                ,jabfung.nm_jabfung
                ,jsert.nm_jns_sert
                ,mk.nm_mk
            FROM $this->db_name.[pdrd].[reg_ptk] AS dosen
            left join pdrd.sdm as nama on nama.id_sdm = dosen.id_sdm
            left join pdrd.sms as prodi on prodi.id_sms = dosen.id_sms
            left join pdrd.sms as fak on fak.id_sms = prodi.id_fak_unila
            left join pdrd.sms as jur on jur.id_sms = prodi.id_jur_unila
            left join pdrd.rwy_pend_formal as pend_formal on pend_formal.id_sdm = dosen.id_sdm
            left join ref.jenjang_pendidikan as nm_jenj on nm_jenj.id_jenj_didik = pend_formal.id_jenj_didik
        
            JOIN pdrd.rwy_pend_formal AS pend WITH(NOLOCK) ON pend.id_sdm = nama.id_sdm
            AND pend.id_jenj_didik IN (35, 36, 37, 38, 39, 40, 41)
            JOIN ref.jenjang_pendidikan AS rwy_jenj WITH(NOLOCK) ON rwy_jenj.id_jenj_didik = pend.id_jenj_didik
            AND rwy_jenj.expired_date IS NULL
            JOIN ref.bidang_studi AS bidang WITH(NOLOCK) ON bidang.id_bid_studi = pend.id_bid_studi
            AND bidang.expired_date IS NULL
            JOIN pdrd.rwy_fungsional AS rwy_fung WITH(NOLOCK) ON rwy_fung.id_sdm = nama.id_sdm
            AND rwy_fung.soft_delete = 0
            JOIN ref.jabfung AS jabfung WITH(NOLOCK) ON jabfung.id_jabfung = rwy_fung.id_jabfung
            AND jabfung.expired_date IS NULL
            JOIN pdrd.rwy_sertifikasi AS rwy_sert WITH(NOLOCK) ON rwy_sert.id_sdm = nama.id_sdm
            AND rwy_sert.soft_delete = 0
            JOIN ref.jenis_sert AS jsert ON jsert.id_jns_sert = rwy_sert.id_jns_sert
            AND jsert.expired_date IS NULL
            JOIN ref.bidang_studi AS bid ON bid.id_bid_studi = rwy_sert.id_bid_studi
            AND bid.expired_date IS NULL
            LEFT JOIN pdrd.akt_ajar_dosen AS ajar_dosen WITH(NOLOCK) ON ajar_dosen.id_reg_ptk = dosen.id_reg_ptk
            AND ajar_dosen.soft_delete = 0
            LEFT JOIN pdrd.kelas_kuliah AS kelas WITH(NOLOCK) ON kelas.id_kls = ajar_dosen.id_kls
            AND kelas.soft_delete = 0
            LEFT JOIN pdrd.matkul AS mk WITH(NOLOCK) ON mk.id_mk = kelas.id_mk
            AND mk.soft_delete = 0
        
            where dosen.[id_ikatan_kerja] = 'A'
                AND prodi.nm_lemb = '$str1'
                AND nm_jenj.nm_jenj_didik = '$str2'
        ";
        return collect(DB::select(DB::raw($query)));
    }

    public function dosen_pembimbing_utama_tugas_akhir($str)
    {
        $query = "
        SELECT 
            nama.nm_sdm as nama_dosen,
            substring(tahun.id_smt,1,4) as tahun,
            (select 
                count(bimbingan.id_bimb_mhs)
            from $this->db_name.pdrd.bimbing_mhs as bimbingan
                left join $this->db_name.pdrd.akt_mhs as aktivitas on aktivitas.id_akt_mhs = bimbingan.id_akt_mhs
            where 
                bimbingan.id_sdm = dosen.id_sdm 
                and substring(aktivitas.id_smt,1,4) = substring(tahun.id_smt,1,4)
            ) as total_bimbingan,
            (select
                count(bimbingan1.id_bimb_mhs)
            from $this->db_name.pdrd.bimbing_mhs as bimbingan1
                left join $this->db_name.pdrd.akt_mhs as aktivitas1 on aktivitas1.id_akt_mhs = bimbingan1.id_akt_mhs
            where 
                aktivitas1.id_sms = dosen.id_sms 
                and bimbingan1.id_sdm = dosen.id_sdm 
                and substring(aktivitas1.id_smt,1,4) = substring(tahun.id_smt,1,4)
            )as sesuai_SP,
            (select
                count(bimbingan2.id_bimb_mhs)
            from $this->db_name.pdrd.bimbing_mhs as bimbingan2
                left join $this->db_name.pdrd.akt_mhs as aktivitas2 on aktivitas2.id_akt_mhs = bimbingan2.id_akt_mhs
            where 
                aktivitas2.id_sms != dosen.id_sms 
                and bimbingan2.id_sdm = dosen.id_sdm 
                and substring(aktivitas2.id_smt,1,4) = substring(tahun.id_smt,1,4)
            )as non_SP
        
        FROM $this->db_name.[pdrd].[reg_ptk] as dosen
            left join $this->db_name.pdrd.sdm as nama on nama.id_sdm = dosen.id_sdm
            left join $this->db_name.pdrd.bimbing_mhs as bimbingaan on bimbingaan.id_sdm = dosen.id_sdm
            left join $this->db_name.pdrd.akt_mhs as tahun on tahun.id_akt_mhs = bimbingaan.id_akt_mhs
            left join $this->db_name.pdrd.sms as nama_prodi on nama_prodi.id_sms = dosen.id_sms
        where
            substring(tahun.id_smt,1,4) is not null 
            and dosen.id_sms is not null
            and substring(tahun.id_smt,1,4) in (2023,2022,2021,2020,2019)
            and nm_lemb = '$str'
        group by nama.nm_sdm, dosen.id_sms, dosen.id_sdm, substring(tahun.id_smt,1,4), nama_prodi.nm_lemb
        order by nama_dosen, tahun
        ";
        return collect(DB::select(DB::raw($query)));
    }

    public function dosen_tidak_tetap($str1, $str2)
    {
        $query = "
            SELECT  distinct
                nama.nm_sdm as nama
                ,nama.nidn as nidn
            FROM $this->db_name.[pdrd].[reg_ptk] AS dosen
            left join pdrd.sdm as nama on nama.id_sdm = dosen.id_sdm
            left join pdrd.sms as prodi on prodi.id_sms = dosen.id_sms
            left join pdrd.sms as fak on fak.id_sms = prodi.id_fak_unila
            left join pdrd.sms as jur on jur.id_sms = prodi.id_jur_unila
            left join pdrd.rwy_pend_formal as pend_formal on pend_formal.id_sdm = dosen.id_sdm
            left join ref.jenjang_pendidikan as nm_jenj on nm_jenj.id_jenj_didik = pend_formal.id_jenj_didik

            where dosen.[id_ikatan_kerja] = 'g'
                AND prodi.nm_lemb = '$str1'
                AND nm_jenj.nm_jenj_didik = '$str2'
        ";
        return collect(DB::select(DB::raw($query)));
    }

    public function rekognisi_dtps()
    {
        $query = "
        SELECT distinct
            nm_dosen.nm_sdm,
            sert.sk_sert,
            sert.thn_sert
        FROM $this->db_name.[pdrd].[reg_ptk] AS dosen
            left join pdrd.sdm as nm_dosen on nm_dosen.id_sdm = dosen.id_sdm
            left join pdrd.rwy_sertifikasi AS sert on sert.id_sdm = dosen.id_sdm
        where tgl_ptk_keluar is null and id_jns_keluar is null
        and sert.sk_sert is not null
        order by nm_dosen.nm_sdm
        ";
        return collect(DB::select(DB::raw($query)));
    }

    public function penelitian_dtps()
    {
        $query = "
            SELECT 
                id_thn_kegiatan,
                (select 
                    count(litabmas1.id_litabmas)
                FROM $this->db_name.[pdrd].[litabmas] as litabmas1
                    left join $this->db_name.pdrd.publikasi as pub1 on pub1.id_litabmas = litabmas1.id_litabmas
                where litabmas.id_thn_kegiatan = litabmas1.id_thn_kegiatan
                    and litabmas1.dana_pt > 0.00
                    and litabmas1.jns_litabmas = 'L'
                    and pub1.id_jns_pub not in (41,42,43,44)
                ) as mandiri,
                (select 
                    count(litabmas2.id_litabmas)
                FROM $this->db_name.[pdrd].[litabmas] as litabmas2
                    left join $this->db_name.pdrd.publikasi as pub2 on pub2.id_litabmas = litabmas2.id_litabmas
                where litabmas.id_thn_kegiatan = litabmas2.id_thn_kegiatan
                    and litabmas2.dana_dikti > 0.00
                    and litabmas2.jns_litabmas = 'L'
                    and pub2.id_jns_pub not in (41,42,43,44)
                ) as lembaga_dalam,
                (select 
                    count(litabmas3.id_litabmas)
                FROM $this->db_name.[pdrd].[litabmas] as litabmas3
                    left join $this->db_name.pdrd.publikasi as pub3 on pub3.id_litabmas = litabmas3.id_litabmas
                where litabmas.id_thn_kegiatan = litabmas3.id_thn_kegiatan
                    and litabmas3.dana_institusi_lain > 0.00
                    and litabmas3.jns_litabmas = 'L'
                    and pub3.id_jns_pub not in (41,42,43,44)
                ) as lembaga_luar_mungkin
            
            FROM $this->db_name.[pdrd].[litabmas] as litabmas
            where id_thn_kegiatan in (2023,2022,2021,2020,2019)
            group by id_thn_kegiatan
            order by id_thn_kegiatan
        ";
        return collect(DB::select(DB::raw($query)));
    }

    public function pkm_dtps()
    {
        $query = "
            SELECT 
                id_thn_kegiatan,
                (select 
                    count(litabmas1.id_litabmas)
                FROM $this->db_name.[pdrd].[litabmas] as litabmas1
                    left join $this->db_name.pdrd.publikasi as pub1 on pub1.id_litabmas = litabmas1.id_litabmas
                where litabmas.id_thn_kegiatan = litabmas1.id_thn_kegiatan
                    and litabmas1.dana_pt > 0.00
                    and litabmas1.jns_litabmas = 'M'
                    and pub1.id_jns_pub not in (41,42,43,44)
                ) as mandiri,
                (select 
                    count(litabmas2.id_litabmas)
                FROM $this->db_name.[pdrd].[litabmas] as litabmas2
                    left join $this->db_name.pdrd.publikasi as pub2 on pub2.id_litabmas = litabmas2.id_litabmas
                where litabmas.id_thn_kegiatan = litabmas2.id_thn_kegiatan
                    and litabmas2.dana_dikti > 0.00
                    and litabmas2.jns_litabmas = 'M'
                    and pub2.id_jns_pub not in (41,42,43,44)
                ) as lembaga_dalam,
                (select 
                    count(litabmas3.id_litabmas)
                FROM $this->db_name.[pdrd].[litabmas] as litabmas3
                    left join $this->db_name.pdrd.publikasi as pub3 on pub3.id_litabmas = litabmas3.id_litabmas
                where litabmas.id_thn_kegiatan = litabmas3.id_thn_kegiatan
                    and litabmas3.dana_institusi_lain > 0.00
                    and litabmas3.jns_litabmas = 'M'
                    and pub3.id_jns_pub not in (41,42,43,44)
                ) as lembaga_luar_mungkin

            FROM $this->db_name.[pdrd].[litabmas] as litabmas
            where id_thn_kegiatan in (2023,2022,2021,2020,2019)
            group by id_thn_kegiatan
            order by id_thn_kegiatan
        ";
        return collect(DB::select(DB::raw($query)));
    }

    public function publikasi_dtps()
    {
        $query = "
            SELECT  
                pub.id_jns_pub,
                --jenis.nm_jns_pub,
                year(pub.tgl_terbit) as tahun,
                count(pub.id_publikasi) as jumlah
            FROM $this->db_name.[pdrd].[publikasi] as pub
                left join $this->db_name.ref.jenis_publikasi as jenis on jenis.id_jns_pub = pub.id_jns_pub
            where year(pub.tgl_terbit) in (2022,2021,2020)
                and (pub.id_jns_pub = '21'
                or pub.id_jns_pub = '22'
                or pub.id_jns_pub = '23'
                or pub.id_jns_pub = '24'
                or pub.id_jns_pub = '31'
                or pub.id_jns_pub = '32')
            group by jenis.nm_jns_pub, pub.id_jns_pub, year(pub.tgl_terbit)
            order by pub.id_jns_pub, tahun
        ";
        return collect(DB::select(DB::raw($query)));
    }

    public function karya_ilmiah_disitasi($str)
    {
        $query = "
        SELECT 
            dosen.nm_sdm,
            pub.judul
        FROM $this->db_name.[pdrd].sdm_anggota_litabmas as litabmas
            left join $this->db_name.pdrd.publikasi as pub on pub.id_litabmas = litabmas.id_litabmas
            left join $this->db_name.pdrd.sdm as dosen on dosen.id_sdm = litabmas.id_sdm
            left join pdrd.reg_ptk as prodi on prodi.id_sdm = dosen.id_sdm
        where id_jns_pub in ('25','26','27')
            and year(pub.tgl_terbit) in (2023,2022,2021,2020,2019)
            AND dosen.nm_sdm IN ($str)
        ";
        return collect(DB::select(DB::raw($query)));
    }

    public function paten()
    {
        $query = "
            SELECT  distinct
                pub.id_publikasi,
                pub.[judul],
                year(pub.tgl_terbit) as tahun,
                prodi.id_sms
            FROM $this->db_name.[pdrd].[publikasi] as pub
                left join pdrd.sdm_anggota_litabmas as lit on lit.id_litabmas = pub.id_litabmas
                left join pdrd.reg_ptk as prodi on prodi.id_sdm = lit.id_sdm
            where id_jns_pub in ('41','42')
                and year(pub.tgl_terbit) in (2023,2022,2021,2020,2019)
        ";
        return collect(DB::select(DB::raw($query)));
    }

    public function hak_cipta()
    {
        $query = "
        SELECT Distinct
            pub.id_publikasi,
            pub.[judul],
            year(pub.tgl_terbit) as tahun,
            prodi.id_sms
        FROM $this->db_name.[pdrd].[publikasi] as pub
            left join $this->db_name.pdrd.sdm_anggota_litabmas as dosen on dosen.id_litabmas = pub.id_litabmas
            left join pdrd.reg_ptk as prodi on prodi.id_sdm = dosen.id_sdm
        where id_jns_pub in ('43','44')
        and year(pub.tgl_terbit) in (2023,2022,2021,2020,2019)
        ";

        return collect(DB::select(DB::raw($query)));
    }

    public function teknologi_karya()
    {
        $query = "
        SELECT
            pub.[judul],
            year(pub.tgl_terbit) as tahun
        FROM $this->db_name.[pdrd].[publikasi] as pub
            left join pdrd.sdm_anggota_litabmas as sdm on sdm.id_litabmas = pub.id_litabmas
            left join pdrd.reg_ptk as prodi on prodi.id_sdm = sdm.id_sdm
        where id_jns_pub in ('29','51','52','53','54','55','56')
            and year(pub.tgl_terbit) in (2023,2022,2021,2020,2019)
        ";
        return collect(DB::select(DB::raw($query)));
    }

    public function book()
    {
        $query = "
        SELECT Distinct
            pub.id_publikasi,
            pub.[judul],
            year(pub.tgl_terbit) as tahun,
            prodi.id_sms
        FROM $this->db_name.[pdrd].[publikasi] as pub
            left join pdrd.sdm_anggota_litabmas as dosen on dosen.id_litabmas = pub.id_litabmas
            left join pdrd.reg_ptk as prodi on prodi.id_sdm = dosen.id_sdm
        where id_jns_pub in ('12','13','14','15') and isbn is not null
        and year(pub.tgl_terbit) in (2023,2022,2021,2020,2019)
        order by id_publikasi
        ";
        return collect(DB::select(DB::raw($query)));
    }

    public function penelitian_dtps_mahasiswa($str)
    {
        $query = "
            SELECT distinct
                nm_dosen.nm_sdm as dosen,
                mhs.nm_pd as mhs,
                litabmas.judul_litabmas,
                litabmas.id_thn_kegiatan
            
            FROM $this->db_name.[pdrd].[litabmas] as litabmas
                left join $this->db_name.pdrd.pd_anggota_litabmas as mhs on mhs.id_litabmas = litabmas.id_litabmas
                left join $this->db_name.pdrd.sdm_anggota_litabmas as sdm on sdm.id_litabmas = litabmas.id_litabmas
                left join $this->db_name.pdrd.sdm as nm_dosen on nm_dosen.id_sdm = sdm.id_sdm
                left join $this->db_name.pdrd.publikasi as pub on pub.id_litabmas = litabmas.id_litabmas
                left join pdrd.reg_ptk as prodi on prodi.id_sdm = sdm.id_sdm
            where mhs.id_pd is not null
                and litabmas.jns_litabmas = 'L'
                and pub.id_jns_pub not in (41,42,43,44)
                and id_thn_kegiatan in (2023,2022,2021,2020,2019)
                AND nm_sdm in ($str)
            order by litabmas.id_thn_kegiatan
        ";
        return collect(DB::select(DB::raw($query)));
    }

    public function pkm_dtps_mhs($str)
    {
        $query = "
            SELECT
                nm_dosen.nm_sdm as dosen,
                mhs.nm_pd as mhs,
                litabmas.judul_litabmas,
                litabmas.id_thn_kegiatan

            FROM $this->db_name.[pdrd].[litabmas] as litabmas
                left join $this->db_name.pdrd.pd_anggota_litabmas as mhs on mhs.id_litabmas = litabmas.id_litabmas
                left join $this->db_name.pdrd.sdm_anggota_litabmas as sdm on sdm.id_litabmas = litabmas.id_litabmas
                left join $this->db_name.pdrd.sdm as nm_dosen on nm_dosen.id_sdm = sdm.id_sdm
                left join $this->db_name.pdrd.publikasi as pub on pub.id_litabmas = litabmas.id_litabmas
                left join pdrd.reg_ptk as prodi on prodi.id_sdm = sdm.id_sdm
            where mhs.id_pd is not null
                and litabmas.jns_litabmas = 'M'
                and pub.id_jns_pub not in (41,42,43,44)
                and id_thn_kegiatan in (2023,2022,2021,2020,2019)
                AND nm_sdm in ($str)
            order by litabmas.id_thn_kegiatan
        ";
        return collect(DB::select(DB::raw($query)));
    }

    public function ipk_mhs($str)
    {
        $query = "
            SELECT 
                id_sms as prodi,
                year(tgl_keluar) as tahun,
                avg (ipk) as ipk_rata2,
                max (ipk) as ipk_max,
                min (ipk) as ipk_min,
                count (id_jns_keluar) as jumlah_lulus
                
            FROM $this->db_name.[pdrd].[reg_pd]
            where tgl_keluar is not null and id_jns_keluar = '1'
                and year(tgl_keluar) in (2022,2021,2020)
                and id_sms = '$str'
            group by id_sms, year(tgl_keluar)
            order by tahun
        ";
        return collect(DB::select(DB::raw($query)));
    }

    public function prestasi_mhs($str)
    {
        $query = "
            SELECT distinct
                [id_prestasi],
                [id_jenis_prestasi],
                (case
                    when id_jenis_prestasi = '1' then 'akademik'
                    when id_jenis_prestasi != '1' then 'non-akademik'
                end )as akademik_kah,
                [id_akt_mhs],
                [nm_prestasi],
                [thn_prestasi],
                [peringkat],
                prestasi.[id_sp],
                prestasi.[id_pd],
                (case
                    when prodi1.id_sms is not null then prodi1.id_sms
                    when prodi2.id_sms is not null then prodi2.id_sms
                end) as prodi,
                [id_tkt_prestasi]
            FROM $this->db_name.[pdrd].[prestasi] as prestasi
                left join pdrd.reg_pd as prodi1 on prodi1.id_pd = prestasi.id_pd
                left join pdrd.reg_ptk as prodi2 on prodi1.id_sp = prestasi.id_sp
            where [thn_prestasi] in (2023,2022,2021,2020,2019)
            and prodi1.id_sms = '$str'
        ";
        return collect(DB::select(DB::raw($query)));
    }

    public function waktu_tunggu_lulusan_d3($str)
    {
        $query = "
            SELECT 
                lulusan.id_sms as prodi,
                year(lulusan.tgl_keluar) as tahun_lulus,
                count(lulusan.id_reg_pd) as total_lulus,
                (select 
                    count(tracer.id_hasil_tracer_study)
                from $this->db_name.tracer.hasil_tracer_study as tracer
                    left join pdrd.reg_pd as lulusan1 on lulusan1.id_reg_pd = tracer.id_reg_pd
                    left join pdrd.sms as prodi1 on prodi1.id_sms = lulusan1.id_sms
                where year(lulusan.tgl_keluar) = cast(tracer.id_thn_ajaran as int)
                    and prodi1.id_jenj_didik = '22'
                    and lulusan1.id_sms = lulusan.id_sms
                ) as total_terdeteksi,
                (select 
                    count(tracer1.id_hasil_tracer_study)
                from $this->db_name.tracer.hasil_tracer_study as tracer1
                    left join pdrd.reg_pd as lulusan2 on lulusan2.id_reg_pd = tracer1.id_reg_pd
                    left join pdrd.sms as prodi2 on prodi2.id_sms = lulusan2.id_sms
                where year(lulusan.tgl_keluar) = cast(tracer1.id_thn_ajaran as int)
                    and cast(tracer1.wkt_tunggu as int) < 3
                    and prodi2.id_jenj_didik = '22'
                    and lulusan2.id_sms = lulusan.id_sms
                ) as tunggu_kurang_3bulan,
                (select 
                    count(tracer2.id_hasil_tracer_study)
                from $this->db_name.tracer.hasil_tracer_study as tracer2
                    left join pdrd.reg_pd as lulusan3 on lulusan3.id_reg_pd = tracer2.id_reg_pd
                    left join pdrd.sms as prodi3 on prodi3.id_sms = lulusan3.id_sms
                where year(lulusan.tgl_keluar) = cast(tracer2.id_thn_ajaran as int)
                    and cast(tracer2.wkt_tunggu as int) >= 3 and cast(tracer2.wkt_tunggu as int) <= 6
                    and prodi3.id_jenj_didik = '22'
                    and lulusan3.id_sms = lulusan.id_sms
                ) as tunggu_antara_3_6,
                (select 
                    count(tracer3.id_hasil_tracer_study)
                from $this->db_name.tracer.hasil_tracer_study as tracer3
                    left join pdrd.reg_pd as lulusan4 on lulusan4.id_reg_pd = tracer3.id_reg_pd
                    left join pdrd.sms as prodi4 on prodi4.id_sms = lulusan4.id_sms
                where year(lulusan.tgl_keluar) = cast(tracer3.id_thn_ajaran as int)
                    and cast(tracer3.wkt_tunggu as int) > 6
                    and prodi4.id_jenj_didik = '22'
                    and lulusan4.id_sms = lulusan.id_sms
                ) as tunggu_lebih_6bulan,
                (select 
                    count(tracer4.id_hasil_tracer_study)
                from $this->db_name.tracer.hasil_tracer_study as tracer4
                    left join pdrd.reg_pd as lulusan5 on lulusan5.id_reg_pd = tracer4.id_reg_pd
                    left join pdrd.sms as prodi5 on prodi5.id_sms = lulusan5.id_sms
                where year(lulusan.tgl_keluar) = cast(tracer4.id_thn_ajaran as int)
                    and tracer4.wkt_tunggu is null
                    and prodi5.id_jenj_didik = '22'
                    and lulusan5.id_sms = lulusan.id_sms
                ) as tidak_tunggu

            FROM $this->db_name.[pdrd].[reg_pd] as lulusan
                left join pdrd.sms as prodi on prodi.id_sms = lulusan.id_sms
            where lulusan.id_jns_keluar = '1' and year(lulusan.tgl_keluar) is not null
                and prodi.id_jenj_didik = '22'
                and year(lulusan.tgl_keluar) in (2023,2022,2021,2020,2019)
                and lulusan.id_sms is not null
                and lulusan.id_sms = '$str'
            group by lulusan.id_sms, year(lulusan.tgl_keluar)
            order by year(lulusan.tgl_keluar)
        ";
        return collect(DB::select(DB::raw($query)));
    }

    public function waktu_tunggu_lulusan_s1($str)
    {
        $query = "
            SELECT 
                lulusan.id_sms as prodi,
                year(lulusan.tgl_keluar) as tahun_lulus,
                count(lulusan.id_reg_pd) as total_lulus,
                (select 
                    count(tracer.id_hasil_tracer_study)
                from $this->db_name.tracer.hasil_tracer_study as tracer
                    left join pdrd.reg_pd as lulusan1 on lulusan1.id_reg_pd = tracer.id_reg_pd
                    left join pdrd.sms as prodi1 on prodi1.id_sms = lulusan1.id_sms
                where year(lulusan.tgl_keluar) = cast(tracer.id_thn_ajaran as int)
                    and prodi1.id_jenj_didik = '30'
                    and lulusan1.id_sms = lulusan.id_sms
                ) as total_terdeteksi,
                (select 
                    count(tracer1.id_hasil_tracer_study)
                from $this->db_name.tracer.hasil_tracer_study as tracer1
                    left join pdrd.reg_pd as lulusan2 on lulusan2.id_reg_pd = tracer1.id_reg_pd
                    left join pdrd.sms as prodi2 on prodi2.id_sms = lulusan2.id_sms
                where year(lulusan.tgl_keluar) = cast(tracer1.id_thn_ajaran as int)
                    and cast(tracer1.wkt_tunggu as int) < 6
                    and prodi2.id_jenj_didik = '30'
                    and lulusan2.id_sms = lulusan.id_sms
                ) as tunggu_kurang_6bulan,
                (select 
                    count(tracer2.id_hasil_tracer_study)
                from $this->db_name.tracer.hasil_tracer_study as tracer2
                    left join pdrd.reg_pd as lulusan3 on lulusan3.id_reg_pd = tracer2.id_reg_pd
                    left join pdrd.sms as prodi3 on prodi3.id_sms = lulusan3.id_sms
                where year(lulusan.tgl_keluar) = cast(tracer2.id_thn_ajaran as int)
                    and cast(tracer2.wkt_tunggu as int) >= 6 and cast(tracer2.wkt_tunggu as int) <= 18
                    and prodi3.id_jenj_didik = '30'
                    and lulusan3.id_sms = lulusan.id_sms
                ) as tunggu_antara_6_18,
                (select 
                    count(tracer3.id_hasil_tracer_study)
                from $this->db_name.tracer.hasil_tracer_study as tracer3
                    left join pdrd.reg_pd as lulusan4 on lulusan4.id_reg_pd = tracer3.id_reg_pd
                    left join pdrd.sms as prodi4 on prodi4.id_sms = lulusan4.id_sms
                where year(lulusan.tgl_keluar) = cast(tracer3.id_thn_ajaran as int)
                    and cast(tracer3.wkt_tunggu as int) > 18
                    and prodi4.id_jenj_didik = '30'
                    and lulusan4.id_sms = lulusan.id_sms
                ) as tunggu_lebih_18bulan,
                (select 
                    count(tracer4.id_hasil_tracer_study)
                from $this->db_name.tracer.hasil_tracer_study as tracer4
                    left join pdrd.reg_pd as lulusan5 on lulusan5.id_reg_pd = tracer4.id_reg_pd
                    left join pdrd.sms as prodi5 on prodi5.id_sms = lulusan5.id_sms
                where year(lulusan.tgl_keluar) = cast(tracer4.id_thn_ajaran as int)
                    and tracer4.wkt_tunggu is null
                    and prodi5.id_jenj_didik = '30'
                    and lulusan5.id_sms = lulusan.id_sms
                ) as tidak_tunggu

            FROM $this->db_name.[pdrd].[reg_pd] as lulusan
                left join pdrd.sms as prodi on prodi.id_sms = lulusan.id_sms
            where lulusan.id_jns_keluar = '1' and year(lulusan.tgl_keluar) is not null
                and prodi.id_jenj_didik = '30'
                and year(lulusan.tgl_keluar) in (2021,2020,2019)
                and lulusan.id_sms is not null
                and lulusan.id_sms = '$str'
            group by lulusan.id_sms, year(lulusan.tgl_keluar)
            order by prodi, year(lulusan.tgl_keluar)
        ";
        return collect(DB::select(DB::raw($query)));
    }

    public function kesesuaian_lulusan()
    {
        $query = "
            SELECT 
                year(lulusan.tgl_keluar) as tahun_lulus,
                count(lulusan.id_reg_pd) as total_lulus,
                (select 
                    count(tracer.id_hasil_tracer_study)
                from $this->db_name.tracer.hasil_tracer_study as tracer
                where year(lulusan.tgl_keluar) = cast(tracer.id_thn_ajaran as int)
                ) as total_terdeteksi,
                (select 
                    count(tracer1.id_hasil_tracer_study)	
                from $this->db_name.tracer.hasil_tracer_study as tracer1
                where year(lulusan.tgl_keluar) = cast(tracer1.id_thn_ajaran as int)
                and tracer1.id_bid_kerja is not null
                and tracer1.tkt_kesesuaian = '1'
                ) as rendah,
                (select 
                    count(tracer3.id_hasil_tracer_study)	
                from $this->db_name.tracer.hasil_tracer_study as tracer3
                where year(lulusan.tgl_keluar) = cast(tracer3.id_thn_ajaran as int)
                and tracer3.id_bid_kerja is not null
                and tracer3.tkt_kesesuaian in ('2','3')
                ) as sedang,
                (select 
                    count(tracer2.id_hasil_tracer_study)	
                from $this->db_name.tracer.hasil_tracer_study as tracer2
                where year(lulusan.tgl_keluar) = cast(tracer2.id_thn_ajaran as int)
                and tracer2.id_bid_kerja is not null
                and tracer2.tkt_kesesuaian = '4'
                ) as tinggi,
                (select 
                    count(tracer4.id_hasil_tracer_study)	
                from $this->db_name.tracer.hasil_tracer_study as tracer4
                where year(lulusan.tgl_keluar) = cast(tracer4.id_thn_ajaran as int)
                and tracer4.id_bid_kerja is null
                ) as nganggur
            
            FROM $this->db_name.[pdrd].[reg_pd] as lulusan
            where lulusan.id_jns_keluar = '1' and year(lulusan.tgl_keluar) is not null
                and year(lulusan.tgl_keluar) in (2021,2020,2019)
            group by year(lulusan.tgl_keluar)
            order by year(lulusan.tgl_keluar)
        ";
        return collect(DB::select(DB::raw($query)));
    }

    public function tempat_kerja_lulusan($str)
    {
        $query = "
            SELECT 
                year(lulusan.tgl_keluar) as tahun_lulus,
                count(lulusan.id_reg_pd) as total_lulus,
                lulusan.id_sms,
                (select 
                    count(tracer.id_hasil_tracer_study)
                from $this->db_name.tracer.hasil_tracer_study as tracer
                where year(lulusan.tgl_keluar) = cast(tracer.id_thn_ajaran as int)
                ) as total_terdeteksi,
                (select 
                    count(tracer1.id_hasil_tracer_study)
                from $this->db_name.tracer.hasil_tracer_study as tracer1
                where year(lulusan.tgl_keluar) = cast(tracer1.id_thn_ajaran as int)
                and tracer1.level_perusahaan = 'Perusahaan Regional'
                ) as Regional,
                (select 
                    count(tracer2.id_hasil_tracer_study)
                from $this->db_name.tracer.hasil_tracer_study as tracer2
                where year(lulusan.tgl_keluar) = cast(tracer2.id_thn_ajaran as int)
                and tracer2.level_perusahaan = 'Perusahaan Nasional'
                ) as Nasional,
                (select 
                    count(tracer3.id_hasil_tracer_study)
                from $this->db_name.tracer.hasil_tracer_study as tracer3
                where year(lulusan.tgl_keluar) = cast(tracer3.id_thn_ajaran as int)
                and tracer3.level_perusahaan = 'Perusahaan Multinasional'
                ) as Internasional,
                (select 
                    count(tracer4.id_hasil_tracer_study)	
                from $this->db_name.tracer.hasil_tracer_study as tracer4
                where year(lulusan.tgl_keluar) = cast(tracer4.id_thn_ajaran as int)
                and tracer4.id_bid_kerja is null
                ) as nganggur
            
            FROM $this->db_name.[pdrd].[reg_pd] as lulusan
            where lulusan.id_jns_keluar = '1' and year(lulusan.tgl_keluar) is not null
                and year(lulusan.tgl_keluar) in (2021,2020,2019)
                and id_sms = '$str'
            group by lulusan.id_sms, year(lulusan.tgl_keluar)
            order by year(lulusan.tgl_keluar)
        ";
        return collect(DB::select(DB::raw($query)));
    }

    public function publikasi_ilmiah_mhs()
    {
        $query = "
            SELECT  
                pub.id_jns_pub,
                jenis.nm_jns_pub,
                year(pub.tgl_terbit) as tahun,
                count(pub.id_publikasi) as jumlah
            FROM $this->db_name.[pdrd].[publikasi] as pub
                left join $this->db_name.ref.jenis_publikasi as jenis on jenis.id_jns_pub = pub.id_jns_pub
                left join $this->db_name.pdrd.pd_anggota_litabmas as mhs on mhs.id_litabmas = pub.id_litabmas
            where mhs.id_litabmas = pub.id_litabmas
                and year(pub.tgl_terbit) in (2023,2022,2021,2020,2019)
                and pub.id_jns_pub != '13'
            group by jenis.nm_jns_pub, pub.id_jns_pub, year(pub.tgl_terbit)
            order by pub.id_jns_pub, tahun
        ";
        return collect(DB::select(DB::raw($query)));
    }

    public function karya_ilmiah_disitasi_mhs($str)
    {
        $query = "
            SELECT Distinct 
                mhs.nm_pd,
                pub.judul,
                prodi.id_sms
            
            FROM $this->db_name.[pdrd].pd_anggota_litabmas as litabmas
                left join $this->db_name.pdrd.publikasi as pub on pub.id_litabmas = litabmas.id_litabmas
                left join $this->db_name.pdrd.peserta_didik as mhs on mhs.id_pd = litabmas.id_pd
                left join pdrd.reg_pd as prodi on prodi.id_pd = mhs.id_pd
            where id_jns_pub in ('25','26','27')
                and year(pub.tgl_terbit) in (2023,2022,2021,2020,2019)
                and prodi.id_sms = '$str'
        ";
        return collect(DB::select(DB::raw($query)));
    }

    public function paten_mhs()
    {
        $query = "
            SELECT distinct
                pub.id_publikasi,
                pub.[judul],
                year(pub.tgl_terbit) as tahun,
                prodi.id_sms
            FROM $this->db_name.[pdrd].[publikasi] as pub
                left join pdrd.sdm_anggota_litabmas as lit on lit.id_litabmas = pub.id_litabmas
                left join pdrd.reg_ptk as prodi on prodi.id_sdm = lit.id_sdm
            where id_jns_pub in ('41','42')
                and year(pub.tgl_terbit) in (2023,2022,2021,2020,2019)
        ";
        return collect(DB::select(DB::raw($query)));
    }

    public function hak_cipta_mhs($str)
    {
        $query = "
            SELECT distinct
                pub.id_publikasi,
                pub.[judul],
                year(pub.tgl_terbit) as tahun,
                prodi.id_sms
            FROM $this->db_name.[pdrd].[publikasi] as pub
                left join $this->db_name.pdrd.pd_anggota_litabmas as mhs on mhs.id_litabmas = pub.id_litabmas
                left join pdrd.reg_pd as prodi on prodi.id_pd = mhs.id_pd
            where id_jns_pub in ('43','44')
                and mhs.id_litabmas = pub.id_litabmas
                and year(pub.tgl_terbit) in (2023,2022,2021,2020,2019)
            and id_sms = '$str'
        ";
        return collect(DB::select(DB::raw($query)));
    }

    public function teknologi_karya_mhs($str)
    {
        $query = "
            SELECT
                pub.[judul],
                year(pub.tgl_terbit) as tahun
            FROM $this->db_name.[pdrd].[publikasi] as pub
                left join pdrd.pd_anggota_litabmas as mhs on mhs.id_litabmas = pub.id_litabmas
                left join pdrd.reg_pd as prodi on prodi.id_pd = mhs.id_pd
            where id_jns_pub in ('29','51','52','53','54','55','56')
                and mhs.id_litabmas = pub.id_litabmas
                and year(pub.tgl_terbit) in (2023,2022,2021,2020,2019)
                and id_sms = '$str'
        ";
        return collect(DB::select(DB::raw($query)));
    }

    public function book_mhs($str)
    {
        $query = "
            SELECT
                pub.id_publikasi,
                pub.[judul],
                year(pub.tgl_terbit) as tahun,
                prodi.id_sms
            FROM $this->db_name.[pdrd].[publikasi] as pub
                left join $this->db_name.pdrd.pd_anggota_litabmas as mhs on mhs.id_litabmas = pub.id_litabmas
                left join pdrd.reg_pd as prodi on prodi.id_pd = mhs.id_pd
            where id_jns_pub in ('12','13','14','15') and isbn is not null
                and mhs.id_litabmas = pub.id_litabmas
                and year(pub.tgl_terbit) in (2023,2022,2021,2020,2019)
                and id_sms = '$str'
        ";
        return collect(DB::select(DB::raw($query)));
    }

    //Next detail of detail_akreditasi
    public function next_detail_akreditasi_prodi($id_prodi, $ts){
        $id_prodi = Crypt::decrypt($id_prodi);

        $mahasiswa = $this->mahasiswa($id_prodi)->filter(function ($mahasiswa) use ($ts) {
            $prefix = substr($mahasiswa->npm, 0, 2);
            return $prefix === $ts;
        });

        return view('dashboard.akreditasi.next_detail_akreditasi', compact(
            'mahasiswa'
        ));
    }
}
