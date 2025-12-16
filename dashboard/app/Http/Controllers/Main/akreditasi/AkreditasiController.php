<?php

namespace App\Http\Controllers\Main\akreditasi;

use Carbon\Carbon;
use App\Models\Pdrd\SMS;
use Illuminate\Http\Request;
use Yajra\DataTables\DataTables;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Models\Referensi\TahunAjaran;
use Illuminate\Support\Facades\Crypt;

class AkreditasiController extends Controller
{
    /**
     * Menampilkan halaman utama untuk data akreditasi.
     * Fungsi ini menyiapkan header tabel dan data awal yang diperlukan oleh view.
     *
     * @return \Illuminate\View\View Mengembalikan view yang menampilkan daftar akreditasi fakultas.
     */
    public function index()
    {
        // Mendefinisikan kolom-kolom untuk header tabel di halaman utama.
        $thead = "          <th>No</th>
                            <th>Nama Fakultas</th>
                            <th>Total Prodi</th>
                            <th>Jenjang Prodi</th>
                            <th>Jumlah Prodi Akreditasi Masih Aktif</th>
                            <th>Jumlah Hampir Kadaluwarsa</th>";

        // Inisialisasi variabel id_prodi sebagai string kosong.
        $id_prodi = "";

        // Mengembalikan view 'index' dengan data thead dan id_prodi.
        return view('content.main.akreditasi.index', compact('thead', "id_prodi"));
    }

    /**
     * Menampilkan detail akreditasi untuk program studi tertentu.
     * Fungsi ini digunakan untuk menampilkan data prodi di bawah fakultas tertentu.
     *
     * @param  string  $idProdi ID program studi yang dienkripsi.
     * @return \Illuminate\View\View Mengembalikan view yang sama dengan data detail prodi.
     */
    public function prodiDetail($idProdi)
    {
        // Mendefinisikan kolom-kolom untuk header tabel di halaman detail prodi.
        $thead = "                      <th>No</th>
            <th>Nama Prodi</th>
            <th>Jenjang</th>
            <th>No SK</th>
            <th>Tanggal SK</th>
            <th>TST SK</th>
            <th>Akreditasi</th>";

        // Menyimpan ID prodi yang dienkripsi.
        $id_prodi = $idProdi;
        // Mengambil informasi fakultas berdasarkan ID prodi yang telah didekripsi.
        $get_fak = SMS::find(Crypt::decrypt($id_prodi));
        // Mengembalikan view 'index' dengan data thead, id_prodi, dan informasi fakultas.
        return view('content.main.akreditasi.index', compact('thead', 'id_prodi', 'get_fak'));
    }

    /**
     * Mengambil daftar tahun ajaran untuk keperluan filter (select2).
     * Fungsi ini merespons permintaan AJAX dan mengembalikan data dalam format JSON.
     *
     * @param  \Illuminate\Http\Request  $request Request dari client.
     * @return \Illuminate\Http\JsonResponse Respon JSON yang berisi daftar tahun ajaran.
     */
    public function getTahun(Request $request)
    {
        $search = $request->search;

        if ($search === '') {
            // Jika tidak ada kriteria pencarian, ambil semua tahun ajaran yang relevan.
            $ta_list = TahunAjaran::select('id_thn_ajaran', 'nm_thn_ajaran')
                ->where('tgl_mulai', '<', date('Y-m-d')) // Hanya tahun ajaran yang sudah dimulai.
                ->whereNull('expired_date') // Bukan data yang sudah kadaluarsa.
                ->orderBy('id_thn_ajaran', 'DESC') // Urutkan dari yang terbaru.
                ->pluck('nm_thn_ajaran', 'id_thn_ajaran')
                ->toArray();
        } else {
            // Jika ada kriteria pencarian, filter berdasarkan ID tahun ajaran.
            $ta_list = TahunAjaran::select('id_thn_ajaran', 'nm_thn_ajaran')
                ->where('tgl_mulai', '<', date('Y-m-d'))
                ->whereNull('expired_date')
                ->where('id_thn_ajaran', 'like', '%' . $search . '%')
                ->orderBy('id_thn_ajaran', 'DESC')
                ->pluck('nm_thn_ajaran', 'id_thn_ajaran')
                ->toArray();
        }
        
        $response = array();
        foreach ($ta_list as $id => $nama) {
            $response[] = array(
                'id' => $id,
                'text' => $id, // Format untuk select2.
            );
        }
        
        // Mengembalikan hasil dalam format JSON.
        return response()->json([
            "results" => $response
        ]);
    }

