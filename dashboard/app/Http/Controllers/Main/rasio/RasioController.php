<?php

namespace App\Http\Controllers\Main\rasio;

use App\Models\Pdrd\SMS;
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


        $fakultas = SMS::select(['id_sms', 'nm_lemb'])
            ->where('id_jns_sms', '=', '1')
            ->where('id_sp', '=', env('APP_ID_SP'))->get();


        // dd($tahun_ajaran);
        // --- END TODO ---

        return view('content.main.rasio.index', compact('tahun_ajaran', 'fakultas'));
    }

    /**
     * Get data for faculty chart.
     *
     * @param  \Illuminate\Http\Request  $request
     */
    public function getDataFakultas(Request $request)
    {
        $id_smt = $request->tahun_ajaran ?? $this->getTahunAjaranAktif()->id_smt;

        $id_thn_ajaran = (int) floor($id_smt / 10);

        // --- TODO: Replace with your actual SQL logic ---
        // This is a placeholder. Replace with your actual data retrieval logic.
        // The output should be in a format that Highcharts can consume.

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

        $seriesMahasiswa = [
            'name' => 'Mahasiswa',
            'data' => $data_mahasiswa->map(function ($row) {
                return [
                    'name' => $row->nama_fakultas,
                    'y' => (int) $row->jumlah_mahasiswa
                ];
            })->values()
        ];

        $seriesDosen = [
            'name' => 'Dosen',
            'data' => $data_dosen->map(function ($row) {
                return [
                    'name' => $row->nama_fakultas,
                    'y' => (int) $row->jumlah_dosen
                ];
            })->values()
        ];
        $chartData = [
            $seriesMahasiswa,
            $seriesDosen
        ];


        // --- END TODO ---

        return response()->json([
            'title' => 'Rasio Mahasiswa dan Dosen per Fakultas',
            'subtitle' => 'Tahun Ajaran ' . $id_smt,
            'series' => $chartData
        ]);
    }

    /**
     * Get data for program chart (drilldown).
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     */
    public function getDataProdi(Request $request, $id)
    {
        // --- TODO: Replace with your actual SQL logic ---
        // This is a placeholder. Replace with your actual data retrieval logic
        // based on the faculty id ($id).

        $id_smt = $request->tahun_ajaran ?? $this->getTahunAjaranAktif()->id_smt;
        $id_thn_ajaran = (int) floor($id_smt / 10);

        $sql_mhs = "
            SELECT
                psms.id_sms,
                CONCAT(psms.nm_lemb, ' (', jenjang.nm_jenj_didik, ')') AS nm_lemb,
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
                JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik = psms.id_jenj_didik
                WHERE
                peserta.soft_delete = 0 AND
                peserta.id_stat_mhs = 'A'
                AND psms.id_fak_unila = ?
                GROUP BY
                psms.id_sms,
                psms.nm_lemb,
                jenjang.nm_jenj_didik
                ORDER BY jumlah_mahasiswa DESC
        ";

        $sql_dosen = "
                        SELECT
                sms.id_sms AS id_prodi,
                CONCAT(sms.nm_lemb, ' (', jenjang.nm_jenj_didik, ')') AS nama_prodi,
                jenjang.nm_jenj_didik AS jenjang,
                COUNT(DISTINCT reg.id_sdm) AS jumlah_dosen
                FROM
                pdrd.reg_ptk AS reg
                INNER JOIN pdrd.sdm AS sdm ON sdm.id_sdm = reg.id_sdm
                AND sdm.soft_delete = 0
                AND sdm.id_jns_sdm = '12'
                INNER JOIN pdrd.sms AS sms ON sms.id_sms = reg.id_sms
                AND sms.soft_delete = 0
                AND sms.stat_prodi = 'A'
                INNER JOIN pdrd.sms AS fak ON fak.id_sms = sms.id_fak_unila
                AND fak.soft_delete = 0
                INNER JOIN pdrd.keaktifan_ptk AS keaktifan ON keaktifan.id_reg_ptk = reg.id_reg_ptk
                AND keaktifan.soft_delete = 0
                AND keaktifan.a_sp_homebase = 1
                AND keaktifan.id_thn_ajaran = ?
                JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik = sms.id_jenj_didik
                WHERE
                reg.soft_delete = 0
                AND reg.id_jns_keluar IS NULL
                AND sms.id_fak_unila = ?
                GROUP BY
                sms.id_sms,
                sms.nm_lemb,
                jenjang.nm_jenj_didik
        ";

        $fakultas = DB::table('pdrd.sms')
            ->where('id_sms', $id)
            ->where('soft_delete', 0)
            ->first();

        $data_mahasiswa = collect(DB::select($sql_mhs, [$id_smt, $id]));
        $data_dosen = collect(DB::select($sql_dosen, [$id_thn_ajaran, $id]));

        $seriesMahasiswa = [
            'name' => 'Mahasiswa',
            'data' => $data_mahasiswa->map(function ($row) {
                return [
                    'name' => $row->nm_lemb,
                    'y' => (int) $row->jumlah_mahasiswa
                ];
            })->values()
        ];

        $seriesDosen = [
            'name' => 'Dosen',
            'data' => $data_dosen->map(function ($row) {
                return [
                    'name' => $row->nama_prodi, // atau $row->nm_lemb kalau disamakan
                    'y' => (int) $row->jumlah_dosen
                ];
            })->values()
        ];

        $data = [
            $seriesMahasiswa,
            $seriesDosen
        ];

        // --- END TODO ---

        return response()->json([
            'title' => 'Rasio Mahasiswa dan Dosen Program Studi ' . ($fakultas->nm_lemb ?? ''),
            "fakultas" => $fakultas->nm_lemb,
            'subtitle' => 'Tahun Ajaran ' . $id_smt,
            'series' => $data
        ]);
    }

    /**
     * Get data for dosen datatable.
     *
     * @return \Illuminate\Http\Response
     */
    public function getDosenDatatable(Request $request)
    {
        $id_fakultas = $request->fakultas_id;
        $id_smt = $request->id_thn_ajaran ?? $this->getTahunAjaranAktif()->id_smt;
        $id_thn_ajaran = (int) floor($id_smt / 10);

        $sql = "
        SELECT
            sdm.nm_sdm AS nama_dosen,
            sdm.nip AS nip,
            fak.nm_lemb AS fakultas,
            CONCAT(sms.nm_lemb, ' (', jenjang.nm_jenj_didik, ')') AS prodi
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
        JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik = sms.id_jenj_didik
        WHERE
            reg.soft_delete = 0
            AND reg.id_jns_keluar IS NULL
    ";

        $bindings = [$id_thn_ajaran];

        if ($id_fakultas) {
            $sql .= " AND sms.id_fak_unila = ? ";
            $bindings[] = $id_fakultas;
        }

        $data = collect(DB::select($sql, $bindings));


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
    public function getMahasiswaDatatable(Request $request)
    {
        $id_fakultas = $request->fakultas_id;
        $id_smt = $request->id_thn_ajaran ?? $this->getTahunAjaranAktif()->id_smt;
        // --- TODO: Replace with your actual data ---
        $sql = "
            SELECT
                peserta.nm_pd,
                psms.id_sms,
                fak.nm_lemb AS nama_fakultas,
                CONCAT(psms.nm_lemb, ' (', jenjang.nm_jenj_didik, ')') AS nama_prodi
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
                JOIN ref.jenjang_pendidikan AS jenjang ON jenjang.id_jenj_didik = psms.id_jenj_didik
                WHERE
                peserta.soft_delete = 0
                AND peserta.id_stat_mhs = 'A'
                AND psms.id_fak_unila = ?

        ";

        $bindings = [$id_smt];

        if ($id_fakultas) {
            $sql .= " AND psms.id_fak_unila = ? ";
            $bindings[] = $id_fakultas;
        }
        $data = collect(DB::select($sql, $bindings));
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
