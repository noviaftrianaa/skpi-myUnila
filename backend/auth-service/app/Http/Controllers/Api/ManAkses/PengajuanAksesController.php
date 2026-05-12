<?php

namespace App\Http\Controllers\Api\ManAkses;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * SSAR — Self-Service Access Request Controller.
 *
 * Workflow: user submit pengajuan → admin validate via dashboard →
 * approve → auto-create row di man_akses.role_pengguna + notif inbox.
 *
 * Endpoint user-facing: store, myRequests, show, cancel, uploadSk, previewSk
 * Endpoint admin:        index, queueCount, approve, reject, bulkApprove
 */
class PengajuanAksesController extends Controller
{
    private const MAX_SK_BYTES = 2 * 1024 * 1024; // 2 MB
    private const ALLOWED_MIMES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    // ========================================================================
    // ENDPOINT PEMOHON
    // ========================================================================

    /**
     * POST /api/v1/pengajuan-akses — submit pengajuan baru.
     *
     * Body (json):
     *   id_aplikasi, id_peran, id_organisasi, sk_url, sk_filename, sk_filesize,
     *   sk_mimetype, no_sk, tgl_sk, tgl_kadaluarsa, catatan_pemohon
     */
    public function store(Request $request): JsonResponse
    {
        $userId = $this->getUserIdFromAuth($request);
        if (!$userId) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'id_aplikasi'      => 'required|string|size:36',
            'id_peran'         => 'required|integer',
            'id_organisasi'    => 'required|string|size:36',
            'sk_url'           => 'required|string|max:500',
            'sk_filename'      => 'required|string|max:255',
            'sk_filesize'      => 'required|integer|max:' . self::MAX_SK_BYTES,
            'sk_mimetype'      => 'required|string|in:' . implode(',', self::ALLOWED_MIMES),
            'no_sk'            => 'nullable|string|max:100',
            'tgl_sk'           => 'nullable|date',
            'tgl_kadaluarsa'   => 'required|date|after:today',
            'catatan_pemohon'  => 'nullable|string|max:1000',
        ]);

        // Snapshot identitas pemohon
        $pemohon = DB::selectOne("
            SELECT
                CONVERT(VARCHAR(36), p.id_pengguna) AS id_pengguna,
                COALESCE(p.nm_pengguna, p.username) AS nama,
                p.nik AS nip,
                ISNULL(uo.nm_lemb, '') AS homebase
            FROM man_akses.pengguna p
            LEFT JOIN man_akses.role_pengguna rp ON rp.id_pengguna = p.id_pengguna AND ISNULL(rp.soft_delete,0)=0
            LEFT JOIN man_akses.unit_organisasi uo ON uo.id_organisasi = rp.id_organisasi
            WHERE p.id_pengguna = ?
        ", [$userId]);

        if (!$pemohon) {
            return response()->json(['success' => false, 'message' => 'Pengguna tidak ditemukan'], 404);
        }

        // Auto-flag validations
        $flags = $this->detectAutoFlags($userId, $validated);

        // Block-level flag → reject langsung
        $blockingFlag = collect($flags)->firstWhere('level', 'block');
        if ($blockingFlag) {
            return response()->json([
                'success' => false,
                'message' => 'Pengajuan tidak valid: ' . $blockingFlag['message'],
                'code'    => $blockingFlag['code'],
                'flags'   => $flags,
            ], 422);
        }

        $idPengajuan = (string) Str::uuid();

        DB::insert("
            INSERT INTO man_akses.pengajuan_akses (
                id_pengajuan, id_pengguna, nama_pemohon, nip_pemohon, homebase_pemohon,
                id_aplikasi, id_peran, id_organisasi,
                sk_url, sk_filename, sk_filesize, sk_mimetype,
                no_sk, tgl_sk, tgl_kadaluarsa,
                catatan_pemohon, status, auto_flags,
                tgl_create, last_update
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, GETDATE(), GETDATE())
        ", [
            $idPengajuan, $userId, $pemohon->nama, $pemohon->nip, $pemohon->homebase,
            $validated['id_aplikasi'], $validated['id_peran'], $validated['id_organisasi'],
            $validated['sk_url'], $validated['sk_filename'], $validated['sk_filesize'], $validated['sk_mimetype'],
            $validated['no_sk'] ?? null, $validated['tgl_sk'] ?? null, $validated['tgl_kadaluarsa'],
            $validated['catatan_pemohon'] ?? null,
            json_encode($flags),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan akses berhasil disubmit. Tunggu validasi admin.',
            'data' => [
                'id_pengajuan' => $idPengajuan,
                'status' => 'pending',
                'auto_flags' => $flags,
            ],
        ], 201);
    }

    /**
     * GET /api/v1/pengajuan-akses/my-requests — list pengajuan saya.
     */
    public function myRequests(Request $request): JsonResponse
    {
        $userId = $this->getUserIdFromAuth($request);
        if (!$userId) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $status = $request->query('status'); // optional filter

        $sql = "
            SELECT
                CONVERT(VARCHAR(36), pa.id_pengajuan) AS id_pengajuan,
                pa.status,
                CONVERT(VARCHAR(36), pa.id_aplikasi) AS id_aplikasi,
                a.nm_aplikasi,
                pa.id_peran,
                p.nm_peran,
                CONVERT(VARCHAR(36), pa.id_organisasi) AS id_organisasi,
                uo.nm_lemb AS nm_organisasi,
                pa.no_sk,
                pa.tgl_sk,
                pa.tgl_kadaluarsa,
                pa.tgl_create,
                pa.tgl_validasi,
                pa.nama_validator,
                pa.alasan_tolak,
                pa.auto_flags
            FROM man_akses.pengajuan_akses pa
            LEFT JOIN man_akses.aplikasi        a  ON a.id_aplikasi   = pa.id_aplikasi
            LEFT JOIN man_akses.peran           p  ON p.id_peran      = pa.id_peran
            LEFT JOIN man_akses.unit_organisasi uo ON uo.id_organisasi = pa.id_organisasi
            WHERE pa.id_pengguna = ?
              AND ISNULL(pa.soft_delete, 0) = 0
        ";
        $params = [$userId];

        if ($status) {
            $sql .= " AND pa.status = ?";
            $params[] = $status;
        }

        $sql .= " ORDER BY pa.tgl_create DESC";

        $rows = DB::select($sql, $params);

        return response()->json([
            'success' => true,
            'data' => array_map(fn($r) => $this->decorateRow($r), $rows),
        ]);
    }

    /**
     * GET /api/v1/pengajuan-akses/{id} — detail pengajuan.
     * Pemohon: hanya bisa lihat own. Admin: bisa lihat semua.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $userId = $this->getUserIdFromAuth($request);
        if (!$userId) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $row = $this->fetchOne($id);
        if (!$row) {
            return response()->json(['success' => false, 'message' => 'Pengajuan tidak ditemukan'], 404);
        }

        $isAdmin = $this->isAdminUser($userId);
        if (!$isAdmin && $row->id_pengguna !== $userId) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak'], 403);
        }

        return response()->json(['success' => true, 'data' => $this->decorateRow($row)]);
    }

    /**
     * PUT /api/v1/pengajuan-akses/{id}/cancel — pemohon cancel kalau masih pending.
     */
    public function cancel(Request $request, string $id): JsonResponse
    {
        $userId = $this->getUserIdFromAuth($request);
        if (!$userId) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $row = $this->fetchOne($id);
        if (!$row) {
            return response()->json(['success' => false, 'message' => 'Pengajuan tidak ditemukan'], 404);
        }
        if ($row->id_pengguna !== $userId) {
            return response()->json(['success' => false, 'message' => 'Hanya pemohon yg bisa cancel'], 403);
        }
        if ($row->status !== 'pending') {
            return response()->json(['success' => false, 'message' => 'Hanya pengajuan pending yg bisa di-cancel'], 422);
        }

        DB::update(
            "UPDATE man_akses.pengajuan_akses SET status = 'cancelled', last_update = GETDATE() WHERE id_pengajuan = ?",
            [$id]
        );

        return response()->json(['success' => true, 'message' => 'Pengajuan dibatalkan']);
    }

    /**
     * POST /api/v1/pengajuan-akses/upload-sk — upload file SK ke MinIO.
     *
     * Body (multipart/form-data):
     *   file: file (.pdf / .jpg / .png / .webp, max 2MB)
     *
     * Response: { sk_url, sk_filename, sk_filesize, sk_mimetype, preview_url }
     */
    public function uploadSk(Request $request): JsonResponse
    {
        $userId = $this->getUserIdFromAuth($request);
        if (!$userId) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $request->validate([
            'file' => 'required|file|max:' . (self::MAX_SK_BYTES / 1024),
        ]);

        $file = $request->file('file');
        $mime = $file->getMimeType();
        if (!in_array($mime, self::ALLOWED_MIMES, true)) {
            return response()->json([
                'success' => false,
                'message' => 'Format file harus PDF, JPG, PNG, atau WebP.',
                'detail'  => ['mime' => $mime],
            ], 422);
        }

        $ext = pathinfo($file->getClientOriginalName(), PATHINFO_EXTENSION) ?: ($mime === 'application/pdf' ? 'pdf' : 'jpg');
        $key = sprintf(
            'sk/%s/%s/%s.%s',
            date('Y'),
            date('m'),
            Str::uuid(),
            strtolower($ext)
        );

        try {
            $disk = Storage::disk('minio_sk');
            $disk->put($key, file_get_contents($file->getRealPath()), [
                'ContentType' => $mime,
                'visibility'  => 'private',
            ]);
        } catch (\Exception $e) {
            Log::error('SSAR upload SK failed', [
                'user' => $userId, 'err' => $e->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Upload ke storage gagal. Coba lagi atau hubungi admin TIK.',
                'detail'  => $e->getMessage(),
            ], 500);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'sk_url'      => $key,
                'sk_filename' => $file->getClientOriginalName(),
                'sk_filesize' => $file->getSize(),
                'sk_mimetype' => $mime,
            ],
        ]);
    }

    /**
     * GET /api/v1/pengajuan-akses/preview-sk/{id} — stream SK file content via Laravel.
     * (Backend proxy ke MinIO supaya RBAC bisa di-cek + URL gak bocor.)
     */
    public function previewSk(Request $request, string $id)
    {
        $userId = $this->getUserIdFromAuth($request);
        if (!$userId) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        $row = $this->fetchOne($id);
        if (!$row) {
            return response()->json(['success' => false, 'message' => 'Pengajuan tidak ditemukan'], 404);
        }

        $isAdmin = $this->isAdminUser($userId);
        if (!$isAdmin && $row->id_pengguna !== $userId) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak'], 403);
        }
        if (!$row->sk_url) {
            return response()->json(['success' => false, 'message' => 'SK file tidak tersedia'], 404);
        }

        try {
            $disk = Storage::disk('minio_sk');
            if (!$disk->exists($row->sk_url)) {
                return response()->json(['success' => false, 'message' => 'SK file tidak ditemukan di storage'], 404);
            }
            $content = $disk->get($row->sk_url);
            return response($content, 200, [
                'Content-Type'        => $row->sk_mimetype ?: 'application/octet-stream',
                'Content-Disposition' => 'inline; filename="' . ($row->sk_filename ?: 'sk.pdf') . '"',
                'Cache-Control'       => 'private, no-store',
            ]);
        } catch (\Exception $e) {
            Log::error('SSAR preview SK failed', ['user' => $userId, 'err' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Gagal load SK file'], 500);
        }
    }

    // ========================================================================
    // ENDPOINT ADMIN
    // ========================================================================

    /**
     * GET /api/v1/pengajuan-akses — admin: list pengajuan (filter).
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $this->getUserIdFromAuth($request);
        if (!$userId || !$this->isAdminUser($userId)) {
            return response()->json(['success' => false, 'message' => 'Akses admin diperlukan'], 403);
        }

        $status = $request->query('status', 'pending');
        $idAplikasi = $request->query('id_aplikasi');
        $search = $request->query('search');
        $limit = min((int) $request->query('limit', 50), 200);
        $page = max((int) $request->query('page', 1), 1);
        $offset = ($page - 1) * $limit;

        $where = ["ISNULL(pa.soft_delete, 0) = 0"];
        $params = [];
        if ($status && $status !== 'all') {
            $where[] = "pa.status = ?";
            $params[] = $status;
        }
        if ($idAplikasi) {
            $where[] = "pa.id_aplikasi = ?";
            $params[] = $idAplikasi;
        }
        if ($search) {
            $where[] = "(pa.nama_pemohon LIKE ? OR pa.nip_pemohon LIKE ? OR a.nm_aplikasi LIKE ?)";
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
        }
        $whereSql = implode(' AND ', $where);

        $total = DB::selectOne("
            SELECT COUNT(*) AS cnt
            FROM man_akses.pengajuan_akses pa
            LEFT JOIN man_akses.aplikasi a ON a.id_aplikasi = pa.id_aplikasi
            WHERE {$whereSql}
        ", $params)->cnt;

        $rows = DB::select("
            SELECT
                CONVERT(VARCHAR(36), pa.id_pengajuan) AS id_pengajuan,
                pa.status,
                pa.nama_pemohon, pa.nip_pemohon, pa.homebase_pemohon,
                CONVERT(VARCHAR(36), pa.id_pengguna)  AS id_pengguna,
                CONVERT(VARCHAR(36), pa.id_aplikasi) AS id_aplikasi,
                a.nm_aplikasi,
                pa.id_peran, p.nm_peran,
                CONVERT(VARCHAR(36), pa.id_organisasi) AS id_organisasi,
                uo.nm_lemb AS nm_organisasi,
                pa.no_sk, pa.tgl_sk, pa.tgl_kadaluarsa,
                pa.sk_filename, pa.sk_filesize, pa.sk_mimetype,
                pa.catatan_pemohon, pa.auto_flags,
                pa.tgl_create,
                pa.tgl_validasi, pa.nama_validator, pa.alasan_tolak
            FROM man_akses.pengajuan_akses pa
            LEFT JOIN man_akses.aplikasi        a  ON a.id_aplikasi   = pa.id_aplikasi
            LEFT JOIN man_akses.peran           p  ON p.id_peran      = pa.id_peran
            LEFT JOIN man_akses.unit_organisasi uo ON uo.id_organisasi = pa.id_organisasi
            WHERE {$whereSql}
            ORDER BY pa.tgl_create DESC
            OFFSET {$offset} ROWS FETCH NEXT {$limit} ROWS ONLY
        ", $params);

        return response()->json([
            'success' => true,
            'data' => array_map(fn($r) => $this->decorateRow($r), $rows),
            'pagination' => [
                'total'       => (int) $total,
                'page'        => $page,
                'limit'       => $limit,
                'total_pages' => (int) ceil($total / $limit),
            ],
        ]);
    }

    /**
     * GET /api/v1/pengajuan-akses/queue/count — badge counter pending.
     */
    public function queueCount(Request $request): JsonResponse
    {
        $userId = $this->getUserIdFromAuth($request);
        if (!$userId || !$this->isAdminUser($userId)) {
            return response()->json(['success' => false, 'message' => 'Akses admin diperlukan'], 403);
        }

        $row = DB::selectOne("
            SELECT
                SUM(CASE WHEN status='pending'   THEN 1 ELSE 0 END) AS pending,
                SUM(CASE WHEN status='approved'  THEN 1 ELSE 0 END) AS approved,
                SUM(CASE WHEN status='rejected'  THEN 1 ELSE 0 END) AS rejected,
                SUM(CASE WHEN status='cancelled' THEN 1 ELSE 0 END) AS cancelled,
                SUM(CASE WHEN status='expired'   THEN 1 ELSE 0 END) AS expired,
                COUNT(*) AS total
            FROM man_akses.pengajuan_akses
            WHERE ISNULL(soft_delete, 0) = 0
        ");

        return response()->json(['success' => true, 'data' => $row]);
    }

    /**
     * PUT /api/v1/pengajuan-akses/{id}/approve — admin approve + auto-execute.
     */
    public function approve(Request $request, string $id): JsonResponse
    {
        $userId = $this->getUserIdFromAuth($request);
        if (!$userId || !$this->isAdminUser($userId)) {
            return response()->json(['success' => false, 'message' => 'Akses admin diperlukan'], 403);
        }

        $catatan = $request->input('catatan_validator');

        $row = $this->fetchOne($id);
        if (!$row) {
            return response()->json(['success' => false, 'message' => 'Pengajuan tidak ditemukan'], 404);
        }
        if ($row->status !== 'pending') {
            return response()->json(['success' => false, 'message' => 'Hanya pengajuan pending yg bisa di-approve'], 422);
        }

        // Snapshot admin
        $admin = DB::selectOne(
            "SELECT COALESCE(nm_pengguna, username) AS nama FROM man_akses.pengguna WHERE id_pengguna = ?",
            [$userId]
        );
        $namaAdmin = $admin ? $admin->nama : 'Admin TIK';

        $idRolePengguna = (string) Str::uuid();

        try {
            DB::transaction(function () use ($id, $userId, $namaAdmin, $catatan, $row, $idRolePengguna) {
                // 1. UPDATE status pengajuan
                DB::update("
                    UPDATE man_akses.pengajuan_akses
                    SET status = 'approved',
                        id_validator = ?,
                        nama_validator = ?,
                        tgl_validasi = GETDATE(),
                        catatan_validator = ?,
                        id_role_pengguna_created = ?,
                        last_update = GETDATE()
                    WHERE id_pengajuan = ?
                ", [$userId, $namaAdmin, $catatan, $idRolePengguna, $id]);

                // 2. INSERT role_pengguna (active)
                DB::insert("
                    INSERT INTO man_akses.role_pengguna (
                        id_role_pengguna, id_pengguna, id_peran, id_organisasi,
                        approval_peran, sk_penugasan, tgl_sk_penugasan,
                        tgl_kadarluasa, last_active,
                        tgl_create, last_update, soft_delete, last_sync, id_updater
                    ) VALUES (?, ?, ?, ?, 1, ?, ?, ?, GETDATE(), GETDATE(), GETDATE(), 0, GETDATE(), ?)
                ", [
                    $idRolePengguna, $row->id_pengguna, $row->id_peran, $row->id_organisasi,
                    $row->no_sk, $row->tgl_sk, $row->tgl_kadaluarsa, $userId,
                ]);
            });

            $this->invalidateUserContextCache($row->id_pengguna);
            $this->sendNotif($row->id_pengguna, 'success', "✅ Pengajuan akses {$row->nm_aplikasi} disetujui", "Akses sudah aktif. Silakan login ulang untuk aktivasi.");

            return response()->json([
                'success' => true,
                'message' => 'Pengajuan disetujui, akses langsung aktif.',
                'data' => ['id_role_pengguna' => $idRolePengguna],
            ]);
        } catch (\Exception $e) {
            Log::error('SSAR approve failed', ['id' => $id, 'err' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Gagal approve: ' . $e->getMessage()], 500);
        }
    }

    /**
     * PUT /api/v1/pengajuan-akses/{id}/reject — admin reject dengan alasan.
     */
    public function reject(Request $request, string $id): JsonResponse
    {
        $userId = $this->getUserIdFromAuth($request);
        if (!$userId || !$this->isAdminUser($userId)) {
            return response()->json(['success' => false, 'message' => 'Akses admin diperlukan'], 403);
        }

        $validated = $request->validate([
            'alasan_tolak' => 'required|string|min:10|max:1000',
        ]);

        $row = $this->fetchOne($id);
        if (!$row) {
            return response()->json(['success' => false, 'message' => 'Pengajuan tidak ditemukan'], 404);
        }
        if ($row->status !== 'pending') {
            return response()->json(['success' => false, 'message' => 'Hanya pengajuan pending yg bisa di-reject'], 422);
        }

        $admin = DB::selectOne(
            "SELECT COALESCE(nm_pengguna, username) AS nama FROM man_akses.pengguna WHERE id_pengguna = ?",
            [$userId]
        );

        DB::update("
            UPDATE man_akses.pengajuan_akses
            SET status = 'rejected',
                id_validator = ?,
                nama_validator = ?,
                tgl_validasi = GETDATE(),
                alasan_tolak = ?,
                last_update = GETDATE()
            WHERE id_pengajuan = ?
        ", [$userId, $admin ? $admin->nama : 'Admin TIK', $validated['alasan_tolak'], $id]);

        $this->sendNotif($row->id_pengguna, 'error', "❌ Pengajuan akses {$row->nm_aplikasi} ditolak", $validated['alasan_tolak']);

        return response()->json(['success' => true, 'message' => 'Pengajuan ditolak.']);
    }

    // ========================================================================
    // HELPERS
    // ========================================================================

    private function getUserIdFromAuth(Request $request): ?string
    {
        // Standard pattern di proyek ini — kong header / JWT decoded oleh middleware
        $user = $request->attributes->get('auth_user');
        return $user ? ($user->id_pengguna ?? null) : null;
    }

    private function isAdminUser(string $userId): bool
    {
        // Admin = punya role 1 (Administrator) atau 107 (Developer)
        $row = DB::selectOne("
            SELECT COUNT(*) AS cnt
            FROM man_akses.role_pengguna
            WHERE id_pengguna = ?
              AND id_peran IN (1, 107, 31)  -- Administrator, Developer, Admin Data
              AND ISNULL(soft_delete, 0) = 0
        ", [$userId]);
        return $row && $row->cnt > 0;
    }

    private function fetchOne(string $id): ?object
    {
        return DB::selectOne("
            SELECT
                CONVERT(VARCHAR(36), pa.id_pengajuan) AS id_pengajuan,
                CONVERT(VARCHAR(36), pa.id_pengguna)  AS id_pengguna,
                pa.status, pa.nama_pemohon, pa.nip_pemohon, pa.homebase_pemohon,
                CONVERT(VARCHAR(36), pa.id_aplikasi)  AS id_aplikasi,
                a.nm_aplikasi,
                pa.id_peran, p.nm_peran,
                CONVERT(VARCHAR(36), pa.id_organisasi) AS id_organisasi,
                uo.nm_lemb AS nm_organisasi,
                pa.sk_url, pa.sk_filename, pa.sk_filesize, pa.sk_mimetype,
                pa.no_sk, pa.tgl_sk, pa.tgl_kadaluarsa,
                pa.catatan_pemohon, pa.auto_flags,
                pa.tgl_create, pa.tgl_validasi, pa.nama_validator,
                pa.alasan_tolak, pa.catatan_validator
            FROM man_akses.pengajuan_akses pa
            LEFT JOIN man_akses.aplikasi        a  ON a.id_aplikasi   = pa.id_aplikasi
            LEFT JOIN man_akses.peran           p  ON p.id_peran      = pa.id_peran
            LEFT JOIN man_akses.unit_organisasi uo ON uo.id_organisasi = pa.id_organisasi
            WHERE pa.id_pengajuan = ? AND ISNULL(pa.soft_delete, 0) = 0
        ", [$id]);
    }

    /**
     * Decorate row: parse auto_flags JSON jadi array.
     */
    private function decorateRow(object $row): object
    {
        if (!empty($row->auto_flags) && is_string($row->auto_flags)) {
            $decoded = json_decode($row->auto_flags, true);
            $row->auto_flags = is_array($decoded) ? $decoded : [];
        } else {
            $row->auto_flags = [];
        }
        return $row;
    }

    /**
     * Detect auto-flag warnings/blocks saat pengajuan baru.
     */
    private function detectAutoFlags(string $userId, array $data): array
    {
        $flags = [];

        // 1. EXISTING_ROLE — sudah punya role serupa
        $existing = DB::selectOne("
            SELECT COUNT(*) AS cnt FROM man_akses.role_pengguna
            WHERE id_pengguna = ? AND id_peran = ? AND id_organisasi = ?
              AND ISNULL(soft_delete, 0) = 0
        ", [$userId, $data['id_peran'], $data['id_organisasi']]);
        if ($existing && $existing->cnt > 0) {
            $flags[] = [
                'level' => 'warning', 'code' => 'EXISTING_ROLE',
                'message' => 'User sudah punya role serupa — pertimbangkan perpanjang dari Kandidat Akses',
            ];
        }

        // 2. DUPLICATE_PENDING — sudah ada pending serupa
        $duplicate = DB::selectOne("
            SELECT COUNT(*) AS cnt FROM man_akses.pengajuan_akses
            WHERE id_pengguna = ? AND id_aplikasi = ? AND id_peran = ? AND id_organisasi = ?
              AND status = 'pending'
        ", [$userId, $data['id_aplikasi'], $data['id_peran'], $data['id_organisasi']]);
        if ($duplicate && $duplicate->cnt > 0) {
            $flags[] = [
                'level' => 'block', 'code' => 'DUPLICATE_PENDING',
                'message' => 'Pengajuan serupa sudah ada (status pending). Tunggu validasi admin.',
            ];
        }

        // 3. INVALID_PERAN_FOR_APP — peran gak punya menu_role di app
        $menuRole = DB::selectOne("
            SELECT COUNT(*) AS cnt FROM man_akses.menu_role mr
            INNER JOIN man_akses.menu m ON m.id_menu = mr.id_menu
            WHERE mr.id_peran = ? AND m.id_aplikasi = ? AND ISNULL(mr.soft_delete, 0) = 0
        ", [$data['id_peran'], $data['id_aplikasi']]);
        if (!$menuRole || $menuRole->cnt == 0) {
            $flags[] = [
                'level' => 'block', 'code' => 'INVALID_PERAN_FOR_APP',
                'message' => 'Peran tidak punya akses menu di aplikasi target.',
            ];
        }

        // 4. SK_OLD — tgl_sk > 90 hari lalu
        if (!empty($data['tgl_sk'])) {
            $tglSk = strtotime($data['tgl_sk']);
            if ($tglSk && (time() - $tglSk) > (90 * 86400)) {
                $flags[] = [
                    'level' => 'warning', 'code' => 'SK_OLD',
                    'message' => 'Tanggal SK > 90 hari lalu — konfirmasi SK masih aktif.',
                ];
            }
        }

        // 5. EXPIRY_LONG — tgl_kadaluarsa > 2 tahun
        if (!empty($data['tgl_kadaluarsa'])) {
            $tglExp = strtotime($data['tgl_kadaluarsa']);
            if ($tglExp && ($tglExp - time()) > (2 * 365 * 86400)) {
                $flags[] = [
                    'level' => 'warning', 'code' => 'EXPIRY_LONG',
                    'message' => 'Masa berlaku > 2 tahun — pertimbangkan trim ke 1 tahun.',
                ];
            }
        }

        return $flags;
    }

    /**
     * Invalidate Redis cache user context supaya akses langsung refresh.
     */
    private function invalidateUserContextCache(string $idPengguna): void
    {
        try {
            $keys = ["user_context:{$idPengguna}", "portal_apps:user:{$idPengguna}", "user_roles:{$idPengguna}"];
            foreach ($keys as $k) {
                \Illuminate\Support\Facades\Cache::forget($k);
            }
        } catch (\Exception $e) {
            Log::warning('SSAR cache invalidation failed', ['err' => $e->getMessage()]);
        }
    }

    /**
     * Send notif inbox ke pemohon via man_konten notif_inbox table (kalau ada).
     * Defensive: kalau table belum ada, skip silent.
     */
    private function sendNotif(string $idPengguna, string $type, string $title, string $message): void
    {
        try {
            // Pakai DB notif_inbox kalau ada (man-konten-service)
            $tableExists = DB::selectOne(
                "SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='man_akses' AND TABLE_NAME='notif_inbox'"
            );
            if ($tableExists && $tableExists->cnt > 0) {
                DB::insert("
                    INSERT INTO man_akses.notif_inbox (
                        id_notif, id_pengguna, tipe, judul, pesan, status_baca,
                        tgl_create, last_update
                    ) VALUES (NEWID(), ?, ?, ?, ?, 0, GETDATE(), GETDATE())
                ", [$idPengguna, $type, $title, $message]);
            }
        } catch (\Exception $e) {
            Log::info('SSAR notif skipped (table may not exist)', ['err' => $e->getMessage()]);
        }
    }
}
