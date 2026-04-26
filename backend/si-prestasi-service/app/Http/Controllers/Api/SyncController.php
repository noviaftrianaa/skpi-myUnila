<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\SubmitToSimkatmawaJob;
use App\Services\SimkatmawaClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * SyncController — endpoint Phase 2 untuk push prestasi/sertifikasi/rekognisi
 * ke SIMKATMAWA.
 *
 * - POST /api/v1/sync/submit/{type}/{id}     trigger queue job
 * - GET  /api/v1/sync/log                    riwayat submission (paginated)
 * - GET  /api/v1/sync/log/{id_submission}    detail 1 submission
 * - POST /api/v1/sync/ping                   verify kredensial SIMKATMAWA (admin tool)
 *
 * Tipe parameter: prestasi | sertifikasi | rekognisi (lowercase). Mapping ke
 * parent_tipe di DB: PRESTASI | SERTIFIKASI | REKOGNISI.
 */
class SyncController extends Controller
{
    private const TYPE_MAP = [
        'prestasi'    => ['table' => 'prestasi.prestasi_mandiri', 'id_col' => 'id_prestasi_mandiri', 'parent_tipe' => 'PRESTASI'],
        'sertifikasi' => ['table' => 'prestasi.sertifikasi',        'id_col' => 'id_sertifikasi',        'parent_tipe' => 'SERTIFIKASI'],
        'rekognisi'   => ['table' => 'prestasi.rekognisi',          'id_col' => 'id_rekognisi',          'parent_tipe' => 'REKOGNISI'],
    ];

    /**
     * Trigger submit. Validate state (cuma 'ready' atau 'error' yang boleh
     * di-submit). Status berubah 'ready'→'sending' di Job.
     */
    public function submit(Request $request, string $type, string $id): JsonResponse
    {
        $type = strtolower($type);
        $cfg = self::TYPE_MAP[$type] ?? null;
        if (!$cfg) {
            return response()->json([
                'success' => false,
                'message' => "type tidak valid: {$type}. Pakai prestasi|sertifikasi|rekognisi",
            ], 400);
        }

        $row = DB::selectOne("
            SELECT {$cfg['id_col']} AS id, status_workflow
            FROM {$cfg['table']}
            WHERE {$cfg['id_col']} = ? AND soft_delete = FALSE
        ", [$id]);

        if (!$row) {
            return response()->json(['success' => false, 'message' => "Record {$id} tidak ditemukan"], 404);
        }
        if (!in_array($row->status_workflow, ['ready', 'error'], true)) {
            return response()->json([
                'success' => false,
                'message' => "Status saat ini '{$row->status_workflow}' — hanya 'ready' atau 'error' yang boleh di-submit. Set ke ready dulu.",
            ], 409);
        }

        $idActor = $request->attributes->get('jwt_user_id') ?? $request->user()?->id_pengguna ?? null;
        SubmitToSimkatmawaJob::dispatch($id, $cfg['parent_tipe'], $idActor)->onQueue('simkatmawa');

        return response()->json([
            'success' => true,
            'message' => 'Job submit di-dispatch. Cek /sync/log untuk status.',
            'data'    => [
                'id_parent'   => $id,
                'parent_tipe' => $cfg['parent_tipe'],
                'queued_at'   => now()->toIso8601String(),
            ],
        ], 202);
    }

    /**
     * List sync.submission, paginated.
     * Filter: parent_tipe, id_parent, success_only, range tgl.
     */
    public function log(Request $request): JsonResponse
    {
        $page  = max(1, (int) $request->query('page', 1));
        $limit = min(100, max(1, (int) $request->query('limit', 20)));
        $offset = ($page - 1) * $limit;

        $where = ['1=1'];
        $params = [];
        if ($pt = $request->query('parent_tipe')) {
            $where[] = 'parent_tipe = ?';
            $params[] = strtoupper($pt);
        }
        if ($idp = $request->query('id_parent')) {
            $where[] = 'id_parent = ?';
            $params[] = $idp;
        }
        if ($request->boolean('success_only')) {
            $where[] = 'a_success = TRUE';
        }
        $whereSql = implode(' AND ', $where);

        $total = (int) DB::selectOne("SELECT COUNT(*) AS c FROM sync.submission WHERE {$whereSql}", $params)->c;

        $rows = DB::select("
            SELECT
                s.id_submission, s.id_parent, s.parent_tipe,
                ts.kode AS tipe_sync_kode, ts.nm_tipe,
                s.request_at, s.http_status, s.simkatmawa_id, s.simkatmawa_kode_pt,
                s.error_message, s.retry_count, s.a_success, s.id_actor
            FROM sync.submission s
            LEFT JOIN ref.tipe_sync ts ON ts.id_tipe_sync = s.id_tipe_sync
            WHERE {$whereSql}
            ORDER BY s.request_at DESC
            LIMIT ? OFFSET ?
        ", array_merge($params, [$limit, $offset]));

        return response()->json([
            'success' => true,
            'message' => 'OK',
            'data'    => $rows,
            'meta'    => [
                'page'        => $page,
                'limit'       => $limit,
                'total'       => $total,
                'total_pages' => max(1, (int) ceil($total / $limit)),
            ],
        ]);
    }

    /**
     * Detail 1 submission, termasuk request_payload + response_body.
     */
    public function logDetail(string $idSubmission): JsonResponse
    {
        $row = DB::selectOne("
            SELECT
                s.*,
                ts.kode AS tipe_sync_kode, ts.nm_tipe
            FROM sync.submission s
            LEFT JOIN ref.tipe_sync ts ON ts.id_tipe_sync = s.id_tipe_sync
            WHERE s.id_submission = ?
        ", [$idSubmission]);

        if (!$row) {
            return response()->json(['success' => false, 'message' => 'Submission tidak ditemukan'], 404);
        }
        // Decode JSONB
        $row->request_payload = $row->request_payload ? json_decode($row->request_payload, true) : null;
        $row->response_body   = $row->response_body   ? json_decode($row->response_body, true)   : null;

        return response()->json([
            'success' => true,
            'message' => 'OK',
            'data'    => $row,
        ]);
    }

    /**
     * Ping SIMKATMAWA — verify kredensial. Admin-only utility.
     */
    public function ping(SimkatmawaClient $client): JsonResponse
    {
        $r = $client->ping();
        return response()->json([
            'success' => $r['ok'],
            'message' => $r['message'],
            'data'    => $r,
        ], $r['ok'] ? 200 : 503);
    }
}
