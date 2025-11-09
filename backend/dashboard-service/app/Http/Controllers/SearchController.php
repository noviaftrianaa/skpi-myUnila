<?php

namespace App\Http\Controllers;

use App\Services\SearchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SearchController extends Controller
{
    protected $searchService;

    public function __construct(SearchService $searchService)
    {
        $this->searchService = $searchService;
    }

    /**
     * Global search across all categories
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function search(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'q' => 'required|string|min:2|max:255',
            'category' => 'nullable|string|in:mahasiswa,dosen,prodi,penelitian,publikasi,pengabdian,bidang-ilmu',
            'limit' => 'nullable|integer|min:1|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $query = $request->input('q');
            $category = $request->input('category');
            $limit = $request->input('limit', 20);

            $results = $this->searchService->globalSearch($query, $category, [], $limit);

            // Calculate total results
            $totalResults = 0;
            foreach ($results as $categoryResults) {
                $totalResults += count($categoryResults);
            }

            return response()->json([
                'success' => true,
                'message' => 'Search results retrieved successfully',
                'data' => [
                    'query' => $query,
                    'category' => $category,
                    'total_results' => $totalResults,
                    'results' => $results,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to perform search',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Search mahasiswa
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function searchMahasiswa(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'q' => 'required|string|min:2|max:255',
            'limit' => 'nullable|integer|min:1|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $query = $request->input('q');
            $limit = $request->input('limit', 20);

            $results = $this->searchService->searchMahasiswa($query, $limit);

            return response()->json([
                'success' => true,
                'message' => 'Mahasiswa search results retrieved successfully',
                'data' => [
                    'query' => $query,
                    'total_results' => count($results),
                    'results' => $results,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to search mahasiswa',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Search dosen
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function searchDosen(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'q' => 'required|string|min:2|max:255',
            'limit' => 'nullable|integer|min:1|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $query = $request->input('q');
            $limit = $request->input('limit', 20);

            $results = $this->searchService->searchDosen($query, $limit);

            return response()->json([
                'success' => true,
                'message' => 'Dosen search results retrieved successfully',
                'data' => [
                    'query' => $query,
                    'total_results' => count($results),
                    'results' => $results,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to search dosen',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Search program studi
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function searchProdi(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'q' => 'required|string|min:2|max:255',
            'limit' => 'nullable|integer|min:1|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $query = $request->input('q');
            $limit = $request->input('limit', 20);

            $results = $this->searchService->searchProdi($query, $limit);

            return response()->json([
                'success' => true,
                'message' => 'Program studi search results retrieved successfully',
                'data' => [
                    'query' => $query,
                    'total_results' => count($results),
                    'results' => $results,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to search program studi',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Search penelitian
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function searchPenelitian(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'q' => 'required|string|min:2|max:255',
            'limit' => 'nullable|integer|min:1|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $query = $request->input('q');
            $limit = $request->input('limit', 20);

            $results = $this->searchService->searchPenelitian($query, $limit);

            return response()->json([
                'success' => true,
                'message' => 'Penelitian search results retrieved successfully',
                'data' => [
                    'query' => $query,
                    'total_results' => count($results),
                    'results' => $results,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to search penelitian',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Search publikasi
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function searchPublikasi(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'q' => 'required|string|min:2|max:255',
            'limit' => 'nullable|integer|min:1|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $query = $request->input('q');
            $limit = $request->input('limit', 20);

            $results = $this->searchService->searchPublikasi($query, $limit);

            return response()->json([
                'success' => true,
                'message' => 'Publikasi search results retrieved successfully',
                'data' => [
                    'query' => $query,
                    'total_results' => count($results),
                    'results' => $results,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to search publikasi',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Search pengabdian
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function searchPengabdian(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'q' => 'required|string|min:2|max:255',
            'limit' => 'nullable|integer|min:1|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $query = $request->input('q');
            $limit = $request->input('limit', 20);

            $results = $this->searchService->searchPengabdian($query, $limit);

            return response()->json([
                'success' => true,
                'message' => 'Pengabdian search results retrieved successfully',
                'data' => [
                    'query' => $query,
                    'total_results' => count($results),
                    'results' => $results,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to search pengabdian',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Search bidang ilmu - returns dosen who have that expertise
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function searchBidangIlmu(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'q' => 'required|string|min:2|max:255',
            'limit' => 'nullable|integer|min:1|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $query = $request->input('q');
            $limit = $request->input('limit', 20);

            $results = $this->searchService->searchBidangIlmu($query, $limit);

            return response()->json([
                'success' => true,
                'message' => 'Bidang ilmu search results retrieved successfully',
                'data' => [
                    'query' => $query,
                    'total_results' => count($results),
                    'results' => $results,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to search bidang ilmu',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get search suggestions for autocomplete
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function suggestions(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'q' => 'required|string|min:1|max:255',
            'limit' => 'nullable|integer|min:1|max:10',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $query = $request->input('q');
            $limit = $request->input('limit', 5);

            $results = $this->searchService->getSuggestions($query, $limit);

            return response()->json([
                'success' => true,
                'message' => 'Search suggestions retrieved successfully',
                'data' => [
                    'query' => $query,
                    'suggestions' => $results,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get search suggestions',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
