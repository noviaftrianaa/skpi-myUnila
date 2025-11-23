/**
 * Jenjang Pendidikan Service
 * Handles API calls for jenjang pendidikan (education level) reference data from SISTER API
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9800";
const SISTER_API_BASE = `${BASE_URL}/sister-service/api/v1`;

export interface JenjangPendidikanData {
  id_jenjang_pendidikan: number;
  nama_jenjang: string;
  expired_date?: string | null;
  last_sync?: string | null;
  synced_by?: string | null;
}

export interface JenjangPendidikanSyncResponse {
  success: boolean;
  message: string;
  data: {
    total_records: number;
    message: string;
  };
}

export const jenjangPendidikanService = {
  /**
   * Get all jenjang pendidikan from database
   */
  async getAll(): Promise<JenjangPendidikanData[]> {
    try {
      const response = await fetch(`${SISTER_API_BASE}/referensi/jenjang-pendidikan`, {
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
      console.error("Error fetching jenjang pendidikan:", error);
      throw error;
    }
  },

  /**
   * Sync jenjang pendidikan from SISTER API
   */
  async sync(username: string): Promise<JenjangPendidikanSyncResponse> {
    try {
      const response = await fetch(
        `${SISTER_API_BASE}/referensi/jenjang-pendidikan/sync`,
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
      console.error("Error syncing jenjang pendidikan:", error);
      throw error;
    }
  },
};
