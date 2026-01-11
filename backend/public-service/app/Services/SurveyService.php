<?php

namespace App\Services;

use App\Repositories\SurveyRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SurveyService
{
    protected $surveyRepository;

    public function __construct(SurveyRepository $surveyRepository)
    {
        $this->surveyRepository = $surveyRepository;
    }

    /**
     * Get survey dengan questions by slug
     *
     * @param string $slug
     * @return array|null
     */
    public function getSurveyBySlug(string $slug): ?array
    {
        return $this->surveyRepository->getSurveyBySlug($slug);
    }

    /**
     * Submit survey response
     *
     * @param string $slug
     * @param array $formData
     * @param array $metadata (ip, user_agent, etc)
     * @return array
     */
    public function submitSurveyResponse(string $slug, array $formData, array $metadata = []): array
    {
        DB::beginTransaction();

        try {
            // 1. Get survey
            $survey = $this->surveyRepository->getSurveyBySlug($slug);

            if (!$survey) {
                throw new \Exception('Survey not found or not active');
            }

            // 2. Check multiple submissions
            if (!$survey['allow_multiple_submissions'] && isset($metadata['user_id'])) {
                $hasSubmitted = $this->surveyRepository->hasUserSubmitted(
                    $survey['id'],
                    $metadata['user_id']
                );

                if ($hasSubmitted) {
                    throw new \Exception('You have already submitted this survey');
                }
            }

            // 3. Prepare response data
            $responseData = [
                'survey_id' => $survey['id'],
                'responder_status' => $formData['status'] ?? null,
                'responder_unit' => $formData['unit_fakultas'] ?? null,
                'responder_name' => $formData['nama'] ?? null,
                'responder_contact' => $formData['kontak'] ?? null,
                'response_data' => $formData, // Full form data sebagai JSON
                'submission_ip' => $metadata['ip'] ?? null,
                'user_agent' => $metadata['user_agent'] ?? null,
                'session_id' => $metadata['session_id'] ?? null,
                'completion_time_seconds' => $metadata['completion_time'] ?? null,
                'user_id' => $metadata['user_id'] ?? null,
                'user_type' => $metadata['user_type'] ?? null,
                'is_complete' => 1,
            ];

            // 4. Insert main response
            $responseId = $this->surveyRepository->submitResponse($responseData);

            // 5. Parse dan save individual answers
            $this->saveIndividualAnswers($responseId, $survey['questions'], $formData);

            DB::commit();

            return [
                'success' => true,
                'message' => 'Survey submitted successfully',
                'response_id' => $responseId,
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Survey submission error', [
                'slug' => $slug,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Save individual answers (untuk query analytics nanti)
     *
     * @param int $responseId
     * @param array $questions
     * @param array $formData
     * @return void
     */
    protected function saveIndividualAnswers(int $responseId, array $questions, array $formData): void
    {
        foreach ($questions as $question) {
            $questionCode = $question['question_code'];
            $questionType = $question['question_type'];
            $questionId = $question['id'];

            // Skip jika tidak ada jawaban
            if (!isset($formData[$this->getFormFieldName($questionCode)])) {
                continue;
            }

            $answer = $formData[$this->getFormFieldName($questionCode)];

            switch ($questionType) {
                case 'text':
                case 'textarea':
                    // Text answers
                    if (!empty($answer)) {
                        $this->surveyRepository->saveAnswer($responseId, $questionId, [
                            'answer_text' => $answer,
                            'answer_value' => strlen($answer) > 500 ? null : $answer,
                        ]);
                    }
                    break;

                case 'radio':
                case 'select':
                    // Single choice answers
                    if (!empty($answer)) {
                        $this->surveyRepository->saveAnswer($responseId, $questionId, [
                            'answer_value' => $answer,
                        ]);
                    }
                    break;

                case 'checkbox':
                    // Multiple choice answers
                    if (is_array($answer) && count($answer) > 0) {
                        foreach ($answer as $value) {
                            $this->surveyRepository->saveAnswer($responseId, $questionId, [
                                'answer_value' => $value,
                                'answer_values' => json_encode($answer, JSON_UNESCAPED_UNICODE),
                            ]);
                        }
                    }
                    break;

                case 'scale':
                    // Scale/Likert answers
                    if (!empty($answer)) {
                        // Convert ke numeric jika memungkinkan
                        $numeric = $this->convertScaleToNumeric($answer);

                        $this->surveyRepository->saveAnswer($responseId, $questionId, [
                            'answer_value' => $answer,
                            'answer_numeric' => $numeric,
                        ]);
                    }
                    break;

                case 'matrix':
                    // Matrix/Table answers (frequency table)
                    $options = json_decode($question['options'], true);
                    if (isset($options['rows'])) {
                        foreach ($options['rows'] as $row) {
                            $rowKey = $row['key'];
                            if (isset($formData[$rowKey])) {
                                $this->surveyRepository->saveAnswer($responseId, $questionId, [
                                    'matrix_row' => $rowKey,
                                    'matrix_column' => $formData[$rowKey],
                                    'answer_value' => $formData[$rowKey],
                                ]);
                            }
                        }
                    }
                    break;
            }
        }

        // Handle "lainnya" fields
        $otherFields = ['status_lainnya', 'kendala_lainnya', 'fitur_lainnya', 'akses_lainnya', 'harapan_lainnya'];
        foreach ($otherFields as $field) {
            if (!empty($formData[$field])) {
                // Find related question
                $mainField = str_replace('_lainnya', '', $field);
                $question = collect($questions)->firstWhere('question_code', strtoupper($mainField[0]) . substr($mainField, 1));

                if ($question) {
                    $this->surveyRepository->saveAnswer($responseId, $question['id'], [
                        'answer_text' => $formData[$field],
                        'answer_value' => 'Lainnya: ' . $formData[$field],
                    ]);
                }
            }
        }
    }

    /**
     * Get form field name from question code
     * A1 -> status, B5 -> freq_* (matrix), etc
     *
     * @param string $questionCode
     * @return string
     */
    protected function getFormFieldName(string $questionCode): string
    {
        // Mapping question code ke field name di frontend
        $mapping = [
            'A1' => 'status',
            'A2' => 'unit_fakultas',
            'A3' => 'lama_kampus',
            'B4' => 'menggunakan_sistem',
            'B4_detail' => 'sistem_digunakan',
            'B5' => 'freq_matrix', // Matrix field
            'B6' => 'kendala',
            'C7' => 'fitur_wajib',
            'C8' => 'modul_prioritas',
            'C9' => 'akses_pengguna',
            'D10' => 'harapan',
            'D11' => 'harapan_lainnya',
            'D12' => 'pentingnya_portal',
            'D13' => 'harapan_ui',
            'E14' => 'tantangan',
            'E15' => 'ide_penting',
            'E16' => 'ideal_tim',
            'F17' => 'nama',
            'F18' => 'kontak',
        ];

        return $mapping[$questionCode] ?? strtolower($questionCode);
    }

    /**
     * Convert scale answer to numeric value
     *
     * @param string $answer
     * @return int|null
     */
    protected function convertScaleToNumeric(string $answer): ?int
    {
        $scaleMapping = [
            'Tidak Penting' => 1,
            'Kurang Penting' => 2,
            'Cukup Penting' => 3,
            'Penting' => 4,
            'Sangat Penting' => 5,

            'Tidak pernah' => 1,
            'Tidak Pernah' => 1,
            'Jarang' => 2,
            'Kadang-kadang' => 3,
            'Kadang' => 3,
            'Sering' => 4,
            'Sangat sering' => 5,
            'Sangat Sering' => 5,
        ];

        return $scaleMapping[$answer] ?? null;
    }

    /**
     * Get survey statistics
     *
     * @param string $slug
     * @return array
     */
    public function getSurveyStatistics(string $slug): array
    {
        $survey = $this->surveyRepository->getSurveyBySlug($slug);

        if (!$survey) {
            return ['error' => 'Survey not found'];
        }

        $stats = $this->surveyRepository->getSurveyStatistics($survey['id']);
        $byStatus = $this->surveyRepository->getResponsesByStatus($survey['id']);

        return [
            'success' => true,
            'survey' => [
                'title' => $survey['title'],
                'slug' => $survey['slug'],
            ],
            'statistics' => $stats,
            'by_status' => $byStatus,
        ];
    }

    /**
     * Get question analytics (aggregated answers)
     *
     * @param string $slug
     * @param string $questionCode
     * @return array
     */
    public function getQuestionAnalytics(string $slug, string $questionCode): array
    {
        $survey = $this->surveyRepository->getSurveyBySlug($slug);

        if (!$survey) {
            return ['error' => 'Survey not found'];
        }

        $question = collect($survey['questions'])->firstWhere('question_code', $questionCode);

        if (!$question) {
            return ['error' => 'Question not found'];
        }

        // Check question type untuk determine aggregation method
        if ($question['question_type'] === 'matrix') {
            $data = $this->surveyRepository->getMatrixAnswerAggregation($survey['id'], $questionCode);
        } else {
            $data = $this->surveyRepository->getAnswerAggregationByQuestion($survey['id'], $questionCode);
        }

        return [
            'success' => true,
            'question' => [
                'code' => $question['question_code'],
                'text' => $question['question_text'],
                'type' => $question['question_type'],
            ],
            'data' => $data,
        ];
    }
}
