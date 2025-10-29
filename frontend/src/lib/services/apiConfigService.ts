const SISTER_SERVICE_URL = process.env.NEXT_PUBLIC_SISTER_API_URL || 'http://localhost:8083/public';

export interface APIConfig {
  id: number;
  api_code: string;
  api_name: string;
  api_description: string;
  base_url: string;
  auth_type: string;
  has_credentials: boolean;
  additional_headers: string;
  timeout_seconds: number;
  max_retries: number;
  retry_delay_ms: number;
  is_active: boolean;
  use_env_fallback: boolean;
  last_tested_at: string | null;
  last_test_status: string;
  last_test_message: string;
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
  tags: string;
  notes: string;
  credential_source: "database" | "environment" | "not_configured";
}

export interface CreateAPIConfigRequest {
  api_code: string;
  api_name: string;
  api_description?: string;
  base_url: string;
  auth_type: string;
  credentials?: Record<string, any>;
  additional_headers?: string;
  timeout_seconds?: number;
  max_retries?: number;
  retry_delay_ms?: number;
  is_active?: boolean;
  use_env_fallback?: boolean;
  tags?: string;
  notes?: string;
}

export interface UpdateAPIConfigRequest {
  api_name?: string;
  api_description?: string;
  base_url?: string;
  auth_type?: string;
  credentials?: Record<string, any>;
  additional_headers?: string;
  timeout_seconds?: number;
  max_retries?: number;
  retry_delay_ms?: number;
  is_active?: boolean;
  use_env_fallback?: boolean;
  tags?: string;
  notes?: string;
}

export interface TestConnectionRequest {
  api_code?: string;
  base_url: string;
  credentials?: Record<string, any>;
}

export interface TestConnectionResponse {
  success: boolean;
  status: string;
  message: string;
  response_time_ms: number;
}

export interface AuditLog {
  id: number;
  config_id: number;
  api_code: string;
  action_type: string;
  old_values: string;
  new_values: string;
  performed_by: string;
  ip_address: string;
  user_agent: string;
  performed_at: string;
  notes: string;
}

class APIConfigService {
  private baseURL = `${SISTER_SERVICE_URL}/api-configs`;

  async getAll(): Promise<APIConfig[]> {
    const response = await fetch(this.baseURL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch API configurations");
    }

    const data = await response.json();
    return data.data || [];
  }

  async getByCode(apiCode: string): Promise<APIConfig> {
    const response = await fetch(`${this.baseURL}/${apiCode}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch API configuration: ${apiCode}`);
    }

    const data = await response.json();
    return data.data;
  }

  async create(request: CreateAPIConfigRequest): Promise<APIConfig> {
    const response = await fetch(this.baseURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create API configuration");
    }

    const data = await response.json();
    return data.data;
  }

  async update(
    id: number,
    request: UpdateAPIConfigRequest
  ): Promise<APIConfig> {
    const response = await fetch(`${this.baseURL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update API configuration");
    }

    const data = await response.json();
    return data.data;
  }

  async delete(id: number): Promise<void> {
    const response = await fetch(`${this.baseURL}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete API configuration");
    }
  }

  async testConnection(
    request: TestConnectionRequest
  ): Promise<TestConnectionResponse> {
    const response = await fetch(`${this.baseURL}/test-connection`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Connection test failed");
    }

    const data = await response.json();
    return data.data;
  }

  async getAuditLogs(configId: number): Promise<AuditLog[]> {
    const response = await fetch(`${this.baseURL}/${configId}/audit-logs`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch audit logs");
    }

    const data = await response.json();
    return data.data || [];
  }
}

export const apiConfigService = new APIConfigService();