<?php

namespace App\Http\Controllers\OpenApi;

use App\Http\Controllers\Controller;
use App\Services\KtwService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * KtwController — endpoint Kelulusan Tepat Waktu.
 *
 * Paths di bawah /ktw/* (route file bootstrap/registered di routes/api.php).
 * Source of truth: pdut realtime; reconcile: spordit.
 *
 * Definisi yang disupport:
 *   - strict    : masa_studi ≤ masa_normatif (4y S1)
 *   - tolerant  : masa_studi ≤ masa_normatif + 0.25 (tolerance semester gasal)
 *   - survival  : total lulus / maba
 *
 * Semua response punya field `meta` dengan formula + sumber data untuk transparency.
 */
class KtwController extends Controller
{
    public function __construct(
        protected KtwService $service,
    ) {}

    /** GET /ktw/overview?cohort=2021&jenjang=S1&cutoff=2025-11-30 */
    public function overview(Request $request): JsonResponse
    {
        $v = $request->validate([
            'cohort' => 'nullable|integer|min:2000|max:2100',
            'jenjang' => 'nullable|in:D3,D4,S1,S2,S3',
            'cutoff' => 'nullable|date_format:Y-m-d',
            'reconcile' => 'nullable|boolean',
        ]);

        $cohort = (int) ($v['cohort'] ?? $this->defaultCohort($v['jenjang'] ?? 'S1'));
        $jenjang = $v['jenjang'] ?? 'S1';
        $cutoff = $v['cutoff'] ?? null;
        $reconcile = (bool) ($v['reconcile'] ?? false);

        return response()->json($this->service->getOverviewByCohort($cohort, $jenjang, $reconcile, $cutoff));
    }

    /** GET /ktw/fakultas?cohort=2021&jenjang=S1&cutoff=2025-11-30 */
    public function fakultas(Request $request): JsonResponse
    {
        $v = $request->validate([
            'cohort' => 'nullable|integer|min:2000|max:2100',
            'jenjang' => 'nullable|in:D3,D4,S1,S2,S3',
            'cutoff' => 'nullable|date_format:Y-m-d',
        ]);
        $cohort = (int) ($v['cohort'] ?? $this->defaultCohort($v['jenjang'] ?? 'S1'));
        $jenjang = $v['jenjang'] ?? 'S1';

        return response()->json($this->service->getByFakultas($cohort, $jenjang, $v['cutoff'] ?? null));
    }

    /** GET /ktw/prodi?cohort=2021&jenjang=S1&id_fakultas=...&cutoff=2025-11-30 */
    public function prodiList(Request $request): JsonResponse
    {
        $v = $request->validate([
            'cohort' => 'nullable|integer|min:2000|max:2100',
            'jenjang' => 'nullable|in:D3,D4,S1,S2,S3',
            'id_fakultas' => 'nullable|string|max:50',
            'cutoff' => 'nullable|date_format:Y-m-d',
        ]);
        $cohort = (int) ($v['cohort'] ?? $this->defaultCohort($v['jenjang'] ?? 'S1'));
        $jenjang = $v['jenjang'] ?? 'S1';

        return response()->json($this->service->getByProdi($cohort, $jenjang, $v['id_fakultas'] ?? null, $v['cutoff'] ?? null));
    }

    /** GET /ktw/prodi/{id_sms}?cohort=2021 */
    public function prodiDetail(Request $request, string $idSms): JsonResponse
    {
        $v = $request->validate([
            'cohort' => 'nullable|integer|min:2000|max:2100',
            'reconcile' => 'nullable|boolean',
        ]);
        $cohort = (int) ($v['cohort'] ?? (int) date('Y') - 4);
        $reconcile = (bool) ($v['reconcile'] ?? true);

        $result = $this->service->getProdiDetail($idSms, $cohort, $reconcile);
        if (isset($result['error'])) {
            return response()->json($result, 404);
        }
        return response()->json($result);
    }

    /** GET /ktw/trend?jenjang=S1&start=2018&end=2023 */
    public function trend(Request $request): JsonResponse
    {
        $v = $request->validate([
            'jenjang' => 'nullable|in:D3,D4,S1,S2,S3',
            'start' => 'nullable|integer|min:2000|max:2100',
            'end' => 'nullable|integer|min:2000|max:2100',
        ]);
        $jenjang = $v['jenjang'] ?? 'S1';
        $currentYear = (int) date('Y');
        $defaultEnd = $currentYear - (int) (\App\Repositories\KtwRepository::MASA_NORMATIF[$jenjang] ?? 4);
        $end = (int) ($v['end'] ?? $defaultEnd);
        $start = (int) ($v['start'] ?? ($end - 5));

        if ($start > $end) [$start, $end] = [$end, $start];

        return response()->json($this->service->getTrend($jenjang, $start, $end));
    }

    /**
     * GET /ktw/prodi/{id_sms}/mahasiswa?cohort=2021&page=1&per_page=50
     * HANYA untuk dashboard pimpinan + raw data service. Requires JWT.
     */
    public function prodiMahasiswa(Request $request, string $idSms): JsonResponse
    {
        $v = $request->validate([
            'cohort' => 'required|integer|min:2000|max:2100',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:500',
        ]);

        return response()->json($this->service->getMahasiswaListByProdi(
            $idSms,
            (int) $v['cohort'],
            (int) ($v['page'] ?? 1),
            (int) ($v['per_page'] ?? 50),
        ));
    }

