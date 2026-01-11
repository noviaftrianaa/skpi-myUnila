<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;

class SurveyRepository
{
    /**
     * Get survey by slug dengan questions
     *
     * @param string $slug
     * @return array|null
     */
    public function getSurveyBySlug(string $slug): ?array
    {
        $sql = "
            SELECT
                id,
                uuid,
                title,
                description,
                slug,
                is_active,
                is_published,
                allow_anonymous,
                allow_multiple_submissions,
                start_date,
                end_date,
                settings,
                created_at
            FROM survey.surveys
            WHERE slug = ?
                AND is_active = 1
                AND is_published = 1
                AND deleted_at IS NULL
                AND (start_date IS NULL OR start_date <= GETDATE())
                AND (end_date IS NULL OR end_date >= GETDATE())
        ";

        $survey = DB::connection('sqlsrv')->selectOne($sql, [$slug]);

        if (!$survey) {
            return null;
        }

        // Get questions untuk survey ini
        $questions = $this->getQuestionsBySurveyId($survey->id);

        return [
            'id' => $survey->id,
            'uuid' => $survey->uuid,
            'title' => $survey->title,
            'description' => $survey->description,
            'slug' => $survey->slug,
            'is_active' => (bool) $survey->is_active,
            'is_published' => (bool) $survey->is_published,
            'allow_anonymous' => (bool) $survey->allow_anonymous,
            'allow_multiple_submissions' => (bool) $survey->allow_multiple_submissions,
            'start_date' => $survey->start_date,
            'end_date' => $survey->end_date,
            'settings' => json_decode($survey->settings ?? '{}', true),
            'created_at' => $survey->created_at,
            'questions' => $questions,
        ];
    }

    /**
     * Get questions by survey ID
     *
     * @param int $surveyId
     * @return array
     */
    public function getQuestionsBySurveyId(int $surveyId): array
    {
        $sql = "
            SELECT
                id,
                uuid,
                question_code,
                question_text,
                description,
                question_type,
                options,
                validation_rules,
                section,
                order_number,
                is_required,
                conditional_logic
            FROM survey.questions
            WHERE survey_id = ?
                AND deleted_at IS NULL
            ORDER BY order_number ASC
        ";

        $questions = DB::connection('sqlsrv')->select($sql, [$surveyId]);

        return array_map(function($q) {
            return [
                'id' => $q->id,
                'uuid' => $q->uuid,
                'question_code' => $q->question_code,
                'question_text' => $q->question_text,
                'description' => $q->description,
                'question_type' => $q->question_type,
                'options' => json_decode($q->options ?? '[]', true),
                'validation_rules' => json_decode($q->validation_rules ?? '{}', true),
                'section' => $q->section,
                'order_number' => $q->order_number,
                'is_required' => (bool) $q->is_required,
                'conditional_logic' => json_decode($q->conditional_logic ?? '{}', true),
            ];
        }, $questions);
    }

    /**
     * Submit survey response
     *
     * @param array $data
     * @return int Response ID
     */
    public function submitResponse(array $data): int
    {
        $sql = "
            INSERT INTO survey.responses (
                survey_id,
                responder_status,
                responder_unit,
                responder_name,
                responder_contact,
                response_data,
                submitted_at,
                submission_ip,
                user_agent,
                session_id,
                completion_time_seconds,
                user_id,
                user_type,
                is_complete
            )
            OUTPUT INSERTED.id
            VALUES (?, ?, ?, ?, ?, ?, GETDATE(), ?, ?, ?, ?, ?, ?, ?)
        ";

        $result = DB::connection('sqlsrv')->selectOne($sql, [
            $data['survey_id'],
            $data['responder_status'] ?? null,
            $data['responder_unit'] ?? null,
            $data['responder_name'] ?? null,
            $data['responder_contact'] ?? null,
            json_encode($data['response_data'], JSON_UNESCAPED_UNICODE),
            $data['submission_ip'] ?? null,
            $data['user_agent'] ?? null,
            $data['session_id'] ?? null,
            $data['completion_time_seconds'] ?? null,
            $data['user_id'] ?? null,
            $data['user_type'] ?? null,
            $data['is_complete'] ?? 1,
        ]);

        return $result->id;
    }

