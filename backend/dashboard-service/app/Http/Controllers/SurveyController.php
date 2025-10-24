<?php

namespace App\Http\Controllers;

use App\Services\SurveyService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SurveyController extends Controller
{
    protected $surveyService;

    public function __construct(SurveyService $surveyService)
    {
        $this->surveyService = $surveyService;
    }

    /**
     * Get survey dengan questions by slug
     *
     * GET /api/v1/survey/{slug}
     *
     * @param string $slug
     * @return JsonResponse
     */
    public function getSurvey(string $slug): JsonResponse
    {
        $survey = $this->surveyService->getSurveyBySlug($slug);

        if (!$survey) {
            return response()->json([
                'success' => false,
                'message' => 'Survey not found or not active',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $survey,
        ]);
    }

    /**
     * Submit survey response
     *
     * POST /api/v1/survey/{slug}/submit
     *
     * @param Request $request
     * @param string $slug
     * @return JsonResponse
     */
    public function submitSurvey(Request $request, string $slug): JsonResponse
    {
        // Validate request
        $validated = $request->validate([
            // A. Identitas
            'status' => 'required|string',
            'status_lainnya' => 'nullable|string',
            'unit_fakultas' => 'required|string',
            'lama_kampus' => 'required|string',

            // B. Kondisi Saat Ini
            'menggunakan_sistem' => 'required|string|in:Ya,Tidak',
            'sistem_digunakan' => 'nullable|string',
            'kendala' => 'nullable|array',
            'kendala_lainnya' => 'nullable|string',
            'freq_dosen' => 'required|string',
            'freq_mahasiswa' => 'required|string',
            'freq_staf' => 'required|string',
            'freq_akademik' => 'required|string',
            'freq_tridarma' => 'required|string',

            // C. Kebutuhan Fitur
            'fitur_wajib' => 'nullable|array',
            'fitur_lainnya' => 'nullable|string',
            'modul_prioritas' => 'nullable|string',
            'akses_pengguna' => 'nullable|array',
            'akses_lainnya' => 'nullable|string',

            // D. Harapan
            'harapan' => 'required|array|min:1|max:5',
            'harapan_lainnya' => 'nullable|string',
            'pentingnya_portal' => 'required|string',
            'harapan_ui' => 'required|string',

            // E. Saran
            'tantangan' => 'nullable|string',
            'ide_penting' => 'nullable|string',
            'ideal_tim' => 'nullable|string',

            // F. Kontak
            'nama' => 'nullable|string',
            'kontak' => 'nullable|string',
        ]);

        // Metadata
        $metadata = [
            'ip' => $request->ip(),
            'user_agent' => $request->header('User-Agent'),
            'session_id' => $request->hasSession() ? $request->session()->getId() : null,
            'completion_time' => $request->input('_completion_time'), // Frontend bisa kirim ini
            'user_id' => $request->user() ? $request->user()->id : null, // Jika authenticated
            'user_type' => $request->user() ? $request->user()->type : null,
        ];

        $result = $this->surveyService->submitSurveyResponse($slug, $validated, $metadata);

        if (!$result['success']) {
            return response()->json($result, 400);
        }

        return response()->json($result, 201);
    }

    /**
     * Get survey statistics (untuk dashboard)
     *
     * GET /api/v1/survey/{slug}/statistics
     *
     * @param string $slug
     * @return JsonResponse
     */
    public function getStatistics(string $slug): JsonResponse
    {
        $stats = $this->surveyService->getSurveyStatistics($slug);

        if (isset($stats['error'])) {
            return response()->json([
                'success' => false,
                'message' => $stats['error'],
            ], 404);
        }

        return response()->json($stats);
    }

    /**
     * Get question analytics (aggregated answers)
     *
     * GET /api/v1/survey/{slug}/analytics/{questionCode}
     *
     * @param string $slug
     * @param string $questionCode
     * @return JsonResponse
     */
    public function getQuestionAnalytics(string $slug, string $questionCode): JsonResponse
    {
        $analytics = $this->surveyService->getQuestionAnalytics($slug, strtoupper($questionCode));

        if (isset($analytics['error'])) {
            return response()->json([
                'success' => false,
                'message' => $analytics['error'],
            ], 404);
        }

        return response()->json($analytics);
    }
}
