<?php

namespace App\Http\Controllers;

use App\Services\UniversityProfileService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

/**
 * University Profile Controller
 *
 * Handles HTTP requests for university profile information.
 * Follows 3-layer architecture: Controller → Service → Repository
 */
class UniversityProfileController extends Controller
{
    use ApiResponse;

    /**
     * @var UniversityProfileService
     */
    protected UniversityProfileService $service;

    /**
     * Constructor - Dependency Injection
     *
     * @param UniversityProfileService $service
     */
    public function __construct(UniversityProfileService $service)
    {
        $this->service = $service;
    }

    /**
     * Get University Profile
     *
     * @OA\Get(
     *     path="/university-profile",
     *     tags={"University Profile"},
     *     summary="Get complete university profile",
     *     description="Returns complete information about Universitas Lampung including vision, mission, faculties, statistics, and social media",
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="University profile retrieved successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="name", type="string", example="Universitas Lampung"),
     *                 @OA\Property(property="short_name", type="string", example="UNILA"),
     *                 @OA\Property(property="tagline", type="string", example="Universitas Terkemuka di Sumatera"),
     *                 @OA\Property(property="established", type="string", example="23 September 1965"),
     *                 @OA\Property(property="rector", type="string", example="Prof. Dr. Ir. Lusmeilia Afriani, D.E.A., IPM")
     *             )
     *         )
     *     )
     * )
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        try {
            $profile = $this->service->getCompleteProfile();
            return $this->successResponse($profile, 'University profile retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve university profile: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get Quick Facts
     *
     * @OA\Get(
     *     path="/university-profile/quick-facts",
     *     tags={"University Profile"},
     *     summary="Get quick facts cards",
     *     description="Returns 6 quick fact cards for homepage display (students, lecturers, faculties, accreditation, campus area, established year)",
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Quick facts retrieved successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="icon", type="string", example="🎓"),
     *                     @OA\Property(property="title", type="string", example="Mahasiswa"),
     *                     @OA\Property(property="value", type="string", example="35,000+"),
     *                     @OA\Property(property="description", type="string", example="Mahasiswa aktif dari seluruh Indonesia")
     *                 )
     *             )
     *         )
     *     )
     * )
     *
     * @return JsonResponse
     */
    public function quickFacts(): JsonResponse
    {
        try {
            $facts = $this->service->getQuickFacts();
            return $this->successResponse($facts, 'Quick facts retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve quick facts: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get Contact Information
     *
     * @OA\Get(
     *     path="/university-profile/contact",
     *     tags={"University Profile"},
     *     summary="Get contact information",
     *     description="Returns complete contact information including main office, departments, working hours, and location",
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Contact information retrieved successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(
     *                     property="main_office",
     *                     type="object",
     *                     @OA\Property(property="name", type="string", example="Rektorat Universitas Lampung"),
     *                     @OA\Property(property="phone", type="string", example="(0721) 701609"),
     *                     @OA\Property(property="email", type="string", example="humas@unila.ac.id")
     *                 )
     *             )
     *         )
     *     )
     * )
     *
     * @return JsonResponse
     */
    public function contact(): JsonResponse
    {
        try {
            $contact = $this->service->getContactInfo();
            return $this->successResponse($contact, 'Contact information retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve contact information: ' . $e->getMessage(), 500);
        }
    }
}
