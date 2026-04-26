<?php

namespace App\Jobs;

use App\Services\PayloadTransformer;
use App\Services\SimkatmawaClient;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * SubmitToSimkatmawaJob — push 1 record (prestasi/sertifikasi/rekognisi)
 * ke SIMKATMAWA + log ke sync.submission.
 *
 * Lifecycle state pada parent table:
 *   - draft → ready: manual user, frontend
 *   - ready → sending: saat job mulai
 *   - sending → sent | error: berdasarkan response SIMKATMAWA
 *
 * Retry strategy:
 *   - Network/HTTP 5xx → retry exponential backoff (10s, 60s, 300s) up to 3x
 *   - HTTP 4xx (validation error dari SIMKATMAWA) → tidak retry, langsung error
 *   - Job timeout → marked sebagai error
 */
class SubmitToSimkatmawaJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 60;
    public array $backoff = [10, 60, 300];

    public function __construct(
        public string $idParent,
        public string $parentTipe, // PRESTASI | SERTIFIKASI | REKOGNISI
        public ?string $idActor = null,
    ) {
        if (!in_array($parentTipe, ['PRESTASI', 'SERTIFIKASI', 'REKOGNISI'], true)) {
            throw new \InvalidArgumentException("parent_tipe invalid: {$parentTipe}");
        }
    }

    public function handle(SimkatmawaClient $client, PayloadTransformer $transformer): void
    {
        $idSubmission = (string) Str::uuid();
        $tableMap = [
            'PRESTASI'    => 'prestasi.prestasi_mandiri',
            'SERTIFIKASI' => 'prestasi.sertifikasi',
            'REKOGNISI'   => 'prestasi.rekognisi',
        ];
        $idColMap = [
            'PRESTASI'    => 'id_prestasi_mandiri',
            'SERTIFIKASI' => 'id_sertifikasi',
            'REKOGNISI'   => 'id_rekognisi',
        ];
        $tipeIdMap = $this->fetchTipeSyncIds(); // {PRESTASI: uuid, SERTIFIKASI: uuid, REKOGNISI: uuid}

        $table = $tableMap[$this->parentTipe];
        $idCol = $idColMap[$this->parentTipe];

        // 1. Build payload via transformer
        try {
            $payload = match ($this->parentTipe) {
                'PRESTASI'    => $transformer->transformPrestasiMandiri($this->idParent),
                'SERTIFIKASI' => $transformer->transformSertifikasi($this->idParent),
                'REKOGNISI'   => $transformer->transformRekognisi($this->idParent),
            };
        } catch (\Throwable $e) {
            $this->markError($table, $idCol, "Transform error: " . $e->getMessage());
            $this->logSubmission($idSubmission, $tipeIdMap, [], null, null, $e->getMessage());
            return;
        }

        // 2. Set status sending
        DB::statement("UPDATE {$table} SET status_workflow = 'sending', updated_at = NOW() WHERE {$idCol} = ?", [$this->idParent]);

        // 3. Submit ke SIMKATMAWA
        $result = match ($this->parentTipe) {
            'PRESTASI'    => $client->submitPrestasiMandiri($payload),
            'SERTIFIKASI' => $client->submitSertifikasi($payload),
            'REKOGNISI'   => $client->submitRekognisi($payload),
        };

        // 4. Log ke sync.submission
        $this->logSubmission(
            $idSubmission,
            $tipeIdMap,
            $payload,
            $result['http_status'] ?? null,
            $result['response_body'] ?? null,
            $result['error'] ?? null,
            $result['simkatmawa_id'] ?? null,
        );

        // 5. Update parent state berdasar hasil
        if (($result['ok'] ?? false) === true) {
            $simkatmawaId = $result['simkatmawa_id'] ?? null;
            $kodePt = $result['response_body']['kode_pt'] ?? null;
            DB::statement("
                UPDATE {$table}
                SET status_workflow = 'sent',
                    kode_pt = COALESCE(?, kode_pt),
                    updated_at = NOW()
                WHERE {$idCol} = ?
            ", [$kodePt, $this->idParent]);
            Log::info("SIMKATMAWA submit OK", [
                'id_parent'      => $this->idParent,
                'parent_tipe'    => $this->parentTipe,
                'simkatmawa_id'  => $simkatmawaId,
                'dry_run'        => $result['dry_run'] ?? false,
            ]);
        } else {
            $msg = $result['error'] ?? ($result['response_body']['message'] ?? 'Unknown error');
            $httpStatus = $result['http_status'] ?? 0;
            // 4xx = validation error, tidak perlu retry
            if ($httpStatus >= 400 && $httpStatus < 500) {
                $this->markError($table, $idCol, "HTTP {$httpStatus}: {$msg}");
                $this->fail(new \RuntimeException("SIMKATMAWA validation error: {$msg}"));
                return;
            }
            // 5xx atau network error → throw supaya Laravel retry
            throw new \RuntimeException("SIMKATMAWA error (HTTP {$httpStatus}): {$msg}");
        }
    }

    /**
     * Job permanently failed (after max retries) — mark parent as error.
     */
    public function failed(\Throwable $e): void
    {
        $tableMap = [
            'PRESTASI'    => 'prestasi.prestasi_mandiri',
            'SERTIFIKASI' => 'prestasi.sertifikasi',
            'REKOGNISI'   => 'prestasi.rekognisi',
        ];
        $idColMap = [
            'PRESTASI'    => 'id_prestasi_mandiri',
            'SERTIFIKASI' => 'id_sertifikasi',
            'REKOGNISI'   => 'id_rekognisi',
        ];
        $this->markError(
            $tableMap[$this->parentTipe] ?? null,
            $idColMap[$this->parentTipe] ?? null,
            "Job failed after {$this->tries} retries: " . $e->getMessage(),
        );
    }

    protected function markError(?string $table, ?string $idCol, string $message): void
    {
        if (!$table || !$idCol) return;
        DB::statement("UPDATE {$table} SET status_workflow = 'error', updated_at = NOW() WHERE {$idCol} = ?", [$this->idParent]);
        Log::warning("SIMKATMAWA submit error", [
            'id_parent'   => $this->idParent,
            'parent_tipe' => $this->parentTipe,
            'message'     => $message,
        ]);
    }

    protected function logSubmission(
        string $idSubmission,
        array $tipeIdMap,
        array $payload,
        ?int $httpStatus,
        $responseBody,
        ?string $errorMessage = null,
        $simkatmawaId = null,
    ): void {
        $idTipeSync = $tipeIdMap[$this->parentTipe] ?? null;
        if (!$idTipeSync) {
            Log::error("ref.tipe_sync row tidak ada untuk {$this->parentTipe}");
            return;
        }
        $kodePt = is_array($responseBody) ? ($responseBody['kode_pt'] ?? null) : null;
        $tahun  = is_array($responseBody) ? ($responseBody['tahun'] ?? null) : null;
        // Note: a_success is a generated column ((http_status BETWEEN 200 AND 299)) — jangan di-insert manual.
        DB::insert("
            INSERT INTO sync.submission
                (id_submission, id_parent, parent_tipe, id_tipe_sync, request_payload,
                 request_at, http_status, response_body, simkatmawa_id, simkatmawa_kode_pt,
                 simkatmawa_tahun, error_message, retry_count, id_actor)
            VALUES (?, ?, ?, ?, ?::jsonb, NOW(), ?, ?::jsonb, ?, ?, ?, ?, ?, ?)
        ", [
            $idSubmission,
            $this->idParent,
            $this->parentTipe,
            $idTipeSync,
            json_encode($payload, JSON_UNESCAPED_UNICODE),
            $httpStatus,
            $responseBody !== null ? json_encode($responseBody, JSON_UNESCAPED_UNICODE) : null,
            $simkatmawaId !== null && is_numeric($simkatmawaId) ? (int) $simkatmawaId : null,
            $kodePt,
            $tahun !== null && is_numeric($tahun) ? (int) $tahun : null,
            $errorMessage,
            $this->attempts(),
            $this->idActor,
        ]);
    }

    protected function fetchTipeSyncIds(): array
    {
        $rows = DB::select("SELECT id_tipe_sync, kode FROM ref.tipe_sync WHERE a_active = TRUE");
        $map = [];
        foreach ($rows as $r) {
            $map[$r->kode] = $r->id_tipe_sync;
        }
        return $map;
    }
}
