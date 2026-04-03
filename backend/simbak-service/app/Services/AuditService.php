<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Service untuk write ke log.jejak_audit.
 * Trigger aktivitas_data sudah otomatis via PostgreSQL trigger.
 */
class AuditService
{
    /**
     * Catat aksi bisnis ke log.jejak_audit.
     */
    public function log(
        string $aksi,
        ?string $idPengguna = null,
        ?string $nmPengguna = null,
        ?string $nmSchema = null,
        ?string $nmTabel = null,
        ?string $idTerkait = null,
        ?string $detail = null,
        ?Request $request = null
    ): void {
        try {
            $sql = "
                INSERT INTO log.jejak_audit
                    (id_pengguna, nm_pengguna, ip_address, user_agent, aksi,
                     nm_schema, nm_tabel, id_terkait, detail)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ";

            DB::connection('pgsql')->insert($sql, [
                $idPengguna,
                $nmPengguna,
                $request?->ip(),
                $request ? substr($request->userAgent() ?? '', 0, 500) : null,
                $aksi,
                $nmSchema,
                $nmTabel,
                $idTerkait,
                $detail,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to write audit log: ' . $e->getMessage(), [
                'aksi' => $aksi,
                'id_pengguna' => $idPengguna,
            ]);
        }
    }

    /**
     * Log dari request context (shortcut).
     */
    public function logFromRequest(Request $request, string $aksi, ?string $nmSchema = null, ?string $nmTabel = null, ?string $idTerkait = null, ?string $detail = null): void
    {
        $user = $request->user();
        $this->log(
            aksi: $aksi,
            idPengguna: $user?->id_pengguna,
            nmPengguna: $user?->nm_pengguna ?? $user?->username,
            nmSchema: $nmSchema,
            nmTabel: $nmTabel,
            idTerkait: $idTerkait,
            detail: $detail,
            request: $request,
        );
    }
}
