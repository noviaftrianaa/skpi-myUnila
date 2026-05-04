<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

/**
 * MasterDataController — referensi SIMKATMAWA + CRUD admin + sync dari pdut.
 *
 * - GET endpoints: read paginated list (sudah dipakai dropdown form).
 * - POST/PUT/DELETE endpoints: admin CRUD bila empty atau perlu adjust manual.
 * - POST /v1/master-data/sync: ambil dari pdut.ref.* (PDDIKTI source) → upsert
 *   ke si_prestasi.ref.* berdasarkan field mapping (id_tkt_prestasi_pdut /
 *   id_jenis_prestasi_pdut). ID tetap dipertahankan, hanya nama di-refresh dan
 *   row baru di pdut yang belum ada di si_prestasi akan di-insert.
 */
class MasterDataController extends Controller
{
    use ApiResponse;

    // ────────────────────────────────────────────────────────────────────────
    // GET (list)
    // ────────────────────────────────────────────────────────────────────────

    public function levels(): JsonResponse
    {
        return $this->successResponse($this->pgAll('ref.level_prestasi', 'id_level_prestasi'));
    }
    public function kategori(): JsonResponse
    {
        return $this->successResponse($this->pgAll('ref.kategori_prestasi', 'id_kategori_prestasi'));
    }
    public function peringkat(): JsonResponse
    {
        return $this->successResponse($this->pgAll('ref.peringkat', 'id_peringkat'));
    }
    public function kelompok(): JsonResponse
    {
        return $this->successResponse($this->pgAll('ref.kelompok_prestasi', 'id_kelompok_prestasi'));
    }
    public function bentuk(): JsonResponse
    {
        return $this->successResponse($this->pgAll('ref.bentuk_pelaksanaan', 'id_bentuk_pelaksanaan'));
    }
    public function jenisRekognisi(): JsonResponse
    {
        return $this->successResponse($this->pgAll('ref.jenis_rekognisi', 'id_jenis_rekognisi'));
    }

    public function all(): JsonResponse
    {
        return $this->successResponse([
            'levels'          => $this->pgAll('ref.level_prestasi', 'id_level_prestasi'),
            'kategori'        => $this->pgAll('ref.kategori_prestasi', 'id_kategori_prestasi'),
            'peringkat'       => $this->pgAll('ref.peringkat', 'id_peringkat'),
            'kelompok'        => $this->pgAll('ref.kelompok_prestasi', 'id_kelompok_prestasi'),
            'bentuk'          => $this->pgAll('ref.bentuk_pelaksanaan', 'id_bentuk_pelaksanaan'),
            'jenis_rekognisi' => $this->pgAll('ref.jenis_rekognisi', 'id_jenis_rekognisi'),
        ]);
    }

    private function pgAll(string $table, string $pk): array
    {
        $rows = DB::connection('pgsql')->select("SELECT * FROM {$table} ORDER BY urutan, {$pk}");
        return array_map(fn($r) => (array) $r, $rows);
    }

    // ────────────────────────────────────────────────────────────────────────
    // SYNC FROM PDUT — admin trigger via tombol di Master Data page.
    // Source: pdut.ref.tingkat_prestasi + pdut.ref.jenis_prestasi.
    // Logic: match by mapping field. Upsert: existing → tidak diubah (preserve
    // SIMKATMAWA alignment); missing → insert dgn kode_simkatmawa placeholder
    // "PDUT_{id}" supaya admin bisa rename/aktivasi belakangan.
    // ────────────────────────────────────────────────────────────────────────