    /**
     * Mengambil data agregat akreditasi per fakultas untuk ditampilkan di DataTables.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getDataAkreditasi(Request $request)
    {
        // Query SQL mentah untuk menghitung statistik akreditasi per fakultas.
        $sql = "
                SELECT
                fak.id_sms,
                fak.nm_lemb,
                COUNT(DISTINCT psms.id_sms) AS total_prodi,
                COUNT(DISTINCT CASE WHEN didik.nm_jenj_didik = 'D3' THEN psms.id_sms END) AS jenjang_d3,
                COUNT(DISTINCT CASE WHEN didik.nm_jenj_didik = 'D4' THEN psms.id_sms END) AS jenjang_d4,
                COUNT(DISTINCT CASE WHEN didik.nm_jenj_didik = 'S1' THEN psms.id_sms END) AS jenjang_s1,
                COUNT(DISTINCT CASE WHEN didik.nm_jenj_didik = 'S2' THEN psms.id_sms END) AS jenjang_s2,
                COUNT(DISTINCT CASE WHEN didik.nm_jenj_didik = 'S3' THEN psms.id_sms END) AS jenjang_s3,
                COUNT(DISTINCT CASE WHEN didik.nm_jenj_didik = 'Profesi' THEN psms.id_sms END) AS jenjang_profesi,
                COUNT(DISTINCT CASE WHEN didik.nm_jenj_didik = 'Sp-1' THEN psms.id_sms END) AS jenjang_sp1,
                COUNT(DISTINCT CASE WHEN didik.nm_jenj_didik = 'Sp-2' THEN psms.id_sms END) AS jenjang_sp2,
                SUM(
                    CASE

                        WHEN akred_prodi.tst_sk_akreditasi_prodi >= CAST (GETDATE() AS DATE)
                        AND akred_prodi.tst_sk_akreditasi_prodi < DATEADD(YEAR, 1, CAST (GETDATE() AS DATE)) THEN
                        1 ELSE 0
                        END) AS prodi_akan_kadaluarsa,
                    SUM(CASE WHEN CAST (GETDATE() AS DATE) BETWEEN akred_prodi.tanggal_sk_akreditasi_prodi AND akred_prodi.tst_sk_akreditasi_prodi THEN 1 ELSE 0 END) AS prodi_aktif
                    FROM
                    pdrd.sms AS psms
                    JOIN pdrd.sms AS fak ON psms.id_fak_unila = fak.id_sms
                    JOIN ref.jenjang_pendidikan AS didik ON didik.id_jenj_didik = psms.id_jenj_didik
                    AND didik.expired_date
                    IS NULL LEFT JOIN pdrd.akreditasi_prodi AS akred_prodi ON psms.id_sms = akred_prodi.id_sms
                    AND akred_prodi.soft_delete = 0
                    WHERE
                    psms.id_jns_sms = '3'
                    AND psms.id_sp = 'E2B705A7-173E-464A-9FAC-509128709515'
                    AND psms.soft_delete = 0
                    AND psms.id_fak_unila IS NOT NULL
                          AND psms.stat_prodi = 'A'

                    GROUP BY
                    fak.id_sms,
                    fak.nm_lemb

        ";

        // Eksekusi query dan format hasilnya menggunakan Collection.
        $data_akreditasi = collect(DB::select($sql))->map(function ($item) {
            $jenjang = [
                'D3'       => $item->jenjang_d3,
                'D4'       => $item->jenjang_d4,
                'S1'       => $item->jenjang_s1,
                'S2'       => $item->jenjang_s2,
                'S3'       => $item->jenjang_s3,
                'Profesi'  => $item->jenjang_profesi,
                'Sp-1'     => $item->jenjang_sp1,
                'Sp-2'     => $item->jenjang_sp2,
            ];

            return [
                "id"                    => $item->id_sms,
                "nama_lembaga"          => '<p class="mb-0 text-primary fak-link" style="cursor:pointer" ><a href="' . route('akreditasi.prodi', [Crypt::encrypt($item->id_sms)]) . '">' . $item->nm_lemb . '</a></p>',
                "total_prodi"           => $item->total_prodi,
                "jenjang_list"          => $this->transListJenj($jenjang),
                "prodi_akan_kadaluarsa" => $item->prodi_akan_kadaluarsa,
                "prodi_aktif"           => $item->prodi_aktif,
            ];
        });

        // Mengembalikan data yang telah diformat untuk DataTables.
        return DataTables::of($data_akreditasi)
            ->addIndexColumn() // Menambahkan kolom nomor urut.
            ->rawColumns(['nama_lembaga', 'jenjang_list']) // Kolom yang mengandung HTML.
            ->make(true);
    }

    /**
     * Mengambil data detail akreditasi per program studi untuk ditampilkan di DataTables.
     *
     * @param  string  $idProdi ID fakultas yang dienkripsi.
     * @return \Illuminate\Http\JsonResponse
     */
    public function getDataAkreditasiProdi($idProdi)
    {
        $id_prodi = Crypt::decrypt($idProdi);

        // Query untuk mengambil detail akreditasi semua prodi di bawah satu fakultas.
        $sql = "
        SELECT DISTINCT
            psms.id_sms AS id,
            psms.id_fak_unila AS id_fak,
            psms.id_jur_unila AS id_jur,
            psms.nm_lemb AS nama_prodi,
            didik.nm_jenj_didik AS jenjang_didik,
            akred_prodi.sk_akreditasi_prodi,
            akred_prodi.tanggal_sk_akreditasi_prodi,
            akred_prodi.tst_sk_akreditasi_prodi,
            nilai.nm_akred as nilai_akreditasi,
            lembaga_akred.nm_lemb AS lembaga_akreditasi

            FROM
                pdrd.sms AS psms
            JOIN pdrd.sms AS fak ON psms.id_fak_unila = fak.id_sms
            JOIN ref.jenjang_pendidikan AS didik ON didik.id_jenj_didik = psms.id_jenj_didik
            AND didik.expired_date
            IS NULL LEFT JOIN pdrd.akreditasi_prodi AS akred_prodi ON psms.id_sms = akred_prodi.id_sms
            AND akred_prodi.soft_delete = 0
            JOIN ref.nilai_akred AS nilai ON akred_prodi.id_akred = nilai.id_akred
            JOIN ref.lembaga_akred as lembaga_akred ON akred_prodi.id_lemb_akred = lembaga_akred.id_lemb_akred

            WHERE
            psms.id_jns_sms = '3'
            AND psms.id_sp = 'E2B705A7-173E-464A-9FAC-509128709515'
            AND psms.soft_delete = 0
            AND psms.id_fak_unila = ?
            AND psms.stat_prodi = 'A'
        ";

        $data = collect(DB::select($sql, [$id_prodi]));

        // Mengelompokkan data berdasarkan ID prodi dan memproses setiap grup.
        $merged = $data->groupBy('id')->map(function ($items) {

            // Menghitung tanggal selesai (TST) jika kosong, dengan asumsi 5 tahun dari tanggal SK.
            $items = $items->map(function ($row) {
                if (!$row->tst_sk_akreditasi_prodi && $row->tanggal_sk_akreditasi_prodi) {
                    $row->tst_sk_akreditasi_prodi = Carbon::parse($row->tanggal_sk_akreditasi_prodi)
                        ->addYears(5)
                        ->format('Y-m-d');
                }
                return $row;
            });

            // Mengambil data akreditasi terbaru berdasarkan tanggal SK.
            $terbaru = $items
                ->sortByDesc(fn($r) => Carbon::parse($r->tanggal_sk_akreditasi_prodi))
                ->first();

            // Jika tidak ada data akreditasi yang valid, lewati.
            if (!$terbaru) {
                return null;
            }

            // Menentukan status dan warna tampilan berdasarkan tanggal kedaluwarsa.
            $akhir = Carbon::parse($terbaru->tst_sk_akreditasi_prodi);
            $sekarang = Carbon::now();

            // Jika sudah kadaluwarsa, jangan tampilkan.
            if ($akhir->isPast()) {
                return null;
            }

            $warna = 'bg-success-subtle text-success'; // Default: masih berlaku
            $status = 'Masih berlaku';

            // Jika akan kadaluwarsa dalam 1 tahun.
            if ($sekarang->diffInYears($akhir) <= 1) {
                $warna = 'bg-warning-subtle text-warning';
                $status = 'Akan kadaluarsa';
            }

            return [
                'id' => $terbaru->id,
                'id_fak' => $terbaru->id_fak,
                'id_jur' => $terbaru->id_jur,
                'nama_prodi' => $terbaru->nama_prodi,
                'jenjang_didik' => $terbaru->jenjang_didik,
                'histori_akreditasi' => "
            <div class='p-2 rounded {$warna}'>
                <strong>Nilai : {$terbaru->nilai_akreditasi}</strong><br>
                <small>
                    SK: {$terbaru->sk_akreditasi_prodi}<br>
                    Berlaku: {$terbaru->tanggal_sk_akreditasi_prodi}
                    s/d {$terbaru->tst_sk_akreditasi_prodi}<br>
                    Lembaga Akreditasi : {$terbaru->lembaga_akreditasi}<br>
                    <em>Status: {$status}</em>
                </small>
            </div>
        "
            ];
        })->filter()->values(); // Hapus item null dan re-index collection.
        
        // Mengembalikan data yang telah diformat untuk DataTables.
        return DataTables::of($merged)
            ->addIndexColumn()
            ->rawColumns(['histori_akreditasi'])
            ->make(true);
    }

    /**
     * Helper untuk mengubah array jenjang pendidikan menjadi daftar HTML.
     *
     * @param  array  $jenjang Array asosiatif ['Jenjang' => 'Jumlah'].
     * @return string HTML string berupa unordered list.
     */
    private function transListJenj(array $jenjang): string
    {
        $html = '<ul>';

        foreach ($jenjang as $label => $jumlah) {
            if ($jumlah > 0) {
                $html .= "<li>{$label} : {$jumlah}</li>";
            }
        }

        $html .= '</ul>';

        return $html;
    }
}