    /**
     * Save individual answers (parsed dari response_data)
     *
     * @param int $responseId
     * @param int $questionId
     * @param array $answerData
     * @return void
     */
    public function saveAnswer(int $responseId, int $questionId, array $answerData): void
    {
        $sql = "
            INSERT INTO survey.answers (
                response_id,
                question_id,
                answer_text,
                answer_value,
                answer_values,
                answer_numeric,
                matrix_row,
                matrix_column
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ";

        DB::connection('sqlsrv')->insert($sql, [
            $responseId,
            $questionId,
            $answerData['answer_text'] ?? null,
            $answerData['answer_value'] ?? null,
            isset($answerData['answer_values']) ? json_encode($answerData['answer_values'], JSON_UNESCAPED_UNICODE) : null,
            $answerData['answer_numeric'] ?? null,
            $answerData['matrix_row'] ?? null,
            $answerData['matrix_column'] ?? null,
        ]);
    }

    /**
     * Get survey statistics
     *
     * @param int $surveyId
     * @return array
     */
    public function getSurveyStatistics(int $surveyId): array
    {
        $sql = "
            SELECT
                survey_id,
                survey_title,
                total_responses,
                completed_responses,
                draft_responses,
                avg_completion_time,
                first_response_at,
                last_response_at
            FROM survey.vw_survey_statistics
            WHERE survey_id = ?
        ";

        $stats = DB::connection('sqlsrv')->selectOne($sql, [$surveyId]);

        if (!$stats) {
            return [
                'total_responses' => 0,
                'completed_responses' => 0,
                'draft_responses' => 0,
                'avg_completion_time' => 0,
            ];
        }

        return [
            'survey_id' => $stats->survey_id,
            'survey_title' => $stats->survey_title,
            'total_responses' => (int) $stats->total_responses,
            'completed_responses' => (int) $stats->completed_responses,
            'draft_responses' => (int) $stats->draft_responses,
            'avg_completion_time' => round((float) $stats->avg_completion_time, 2),
            'first_response_at' => $stats->first_response_at,
            'last_response_at' => $stats->last_response_at,
        ];
    }

    /**
     * Get responses by status (untuk analytics)
     *
     * @param int $surveyId
     * @return array
     */
    public function getResponsesByStatus(int $surveyId): array
    {
        $sql = "
            SELECT
                responder_status,
                COUNT(*) as total
            FROM survey.responses
            WHERE survey_id = ?
                AND deleted_at IS NULL
                AND is_complete = 1
            GROUP BY responder_status
            ORDER BY total DESC
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$surveyId]);

        return array_map(function($item) {
            return [
                'status' => $item->responder_status,
                'total' => (int) $item->total,
            ];
        }, $result);
    }

    /**
     * Get answer aggregation by question (untuk analytics checkbox/radio)
     *
     * @param int $surveyId
     * @param string $questionCode
     * @return array
     */
    public function getAnswerAggregationByQuestion(int $surveyId, string $questionCode): array
    {
        $sql = "
            SELECT
                a.answer_value,
                COUNT(*) as total,
                CAST(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() AS DECIMAL(5,2)) as percentage
            FROM survey.answers a
            INNER JOIN survey.questions q ON q.id = a.question_id
            INNER JOIN survey.responses r ON r.id = a.response_id
            WHERE q.survey_id = ?
                AND q.question_code = ?
                AND a.answer_value IS NOT NULL
                AND r.deleted_at IS NULL
            GROUP BY a.answer_value
            ORDER BY total DESC
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$surveyId, $questionCode]);

        return array_map(function($item) {
            return [
                'answer' => $item->answer_value,
                'total' => (int) $item->total,
                'percentage' => (float) $item->percentage,
            ];
        }, $result);
    }

    /**
     * Get matrix answers aggregation (untuk pertanyaan tabel frekuensi)
     *
     * @param int $surveyId
     * @param string $questionCode
     * @return array
     */
    public function getMatrixAnswerAggregation(int $surveyId, string $questionCode): array
    {
        $sql = "
            SELECT
                a.matrix_row,
                a.matrix_column,
                COUNT(*) as total
            FROM survey.answers a
            INNER JOIN survey.questions q ON q.id = a.question_id
            INNER JOIN survey.responses r ON r.id = a.response_id
            WHERE q.survey_id = ?
                AND q.question_code = ?
                AND a.matrix_row IS NOT NULL
                AND a.matrix_column IS NOT NULL
                AND r.deleted_at IS NULL
            GROUP BY a.matrix_row, a.matrix_column
            ORDER BY a.matrix_row, a.matrix_column
        ";

        $result = DB::connection('sqlsrv')->select($sql, [$surveyId, $questionCode]);

        // Group by row
        $grouped = [];
        foreach ($result as $item) {
            $row = $item->matrix_row;
            if (!isset($grouped[$row])) {
                $grouped[$row] = [];
            }
            $grouped[$row][$item->matrix_column] = (int) $item->total;
        }

        return $grouped;
    }

    /**
     * Check if user already submitted (untuk prevent multiple submissions)
     *
     * @param int $surveyId
     * @param int $userId
     * @return bool
     */
    public function hasUserSubmitted(int $surveyId, int $userId): bool
    {
        $sql = "
            SELECT COUNT(*) as count
            FROM survey.responses
            WHERE survey_id = ?
                AND user_id = ?
                AND deleted_at IS NULL
        ";

        $result = DB::connection('sqlsrv')->selectOne($sql, [$surveyId, $userId]);

        return $result->count > 0;
    }
}
