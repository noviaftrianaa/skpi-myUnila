<?php

namespace App\Services;

use App\Repositories\UniversityProfileRepository;

/**
 * University Profile Service
 *
 * Business logic for university profile operations.
 * Acts as middleware between Controller and Repository.
 */
class UniversityProfileService
{
    /**
     * @var UniversityProfileRepository
     */
    protected UniversityProfileRepository $repository;

    /**
     * Constructor
     *
     * @param UniversityProfileRepository $repository
     */
    public function __construct(UniversityProfileRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Get complete university profile
     *
     * Combines all university data into one response
     *
     * @return array
     */
    public function getCompleteProfile(): array
    {
        $profile = $this->repository->getProfile();
        $profile['faculties'] = $this->repository->getFaculties();
        $profile['statistics'] = $this->repository->getStatistics();
        $profile['social_media'] = $this->repository->getSocialMedia();
        $profile['colors'] = $this->repository->getColors();

        return $profile;
    }

    /**
     * Get quick facts for homepage
     *
     * Returns 6 quick fact cards for dashboard display
     *
     * @return array
     */
    public function getQuickFacts(): array
    {
        return $this->repository->getQuickFacts();
    }

    /**
     * Get contact information
     *
     * Returns complete contact information including departments,
     * working hours, location, and emergency contacts
     *
     * @return array
     */
    public function getContactInfo(): array
    {
        return $this->repository->getContactInfo();
    }

    /**
     * Get university statistics only
     *
     * @return array
     */
    public function getStatistics(): array
    {
        return $this->repository->getStatistics();
    }

    /**
     * Get faculties list
     *
     * @return array
     */
    public function getFaculties(): array
    {
        return $this->repository->getFaculties();
    }

    /**
     * Get social media links
     *
     * @return array
     */
    public function getSocialMedia(): array
    {
        return $this->repository->getSocialMedia();
    }

    /**
     * Get brand colors
     *
     * @return array
     */
    public function getBrandColors(): array
    {
        return $this->repository->getColors();
    }

    /**
     * Search university data
     *
     * Example of business logic - search across different data sources
     *
     * @param string $query
     * @return array
     */
    public function search(string $query): array
    {
        $results = [];
        $query = strtolower($query);

        // Search in profile
        $profile = $this->repository->getProfile();
        if (str_contains(strtolower($profile['name']), $query) ||
            str_contains(strtolower($profile['description']), $query)) {
            $results['profile'] = $profile;
        }

        // Search in faculties
        $faculties = $this->repository->getFaculties();
        $matchedFaculties = array_filter($faculties, function ($faculty) use ($query) {
            return str_contains(strtolower($faculty['name']), $query) ||
                   str_contains(strtolower($faculty['abbreviation']), $query);
        });

        if (!empty($matchedFaculties)) {
            $results['faculties'] = array_values($matchedFaculties);
        }

        return $results;
    }

    /**
     * Get university summary for homepage hero section
     *
     * Returns minimal data optimized for hero banner
     *
     * @return array
     */
    public function getHeroData(): array
    {
        $profile = $this->repository->getProfile();
        $stats = $this->repository->getStatistics();

        return [
            'name' => $profile['name'],
            'short_name' => $profile['short_name'],
            'tagline' => $profile['tagline'],
            'description' => $profile['description'],
            'logo' => $profile['logo'],
            'key_stats' => [
                'students' => $stats['total_students'],
                'lecturers' => $stats['total_lecturers'],
                'faculties' => $stats['total_faculties'],
                'accreditation' => $stats['accreditation']
            ]
        ];
    }
}
