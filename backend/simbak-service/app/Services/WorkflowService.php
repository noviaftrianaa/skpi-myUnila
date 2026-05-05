<?php

namespace App\Services;

use App\Repositories\BaseRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * WorkflowService — mengelola transisi status pengajuan berdasarkan tahapan_layanan.
 *
 * Alur:
 *   1. Cari tahapan aktif berdasarkan status pengajuan saat ini
 *   2. Validasi bahwa aktor punya kode_role yang sesuai
 *   3. Transisi status ke status_selesai tahapan tersebut
 *   4. Catat riwayat
 */
class WorkflowService
{
    /**
     * Ambil semua tahapan untuk suatu jenis layanan, urut ascending.
     */
    public function getTahapanByJenisLayanan(string $idJenisLayanan): array
    {
        return DB::connection('pgsql')->select("
            SELECT *
            FROM ref.tahapan_layanan
            WHERE id_jenis_layanan = ? AND soft_delete = false
            ORDER BY urutan ASC
        ", [$idJenisLayanan]);
    }

    /**
     * Cari tahapan aktif berdasarkan status pengajuan saat ini.
     * Tahapan aktif = tahapan yang status_masuk-nya cocok dengan status pengajuan.
     */
    public function getCurrentTahapan(object $pengajuan): ?object
    {
        $tahapanList = $this->getTahapanByJenisLayanan($pengajuan->id_jenis_layanan);

        foreach ($tahapanList as $tahapan) {
            if ($tahapan->status_masuk === $pengajuan->status) {
                return $tahapan;
            }
        }

        return null;
    }

    /**
     * Cari tahapan selanjutnya setelah tahapan saat ini.
     * Jika pengajuan dari luar Unila (a_dari_luar), skip tahap admin_fakultas_asal.
     */
    public function getNextTahapan(object $pengajuan, object $currentTahapan): ?object
    {
        $tahapanList = $this->getTahapanByJenisLayanan($pengajuan->id_jenis_layanan);
        $isDariLuar = $pengajuan->a_dari_luar ?? false;

        $found = false;
        foreach ($tahapanList as $tahapan) {
            if ($found) {
                // Skip tahap fakultas asal untuk pengajuan dari luar Unila
                if ($isDariLuar && $tahapan->kode_role === 'admin_fakultas_asal') {
                    continue;
                }
                return $tahapan;
            }
            if ($tahapan->id_tahapan === $currentTahapan->id_tahapan) {
                $found = true;
            }
        }

        return null;
    }

    /**
     * Validasi apakah aktor (berdasarkan kode_role) boleh memproses tahapan ini.
     */
    public function canActorProcess(object $tahapan, string $kodeRoleAktor): bool
    {
        return $tahapan->kode_role === $kodeRoleAktor;
    }

    /**
     * Cari tahapan yang cocok untuk aktor tertentu pada pengajuan ini.
     * Digunakan untuk kasus di mana status_masuk bisa sama tapi kode_role berbeda
     * (contoh: PM-ALIH tahap 2 dan 3 sama-sama admin_fakultas tapi beda urutan).
     *
     * Khusus PM-ALIH dari luar Unila (a_dari_luar):
     * - admin_bak bisa memproses tahap 1 (yang normalnya untuk mahasiswa)
     * - tahap admin_fakultas_asal di-skip
     */
    public function findTahapanForActor(object $pengajuan, string $kodeRoleAktor): ?object
    {
        $tahapanList = $this->getTahapanByJenisLayanan($pengajuan->id_jenis_layanan);
        $isDariLuar = $pengajuan->a_dari_luar ?? false;

        foreach ($tahapanList as $tahapan) {
            // Skip tahap fakultas asal untuk pengajuan dari luar Unila
            if ($isDariLuar && $tahapan->kode_role === 'admin_fakultas_asal') {
                continue;
            }

            if ($tahapan->status_masuk === $pengajuan->status && $tahapan->kode_role === $kodeRoleAktor) {
                return $tahapan;
            }

            // Dari luar Unila: admin_bak bisa proses tahap mahasiswa (tahap 1)
            if ($isDariLuar && $kodeRoleAktor === 'admin_bak'
                && $tahapan->status_masuk === $pengajuan->status
                && $tahapan->kode_role === 'mahasiswa') {
                return $tahapan;
            }
        }

        return null;
    }

    /**
     * Hitung total tahapan dan posisi tahapan saat ini.
     * Return: ['current' => 2, 'total' => 5, 'tahapan_list' => [...]]
     */
    public function getProgress(object $pengajuan): array
    {
        $tahapanList = $this->getTahapanByJenisLayanan($pengajuan->id_jenis_layanan);
        $isDariLuar = $pengajuan->a_dari_luar ?? false;

        // Filter out skipped stages for luar Unila
        if ($isDariLuar) {
            $tahapanList = array_values(array_filter($tahapanList, function ($t) {
                return $t->kode_role !== 'admin_fakultas_asal';
            }));
        }

        $total = count($tahapanList);
        $current = 0;

        // Cari posisi berdasarkan status: tahapan yang status_selesai-nya sudah dilewati
        foreach ($tahapanList as $i => $tahapan) {
            if ($tahapan->status_masuk === $pengajuan->status) {
                $current = $i + 1; // 1-based
                break;
            }
            // Jika status pengajuan = status_selesai tahapan ini, berarti tahapan ini sudah selesai
            if ($tahapan->status_selesai === $pengajuan->status) {
                $current = $i + 2; // tahapan selanjutnya
                break;
            }
        }

        // Jika status terbit atau ditolak, posisi = terakhir
        if (in_array($pengajuan->status, ['terbit', 'ditolak'])) {
            $current = $total;
        }

        $isFinished = in_array($pengajuan->status, ['terbit', 'ditolak']);

        return [
            'current' => $current,
            'total' => $total,
            'tahapan_list' => array_map(function ($t) use ($pengajuan, $isFinished) {
                $obj = (array) $t;
                if ($isFinished) {
                    // Semua tahapan completed jika sudah terbit/ditolak
                    $obj['stage_status'] = 'completed';
                } elseif ($this->isStageCompleted($t, $pengajuan)) {
                    $obj['stage_status'] = 'completed';
                } elseif ($t->status_masuk === $pengajuan->status) {
                    $obj['stage_status'] = 'active';
                } else {
                    $obj['stage_status'] = 'pending';
                }
                return $obj;
            }, $tahapanList),
        ];
    }

    /**
     * Cek apakah suatu tahapan sudah selesai berdasarkan status pengajuan.
     */
    private function isStageCompleted(object $tahapan, object $pengajuan): bool
    {
        $statusOrder = [
            'draft' => 0,
            'diajukan' => 1,
            'perlu_perbaikan' => 1,
            'diverifikasi' => 2,
            'menunggu_persetujuan' => 3,
            'disetujui' => 4,
            'terbit' => 5,
            'ditolak' => 5,
        ];

        $currentOrder = $statusOrder[$pengajuan->status] ?? 0;
        $stageEndOrder = $statusOrder[$tahapan->status_selesai] ?? 0;

        // Tahapan selesai jika status saat ini >= status_selesai tahapan
        // DAN tahapan ini bukan tahapan yang sedang aktif (status_masuk != status saat ini)
        if ($currentOrder > $stageEndOrder) return true;
        if ($currentOrder === $stageEndOrder && $tahapan->status_masuk !== $pengajuan->status) return true;

        return false;
    }

    /**
     * Determine kode_role user berdasarkan data dari man_akses.
     *
     * Prioritas:
     * 1. Header X-Active-Role (dari frontend active context)
     * 2. Query role_pengguna dari database
     * 3. Fallback: mahasiswa
     */
    public function determineUserRole(?object $user, ?string $activeRoleHeader = null): string
    {
        if (!$user) return 'unknown';

        // Dev bypass: jika BYPASS_PERMISSION_CHECK aktif, cek header dulu
        if (env('BYPASS_PERMISSION_CHECK', false) && $activeRoleHeader) {
            return $this->mapPeranToKodeRole($activeRoleHeader);
        }

        // 1. Dari header X-Active-Role yang dikirim frontend
        if ($activeRoleHeader) {
            return $this->mapPeranToKodeRole($activeRoleHeader);
        }

        // 2. Dari property user jika tersedia (sudah di-set oleh middleware)
        $roleName = $user->nm_peran ?? $user->role ?? $user->kode_role ?? '';
        if ($roleName) {
            return $this->mapPeranToKodeRole($roleName);
        }

        // 3. Query dari database — ambil role untuk app sim-bak
        try {
            $roles = DB::connection('sqlsrv')->select("
                SELECT p.nm_peran
                FROM man_akses.role_pengguna rp
                JOIN man_akses.peran p ON p.id_peran = rp.id_peran
                WHERE rp.id_pengguna = ?
                  AND rp.approval_peran = 1
                  AND (rp.soft_delete IS NULL OR rp.soft_delete = 0)
                ORDER BY p.id_peran ASC
            ", [$user->id_pengguna]);

            // Ambil role tertinggi (bukan mahasiswa jika ada role lain)
            foreach ($roles as $r) {
                $mapped = $this->mapPeranToKodeRole($r->nm_peran);
                if ($mapped !== 'mahasiswa') return $mapped;
            }

            if (count($roles) > 0) {
                return $this->mapPeranToKodeRole($roles[0]->nm_peran);
            }
        } catch (\Exception $e) {
            Log::warning('WorkflowService.determineUserRole query failed: ' . $e->getMessage());
        }

        return 'mahasiswa';
    }

    /**
     * Map nm_peran dari man_akses.peran ke kode_role yang dipakai di tahapan_layanan.
     */
    private function mapPeranToKodeRole(string $nmPeran): string
    {
        $lower = strtolower($nmPeran);

        if (str_contains($lower, 'developer') || $lower === 'admin' || str_contains($lower, 'administrator')) return 'admin_bak';
        if (str_contains($lower, 'admin_bak') || str_contains($lower, 'admin bak') || $lower === 'bak') return 'admin_bak';
        if (str_contains($lower, 'admin_fakultas') || str_contains($lower, 'admin fakultas') || str_contains($lower, 'fakultas')) return 'admin_fakultas';
        if (str_contains($lower, 'pejabat') || str_contains($lower, 'approver') || str_contains($lower, 'dekan') || str_contains($lower, 'rektor') || str_contains($lower, 'wakil rektor')) return 'pejabat';
        if (str_contains($lower, 'mahasiswa')) return 'mahasiswa';

        return 'mahasiswa';
    }
}
