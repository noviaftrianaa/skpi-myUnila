<?php

namespace App\Http\Controllers\Api\ManAkses;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Dashboard Controller
 * Handle dashboard statistics and metrics for Manajemen Akses
 */
class DashboardController extends Controller
{
    /**
     * Get dashboard statistics
     *
     * @return JsonResponse
     */
    public function stats(): JsonResponse
    {
        try {
            // Get all stats in parallel
            $stats = [
                'total_pengguna' => $this->getTotalPengguna(),
                'pengguna_aktif' => $this->getPenggunaAktif(),
                'total_aplikasi' => $this->getTotalAplikasi(),
                'aplikasi_aktif' => $this->getAplikasiAktif(),
                'total_peran' => $this->getTotalPeran(),
                'peran_aktif' => $this->getPeranAktif(),
                'total_endpoint' => $this->getTotalEndpoint(),
                'endpoint_aktif' => $this->getEndpointAktif(),
                'total_unit' => $this->getTotalUnit(),
                'total_kategori' => $this->getTotalKategori(),
                'total_menu' => $this->getTotalMenu(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting dashboard stats', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to get dashboard statistics',
            ], 500);
        }
    }

    /**
     * Get total pengguna count
     */
    private function getTotalPengguna(): int
    {
        try {
            $result = DB::selectOne("
                SELECT COUNT(*) as total
                FROM man_akses.pengguna
                WHERE soft_delete = 0
            ");
            return (int) $result->total;
        } catch (\Exception $e) {
            Log::error('Error getting total pengguna', ['error' => $e->getMessage()]);
            return 0;
        }
    }

    /**
     * Get active pengguna count (a_aktif = 1)
     */
    private function getPenggunaAktif(): int
    {
        try {
            $result = DB::selectOne("
                SELECT COUNT(*) as total
                FROM man_akses.pengguna
                WHERE soft_delete = 0
                  AND a_aktif = 1
            ");
            return (int) $result->total;
        } catch (\Exception $e) {
            Log::error('Error getting active pengguna', ['error' => $e->getMessage()]);
            return 0;
        }
    }

    /**
     * Get total aplikasi count
     */
    private function getTotalAplikasi(): int
    {
        try {
            $result = DB::selectOne("
                SELECT COUNT(*) as total
                FROM man_akses.aplikasi
            ");
            return (int) $result->total;
        } catch (\Exception $e) {
            Log::error('Error getting total aplikasi', ['error' => $e->getMessage()]);
            return 0;
        }
    }

    /**
     * Get active aplikasi count (a_aktif = 1)
     */
    private function getAplikasiAktif(): int
    {
        try {
            $result = DB::selectOne("
                SELECT COUNT(*) as total
                FROM man_akses.aplikasi
                WHERE a_aktif = 1
            ");
            return (int) $result->total;
        } catch (\Exception $e) {
            Log::error('Error getting active aplikasi', ['error' => $e->getMessage()]);
            return 0;
        }
    }

    /**
     * Get total peran count
     */
    private function getTotalPeran(): int
    {
        try {
            $result = DB::selectOne("
                SELECT COUNT(*) as total
                FROM man_akses.peran
                WHERE expired_date IS NULL
            ");
            return (int) $result->total;
        } catch (\Exception $e) {
            Log::error('Error getting total peran', ['error' => $e->getMessage()]);
            return 0;
        }
    }

    /**
     * Get active peran count (a_aktif = 1)
     */
    private function getPeranAktif(): int
    {
        try {
            $result = DB::selectOne("
                SELECT COUNT(*) as total
                FROM man_akses.peran
                WHERE expired_date IS NULL
                  AND a_aktif = 1
            ");
            return (int) $result->total;
        } catch (\Exception $e) {
            Log::error('Error getting active peran', ['error' => $e->getMessage()]);
            return 0;
        }
    }

    /**
     * Get total endpoint count
     */
    private function getTotalEndpoint(): int
    {
        try {
            $result = DB::selectOne("
                SELECT COUNT(*) as total
                FROM man_akses.ws_endpoint
            ");
            return (int) $result->total;
        } catch (\Exception $e) {
            Log::error('Error getting total endpoint', ['error' => $e->getMessage()]);
            return 0;
        }
    }

    /**
     * Get active endpoint count (a_aktif = 1)
     */
    private function getEndpointAktif(): int
    {
        try {
            $result = DB::selectOne("
                SELECT COUNT(*) as total
                FROM man_akses.ws_endpoint
                WHERE a_aktif = 1
            ");
            return (int) $result->total;
        } catch (\Exception $e) {
            Log::error('Error getting active endpoint', ['error' => $e->getMessage()]);
            return 0;
        }
    }

    /**
     * Get total unit organisasi count
     */
    private function getTotalUnit(): int
    {
        try {
            $result = DB::selectOne("
                SELECT COUNT(*) as total
                FROM man_akses.unit_organisasi
                WHERE soft_delete = 0
            ");
            return (int) $result->total;
        } catch (\Exception $e) {
            Log::error('Error getting total unit', ['error' => $e->getMessage()]);
            return 0;
        }
    }

    /**
     * Get total kategori aplikasi count
     */
    private function getTotalKategori(): int
    {
        try {
            $result = DB::selectOne("
                SELECT COUNT(*) as total
                FROM man_akses.kategori_aplikasi
                WHERE soft_delete = 0
            ");
            return (int) $result->total;
        } catch (\Exception $e) {
            Log::error('Error getting total kategori', ['error' => $e->getMessage()]);
            return 0;
        }
    }

    /**
     * Get total menu count
     */
    private function getTotalMenu(): int
    {
        try {
            $result = DB::selectOne("
                SELECT COUNT(*) as total
                FROM man_akses.menu
                WHERE expired_date IS NULL
            ");
            return (int) $result->total;
        } catch (\Exception $e) {
            Log::error('Error getting total menu', ['error' => $e->getMessage()]);
            return 0;
        }
    }

    /**
     * Get recent activities (last 10 activities)
     *
     * @return JsonResponse
     */
    public function recentActivities(): JsonResponse
    {
        try {
            $activities = DB::select("
                SELECT TOP 10
                    ll.id_log_login,
                    ll.username,
                    ll.email,
                    ll.status,
                    ll.waktu_login,
                    ll.ip_address,
                    ll.browser,
                    ll.os,
                    a.nm_aplikasi
                FROM logger.log_login ll
                LEFT JOIN man_akses.aplikasi a ON ll.id_aplikasi = a.id_aplikasi
                ORDER BY ll.waktu_login DESC
            ");

            return response()->json([
                'success' => true,
                'data' => $activities,
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting recent activities', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to get recent activities',
            ], 500);
        }
    }
}
