/**
 * Survey Service
 * Handles all survey-related API calls
 */

const API_URL = process.env.NEXT_PUBLIC_DASHBOARD_API_URL || 'http://localhost:9800/dashboard-service/api/v1';

export interface SurveyQuestion {
  id: number;
  question_code: string;
  question_text: string;
  description?: string;
  question_type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'matrix' | 'scale';
  options?: any;
  validation_rules?: any;
  section: string;
  order_number: number;
  is_required: boolean;
}

export interface Survey {
  id: number;
  uuid: string;
  title: string;
  description?: string;
  slug: string;
  is_active: boolean;
  is_published: boolean;
  allow_anonymous: boolean;
  settings?: any;
  questions: SurveyQuestion[];
}

export interface SurveyResponse {
  success: boolean;
  message: string;
  response_id?: number;
  errors?: Record<string, string[]>;
}

export interface SurveyStatistics {
  success: boolean;
  survey: {
    title: string;
    slug: string;
  };
  statistics: {
    survey_id: string;
    survey_title: string;
    total_responses: number;
    completed_responses: number;
    draft_responses: number;
    avg_completion_time: number;
    first_response_at: string;
    last_response_at: string;
  };
  by_status: Array<{
    status: string;
    total: number;
  }>;
}

export interface QuestionAnalytics {
  success: boolean;
  question: {
    code: string;
    text: string;
    type: string;
  };
  data: Array<{
    answer: string;
    total: number;
    percentage: number;
  }>;
}

/**
 * Get survey by slug with all questions
 */
export async function getSurvey(slug: string): Promise<Survey> {
  const response = await fetch(`${API_BASE_URL}/survey/${slug}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch survey: ${response.statusText}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch survey');
  }

  return result.data;
}

/**
 * Submit survey response
 */
export async function submitSurvey(
  slug: string,
  formData: Record<string, any>,
  metadata?: {
    completion_time?: number;
  }
): Promise<SurveyResponse> {
  try {
    const payload = {
      ...formData,
      _completion_time: metadata?.completion_time,
    };

    const response = await fetch(`${API_BASE_URL}/survey/${slug}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    return {
      success: result.success || false,
      message: result.message || 'Unknown error',
      response_id: result.response_id,
      errors: result.errors,
    };
  } catch (error) {
    console.error('Survey submission error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Get survey statistics
 */
export async function getSurveyStatistics(slug: string): Promise<SurveyStatistics> {
  const response = await fetch(`${API_BASE_URL}/survey/${slug}/statistics`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch statistics: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get question analytics (aggregated answers)
 */
export async function getQuestionAnalytics(
  slug: string,
  questionCode: string
): Promise<QuestionAnalytics> {
  const response = await fetch(
    `${API_BASE_URL}/survey/${slug}/analytics/${questionCode}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch analytics: ${response.statusText}`);
  }

  return response.json();
}
