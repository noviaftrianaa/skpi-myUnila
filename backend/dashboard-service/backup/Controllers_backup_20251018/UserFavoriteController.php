<?php

namespace App\Http\Controllers;

use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * User Favorite Controller
 *
 * Example of protected endpoint that requires JWT authentication via Kong.
 * This controller demonstrates how to use TrustKong middleware.
 */
class UserFavoriteController extends Controller
{
    use ApiResponse;

    /**
     * Get user's favorite faculties
     *
     * @OA\Get(
     *     path="/api/v1/my-favorites",
     *     tags={"User Favorites"},
     *     summary="Get user's favorite faculties (Protected)",
     *     description="Returns list of faculties that user has favorited. Requires JWT authentication.",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Favorites retrieved successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="user_id", type="string", example="F8C8DC15-D3FF-4A79-A255-EF095D4224A9"),
     *                 @OA\Property(property="user_name", type="string", example="Mizar Zulmi"),
     *                 @OA\Property(property="favorites", type="array", @OA\Items(type="string"))
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized - JWT token missing or invalid"
     *     )
     * )
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        // Get authenticated user from request (injected by TrustKong middleware)
        $user = $request->attributes->get('auth_user');

        // Simulate user favorites (in real app, this would come from database)
        $favorites = [
            'FKIP' => 'Fakultas Keguruan dan Ilmu Pendidikan',
            'FT' => 'Fakultas Teknik',
            'FMIPA' => 'Fakultas Matematika dan Ilmu Pengetahuan Alam'
        ];

        $data = [
            'user_id' => $user->id,
            'user_name' => $user->name,
            'user_email' => $user->email,
            'user_role' => $user->role,
            'favorites' => $favorites,
            'total_favorites' => count($favorites)
        ];

        return $this->successResponse($data, 'Favorites retrieved successfully');
    }

    /**
     * Add faculty to favorites
     *
     * @OA\Post(
     *     path="/api/v1/my-favorites",
     *     tags={"User Favorites"},
     *     summary="Add faculty to favorites (Protected)",
     *     description="Add a faculty to user's favorites list. Requires JWT authentication.",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"faculty_code"},
     *             @OA\Property(property="faculty_code", type="string", example="FKIP")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Faculty added to favorites"
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized"
     *     )
     * )
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        // Get authenticated user
        $user = $request->attributes->get('auth_user');

        // Validate request
        $request->validate([
            'faculty_code' => 'required|string|max:10'
        ]);

        $facultyCode = $request->input('faculty_code');

        // Simulate adding to favorites
        $data = [
            'user_id' => $user->id,
            'faculty_code' => $facultyCode,
            'added_at' => now()->toIso8601String()
        ];

        return $this->successResponse($data, 'Faculty added to favorites successfully');
    }

    /**
     * Get user profile
     *
     * @OA\Get(
     *     path="/api/v1/my-profile",
     *     tags={"User Profile"},
     *     summary="Get authenticated user profile (Protected)",
     *     description="Returns authenticated user information extracted from JWT token. Demonstrates Kong JWT validation.",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Profile retrieved successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="id", type="string", example="F8C8DC15-D3FF-4A79-A255-EF095D4224A9"),
     *                 @OA\Property(property="name", type="string", example="Mizar Zulmi"),
     *                 @OA\Property(property="email", type="string", example="mizar.zulmi1073@students.unila.ac.id"),
     *                 @OA\Property(property="username", type="string", example="mizar.zulmi1073"),
     *                 @OA\Property(property="role", type="string", example="Mahasiswa")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized - JWT token missing or invalid"
     *     )
     * )
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function profile(Request $request): JsonResponse
    {
        // Get authenticated user from request (injected by TrustKong middleware)
        $user = $request->attributes->get('auth_user');

        $data = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'username' => $user->username,
            'role' => $user->role,
            'authenticated_via' => 'Kong API Gateway JWT Plugin',
            'token_validated_by' => 'Kong (not service)',
            'retrieved_at' => now()->toIso8601String()
        ];

        return $this->successResponse($data, 'Profile retrieved successfully');
    }
}