    public function syncFromPdut(): JsonResponse
    {
        try {
            $report = [
                'level_prestasi'    => $this->syncLevel(),
                'kategori_prestasi' => $this->syncKategori(),
            ];
            $report['summary'] = [
                'total_fetched'  => $report['level_prestasi']['fetched']  + $report['kategori_prestasi']['fetched'],
                'total_inserted' => $report['level_prestasi']['inserted'] + $report['kategori_prestasi']['inserted'],
                'total_matched'  => $report['level_prestasi']['matched']  + $report['kategori_prestasi']['matched'],
                'finished_at'    => now()->toIso8601String(),
            ];
            return $this->successResponse($report);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Sync gagal: ' . $e->getMessage(),
                'data'    => null,
            ], 500);
        }
    }

    private function syncLevel(): array
    {
        $pdutRows = DB::connection('sqlsrv')->select(
            "SELECT id_tkt_prestasi, nm_tkt_prestasi FROM ref.tingkat_prestasi WHERE expired_date IS NULL ORDER BY id_tkt_prestasi"
        );
        $report = ['fetched' => count($pdutRows), 'inserted' => 0, 'matched' => 0, 'rows' => []];

        foreach ($pdutRows as $row) {
            $idPdut = (int) $row->id_tkt_prestasi;
            $exists = DB::connection('pgsql')->selectOne(
                "SELECT id_level_prestasi, nm_level FROM ref.level_prestasi WHERE id_tkt_prestasi_pdut = ?",
                [$idPdut]
            );
            if ($exists) {
                $report['matched']++;
                $report['rows'][] = [
                    'id_pdut' => $idPdut, 'nm_pdut' => $row->nm_tkt_prestasi,
                    'action' => 'matched', 'nm_si_prestasi' => $exists->nm_level,
                ];
            } else {
                $kode = 'PDUT_' . $idPdut;
                DB::connection('pgsql')->insert(
                    "INSERT INTO ref.level_prestasi (kode_simkatmawa, nm_level, id_tkt_prestasi_pdut, urutan, a_active, a_ref_pddikti) " .
                    "VALUES (?, ?, ?, ?, TRUE, TRUE) ON CONFLICT (kode_simkatmawa) DO NOTHING",
                    [$kode, $row->nm_tkt_prestasi, $idPdut, 100 + $idPdut]
                );
                $report['inserted']++;
                $report['rows'][] = [
                    'id_pdut' => $idPdut, 'nm_pdut' => $row->nm_tkt_prestasi,
                    'action' => 'inserted', 'kode_simkatmawa' => $kode,
                ];
            }
        }
        return $report;
    }

    private function syncKategori(): array
    {
        $pdutRows = DB::connection('sqlsrv')->select(
            "SELECT id_jenis_prestasi, nm_jenis_prestasi FROM ref.jenis_prestasi WHERE expired_date IS NULL ORDER BY id_jenis_prestasi"
        );
        $report = ['fetched' => count($pdutRows), 'inserted' => 0, 'matched' => 0, 'rows' => []];

        foreach ($pdutRows as $row) {
            $idPdut = (int) $row->id_jenis_prestasi;
            $exists = DB::connection('pgsql')->selectOne(
                "SELECT id_kategori_prestasi, nm_kategori FROM ref.kategori_prestasi WHERE id_jenis_prestasi_pdut = ? LIMIT 1",
                [$idPdut]
            );
            if ($exists) {
                $report['matched']++;
                $report['rows'][] = [
                    'id_pdut' => $idPdut, 'nm_pdut' => $row->nm_jenis_prestasi,
                    'action' => 'matched', 'nm_si_prestasi' => $exists->nm_kategori,
                ];
            } else {
                $kode = 'PDUT_' . $idPdut;
                DB::connection('pgsql')->insert(
                    "INSERT INTO ref.kategori_prestasi (kode_simkatmawa, nm_kategori, id_jenis_prestasi_pdut, urutan, a_active, a_ref_simkatmawa) " .
                    "VALUES (?, ?, ?, ?, TRUE, FALSE) ON CONFLICT (kode_simkatmawa) DO NOTHING",
                    [$kode, $row->nm_jenis_prestasi, $idPdut, 100 + $idPdut]
                );
                $report['inserted']++;
                $report['rows'][] = [
                    'id_pdut' => $idPdut, 'nm_pdut' => $row->nm_jenis_prestasi,
                    'action' => 'inserted', 'kode_simkatmawa' => $kode,
                ];
            }
        }
        return $report;
    }

    // ────────────────────────────────────────────────────────────────────────
    // CRUD — POST/PUT/DELETE per ref table (admin manual override).
    // ────────────────────────────────────────────────────────────────────────

    /** Definitions per ref tipe (PK + kode field name + name field). */
    private const REF_DEFS = [
        'level' => [
            'table' => 'ref.level_prestasi',
            'pk'    => 'id_level_prestasi',
            'fields'=> ['kode_simkatmawa','nm_level','id_tkt_prestasi_pdut','urutan','a_active'],
            'rules' => [
                'kode_simkatmawa'      => 'required|string|max:8',
                'nm_level'             => 'required|string|max:60',
                'id_tkt_prestasi_pdut' => 'nullable|integer',
                'urutan'               => 'integer|min:0',
                'a_active'             => 'boolean',
            ],
        ],
        'kategori' => [
            'table' => 'ref.kategori_prestasi',
            'pk'    => 'id_kategori_prestasi',
            'fields'=> ['kode_simkatmawa','nm_kategori','id_jenis_prestasi_pdut','urutan','a_active'],
            'rules' => [
                'kode_simkatmawa'        => 'required|string|max:16',
                'nm_kategori'            => 'required|string|max:100',
                'id_jenis_prestasi_pdut' => 'nullable|integer',
                'urutan'                 => 'integer|min:0',
                'a_active'               => 'boolean',
            ],
        ],
        'peringkat' => [
            'table' => 'ref.peringkat',
            'pk'    => 'id_peringkat',
            'fields'=> ['kode_simkatmawa','nm_peringkat','peringkat_pdut','urutan','nilai_bobot','a_active'],
            'rules' => [
                'kode_simkatmawa' => 'required|string|max:16',
                'nm_peringkat'    => 'required|string|max:60',
                'peringkat_pdut'  => 'nullable|numeric',
                'nilai_bobot'     => 'nullable|numeric',
                'urutan'          => 'integer|min:0',
                'a_active'        => 'boolean',
            ],
        ],
        'kelompok' => [
            'table' => 'ref.kelompok_prestasi',
            'pk'    => 'id_kelompok_prestasi',
            'fields'=> ['kode_simkatmawa','nm_kelompok','urutan','a_active'],
            'rules' => [
                'kode_simkatmawa' => 'required|string|max:16',
                'nm_kelompok'     => 'required|string|max:40',
                'urutan'          => 'integer|min:0',
                'a_active'        => 'boolean',
            ],
        ],
        'bentuk' => [
            'table' => 'ref.bentuk_pelaksanaan',
            'pk'    => 'id_bentuk_pelaksanaan',
            'fields'=> ['kode_simkatmawa','nm_bentuk','urutan','a_active'],
            'rules' => [
                'kode_simkatmawa' => 'required|string|max:8',
                'nm_bentuk'       => 'required|string|max:40',
                'urutan'          => 'integer|min:0',
                'a_active'        => 'boolean',
            ],
        ],
        'jenis_rekognisi' => [
            'table' => 'ref.jenis_rekognisi',
            'pk'    => 'id_jenis_rekognisi',
            'fields'=> ['kode_simkatmawa','nm_jenis','urutan','a_active'],
            'rules' => [
                'kode_simkatmawa' => 'required|string|max:16',
                'nm_jenis'        => 'required|string|max:120',
                'urutan'          => 'integer|min:0',
                'a_active'        => 'boolean',
            ],
        ],
    ];

    public function store(Request $request, string $type): JsonResponse
    {
        $def = self::REF_DEFS[$type] ?? null;
        if (!$def) {
            return response()->json(['success'=>false,'message'=>"type tidak valid: {$type}"], 400);
        }
        $v = Validator::make($request->all(), $def['rules']);
        if ($v->fails()) {
            return response()->json(['success'=>false,'message'=>'Validasi gagal','errors'=>$v->errors()], 422);
        }
        $data = $request->only($def['fields']);
        $cols = array_keys($data);
        $params = array_values($data);
        $placeholders = array_fill(0, count($cols), '?');
        $sql = sprintf(
            "INSERT INTO %s (%s) VALUES (%s) RETURNING %s",
            $def['table'],
            implode(', ', $cols),
            implode(', ', $placeholders),
            $def['pk']
        );
        try {
            $row = DB::connection('pgsql')->selectOne($sql, $params);
            return $this->successResponse(['id' => $row->{$def['pk']}], 'Berhasil ditambahkan');
        } catch (\Throwable $e) {
            return response()->json(['success'=>false,'message'=>'Gagal insert: '.$e->getMessage()], 500);
        }
    }

    public function update(Request $request, string $type, string $id): JsonResponse
    {
        $def = self::REF_DEFS[$type] ?? null;
        if (!$def) {
            return response()->json(['success'=>false,'message'=>"type tidak valid: {$type}"], 400);
        }
        // Update bisa partial — tidak require semua field.
        $rulesPartial = [];
        foreach ($def['rules'] as $k => $r) {
            $rulesPartial[$k] = str_replace('required|', 'nullable|', $r);
        }
        $v = Validator::make($request->all(), $rulesPartial);
        if ($v->fails()) {
            return response()->json(['success'=>false,'message'=>'Validasi gagal','errors'=>$v->errors()], 422);
        }
        $data = array_filter(
            $request->only($def['fields']),
            fn($val) => $val !== null && $val !== ''
        );
        if (empty($data)) {
            return response()->json(['success'=>false,'message'=>'Tidak ada field untuk di-update'], 422);
        }
        $sets = array_map(fn($c) => "$c = ?", array_keys($data));
        $params = array_values($data);
        $params[] = $id;
        $sql = sprintf(
            "UPDATE %s SET %s, updated_at = NOW() WHERE %s = ?",
            $def['table'],
            implode(', ', $sets),
            $def['pk']
        );
        try {
            $affected = DB::connection('pgsql')->update($sql, $params);
            if ($affected === 0) {
                return response()->json(['success'=>false,'message'=>'Row tidak ditemukan'], 404);
            }
            return $this->successResponse(['id' => $id, 'updated' => $affected], 'Berhasil diupdate');
        } catch (\Throwable $e) {
            return response()->json(['success'=>false,'message'=>'Gagal update: '.$e->getMessage()], 500);
        }
    }

    public function destroy(string $type, string $id): JsonResponse
    {
        $def = self::REF_DEFS[$type] ?? null;
        if (!$def) {
            return response()->json(['success'=>false,'message'=>"type tidak valid: {$type}"], 400);
        }
        $sql = sprintf("DELETE FROM %s WHERE %s = ?", $def['table'], $def['pk']);
        try {
            $affected = DB::connection('pgsql')->delete($sql, [$id]);
            if ($affected === 0) {
                return response()->json(['success'=>false,'message'=>'Row tidak ditemukan'], 404);
            }
            return $this->successResponse(['id' => $id, 'deleted' => $affected], 'Berhasil dihapus');
        } catch (\Throwable $e) {
            // Foreign key constraint biasanya muncul kalau ref dipakai di prestasi rows.
            return response()->json([
                'success'=>false,
                'message'=>'Gagal hapus (kemungkinan dipakai di data prestasi/sertifikasi): '.$e->getMessage(),
            ], 409);
        }
    }
}
