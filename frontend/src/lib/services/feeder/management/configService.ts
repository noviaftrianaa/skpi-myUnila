import { feederClient } from '@/lib/api/feederClient';

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

class FeederConfigService {
  async getAll(): Promise<APIConfig[]> {
    const response = await feederClient.get<{ data: APIConfig[] }>('/api-configs');
    return response.data.data || [];
  }

  async getByCode(apiCode: string): Promise<APIConfig> {
    const response = await feederClient.get<{ data: APIConfig }>(`/api-configs/${apiCode}`);
    return response.data.data;
  }

  async create(request: CreateAPIConfigRequest): Promise<APIConfig> {
    const response = await feederClient.post<{ data: APIConfig }>('/api-configs', request);
    return response.data.data;
  }

  async update(id: number, request: UpdateAPIConfigRequest): Promise<APIConfig> {
    const response = await feederClient.put<{ data: APIConfig }>(`/api-configs/${id}`, request);
    return response.data.data;
  }

  async delete(id: number): Promise<void> {
    await feederClient.delete(`/api-configs/${id}`);
  }

  async testConnection(request: TestConnectionRequest): Promise<TestConnectionResponse> {
    const response = await feederClient.post<{ data: TestConnectionResponse }>(
      '/api-configs/test-connection',
      request
    );
    return response.data.data;
  }

  async getAuditLogs(configId: number): Promise<AuditLog[]> {
    const response = await feederClient.get<{ data: AuditLog[] }>(`/api-configs/${configId}/audit-logs`);
    return response.data.data || [];
  }
}

export const feederConfigService = new FeederConfigService();
