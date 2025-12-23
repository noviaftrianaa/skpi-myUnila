<?php

namespace App\Http\Controllers\Main\rasio;

use Illuminate\Http\Request;
use Yajra\DataTables\DataTables;
use App\Models\Referensi\Semester;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;

class RasioController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        // --- TODO: Replace with your actual data ---
        $tahun_ajaran = Semester::select('id_smt', 'nm_smt')
            ->where('tgl_mulai', '<', date('Y-m-d'))
            ->whereNull('expired_date')
            ->where('smt', '!=', 3)
            ->orderBy('id_smt', 'DESC')
            ->get();

        $fakultas = collect([
            (object)['id' => 1, 'nama' => 'Fakultas Teknik'],
            (object)['id' => 2, 'nama' => 'Fakultas Ekonomi dan Bisnis'],
            (object)['id' => 3, 'nama' => 'Fakultas Hukum'],
            (object)['id' => 4, 'nama' => 'Fakultas Kedokteran'],
            (object)['id' => 5, 'nama' => 'Fakultas Pertanian'],
        ]);

        // dd($tahun_ajaran);
        // --- END TODO ---

        return view('content.main.rasio.index', compact('tahun_ajaran', 'fakultas'));
    }

    /**
     * Get data for faculty chart.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function getDataFakultas(Request $request)
    {
        $id_smt = $request->tahun_ajaran ?? $this->getTahunAjaranAktif()->id_smt;

        $id_thn_ajaran = (int) floor($id_smt / 10);
        // dd($id_thn_ajaran);
        // --- TODO: Replace with your actual SQL logic ---
        // This is a placeholder. Replace with your actual data retrieval logic.
        // The output should be in a format that Highcharts can consume.
        // Example format:
        // dd($tahun_ajaran_dosen);

        $sql_mahasiswa = "
            SELECT
            fak.id_sms AS id_fakultas,
            fak.nm_lemb AS nama_fakultas,
            COUNT(DISTINCT peserta.id_pd) AS jumlah_mahasiswa
            FROM
            pdrd.peserta_didik AS peserta
            JOIN pdrd.reg_pd AS reg_pd ON reg_pd.id_pd = peserta.id_pd
            AND reg_pd.soft_delete = 0
            JOIN pdrd.sms AS psms ON psms.id_sms = reg_pd.id_sms
            AND psms.soft_delete = 0
            JOIN pdrd.sms AS fak ON psms.id_fak_unila = fak.id_sms
            AND fak.soft_delete = 0
            JOIN pdrd.kuliah_mhs AS kmh ON kmh.id_reg_pd = reg_pd.id_reg_pd
            AND kmh.id_smt = ?
            AND kmh.soft_delete = 0
            AND kmh.id_stat_mhs = 'A'
            WHERE
            peserta.soft_delete = 0 AND
            peserta.id_stat_mhs = 'A'
            GROUP BY
            fak.id_sms,
            fak.nm_lemb
            ORDER BY jumlah_mahasiswa DESC
        ";

        $sql_dosen = "
                    SELECT
                fak.id_sms AS id_fakultas,
                fak.nm_lemb AS nama_fakultas,
                COUNT(DISTINCT reg.id_sdm) AS jumlah_dosen
            FROM pdrd.reg_ptk AS reg
            INNER JOIN pdrd.sdm AS sdm
                ON sdm.id_sdm = reg.id_sdm
                AND sdm.soft_delete = 0
                AND sdm.id_jns_sdm = '12'
            INNER JOIN pdrd.sms AS sms
                ON sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
            INNER JOIN pdrd.sms AS fak
                ON fak.id_sms = sms.id_fak_unila
                AND fak.soft_delete = 0
            INNER JOIN pdrd.keaktifan_ptk AS keaktifan
                ON keaktifan.id_reg_ptk = reg.id_reg_ptk
                AND keaktifan.soft_delete = 0
                AND keaktifan.a_sp_homebase = 1
                AND keaktifan.id_thn_ajaran = ?
            WHERE reg.soft_delete = 0
                AND reg.id_jns_keluar IS NULL
            GROUP BY fak.id_sms, fak.nm_lemb
        ";

        $data_mahasiswa = collect(DB::select($sql_mahasiswa, [$id_smt]));
        $data_dosen = collect(DB::select($sql_dosen, [$id_thn_ajaran]));

        // $seriesMahasiswa = [
        //     'name' => 'Mahasiswa',
        //     'data' => $data_mahasiswa->map( function ($row) {
        //         return [
        //             'name' => $row->nama_fakultas,
        //             'y' => (int) $row->jumlah_mahasiswa
        //         ];
        //     })->values()
        // ];

        // $seriesDosen = [
        //     'name' => 'Dosen',
        //     'data' => $data_dosen->map(function ($row) {
        //         return [
        //             'name' => $row->nama_fakultas,
        //             'y' => (int) $row->jumlah_dosen
        //         ];
        //     })->values()
        // ];
        // $chartData = [
        //     $seriesMahasiswa,
        //     $seriesDosen
        // ];


        $fakultasList = $data_mahasiswa
            ->pluck('nama_fakultas')
            ->merge($data_dosen->pluck('nama_fakultas'))
            ->unique()
            ->values();

        $seriesMahasiswa = [
            'name' => 'Mahasiswa',
            'data' => $fakultasList->map(function ($nama) use ($data_mahasiswa, $data_dosen) {
                $mhs = $data_mahasiswa->firstWhere('nama_fakultas', $nama);
                $dsn = $data_dosen->firstWhere('nama_fakultas', $nama);

                $jumlahMahasiswa = $mhs ? (int) $mhs->jumlah_mahasiswa : 0;
                $jumlahDosen = $dsn ? (int) $dsn->jumlah_dosen : 0;

                return [
                    'y' => $jumlahMahasiswa,
                    'rasio' => $jumlahDosen > 0
                        ? round($jumlahMahasiswa / $jumlahDosen, 2)
                        : 0,
                    'dosen' => $jumlahDosen
                ];
            })
        ];

        $seriesDosen = [
            'name' => 'Dosen',
            'data' => $fakultasList->map(function ($nama) use ($data_mahasiswa, $data_dosen) {
                $mhs = $data_mahasiswa->firstWhere('nama_fakultas', $nama);
                $dsn = $data_dosen->firstWhere('nama_fakultas', $nama);

                $jumlahMahasiswa = $mhs ? (int) $mhs->jumlah_mahasiswa : 0;
                $jumlahDosen = $dsn ? (int) $dsn->jumlah_dosen : 0;

                return [
                    'y' => $jumlahDosen,
                    'rasio' => $jumlahDosen > 0
                        ? round($jumlahMahasiswa / $jumlahDosen, 2)
                        : 0,
                    'mahasiswa' => $jumlahMahasiswa
                ];
            })
        ];
        $chartData = [
            'categories' => $fakultasList,
            'series' => [
                $seriesMahasiswa,
                $seriesDosen
            ]
        ];

        // --- END TODO ---

        return response()->json($chartData);
    }

    /**
     * Get data for program chart (drilldown).
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function getDataProdi(Request $request, $id)
    {
        // --- TODO: Replace with your actual SQL logic ---
        // This is a placeholder. Replace with your actual data retrieval logic
        // based on the faculty id ($id).
        $data = [
            [
                'name' => 'Mahasiswa',
                'data' => [
                    ['name' => 'Teknik Informatika', 'y' => 400],
                    ['name' => 'Teknik Elektro', 'y' => 300],
                    ['name' => 'Teknik Mesin', 'y' => 500],
                ]
            ],
            [
                'name' => 'Dosen',
                'data' => [
                    ['name' => 'Teknik Informatika', 'y' => 40],
                    ['name' => 'Teknik Elektro', 'y' => 35],
                    ['name' => 'Teknik Mesin', 'y' => 45],
                ]
            ]
        ];
        // --- END TODO ---

        return response()->json($data);
    }

    /**
     * Get data for dosen datatable.
     *
     * @return \Illuminate\Http\Response
     */
    public function getDosenDatatable()
    {
        // --- TODO: Replace with your actual data ---
        $data = collect([
            ['id' => 1, 'nama_dosen' => 'Dr. John Doe', 'nip' => '123456789', 'fakultas' => 'Fakultas Teknik'],
            ['id' => 2, 'nama_dosen' => 'Dr. Jane Smith', 'nip' => '987654321', 'fakultas' => 'Fakultas Ekonomi dan Bisnis'],
        ]);
        // --- END TODO ---

        return DataTables::of($data)
            ->addIndexColumn()
            ->make(true);
    }

    /**
     * Get data for mahasiswa datatable.
     *
     * @return \Illuminate\Http\Response
     */
    public function getMahasiswaDatatable()
    {
        // --- TODO: Replace with your actual data ---
        $data = collect([
            ['id' => 1, 'nama_mahasiswa' => 'Andy', 'npm' => '1915061001', 'fakultas' => 'Fakultas Teknik', 'prodi' => 'Teknik Informatika'],
            ['id' => 2, 'nama_mahasiswa' => 'Budi', 'npm' => '1915061002', 'fakultas' => 'Fakultas Teknik', 'prodi' => 'Teknik Informatika'],
        ]);
        // --- END TODO ---

        return DataTables::of($data)
            ->addIndexColumn()
            ->make(true);
    }

    private function getTahunAjaranAktif()
    {
        $sql = "
                SELECT TOP
                1 id_smt, id_thn_ajaran
                FROM
                ref.semester
                WHERE
                expired_date IS NULL
                AND a_periode_aktif = 1

        ";

        $data = DB::select($sql);

        return $data[0];
    }
}
