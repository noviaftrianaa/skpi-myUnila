/**
 * Referensi Service
 * Handles API calls for referensi metadata and batch sync operations
 */

// Direct connection to sister-service (bypass Kong for now)
const SISTER_API_BASE = "http://localhost:8083/api/v1";

export interface ReferensiMetadata {
  key: string;
  name: string;
  description: string;
  total_records: number;
  last_sync: string | null;
  synced_by: string;
  available: boolean;
}

export interface BatchSyncResult {
  endpoint: string;
  success: boolean;
  total_records: number;
  message: string;
  error?: string;
}

export interface BatchSyncResponse {
  total_requested: number;
  total_success: number;
  total_failed: number;
  results: BatchSyncResult[];
  duration: string;
}

export const referensiService = {
  /**
   * Get metadata for all referensi endpoints
   */
  async getMetadata(): Promise<ReferensiMetadata[]> {
    try {
      const response = await fetch(`${SISTER_API_BASE}/referensi/metadata`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error("Error fetching referensi metadata:", error);
      throw error;
    }
  },

  /**
   * Batch sync multiple endpoints in parallel
   */
  async batchSync(endpoints: string[]): Promise<BatchSyncResponse> {
    try {
      const response = await fetch(`${SISTER_API_BASE}/referensi/batch-sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          endpoints: endpoints,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error batch syncing referensi:", error);
      throw error;
    }
  },

  /**
   * Get data for a specific endpoint
   */
  async getEndpointData(key: string): Promise<any[]> {
    try {
      const endpointMap: { [key: string]: string } = {
        agama: "agama",
        negara: "negara",
        jenjang_pendidikan: "jenjang-pendidikan",
        gelar_akademik: "gelar-akademik",
        semester: "semester",
      };

      const endpoint = endpointMap[key];
      if (!endpoint) {
        throw new Error(`Unknown endpoint key: ${key}`);
      }

      const response = await fetch(`${SISTER_API_BASE}/referensi/${endpoint}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error(`Error fetching ${key} data:`, error);
      throw error;
    }
  },

  /**
   * Sync individual endpoint
   */
  async syncEndpoint(key: string): Promise<any> {
    try {
      const endpointMap: { [key: string]: string } = {
        agama: "agama",
        negara: "negara",
        jenjang_pendidikan: "jenjang-pendidikan",
        gelar_akademik: "gelar-akademik",
        semester: "semester",
      };

      const endpoint = endpointMap[key];
      if (!endpoint) {
        throw new Error(`Unknown endpoint key: ${key}`);
      }

      const response = await fetch(
        `${SISTER_API_BASE}/referensi/${endpoint}/sync`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error syncing ${key}:`, error);
      throw error;
    }
  },
};