    /** GET /ktw/jalur-breakdown?cohort=2021&jenjang=S1&cutoff=... */
    public function jalurBreakdown(Request $request): JsonResponse
    {
        $v = $request->validate([
            'cohort' => 'nullable|integer|min:2000|max:2100',
            'jenjang' => 'nullable|in:D3,D4,S1,S2,S3',
            'cutoff' => 'nullable|date_format:Y-m-d',
        ]);
        $cohort = (int) ($v['cohort'] ?? $this->defaultCohort($v['jenjang'] ?? 'S1'));
        return response()->json($this->service->getJalurBreakdown($cohort, $v['jenjang'] ?? 'S1', $v['cutoff'] ?? null));
    }

    /** GET /ktw/masa-mukim-stats?cohort=2021&jenjang=S1&cutoff=... */
    public function masaMukimStats(Request $request): JsonResponse
    {
        $v = $request->validate([
            'cohort' => 'nullable|integer|min:2000|max:2100',
            'jenjang' => 'nullable|in:D3,D4,S1,S2,S3',
            'cutoff' => 'nullable|date_format:Y-m-d',
        ]);
        $cohort = (int) ($v['cohort'] ?? $this->defaultCohort($v['jenjang'] ?? 'S1'));
        return response()->json($this->service->getMasaMukimStats($cohort, $v['jenjang'] ?? 'S1', $v['cutoff'] ?? null));
    }

    /** GET /ktw/status-breakdown?cohort=2021&jenjang=S1&cutoff=... */
    public function statusBreakdown(Request $request): JsonResponse
    {
        $v = $request->validate([
            'cohort' => 'nullable|integer|min:2000|max:2100',
            'jenjang' => 'nullable|in:D3,D4,S1,S2,S3',
            'cutoff' => 'nullable|date_format:Y-m-d',
        ]);
        $cohort = (int) ($v['cohort'] ?? $this->defaultCohort($v['jenjang'] ?? 'S1'));
        return response()->json($this->service->getStatusBreakdown($cohort, $v['jenjang'] ?? 'S1', $v['cutoff'] ?? null));
    }

    /** GET /ktw/gender-breakdown?cohort=2021&jenjang=S1&cutoff=... */
    public function genderBreakdown(Request $request): JsonResponse
    {
        $v = $request->validate([
            'cohort' => 'nullable|integer|min:2000|max:2100',
            'jenjang' => 'nullable|in:D3,D4,S1,S2,S3',
            'cutoff' => 'nullable|date_format:Y-m-d',
        ]);
        $cohort = (int) ($v['cohort'] ?? $this->defaultCohort($v['jenjang'] ?? 'S1'));
        return response()->json($this->service->getGenderBreakdown($cohort, $v['jenjang'] ?? 'S1', $v['cutoff'] ?? null));
    }

    /** GET /ktw/presets — dynamic cutoff presets dari ref.semester + common */
    public function presets(): JsonResponse
    {
        return response()->json($this->service->getSemesterPresets());
    }

    /** GET /ktw/top-prodi?cohort=2021&jenjang=S1&limit=10&cutoff=... */
    public function topProdi(Request $request): JsonResponse
    {
        $v = $request->validate([
            'cohort' => 'nullable|integer|min:2000|max:2100',
            'jenjang' => 'nullable|in:D3,D4,S1,S2,S3',
            'limit' => 'nullable|integer|min:1|max:50',
            'cutoff' => 'nullable|date_format:Y-m-d',
        ]);
        $cohort = (int) ($v['cohort'] ?? $this->defaultCohort($v['jenjang'] ?? 'S1'));
        return response()->json($this->service->getTopProdi(
            $cohort,
            $v['jenjang'] ?? 'S1',
            (int) ($v['limit'] ?? 10),
            $v['cutoff'] ?? null,
        ));
    }

    /** POST /ktw/refresh — invalidate cache + return count */
    public function refresh(): JsonResponse
    {
        $n = $this->service->flushCache();
        return response()->json(['success' => true, 'cleared_keys' => $n, 'as_of' => now()->toIso8601String()]);
    }

    /** GET /ktw/reconcile?cohort=2021&jenjang=S1 */
    public function reconcile(Request $request): JsonResponse
    {
        $v = $request->validate([
            'cohort' => 'nullable|integer|min:2000|max:2100',
            'jenjang' => 'nullable|in:D3,D4,S1,S2,S3',
        ]);
        $cohort = (int) ($v['cohort'] ?? $this->defaultCohort($v['jenjang'] ?? 'S1'));
        $jenjang = $v['jenjang'] ?? 'S1';

        return response()->json($this->service->reconcile($cohort, $jenjang));
    }

    /**
     * Default cohort: tahun berjalan - masa_normatif (mahasiswa yang seharusnya lulus tahun ini).
     */
    protected function defaultCohort(string $jenjang): int
    {
        $map = ['D3' => 3, 'D4' => 4, 'S1' => 4, 'S2' => 2, 'S3' => 3];
        return (int) date('Y') - ($map[$jenjang] ?? 4);
    }
}
