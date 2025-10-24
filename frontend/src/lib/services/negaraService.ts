/**
 * Negara Service
 * Handles API calls for negara (country) reference data from SISTER API
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9800";
const SISTER_API_BASE = `${BASE_URL}/sister-service/api/v1`;

export interface NegaraData {
  id_negara: string; // 2-letter country code
  nama_negara: string;
  expired_date?: string | null;
  last_sync?: string | null;
  synced_by?: string | null;
}

export interface NegaraSyncResponse {
  success: boolean;
  message: string;
  data: {
    total_records: number;
    message: string;
  };
}

export const negaraService = {
  /**
   * Get all negara from database
   */
  async getAll(): Promise<NegaraData[]> {
    try {
      const response = await fetch(`${SISTER_API_BASE}/referensi/negara`, {
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
      console.error("Error fetching negara:", error);
      throw error;
    }
  },

  /**
   * Get negara by ID
   */
  async getById(id: string): Promise<NegaraData> {
    try {
      const response = await fetch(
        `${SISTER_API_BASE}/referensi/negara/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error(`Error fetching negara ${id}:`, error);
      throw error;
    }
  },

  /**
   * Sync negara from SISTER API
   */
  async sync(username: string): Promise<NegaraSyncResponse> {
    try {
      const response = await fetch(
        `${SISTER_API_BASE}/referensi/negara/sync`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            synced_by: username,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error syncing negara:", error);
      throw error;
    }
  },
};
